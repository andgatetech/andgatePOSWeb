'use client';
import { useProductBulkUploadMutation } from '@/store/features/Product/productApi';
import { AlertCircle, CheckCircle, Download, Upload } from 'lucide-react';
import React, { useState } from 'react';

import { toast } from 'react-toastify';

const ProductBulkUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [productBulkUpload, { isLoading }] = useProductBulkUploadMutation();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                toast.error('Please upload a valid CSV file');
                return;
            }
            setFile(selectedFile);
            setUploadProgress(0);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await productBulkUpload(formData).unwrap();
            toast.success(`Successfully uploaded ${response.success_count || 0} products`);
            setFile(null);
            setUploadProgress(100);

            // Reset file input
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error?.data?.message || 'Failed to upload products');
            setUploadProgress(0);
        }
    };

    const downloadTemplate = () => {
        const csvContent = `store_id,product_name,description,category_name,brand_name,price,purchase_price,sku,tax_rate,low_stock_quantity,available,tax_included
123,Premium Wireless Headphones,"High-quality noise-cancelling headphones with 30-hour battery life",Electronics,Sony,299.99,150.00,WH-PRO-001,15.00,10,yes,true
123,Organic Green Tea 100g,"Premium organic green tea leaves sourced from high-altitude gardens",Beverages,Lipton,12.99,6.50,TEA-GRN-002,5.00,20,yes,true`;

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'andgatepos_product_bulk_upload_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Template downloaded successfully');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Product Bulk Upload</h1>
                    <p className="text-gray-600">Upload multiple products at once using a CSV file</p>
                </div>

                {/* Instructions Card */}
                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
                    <div className="flex items-start">
                        <AlertCircle className="mr-3 mt-1 flex-shrink-0 text-xl text-blue-600" />
                        <div>
                            <h3 className="mb-2 text-lg font-semibold text-blue-900">Instructions</h3>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li>• Download the CSV template below to see the required format</li>
                                <li>• Products images will be uploaded separately in product edit page</li>
                                <li>• Fill in all required fields: product_name, price, purchase_price, and sku</li>
                                <li>• Store ID must be included for each product; And it is your registered Store ID</li>
                                <li>• Use category_name, brand_name (not IDs) - the system will match them automatically</li>
                                <li>• SKU must be unique for each product</li>
                                <li>• Available field accepts: "yes" or "no"</li>
                                <li>• Tax_included field accepts: "true" or "false"</li>
                                <li>• Ensure your CSV file is properly formatted with commas as separators</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Template Download Card */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="mb-1 text-lg font-semibold text-gray-900">Download CSV Template</h3>
                            <p className="text-sm text-gray-600">Get the template with sample data to understand the format</p>
                        </div>
                        <button
                            onClick={downloadTemplate}
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-green-700"
                        >
                            <Download className="text-xl" />
                            Download Template
                        </button>
                    </div>
                </div>

                {/* Upload Card */}
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Upload CSV File</h3>

                    {/* File Upload Area */}
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors duration-200 hover:border-blue-500">
                        <input type="file" id="file-upload" accept=".csv" onChange={handleFileChange} className="hidden" />
                        <label htmlFor="file-upload" className="flex cursor-pointer flex-col items-center">
                            <Upload className="mb-4 text-5xl text-gray-400" />
                            <span className="mb-2 text-lg font-medium text-gray-700">{file ? file.name : 'Click to upload or drag and drop'}</span>
                            <span className="text-sm text-gray-500">CSV files only</span>
                        </label>
                    </div>

                    {/* File Info */}
                    {file && (
                        <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="text-xl text-green-600" />
                                <div>
                                    <p className="font-medium text-gray-900">{file.name}</p>
                                    <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setFile(null);
                                    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                                    if (fileInput) fileInput.value = '';
                                }}
                                className="font-medium text-red-600 hover:text-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-4">
                            <div className="h-2 w-full rounded-full bg-gray-200">
                                <div className="h-2 rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <p className="mt-2 text-center text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={!file || isLoading}
                        className={`mt-6 w-full rounded-lg px-6 py-3 font-medium text-white transition-colors duration-200 ${
                            !file || isLoading ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Uploading...
                            </span>
                        ) : (
                            'Upload Products'
                        )}
                    </button>
                </div>

                {/* CSV Format Reference */}
                <div className="mt-6 rounded-lg bg-white p-6 shadow-md">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">CSV Column Reference</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Column Name</th>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Required</th>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Example</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-4 py-2 font-mono">product_name</td>
                                    <td className="px-4 py-2 text-red-600">Yes</td>
                                    <td className="px-4 py-2">Premium Wireless Headphones</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-mono">description</td>
                                    <td className="px-4 py-2 text-gray-600">No</td>
                                    <td className="px-4 py-2">High-quality noise-cancelling headphones</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-mono">store_id</td>
                                    <td className="px-4 py-2 text-gray-600">Yes</td>
                                    <td className="px-4 py-2">123</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-mono">category_name</td>
                                    <td className="px-4 py-2 text-gray-600">No</td>
                                    <td className="px-4 py-2">Electronics</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-mono">brand_name</td>
                                    <td className="px-4 py-2 text-gray-600">No</td>
                                    <td className="px-4 py-2">Sony</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-mono">price</td>
                                    <td className="px-4 py-2 text-red-600">Yes</td>
                                    <td className="px-4 py-2">299.99</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-mono">purchase_price</td>
                                    <td className="px-4 py-2 text-red-600">Yes</td>
                                    <td className="px-4 py-2">150.00</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-mono">sku</td>
                                    <td className="px-4 py-2 text-red-600">Yes</td>
                                    <td className="px-4 py-2">WH-PRO-001</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-mono">tax_rate</td>
                                    <td className="px-4 py-2 text-gray-600">No</td>
                                    <td className="px-4 py-2">15.00</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-mono">low_stock_quantity</td>
                                    <td className="px-4 py-2 text-gray-600">No</td>
                                    <td className="px-4 py-2">10</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-mono">available</td>
                                    <td className="px-4 py-2 text-gray-600">No</td>
                                    <td className="px-4 py-2">yes / no</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-mono">tax_included</td>
                                    <td className="px-4 py-2 text-gray-600">No</td>
                                    <td className="px-4 py-2">true / false</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductBulkUpload;
