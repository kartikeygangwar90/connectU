import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

// We need to mock fetch before importing the hook
const mockFetch = vi.fn()
// eslint-disable-next-line no-undef
global.fetch = mockFetch

// Import the hook after mocking
import useGitHub, { getLanguageColor, formatCount } from '../hooks/useGitHub'

describe('useGitHub Hook', () => {
    beforeEach(() => {
        mockFetch.mockClear()
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('Empty Username Handling', () => {
        it('should return null profile and empty repos for empty username', () => {
            const { result } = renderHook(() => useGitHub(''))

            expect(result.current.profile).toBeNull()
            expect(result.current.repos).toEqual([])
            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBeNull()
        })

        it('should return null profile for whitespace username', () => {
            const { result } = renderHook(() => useGitHub('   '))

            expect(result.current.profile).toBeNull()
            expect(result.current.repos).toEqual([])
        })

        it('should handle undefined username', () => {
            const { result } = renderHook(() => useGitHub(undefined))

            expect(result.current.profile).toBeNull()
            expect(result.current.repos).toEqual([])
        })
    })

    describe('Successful Data Fetch', () => {
        const mockProfile = {
            login: 'testuser',
            name: 'Test User',
            bio: 'Developer',
            public_repos: 10,
            followers: 100,
            following: 50,
            avatar_url: 'https://example.com/avatar.png',
            html_url: 'https://github.com/testuser'
        }

        const mockRepos = [
            { id: 1, name: 'repo1', stargazers_count: 50, updated_at: '2024-01-01', fork: false, language: 'JavaScript' },
            { id: 2, name: 'repo2', stargazers_count: 100, updated_at: '2024-01-02', fork: false, language: 'Python' },
            { id: 3, name: 'forked-repo', stargazers_count: 10, updated_at: '2024-01-03', fork: true, language: 'Go' }
        ]

        beforeEach(() => {
            mockFetch.mockImplementation((url) => {
                if (url.includes('/users/testuser/repos')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockRepos)
                    })
                }
                if (url.includes('/users/testuser')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockProfile)
                    })
                }
                return Promise.reject(new Error('Unknown URL'))
            })
        })

        it('should fetch profile and repos successfully', async () => {
            const { result } = renderHook(() => useGitHub('testuser'))

            // Should start loading
            expect(result.current.loading).toBe(true)

            await waitFor(() => {
                expect(result.current.loading).toBe(false)
            })

            expect(result.current.profile).toEqual(mockProfile)
            expect(result.current.error).toBeNull()
        })

        it('should filter out forked repositories', async () => {
            const { result } = renderHook(() => useGitHub('testuser'))

            await waitFor(() => {
                expect(result.current.loading).toBe(false)
            })

            // Should not include the forked repo
            const repoNames = result.current.repos.map(r => r.name)
            expect(repoNames).not.toContain('forked-repo')
        })

        it('should sort repos by stars descending', async () => {
            const { result } = renderHook(() => useGitHub('testuser'))

            await waitFor(() => {
                expect(result.current.loading).toBe(false)
            })

            // repo2 (100 stars) should come before repo1 (50 stars)
            expect(result.current.repos[0].name).toBe('repo2')
        })
    })

    describe('Error Handling', () => {
        it('should handle 404 user not found', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404
            })

            const { result } = renderHook(() => useGitHub('nonexistentuser'))

            await waitFor(() => {
                expect(result.current.loading).toBe(false)
            })

            expect(result.current.error).toBe('GitHub user not found')
            expect(result.current.profile).toBeNull()
        })

        it('should handle 403 rate limit exceeded', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 403
            })

            const { result } = renderHook(() => useGitHub('ratelimiteduser'))

            await waitFor(() => {
                expect(result.current.loading).toBe(false)
            })

            expect(result.current.error).toBe('API rate limit exceeded. Please try again later.')
        })

        it('should handle generic fetch error', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500
            })

            const { result } = renderHook(() => useGitHub('erroruser'))

            await waitFor(() => {
                expect(result.current.loading).toBe(false)
            })

            expect(result.current.error).toBe('Failed to fetch GitHub profile')
        })
    })

    describe('Refresh Function', () => {
        it('should provide a refresh function', () => {
            const { result } = renderHook(() => useGitHub('testuser'))

            expect(typeof result.current.refresh).toBe('function')
        })
    })
})

describe('Utility Functions', () => {
    describe('getLanguageColor', () => {
        it('should return correct color for JavaScript', () => {
            expect(getLanguageColor('JavaScript')).toBe('#f1e05a')
        })

        it('should return correct color for Python', () => {
            expect(getLanguageColor('Python')).toBe('#3572A5')
        })

        it('should return correct color for TypeScript', () => {
            expect(getLanguageColor('TypeScript')).toBe('#3178c6')
        })

        it('should return default gray for unknown language', () => {
            expect(getLanguageColor('UnknownLanguage')).toBe('#858585')
        })

        it('should return default gray for undefined', () => {
            expect(getLanguageColor(undefined)).toBe('#858585')
        })
    })

    describe('formatCount', () => {
        it('should return number as string for values under 1000', () => {
            expect(formatCount(0)).toBe('0')
            expect(formatCount(500)).toBe('500')
            expect(formatCount(999)).toBe('999')
        })

        it('should format thousands with k suffix', () => {
            expect(formatCount(1000)).toBe('1k')
            expect(formatCount(1500)).toBe('1.5k')
            expect(formatCount(2500)).toBe('2.5k')
        })

        it('should remove trailing .0 from formatted numbers', () => {
            expect(formatCount(1000)).toBe('1k')
            expect(formatCount(2000)).toBe('2k')
        })

        it('should handle large numbers', () => {
            expect(formatCount(10000)).toBe('10k')
            expect(formatCount(15500)).toBe('15.5k')
        })
    })
})
