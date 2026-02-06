import React from 'react';
import PropTypes from 'prop-types';

/**
 * Pagination Controls Component
 * Displays page navigation buttons and current page info
 */
const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    showInfo = true,
    compact = false
}) => {
    if (totalPages <= 1) return null;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = compact ? 3 : 5;

        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        // Adjust start if we're near the end
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    const buttonStyle = {
        padding: compact ? '0.4rem 0.6rem' : '0.5rem 0.75rem',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'transparent',
        color: 'white',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        fontSize: compact ? '0.8rem' : '0.9rem',
        transition: 'all 0.2s',
        minWidth: compact ? '32px' : '36px'
    };

    const activeButtonStyle = {
        ...buttonStyle,
        background: 'white',
        color: 'black',
        borderColor: 'white'
    };

    const disabledButtonStyle = {
        ...buttonStyle,
        opacity: 0.4,
        cursor: 'not-allowed'
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: compact ? 'row' : 'column',
            alignItems: 'center',
            gap: compact ? '0.5rem' : '0.75rem',
            marginTop: '1.5rem'
        }}>
            {/* Info text */}
            {showInfo && !compact && (
                <p style={{
                    color: '#a1a1aa',
                    fontSize: '0.85rem',
                    margin: 0
                }}>
                    Showing {startIndex}-{endIndex} of {totalItems} items
                </p>
            )}

            {/* Navigation buttons */}
            <div style={{
                display: 'flex',
                gap: '0.25rem',
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                {/* Previous button */}
                <button
                    onClick={() => hasPrevPage && onPageChange(currentPage - 1)}
                    disabled={!hasPrevPage}
                    style={hasPrevPage ? buttonStyle : disabledButtonStyle}
                    aria-label="Previous page"
                >
                    ←
                </button>

                {/* First page + ellipsis */}
                {!compact && currentPage > 3 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            style={buttonStyle}
                        >
                            1
                        </button>
                        {currentPage > 4 && (
                            <span style={{ color: '#6b7280', padding: '0 0.25rem' }}>...</span>
                        )}
                    </>
                )}

                {/* Page numbers */}
                {getPageNumbers().map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        style={page === currentPage ? activeButtonStyle : buttonStyle}
                        aria-label={`Page ${page}`}
                        aria-current={page === currentPage ? 'page' : undefined}
                    >
                        {page}
                    </button>
                ))}

                {/* Last page + ellipsis */}
                {!compact && currentPage < totalPages - 2 && (
                    <>
                        {currentPage < totalPages - 3 && (
                            <span style={{ color: '#6b7280', padding: '0 0.25rem' }}>...</span>
                        )}
                        <button
                            onClick={() => onPageChange(totalPages)}
                            style={buttonStyle}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* Next button */}
                <button
                    onClick={() => hasNextPage && onPageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    style={hasNextPage ? buttonStyle : disabledButtonStyle}
                    aria-label="Next page"
                >
                    →
                </button>
            </div>

            {/* Compact info */}
            {showInfo && compact && (
                <span style={{
                    color: '#6b7280',
                    fontSize: '0.75rem'
                }}>
                    {currentPage}/{totalPages}
                </span>
            )}
        </div>
    );
};

PaginationControls.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    totalItems: PropTypes.number,
    startIndex: PropTypes.number,
    endIndex: PropTypes.number,
    hasNextPage: PropTypes.bool,
    hasPrevPage: PropTypes.bool,
    showInfo: PropTypes.bool,
    compact: PropTypes.bool
};

// Memoize for performance
export default React.memo(PaginationControls);
