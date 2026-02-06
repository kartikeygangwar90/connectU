import { useState, useEffect, useCallback } from "react";

/**
 * Cache for GitHub API responses to avoid rate limiting
 * Key: username, Value: { data, timestamp }
 */
const githubCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Custom hook for fetching GitHub profile and repository data
 * Uses the public GitHub API (60 requests/hour limit for unauthenticated)
 */
const useGitHub = (username) => {
    const [profile, setProfile] = useState(null);
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Check if cached data is still valid
     */
    const getCachedData = useCallback((key) => {
        const cached = githubCache.get(key);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }
        githubCache.delete(key);
        return null;
    }, []);

    /**
     * Cache data with timestamp
     */
    const setCachedData = useCallback((key, data) => {
        githubCache.set(key, { data, timestamp: Date.now() });
    }, []);

    /**
     * Fetch GitHub profile data
     */
    const fetchProfile = useCallback(async (user) => {
        const cacheKey = `profile_${user}`;
        const cached = getCachedData(cacheKey);
        if (cached) return cached;

        const response = await fetch(`https://api.github.com/users/${user}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("GitHub user not found");
            }
            if (response.status === 403) {
                throw new Error("API rate limit exceeded. Please try again later.");
            }
            throw new Error("Failed to fetch GitHub profile");
        }

        const data = await response.json();
        setCachedData(cacheKey, data);
        return data;
    }, [getCachedData, setCachedData]);

    /**
     * Fetch GitHub repositories (sorted by stars, then updated date)
     */
    const fetchRepos = useCallback(async (user) => {
        const cacheKey = `repos_${user}`;
        const cached = getCachedData(cacheKey);
        if (cached) return cached;

        const response = await fetch(
            `https://api.github.com/users/${user}/repos?sort=updated&per_page=100`
        );
        if (!response.ok) {
            throw new Error("Failed to fetch repositories");
        }

        const data = await response.json();

        // Sort by stars (descending), then by updated date
        const sortedRepos = data
            .filter(repo => !repo.fork) // Exclude forks
            .sort((a, b) => {
                // First by stars
                if (b.stargazers_count !== a.stargazers_count) {
                    return b.stargazers_count - a.stargazers_count;
                }
                // Then by updated date
                return new Date(b.updated_at) - new Date(a.updated_at);
            })
            .slice(0, 6); // Top 6 repos

        setCachedData(cacheKey, sortedRepos);
        return sortedRepos;
    }, [getCachedData, setCachedData]);

    /**
     * Main fetch function
     */
    const fetchGitHubData = useCallback(async () => {
        if (!username || username.trim() === "") {
            setProfile(null);
            setRepos([]);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [profileData, reposData] = await Promise.all([
                fetchProfile(username),
                fetchRepos(username)
            ]);

            setProfile(profileData);
            setRepos(reposData);
        } catch (err) {
            console.error("GitHub API error:", err);
            setError(err.message);
            setProfile(null);
            setRepos([]);
        } finally {
            setLoading(false);
        }
    }, [username, fetchProfile, fetchRepos]);

    // Fetch data when username changes
    useEffect(() => {
        fetchGitHubData();
    }, [fetchGitHubData]);

    /**
     * Manually refresh data (clears cache first)
     */
    const refresh = useCallback(() => {
        if (username) {
            githubCache.delete(`profile_${username}`);
            githubCache.delete(`repos_${username}`);
            fetchGitHubData();
        }
    }, [username, fetchGitHubData]);

    return {
        profile,
        repos,
        loading,
        error,
        refresh
    };
};

/**
 * Get language color for display (common languages)
 */
export const getLanguageColor = (language) => {
    const colors = {
        JavaScript: "#f1e05a",
        TypeScript: "#3178c6",
        Python: "#3572A5",
        Java: "#b07219",
        "C++": "#f34b7d",
        C: "#555555",
        "C#": "#239120",
        Ruby: "#701516",
        Go: "#00ADD8",
        Rust: "#dea584",
        PHP: "#4F5D95",
        Swift: "#F05138",
        Kotlin: "#A97BFF",
        Dart: "#00B4AB",
        HTML: "#e34c26",
        CSS: "#563d7c",
        SCSS: "#c6538c",
        Vue: "#41b883",
        Shell: "#89e051",
        Dockerfile: "#384d54"
    };
    return colors[language] || "#858585";
};

/**
 * Format number for display (e.g., 1500 -> 1.5k)
 */
export const formatCount = (num) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num.toString();
};

export default useGitHub;
