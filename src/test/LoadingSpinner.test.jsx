import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// LoadingSpinner component (extracted for testing)
const LoadingSpinner = () => (
    <div
        data-testid="loading-spinner"
        style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#000'
        }}
    >
        <div
            data-testid="spinner-element"
            style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}
        />
    </div>
)

describe('LoadingSpinner Component', () => {
    it('should render the loading spinner container', () => {
        render(<LoadingSpinner />)
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should render the spinner element', () => {
        render(<LoadingSpinner />)
        expect(screen.getByTestId('spinner-element')).toBeInTheDocument()
    })

    it('should have correct container styles', () => {
        render(<LoadingSpinner />)
        const container = screen.getByTestId('loading-spinner')
        expect(container).toHaveStyle({ display: 'flex' })
        expect(container).toHaveStyle({ height: '100vh' })
    })
})
