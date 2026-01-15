import React, { useState, useEffect, useContext } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, orderBy, onSnapshot } from "firebase/firestore";
import { auth, dataBase } from "../../firebase";
import { TeamContext } from "../../context/TeamContext";
import Navbar from "./Navbar";
import "../../style.css"; // Reuse existing styles

const DashboardLayout = () => {
    const { teams, events } = useContext(TeamContext);
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchBySkill, setSearchBySkill] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    // Determine current section from path
    const currentPath = location.pathname;
    const isEventsSection = currentPath.includes('/events');
    const isTeamsSection = currentPath.includes('/teams');
    const isForYouSection = currentPath.includes('/recommendations');
    const isDiscoverSection = currentPath.includes('/discover');
    const isProfileSection = currentPath.includes('/profile');

    // Clear search when changing sections
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        setSearchQuery("");
        setSearchBySkill(false);
    }, [currentPath]);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Fetch user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!auth.currentUser) return;
            const uid = auth.currentUser.uid;
            const userRef = doc(dataBase, "users", uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                setUserProfile(snap.data());
            }
            setIsLoading(false);
        };
        fetchUserProfile();
    }, []);

    // Fetch all users for discovery/search
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(dataBase, "users");
                const q = query(usersRef, where("profileCompleted", "==", true));
                const snapshot = await getDocs(q);
                const usersList = snapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .filter((user) => user.id !== auth.currentUser?.uid);
                setAllUsers(usersList);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    // Real-time notifications
    useEffect(() => {
        if (!auth.currentUser) return;
        const notificationsRef = collection(dataBase, "notifications");
        const q = query(
            notificationsRef,
            where("toUserId", "==", auth.currentUser.uid),
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notificationsList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            console.log("Fetched notifications:", notificationsList.length);
            setNotifications(notificationsList);
        }, (error) => {
            console.error("Notification query error:", error);
            if (error.message.includes("index")) {
                alert("Firestore needs an index for notifications. Check browser console for the link to create it.");
            }
        });
        return () => unsubscribe();
    }, []);

    // Context-aware Search Logic
    const searchResults = React.useMemo(() => {
        if (!searchQuery.trim()) return { users: [], teams: [], events: [] };
        const q = searchQuery.toLowerCase();

        // Events section - search only events
        if (isEventsSection) {
            const matchedEvents = events.filter(
                (event) =>
                    event.name?.toLowerCase().includes(q) ||
                    event.category?.toLowerCase().includes(q)
            );
            return { users: [], teams: [], events: matchedEvents };
        }

        // Teams or For You section - search only teams
        if (isTeamsSection || isForYouSection) {
            const matchedTeams = teams.filter(
                (team) =>
                    team.teamName?.toLowerCase().includes(q) ||
                    team.eventName?.toLowerCase().includes(q) ||
                    team.skills?.some((s) => s.toLowerCase().includes(q))
            );
            return { users: [], teams: matchedTeams, events: [] };
        }

        // Discover section - search only users (by name or skill based on toggle)
        if (isDiscoverSection) {
            const matchedUsers = allUsers.filter((user) => {
                if (searchBySkill) {
                    // Search by skills only
                    return user.technicalSkills?.some((s) => s.toLowerCase().includes(q)) ||
                        user.softSkills?.some((s) => s.toLowerCase().includes(q));
                } else {
                    // Search by name, branch, skills
                    return user.fullName?.toLowerCase().includes(q) ||
                        user.technicalSkills?.some((s) => s.toLowerCase().includes(q)) ||
                        user.softSkills?.some((s) => s.toLowerCase().includes(q)) ||
                        user.branch?.toLowerCase().includes(q);
                }
            });
            return { users: matchedUsers, teams: [], events: [] };
        }

        return { users: [], teams: [], events: [] };
    }, [searchQuery, searchBySkill, allUsers, teams, events, isEventsSection, isTeamsSection, isForYouSection, isDiscoverSection]);

    // Get placeholder text based on section
    const getSearchPlaceholder = () => {
        if (isEventsSection) return "Search events...";
        if (isTeamsSection || isForYouSection) return "Search teams...";
        if (isDiscoverSection) return searchBySkill ? "Search by skill (e.g., React, Python)..." : "Search people...";
        return "Search...";
    };

    // Derived state
    const unreadCount = notifications.filter((n) => !n.read).length;

    if (isLoading) return <div className="loading-screen">Loading...</div>;

    return (
        <div className="mainpage--mp">
            <Navbar
                userProfile={userProfile}
                notifications={notifications}
                unreadCount={unreadCount}
            />

            {/* Navigation Tabs */}
            <section className="browsing--section">
                <div className="browsing--options">
                    <NavLink to="/app/events" className={({ isActive }) => `browse--op ${isActive ? "browse--clicked" : ""}`}>📅 Events</NavLink>
                    <NavLink to="/app/teams" className={({ isActive }) => `browse--op ${isActive ? "browse--clicked" : ""}`}>👥 Teams</NavLink>
                    <NavLink to="/app/recommendations" className={({ isActive }) => `browse--op ${isActive ? "browse--clicked" : ""}`}>✨ For You</NavLink>
                    <NavLink to="/app/profile" className={({ isActive }) => `browse--op ${isActive ? "browse--clicked" : ""}`}>👤 Profile</NavLink>
                    <NavLink to="/app/discover" className={({ isActive }) => `browse--op ${isActive ? "browse--clicked" : ""}`}>🔍 Discover</NavLink>
                </div>
            </section>

            {/* Search Bar - Hidden on Profile section */}
            {!isProfileSection && (
                <div className="search--teams">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder={getSearchPlaceholder()}
                            className="search--tab"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {/* Skill filter toggle - only on Discover section */}
                        {isDiscoverSection && (
                            <button
                                className={`skill-filter-toggle ${searchBySkill ? 'active' : ''}`}
                                onClick={() => setSearchBySkill(!searchBySkill)}
                                title={searchBySkill ? "Searching by skill" : "Search by name/skill"}
                            >
                                🛠️ {searchBySkill ? 'Skills' : 'All'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Search Results Overlay - Not shown for Discover section (filters in-place) */}
            {searchQuery.trim() && !isProfileSection && !isDiscoverSection && (
                <div className="search-results">
                    <h3>
                        {isEventsSection && "Events matching "}
                        {(isTeamsSection || isForYouSection) && "Teams matching "}
                        {isDiscoverSection && (searchBySkill ? "People with skills in " : "People matching ")}
                        "{searchQuery}"
                    </h3>

                    {/* Events Results (Events section only) */}
                    {isEventsSection && searchResults.events.length > 0 && (
                        <div className="search-cards">
                            {searchResults.events.map(e => (
                                <div key={e.id} className="event-search-card" onClick={() => {
                                    navigate(`/app/teams?event=${encodeURIComponent(e.name)}`);
                                    setSearchQuery("");
                                }}>
                                    <h5>📅 {e.name}</h5>
                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{e.category}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Teams Results (Teams/ForYou section only) */}
                    {(isTeamsSection || isForYouSection) && searchResults.teams.length > 0 && (
                        <div className="search-cards">
                            {searchResults.teams.map(t => (
                                <div key={t.id} className="event-search-card" onClick={() => {
                                    navigate(`/app/teams?teamId=${t.id}`);
                                    setSearchQuery("");
                                }}>
                                    <h5>👥 {t.teamName}</h5>
                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{t.eventName}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No results message - exclude Discover section as it filters in-place */}
                    {((isEventsSection && searchResults.events.length === 0) ||
                        ((isTeamsSection || isForYouSection) && searchResults.teams.length === 0)) && (
                            <p style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>No results found</p>
                        )}

                    <button onClick={() => setSearchQuery("")}>Clear Search</button>
                </div>
            )}

            {/* Child Pages */}
            <Outlet context={{ userProfile, allUsers, teams, events, searchQuery, searchBySkill }} />
        </div>
    );
};

export default DashboardLayout;

