import assert from 'node:assert/strict';
import test from 'node:test';
import { canManageExpenseVoid, canVoidExpense } from './expenseVoidReversal.ts';

test('business admins can void expenses without an explicit permission', () => {
    assert.equal(canManageExpenseVoid({ role: 'business_admin', permissions: [] }), true);
});

test('staff need the explicit expenses.delete permission to void an expense', () => {
    assert.equal(canManageExpenseVoid({ role: 'staff', permissions: ['expenses.delete'] }), true);
    assert.equal(canManageExpenseVoid({ role: 'staff', permissions: ['expenses.edit'] }), false);
});

test('void action is hidden for already voided expenses', () => {
    assert.equal(canVoidExpense({ status: 'voided' }), false);
    assert.equal(canVoidExpense({ voided_at: '2026-07-29T10:00:00Z' }), false);
    assert.equal(canVoidExpense({ status: 'posted' }), true);
});
