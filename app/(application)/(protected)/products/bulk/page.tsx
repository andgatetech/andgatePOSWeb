'use client';

import IconDownload from '@/components/icon/icon-download';
import IconX from '@/components/icon/icon-x';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useDownloadBulkUploadTemplateMutation, useProductBulkUploadMutation } from '@/store/features/Product/productApi';
import { AlertCircle, CheckCircle2, FileSpreadsheet, PackageCheck, RefreshCw, Upload, XCircle } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';

interface UploadFailure {
    row: number;
    sku?: string;
    error: string;
}

interface UploadResult {
    success_count: number;
    failed_count: number;
    failures: UploadFailure[];
}

const acceptedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];

const requiredColumns = ['store_name', 'product_name', 'sku', 'category_name', 'brand_name', 'unit', 'selling_price', 'purchase_price', 'quantity'];
const stockColumns = ['barcode', 'wholesale_price', 'low_stock_quantity', 'tax_rate', 'tax_included', 'available', 'batch_no', 'purchase_date', 'expiry_date'];
const advancedColumns = ['variant_attribute/value', 'serial_numbers', 'warranty_type', 'warranty_duration_days', 'ecommerce_visible'];

const BulkUploadPage = () => {
    const { t } = getTranslation();
    const { currentStoreId, currentStore } = useCurrentStore();
    const { formatNumber } = useCurrency();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const [productBulkUpload, { isLoading: uploading }] = useProductBulkUploadMutation();
    const [downloadTemplate, { isLoading: downloadingTemplate }] = useDownloadBulkUploadTemplateMutation();

    const totalProcessed = useMemo(() => {
        if (!uploadResult) return 0;
        return uploadResult.success_count + uploadResult.failed_count;
    }, [uploadResult]);

    const validateAndSetFile = (file?: File) => {
        if (!file) return;

        const fileName = file.name.toLowerCase();
        const isExcel = acceptedTypes.includes(file.type) || fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

        if (!isExcel) {
            showErrorDialog(t('msg_error'), t('bulk_upload_excel_only'));
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showErrorDialog(t('msg_error'), t('bulk_upload_file_size_limit'));
            return;
        }

        setSelectedFile(file);
        setUploadResult(null);
    };

    const handleDownloadTemplate = async () => {
        try {
            await downloadTemplate().unwrap();
            showSuccessDialog(t('msg_success'), t('bulk_upload_template_downloaded'));
        } catch (error: any) {
            showErrorDialog(t('msg_error'), error?.data?.message || error?.message || t('msg_error_occurred'));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            showErrorDialog(t('msg_error'), t('bulk_upload_select_template_first'));
            return;
        }

        if (!currentStoreId) {
            showErrorDialog(t('msg_error'), t('lbl_select_store'));
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
                showSuccessDialog(t('msg_success'), result.data.failed_count ? t('bulk_upload_finished_with_errors') : t('bulk_upload_success_message'));
                return;
            }

            throw new Error(result.message || t('msg_error_occurred'));
        } catch (error: any) {
            const data = error?.data?.data;
            if (data?.failures) {
                setUploadResult(data);
            }
            showErrorDialog(t('msg_error'), error?.data?.message || error?.message || t('msg_error_occurred'));
        }
    };

    const handleDrag = (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(event.type === 'dragenter' || event.type === 'dragover');
    };

    const resetUpload = () => {
        setSelectedFile(null);
        setUploadResult(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                        <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('product_bulk_import')}</h1>
                        <p className="text-sm text-gray-500">{t('bulk_upload_page_desc')}</p>
                    </div>
                </div>

                <button type="button" onClick={handleDownloadTemplate} disabled={downloadingTemplate} className="btn btn-primary gap-2">
                    {downloadingTemplate ? <RefreshCw className="h-4 w-4 animate-spin" /> : <IconDownload className="h-5 w-5" />}
                    {downloadingTemplate ? t('btn_loading') : t('bulk_upload_download_latest_template')}
                </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <PackageCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">{t('bulk_upload_stock_format_title')}</h2>
                            <p className="text-sm text-gray-600">{t('bulk_upload_stock_format_desc')}</p>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <p className="mb-2 text-sm font-semibold text-green-800">{t('bulk_upload_required')}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {requiredColumns.map((column) => (
                                    <span key={column} className="rounded bg-white px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-100">
                                        {column}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <p className="mb-2 text-sm font-semibold text-blue-800">{t('bulk_upload_stock_details')}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {stockColumns.map((column) => (
                                    <span key={column} className="rounded bg-white px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                                        {column}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                            <p className="mb-2 text-sm font-semibold text-purple-800">{t('bulk_upload_advanced')}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {advancedColumns.map((column) => (
                                    <span key={column} className="rounded bg-white px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-100">
                                        {column}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <div className="flex gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <p>{t('bulk_upload_fresh_template_note')}</p>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-base font-semibold text-gray-900">{t('bulk_upload_import_rules')}</h2>
                    <div className="space-y-3 text-sm text-gray-600">
                        <Rule text={t('bulk_upload_rule_sku')} />
                        <Rule text={t('bulk_upload_rule_variants')} />
                        <Rule text={t('bulk_upload_rule_serials')} />
                        <Rule text={t('bulk_upload_rule_auto_create')} />
                        <Rule text={t('bulk_upload_rule_yes_no')} />
                    </div>
                </section>
            </div>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">{t('bulk_upload_upload_excel_title')}</h2>
                        <p className="text-sm text-gray-500">
                            {t('bulk_upload_selected_store')}: {currentStore?.store_name || t('lbl_select_store')}
                        </p>
                    </div>
                    {selectedFile && (
                        <button type="button" onClick={resetUpload} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                            <IconX className="h-4 w-4" />
                            {t('btn_clear')}
                        </button>
                    )}
                </div>

                {!selectedFile ? (
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setDragActive(false);
                            validateAndSetFile(event.dataTransfer.files?.[0]);
                        }}
                        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`}
                    >
                        <input type="file" id="product-bulk-file" className="hidden" accept=".xlsx,.xls" onChange={(event) => validateAndSetFile(event.target.files?.[0])} />
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <Upload className="h-7 w-7" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">{t('bulk_upload_drop_excel_here')}</h3>
                        <p className="mt-1 text-sm text-gray-500">{t('bulk_upload_excel_file_hint')}</p>
                        <label htmlFor="product-bulk-file" className="btn btn-primary mt-5 inline-flex cursor-pointer gap-2">
                            <FileSpreadsheet className="h-5 w-5" />
                            {t('bulk_upload_select_excel_file')}
                        </label>
                    </div>
                ) : (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                    <FileSpreadsheet className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate font-semibold text-gray-900">{selectedFile.name}</p>
                                    <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button type="button" onClick={handleUpload} disabled={uploading} className="btn btn-primary gap-2">
                                {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                {uploading ? t('bulk_upload_importing') : t('bulk_upload_import_products')}
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {uploadResult && (
                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">{t('bulk_upload_import_result')}</h2>
                            <p className="text-sm text-gray-500">{t('bulk_upload_import_result_desc')}</p>
                        </div>
                        <button type="button" onClick={resetUpload} className="btn btn-outline-primary btn-sm">
                            {t('bulk_upload_upload_another_file')}
                        </button>
                    </div>

                    <div className="mb-5 grid gap-3 sm:grid-cols-3">
                        <ResultCard label={t('bulk_upload_processed')} value={formatNumber(totalProcessed)} tone="blue" icon={<FileSpreadsheet className="h-5 w-5" />} />
                        <ResultCard label={t('bulk_upload_successful')} value={formatNumber(uploadResult.success_count)} tone="green" icon={<CheckCircle2 className="h-5 w-5" />} />
                        <ResultCard label={t('bulk_upload_failed')} value={formatNumber(uploadResult.failed_count)} tone="red" icon={<XCircle className="h-5 w-5" />} />
                    </div>

                    {uploadResult.failures?.length > 0 ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                            <div className="mb-3 flex items-center gap-2 font-semibold text-red-900">
                                <AlertCircle className="h-5 w-5" />
                                {t('bulk_upload_failed_rows')}
                            </div>
                            <div className="max-h-80 space-y-2 overflow-auto pr-1">
                                {uploadResult.failures.map((failure, index) => (
                                    <div key={`${failure.row}-${index}`} className="rounded-lg bg-white p-3 text-sm shadow-sm">
                                        <div className="flex flex-wrap items-center gap-2 font-semibold text-gray-900">
                                            <span>
                                                {t('lbl_row')} {formatNumber(failure.row)}
                                            </span>
                                            {failure.sku && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{failure.sku}</span>}
                                        </div>
                                        <p className="mt-1 text-red-700">{failure.error}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                            <div className="flex items-center gap-3 text-green-900">
                                <CheckCircle2 className="h-5 w-5" />
                                <p className="font-semibold">{t('bulk_upload_all_rows_success')}</p>
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

const Rule = ({ text }: { text: string }) => (
    <div className="flex gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
        <p>{text}</p>
    </div>
);

const ResultCard = ({ label, value, tone, icon }: { label: string; value: string; tone: 'blue' | 'green' | 'red'; icon: ReactNode }) => {
    const styles = {
        blue: 'border-blue-200 bg-blue-50 text-blue-700',
        green: 'border-green-200 bg-green-50 text-green-700',
        red: 'border-red-200 bg-red-50 text-red-700',
    };

    return (
        <div className={`rounded-xl border p-4 ${styles[tone]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="mt-1 text-2xl font-bold">{value}</p>
                </div>
                <div className="rounded-lg bg-white/80 p-2">{icon}</div>
            </div>
        </div>
    );
};

export default BulkUploadPage;
