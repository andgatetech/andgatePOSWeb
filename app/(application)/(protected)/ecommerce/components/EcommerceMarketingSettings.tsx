'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useGetStoreQuery, useUpdateStoreMutation } from '@/store/features/store/storeApi';
import { BarChart3, CheckCircle2, ExternalLink, Facebook, FileText, Loader2, Megaphone, Save, Store } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const emptyForm = {
    meta_pixel_enabled: false,
    meta_pixel_id: '',
    seo_title: '',
    seo_description: '',
};

const copy = {
    en: {
        title: 'Marketing & Pixel',
        description: 'Set Meta Pixel and store share preview for {{store}}.',
        publicUrl: 'Public store URL',
        open: 'Open',
        trackingTitle: 'Meta Pixel Tracking',
        enablePixel: 'Enable Meta Pixel for this store',
        enablePixelHelp: 'When enabled, store page, product, cart, checkout, and purchase events are sent to this store Pixel.',
        pixelId: 'Meta Pixel ID',
        pixelPlaceholder: 'Example: 123456789012345',
        pixelHelp: 'Paste only the numeric Pixel ID from Meta Events Manager. Do not paste script code.',
        previewTitle: 'Store Page Share Preview',
        seoTitle: 'SEO / Facebook title',
        seoTitlePlaceholder: 'Store name or short marketing title',
        seoDescription: 'SEO / Facebook description',
        seoDescriptionPlaceholder: 'Short description shown in Google/Facebook previews',
        save: 'Save Marketing Settings',
        savedTitle: 'Marketing settings saved',
        savedDesc: 'This store Pixel and share preview settings were updated.',
        pixelRequired: 'Meta Pixel ID is required when Meta Pixel tracking is enabled.',
        pixelNumeric: 'Meta Pixel ID must contain numbers only.',
        setupTitle: 'How store owner sets up Meta Pixel',
        setupNote: 'They need to do this one time from their own Meta Business account.',
        seoHelpTitle: 'How title and description help',
        seoHelp: 'These values control how the store link looks when shared on Facebook, Messenger, WhatsApp, and search previews. Product and order tracking still uses the Pixel events automatically.',
        noStore: 'No store selected',
        selectStore: 'Please select a store to manage e-commerce marketing.',
        loading: 'Loading store marketing settings...',
        steps: [
            'Create or open a Meta Business account.',
            'Go to Meta Events Manager.',
            'Create or select a Pixel for this store.',
            'Copy only the numeric Pixel ID.',
            'Paste it here, turn Enable Meta Pixel ON, and save.',
            'Test from Meta Events Manager -> Test Events.',
        ],
        links: {
            business: 'Open Meta Business',
            events: 'Open Events Manager',
            docs: 'Pixel setup guide',
        },
    },
    bn: {
        title: 'মার্কেটিং ও পিক্সেল',
        description: '{{store}} স্টোরের Meta Pixel এবং শেয়ার প্রিভিউ সেট করুন।',
        publicUrl: 'পাবলিক স্টোর URL',
        open: 'ওপেন',
        trackingTitle: 'Meta Pixel ট্র্যাকিং',
        enablePixel: 'এই স্টোরের জন্য Meta Pixel চালু করুন',
        enablePixelHelp: 'চালু থাকলে store page, product, cart, checkout এবং purchase event এই স্টোরের Pixel এ যাবে।',
        pixelId: 'Meta Pixel ID',
        pixelPlaceholder: 'উদাহরণ: 123456789012345',
        pixelHelp: 'Meta Events Manager থেকে শুধু numeric Pixel ID দিন। script code পেস্ট করবেন না।',
        previewTitle: 'স্টোর পেজ শেয়ার প্রিভিউ',
        seoTitle: 'SEO / Facebook title',
        seoTitlePlaceholder: 'স্টোরের নাম বা ছোট মার্কেটিং title',
        seoDescription: 'SEO / Facebook description',
        seoDescriptionPlaceholder: 'Google/Facebook preview-তে দেখানোর ছোট বর্ণনা',
        save: 'মার্কেটিং সেটিংস সেভ করুন',
        savedTitle: 'মার্কেটিং সেটিংস সেভ হয়েছে',
        savedDesc: 'এই স্টোরের Pixel এবং share preview সেটিংস আপডেট হয়েছে।',
        pixelRequired: 'Meta Pixel tracking চালু করলে Meta Pixel ID দিতে হবে।',
        pixelNumeric: 'Meta Pixel ID শুধু সংখ্যা হতে হবে।',
        setupTitle: 'স্টোর owner কীভাবে Meta Pixel সেটআপ করবে',
        setupNote: 'নিজের Meta Business account থেকে একবার এই কাজগুলো করতে হবে।',
        seoHelpTitle: 'Title এবং description কীভাবে সাহায্য করে',
        seoHelp: 'স্টোর লিংক Facebook, Messenger, WhatsApp বা search preview-তে শেয়ার হলে এই title/description দেখা যায়। Product এবং order tracking Pixel event দিয়ে automatic চলবে।',
        noStore: 'কোনো স্টোর সিলেক্ট করা নেই',
        selectStore: 'E-commerce marketing manage করতে একটি স্টোর সিলেক্ট করুন।',
        loading: 'স্টোর মার্কেটিং সেটিংস লোড হচ্ছে...',
        steps: [
            'Meta Business account তৈরি করুন বা ওপেন করুন।',
            'Meta Events Manager-এ যান।',
            'এই স্টোরের জন্য Pixel তৈরি করুন বা select করুন।',
            'শুধু numeric Pixel ID কপি করুন।',
            'এখানে পেস্ট করুন, Enable Meta Pixel ON করুন, তারপর save করুন।',
            'Meta Events Manager -> Test Events থেকে test করুন।',
        ],
        links: {
            business: 'Meta Business ওপেন করুন',
            events: 'Events Manager ওপেন করুন',
            docs: 'Pixel setup guide',
        },
    },
};

