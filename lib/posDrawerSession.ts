export interface PosDrawerSession {
    id: number;
    drawerName: string;
    status: string;
    storeId: number;
}

/**
 * The drawer index endpoint returns active drawers with their latest open
 * session. Keep the response normalization in one place so checkout never
 * treats a closed or differently-scoped session as selectable.
 */
export const getOpenPosDrawerSessions = (drawers: any[], storeId: number): PosDrawerSession[] => {
    if (!Array.isArray(drawers) || !storeId) return [];

    return drawers.flatMap((drawer) => {
        const drawerStoreId = Number(drawer?.store_id ?? drawer?.storeId);
        if (!drawer || drawerStoreId !== Number(storeId)) return [];

        const sessions = Array.isArray(drawer.sessions) ? drawer.sessions : [];
        return sessions
            .filter((session: any) => String(session?.status || '').toLowerCase() === 'open' && Number(session?.id) > 0)
            .map((session: any) => ({
                id: Number(session.id),
                drawerName: String(drawer.name || drawer.id || ''),
                status: 'open',
                storeId: drawerStoreId,
            }));
    });
};

export const isOpenPosDrawerSession = (sessions: PosDrawerSession[], sessionId: number | string | null | undefined): boolean => {
    const normalizedId = Number(sessionId);
    return normalizedId > 0 && sessions.some((session) => session.id === normalizedId && session.status === 'open');
};
