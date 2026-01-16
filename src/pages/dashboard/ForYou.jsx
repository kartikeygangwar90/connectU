import React, { useMemo, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { dataBase, auth } from "../../firebase";
import { sendJoinRequestEmail } from "../../utils/emailService";
import toast from "react-hot-toast";
import CompleteProfileModal from "../../components/modals/CompleteProfileModal";

const ForYou = () => {
    const { teams, userProfile, allUsers, profileCompleted } = useOutletContext();
    const navigate = useNavigate();

    // Helper to check profile completion before restricted actions
    const requireProfile = () => {
        if (!profileCompleted) {
            setShowCompleteProfileModal(true);
            return false;
        }
        return true;
    };

    const [selectedTeam, setSelectedTeam] = useState(null);
    const [joinMessage, setJoinMessage] = useState("");
    const [openJoinModel, setOpenJoinModel] = useState(false);
    const [sendingRequest, setSendingRequest] = useState(false);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);

    // Helpers
    const normalizeSkill = (skill) => skill.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

    const userSkills = useMemo(() => {
        if (!userProfile) return [];
        return [
            ...(userProfile.technicalSkills || []),
            ...(userProfile.softSkills || []),
        ];
    }, [userProfile]);

    const userActivities = useMemo(() => {
        if (!userProfile) return [];
        return userProfile.activities || [];
    }, [userProfile]);

    const forYouTeams = useMemo(() => {
        if (!userProfile) return [];

        const NON_TECHNICAL_CATEGORIES = ["sports", "esports", "cultural"];

        // Helper function for category-aware matching
        const calculateMatch = (team) => {
            const teamCategory = (team.category || "").toLowerCase();
            const isNonTechnical = NON_TECHNICAL_CATEGORIES.includes(teamCategory);
            const teamSkills = team.skills || [];
            const userCategoryInterests = (userProfile.categoryInterests || []).map(c => c.toLowerCase());

            // Base score starts at 0
            let totalScore = 0;

            // Category Interest Boost (20 points if user has this category in interests)
            if (userCategoryInterests.includes(teamCategory)) {
                totalScore += 20;
            }

            // Skill/Activity Matching (50 points max)
            if (teamSkills.length > 0) {
                let relevantUserSkills;

                if (isNonTechnical) {
                    // For Sports/Esports/Cultural - use activities
                    relevantUserSkills = userActivities.map(normalizeSkill);
                } else {
                    // For Research/Hackathon/Startup - use technical skills
                    relevantUserSkills = userSkills.map(normalizeSkill);
                }

                const teamSkillsNormalized = teamSkills.map(normalizeSkill);
                const matchedSkills = teamSkillsNormalized.filter(s => relevantUserSkills.includes(s));
                totalScore += (matchedSkills.length / teamSkills.length) * 50;
            } else {
                // If team has no specific skills, give partial score
                totalScore += 25;
            }

            // Interest Match Boost (30 points if event name matches user interests)
            const userInterests = userProfile.interests || [];
            if (userInterests.some((i) => team.eventName?.toLowerCase().includes(i.toLowerCase()))) {
                totalScore += 30;
            }

            return Math.round(totalScore);
        };

        return teams
            .map((team) => ({
                ...team,
                matchPercent: calculateMatch(team),
            }))
            .filter((team) => team.matchPercent >= 20)
            .sort((a, b) => b.matchPercent - a.matchPercent);
    }, [teams, userSkills, userActivities, userProfile]);

    const handleJoinRequest = async () => {
        if (!selectedTeam) return;

        // Require profile completion
        if (!requireProfile()) return;

        setSendingRequest(true);
        try {
            const notificationRef = await addDoc(collection(dataBase, "notifications"), {
                type: "join_request",
                fromUserId: auth.currentUser.uid,
                fromUserName: userProfile.fullName,
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
                const notificationLink = `${window.location.origin}/app/recommendations?notification_id=${notificationRef.id}`;

                const candidate = {
                    fullName: userProfile.fullName,
                    email: userProfile.nitpemail || userProfile.pemail,
                    branch: userProfile.branch,
                    skills: (userSkills || []).join(", "),
                    notificationLink: notificationLink
                };

                const teamInfo = {
                    teamName: selectedTeam.teamName,
                    eventName: selectedTeam.eventName
                };

                await sendJoinRequestEmail(leaderEmail, leaderData.fullName, candidate, teamInfo);
            }

            toast.success("Request sent! Leader notified via email. 📧");
            setOpenJoinModel(false);
            setJoinMessage("");
        } catch (e) {
            console.error(e);
            toast.error("Failed to send request. Please try again.");
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <div className="for-you--section">
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
                            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Match Score</p>
                            <span style={{ background: 'white', color: 'black', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontWeight: '500' }}>
                                {selectedTeam.matchPercent}% Match
                            </span>
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
                                    ? allUsers
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
                                    : <p style={{ color: '#a1a1aa' }}>Loading members...</p>
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
                <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
                    <div className="modal-content" style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ color: 'white' }}>Request to Join {selectedTeam?.teamName}</h3>
                        <textarea
                            value={joinMessage}
                            onChange={e => setJoinMessage(e.target.value)}
                            placeholder="Why do you want to join? (Optional)"
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

            <h1 className="section--heading">Recommended for You</h1>
            <div className="card--section">
                {forYouTeams.map(team => {
                    // Resolve details
                    const memberNames = allUsers
                        ? allUsers.filter(u => team.members?.includes(u.id)).map(u => u.fullName).join(", ")
                        : "";
                    const leaderUser = allUsers?.find(u => u.id === team.createdBy);
                    const leaderName = team.leader || leaderUser?.fullName || "Unknown";

                    const isFull = (team.members?.length || 1) >= parseInt(team.teamSize);

                    return (
                        <div
                            key={team.id}
                            className="foryou--team--card"
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
                            <div className="match--badge" style={{ left: '0.5rem', right: 'auto' }}>{team.matchPercent}% Match</div>
                            <h3>{team.teamName}</h3>
                            <p style={{ marginTop: '0.5rem', fontWeight: '500' }}>🏆 {team.eventName}</p>

                            <div style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#a1a1aa' }}>
                                <p><strong style={{ color: 'white' }}>👑 Leader:</strong> {leaderName}</p>
                                <p><strong style={{ color: 'white' }}>👥 Members:</strong> {memberNames || leaderName}</p>
                            </div>

                            <div className="skill--arena">
                                {team.skills?.map(s => {
                                    const isMatched = userSkills.map(sk => sk.toLowerCase()).includes(s.toLowerCase());
                                    return (
                                        <span
                                            key={s}
                                            className={`skill--selected ${isMatched ? 'skill-matched' : 'skill-unmatched'}`}
                                            title={isMatched ? 'You have this skill!' : 'Skill you can learn'}
                                        >
                                            {isMatched && '✓ '}{s}
                                        </span>
                                    );
                                })}
                            </div>

                            {team.members?.includes(auth.currentUser?.uid) ? (
                                <button className="browse--request" disabled style={{ background: '#dcfce7', color: '#166534', cursor: 'default' }}>Joined</button>
                            ) : isFull ? (
                                <button className="browse--request" disabled style={{ background: '#27272a', color: '#71717a', cursor: 'not-allowed' }}>Team Full</button>
                            ) : (
                                <button className="browse--request" onClick={(e) => { 
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
                {forYouTeams.length === 0 && <p className="no-results">No recommendations yet. Complete your profile!</p>}
            </div>

            {/* Complete Profile Modal */}
            <CompleteProfileModal 
                isOpen={showCompleteProfileModal}
                onClose={() => setShowCompleteProfileModal(false)}
            />
        </div>
    );
};

export default ForYou;
