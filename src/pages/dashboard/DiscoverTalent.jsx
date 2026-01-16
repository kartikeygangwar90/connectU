import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { dataBase, auth } from "../../firebase";
import { sendInviteEmail } from "../../utils/emailService";
import toast from "react-hot-toast";
import CompleteProfileModal from "../../components/modals/CompleteProfileModal";

const DiscoverTalent = () => {
    const { allUsers, teams, userProfile, searchQuery, searchBySkill, profileCompleted } = useOutletContext();
    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState(null);
    const [inviteTeamId, setInviteTeamId] = useState("");
    const [inviteMessage, setInviteMessage] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);

    // Helper to check profile completion before restricted actions
    const requireProfile = () => {
        if (!profileCompleted) {
            setShowCompleteProfileModal(true);
            return false;
        }
        return true;
    };

    // Filter teams to only those created by the current user
    const myTeams = teams.filter(t => t.createdBy === auth.currentUser?.uid);

    // Filter users based on search query - names/skills should START WITH the query
    const filteredUsers = React.useMemo(() => {
        if (!searchQuery || !searchQuery.trim()) {
            return allUsers;
        }
        const query = searchQuery.toLowerCase().trim();

        return allUsers.filter((user) => {
            if (searchBySkill) {
                // When searching by skill, filter users whose skills start with the query
                return user.technicalSkills?.some((skill) =>
                    skill.toLowerCase().startsWith(query)
                ) || user.softSkills?.some((skill) =>
                    skill.toLowerCase().startsWith(query)
                );
            } else {
                // Default: filter users whose names start with the query
                return user.fullName?.toLowerCase().startsWith(query);
            }
        });
    }, [allUsers, searchQuery, searchBySkill]);

    const handleInvite = async () => {
        if (!selectedUser || !inviteTeamId) return;

        // Require profile completion
        if (!requireProfile()) return;

        setIsInviting(true);
        try {
            const teamToInviteTo = myTeams.find(t => t.id === inviteTeamId);

            const notificationRef = await addDoc(collection(dataBase, "notifications"), {
                type: "team_invite",
                fromUserId: auth.currentUser.uid,
                fromUserName: userProfile.fullName,
                toUserId: selectedUser.id,
                teamId: teamToInviteTo.id,
                teamName: teamToInviteTo.teamName,
                message: inviteMessage || `Hey! I'd like to invite you to join my team "${teamToInviteTo.teamName}".`,
                status: "pending",
                createdAt: serverTimestamp(),
                read: false,
            });

            // Send Email to Candidate
            const candidateEmail = selectedUser.nitpemail || selectedUser.pemail;

            if (candidateEmail) {
                const notificationLink = `${window.location.origin}/app/discover?notification_id=${notificationRef.id}`;
                const leader = {
                    fullName: userProfile.fullName,
                    email: userProfile.nitpemail || userProfile.pemail,
                    notificationLink: notificationLink
                };

                const teamInfo = {
                    teamName: teamToInviteTo.teamName,
                    eventName: teamToInviteTo.eventName,
                    teamDesc: teamToInviteTo.teamDesc
                };

                await sendInviteEmail(candidateEmail, selectedUser.fullName, leader, teamInfo);
            }

            toast.success("Invitation sent successfully! Candidate notified via email. 📧");
            setSelectedUser(null);
            setInviteMessage("");
            setInviteTeamId("");
        } catch (error) {
            console.error("Error sending invite:", error);
            toast.error("Failed to send invite. Please try again.");
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="discover--section">
            <h1 className="section--heading">Discover Teammates</h1>
            <p className="section--desc">Find students with the skills you need for your team</p>

            {/* Reuse user card grid */}
            <div className="users-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem'
            }}>
                {filteredUsers.length === 0 ? (
                    <p style={{ color: '#a1a1aa', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                        {searchQuery?.trim()
                            ? `No users found ${searchBySkill ? 'with skills' : 'with names'} starting with "${searchQuery}"`
                            : 'No other users found. Be the first to complete your profile!'}
                    </p>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user.id} className="user-card" style={{
                            background: '#0a0a0a', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex', flexDirection: 'column', gap: '1rem'
                        }}>
                            <div className="user-card-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div className="user-avatar-large" style={{
                                    width: '50px', height: '50px', background: '#3b82f6', color: 'white', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold'
                                }}>
                                    {user.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <div className="user-card-info">
                                    <h3 style={{ margin: 0, color: 'white' }}>{user.fullName}</h3>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#a1a1aa' }}>{user.branch} • Year {user.year}</p>
                                    {user.roll && <p style={{ margin: 0, fontSize: '0.85rem', color: '#71717a' }}>Roll No: {user.roll}</p>}
                                    <span style={{
                                        display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem',
                                        background: user.availability === "Yes" ? 'white' : '#27272a',
                                        color: user.availability === "Yes" ? 'black' : '#a1a1aa', marginTop: '0.25rem'
                                    }}>
                                        {user.availability === "Yes" ? "✓ Available" : "Not Available"}
                                    </span>
                                </div>
                            </div>

                            <div className="user-card-skills">
                                <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Technical Skills:</p>
                                <div className="skills-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {user.technicalSkills?.slice(0, 4).map((skill, i) => (
                                        <span key={i} className="skill-tag" style={{ background: '#27272a', padding: '0.25rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.85rem', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>{skill}</span>
                                    ))}
                                    {user.technicalSkills?.length > 4 && <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>+{user.technicalSkills.length - 4}</span>}
                                </div>
                            </div>

                            {/* Activities (Sports, Esports, Cultural) */}
                            {user.activities && user.activities.length > 0 && user.activities[0] !== "None" && (
                                <div className="user-card-activities">
                                    <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}>🎯 Activities:</p>
                                    <div className="activities-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {user.activities?.slice(0, 4).map((activity, i) => (
                                            <span key={i} style={{
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.4rem',
                                                fontSize: '0.85rem',
                                                color: 'white'
                                            }}>
                                                {activity}
                                            </span>
                                        ))}
                                        {user.activities?.length > 4 && <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>+{user.activities.length - 4}</span>}
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                                {user.pemail && (
                                    <a href={`mailto:${user.pemail}`} style={{
                                        flex: 1, padding: '0.5rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem',
                                        textDecoration: 'none', color: 'white'
                                    }}>
                                        📧 Email
                                    </a>
                                )}
                                <button
                                    onClick={() => {
                                        if (!profileCompleted) {
                                            setShowCompleteProfileModal(true);
                                        } else {
                                            setSelectedUser(user);
                                            // Auto-select first team if available
                                            if (myTeams.length > 0) setInviteTeamId(myTeams[0].id);
                                        }
                                    }}
                                    style={{
                                        flex: 2, padding: '0.5rem', background: 'white', color: 'black', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600
                                    }}
                                >
                                    👋 Invite to Team
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* INVITE MODAL */}
            {selectedUser && (
                <div className="modal-overlay" style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ color: 'white' }}>Invite {selectedUser.fullName}</h3>

                        {myTeams.length === 0 ? (
                            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                                <p>You don't have any teams to invite them to yet.</p>
                                <button onClick={() => setSelectedUser(null)} style={{ marginTop: '1rem' }}>Close</button>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'white' }}>Select Your Team:</label>
                                    <select
                                        value={inviteTeamId}
                                        onChange={(e) => setInviteTeamId(e.target.value)}
                                        style={{ width: '100%', padding: '0.5rem', background: '#27272a', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}
                                    >
                                        {myTeams.map(t => (
                                            <option key={t.id} value={t.id}>{t.teamName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'white' }}>Message (Optional):</label>
                                    <textarea
                                        value={inviteMessage}
                                        onChange={(e) => setInviteMessage(e.target.value)}
                                        placeholder="Add a personal note..."
                                        style={{ width: '100%', height: '80px', padding: '0.5rem', background: '#27272a', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setSelectedUser(null)} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem', color: 'white' }}>Cancel</button>
                                    <button
                                        onClick={handleInvite}
                                        disabled={isInviting || !inviteTeamId}
                                        style={{ padding: '0.5rem 1rem', background: 'white', color: 'black', border: 'none', borderRadius: '0.5rem', fontWeight: 600 }}
                                    >
                                        {isInviting ? "Sending..." : "Send Invite"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Complete Profile Modal */}
            <CompleteProfileModal 
                isOpen={showCompleteProfileModal}
                onClose={() => setShowCompleteProfileModal(false)}
            />
        </div>
    );
};

export default DiscoverTalent;
