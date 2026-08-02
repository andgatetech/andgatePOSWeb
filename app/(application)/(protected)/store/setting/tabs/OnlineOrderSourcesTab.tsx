'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Globe, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    useGetOnlineOrderSourcesQuery,
    useCreateOnlineOrderSourceMutation,
    useUpdateOnlineOrderSourceMutation,
    useDeleteOnlineOrderSourceMutation
} from '@/store/features/ecommerce/ecommerceManagementApi';

export default function OnlineOrderSourcesTab() {
    const { data: sourcesData, isLoading } = useGetOnlineOrderSourcesQuery(undefined);
    const [createSource] = useCreateOnlineOrderSourceMutation();
    const [updateSource] = useUpdateOnlineOrderSourceMutation();
    const [deleteSource] = useDeleteOnlineOrderSourceMutation();

    const sources = sourcesData?.data || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', type: 'other', is_active: true });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenModal = (source?: any) => {
        if (source) {
            setEditingSource(source);
            setFormData({ name: source.name, type: source.type || 'other', is_active: source.is_active });
        } else {
            setEditingSource(null);
            setFormData({ name: '', type: 'other', is_active: true });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSource(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.error('Name is required');

        setIsSubmitting(true);
        try {
            if (editingSource) {
                await updateSource({ id: editingSource.id, ...formData }).unwrap();
                toast.success('Source updated successfully');
            } else {
                await createSource(formData).unwrap();
                toast.success('Source created successfully');
            }
            handleCloseModal();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to save source');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this source?')) return;
        try {
            await deleteSource(id).unwrap();
            toast.success('Source deleted successfully');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to delete source');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Online Order Sources</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage the sources (e.g. Facebook, WhatsApp, Web) for your ecommerce orders.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#046ca9] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#034d79]"
                >
                    <Plus size={16} />
                    Add Source
                </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Loading sources...</div>
                ) : sources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                        <Globe size={48} className="mb-4 text-slate-300" />
                        <p className="text-base font-medium text-slate-900">No order sources found</p>
                        <p className="mt-1 text-sm">Add your first source to start tracking where orders come from.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Name</th>
                                    <th className="px-6 py-4 font-semibold">Type</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sources.map((source: any) => (
                                    <tr key={source.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{source.name}</div>
                                            <div className="text-xs text-slate-500">Slug: {source.slug}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 capitalize">
                                                {source.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {source.is_active ? (
                                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(source)}
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[#046ca9] transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(source.id)}
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-slate-900">
                                {editingSource ? 'Edit Source' : 'Add Source'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Source Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Facebook Page"
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-[#046ca9] focus:ring-1 focus:ring-[#046ca9] transition"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-[#046ca9] focus:ring-1 focus:ring-[#046ca9] bg-white transition"
                                >
                                    <option value="social">Social Media</option>
                                    <option value="web">Website</option>
                                    <option value="app">Mobile App</option>
                                    <option value="referral">Referral</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="h-4 w-4 rounded border-slate-300 text-[#046ca9] focus:ring-[#046ca9]"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                                    Active (Available for new orders)
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#046ca9] rounded-lg hover:bg-[#034d79] transition disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Source'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
