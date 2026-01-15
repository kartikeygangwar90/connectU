import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('App Smoke Tests', () => {
    it('should have test environment configured correctly', () => {
        expect(true).toBe(true)
    })

    it('should have access to DOM testing utilities', () => {
        render(<div data-testid="test-element">Hello Test</div>)
        expect(screen.getByTestId('test-element')).toBeInTheDocument()
        expect(screen.getByText('Hello Test')).toBeInTheDocument()
    })
})

describe('Utility Functions', () => {
    it('should validate email correctly', () => {
        const isValidEmail = (email) => {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            return emailRegex.test(email)
        }

        expect(isValidEmail('test@example.com')).toBe(true)
        expect(isValidEmail('user.name@domain.co.in')).toBe(true)
        expect(isValidEmail('invalid-email')).toBe(false)
        expect(isValidEmail('missing@domain')).toBe(false)
        expect(isValidEmail('')).toBe(false)
    })
})
