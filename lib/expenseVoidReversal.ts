export interface ExpenseVoidUser {
    role?: string | null;
    permissions?: string[] | null;
}

export interface ExpenseVoidCandidate {
    status?: string | null;
    voided_at?: string | null;
}

export const canManageExpenseVoid = (user?: ExpenseVoidUser | null): boolean =>
    user?.role === 'business_admin' || user?.permissions?.includes('expenses.delete') === true;

export const canVoidExpense = (expense: ExpenseVoidCandidate): boolean =>
    expense.status !== 'voided' && !expense.voided_at;
