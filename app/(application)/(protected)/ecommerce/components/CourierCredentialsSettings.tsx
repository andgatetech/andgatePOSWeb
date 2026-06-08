'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useDeleteCourierCredentialMutation, useGetCourierCredentialsQuery, useSaveCourierCredentialMutation, useUpdateCourierCredentialMutation } from '@/store/features/ecommerce/ecommerceManagementApi';
import { AlertCircle, CheckCircle2, ExternalLink, KeyRound, Loader2, PackageCheck, Save, Store, Trash2, Truck } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

type Provider = 'pathao' | 'steadfast' | 'redx';

const providerIds: Provider[] = ['pathao', 'steadfast', 'redx'];

const emptyForm = {
    is_active: true,
    provider_store_id: '',
    client_id: '',
    client_secret: '',
    username: '',
    password: '',
    api_key: '',
    secret_key: '',
    token: '',
    pickup_area_id: '',
};

type CredentialForm = typeof emptyForm;
type CredentialFieldKey = keyof CredentialForm;
type CredentialField = {
    field: CredentialFieldKey;
    labelKey: string;
    aliases: string[];
    secret?: boolean;
    optional?: boolean;
};

const providerFields: Record<Provider, CredentialField[]> = {
    pathao: [
        { field: 'provider_store_id', labelKey: 'ecommerce_courier_pathao_store_id', aliases: ['provider_store_id', 'store_id', 'pathao_store_id'] },
        { field: 'client_id', labelKey: 'ecommerce_courier_client_id', aliases: ['client_id'] },
        { field: 'client_secret', labelKey: 'ecommerce_courier_client_secret', aliases: ['client_secret'], secret: true },
        { field: 'username', labelKey: 'ecommerce_courier_username', aliases: ['username', 'email'] },
        { field: 'password', labelKey: 'ecommerce_courier_password', aliases: ['password'], secret: true },
    ],
    steadfast: [
        { field: 'api_key', labelKey: 'ecommerce_courier_api_key', aliases: ['api_key'], secret: true },
        { field: 'secret_key', labelKey: 'ecommerce_courier_secret_key', aliases: ['secret_key'], secret: true },
    ],
    redx: [
        { field: 'provider_store_id', labelKey: 'ecommerce_courier_pickup_store_id', aliases: ['provider_store_id', 'pickup_store_id', 'store_id', 'shop_id'] },
        { field: 'pickup_area_id', labelKey: 'ecommerce_courier_pickup_area_id', aliases: ['pickup_area_id'], optional: true },
        { field: 'token', labelKey: 'ecommerce_courier_openapi_token', aliases: ['token', 'openapi_token', 'api_token'], secret: true },
    ],
};

const instructionImages: Record<Provider, { src: string; key: string }[]> = {
    pathao: [
        { src: '/courier-image/pathow sotre-id.png', key: 'ecommerce_courier_pathao_store_image' },
        { src: '/courier-image/aptho- cilet id and secret.png', key: 'ecommerce_courier_pathao_api_image' },
    ],
    steadfast: [{ src: '/courier-image/steadfat-api.png', key: 'ecommerce_courier_steadfast_api_image' }],
    redx: [
        { src: '/courier-image/redx-storeId.png', key: 'ecommerce_courier_redx_store_image' },
        { src: '/courier-image/redx-token.png', key: 'ecommerce_courier_redx_api_image' },
    ],
};

const providerLinks: Record<Provider, { labelKey: string; href: string }[]> = {
    pathao: [
        { labelKey: 'ecommerce_courier_link_register_login', href: 'https://merchant.pathao.com/register' },
        { labelKey: 'ecommerce_courier_link_pathao_store', href: 'https://merchant.pathao.com/courier/stores/list' },
        { labelKey: 'ecommerce_courier_link_pathao_api', href: 'https://merchant.pathao.com/courier/developer-api' },
    ],
    steadfast: [
        { labelKey: 'ecommerce_courier_link_register_login', href: 'https://steadfast.com.bd/register' },
        { labelKey: 'ecommerce_courier_link_steadfast_api', href: 'https://steadfast.com.bd/user/api' },
    ],
    redx: [
        { labelKey: 'ecommerce_courier_link_redx_login', href: 'https://redx.com.bd/login/' },
        { labelKey: 'ecommerce_courier_link_redx_shop', href: 'https://redx.com.bd/shop-list/' },
        { labelKey: 'ecommerce_courier_link_redx_api', href: 'https://redx.com.bd/developer-api/' },
    ],
};

const credentialContainers = (credential: any) =>
    [
        credential,
        credential?.credentials,
        credential?.credential,
        credential?.credential_values,
        credential?.masked_credentials,
        credential?.masked,
        credential?.data?.credentials,
        credential?.metadata?.credentials,
        credential?.metadata?.masked_credentials,
    ].filter(Boolean);

