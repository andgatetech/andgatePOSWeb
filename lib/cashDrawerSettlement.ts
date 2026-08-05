export type SettlementAccount = {
    id: number;
    type?: string;
    subtype?: string;
    normal_balance?: string;
    is_cash_account?: boolean;
    is_active?: boolean;
};

export type BankSettlementAccount = {
    coa_account_id?: number;
    is_active?: boolean;
};

export const canSettleClosedDrawerSession = (session: any, hasPermission: boolean): boolean =>
    hasPermission && session?.status === 'closed';

export const getEligibleSettlementAccounts = (accounts: SettlementAccount[], bankAccounts: BankSettlementAccount[]): SettlementAccount[] => {
    const activeBankCoaIds = new Set(
        bankAccounts.filter((account) => account.is_active === true).map((account) => Number(account.coa_account_id))
    );

    return accounts.filter((account) => {
        if (account.is_active === false || account.type !== 'asset' || account.normal_balance !== 'debit' || account.is_cash_account !== true) return false;
        if (account.subtype === 'cash') return true;
        return account.subtype === 'bank' && activeBankCoaIds.has(Number(account.id));
    });
};
