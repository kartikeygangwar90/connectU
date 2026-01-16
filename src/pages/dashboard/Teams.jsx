import React, { useState, useEffect, useContext } from "react";
import { useOutletContext, useSearchParams, useNavigate } from "react-router-dom";
import { TeamContext } from "../../context/TeamContext";
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { dataBase, auth } from "../../firebase";
import { sendJoinRequestEmail } from "../../utils/emailService";
import toast from "react-hot-toast";
import CompleteProfileModal from "../../components/modals/CompleteProfileModal";

const CATEGORIES = [
    { id: "research", name: "Research" },
    { id: "hackathon", name: "Hackathon" },
    { id: "startup", name: "Startup" },
    { id: "sports", name: "Sports" },
    { id: "esports", name: "Esports" },
    { id: "cultural", name: "Cultural" },
];

// Activity lists by category
const SPORTS_ACTIVITIES = ["Football", "Cricket", "Basketball", "Badminton", "Table Tennis", "Athletics", "Chess", "Volleyball", "Tennis", "Swimming"];
const ESPORTS_ACTIVITIES = ["Valorant", "BGMI", "FIFA", "COD", "Free Fire", "CS2", "Minecraft", "League of Legends", "Dota 2", "Rocket League"];
const CULTURAL_ACTIVITIES = ["Dance", "Music", "Singing", "Drama", "Art", "Photography", "Content Creation", "Poetry", "Writing", "Painting"];

