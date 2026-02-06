import { useEffect, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import toast from 'react-hot-toast';

const PWAUpdatePrompt = () => {
    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, r) {

            // Check for updates every 60 seconds
            if (r) {
                // Check immediately

                r.update().catch(err => console.error('[PWA] Update check error:', err));
                // Then check periodically
                setInterval(() => {

                    r.update().catch(err => console.error('[PWA] Update check error:', err));
                }, 60 * 1000);
            }
        },
        onRegisterError(error) {
            console.error('[PWA] SW registration error:', error);
        },
    });

    const handleUpdate = useCallback(async () => {
        if ('serviceWorker' in navigator) {
            // Wait for the controlling service worker to change
            // This is the reliable signal that the new SW has taken over
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });

            // Send the skip waiting message
            updateServiceWorker(true);
        } else {
            // Fallback for weird edge cases or dev environment
            updateServiceWorker(true);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }, [updateServiceWorker]);

    useEffect(() => {
        if (needRefresh) {

            toast(
                (t) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 500 }}>🔄 New version available!</span>
                        <button
                            onClick={() => {

                                handleUpdate();
                                toast.dismiss(t.id);
                            }}
                            style={{
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Update Now
                        </button>
                    </div>
                ),
                {
                    duration: Infinity,
                    id: 'pwa-update',
                    position: 'top-center',
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '2px solid #3b82f6',
                        padding: '16px',
                        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)',
                    },
                }
            );
        }
    }, [needRefresh, updateServiceWorker, handleUpdate]);

    // Removed the persistent banner as requested, only using Toast now.

    return null;
};

export default PWAUpdatePrompt;
