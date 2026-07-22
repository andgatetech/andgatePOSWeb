/**
 * Client-side image downscale/re-encode before upload. Unedited phone-camera
 * photos routinely exceed both the pixel dimensions and file size this app
 * ever actually displays (product photos, brand/category/store logos, HR
 * documents), and the backend used to hard-reject them outright — this is
 * the primary fix, run before the file ever leaves the browser: smaller
 * uploads, fewer failed submissions, faster over the slow/metered mobile
 * connections this app's users are often on.
 *
 * GIF and WebP are intentionally passed through unresized — GIF to avoid
 * flattening animation via canvas, WebP because canvas re-encode support is
 * inconsistent across browsers (mirrors the backend's own GD limitations).
 */

const RESIZABLE_TYPES = new Set(['image/jpeg', 'image/png']);

export interface CompressImageOptions {
    maxDimension?: number; // longest edge, px
    quality?: number; // 0..1, JPEG only
}

const DEFAULTS: Required<CompressImageOptions> = {
    maxDimension: 1600,
    quality: 0.82,
};

/**
 * Returns a new File if the input was downscaled, or the original File
 * unchanged if it didn't need it (already within bounds, or an unsupported
 * type for client-side resize). Never throws — on any decode/canvas failure
 * it resolves with the original file so upload can still proceed and let the
 * backend's own resize step (or validation) be the final word.
 */
export async function compressImage(file: File, options: CompressImageOptions = {}): Promise<File> {
    if (!RESIZABLE_TYPES.has(file.type)) {
        return file;
    }

    const { maxDimension, quality } = { ...DEFAULTS, ...options };

    try {
        const image = await loadImage(file);
        const { width, height } = getDimensions(image);

        if (width <= maxDimension && height <= maxDimension) {
            releaseImage(image);
            return file;
        }

        const scale = Math.min(maxDimension / width, maxDimension / height, 1);
        const targetWidth = Math.max(1, Math.round(width * scale));
        const targetHeight = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            releaseImage(image);
            return file;
        }

        ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
        releaseImage(image);

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, file.type, file.type === 'image/jpeg' ? quality : undefined);
        });

        if (!blob) {
            return file;
        }

        return new File([blob], file.name, { type: file.type, lastModified: Date.now() });
    } catch {
        return file;
    }
}

/** Compress every image File in a FileList/array; non-image files pass through untouched. */
export async function compressImages(files: File[], options?: CompressImageOptions): Promise<File[]> {
    return Promise.all(files.map((file) => compressImage(file, options)));
}

/** For libraries (e.g. react-images-uploading) that keep a base64 preview alongside the File — regenerate it after compression so the preview matches what actually gets uploaded. */
export function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

type LoadedImage = ImageBitmap | HTMLImageElement;

async function loadImage(file: File): Promise<LoadedImage> {
    if (typeof createImageBitmap === 'function') {
        return createImageBitmap(file);
    }

    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Image failed to load'));
        };
        img.src = url;
    });
}

function releaseImage(image: LoadedImage): void {
    if ('close' in image) {
        image.close();
    }
}

function getDimensions(image: LoadedImage): { width: number; height: number } {
    if ('naturalWidth' in image) {
        return { width: image.naturalWidth, height: image.naturalHeight };
    }
    return { width: image.width, height: image.height };
}
