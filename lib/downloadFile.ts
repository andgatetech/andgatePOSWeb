/**
 * Download a file from base64 encoded data
 * @param base64Data - The base64 encoded file data
 * @param filename - The name for the downloaded file
 * @param mimeType - The MIME type of the file (e.g., 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
 */
export const downloadBase64File = (base64Data: string, filename: string, mimeType: string) => {
    try {
        // Decode base64 to binary
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading file:', error);
        throw new Error('Failed to download file');
    }
};

/**
 * Download a file from a Blob object
 * @param blob - The Blob object
 * @param filename - The name for the downloaded file
 */
export const downloadBlob = (blob: Blob, filename: string) => {
    try {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading blob:', error);
        throw new Error('Failed to download file');
    }
};
