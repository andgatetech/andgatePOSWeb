'use client';

import IconDownload from '@/components/icon/icon-download';
import IconX from '@/components/icon/icon-x';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { RootState } from '@/store';
import { useProductBulkUploadMutation } from '@/store/features/Product/productApi';
import { AlertCircle, CheckCircle2, FileSpreadsheet, Upload, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';

interface UploadFailure {
    row: number;
    error: string;
}

interface UploadResult {
    success_count: number;
    failed_count: number;
    failures: UploadFailure[];
}

const BulkUploadPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);

    const [productBulkUpload, { isLoading: uploading }] = useProductBulkUploadMutation();
    const token = useSelector((state: RootState) => state.auth.token);

    const handleDownloadTemplate = async () => {
        setDownloadingTemplate(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/bulk-upload/template`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to download template');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'product_upload_template.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showSuccessDialog('Success', 'Template downloaded successfully');
        } catch (error: any) {
            console.error('Download error:', error);
            showErrorDialog('Error', error?.message || 'Failed to download template');
        } finally {
            setDownloadingTemplate(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
            if (!validTypes.includes(file.type)) {
                showErrorDialog('Invalid File', 'Please upload an Excel (.xlsx, .xls) or CSV file');
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showErrorDialog('File Too Large', 'File size should not exceed 10MB');
                return;
            }

            setSelectedFile(file);
            setUploadResult(null);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
            if (!validTypes.includes(file.type)) {
                showErrorDialog('Invalid File', 'Please upload an Excel (.xlsx, .xls) or CSV file');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                showErrorDialog('File Too Large', 'File size should not exceed 10MB');
                return;
            }

            setSelectedFile(file);
            setUploadResult(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            showErrorDialog('No File', 'Please select a file to upload');
            return;
        }

        if (!currentStoreId) {
            showErrorDialog('No Store', 'Please select a store first');
            return;
        }

        setUploadResult(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('store_id', currentStoreId.toString());

            const result = await productBulkUpload(formData).unwrap();

            if (result.success && result.data) {
                setUploadResult(result.data);

                if (result.data.failed_count === 0) {
                    showSuccessDialog('Success', `All ${result.data.success_count} products uploaded successfully!`);
                } else {
                    showSuccessDialog('Upload Complete', `${result.data.success_count} products uploaded successfully. ${result.data.failed_count} failed - see details below.`);
                }
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error: any) {
            showErrorDialog('Upload Failed', error?.data?.message || error?.message || 'Failed to upload file');
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setUploadResult(null);
    };

    const handleReset = () => {
        setSelectedFile(null);
        setUploadResult(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bulk Product Upload</h1>
                    <p className="mt-1 text-sm text-gray-600">Upload multiple products at once using Excel or CSV files</p>
                </div>
            </div>

            {/* Instructions Card */}
            <div className="panel">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">How to Upload Products</h3>
                        <p className="text-sm text-gray-600">Follow these steps for a successful bulk upload</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">1</div>
                        <h4 className="mb-1 font-semibold text-gray-900">Download Template</h4>
                        <p className="text-sm text-gray-600">Download the Excel template with the correct format and required columns.</p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">2</div>
                        <h4 className="mb-1 font-semibold text-gray-900">Fill Product Data</h4>
                        <p className="text-sm text-gray-600">Add your product information following the template structure and guidelines.</p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">3</div>
                        <h4 className="mb-1 font-semibold text-gray-900">Upload File</h4>
                        <p className="text-sm text-gray-600">Upload your completed file and review the results for any errors.</p>
                    </div>
                </div>

                <div className="mt-6">
                    <button type="button" onClick={handleDownloadTemplate} disabled={downloadingTemplate} className="btn btn-primary gap-2">
                        <IconDownload className="h-5 w-5" />
                        {downloadingTemplate ? 'Downloading...' : 'Download Template'}
                    </button>
                </div>
            </div>

            {/* Upload Area */}
            <div className="panel">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Upload File</h3>

                {!selectedFile ? (
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                        }`}
                    >
                        <input type="file" id="file-upload" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />

                        <div className="flex flex-col items-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                <Upload className="h-8 w-8 text-blue-600" />
                            </div>

                            <h4 className="mb-2 text-lg font-semibold text-gray-900">Drag and drop your file here</h4>
                            <p className="mb-4 text-sm text-gray-600">or click to browse from your computer</p>

                            <label htmlFor="file-upload" className="btn btn-primary cursor-pointer gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                Select File
                            </label>

                            <p className="mt-4 text-xs text-gray-500">Supported formats: .xlsx, .xls, .csv (Max 10MB)</p>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                    <FileSpreadsheet className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{selectedFile.name}</h4>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {(selectedFile.size / 1024).toFixed(2)} KB • {selectedFile.type || 'Unknown type'}
                                    </p>
                                    {!uploadResult && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <button type="button" onClick={handleUpload} disabled={uploading} className="btn btn-primary btn-sm gap-2">
                                                <button type="button" onClick={handleUpload} disabled={uploading} className="btn btn-primary btn-sm gap-2">
                                                    <Upload className="h-4 w-4" />
                                                    {uploading ? 'Uploading...' : 'Upload Now'}
                                                </button>
                                                <IconX className="h-4 w-4" />
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {!uploading && !uploadResult && (
                                <button type="button" onClick={handleRemoveFile} className="text-gray-400 hover:text-gray-600">
                                    <IconX className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {uploading && (
                            <div className="mt-4">
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Uploading...</span>
                                    <span className="font-medium text-blue-600">Processing</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                    <div className="h-full animate-pulse bg-blue-600" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Results */}
            {uploadResult && (
                <div className="panel">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Upload Results</h3>
                            <p className="mt-1 text-sm text-gray-600">Summary of the upload operation</p>
                        </div>
                        <button type="button" onClick={handleReset} className="btn btn-outline-primary btn-sm">
                            Upload Another File
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Total Processed</p>
                                    <p className="mt-2 text-3xl font-bold text-blue-900">{uploadResult.success_count + uploadResult.failed_count}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                                    <FileSpreadsheet className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-green-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Successful</p>
                                    <p className="mt-2 text-3xl font-bold text-green-900">{uploadResult.success_count}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
                                    <CheckCircle2 className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-red-50 to-red-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-700">Failed</p>
                                    <p className="mt-2 text-3xl font-bold text-red-900">{uploadResult.failed_count}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600">
                                    <XCircle className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Failure Details */}
                    {uploadResult.failures.length > 0 && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <h4 className="font-semibold text-red-900">Error Details</h4>
                            </div>

                            <div className="space-y-2">
                                {uploadResult.failures.map((failure, index) => (
                                    <div key={index} className="flex items-start gap-3 rounded-lg bg-white p-4">
                                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">{failure.row}</div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Row {failure.row}</p>
                                            <p className="mt-1 text-sm text-red-700">{failure.error}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 rounded-lg bg-red-100 p-4">
                                <p className="text-sm text-red-800">
                                    <strong>Note:</strong> Please fix the errors in the highlighted rows and upload the file again. Only the failed rows need to be corrected.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {uploadResult.failed_count === 0 && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                <div>
                                    <h4 className="font-semibold text-green-900">All Products Uploaded Successfully!</h4>
                                    <p className="mt-1 text-sm text-green-700">
                                        {uploadResult.success_count} {uploadResult.success_count === 1 ? 'product has' : 'products have'} been added to your inventory.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Guidelines */}
            <div className="panel">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Upload Guidelines</h3>

                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                        <div>
                            <p className="font-medium text-gray-900">Use the provided template</p>
                            <p className="text-sm text-gray-600">Download and use our Excel template to ensure all required fields are included</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                        <div>
                            <p className="font-medium text-gray-900">Fill all required fields</p>
                            <p className="text-sm text-gray-600">Product name, SKU, price, and quantity are mandatory for each product</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                        <div>
                            <p className="font-medium text-gray-900">Match serial numbers with quantity</p>
                            <p className="text-sm text-gray-600">If using serial numbers, ensure the count matches the product quantity</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                        <div>
                            <p className="font-medium text-gray-900">Verify store access</p>
                            <p className="text-sm text-gray-600">Ensure you have permission to add products to the selected store</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                        <div>
                            <p className="font-medium text-gray-900">Check data format</p>
                            <p className="text-sm text-gray-600">Use proper number formats for prices and quantities (no currency symbols or text)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkUploadPage;