const hasUsableValue = (value: any) => value !== undefined && value !== null && String(value).trim() !== '';

const credentialHasField = (credential: any, field: CredentialField) => {
    if (!credential) return false;

    if (field.field === 'provider_store_id' && hasUsableValue(credential.provider_store_id)) return true;

    const flagContainers = [credential?.filled_fields, credential?.configured_fields, credential?.credential_fields, credential?.credential_keys, credential?.credentials_keys, credential?.metadata?.filled_fields].filter(Boolean);

    if (
        flagContainers.some((container: any) => {
            if (Array.isArray(container)) return field.aliases.some((alias) => container.includes(alias));
            if (typeof container === 'object') return field.aliases.some((alias) => Boolean(container[alias]));
            return false;
        })
    ) {
        return true;
    }

    return credentialContainers(credential).some((container: any) => field.aliases.some((alias) => hasUsableValue(container?.[alias])));
};

const getCredentialFieldValue = (credential: any, field: CredentialField) => {
    for (const container of credentialContainers(credential)) {
        const alias = field.aliases.find((fieldAlias) => hasUsableValue(container?.[fieldAlias]));
        if (alias) return container[alias];
    }

    return '';
};

const isFieldFilled = (credential: any, field: CredentialField, form?: CredentialForm) => {
    if (form && hasUsableValue(form[field.field])) return true;
    if (credentialHasField(credential, field)) return true;
    return Boolean(credential?.id && field.secret);
};

const getProviderCompletion = (provider: Provider, credential: any, form?: CredentialForm) => {
    const requiredFields = providerFields[provider].filter((field) => !field.optional);
    const filled = requiredFields.filter((field) => isFieldFilled(credential, field, form)).length;
    return { filled, total: requiredFields.length, complete: requiredFields.length > 0 && filled === requiredFields.length };
};

