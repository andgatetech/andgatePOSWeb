'use client';

import { getTranslation } from '@/i18n';
import { useGetCompaniesQuery } from '@/store/features/company/companyApi';
import { AlertTriangle, Building2, CalendarDays, CheckCircle2, Clock, FileText, Plus, Shield, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface ComplianceEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    type: 'tax' | 'license' | 'registration' | 'other';
    note?: string;
    createdAt: number;
}

const STORAGE_KEY = 'andgate_compliance_events';

const TYPE_STYLES: Record<ComplianceEvent['type'], { icon: React.ReactNode; bg: string; text: string; border: string }> = {
    tax: {
        icon: <FileText className="h-4 w-4" />,
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
    },
    license: {
        icon: <Shield className="h-4 w-4" />,
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
    },
    registration: {
        icon: <Building2 className="h-4 w-4" />,
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
    },
    other: {
        icon: <CalendarDays className="h-4 w-4" />,
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
    },
};

function daysUntil(dateStr: string): number {
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string, language: string): string {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        });
    } catch {
        return dateStr;
    }
}

export default function ComplianceCalendarPage() {
    const { t, i18n } = getTranslation();
    const isBn = i18n.language === 'bn';
    const { data: companiesData, isLoading: isLoadingCompanies } = useGetCompaniesQuery({}, { refetchOnMountOrArgChange: 30 });

    const [events, setEvents] = useState<ComplianceEvent[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEvent, setNewEvent] = useState<Pick<ComplianceEvent, 'title' | 'date' | 'type' | 'note'>>({
        title: '',
        date: '',
        type: 'other',
        note: '',
    });

    useEffect(() => {
        setIsClient(true);
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as ComplianceEvent[];
                setEvents(Array.isArray(parsed) ? parsed : []);
            }
        } catch {
            setEvents([]);
        }
    }, []);

    useEffect(() => {
        if (!isClient) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        } catch {
            // Non-critical
        }
    }, [events, isClient]);

    const company = useMemo(() => {
        const d = companiesData as any;
        if (!d) return null;
        const list = Array.isArray(d?.data?.data) ? d.data.data : Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : [];
        return list[0] || null;
    }, [companiesData]);

    const builtInEvents: ComplianceEvent[] = useMemo(() => {
        const items: ComplianceEvent[] = [];
        if (!company) return items;

        if (company.trade_license_expiry) {
            items.push({
                id: `builtin-trade-license-${company.id}`,
                title: isBn ? 'ট্রেড লাইসেন্স নবায়ন' : 'Trade License Renewal',
                date: company.trade_license_expiry.slice(0, 10),
                type: 'license',
                note: company.trade_license_no ? `${isBn ? 'লাইসেন্স নং' : 'License No'}: ${company.trade_license_no}` : undefined,
            });
        }

        if (company.bin_no) {
            items.push({
                id: `builtin-bin-${company.id}`,
                title: isBn ? 'BIN (ভ্যাট নিবন্ধন) তথ্য' : 'BIN (VAT Registration) Info',
                date: '', // No expiry known; shown as info
                type: 'registration',
                note: `BIN: ${company.bin_no}`,
            });
        }

        if (company.tin_no) {
            items.push({
                id: `builtin-tin-${company.id}`,
                title: isBn ? 'TIN (ট্যাক্স আইডি) তথ্য' : 'TIN (Tax ID) Info',
                date: '',
                type: 'registration',
                note: `TIN: ${company.tin_no}`,
            });
        }

        if (company.rjsc_no) {
            items.push({
                id: `builtin-rjsc-${company.id}`,
                title: isBn ? 'RJSC নিবন্ধন তথ্য' : 'RJSC Registration Info',
                date: '',
                type: 'registration',
                note: `RJSC: ${company.rjsc_no}`,
            });
        }

        return items;
    }, [company, isBn]);

    const allEvents = useMemo(() => {
        const merged = [...builtInEvents];
        events.forEach((evt) => {
            if (!merged.some((e) => e.id === evt.id)) {
                merged.push(evt);
            }
        });
        return merged.sort((a, b) => {
            // Events without dates go to bottom
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
    }, [builtInEvents, events]);

    const stats = useMemo(() => {
        const dated = allEvents.filter((e) => e.date);
        const overdue = dated.filter((e) => daysUntil(e.date) < 0);
        const dueSoon = dated.filter((e) => {
            const d = daysUntil(e.date);
            return d >= 0 && d <= 30;
        });
        const ok = dated.filter((e) => daysUntil(e.date) > 30);
        const info = allEvents.filter((e) => !e.date);
        return { overdue: overdue.length, dueSoon: dueSoon.length, ok: ok.length, info: info.length, total: allEvents.length };
    }, [allEvents]);

    const handleAddEvent = () => {
        if (!newEvent.title.trim() || !newEvent.date) return;
        const evt: ComplianceEvent = {
            id: `custom-${Date.now()}`,
            title: newEvent.title.trim(),
            date: newEvent.date,
            type: newEvent.type,
            note: newEvent.note?.trim(),
            createdAt: Date.now(),
        };
        setEvents((prev) => [...prev, evt]);
        setNewEvent({ title: '', date: '', type: 'other', note: '' });
        setShowAddModal(false);
    };

    const handleDeleteEvent = (id: string) => {
        setEvents((prev) => prev.filter((e) => e.id !== id));
    };

    const statusBadge = (event: ComplianceEvent) => {
        if (!event.date) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    <CheckCircle2 className="h-3 w-3" />
                    {isBn ? 'তথ্য' : 'Info'}
                </span>
            );
        }
        const d = daysUntil(event.date);
        if (d < 0) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                    <AlertTriangle className="h-3 w-3" />
                    {isBn ? `মেয়াদোত্তীর্ণ (${Math.abs(d)} দিন)` : `Overdue (${Math.abs(d)} days)`}
                </span>
            );
        }
        if (d <= 30) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                    <Clock className="h-3 w-3" />
                    {isBn ? `${d} দিন বাকি` : `${d} days left`}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                <CheckCircle2 className="h-3 w-3" />
                {isBn ? `${d} দিন বাকি` : `${d} days left`}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                        <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('compliance_calendar_title')}</h1>
                        <p className="text-sm text-gray-500">{t('compliance_calendar_desc')}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#046ca9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#034d79]"
                >
                    <Plus className="h-4 w-4" />
                    {t('compliance_add_event')}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                    <p className="text-2xl font-black text-red-700">{stats.overdue}</p>
                    <p className="text-xs font-medium text-red-600">{t('compliance_overdue')}</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                    <p className="text-2xl font-black text-amber-700">{stats.dueSoon}</p>
                    <p className="text-xs font-medium text-amber-600">{t('compliance_due_soon')}</p>
                </div>
                <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                    <p className="text-2xl font-black text-green-700">{stats.ok}</p>
                    <p className="text-xs font-medium text-green-600">{t('compliance_up_to_date')}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-2xl font-black text-gray-700">{stats.info}</p>
                    <p className="text-xs font-medium text-gray-600">{t('compliance_info_items')}</p>
                </div>
            </div>

            {/* Events list */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                    <h2 className="font-bold text-gray-900">{t('compliance_upcoming_items')}</h2>
                </div>
                {isLoadingCompanies || !isClient ? (
                    <div className="p-8 text-center text-sm text-gray-500">{t('lbl_loading')}</div>
                ) : allEvents.length === 0 ? (
                    <div className="p-8 text-center">
                        <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-3 text-sm font-medium text-gray-900">{t('compliance_no_events')}</p>
                        <p className="text-xs text-gray-500">{t('compliance_no_events_desc')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {allEvents.map((event) => {
                            const style = TYPE_STYLES[event.type];
                            const isBuiltin = event.id.startsWith('builtin-');
                            return (
                                <div key={event.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${style.border} ${style.bg} ${style.text}`}>
                                            {style.icon}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{event.title}</p>
                                            {event.date && <p className="text-xs text-gray-500">{formatDate(event.date, i18n.language)}</p>}
                                            {event.note && <p className="mt-0.5 text-xs text-gray-500">{event.note}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                                        {statusBadge(event)}
                                        {!isBuiltin && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                                aria-label={t('btn_delete')}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add event modal */}
            {showAddModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-5"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setShowAddModal(false)}
                >
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">{t('compliance_add_event')}</h3>
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="rounded p-1 text-gray-400 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('compliance_event_title')} *</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))}
                                    placeholder={isBn ? 'যেমন: মাসিক ভ্যাট রিটার্ন' : 'e.g. Monthly VAT Return'}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]/20"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('compliance_event_date')} *</label>
                                <input
                                    type="date"
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent((p) => ({ ...p, date: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]/20"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('compliance_event_type')}</label>
                                <select
                                    value={newEvent.type}
                                    onChange={(e) => setNewEvent((p) => ({ ...p, type: e.target.value as ComplianceEvent['type'] }))}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]/20"
                                >
                                    <option value="tax">{t('compliance_type_tax')}</option>
                                    <option value="license">{t('compliance_type_license')}</option>
                                    <option value="registration">{t('compliance_type_registration')}</option>
                                    <option value="other">{t('compliance_type_other')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('compliance_event_note')}</label>
                                <textarea
                                    value={newEvent.note}
                                    onChange={(e) => setNewEvent((p) => ({ ...p, note: e.target.value }))}
                                    placeholder={isBn ? 'ঐচ্ছিক বিবরণ' : 'Optional note'}
                                    rows={3}
                                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]/20"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    {t('btn_cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddEvent}
                                    disabled={!newEvent.title.trim() || !newEvent.date}
                                    className="rounded-lg bg-[#046ca9] px-4 py-2 text-sm font-medium text-white hover:bg-[#034d79] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {t('btn_save')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
