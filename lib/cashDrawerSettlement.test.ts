import assert from 'node:assert/strict';
import test from 'node:test';
import { canSettleClosedDrawerSession, getEligibleSettlementAccounts } from './cashDrawerSettlement.ts';

test('settlement is gated to permitted, closed, unsettled sessions', () => {
    assert.equal(canSettleClosedDrawerSession({ status: 'open' }, true), false);
    assert.equal(canSettleClosedDrawerSession({ status: 'closed' }, false), false);
    assert.equal(canSettleClosedDrawerSession({ status: 'closed' }, true), true);
});

test('settlement destinations include cash and active bank COA accounts only', () => {
    const eligible = getEligibleSettlementAccounts([
        { id: 1, type: 'asset', subtype: 'cash', normal_balance: 'debit', is_cash_account: true, is_active: true },
        { id: 2, type: 'asset', subtype: 'bank', normal_balance: 'debit', is_cash_account: true, is_active: true },
        { id: 3, type: 'asset', subtype: 'bank', normal_balance: 'debit', is_cash_account: true, is_active: true },
        { id: 4, type: 'asset', subtype: 'clearing', normal_balance: 'debit', is_cash_account: true, is_active: true },
    ], [{ coa_account_id: 2, is_active: true }, { coa_account_id: 3, is_active: false }]);

    assert.deepEqual(eligible.map((account) => account.id), [1, 2]);
});
