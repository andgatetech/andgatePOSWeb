export interface IncomeVoidUser {
    role?: string | null;
    permissions?: string[] | null;
}

export interface IncomeVoidCandidate {
    status?: string | null;
    voided_at?: string | null;
}

export const canManageIncomeVoid = (user?: IncomeVoidUser | null): boolean =>
    user?.role === 'business_admin' || user?.permissions?.includes('accounting.income.delete') === true;

export const canVoidIncome = (income: IncomeVoidCandidate): boolean =>
    income.status !== 'voided' && !income.voided_at;
