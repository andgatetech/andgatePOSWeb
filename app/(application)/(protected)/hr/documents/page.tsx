'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { resolveStorageUrl } from '@/lib/image-url';
import { showMessage } from '@/lib/toast';
import { useGetEmployeeDocumentQuery, useUploadEmployeeDocumentMutation } from '@/store/features/hr/employeeDocumentApi';
import { useGetStaffMemberQuery } from '@/store/features/store/storeApi';
import { FileText, IdCard, Image as ImageIcon, UserSquare } from 'lucide-react';
import { useState } from 'react';

export default function EmployeeDocumentsPage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [nidNumber, setNidNumber] = useState('');

    const { data: membersData } = useGetStaffMemberQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const { data: docData, refetch } = useGetEmployeeDocumentQuery(
        { userId: selectedUserId as number, store_id: currentStoreId },
        { skip: !selectedUserId || !currentStoreId }
    );
    const [upload, { isLoading: uploading }] = useUploadEmployeeDocumentMutation();

    const members = membersData?.data?.data || membersData?.data || [];
    const document = docData?.data?.document;

    const handleUpload = async (field: 'nid_front' | 'nid_back' | 'photo' | 'contract', file: File) => {
        if (!selectedUserId) return;
        const formData = new FormData();
        formData.append(field, file);
        if (nidNumber) formData.append('nid_number', nidNumber);
        formData.append('store_id', String(currentStoreId));
        try {
            await upload({ userId: selectedUserId, formData }).unwrap();
            refetch();
            showMessage(t('document_uploaded'), 'success');
        } catch {
            showMessage(t('msg_error_generic'), 'error');
        }
    };

    return (
        <div className="space-y-5 p-4 sm:p-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                    <IdCard className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('document_title')}</h1>
                    <p className="text-sm text-gray-500">{t('document_desc')}</p>
                </div>
            </div>

            <select
                className="w-full max-w-sm rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary"
                value={selectedUserId ?? ''}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
            >
                <option value="">{t('document_select_staff')}</option>
                {members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>

            {selectedUserId && (
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-gray-500">{t('document_nid_number')}</label>
                        <input
                            type="text"
                            className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm"
                            value={nidNumber || document?.nid_number || ''}
                            onChange={(e) => setNidNumber(e.target.value)}
                        />
                    </div>

                    {([
                        { field: 'nid_front' as const, label: t('document_nid_front'), path: document?.nid_front_path, icon: <IdCard className="h-5 w-5" /> },
                        { field: 'nid_back' as const, label: t('document_nid_back'), path: document?.nid_back_path, icon: <IdCard className="h-5 w-5" /> },
                        { field: 'photo' as const, label: t('document_photo'), path: document?.photo_path, icon: <UserSquare className="h-5 w-5" /> },
                    ]).map((item) => (
                        <div key={item.field} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center gap-2">
                                {item.icon}
                                <h3 className="text-sm font-semibold text-gray-700">{item.label}</h3>
                            </div>
                            {item.path ? (
                                <img src={resolveStorageUrl(item.path)} alt={item.label} className="mb-3 h-32 w-full rounded-lg object-cover" />
                            ) : (
                                <div className="mb-3 flex h-32 w-full items-center justify-center rounded-lg bg-gray-50">
                                    <ImageIcon className="h-8 w-8 text-gray-300" />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                disabled={uploading}
                                onChange={(e) => e.target.files?.[0] && handleUpload(item.field, e.target.files[0])}
                                className="block w-full text-xs text-gray-500"
                            />
                        </div>
                    ))}

                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            <h3 className="text-sm font-semibold text-gray-700">{t('document_contract')}</h3>
                        </div>
                        {document?.contract_path ? (
                            <a href={resolveStorageUrl(document.contract_path)} target="_blank" rel="noreferrer" className="mb-3 block text-sm text-primary underline">
                                {t('document_view_contract')}
                            </a>
                        ) : (
                            <p className="mb-3 text-xs text-gray-400">{t('document_no_contract')}</p>
                        )}
                        <input
                            type="file"
                            accept="application/pdf"
                            disabled={uploading}
                            onChange={(e) => e.target.files?.[0] && handleUpload('contract', e.target.files[0])}
                            className="block w-full text-xs text-gray-500"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
