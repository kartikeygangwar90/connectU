/**
 * Push Notification Service
 * Handles FCM token management and notification permissions
 */

import { getMessagingInstance, dataBase, auth } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// VAPID key from Firebase Console (Cloud Messaging > Web Push certificates)
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Check if push notifications are supported in this browser
 */
export const isPushSupported = () => {
    return (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window
    );
};

/**
 * Get current notification permission status
 * @returns {'granted' | 'denied' | 'default'}
 */
export const getNotificationPermission = () => {
    if (!isPushSupported()) return 'denied';
    return Notification.permission;
};

/**
 * Request notification permission from user
 * @returns {Promise<boolean>} true if permission granted
 */
export const requestNotificationPermission = async () => {
    if (!isPushSupported()) {
        console.warn('Push notifications are not supported in this browser');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
};

/**
 * Get FCM token for this device
 * @returns {Promise<string|null>} FCM token or null if unavailable
 */
export const getFCMToken = async () => {
    if (!isPushSupported()) return null;
    if (Notification.permission !== 'granted') return null;

    try {
        const messaging = await getMessagingInstance();
        if (!messaging) return null;

        const { getToken } = await import('firebase/messaging');

        if (!VAPID_KEY) {
            console.warn('VAPID key not configured. Add VITE_FIREBASE_VAPID_KEY to .env');
            return null;
        }

        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

/**
 * Save FCM token to user's Firestore document
 * @param {string} token - FCM token to save
 */
export const saveFCMToken = async (token) => {
    if (!token || !auth.currentUser) return;

    try {
        const userRef = doc(dataBase, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
            fcmTokens: arrayUnion(token),
            notificationsEnabled: true,
            lastTokenUpdate: new Date().toISOString()
        });
        console.log('FCM token saved successfully');
    } catch (error) {
        console.error('Error saving FCM token:', error);
    }
};

/**
 * Remove FCM token from user's document (e.g., on logout)
 * @param {string} token - FCM token to remove
 */
export const removeFCMToken = async (token) => {
    if (!token || !auth.currentUser) return;

    try {
        const userRef = doc(dataBase, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
            fcmTokens: arrayRemove(token)
        });
    } catch (error) {
        console.error('Error removing FCM token:', error);
    }
};

/**
 * Initialize push notifications for the current user
 * Requests permission, gets token, and saves to Firestore
 * @returns {Promise<boolean>} true if setup successful
 */
export const initializePushNotifications = async () => {
    // Request permission
    const granted = await requestNotificationPermission();
    if (!granted) {
        console.log('Notification permission not granted');
        return false;
    }

    // Get FCM token
    const token = await getFCMToken();
    if (!token) {
        console.log('Could not get FCM token');
        return false;
    }

    // Save token to Firestore
    await saveFCMToken(token);
    return true;
};

/**
 * Setup foreground message handler
 * Shows toast notification when message received while app is open
 */
export const setupForegroundHandler = async (onMessage) => {
    try {
        const messaging = await getMessagingInstance();
        if (!messaging) return;

        const { onMessage: onFCMMessage } = await import('firebase/messaging');

        onFCMMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);

            // Call provided handler (e.g., to show toast)
            if (onMessage) {
                onMessage({
                    title: payload.notification?.title || 'New Notification',
                    body: payload.notification?.body || '',
                    data: payload.data
                });
            }
        });
    } catch (error) {
        console.error('Error setting up foreground handler:', error);
    }
};
