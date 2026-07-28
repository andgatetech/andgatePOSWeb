import assert from 'node:assert/strict';
import test from 'node:test';
import { canManageIncomeVoid, canVoidIncome } from './incomeVoidReversal.ts';

test('business admins can void income in their selected store without an explicit permission', () => {
    assert.equal(canManageIncomeVoid({ role: 'business_admin', permissions: [] }), true);
});

test('staff need accounting.income.delete to void income', () => {
    assert.equal(canManageIncomeVoid({ role: 'staff', permissions: ['accounting.income.delete'] }), true);
    assert.equal(canManageIncomeVoid({ role: 'staff', permissions: ['accounting.income.create'] }), false);
});

test('void action is hidden for income that is already voided', () => {
    assert.equal(canVoidIncome({ status: 'voided' }), false);
    assert.equal(canVoidIncome({ voided_at: '2026-07-29T10:00:00Z' }), false);
    assert.equal(canVoidIncome({ status: 'posted' }), true);
});
