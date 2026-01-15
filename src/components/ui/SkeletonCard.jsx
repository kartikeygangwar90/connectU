import React from 'react';

const SkeletonCard = ({ type = 'team' }) => {
    if (type === 'user') {
        return (
            <div className="skeleton-card">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <div className="skeleton skeleton-avatar"></div>
                    <div style={{ flex: 1 }}>
                        <div className="skeleton skeleton-text skeleton-title"></div>
                        <div className="skeleton skeleton-text skeleton-subtitle"></div>
                    </div>
                </div>
                <div className="skeleton skeleton-text" style={{ width: '100%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: '12px' }}></div>
                    <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: '12px' }}></div>
                    <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: '12px' }}></div>
                </div>
                <div className="skeleton skeleton-button"></div>
            </div>
        );
    }

    // Default team card skeleton
    return (
        <div className="skeleton-card">
            <div className="skeleton skeleton-text skeleton-title"></div>
            <div className="skeleton skeleton-text skeleton-subtitle" style={{ marginBottom: '1rem' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '100%' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <div className="skeleton" style={{ width: '70px', height: '26px', borderRadius: '13px' }}></div>
                <div className="skeleton" style={{ width: '70px', height: '26px', borderRadius: '13px' }}></div>
                <div className="skeleton" style={{ width: '70px', height: '26px', borderRadius: '13px' }}></div>
            </div>
            <div className="skeleton skeleton-button"></div>
        </div>
    );
};

// Multiple skeletons for grid display
export const SkeletonGrid = ({ count = 3, type = 'team' }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} type={type} />
            ))}
        </>
    );
};

export default SkeletonCard;
