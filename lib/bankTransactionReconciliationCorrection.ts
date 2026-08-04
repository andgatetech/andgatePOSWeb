export interface BankTransactionCorrectionUser {
    role?: string | null;
    permissions?: string[] | null;
}

export interface BankTransactionCorrectionCandidate {
    status?: string | null;
    journal_header_id?: number | null;
    correction_transaction_id?: number | null;
}

/** The server leaves corrections cleared because statement/batch reconciliation is not durable yet. */
export const canManageBankTransactionCorrection = (user?: BankTransactionCorrectionUser | null): boolean =>
    user?.role === 'business_admin' || user?.permissions?.includes('accounting.cash-book.reconciliation-correct') === true;

export const canCorrectReconciledBankTransaction = (transaction: BankTransactionCorrectionCandidate): boolean =>
    transaction.status === 'reconciled' && !!transaction.journal_header_id && !transaction.correction_transaction_id;
