import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    isPushSupported,
    getNotificationPermission,
    initializePushNotifications
} from '../utils/notificationService';
import toast from 'react-hot-toast';

/**
 * Non-intrusive notification permission prompt
 * Shows after user logs in, can be dismissed
 */
const NotificationPrompt = ({ onComplete }) => {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if we should show the prompt
        const shouldShow = () => {
            // Don't show if not supported
            if (!isPushSupported()) return false;

            // Don't show if already granted or denied
            const permission = getNotificationPermission();
            if (permission !== 'default') return false;

            // Don't show if user previously dismissed
            const dismissed = localStorage.getItem('notification_prompt_dismissed');
            if (dismissed) return false;

            return true;
        };

        // Delay showing prompt for better UX
        const timer = setTimeout(() => {
            if (shouldShow()) {
                setShow(true);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleEnable = async () => {
        setLoading(true);
        try {
            const success = await initializePushNotifications();
            if (success) {
                toast.success('Notifications enabled! You\'ll be notified of team updates.');
                setShow(false);
                onComplete?.(true);
            } else {
                toast.error('Could not enable notifications. Please try again.');
            }
        } catch (error) {
            console.error('Error enabling notifications:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem('notification_prompt_dismissed', 'true');
        setShow(false);
        onComplete?.(false);
    };

    if (!show) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '1.5rem',
                right: '1.5rem',
                background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                padding: '1.25rem',
                maxWidth: '320px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                zIndex: 9000,
                animation: 'slideUp 0.3s ease-out'
            }}
            role="dialog"
            aria-labelledby="notification-prompt-title"
        >
            <style>
                {`
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
            </style>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🔔</span>
                <div style={{ flex: 1 }}>
                    <h4
                        id="notification-prompt-title"
                        style={{
                            margin: '0 0 0.5rem 0',
                            color: 'white',
                            fontSize: '0.95rem',
                            fontWeight: 600
                        }}
                    >
                        Stay Updated
                    </h4>
                    <p style={{
                        margin: 0,
                        color: '#a1a1aa',
                        fontSize: '0.85rem',
                        lineHeight: 1.5
                    }}>
                        Get notified when someone requests to join your team or responds to your requests.
                    </p>
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginTop: '1rem',
                justifyContent: 'flex-end'
            }}>
                <button
                    onClick={handleDismiss}
                    style={{
                        padding: '0.5rem 1rem',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '0.5rem',
                        color: '#a1a1aa',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                    }}
                >
                    Not Now
                </button>
                <button
                    onClick={handleEnable}
                    disabled={loading}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#3b82f6',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        cursor: loading ? 'wait' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Enabling...' : 'Enable'}
                </button>
            </div>
        </div>
    );
};

NotificationPrompt.propTypes = {
    onComplete: PropTypes.func
};

export default NotificationPrompt;