const CourierCredentialsSettings = () => {
    const { t } = getTranslation();
    const { currentStore } = useCurrentStore();
    const storeId = currentStore?.id;
    const [activeProvider, setActiveProvider] = useState<Provider>('pathao');
    const [form, setForm] = useState(emptyForm);
    const { data, isFetching } = useGetCourierCredentialsQuery({ store_id: storeId }, { skip: !storeId });
    const [saveCredential, { isLoading: isSaving }] = useSaveCourierCredentialMutation();
    const [updateCredential, { isLoading: isUpdating }] = useUpdateCourierCredentialMutation();
    const [deleteCredential, { isLoading: isDeleting }] = useDeleteCourierCredentialMutation();

    const credentials = useMemo(() => {
        const items = (data as any)?.data?.items || (data as any)?.items || [];
        return Array.isArray(items) ? items : [];
    }, [data]);

    const activeCredential = useMemo(() => credentials.find((item: any) => item.provider === activeProvider), [activeProvider, credentials]);
    const activeCompletion = useMemo(() => getProviderCompletion(activeProvider, activeCredential, form), [activeCredential, activeProvider, form]);

    useEffect(() => {
        const providerStoreField = providerFields[activeProvider].find((field) => field.field === 'provider_store_id');
        const storedProviderStoreId = providerStoreField ? getCredentialFieldValue(activeCredential, providerStoreField) : '';

        setForm({
            ...emptyForm,
            is_active: activeCredential?.is_active ?? true,
            provider_store_id: activeCredential?.provider_store_id || storedProviderStoreId || '',
        });
    }, [activeCredential, activeProvider]);

    const setField = (field: keyof typeof emptyForm, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const providerLabel = (provider: Provider) => t(`ecommerce_courier_provider_${provider}`);
    const providerStatus = (credential: any) => {
        if (!credential) return t('ecommerce_courier_status_not_configured');
        return credential.is_active ? t('ecommerce_courier_status_active') : t('ecommerce_courier_status_inactive');
    };

    const handleDelete = async () => {
        if (!activeCredential?.id) return;

        const confirmed = await showConfirmDialog(
            t('ecommerce_courier_delete_confirm_title'),
            t('ecommerce_courier_delete_confirm_desc', { provider: providerLabel(activeProvider) }),
            t('ecommerce_courier_delete_confirm_btn'),
            t('btn_cancel'),
            false
        );

        if (!confirmed) return;

        try {
            await deleteCredential(activeCredential.id).unwrap();
            setForm(emptyForm);
            showSuccessDialog(t('ecommerce_courier_deleted_title'), t('ecommerce_courier_deleted_desc', { provider: providerLabel(activeProvider) }));
        } catch (error: any) {
            showErrorDialog(t('ecommerce_courier_delete_failed_title'), error?.data?.message || t('ecommerce_courier_delete_failed_desc'));
        }
    };

    const handleSave = async () => {
        if (!storeId) {
            showErrorDialog(t('msg_error'), t('msg_no_store_selected'));
            return;
        }

        const credentialsPayload: Record<string, any> = {};

        if (activeProvider === 'pathao') {
            credentialsPayload.client_id = form.client_id;
            credentialsPayload.client_secret = form.client_secret;
            credentialsPayload.username = form.username;
            credentialsPayload.password = form.password;
        }

        if (activeProvider === 'steadfast') {
            credentialsPayload.api_key = form.api_key;
            credentialsPayload.secret_key = form.secret_key;
        }

        if (activeProvider === 'redx') {
            credentialsPayload.token = form.token;
            if (form.pickup_area_id) credentialsPayload.pickup_area_id = Number(form.pickup_area_id);
        }

        try {
            const cleanCredentials = Object.fromEntries(Object.entries(credentialsPayload).filter(([, value]) => value !== '' && value !== null && value !== undefined));

            if (activeCredential?.id) {
                await updateCredential({
                    id: activeCredential.id,
                    is_active: form.is_active,
                    provider_store_id: form.provider_store_id || null,
                    ...(Object.keys(cleanCredentials).length > 0 ? { credentials: cleanCredentials } : {}),
                }).unwrap();
            } else {
                await saveCredential({
                    store_id: storeId,
                    provider: activeProvider,
                    is_active: form.is_active,
                    provider_store_id: form.provider_store_id || null,
                    credentials: cleanCredentials,
                }).unwrap();
            }

            showSuccessDialog(t('ecommerce_courier_saved_title'), t('ecommerce_courier_saved_desc', { provider: providerLabel(activeProvider) }));
            setForm((prev) => ({
                ...prev,
                client_secret: '',
                password: '',
                api_key: '',
                secret_key: '',
                token: '',
            }));
        } catch (error: any) {
            showErrorDialog(t('ecommerce_courier_save_failed_title'), error?.data?.message || error?.data?.errors?.courier || t('ecommerce_courier_save_failed_desc'));
        }
    };

    const renderFields = () => {
        if (activeProvider === 'pathao') {
            return (
                <>
                    <Field label={t('ecommerce_courier_pathao_store_id')} value={form.provider_store_id} onChange={(value) => setField('provider_store_id', value)} placeholder={t('ecommerce_courier_pathao_store_placeholder')} />
                    <Field label={t('ecommerce_courier_client_id')} value={form.client_id} onChange={(value) => setField('client_id', value)} />
                    <SecretField label={t('ecommerce_courier_client_secret')} value={form.client_secret} onChange={(value) => setField('client_secret', value)} />
                    <Field label={t('ecommerce_courier_username')} value={form.username} onChange={(value) => setField('username', value)} placeholder="merchant@example.com" />
                    <SecretField label={t('ecommerce_courier_password')} value={form.password} onChange={(value) => setField('password', value)} />
                </>
            );
        }

        if (activeProvider === 'steadfast') {
            return (
                <>
                    <SecretField label={t('ecommerce_courier_api_key')} value={form.api_key} onChange={(value) => setField('api_key', value)} />
                    <SecretField label={t('ecommerce_courier_secret_key')} value={form.secret_key} onChange={(value) => setField('secret_key', value)} />
                </>
            );
        }

        return (
            <>
                <Field label={t('ecommerce_courier_pickup_store_id')} value={form.provider_store_id} onChange={(value) => setField('provider_store_id', value)} placeholder={t('ecommerce_courier_redx_store_placeholder')} />
                <Field label={t('ecommerce_courier_pickup_area_id')} value={form.pickup_area_id} onChange={(value) => setField('pickup_area_id', value)} placeholder={t('ecommerce_courier_pickup_area_placeholder')} />
                <SecretField label={t('ecommerce_courier_openapi_token')} value={form.token} onChange={(value) => setField('token', value)} />
            </>
        );
    };

    if (!storeId) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="rounded-xl border border-[#e79237]/30 bg-[#e79237]/10 p-6 text-center">
                    <Store className="mx-auto h-12 w-12 text-[#c47920]" />
                    <h3 className="mt-4 text-lg font-semibold text-[#9a5a14]">{t('msg_no_store_selected')}</h3>
                    <p className="mt-2 text-[#c47920]">{t('msg_select_store_to_manage')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                        <Truck className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('ecommerce_courier_title')}</h1>
                        <p className="text-sm text-gray-500">{t('ecommerce_courier_desc', { store: currentStore?.store_name || t('lbl_store') })}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex flex-col gap-1">
                        <h2 className="text-base font-semibold text-gray-900">{t('ecommerce_courier_select_provider')}</h2>
                        <p className="text-sm text-gray-500">{t('ecommerce_courier_select_provider_desc')}</p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        {providerIds.map((provider) => {
                            const credential = credentials.find((item: any) => item.provider === provider);
                            const active = activeProvider === provider;
                            const completion = getProviderCompletion(provider, credential, active ? form : undefined);
                            return (
                                <button
                                    key={provider}
                                    type="button"
                                    onClick={() => setActiveProvider(provider)}
                                    className={`rounded-lg border p-4 text-left transition ${active ? 'border-[#046ca9] bg-[#046ca9]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-[#046ca9]/40'}`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-semibold text-gray-900">{providerLabel(provider)}</span>
                                        {completion.complete ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <KeyRound className="h-4 w-4 text-gray-400" />}
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                        <span className={credential?.is_active ? 'font-medium text-emerald-700' : 'text-gray-500'}>{providerStatus(credential)}</span>
                                        <span className={completion.complete ? 'rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700' : 'rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700'}>
                                            {t('ecommerce_courier_required_count', { filled: completion.filled, total: completion.total })}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">{t('ecommerce_courier_setup_title', { provider: providerLabel(activeProvider) })}</h2>
                            <p className="mt-1 text-sm text-gray-500">{t(`ecommerce_courier_${activeProvider}_helper`)}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className={activeCompletion.complete ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700' : 'inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700'}>
                                {activeCompletion.complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                                {activeCompletion.complete ? t('ecommerce_courier_status_complete') : t('ecommerce_courier_status_missing')}
                            </span>
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                <input type="checkbox" checked={form.is_active} onChange={(event) => setField('is_active', event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#046ca9]" />
                                {t('lbl_active')}
                            </label>
                        </div>
                    </div>

                    {isFetching ? (
                        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('ecommerce_courier_loading')}
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 md:grid-cols-2">{renderFields()}</div>
                            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {providerFields[activeProvider].map((field) => {
                                    const filled = isFieldFilled(activeCredential, field, form);
                                    return (
                                        <div key={field.field} className={`flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${filled ? 'border-emerald-100 bg-emerald-50/60' : 'border-amber-100 bg-amber-50/70'}`}>
                                            <span className="min-w-0 truncate font-medium text-gray-700">{t(field.labelKey)}</span>
                                            <span className={`inline-flex shrink-0 items-center gap-1 text-xs font-semibold ${filled ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                {filled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                                                {filled ? t('ecommerce_courier_field_filled') : field.optional ? t('ecommerce_courier_field_optional') : t('ecommerce_courier_field_missing')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    <div className="mt-5 flex flex-col gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                        <span className="inline-flex items-center gap-2">
                            <PackageCheck className="h-4 w-4 text-[#046ca9]" />
                            {t('ecommerce_courier_secret_notice')}
                        </span>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            {activeCredential?.id && (
                                <button
                                    type="button"
                                    disabled={isSaving || isUpdating || isDeleting}
                                    onClick={handleDelete}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    {t('ecommerce_courier_delete')}
                                </button>
                            )}
                            <button
                                type="button"
                                disabled={isSaving || isUpdating || isDeleting}
                                onClick={handleSave}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#046ca9] px-4 py-2 font-semibold text-white transition hover:bg-[#035f95] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSaving || isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {t('ecommerce_courier_save')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-semibold text-gray-900">{t('ecommerce_courier_instruction_title', { provider: providerLabel(activeProvider) })}</h2>
                    <ol className="mt-4 grid gap-3 text-sm text-gray-700 lg:grid-cols-2">
                        {[1, 2, 3, 4].map((step) => (
                            <li key={step} className="flex gap-3">
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9]/10 text-xs font-bold text-[#046ca9]">{step}</span>
                                <span>{t(`ecommerce_courier_${activeProvider}_step_${step}`)}</span>
                            </li>
                        ))}
                    </ol>
                    <div className="mt-5 flex flex-wrap gap-2">
                        {providerLinks[activeProvider].map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-[#046ca9] transition hover:border-[#046ca9] hover:bg-[#046ca9]/5"
                            >
                                {t(link.labelKey)}
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        ))}
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {instructionImages[activeProvider].map((image) => (
                        <figure key={image.src} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="relative aspect-[16/10] bg-gray-100">
                                <Image src={image.src} alt={t(image.key)} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain" />
                            </div>
                            <figcaption className="border-t border-gray-100 px-4 py-3 text-xs font-medium text-gray-600">{t(image.key)}</figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Field = ({ label, value, onChange, placeholder = '' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) => (
    <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
        <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/15"
        />
    </label>
);

const SecretField = (props: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) => {
    const { t } = getTranslation();
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">{props.label}</span>
            <input
                type="password"
                value={props.value}
                onChange={(event) => props.onChange(event.target.value)}
                placeholder={props.placeholder || t('ecommerce_courier_secret_placeholder')}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/15"
            />
        </label>
    );
};

export default CourierCredentialsSettings;
