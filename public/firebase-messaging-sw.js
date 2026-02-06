/**
 * Firebase Messaging Service Worker
 * Handles background push notifications
 */

/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// Note: This uses compat version for service worker compatibility
firebase.initializeApp({
    apiKey: self.FIREBASE_CONFIG?.apiKey,
    authDomain: self.FIREBASE_CONFIG?.authDomain,
    projectId: self.FIREBASE_CONFIG?.projectId,
    storageBucket: self.FIREBASE_CONFIG?.storageBucket,
    messagingSenderId: self.FIREBASE_CONFIG?.messagingSenderId,
    appId: self.FIREBASE_CONFIG?.appId
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'ConnectU';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: payload.data?.type || 'default',
        data: payload.data,
        actions: getNotificationActions(payload.data?.type),
        requireInteraction: true
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Get notification actions based on type
function getNotificationActions(type) {
    switch (type) {
        case 'join_request':
            return [
                { action: 'view', title: 'View Request' },
                { action: 'dismiss', title: 'Dismiss' }
            ];
        case 'team_invite':
            return [
                { action: 'accept', title: 'Accept' },
                { action: 'decline', title: 'Decline' }
            ];
        default:
            return [
                { action: 'view', title: 'View' }
            ];
    }
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click:', event);
    event.notification.close();

    const data = event.notification.data || {};
    let targetUrl = '/app/profile'; // Default to profile

    // Determine URL based on notification type
    if (data.type === 'join_request' || data.type === 'team_invite') {
        targetUrl = '/app/teams';
    } else if (data.teamId) {
        targetUrl = `/app/teams?team=${data.teamId}`;
    }

    // Handle action buttons
    if (event.action === 'view') {
        targetUrl = data.url || targetUrl;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If app is already open, focus it
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    client.navigate(targetUrl);
                    return;
                }
            }
            // Otherwise open new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
