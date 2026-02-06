import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for pagination
 * @param {Array} items - Array of items to paginate
 * @param {number} itemsPerPage - Number of items per page (default: 20)
 * @returns {Object} Pagination state and controls
 */
export function usePagination(items = [], itemsPerPage = 20) {
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate total pages
    const totalPages = useMemo(() => {
        return Math.ceil(items.length / itemsPerPage);
    }, [items.length, itemsPerPage]);

    // Get current page items
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    }, [items, currentPage, itemsPerPage]);

    // Navigation functions
    const goToPage = useCallback((page) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(pageNumber);
    }, [totalPages]);

    const nextPage = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    }, [currentPage, totalPages]);

    const prevPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    }, [currentPage]);

    const firstPage = useCallback(() => {
        setCurrentPage(1);
    }, []);

    const lastPage = useCallback(() => {
        setCurrentPage(totalPages);
    }, [totalPages]);

    // Reset to first page when items change significantly
    const resetPagination = useCallback(() => {
        setCurrentPage(1);
    }, []);

    return {
        // Current state
        currentPage,
        totalPages,
        totalItems: items.length,
        itemsPerPage,

        // Paginated data
        paginatedItems,

        // Navigation
        goToPage,
        nextPage,
        prevPage,
        firstPage,
        lastPage,
        resetPagination,

        // Helpers
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        startIndex: (currentPage - 1) * itemsPerPage + 1,
        endIndex: Math.min(currentPage * itemsPerPage, items.length)
    };
}

export default usePagination;
