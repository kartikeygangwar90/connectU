import React, { useState, useEffect, useContext } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { TeamContext } from "../../context/TeamContext";
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { dataBase, auth } from "../../firebase";
import { sendJoinRequestEmail } from "../../utils/emailService";
import toast from "react-hot-toast";

const CATEGORIES = [
    { id: "research", name: "Research" },
    { id: "hackathon", name: "Hackathon" },
    { id: "startup", name: "Startup" },
    { id: "sports", name: "Sports" },
    { id: "esports", name: "Esports" },
    { id: "cultural", name: "Cultural" },
];

const Teams = () => {
    const { teams, events, userProfile, allUsers } = useOutletContext();
    const { addTeam } = useContext(TeamContext);
    const [searchParams, setSearchParams] = useSearchParams();

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

    const [openJoinModel, setOpenJoinModel] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [joinMessage, setJoinMessage] = useState("");
    const [sendingRequest, setSendingRequest] = useState(false);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);

    // Initialize Event Name if passed via URL
    useEffect(() => {
        if (eventFilter) {
            // Note: If we are in "Create Team" mode, we might want to pre-fill this?
            // For now, the filter applies to "Browse Teams".
        }
    }, [eventFilter]);

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

        if (isNewEvent) {
            if (!eventCategory) { toast.error("Please select a category"); return; }
            if (!eventDeadline) { toast.error("Please set an event deadline"); return; }
            if (!eventUrl) { toast.error("Please provide an event URL"); return; }

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
            toast.success("Team created successfully! 🎉");
            setTeamChoice(false);
            setNewTeamName(""); setNewTeamDesc(""); setNewTeamSize("");
            setNewTeamSkills([]); setNewTeamLeader(""); setEventInputName("");
            setEventCategory(""); setEventDeadline(""); setEventUrl("");
            setIsNewEvent(true);
        } else {
            console.error("Creation failed:", res.error);
            toast.error(`Failed to create team: ${res.error?.message || "Unknown error"}`);
        }
    };

    const handleJoinRequest = async (e) => {
        e.preventDefault();
        if (!selectedTeam || !auth.currentUser || !userProfile) return;

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
                                <button onClick={() => { setOpenDetailsModal(false); setOpenJoinModel(true); }} style={{ padding: '0.75rem 1.5rem', background: 'black', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
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
                <div className="team--formation"><button className={`team--create ${teamChoice ? "team--choice" : ""}`} onClick={() => setTeamChoice(true)}>Create Team</button></div>
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
                    <div className="eventName">
                        <h2 className="create--heading">Event Name <span className="required">*</span></h2>
                        <input type="text" className="input--eventname" placeholder="Enter Event Name"
                            value={eventInputName} onChange={(e) => handleEventNameChange(e.target.value)} />
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
                            <h2 className="create--heading">Event URL <span className="required">*</span></h2>
                            <input type="url" className="input--teamname" placeholder="https://..." value={eventUrl} onChange={(e) => setEventUrl(e.target.value)} />
                        </div>
                    )}

                    <div className="teamName"><h2 className="create--heading">Team Name <span className="required">*</span></h2><input type="text" className="input--teamname" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} /></div>
                    <div className="teamDescription"><h2 className="create--heading">Description <span className="required">*</span></h2><input type="text" className="input--desc" value={newTeamDesc} onChange={(e) => setNewTeamDesc(e.target.value)} /></div>
                    <div className="teamSize"><h2 className="create--heading">Team Size <span className="required">*</span></h2>
                        <select className="input--teamSize" value={newTeamSize} onChange={(e) => setNewTeamSize(e.target.value)}>
                            <option value="">Select size</option>
                            {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} members</option>)}
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
                                            <button className="browse--Request" onClick={(e) => { e.stopPropagation(); setSelectedTeam(team); setOpenJoinModel(true); }}>Request to Join</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Teams;
