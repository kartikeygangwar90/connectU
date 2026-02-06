/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect } from "react";
import React from "react";
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    where,
    updateDoc,
    arrayRemove
} from "firebase/firestore";
import { dataBase } from "../firebase";
import { useAuth } from "../AuthContext";

export const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
    const [teams, setTeams] = React.useState([]);
    const [events, setEvents] = React.useState([]);
    const [loadingTeams, setLoadingTeams] = React.useState(true);
    const [loadingEvents, setLoadingEvents] = React.useState(true);
    const { user } = useAuth();

    // Real-time listener for teams - only when user is authenticated
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (!user) {
            setTeams([]);
            setLoadingTeams(false);
            return;
        }

        const q = query(
            collection(dataBase, "teams"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const teamList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTeams(teamList);
            setLoadingTeams(false);
        }, (err) => {
            console.error("Error fetching teams", err);
            setLoadingTeams(false);
        });

        return () => unsubscribe();
    }, [user]);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Real-time listener for events - only when user is authenticated
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (!user) {
            setEvents([]);
            setLoadingEvents(false);
            return;
        }

        const q = query(
            collection(dataBase, "events"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setEvents(eventList);
            setLoadingEvents(false);
        }, (err) => {
            console.error("Error fetching events", err);
            setLoadingEvents(false);
        });

        return () => unsubscribe();
    }, [user]);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Cleanup expired events and their teams
    const cleanupExpiredEventsAndTeams = async () => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Get all events
            const eventsSnapshot = await getDocs(collection(dataBase, "events"));

            for (const eventDoc of eventsSnapshot.docs) {
                const eventData = eventDoc.data();

                // Skip if no deadline set
                if (!eventData.deadline) continue;

                const deadline = new Date(eventData.deadline);
                deadline.setHours(0, 0, 0, 0);

                if (deadline < today) {
                    // Delete all teams for this event
                    const teamsQuery = query(
                        collection(dataBase, "teams"),
                        where("eventName", "==", eventData.name)
                    );
                    const teamsSnapshot = await getDocs(teamsQuery);

                    for (const teamDoc of teamsSnapshot.docs) {
                        await deleteDoc(doc(dataBase, "teams", teamDoc.id));
                    }

                    // Delete the event itself
                    await deleteDoc(doc(dataBase, "events", eventDoc.id));


                }
            }
        } catch (error) {
            console.error("Error during cleanup:", error);
        }
    };

    // Run cleanup once when user logs in
    useEffect(() => {
        if (user) {
            cleanupExpiredEventsAndTeams();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const addTeam = async (teamData, eventData = null) => {


        if (!user) {
            console.error("User is not logged in according to Context.");
            return { success: false, error: { message: "User not logged in" } };
        }

        try {
            // If eventData is provided, it means we might need to create a new event
            let eventId = null;

            if (eventData) {
                const newEvent = {
                    ...eventData,
                    createdBy: user.uid,
                    createdAt: serverTimestamp(),
                };

                const eventRef = await addDoc(collection(dataBase, "events"), newEvent);
                eventId = eventRef.id;
                // Note: No manual state update needed - onSnapshot listener will handle it
            }

            const newTeam = {
                ...teamData,
                createdBy: user.uid,
                members: [user.uid], // Initialize with leader
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(dataBase, "teams"), newTeam);
            // Note: No manual state update needed - onSnapshot listener will handle it

            return { success: true, teamId: docRef.id, eventId };
        } catch (error) {
            console.error("Error adding team/event:", error);
            return { success: false, error };
        }
    };

    // Leave team - removes current user from team members
    const leaveTeam = async (teamId) => {
        if (!user) return { success: false, error: { message: "User not logged in" } };

        try {
            const teamRef = doc(dataBase, "teams", teamId);
            const teamSnap = await getDoc(teamRef);

            if (!teamSnap.exists()) {
                return { success: false, error: { message: "Team not found" } };
            }

            const teamData = teamSnap.data();

            // Check if user is the leader - leaders should transfer or delete instead
            if (teamData.createdBy === user.uid) {
                return { success: false, error: { message: "Team leaders cannot leave. Transfer leadership or delete the team instead." } };
            }

            // Remove user from members array
            await updateDoc(teamRef, {
                members: arrayRemove(user.uid)
            });

            return { success: true };
        } catch (error) {
            console.error("Error leaving team:", error);
            return { success: false, error };
        }
    };

    // Delete team - only callable by team leader
    const deleteTeam = async (teamId) => {
        if (!user) return { success: false, error: { message: "User not logged in" } };

        try {
            const teamRef = doc(dataBase, "teams", teamId);
            const teamSnap = await getDoc(teamRef);

            if (!teamSnap.exists()) {
                return { success: false, error: { message: "Team not found" } };
            }

            const teamData = teamSnap.data();

            // Only leader can delete
            if (teamData.createdBy !== user.uid) {
                return { success: false, error: { message: "Only the team leader can delete this team" } };
            }

            // Delete related pending notifications
            const pendingNotifsQuery = query(
                collection(dataBase, "notifications"),
                where("teamId", "==", teamId)
            );
            const notifDocs = await getDocs(pendingNotifsQuery);
            await Promise.all(notifDocs.docs.map(d => deleteDoc(d.ref)));

            // Delete the team
            await deleteDoc(teamRef);

            return { success: true };
        } catch (error) {
            console.error("Error deleting team:", error);
            return { success: false, error };
        }
    };

    // Transfer leadership to another team member
    const transferLeadership = async (teamId, newLeaderId) => {
        if (!user) return { success: false, error: { message: "User not logged in" } };

        try {
            const teamRef = doc(dataBase, "teams", teamId);
            const teamSnap = await getDoc(teamRef);

            if (!teamSnap.exists()) {
                return { success: false, error: { message: "Team not found" } };
            }

            const teamData = teamSnap.data();

            // Verify current user is the leader
            if (teamData.createdBy !== user.uid) {
                return { success: false, error: { message: "Only the current leader can transfer leadership" } };
            }

            // Verify new leader is a team member
            if (!teamData.members?.includes(newLeaderId)) {
                return { success: false, error: { message: "New leader must be a team member" } };
            }

            // Get new leader's name for notification
            const newLeaderRef = doc(dataBase, "users", newLeaderId);
            const newLeaderSnap = await getDoc(newLeaderRef);
            const newLeaderName = newLeaderSnap.exists() ? newLeaderSnap.data().fullName : "A member";

            // Update team leadership
            await updateDoc(teamRef, {
                createdBy: newLeaderId,
                leader: newLeaderName
            });

            // Notify new leader
            await addDoc(collection(dataBase, "notifications"), {
                type: "leadership_transfer",
                toUserId: newLeaderId,
                fromUserId: user.uid,
                teamId: teamId,
                teamName: teamData.teamName,
                message: `You are now the leader of "${teamData.teamName}"!`,
                createdAt: serverTimestamp(),
                read: false
            });

            return { success: true };
        } catch (error) {
            console.error("Error transferring leadership:", error);
            return { success: false, error };
        }
    };

    return (
        <TeamContext.Provider value={{
            teams,
            events,
            addTeam,
            leaveTeam,
            deleteTeam,
            transferLeadership,
            loadingTeams,
            loadingEvents
        }}>
            {children}
        </TeamContext.Provider>
    );
};