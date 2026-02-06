import { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { dataBase, auth } from '../firebase';
import toast from 'react-hot-toast';

/**
 * Custom hook for managing bookmarks (saved teams and users)
 * Stores bookmarks as arrays in the user's document
 */
export const useBookmarks = () => {
    const [bookmarkedTeams, setBookmarkedTeams] = useState([]);
    const [bookmarkedUsers, setBookmarkedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Listen to user's bookmarks in real-time
    useEffect(() => {
        if (!auth.currentUser) {
            const timer = setTimeout(() => setIsLoading(false), 0);
            return () => clearTimeout(timer);
        }

        const userRef = doc(dataBase, 'users', auth.currentUser.uid);
        const unsubscribe = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setBookmarkedTeams(data.bookmarkedTeams || []);
                setBookmarkedUsers(data.bookmarkedUsers || []);
            }
            setIsLoading(false);
        }, (error) => {
            console.error('Error listening to bookmarks:', error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    /**
     * Toggle bookmark for a team
     * @param {string} teamId - The team's document ID
     */
    const toggleBookmarkTeam = async (teamId) => {
        if (!auth.currentUser) {
            toast.error('Please sign in to save teams');
            return;
        }

        try {
            const userRef = doc(dataBase, 'users', auth.currentUser.uid);
            const isBookmarked = bookmarkedTeams.includes(teamId);

            if (isBookmarked) {
                await updateDoc(userRef, {
                    bookmarkedTeams: arrayRemove(teamId)
                });
                toast.success('Team removed from saved');
            } else {
                await updateDoc(userRef, {
                    bookmarkedTeams: arrayUnion(teamId)
                });
                toast.success('Team saved! View in your profile');
            }
        } catch (error) {
            console.error('Error toggling team bookmark:', error);
            toast.error('Failed to update bookmark');
        }
    };

    /**
     * Toggle bookmark for a user
     * @param {string} userId - The user's document ID
     */
    const toggleBookmarkUser = async (userId) => {
        if (!auth.currentUser) {
            toast.error('Please sign in to save users');
            return;
        }

        // Can't bookmark yourself
        if (userId === auth.currentUser.uid) {
            toast.error("You can't bookmark yourself!");
            return;
        }

        try {
            const userRef = doc(dataBase, 'users', auth.currentUser.uid);
            const isBookmarked = bookmarkedUsers.includes(userId);

            if (isBookmarked) {
                await updateDoc(userRef, {
                    bookmarkedUsers: arrayRemove(userId)
                });
                toast.success('User removed from saved');
            } else {
                await updateDoc(userRef, {
                    bookmarkedUsers: arrayUnion(userId)
                });
                toast.success('User saved! View in your profile');
            }
        } catch (error) {
            console.error('Error toggling user bookmark:', error);
            toast.error('Failed to update bookmark');
        }
    };

    /**
     * Check if a team is bookmarked
     * @param {string} teamId - The team's document ID
     * @returns {boolean}
     */
    const isTeamBookmarked = (teamId) => bookmarkedTeams.includes(teamId);

    /**
     * Check if a user is bookmarked
     * @param {string} userId - The user's document ID
     * @returns {boolean}
     */
    const isUserBookmarked = (userId) => bookmarkedUsers.includes(userId);

    return {
        bookmarkedTeams,
        bookmarkedUsers,
        toggleBookmarkTeam,
        toggleBookmarkUser,
        isTeamBookmarked,
        isUserBookmarked,
        isLoading
    };
};

export default useBookmarks;
