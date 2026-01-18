import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import toast from 'react-hot-toast';

const PWAUpdatePrompt = () => {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, r) {
            console.log('SW Registered:', swUrl);
            // Check for updates every 60 seconds (increased from 30)
            if (r) {
                setInterval(() => {
                    r.update();
                }, 60 * 1000);
            }
        },
        onRegisterError(error) {
            console.log('SW registration error:', error);
        },
    });

    const handleUpdate = async () => {
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
    };

    useEffect(() => {
        if (needRefresh) {
            toast(
                (t) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>🔄 New version available!</span>
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
                            Update
                        </button>
                    </div>
                ),
                {
                    duration: Infinity,
                    id: 'pwa-update',
                    position: 'top-center', // Moved to top as requested
                }
            );
        }
    }, [needRefresh, updateServiceWorker]);

    // Removed the persistent banner as requested, only using Toast now.

    return null;
};

export default PWAUpdatePrompt;
