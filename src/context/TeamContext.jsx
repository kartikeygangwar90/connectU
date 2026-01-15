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
    where
} from "firebase/firestore";
import { dataBase, auth } from "../firebase";
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
            console.log("Error fetching teams", err);
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
            console.log("Error fetching events", err);
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

                    console.log(`🧹 Cleaned up expired event: ${eventData.name} (deadline: ${eventData.deadline})`);
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
        console.log("Attempting to add team. Current User:", user);
        console.log("Auth Object CurrentUser:", auth.currentUser);

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

    return (
        <TeamContext.Provider value={{ teams, events, addTeam, loadingTeams, loadingEvents }}>
            {children}
        </TeamContext.Provider>
    );
};