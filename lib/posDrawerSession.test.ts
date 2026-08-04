import assert from 'node:assert/strict';
import test from 'node:test';
import { getOpenPosDrawerSessions, isOpenPosDrawerSession } from './posDrawerSession.ts';

test('normalizes only open sessions belonging to the selected store', () => {
    const sessions = getOpenPosDrawerSessions(
        [
            { id: 1, name: 'Main', store_id: 10, sessions: [{ id: 101, status: 'open' }, { id: 102, status: 'closed' }] },
            { id: 2, name: 'Other store', store_id: 11, sessions: [{ id: 201, status: 'open' }] },
        ],
        10
    );

    assert.deepEqual(sessions, [{ id: 101, drawerName: 'Main', status: 'open', storeId: 10 }]);
});

test('rejects missing, closed, and foreign session ids', () => {
    const sessions = [{ id: 101, drawerName: 'Main', status: 'open', storeId: 10 }];

    assert.equal(isOpenPosDrawerSession(sessions, 101), true);
    assert.equal(isOpenPosDrawerSession(sessions, ''), false);
    assert.equal(isOpenPosDrawerSession(sessions, 102), false);
});
