export interface BankTransactionVoidUser {
    role?: string | null;
    permissions?: string[] | null;
}

export interface BankTransactionVoidCandidate {
    status?: string | null;
    journal_header_id?: number | null;
    voided_at?: string | null;
    reversal_transaction_id?: number | null;
}

/** Mirrors the server policy: only a posted, unreconciled source is reversible. */
export const canManageBankTransactionVoid = (user?: BankTransactionVoidUser | null): boolean =>
    user?.role === 'business_admin' || user?.permissions?.includes('accounting.cash-book.void') === true;

export const canVoidBankTransaction = (transaction: BankTransactionVoidCandidate): boolean =>
    transaction.status === 'cleared'
    && !!transaction.journal_header_id
    && !transaction.voided_at
    && !transaction.reversal_transaction_id;
