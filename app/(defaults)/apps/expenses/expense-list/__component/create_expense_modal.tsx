'use client';

import { useCreateExpenseMutation } from '@/store/features/expense/expenseApi';
import { useAllStoresQuery } from '@/store/features/store/storeApi';
import { Button, Group, Modal, NumberInput, Select, Textarea, TextInput } from '@mantine/core';
import { DollarSign, FileText, Store, X, Plus } from 'lucide-react';
import { useState } from 'react';

interface Props {
    opened: boolean;
    onClose: () => void;
}

const CreateExpenseModal: React.FC<Props> = ({ opened, onClose }) => {
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [debit, setDebit] = useState<number | undefined>();
    const [storeId, setStoreId] = useState<number | undefined>();
    const { data: storesData } = useAllStoresQuery();
    const [createExpense, { isLoading }] = useCreateExpenseMutation();

    const handleSubmit = async () => {
        if (!title || !debit) return;

        try {
            await createExpense({ title, notes, debit, store_id: storeId }).unwrap();
            setTitle('');
            setNotes('');
            setDebit(undefined);
            setStoreId(undefined);
            onClose();
        } catch (error) {
            console.error('Failed to create expense:', error);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Create New Expense"
            centered
            size="md"
            styles={{
                header: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '8px 8px 0 0',
                    padding: '20px 24px',
                    fontSize: '18px',
                    fontWeight: '600',
                },
                body: {
                    padding: '24px',
                    background: '#fafafa',
                },
                content: {
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e1e5e9',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                },
            }}
        >
            <div className="space-y-4">
                <div className="relative">
                    <TextInput
                        label="Expense Title"
                        placeholder="Enter expense title"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.currentTarget.value)}
                        styles={{
                            label: {
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '6px',
                            },
                            input: {
                                borderRadius: '8px',
                                border: '2px solid #e5e7eb',
                                padding: '12px 16px 12px 44px',
                                fontSize: '14px',
                                transition: 'all 0.2s ease',
                                '&:focus': {
                                    borderColor: '#667eea',
                                    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                },
                            },
                        }}
                    />
                    <FileText className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
                </div>

                <div className="relative">
                    <Textarea
                        label="Notes"
                        placeholder="Add optional notes"
                        value={notes}
                        onChange={(e) => setNotes(e.currentTarget.value)}
                        minRows={3}
                        styles={{
                            label: {
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '6px',
                            },
                            input: {
                                borderRadius: '8px',
                                border: '2px solid #e5e7eb',
                                padding: '12px 16px',
                                fontSize: '14px',
                                transition: 'all 0.2s ease',
                                '&:focus': {
                                    borderColor: '#667eea',
                                    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                },
                            },
                        }}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="relative">
                        <NumberInput
                            label="Amount"
                            placeholder="0.00"
                            required
                            value={debit}
                            onChange={setDebit}
                            precision={2}
                            styles={{
                                label: {
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '6px',
                                },
                                input: {
                                    borderRadius: '8px',
                                    border: '2px solid #e5e7eb',
                                    padding: '12px 16px 12px 44px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    '&:focus': {
                                        borderColor: '#667eea',
                                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                    },
                                },
                            }}
                        />
                        <DollarSign className="absolute left-3 top-9 h-4 w-4 text-green-500" />
                    </div>

                    <div className="relative">
                        <Select
                            label="Store"
                            placeholder="Select a store"
                            data={
                                storesData?.data?.map((store: any) => ({
                                    value: store.id.toString(),
                                    label: store.store_name,
                                })) || []
                            }
                            value={storeId?.toString() || ''}
                            onChange={(value) => setStoreId(Number(value))}
                            styles={{
                                label: {
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '6px',
                                },
                                input: {
                                    borderRadius: '8px',
                                    border: '2px solid #e5e7eb',
                                    padding: '12px 16px 12px 44px',
                                    fontSize: '14px',
                                    transition: 'all 0.2s ease',
                                    '&:focus': {
                                        borderColor: '#667eea',
                                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                    },
                                },
                                dropdown: {
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        />
                        <Store className="absolute left-3 top-9 h-4 w-4 text-purple-500" />
                    </div>
                </div>
            </div>

            <Group position="right" mt="xl" className="border-t border-gray-200 pt-4">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-600 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                >
                    <X className="h-4 w-4" />
                    Cancel
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={!title || !debit || isLoading}
                    className="flex transform items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2.5 font-medium text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-blue-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Plus className="h-4 w-4" />}
                    {isLoading ? 'Creating...' : 'Create Expense'}
                </button>
            </Group>
        </Modal>
    );
};

export default CreateExpenseModal;
