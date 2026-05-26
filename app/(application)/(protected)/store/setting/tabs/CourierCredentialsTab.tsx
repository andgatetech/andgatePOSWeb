'use client';

import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useGetCourierCredentialsQuery, useSaveCourierCredentialMutation, useUpdateCourierCredentialMutation } from '@/store/features/ecommerce/ecommerceManagementApi';
import { CheckCircle2, KeyRound, Loader2, PackageCheck, Save, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Provider = 'pathao' | 'steadfast' | 'redx';

const providers: { id: Provider; label: string; helper: string }[] = [
    { id: 'pathao', label: 'Pathao', helper: 'OAuth client, merchant account login, and Pathao store ID.' },
    { id: 'steadfast', label: 'Steadfast', helper: 'API key and secret key from Steadfast portal.' },
    { id: 'redx', label: 'RedX', helper: 'OpenAPI token plus optional pickup store and pickup area IDs.' },
];

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

const providerStatus = (credential: any) => {
    if (!credential) return 'Not configured';
    return credential.is_active ? 'Active' : 'Inactive';
};

const CourierCredentialsTab = ({ storeId }: { storeId: number }) => {
    const [activeProvider, setActiveProvider] = useState<Provider>('pathao');
    const [form, setForm] = useState(emptyForm);
    const { data, isFetching } = useGetCourierCredentialsQuery({ store_id: storeId }, { skip: !storeId });
    const [saveCredential, { isLoading: isSaving }] = useSaveCourierCredentialMutation();
    const [updateCredential, { isLoading: isUpdating }] = useUpdateCourierCredentialMutation();

    const credentials = useMemo(() => {
        const items = data?.data?.items || data?.items || [];
        return Array.isArray(items) ? items : [];
    }, [data]);

    const activeCredential = useMemo(() => credentials.find((item: any) => item.provider === activeProvider), [activeProvider, credentials]);

    useEffect(() => {
        setForm({
            ...emptyForm,
            is_active: activeCredential?.is_active ?? true,
            provider_store_id: activeCredential?.provider_store_id || '',
        });
    }, [activeCredential?.id, activeCredential?.is_active, activeCredential?.provider_store_id]);

    const setField = (field: keyof typeof emptyForm, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
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
            showSuccessDialog('Saved', `${providers.find((item) => item.id === activeProvider)?.label} credentials saved.`);
            setForm((prev) => ({
                ...prev,
                client_secret: '',
                password: '',
                api_key: '',
                secret_key: '',
                token: '',
            }));
        } catch (error: any) {
            showErrorDialog('Save failed', error?.data?.message || error?.data?.errors?.courier || 'Unable to save courier credentials.');
        }
    };

    const renderFields = () => {
        if (activeProvider === 'pathao') {
            return (
                <>
                    <Field label="Pathao Store ID" value={form.provider_store_id} onChange={(value) => setField('provider_store_id', value)} placeholder="Merchant store ID" />
                    <Field label="Client ID" value={form.client_id} onChange={(value) => setField('client_id', value)} />
                    <SecretField label="Client Secret" value={form.client_secret} onChange={(value) => setField('client_secret', value)} />
                    <Field label="Username" value={form.username} onChange={(value) => setField('username', value)} placeholder="merchant@example.com" />
                    <SecretField label="Password" value={form.password} onChange={(value) => setField('password', value)} />
                </>
            );
        }

        if (activeProvider === 'steadfast') {
            return (
                <>
                    <SecretField label="API Key" value={form.api_key} onChange={(value) => setField('api_key', value)} />
                    <SecretField label="Secret Key" value={form.secret_key} onChange={(value) => setField('secret_key', value)} />
                </>
            );
        }

        return (
            <>
                <Field label="Pickup Store ID" value={form.provider_store_id} onChange={(value) => setField('provider_store_id', value)} placeholder="Optional RedX pickup_store_id" />
                <Field label="Pickup Area ID" value={form.pickup_area_id} onChange={(value) => setField('pickup_area_id', value)} placeholder="Used for charge calculation" />
                <SecretField label="OpenAPI Token" value={form.token} onChange={(value) => setField('token', value)} />
            </>
        );
    };

    return (
        <div className="space-y-5">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#046ca9]/10 text-[#046ca9]">
                        <Truck className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Courier Credentials</h3>
                        <p className="text-sm text-gray-500">Configure only the courier services this store uses.</p>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    {providers.map((provider) => {
                        const credential = credentials.find((item: any) => item.provider === provider.id);
                        const active = activeProvider === provider.id;
                        return (
                            <button
                                key={provider.id}
                                type="button"
                                onClick={() => setActiveProvider(provider.id)}
                                className={`rounded-lg border p-4 text-left transition ${
                                    active ? 'border-[#046ca9] bg-[#046ca9]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-[#046ca9]/40'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-semibold text-gray-900">{provider.label}</span>
                                    {credential ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <KeyRound className="h-4 w-4 text-gray-400" />}
                                </div>
                                <p className="mt-1 text-xs text-gray-500">{providerStatus(credential)}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h4 className="text-base font-semibold text-gray-900">{providers.find((item) => item.id === activeProvider)?.label} setup</h4>
                        <p className="mt-1 text-sm text-gray-500">{providers.find((item) => item.id === activeProvider)?.helper}</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input type="checkbox" checked={form.is_active} onChange={(event) => setField('is_active', event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#046ca9]" />
                        Active
                    </label>
                </div>

                {isFetching ? (
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading courier credentials
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">{renderFields()}</div>
                )}

                <div className="mt-5 flex flex-col gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                    <span className="inline-flex items-center gap-2">
                        <PackageCheck className="h-4 w-4 text-[#046ca9]" />
                        Existing secrets are masked. Fill secret fields only when adding or replacing them.
                    </span>
                    <button
                        type="button"
                        disabled={isSaving || isUpdating}
                        onClick={handleSave}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#046ca9] px-4 py-2 font-semibold text-white transition hover:bg-[#035f95] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSaving || isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save courier
                    </button>
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

const SecretField = (props: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) => (
    <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-gray-700">{props.label}</span>
        <input
            type="password"
            value={props.value}
            onChange={(event) => props.onChange(event.target.value)}
            placeholder={props.placeholder || 'Leave blank to keep current value'}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/15"
        />
    </label>
);

export default CourierCredentialsTab;
