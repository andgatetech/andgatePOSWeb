'use client';

import { getTranslation } from '@/i18n';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useGetCompanyQuery, useUpdateCompanyMutation } from '@/store/features/company/companyApi';
import { ArrowLeft, Building2, FileText } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const BUSINESS_TYPES = [
    { value: 'sole_proprietorship', labelKey: 'biz_type_sole' },
    { value: 'partnership',         labelKey: 'biz_type_partnership' },
    { value: 'private_limited',     labelKey: 'biz_type_private_limited' },
    { value: 'public_limited',      labelKey: 'biz_type_public_limited' },
    { value: 'ngo',                 labelKey: 'biz_type_ngo' },
    { value: 'cooperative',         labelKey: 'biz_type_cooperative' },
];

function resolveLogoUrl(logoPath?: string | null): string | null {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    return `${API_BASE}${logoPath.startsWith('/') ? '' : '/storage/'}${logoPath}`;
}

export default function CompanyEditPage() {
    const { t } = getTranslation();
    const router = useRouter();
    const params = useParams();
    const companyId = Number(params.id);

    const { data, isLoading } = useGetCompanyQuery(companyId, { skip: !companyId });
    const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();

    // Basic info
    const [formName, setFormName]       = useState('');
    const [formEmail, setFormEmail]     = useState('');
    const [formPhone, setFormPhone]     = useState('');
    const [formAddress, setFormAddress] = useState('');
    const [formCountry, setFormCountry] = useState('');
    const [formIsActive, setFormIsActive] = useState(true);
    const [formLogo, setFormLogo]       = useState<File | null>(null);

    // BD compliance
    const [formBizType, setFormBizType]               = useState('');
    const [formTradeLicenseNo, setFormTradeLicenseNo] = useState('');
    const [formTradeLicenseExpiry, setFormTradeLicenseExpiry] = useState('');
    const [formTin, setFormTin]         = useState('');
    const [formBin, setFormBin]         = useState('');
    const [formRjsc, setFormRjsc]       = useState('');

    useEffect(() => {
        const d = data as any;
        const company = d?.data ?? d ?? null;
        if (!company) return;
        setFormName(company.name || '');
        setFormEmail(company.billing_email || '');
        setFormPhone(company.billing_phone || '');
        setFormAddress(company.billing_address || '');
        setFormCountry(company.country_code || '');
        setFormIsActive(company.is_active ?? true);
        setFormBizType(company.business_type || '');
        setFormTradeLicenseNo(company.trade_license_no || '');
        setFormTradeLicenseExpiry(company.trade_license_expiry || '');
        setFormTin(company.tin_no || '');
        setFormBin(company.bin_no || '');
        setFormRjsc(company.rjsc_no || '');
    }, [data]);

    const existingLogoUrl = (() => {
        const d = data as any;
        const company = d?.data ?? d ?? null;
        return resolveLogoUrl(company?.logo_path);
    })();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) {
            showErrorDialog(t('company_name_required_title'), t('company_name_required_desc'));
            return;
        }

        const formData = new FormData();
        formData.append('name', formName.trim());
        if (formEmail)   formData.append('billing_email', formEmail);
        if (formPhone)   formData.append('billing_phone', formPhone);
        if (formAddress) formData.append('billing_address', formAddress);
        if (formCountry) formData.append('country_code', formCountry);
        if (formLogo)    formData.append('logo', formLogo);
        formData.append('is_active', formIsActive ? '1' : '0');

        // BD compliance (always send; empty string clears the field)
        formData.append('business_type',        formBizType);
        formData.append('trade_license_no',     formTradeLicenseNo);
        formData.append('trade_license_expiry', formTradeLicenseExpiry);
        formData.append('tin_no',               formTin);
        formData.append('bin_no',               formBin);
        formData.append('rjsc_no',              formRjsc);

        try {
            await updateCompany({ id: companyId, data: formData }).unwrap();
            showSuccessDialog(t('company_updated_title'), t('company_updated_desc'));
            router.push('/company');
        } catch {
            showErrorDialog(t('company_save_failed_title'), t('company_save_failed_desc'));
        }
    };

    const inputCls = 'w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#046ca9]';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-gray-600">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#046ca9] border-t-transparent" />
                    {t('company_loading')}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.push('/company')}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('company_edit')}</h1>
                        <p className="text-sm text-gray-500">{formName}</p>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-8">

                        {/* ── Basic Information ── */}
                        <div>
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('company_info_section')}</h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        {t('lbl_company_name')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        placeholder={t('company_name_placeholder')}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_email')}</label>
                                    <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_phone')}</label>
                                    <input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className={inputCls} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_address')}</label>
                                    <textarea
                                        value={formAddress}
                                        onChange={(e) => setFormAddress(e.target.value)}
                                        rows={2}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_country')}</label>
                                    <input
                                        type="text"
                                        value={formCountry}
                                        onChange={(e) => setFormCountry(e.target.value)}
                                        placeholder="BD"
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── Legal & Compliance (BD) ── */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                                    <FileText className="h-4 w-4 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{t('company_legal_section')}</h3>
                            </div>
                            <p className="mb-5 text-sm text-gray-500">{t('company_legal_section_desc')}</p>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                                {/* Business Type */}
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_business_type')}</label>
                                    <select
                                        value={formBizType}
                                        onChange={(e) => setFormBizType(e.target.value)}
                                        className={inputCls}
                                    >
                                        <option value="">{t('lbl_select_business_type')}</option>
                                        {BUSINESS_TYPES.map((bt) => (
                                            <option key={bt.value} value={bt.value}>{t(bt.labelKey)}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Trade License */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_trade_license_no')}</label>
                                    <input
                                        type="text"
                                        value={formTradeLicenseNo}
                                        onChange={(e) => setFormTradeLicenseNo(e.target.value)}
                                        placeholder={t('ph_trade_license_no')}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_trade_license_expiry')}</label>
                                    <input
                                        type="date"
                                        value={formTradeLicenseExpiry}
                                        onChange={(e) => setFormTradeLicenseExpiry(e.target.value)}
                                        className={inputCls}
                                    />
                                </div>

                                {/* TIN */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_tin_no')}</label>
                                    <input
                                        type="text"
                                        value={formTin}
                                        onChange={(e) => setFormTin(e.target.value)}
                                        placeholder={t('ph_tin_no')}
                                        className={inputCls}
                                    />
                                </div>

                                {/* BIN / VAT */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_bin_no')}</label>
                                    <input
                                        type="text"
                                        value={formBin}
                                        onChange={(e) => setFormBin(e.target.value)}
                                        placeholder={t('ph_bin_no')}
                                        className={inputCls}
                                    />
                                </div>

                                {/* RJSC */}
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_rjsc_no')}</label>
                                    <input
                                        type="text"
                                        value={formRjsc}
                                        onChange={(e) => setFormRjsc(e.target.value)}
                                        placeholder={t('ph_rjsc_no')}
                                        className={inputCls}
                                    />
                                    <p className="mt-1 text-xs text-gray-400">{t('lbl_rjsc_hint')}</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Logo ── */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('lbl_company_logo')}</h3>
                            {existingLogoUrl && (
                                <div className="mb-3 flex items-center gap-3">
                                    <Image
                                        src={existingLogoUrl}
                                        alt={t('company_current_logo')}
                                        width={56}
                                        height={56}
                                        className="h-14 w-14 rounded-xl object-cover border border-gray-200 shadow-sm"
                                        unoptimized
                                    />
                                    <span className="text-sm text-gray-500">{t('company_current_logo')}</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormLogo(e.target.files?.[0] ?? null)}
                                className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#046ca9]/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#046ca9] hover:file:bg-[#046ca9]/20"
                            />
                        </div>

                        {/* ── Active Status ── */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">{t('company_is_active')}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{formIsActive ? t('lbl_active') : t('lbl_inactive')}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormIsActive((v) => !v)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formIsActive ? 'bg-[#046ca9]' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formIsActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-8 py-6">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
                            <button
                                type="button"
                                onClick={() => router.push('/company')}
                                className="w-full rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
                            >
                                {t('btn_cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#046ca9] to-[#034d79] px-8 py-3 font-medium text-white transition-all hover:brightness-105 focus:ring-4 focus:ring-[#046ca9]/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[160px]"
                            >
                                {isUpdating ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        {t('btn_updating')}
                                    </>
                                ) : (
                                    <>
                                        <Building2 className="h-4 w-4" />
                                        {t('btn_save_changes')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
