import assert from 'node:assert/strict';
import test from 'node:test';
import {
    canManagePurchaseOrderDeletion,
    getPurchaseOrderDeletionAction,
} from './purchaseOrderDeletion.ts';

test('business owners can manage purchase-order deletion without an explicit delete permission', () => {
    assert.equal(canManagePurchaseOrderDeletion({ role: 'business_admin', permissions: [] }), true);
});

test('non-owners need the purchase-order delete permission to manage deletion', () => {
    assert.equal(canManagePurchaseOrderDeletion({ role: 'manager', permissions: ['purchase-orders.delete'] }), true);
    assert.equal(canManagePurchaseOrderDeletion({ role: 'manager', permissions: ['purchase-orders.view'] }), false);
});

test('unreceived and unpaid purchase orders use the existing delete action', () => {
    assert.equal(
        getPurchaseOrderDeletionAction({ status: 'ordered', payment_status: 'pending', amount_paid: 0 }),
        'delete'
    );
});

test('received purchase orders use the delete-and-reverse action', () => {
    assert.equal(
        getPurchaseOrderDeletionAction({ status: 'received', payment_status: 'pending', amount_paid: 0 }),
        'void'
    );
});

test('cancelled purchase orders do not offer a second delete or reverse action', () => {
    assert.equal(
        getPurchaseOrderDeletionAction({ status: 'cancelled', payment_status: 'pending', amount_paid: 0 }),
        null
    );
});

test('paid purchase orders use the delete-and-reverse action even when stock has not been received', () => {
    assert.equal(
        getPurchaseOrderDeletionAction({ status: 'ordered', payment_status: 'paid', amount_paid: 100 }),
        'void'
    );
});
