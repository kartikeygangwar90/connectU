import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import React from 'react'

// Mock the entire react-router-dom module
const mockNavigate = vi.fn()
const mockOutletContext = { profileCompleted: true }

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useOutletContext: () => mockOutletContext
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    default: {
        error: vi.fn(),
        success: vi.fn()
    }
}))

import { useProfileCheck } from '../hooks/useProfileCheck'
import toast from 'react-hot-toast'

describe('useProfileCheck Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset to default (profile complete)
        mockOutletContext.profileCompleted = true
    })

    describe('Profile Complete Scenario', () => {
        beforeEach(() => {
            mockOutletContext.profileCompleted = true
        })

        it('should return isProfileComplete as true when profile is completed', () => {
            const { result } = renderHook(() => useProfileCheck())

            expect(result.current.isProfileComplete).toBe(true)
        })

        it('should return true from requireProfile without redirect', () => {
            const { result } = renderHook(() => useProfileCheck())

            const canProceed = result.current.requireProfile()

            expect(canProceed).toBe(true)
            expect(mockNavigate).not.toHaveBeenCalled()
            expect(toast.error).not.toHaveBeenCalled()
        })
    })

    describe('Profile Incomplete Scenario', () => {
        beforeEach(() => {
            mockOutletContext.profileCompleted = false
        })

        it('should return isProfileComplete as false when profile is incomplete', () => {
            const { result } = renderHook(() => useProfileCheck())

            expect(result.current.isProfileComplete).toBe(false)
        })

        it('should return false from requireProfile when profile is incomplete', () => {
            const { result } = renderHook(() => useProfileCheck())

            const canProceed = result.current.requireProfile()

            expect(canProceed).toBe(false)
        })

        it('should redirect to profile page when requireProfile called with incomplete profile', () => {
            const { result } = renderHook(() => useProfileCheck())

            result.current.requireProfile()

            expect(mockNavigate).toHaveBeenCalledWith('/profile')
        })

        it('should show toast error when requireProfile called with incomplete profile', () => {
            const { result } = renderHook(() => useProfileCheck())

            result.current.requireProfile()

            expect(toast.error).toHaveBeenCalledWith(
                'Please complete your profile to use this feature',
                expect.objectContaining({
                    duration: 4000,
                    icon: '📝'
                })
            )
        })
    })

    describe('Returned Object Shape', () => {
        it('should return both requireProfile function and isProfileComplete boolean', () => {
            const { result } = renderHook(() => useProfileCheck())

            expect(typeof result.current.requireProfile).toBe('function')
            expect(typeof result.current.isProfileComplete).toBe('boolean')
        })
    })
})
