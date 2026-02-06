import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.map(toast =>
            toast.id === id ? { ...toast, exiting: true } : toast
        ));

        // Remove after animation
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 200);
    }, []);

    const showToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
        const id = Date.now() + Math.random();
        const newToast = { id, type, title, message };

        setToasts(prev => [...prev, newToast]);

        // Auto dismiss
        setTimeout(() => {
            dismissToast(id);
        }, duration);

        return id;
    }, [dismissToast]);

    // Convenience methods
    const success = useCallback((title, message) => {
        return showToast({ type: 'success', title, message });
    }, [showToast]);

    const error = useCallback((title, message) => {
        return showToast({ type: 'error', title, message });
    }, [showToast]);

    const info = useCallback((title, message) => {
        return showToast({ type: 'info', title, message });
    }, [showToast]);

    const warning = useCallback((title, message) => {
        return showToast({ type: 'warning', title, message });
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, dismissToast, success, error, info, warning }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            case 'info':
            default: return 'ℹ';
        }
    };

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : ''}`}
                >
                    <div className="toast-icon">
                        {getIcon(toast.type)}
                    </div>
                    <div className="toast-content">
                        <div className="toast-title">{toast.title}</div>
                        {toast.message && <div className="toast-message">{toast.message}</div>}
                    </div>
                    <button className="toast-close" onClick={() => onDismiss(toast.id)}>
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastProvider;
