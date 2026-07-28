import assert from 'node:assert/strict';
import test from 'node:test';
import {
    canManageOrderDeletion,
    canVoidOrder,
} from './orderDeletion.ts';

test('business admins can manage order voiding without an explicit delete permission', () => {
    assert.equal(canManageOrderDeletion({ role: 'business_admin', permissions: [] }), true);
});

test('non-admins need the orders delete permission to manage order voiding', () => {
    assert.equal(canManageOrderDeletion({ role: 'manager', permissions: ['orders.delete'] }), true);
    assert.equal(canManageOrderDeletion({ role: 'manager', permissions: ['orders.view'] }), false);
});

test('orders with returns cannot be voided regardless of return response shape', () => {
    assert.equal(canVoidOrder({ returns: { has_returns: true } }), false);
    assert.equal(canVoidOrder({ returns: { total_returned: 1 } }), false);
    assert.equal(canVoidOrder({ returns: [{ id: 1 }] }), false);
    assert.equal(canVoidOrder({ has_returns: true }), false);
    assert.equal(canVoidOrder({ return_status: 'partial' }), false);
    assert.equal(canVoidOrder({ status: 'fully_returned' }), false);
});

test('completed orders without returns can be voided', () => {
    assert.equal(canVoidOrder({ status: 'completed', returns: { has_returns: false, total_returned: 0 } }), true);
});

test('already voided orders cannot be voided again', () => {
    assert.equal(canVoidOrder({ status: 'voided' }), false);
});
