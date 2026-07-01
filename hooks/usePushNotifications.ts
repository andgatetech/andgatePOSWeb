'use client';

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useSubscribeToPushMutation, useUnsubscribeFromPushMutation } from '@/store/features/notification/notificationApi';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export function usePushNotifications() {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const subscribedRef = useRef(false);

    const [subscribeToPush] = useSubscribeToPushMutation();
    const [unsubscribeFromPush] = useUnsubscribeFromPushMutation();

    useEffect(() => {
        if (!isAuthenticated) return;
        if (subscribedRef.current) return;
        if (!VAPID_PUBLIC_KEY) return;
        if (typeof window === 'undefined') return;
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

        subscribedRef.current = true;

        (async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') return;

                const registration = await navigator.serviceWorker.ready;

                // Re-use existing subscription if already subscribed
                let subscription = await registration.pushManager.getSubscription();

                if (!subscription) {
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                    });
                }

                const json = subscription.toJSON();
                if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

                await subscribeToPush({
                    endpoint:   json.endpoint,
                    public_key: json.keys.p256dh,
                    auth_token: json.keys.auth,
                });
            } catch (err) {
                // Non-fatal — in-app notifications still work
                console.warn('[PushNotifications] subscribe failed:', err);
            }
        })();
    }, [isAuthenticated, subscribeToPush]);

    const unsubscribe = async () => {
        try {
            if (!('serviceWorker' in navigator)) return;
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (!subscription) return;

            await unsubscribeFromPush({ endpoint: subscription.endpoint });
            await subscription.unsubscribe();
            subscribedRef.current = false;
        } catch (err) {
            console.warn('[PushNotifications] unsubscribe failed:', err);
        }
    };

    return { unsubscribe };
}
