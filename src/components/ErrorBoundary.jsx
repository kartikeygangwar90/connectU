import React from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in child component tree and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render shows fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console (could also send to error tracking service)
        console.error('Error Boundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });

        // TODO: Send to error tracking service like Sentry
        // if (typeof Sentry !== 'undefined') {
        //   Sentry.captureException(error, { extra: errorInfo });
        // }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI based on variant
            const { variant = 'page', fallback } = this.props;

            // If custom fallback provided, use it
            if (fallback) {
                return fallback;
            }

            // Inline error for smaller components
            if (variant === 'inline') {
                return (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '0.5rem',
                        color: '#ef4444',
                        textAlign: 'center'
                    }}>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                            Something went wrong loading this section.
                        </p>
                        <button
                            onClick={this.handleRetry}
                            style={{
                                marginTop: '0.5rem',
                                padding: '0.4rem 1rem',
                                background: 'transparent',
                                border: '1px solid #ef4444',
                                borderRadius: '0.25rem',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                );
            }

            // Full page error (default)
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '50vh',
                    padding: '2rem',
                    textAlign: 'center',
                    background: '#000',
                    color: 'white'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        fontSize: '2.5rem'
                    }}>
                        ⚠️
                    </div>

                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        marginBottom: '0.5rem',
                        color: 'white'
                    }}>
                        Oops! Something went wrong
                    </h2>

                    <p style={{
                        color: '#a1a1aa',
                        marginBottom: '1.5rem',
                        maxWidth: '400px',
                        lineHeight: '1.6'
                    }}>
                        We encountered an unexpected error. Don't worry, our team has been notified.
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={this.handleRetry}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'white',
                                color: 'black',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '0.95rem'
                            }}
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'transparent',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.95rem'
                            }}
                        >
                            Go Home
                        </button>
                    </div>

                    {/* Show error details in development */}
                    {import.meta.env.DEV && this.state.error && (
                        <details style={{
                            marginTop: '2rem',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '0.5rem',
                            textAlign: 'left',
                            maxWidth: '600px',
                            width: '100%'
                        }}>
                            <summary style={{
                                cursor: 'pointer',
                                color: '#ef4444',
                                marginBottom: '0.5rem'
                            }}>
                                Error Details (Dev Only)
                            </summary>
                            <pre style={{
                                fontSize: '0.75rem',
                                overflow: 'auto',
                                color: '#fca5a5',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}>
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
