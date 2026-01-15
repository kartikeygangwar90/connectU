import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase for tests
vi.mock('./firebase', () => ({
    auth: {
        currentUser: null,
        onAuthStateChanged: vi.fn(),
    },
    dataBase: {},
}))