const Teams = () => {
    const { teams, events, userProfile, allUsers, profileCompleted } = useOutletContext();
    const { addTeam } = useContext(TeamContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Helper to check profile completion before restricted actions
    const requireProfile = () => {
        if (!profileCompleted) {
            setShowCompleteProfileModal(true);
            return false;
        }
        return true;
    };

    // Filter State
    const eventFilter = searchParams.get("event");
    const [teamChoice, setTeamChoice] = useState(false);

    // Form State
    const [newTeamName, setNewTeamName] = useState("");
    const [newTeamDesc, setNewTeamDesc] = useState("");
    const [newTeamSize, setNewTeamSize] = useState("");
    const [newTeamSkills, setNewTeamSkills] = useState([]);
    const [newTeamLeader, setNewTeamLeader] = useState("");
    const [eventInputName, setEventInputName] = useState("");
    const [eventCategory, setEventCategory] = useState("");
    const [eventDeadline, setEventDeadline] = useState("");
    const [eventUrl, setEventUrl] = useState("");
    const [isNewEvent, setIsNewEvent] = useState(true);
    const [skillInput, setSkillInput] = useState("");
    const [requiredActivities, setRequiredActivities] = useState([]);
    const [expandedActivitySection, setExpandedActivitySection] = useState(null); // 'sports', 'esports', 'cultural'
    const [showEventSuggestions, setShowEventSuggestions] = useState(false);

    // Toggle activity for team requirements
    const toggleActivity = (activity) => {
        if (!activity.trim()) return;
        setRequiredActivities(prev => {
            if (prev.includes(activity)) return prev.filter(a => a !== activity);
            if (prev.length >= 5) return prev;
            return [...prev, activity];
        });
    };

    const [openJoinModel, setOpenJoinModel] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [joinMessage, setJoinMessage] = useState("");
    const [sendingRequest, setSendingRequest] = useState(false);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);

    // Creation Success Modal State
    const [createdTeamId, setCreatedTeamId] = useState(null);
    const [showCreationSuccessModal, setShowCreationSuccessModal] = useState(false);

    // Initialize Event Name if passed via URL
    useEffect(() => {
        if (eventFilter) {
            // Note: If we are in "Create Team" mode, we might want to pre-fill this?
            // For now, the filter applies to "Browse Teams".
        }
    }, [eventFilter]);

    // Handle Direct Join Link
    const directJoinId = searchParams.get("directJoin");
    const [directJoinTeam, setDirectJoinTeam] = useState(null);
    const [showDirectJoinModal, setShowDirectJoinModal] = useState(false);
    const [joiningDirectly, setJoiningDirectly] = useState(false);

    useEffect(() => {
        const fetchDirectJoinTeam = async () => {
            if (directJoinId && !showDirectJoinModal) {
                try {
                    // Check if team is already in context list
                    let team = teams.find(t => t.id === directJoinId);

                    if (!team) {
                        // If not in context (e.g., fresh load), fetch from Firestore
                        const docRef = doc(dataBase, "teams", directJoinId);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            team = { id: docSnap.id, ...docSnap.data() };
                        }
                    }

                    if (team) {
                        setDirectJoinTeam(team);
                        setShowDirectJoinModal(true);
                    } else {
                        toast.error("Team not found or link is invalid.");
                    }
                } catch (err) {
                    console.error("Error fetching team for direct join:", err);
                    toast.error("Failed to load team details.");
                }
            }
        };

        if (directJoinId) {
            fetchDirectJoinTeam();
        }
    }, [directJoinId, teams]);

    const handleDirectJoin = async () => {
        if (!directJoinTeam || !auth.currentUser) return;

        // Require profile
        if (!requireProfile()) {
            setShowDirectJoinModal(false);
            return;
        }

        if (directJoinTeam.members?.includes(auth.currentUser.uid)) {
            toast.success("You are already a member of this team!");
            setShowDirectJoinModal(false);
            setSearchParams(params => {
                params.delete("directJoin");
                return params;
            });
            return;
        }

        if ((directJoinTeam.members?.length || 1) >= parseInt(directJoinTeam.teamSize)) {
            toast.error("This team is already full.");
            return;
        }

        setJoiningDirectly(true);
        try {
            const teamRef = doc(dataBase, "teams", directJoinTeam.id);
            // Add user to members array
            await updateDoc(teamRef, {
                members: [...(directJoinTeam.members || []), auth.currentUser.uid]
            });

            toast.success(`Successfully joined ${directJoinTeam.teamName}! 🎉`);
            setShowDirectJoinModal(false);

            // Clear query param
            setSearchParams(params => {
                params.delete("directJoin");
                return params;
            });

            // Context should auto-update via snapshot listener defined in TeamContext
        } catch (error) {
            console.error("Direct join failed:", error);
            toast.error("Failed to join team. Please try again.");
        } finally {
            setJoiningDirectly(false);
        }
    };

    // Helpers
    const toggleSkillRequired = (skill) => {
        if (!skill.trim()) return;
        setNewTeamSkills((prev) => {
            if (prev.includes(skill)) return prev.filter((s) => s !== skill);
            if (prev.length >= 5) return prev;
            return [...prev, skill];
        });
        setSkillInput("");
    };

    const handleEventNameChange = (val) => {
        setEventInputName(val);
        const existing = events.find(e => e.name.toLowerCase() === val.toLowerCase());
        if (existing) {
            setIsNewEvent(false);
            setEventCategory(existing.category);
            setEventUrl(existing.url);
            setEventDeadline(existing.deadline);
        } else {
            setIsNewEvent(true);
            setEventCategory("");
            setEventUrl("");
            setEventDeadline("");
        }
    }

    const handleCreateTeamSubmit = async (e) => {
        e.preventDefault();

        // Require profile completion
        if (!requireProfile()) return;

        if (isNewEvent) {
            if (!eventCategory) { toast.error("Please select a category"); return; }
            if (!eventDeadline) { toast.error("Please set an event deadline"); return; }

            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to midnight
            const deadline = new Date(eventDeadline);
            deadline.setHours(0, 0, 0, 0); // Normalize to midnight

            const maxDate = new Date(today);
            maxDate.setDate(today.getDate() + 30);

            if (deadline > maxDate) { toast.error("Event deadline cannot be more than 30 days from today."); return; }
            if (deadline < today) { toast.error("Event deadline cannot be in the past."); return; }
        }

        const teamData = {
            teamName: newTeamName,
            teamDesc: newTeamDesc,
            teamSize: newTeamSize,
            skills: newTeamSkills,
            requiredActivities: requiredActivities,
            leader: newTeamLeader,
            eventName: eventInputName,
            category: eventCategory
        };

        const eventData = isNewEvent ? {
            name: eventInputName,
            category: eventCategory,
            deadline: eventDeadline,
            url: eventUrl
        } : null;

        const res = await addTeam(teamData, eventData);

        if (res.success) {
            // toast.success("Team created successfully! 🎉"); // Removed simple toast in favor of modal
            setTeamChoice(false);
            setNewTeamName(""); setNewTeamDesc(""); setNewTeamSize("");
            setNewTeamSkills([]); setRequiredActivities([]); setNewTeamLeader(""); setEventInputName("");
            setEventCategory(""); setEventDeadline(""); setEventUrl("");
            setIsNewEvent(true);

            // Show Success Modal with Link
            setCreatedTeamId(res.teamId);
            setShowCreationSuccessModal(true);
        } else {
            console.error("Creation failed:", res.error);
            toast.error(`Failed to create team: ${res.error?.message || "Unknown error"}`);
        }
    };

    const handleJoinRequest = async (e) => {
        e.preventDefault();
        if (!selectedTeam || !auth.currentUser || !userProfile) return;

        // Require profile completion
        if (!requireProfile()) return;

        setSendingRequest(true);
        try {
            // get user skills
            const userSkills = [...(userProfile.technicalSkills || []), ...(userProfile.softSkills || [])];

            const notificationRef = await addDoc(collection(dataBase, "notifications"), {
                type: "join_request",
                fromUserId: auth.currentUser.uid,
                fromUserName: userProfile.fullName,
                fromUserEmail: userProfile.nitpemail || userProfile.pemail,
                fromUserSkills: userSkills.slice(0, 5),
                toUserId: selectedTeam.createdBy,
                teamId: selectedTeam.id,
                teamName: selectedTeam.teamName,
                message: joinMessage,
                status: "pending",
                createdAt: serverTimestamp(),
                read: false,
            });

            // Send Email to Leader
            const leaderRef = doc(dataBase, "users", selectedTeam.createdBy);
            const leaderSnap = await getDoc(leaderRef);

            if (leaderSnap.exists()) {
                const leaderData = leaderSnap.data();
                const leaderEmail = leaderData.nitpemail || leaderData.pemail;
                const notificationLink = `${window.location.origin}/app/teams?notification_id=${notificationRef.id}`;

                const candidate = {
                    fullName: userProfile.fullName,
                    email: userProfile.nitpemail || userProfile.pemail,
                    branch: userProfile.branch,
                    skills: userSkills.join(", "),
                    notificationLink: notificationLink
                };

                const teamInfo = {
                    teamName: selectedTeam.teamName,
                    eventName: selectedTeam.eventName
                };

                await sendJoinRequestEmail(leaderEmail, leaderData.fullName, candidate, teamInfo);
            }

            toast.success("Request sent! The team leader will be notified via email. 📧");
            setOpenJoinModel(false);
            setJoinMessage("");
        } catch (error) {
            console.error("Error sending request:", error);
            toast.error("Failed to send request. Please try again.");
        } finally {
            setSendingRequest(false);
        }
    };

    const filteredTeams = eventFilter
        ? teams.filter((team) => team.eventName?.toLowerCase() === eventFilter.toLowerCase())
        : teams;

    return (
        <div className="teams--section">
            {/* Modal for Team Details */}
            {openDetailsModal && selectedTeam && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{selectedTeam.teamName}</h2>
                            <button onClick={() => setOpenDetailsModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'white' }}>×</button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Event</p>
                            <p style={{ fontWeight: '500', fontSize: '1.1rem', color: 'white' }}>🏆 {selectedTeam.eventName}</p>
                            {selectedTeam.eventUrl && <a href={selectedTeam.eventUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontSize: '0.9rem' }}>View Event Page</a>}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Description</p>
                            <p style={{ lineHeight: '1.6', color: 'white' }}>{selectedTeam.teamDesc}</p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Team Members ({selectedTeam.members?.length || 1}/{selectedTeam.teamSize})</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {allUsers
                                    .filter(u => selectedTeam.members?.includes(u.id))
                                    .map(u => (
                                        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: '#27272a', borderRadius: '0.5rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                {u.fullName[0]}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '500', color: 'white' }}>{u.fullName} {u.id === selectedTeam.createdBy && '👑'}</p>
                                                <p style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{u.branch} • {u.year}</p>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Required Skills</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {selectedTeam.skills?.map(s => (
                                    <span key={s} style={{ background: '#27272a', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setOpenDetailsModal(false)} style={{ padding: '0.75rem 1.5rem', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', borderRadius: '0.5rem', cursor: 'pointer', color: 'white' }}>Close</button>
                            {/* Hide join button if team is full or user already a member */}
                            {!selectedTeam.members?.includes(auth.currentUser?.uid) && (selectedTeam.members?.length || 1) < parseInt(selectedTeam.teamSize) && (
                                <button onClick={() => {
                                    if (!profileCompleted) {
                                        setOpenDetailsModal(false);
                                        setShowCompleteProfileModal(true);
                                    } else {
                                        setOpenDetailsModal(false);
                                        setOpenJoinModel(true);
                                    }
                                }} style={{ padding: '0.75rem 1.5rem', background: 'black', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
                                    Request to Join
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {openJoinModel && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ color: 'white' }}>Request to Join {selectedTeam?.teamName}</h3>
                        <textarea
                            placeholder="Why do you want to join? (Optional message)"
                            value={joinMessage}
                            onChange={(e) => setJoinMessage(e.target.value)}
                            style={{ width: '100%', height: '100px', margin: '1rem 0', padding: '0.5rem', background: '#27272a', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}
                        />
                        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setOpenJoinModel(false)}>Cancel</button>
                            <button onClick={handleJoinRequest} disabled={sendingRequest}>
                                {sendingRequest ? "Sending..." : "Send Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="choosing--team--type">
                <div className="team--browse"><button className={`team--option ${!teamChoice ? "team--choice" : ""}`} onClick={() => setTeamChoice(false)}>Browse Teams</button></div>
                <div className="team--formation"><button className={`team--create ${teamChoice ? "team--choice" : ""}`} onClick={() => {
                    if (!profileCompleted) {
                        setShowCompleteProfileModal(true);
                    } else {
                        setTeamChoice(true);
                    }
                }}>Create Team</button></div>
            </div>

            <div className="filtered--event">
                <h2>Event Filter:</h2>
                <p>{eventFilter || "All Events"}</p>
                {eventFilter && <button onClick={() => setSearchParams({})}>Clear Filter</button>}
            </div>

            {teamChoice ? (
                // CREATE TEAM FORM
                <div className="create--block">
                    <h2>Create a New Team</h2>
                    <div className="eventName" style={{ position: 'relative' }}>
                        <h2 className="create--heading">Event Name <span className="required">*</span></h2>
                        <input type="text" className="input--eventname" placeholder="Enter Event Name"
                            value={eventInputName}
                            onChange={(e) => {
                                handleEventNameChange(e.target.value);
                                setShowEventSuggestions(true);
                            }}
                            onFocus={() => setShowEventSuggestions(true)}
                            onBlur={() => {
                                // Delay hiding to allow click on suggestion
                                setTimeout(() => setShowEventSuggestions(false), 200);
                            }}
                        />

                        {/* Event Suggestions Dropdown */}
                        {showEventSuggestions && eventInputName.length > 0 && (
                            (() => {
                                const matchingEvents = events.filter(e =>
                                    e.name.toLowerCase().includes(eventInputName.toLowerCase()) &&
                                    e.name.toLowerCase() !== eventInputName.toLowerCase()
                                );

                                if (matchingEvents.length === 0) return null;

                                return (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        background: '#1a1a1a',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '0.5rem',
                                        marginTop: '0.25rem',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        zIndex: 100,
                                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
                                    }}>
                                        <p style={{
                                            padding: '0.5rem 1rem',
                                            fontSize: '0.75rem',
                                            color: '#6b7280',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                            margin: 0
                                        }}>
                                            Existing events matching your search:
                                        </p>
                                        {matchingEvents.slice(0, 5).map((event, idx) => (
                                            <div
                                                key={event.name + idx}
                                                onClick={() => {
                                                    handleEventNameChange(event.name);
                                                    setShowEventSuggestions(false);
                                                }}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    cursor: 'pointer',
                                                    borderBottom: idx < matchingEvents.slice(0, 5).length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#27272a'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <p style={{
                                                    margin: 0,
                                                    fontWeight: '600',
                                                    color: 'white',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    {event.name}
                                                </p>
                                                <p style={{
                                                    margin: '0.25rem 0 0 0',
                                                    fontSize: '0.8rem',
                                                    color: '#9ca3af'
                                                }}>
                                                    {event.category} • Deadline: {event.deadline || 'N/A'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()
                        )}
                    </div>

                    {isNewEvent && (
                        <div className="new-event-fields" style={{ background: '#0a0a0a', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <p style={{ fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '1rem' }}>New Event Details:</p>
                            <h2 className="create--heading">Category <span className="required">*</span></h2>
                            <select className="input--teamSize" value={eventCategory} onChange={(e) => setEventCategory(e.target.value)} style={{ marginBottom: '1rem' }}>
                                <option value="" disabled>Select Category</option>
                                {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                            <h2 className="create--heading">Deadline <span className="required">*</span></h2>
                            <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                <input
                                    type="date"
                                    className="input--teamname"
                                    value={eventDeadline}
                                    onChange={(e) => setEventDeadline(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        paddingRight: '2.5rem',
                                        background: '#27272a',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        colorScheme: 'dark'
                                    }}
                                />
                                <span style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                    fontSize: '1.2rem'
                                }}>📅</span>
                            </div>
                            <h2 className="create--heading">Event URL <span style={{ fontWeight: 'normal', color: '#a1a1aa' }}>(Optional)</span></h2>
                            <input type="url" className="input--teamname" placeholder="https://... (optional)" value={eventUrl} onChange={(e) => setEventUrl(e.target.value)} />
                        </div>
                    )}

                    <div className="teamName"><h2 className="create--heading">Team Name <span className="required">*</span></h2><input type="text" className="input--teamname" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} /></div>
                    <div className="teamDescription"><h2 className="create--heading">Description <span className="required">*</span></h2><input type="text" className="input--desc" value={newTeamDesc} onChange={(e) => setNewTeamDesc(e.target.value)} /></div>
                    <div className="teamSize"><h2 className="create--heading">Team Size <span className="required">*</span></h2>
                        <select className="input--teamSize" value={newTeamSize} onChange={(e) => setNewTeamSize(e.target.value)}>
                            <option value="">Select size</option>
                            {[2, 3, 4, 5, 6, 8, 10].map(n => <option key={n} value={n}>{n} members</option>)}
                        </select>
                    </div>

                    <div className="teamSkills"><h2 className="create--heading">Skills <span className="required">*</span></h2>
                        <input type="text" className="input--skills" placeholder="Add skill (Enter)" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') toggleSkillRequired(skillInput) }} />

                        {/* Selected Skills */}
                        <div className="skills--choosen">{newTeamSkills.map(s => <span key={s} className="added--skills" onClick={() => toggleSkillRequired(s)}>{s} ✕</span>)}</div>

                        {/* Skill Suggestions - Similar to Profile Logic */}
                        <div className="skill--suggestions" style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {["React.js", "Node.js", "Python", "Machine Learning", "UI/UX Design", "Java", "C++", "Data Science", "Flutter", "AWS",
                                "MongoDB", "Express.js", "Figma", "Docker", "Kubernetes", "Cybersecurity", "Blockchain", "DevOps",
                                "Android", "iOS", "Swift", "Kotlin", "Go", "Rust", "TypeScript", "Angular", "Vue.js", "Next.js",
                                "Firebase", "Digital Marketing", "Video Editing", "Content Writing", "Public Speaking", "Project Management"]
                                .filter(s => !newTeamSkills.includes(s) && s.toLowerCase().includes(skillInput.toLowerCase()))
                                .slice(0, 10) // Limit to 10 suggestions at a time to keep UI clean
                                .map(s => (
                                    <span key={s} onClick={() => toggleSkillRequired(s)} style={{
                                        background: '#27272a',
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        transition: 'all 0.2s',
                                        color: 'white'
                                    }}
                                        onMouseOver={(e) => e.target.style.background = '#3f3f46'}
                                        onMouseOut={(e) => e.target.style.background = '#27272a'}
                                    >
                                        + {s}
                                    </span>
                                ))
                            }
                        </div>
                    </div>

                    {/* Required Activities - Collapsible sections */}
                    <div className="teamActivities" style={{ marginTop: '1.5rem' }}>
                        <h2 className="create--heading">🎮 Required Activities <span style={{ fontWeight: 'normal', color: '#a1a1aa' }}>(Optional)</span></h2>
                        <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.75rem' }}>Click a category to select activities</p>

                        {/* Selected Activities */}
                        {requiredActivities.length > 0 && (
                            <div className="activities--chosen" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                {requiredActivities.map(a => (
                                    <span key={a} onClick={() => toggleActivity(a)} style={{
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        color: 'white'
                                    }}>
                                        {a} ✕
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Category Buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={() => setExpandedActivitySection(expandedActivitySection === 'sports' ? null : 'sports')}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    background: expandedActivitySection === 'sports' ? '#22c55e' : '#27272a',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem'
                                }}
                            >
                                ⚽ Sports {expandedActivitySection === 'sports' ? '▼' : '▶'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setExpandedActivitySection(expandedActivitySection === 'esports' ? null : 'esports')}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    background: expandedActivitySection === 'esports' ? '#8b5cf6' : '#27272a',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem'
                                }}
                            >
                                🎮 Esports {expandedActivitySection === 'esports' ? '▼' : '▶'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setExpandedActivitySection(expandedActivitySection === 'cultural' ? null : 'cultural')}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    background: expandedActivitySection === 'cultural' ? '#f59e0b' : '#27272a',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem'
                                }}
                            >
                                🎭 Cultural {expandedActivitySection === 'cultural' ? '▼' : '▶'}
                            </button>
                        </div>

                        {/* Sports Activities - Collapsible */}
                        {expandedActivitySection === 'sports' && (
                            <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#1a1a1a', borderRadius: '0.5rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {SPORTS_ACTIVITIES.filter(a => !requiredActivities.includes(a)).map(a => (
                                        <span key={a} onClick={() => toggleActivity(a)} style={{
                                            background: '#27272a',
                                            padding: '0.3rem 0.8rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white'
                                        }}>
                                            + {a}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Esports Activities - Collapsible */}
                        {expandedActivitySection === 'esports' && (
                            <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#1a1a1a', borderRadius: '0.5rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {ESPORTS_ACTIVITIES.filter(a => !requiredActivities.includes(a)).map(a => (
                                        <span key={a} onClick={() => toggleActivity(a)} style={{
                                            background: '#27272a',
                                            padding: '0.3rem 0.8rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white'
                                        }}>
                                            + {a}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cultural Activities - Collapsible */}
                        {expandedActivitySection === 'cultural' && (
                            <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#1a1a1a', borderRadius: '0.5rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {CULTURAL_ACTIVITIES.filter(a => !requiredActivities.includes(a)).map(a => (
                                        <span key={a} onClick={() => toggleActivity(a)} style={{
                                            background: '#27272a',
                                            padding: '0.3rem 0.8rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white'
                                        }}>
                                            + {a}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="teamLeader"><h2 className="create--heading">Leader Name</h2><input type="text" className="input--leader" value={newTeamLeader} onChange={(e) => setNewTeamLeader(e.target.value)} /></div>

                    <div className="team--submission">
                        <button className="team--submit" onClick={handleCreateTeamSubmit} disabled={!newTeamName || !eventInputName}>Create Team</button>
                    </div>
                </div>
            ) : (
                // BROWSE TEAMS
                <div className="browse--block">
                    {filteredTeams.length === 0 ? <p className="no-results">No teams found.</p> : (
                        <div className="card--section">
                            {filteredTeams.map(team => {
                                // Resolve Member Names
                                const memberNames = allUsers
                                    .filter(u => team.members?.includes(u.id))
                                    .map(u => u.fullName)
                                    .join(", ");

                                // Resolve Leader Name if not directly available, or just verify
                                const leaderUser = allUsers.find(u => u.id === team.createdBy);
                                const leaderName = team.leader || leaderUser?.fullName || "Unknown";

                                const isFull = (team.members?.length || 1) >= parseInt(team.teamSize);

                                return (
                                    <div
                                        key={team.id}
                                        className="team--card"
                                        style={{
                                            position: 'relative',
                                            cursor: 'pointer',
                                            opacity: isFull ? 0.6 : 1,
                                            background: isFull ? '#1a1a1a' : '#0a0a0a'
                                        }}
                                        onClick={() => { setSelectedTeam(team); setOpenDetailsModal(true); }}
                                    >
                                        {isFull && (
                                            <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#ef4444', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                FULL
                                            </div>
                                        )}
                                        <h3 className="browse---teamName">{team.teamName}</h3>
                                        <p className="browse--eventName">🏆 {team.eventName}</p>

                                        <div style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#a1a1aa' }}>
                                            <p><strong style={{ color: 'white' }}>👑 Leader:</strong> {leaderName}</p>
                                            <p><strong style={{ color: 'white' }}>📝 Desc:</strong> {team.teamDesc}</p>
                                            <p><strong style={{ color: 'white' }}>👥 Members ({team.members?.length || 1}/{team.teamSize}):</strong> {memberNames || leaderName}</p>
                                        </div>

                                        <div className="skill--area">{team.skills?.map(s => <span key={s} className="skill--selected">{s}</span>)}</div>

                                        {team.members?.includes(auth.currentUser?.uid) ? (
                                            <button className="browse--Request" disabled style={{ background: '#dcfce7', color: '#166534', cursor: 'default' }}>Joined</button>
                                        ) : isFull ? (
                                            <button className="browse--Request" disabled style={{ background: '#27272a', color: '#71717a', cursor: 'not-allowed' }}>Team Full</button>
                                        ) : (
                                            <button className="browse--Request" onClick={(e) => {
                                                e.stopPropagation();
                                                if (!profileCompleted) {
                                                    setShowCompleteProfileModal(true);
                                                } else {
                                                    setSelectedTeam(team);
                                                    setOpenJoinModel(true);
                                                }
                                            }}>Request to Join</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )
            }

            {/* Complete Profile Modal */}
            <CompleteProfileModal
                isOpen={showCompleteProfileModal}
                onClose={() => setShowCompleteProfileModal(false)}
            />
            {/* Complete Profile Modal */}
            <CompleteProfileModal
                isOpen={showCompleteProfileModal}
                onClose={() => setShowCompleteProfileModal(false)}
            />

            {/* Direct Join Modal */}
            {showDirectJoinModal && directJoinTeam && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div className="modal-content" style={{
                        background: '#0a0a0a',
                        padding: '2.5rem',
                        borderRadius: '1.5rem',
                        width: '90%',
                        maxWidth: '550px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        border: '1px solid rgba(255,255,255,0.1)',
                        textAlign: 'center',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>You've been invited!</h2>
                        <p style={{ color: '#a1a1aa', fontSize: '1.1rem', marginBottom: '2rem' }}>
                            You are about to join <strong style={{ color: 'white' }}>{directJoinTeam.teamName}</strong> for <strong style={{ color: '#60a5fa' }}>{directJoinTeam.eventName}</strong>.
                        </p>

                        <div style={{
                            background: '#18181b',
                            padding: '1.5rem',
                            borderRadius: '1rem',
                            marginBottom: '2rem',
                            textAlign: 'left'
                        }}>
                            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>📝 Description</p>
                            <p style={{ color: 'white', marginBottom: '1rem', lineHeight: '1.5' }}>{directJoinTeam.teamDesc}</p>

                            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>👥 Current Members</p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {/* Just showing count for simplicity, names avail via context if needed */}
                                <span style={{ color: 'white', fontSize: '0.95rem' }}>
                                    {directJoinTeam.members?.length || 1} / {directJoinTeam.teamSize} members
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button
                                onClick={handleDirectJoin}
                                disabled={joiningDirectly}
                                style={{
                                    padding: '1rem',
                                    background: 'white',
                                    color: 'black',
                                    borderRadius: '0.75rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    transition: 'transform 0.1s'
                                }}
                            >
                                {joiningDirectly ? "Joining..." : "Join Team Now"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDirectJoinModal(false);
                                    setSearchParams(params => {
                                        params.delete("directJoin");
                                        return params;
                                    });
                                }}
                                style={{
                                    padding: '1rem',
                                    background: 'transparent',
                                    color: '#a1a1aa',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                No, thanks
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Creation Success Modal */}
            {showCreationSuccessModal && createdTeamId && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div className="modal-content" style={{
                        background: '#0a0a0a',
                        padding: '2.5rem',
                        borderRadius: '1.5rem',
                        width: '90%',
                        maxWidth: '500px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        textAlign: 'center',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>Team Created!</h2>
                        <p style={{ color: '#a1a1aa', fontSize: '1.1rem', marginBottom: '2rem' }}>
                            Your team is ready. Share this link to let others join instantly directly:
                        </p>

                        <div style={{
                            background: '#18181b',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            marginBottom: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <input
                                type="text"
                                readOnly
                                value={`${window.location.origin}/app/teams?directJoin=${createdTeamId}`}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#a1a1aa',
                                    flex: 1,
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    textOverflow: 'ellipsis'
                                }}
                            />
                            <button
                                onClick={() => {
                                    const link = `${window.location.origin}/app/teams?directJoin=${createdTeamId}`;
                                    navigator.clipboard.writeText(link);
                                    toast.success("Link copied!");
                                }}
                                style={{
                                    background: 'white',
                                    color: 'black',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    fontWeight: '600',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Copy
                            </button>
                        </div>

                        <button
                            onClick={() => setShowCreationSuccessModal(false)}
                            style={{
                                padding: '0.8rem 2rem',
                                background: '#27272a',
                                color: 'white',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Teams;
