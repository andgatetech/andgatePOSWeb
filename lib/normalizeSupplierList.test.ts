import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeSupplierList } from './normalizeSupplierList.ts';

test('normalizes the supplier index API payload into an array', () => {
    const suppliers = [{ id: 17, name: 'Acme Supplies' }];

    assert.deepEqual(normalizeSupplierList({ items: suppliers, pagination: { total: 1 } }), suppliers);
});

test('returns an empty array for a malformed supplier payload', () => {
    assert.deepEqual(normalizeSupplierList({ items: { id: 17 } }), []);
});