const inputCls = 'h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/15';

const boolValue = (value: any) => value === true || value === 1 || value === '1' || value === 'true';

const EcommerceMarketingSettings = () => {
    const { t, i18n } = getTranslation();
    const content = copy[i18n.language === 'en' ? 'en' : 'bn'];
    const { currentStore } = useCurrentStore();
    const storeId = currentStore?.id;
    const { data, isFetching } = useGetStoreQuery({ store_id: storeId }, { skip: !storeId });
    const [updateStore, { isLoading: isSaving }] = useUpdateStoreMutation();
    const [form, setForm] = useState(emptyForm);

    const store = useMemo(() => (data as any)?.data?.store || currentStore || null, [currentStore, data]);
    const storeName = store?.store_name || t('lbl_store');
    const storeSlug = store?.slug || currentStore?.slug;
    const publicStoreUrl = storeSlug ? `https://hawkeri.com/store/${storeSlug}` : 'https://hawkeri.com/store/your-store';

    useEffect(() => {
        if (!store) return;

        setForm({
            meta_pixel_enabled: boolValue(store.meta_pixel_enabled),
            meta_pixel_id: store.meta_pixel_id || '',
            seo_title: store.seo_title || '',
            seo_description: store.seo_description || '',
        });
    }, [store]);

    const setField = (field: keyof typeof emptyForm, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!storeId) {
            showErrorDialog(t('msg_error'), content.selectStore);
            return;
        }

        const pixelId = form.meta_pixel_id.trim();

        if (form.meta_pixel_enabled && !pixelId) {
            showErrorDialog(t('msg_error'), content.pixelRequired);
            return;
        }

        if (pixelId && !/^[0-9]+$/.test(pixelId)) {
            showErrorDialog(t('msg_error'), content.pixelNumeric);
            return;
        }

        try {
            await updateStore({
                storeId,
                updateData: {
                    meta_pixel_enabled: form.meta_pixel_enabled ? 1 : 0,
                    meta_pixel_id: pixelId || '',
                    seo_title: form.seo_title.trim(),
                    seo_description: form.seo_description.trim(),
                },
            }).unwrap();

            showSuccessDialog(content.savedTitle, content.savedDesc);
        } catch (error: any) {
            showErrorDialog(t('msg_error'), error?.data?.message || t('msg_something_went_wrong'));
        }
    };

    if (!storeId) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="rounded-xl border border-[#e79237]/30 bg-[#e79237]/10 p-6 text-center">
                    <Store className="mx-auto h-12 w-12 text-[#c47920]" />
                    <h3 className="mt-4 text-lg font-semibold text-[#9a5a14]">{content.noStore}</h3>
                    <p className="mt-2 text-[#c47920]">{content.selectStore}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                        <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{content.title}</h1>
                        <p className="text-sm text-gray-500">{content.description.replace('{{store}}', storeName)}</p>
                    </div>
                </div>
            </div>

            {isFetching ? (
                <div className="flex items-center gap-2 rounded-lg bg-white p-4 text-sm text-gray-500 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {content.loading}
                </div>
            ) : (
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
                    <div className="space-y-5">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="flex items-center gap-2 text-sm font-semibold text-[#034d79]">
                                        <ExternalLink className="h-4 w-4" />
                                        {content.publicUrl}
                                    </p>
                                    <p className="mt-1 break-all text-sm text-[#046ca9]">{publicStoreUrl}</p>
                                </div>
                                <a
                                    href={publicStoreUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#046ca9]/30 bg-white px-4 py-2 text-sm font-semibold text-[#046ca9] transition hover:bg-[#046ca9] hover:text-white"
                                >
                                    {content.open}
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="text-base font-semibold text-gray-900">{content.trackingTitle}</h2>
                            <div className="mt-5 space-y-5">
                                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <span>
                                        <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                            <Facebook className="h-4 w-4 text-blue-600" />
                                            {content.enablePixel}
                                        </span>
                                        <span className="mt-1 block text-xs text-gray-500">{content.enablePixelHelp}</span>
                                    </span>
                                    <input type="checkbox" checked={form.meta_pixel_enabled} onChange={(event) => setField('meta_pixel_enabled', event.target.checked)} className="h-5 w-5 rounded border-gray-300 text-[#046ca9] focus:ring-[#046ca9]" />
                                </label>

                                <label className="block">
                                    <span className="mb-1.5 flex items-center text-sm font-medium text-gray-700">
                                        <BarChart3 className="mr-2 h-4 w-4 text-[#046ca9]" />
                                        {content.pixelId}
                                    </span>
                                    <input type="text" inputMode="numeric" pattern="[0-9]*" value={form.meta_pixel_id} onChange={(event) => setField('meta_pixel_id', event.target.value)} className={inputCls} placeholder={content.pixelPlaceholder} />
                                    <span className="mt-1.5 block text-xs text-gray-400">{content.pixelHelp}</span>
                                </label>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="text-base font-semibold text-gray-900">{content.previewTitle}</h2>
                            <div className="mt-5 grid gap-4">
                                <label className="block">
                                    <span className="mb-1.5 flex items-center text-sm font-medium text-gray-700">
                                        <FileText className="mr-2 h-4 w-4 text-[#046ca9]" />
                                        {content.seoTitle}
                                    </span>
                                    <input type="text" value={form.seo_title} onChange={(event) => setField('seo_title', event.target.value)} maxLength={70} className={inputCls} placeholder={content.seoTitlePlaceholder} />
                                    <span className="mt-1.5 block text-xs text-gray-400">{form.seo_title.length}/70</span>
                                </label>

                                <label className="block">
                                    <span className="mb-1.5 flex items-center text-sm font-medium text-gray-700">
                                        <FileText className="mr-2 h-4 w-4 text-[#c47920]" />
                                        {content.seoDescription}
                                    </span>
                                    <textarea value={form.seo_description} onChange={(event) => setField('seo_description', event.target.value)} maxLength={160} rows={3} className={`${inputCls} h-auto py-3`} placeholder={content.seoDescriptionPlaceholder} />
                                    <span className="mt-1.5 block text-xs text-gray-400">{form.seo_description.length}/160</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                disabled={isSaving}
                                onClick={handleSave}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#046ca9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#035f95] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {content.save}
                            </button>
                        </div>
                    </div>

                    <aside className="space-y-5">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="text-base font-semibold text-gray-900">{content.setupTitle}</h2>
                            <p className="mt-1 text-sm text-gray-500">{content.setupNote}</p>
                            <ol className="mt-5 space-y-3 text-sm text-gray-700">
                                {content.steps.map((step, index) => (
                                    <li key={step} className="flex gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9]/10 text-xs font-bold text-[#046ca9]">{index + 1}</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                            <div className="mt-5 flex flex-wrap gap-2">
                                <SetupLink href="https://business.facebook.com/" label={content.links.business} />
                                <SetupLink href="https://business.facebook.com/events_manager2/list/pixel/" label={content.links.events} />
                                <SetupLink href="https://developers.facebook.com/docs/meta-pixel/get-started/" label={content.links.docs} />
                            </div>
                        </div>

                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-5">
                            <h2 className="flex items-center gap-2 text-base font-semibold text-emerald-900">
                                <CheckCircle2 className="h-5 w-5" />
                                {content.seoHelpTitle}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-emerald-800">{content.seoHelp}</p>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

const SetupLink = ({ href, label }: { href: string; label: string }) => (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-[#046ca9] transition hover:border-[#046ca9] hover:bg-[#046ca9]/5">
        {label}
        <ExternalLink className="h-3.5 w-3.5" />
    </a>
);

export default EcommerceMarketingSettings;
