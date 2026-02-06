import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import usePagination from '../hooks/usePagination'

describe('usePagination Hook', () => {
    // Test data
    const createItems = (count) => Array.from({ length: count }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }))

    describe('Initial State', () => {
        it('should handle empty array', () => {
            const { result } = renderHook(() => usePagination([], 10))

            expect(result.current.currentPage).toBe(1)
            expect(result.current.totalPages).toBe(0)
            expect(result.current.totalItems).toBe(0)
            expect(result.current.paginatedItems).toEqual([])
            expect(result.current.hasNextPage).toBe(false)
            expect(result.current.hasPrevPage).toBe(false)
        })

        it('should initialize with default items per page of 20', () => {
            const items = createItems(30)
            const { result } = renderHook(() => usePagination(items))

            expect(result.current.itemsPerPage).toBe(20)
            expect(result.current.paginatedItems.length).toBe(20)
        })

        it('should use custom items per page', () => {
            const items = createItems(30)
            const { result } = renderHook(() => usePagination(items, 5))

            expect(result.current.itemsPerPage).toBe(5)
            expect(result.current.paginatedItems.length).toBe(5)
            expect(result.current.totalPages).toBe(6)
        })
    })

    describe('Pagination Calculation', () => {
        it('should calculate total pages correctly', () => {
            const items = createItems(25)
            const { result } = renderHook(() => usePagination(items, 10))

            expect(result.current.totalPages).toBe(3) // 25 items / 10 per page = 3 pages
        })

        it('should return correct paginated items for first page', () => {
            const items = createItems(15)
            const { result } = renderHook(() => usePagination(items, 5))

            expect(result.current.paginatedItems).toHaveLength(5)
            expect(result.current.paginatedItems[0].id).toBe(1)
            expect(result.current.paginatedItems[4].id).toBe(5)
        })

        it('should calculate start and end index correctly', () => {
            const items = createItems(50)
            const { result } = renderHook(() => usePagination(items, 10))

            expect(result.current.startIndex).toBe(1)
            expect(result.current.endIndex).toBe(10)
        })
    })

    describe('Navigation Functions', () => {
        it('should navigate to next page', () => {
            const items = createItems(30)
            const { result } = renderHook(() => usePagination(items, 10))

            act(() => {
                result.current.nextPage()
            })

            expect(result.current.currentPage).toBe(2)
            expect(result.current.paginatedItems[0].id).toBe(11)
        })

        it('should navigate to previous page', () => {
            const items = createItems(30)
            const { result } = renderHook(() => usePagination(items, 10))

            // Go to page 2 first
            act(() => {
                result.current.nextPage()
            })

            // Then go back
            act(() => {
                result.current.prevPage()
            })

            expect(result.current.currentPage).toBe(1)
        })

        it('should navigate to specific page', () => {
            const items = createItems(50)
            const { result } = renderHook(() => usePagination(items, 10))

            act(() => {
                result.current.goToPage(3)
            })

            expect(result.current.currentPage).toBe(3)
            expect(result.current.paginatedItems[0].id).toBe(21)
        })

        it('should navigate to first page', () => {
            const items = createItems(50)
            const { result } = renderHook(() => usePagination(items, 10))

            // Go to page 4 first
            act(() => {
                result.current.goToPage(4)
            })

            act(() => {
                result.current.firstPage()
            })

            expect(result.current.currentPage).toBe(1)
        })

        it('should navigate to last page', () => {
            const items = createItems(50)
            const { result } = renderHook(() => usePagination(items, 10))

            act(() => {
                result.current.lastPage()
            })

            expect(result.current.currentPage).toBe(5)
        })

        it('should reset pagination', () => {
            const items = createItems(30)
            const { result } = renderHook(() => usePagination(items, 10))

            act(() => {
                result.current.goToPage(3)
            })

            act(() => {
                result.current.resetPagination()
            })

            expect(result.current.currentPage).toBe(1)
        })
    })

    describe('Edge Cases', () => {
        it('should not go beyond last page', () => {
            const items = createItems(20)
            const { result } = renderHook(() => usePagination(items, 10))

            // On page 1 of 2
            act(() => {
                result.current.nextPage()
            })

            // Try to go past last page
            act(() => {
                result.current.nextPage()
            })

            expect(result.current.currentPage).toBe(2)
        })

        it('should not go before first page', () => {
            const items = createItems(20)
            const { result } = renderHook(() => usePagination(items, 10))

            act(() => {
                result.current.prevPage()
            })

            expect(result.current.currentPage).toBe(1)
        })

        it('should clamp goToPage to valid range', () => {
            const items = createItems(30)
            const { result } = renderHook(() => usePagination(items, 10))

            // Try to go to page 100
            act(() => {
                result.current.goToPage(100)
            })

            expect(result.current.currentPage).toBe(3) // Should clamp to last page

            // Try to go to page 0
            act(() => {
                result.current.goToPage(0)
            })

            expect(result.current.currentPage).toBe(1) // Should clamp to first page
        })

        it('should handle single page correctly', () => {
            const items = createItems(5)
            const { result } = renderHook(() => usePagination(items, 10))

            expect(result.current.totalPages).toBe(1)
            expect(result.current.hasNextPage).toBe(false)
            expect(result.current.hasPrevPage).toBe(false)
            expect(result.current.paginatedItems).toHaveLength(5)
        })

        it('should handle last page with fewer items', () => {
            const items = createItems(25)
            const { result } = renderHook(() => usePagination(items, 10))

            act(() => {
                result.current.lastPage()
            })

            expect(result.current.paginatedItems).toHaveLength(5) // 25 - 20 = 5 items on last page
            expect(result.current.endIndex).toBe(25)
        })
    })

    describe('Helper Flags', () => {
        it('should correctly indicate hasNextPage', () => {
            const items = createItems(30)
            const { result } = renderHook(() => usePagination(items, 10))

            expect(result.current.hasNextPage).toBe(true)

            act(() => {
                result.current.lastPage()
            })

            expect(result.current.hasNextPage).toBe(false)
        })

        it('should correctly indicate hasPrevPage', () => {
            const items = createItems(30)
            const { result } = renderHook(() => usePagination(items, 10))

            expect(result.current.hasPrevPage).toBe(false)

            act(() => {
                result.current.nextPage()
            })

            expect(result.current.hasPrevPage).toBe(true)
        })
    })
})
