import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { dataBase } from '../firebase'

// Fetch all teams
export const useTeams = () => {
    return useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const teamsRef = collection(dataBase, 'teams')
            const snapshot = await getDocs(teamsRef)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        },
        staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Cache for 10 minutes (previously cacheTime)
    })
}

// Fetch teams by event category
export const useTeamsByCategory = (category) => {
    return useQuery({
        queryKey: ['teams', 'category', category],
        queryFn: async () => {
            const teamsRef = collection(dataBase, 'teams')
            const q = query(teamsRef, where('eventCategory', '==', category))
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        },
        enabled: !!category,
        staleTime: 5 * 60 * 1000,
    })
}

// Fetch user's teams
export const useUserTeams = (userId) => {
    return useQuery({
        queryKey: ['teams', 'user', userId],
        queryFn: async () => {
            const teamsRef = collection(dataBase, 'teams')
            const q = query(teamsRef, where('createdBy', '==', userId))
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        },
        enabled: !!userId,
        staleTime: 2 * 60 * 1000,
    })
}

// Fetch all users (for discover talent)
export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const usersRef = collection(dataBase, 'users')
            const snapshot = await getDocs(usersRef)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        },
        staleTime: 5 * 60 * 1000,
    })
}

// Fetch notifications for a user
export const useNotifications = (userId) => {
    return useQuery({
        queryKey: ['notifications', userId],
        queryFn: async () => {
            const notifRef = collection(dataBase, 'notifications')
            const q = query(notifRef, where('toUserId', '==', userId))
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        },
        enabled: !!userId,
        staleTime: 30 * 1000, // Notifications refresh every 30 seconds
        refetchInterval: 60 * 1000, // Auto-refetch every minute
    })
}

// Create team mutation
export const useCreateTeam = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (teamData) => {
            const teamsRef = collection(dataBase, 'teams')
            const docRef = await addDoc(teamsRef, teamData)
            return { id: docRef.id, ...teamData }
        },
        onSuccess: () => {
            // Invalidate and refetch teams queries
            queryClient.invalidateQueries({ queryKey: ['teams'] })
        },
    })
}

// Update team mutation
export const useUpdateTeam = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ teamId, updates }) => {
            const teamRef = doc(dataBase, 'teams', teamId)
            await updateDoc(teamRef, updates)
            return { id: teamId, ...updates }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] })
        },
    })
}

// Delete team mutation
export const useDeleteTeam = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (teamId) => {
            const teamRef = doc(dataBase, 'teams', teamId)
            await deleteDoc(teamRef)
            return teamId
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] })
        },
    })
}
