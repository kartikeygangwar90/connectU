import React from 'react';
import PropTypes from 'prop-types';

/**
 * Skeleton loader for the GitHub section
 * Mimics the layout of the GitHubSection component
 */
const SkeletonGitHub = ({ showRepos = true }) => {
    return (
        <div className="teammates--section" style={{
            marginTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '1.5rem'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="skeleton" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                    <div className="skeleton" style={{ width: '120px', height: '24px', borderRadius: '0.5rem' }} />
                </div>
                <div className="skeleton" style={{ width: '120px', height: '32px', borderRadius: '0.5rem' }} />
            </div>

            {/* Profile Stats Row */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '1.5rem'
            }}>
                {/* Avatar + Username Card */}
                <div style={{
                    background: '#0a0a0a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <div className="skeleton" style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        flexShrink: 0
                    }} />
                    <div>
                        <div className="skeleton" style={{ width: '80px', height: '18px', borderRadius: '0.25rem', marginBottom: '0.25rem' }} />
                        <div className="skeleton" style={{ width: '120px', height: '14px', borderRadius: '0.25rem' }} />
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{
                            background: '#0a0a0a',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.75rem',
                            padding: '0.75rem 1rem',
                            textAlign: 'center',
                            minWidth: '80px'
                        }}>
                            <div className="skeleton" style={{ width: '40px', height: '24px', borderRadius: '0.25rem', margin: '0 auto 0.25rem' }} />
                            <div className="skeleton" style={{ width: '50px', height: '12px', borderRadius: '0.25rem', margin: '0 auto' }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Repositories Grid */}
            {showRepos && (
                <>
                    <div className="skeleton" style={{ width: '130px', height: '20px', borderRadius: '0.25rem', marginBottom: '0.75rem' }} />
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '0.75rem'
                    }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{
                                background: '#0a0a0a',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.75rem',
                                padding: '1rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <div className="skeleton" style={{ width: '60%', height: '18px', borderRadius: '0.25rem' }} />
                                    <div className="skeleton" style={{ width: '40px', height: '16px', borderRadius: '0.25rem' }} />
                                </div>
                                <div className="skeleton" style={{ width: '100%', height: '14px', borderRadius: '0.25rem', marginBottom: '0.25rem' }} />
                                <div className="skeleton" style={{ width: '80%', height: '14px', borderRadius: '0.25rem', marginBottom: '0.5rem' }} />
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div className="skeleton" style={{ width: '70px', height: '14px', borderRadius: '0.25rem' }} />
                                    <div className="skeleton" style={{ width: '40px', height: '14px', borderRadius: '0.25rem' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

SkeletonGitHub.propTypes = {
    showRepos: PropTypes.bool
};

export default SkeletonGitHub;
