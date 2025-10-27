'use client';

import React from 'react';
import ImageUploading, { ImageListType } from 'react-images-uploading';

interface ImagesTabProps {
    images: any[];
    setImages: React.Dispatch<React.SetStateAction<any[]>>;
    maxNumber: number;
    onPrevious: () => void;
    onNext: () => void;
    onCreateProduct: () => void;
    isCreating: boolean;
}

const ImagesTab: React.FC<ImagesTabProps> = ({ images, setImages, maxNumber, onPrevious, onNext, onCreateProduct, isCreating }) => {
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>

            <ImageUploading multiple value={images} onChange={onChange} maxNumber={maxNumber}>
                {({ imageList, onImageUpload, onImageRemove, onImageUpdate }) => (
                    <div className="space-y-4">
                        <div className="flex w-full items-center justify-center">
                            <button
                                type="button"
                                onClick={onImageUpload}
                                className="group flex h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50"
                            >
                                <div className="flex flex-col items-center justify-center">
                                    <svg className="mb-3 h-12 w-12 text-gray-400 transition-colors group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="mb-1 text-base font-semibold text-gray-700 group-hover:text-blue-600">Click to upload or drag and drop</p>
                                    <p className="text-sm text-gray-500">PNG, JPG up to 2MB (Max {maxNumber} images)</p>
                                </div>
                            </button>
                        </div>

                        {imageList.length > 0 && (
                            <div>
                                <p className="mb-3 text-sm font-medium text-gray-700">
                                    Uploaded Images ({imageList.length}/{maxNumber})
                                </p>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                    {imageList.map((image, index) => (
                                        <div key={index} className="group relative">
                                            <div className="aspect-square overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100 shadow-sm">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={image.dataURL} alt={`Product ${index + 1}`} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110" />
                                            </div>

                                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => onImageUpdate(index)}
                                                        className="rounded-lg bg-blue-600 p-2.5 text-white shadow-lg transition-all duration-150 hover:scale-110 hover:bg-blue-700"
                                                        title="Update image"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onImageRemove(index)}
                                                        className="rounded-lg bg-red-600 p-2.5 text-white shadow-lg transition-all duration-150 hover:scale-110 hover:bg-red-700"
                                                        title="Remove image"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="absolute left-2 top-2 rounded-full bg-black bg-opacity-70 px-2.5 py-1 text-xs font-semibold text-white shadow">#{index + 1}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ImageUploading>

            {/* Image Guidelines */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-amber-800">
                        <p className="mb-1 font-medium">Image Upload Guidelines:</p>
                        <ul className="space-y-1 text-amber-700">
                            <li>• Use high-quality images with good lighting</li>
                            <li>• Recommended size: 800x800 pixels or higher</li>
                            <li>• Only JPG and PNG formats are supported</li>
                            <li>• Maximum file size: 2MB per image</li>
                            <li>• First image will be used as the main product image</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
                <button
                    type="button"
                    onClick={onPrevious}
                    className="flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                </button>
                <button type="button" onClick={onNext} className="flex items-center gap-2 rounded-lg bg-gray-600 px-6 py-3 font-medium text-white transition-all duration-200 hover:bg-gray-700">
                    <span>Next</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={onCreateProduct}
                    disabled={isCreating}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-medium text-white transition-all duration-200 hover:from-green-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isCreating ? (
                        <>
                            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            <span>Creating...</span>
                        </>
                    ) : (
                        <>
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Create Product</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ImagesTab;
