import assert from 'node:assert/strict';
import test from 'node:test';
import { canManageBankTransactionVoid, canVoidBankTransaction } from './bankTransactionVoidReversal.ts';

test('business admins can void bank transactions in their selected store without an explicit permission', () => {
    assert.equal(canManageBankTransactionVoid({ role: 'business_admin', permissions: [] }), true);
});

test('staff need the explicit bank transaction void permission', () => {
    assert.equal(canManageBankTransactionVoid({ role: 'staff', permissions: ['accounting.cash-book.void'] }), true);
    assert.equal(canManageBankTransactionVoid({ role: 'staff', permissions: ['accounting.cash-book.edit'] }), false);
});

test('only posted unreconciled transactions can be voided from the UI', () => {
    assert.equal(canVoidBankTransaction({ status: 'cleared', journal_header_id: 3 }), true);
    assert.equal(canVoidBankTransaction({ status: 'pending', journal_header_id: null }), false);
    assert.equal(canVoidBankTransaction({ status: 'reconciled', journal_header_id: 3 }), false);
    assert.equal(canVoidBankTransaction({ status: 'voided', journal_header_id: 3 }), false);
});
