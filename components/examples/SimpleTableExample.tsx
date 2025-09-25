'use client';
import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { Edit, Trash2, Users } from 'lucide-react';

// Simple example for basic table usage
const SimpleTableExample = () => {
    // Simple data structure
    const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
        { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Manager' },
    ];

    // Simple columns configuration
    const columns: TableColumn[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        {
            key: 'role',
            label: 'Role',
            render: (value) => (
                <span className={`rounded px-2 py-1 text-sm ${value === 'Admin' ? 'bg-red-100 text-red-800' : value === 'Manager' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {value}
                </span>
            ),
        },
    ];

    // Simple actions
    const actions: TableAction[] = [
        {
            label: 'Edit',
            icon: <Edit className="h-4 w-4" />,
            onClick: (row) => alert(`Edit user: ${row.name}`),
        },
        {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            className: 'bg-red-100 text-red-700 hover:bg-red-200',
            onClick: (row) => alert(`Delete user: ${row.name}`),
        },
    ];

    return (
        <div className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Users Table</h2>

            <ReusableTable
                data={users}
                columns={columns}
                actions={actions}
                emptyState={{
                    icon: <Users className="h-16 w-16" />,
                    title: 'No users found',
                    description: 'Add some users to get started.',
                }}
            />
        </div>
    );
};

export default SimpleTableExample;
