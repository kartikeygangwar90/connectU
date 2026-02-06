import React, { useState, useContext } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { auth, dataBase } from "../../firebase";
import { doc, updateDoc, arrayRemove, collection, query, where, orderBy, onSnapshot, deleteDoc } from "firebase/firestore";
import TeamEditModal from "../../components/modals/TeamEditModal";
import ProfileEditModal from "../../components/modals/ProfileEditModal";
import toast from "react-hot-toast";
import { TeamContext } from "../../context/TeamContext";
import { useBookmarks } from "../../hooks/useBookmarks";
import { calculateBadges, BadgeCollection, ProfileCompleteness } from "../../components/ui/BadgeSystem";
import ProjectCard from "../../components/ui/ProjectCard";
import ProjectEditModal from "../../components/modals/ProjectEditModal";
import useGitHub, { getLanguageColor, formatCount } from "../../hooks/useGitHub";
import SkeletonGitHub from "../../components/ui/SkeletonGitHub";

const SKILL_SUGGESTIONS = [
    "React.js", "Node.js", "Python", "Machine Learning", "UI/UX Design", "Java", "C++", "Data Science", "Flutter", "AWS",
    "MongoDB", "Express.js", "Figma", "Docker", "Kubernetes", "Cybersecurity", "Blockchain", "DevOps",
    "Android", "iOS", "Swift", "Kotlin", "Go", "Rust", "TypeScript", "Angular", "Vue.js", "Next.js",
    "Firebase", "Digital Marketing", "Video Editing", "Content Writing", "Public Speaking", "Project Management"
];

/**
 * GitHub Section Component - Displays GitHub profile and top repositories
 */
const GitHubSection = ({ username }) => {
    const { profile, repos, loading, error, refresh } = useGitHub(username);

    if (loading) {
        return <SkeletonGitHub />;
    }

    if (error) {
        return (
            <div className="teammates--section" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <h2 className="section--heading">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub Profile
                </h2>
                <div style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '0.75rem',
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ color: '#ef4444' }}>⚠️ {error}</span>
                    <button
                        onClick={refresh}
                        style={{
                            padding: '0.4rem 0.8rem',
                            background: '#27272a',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="teammates--section" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="section--heading" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub Profile
                </h2>
                <a
                    href={profile.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        padding: '0.4rem 0.8rem',
                        background: '#27272a',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}
                >
                    View on GitHub ↗
                </a>
            </div>

            {/* Profile Stats */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    background: '#0a0a0a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <img
                        src={profile.avatar_url}
                        alt={profile.login}
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            border: '2px solid rgba(255,255,255,0.1)'
                        }}
                    />
                    <div>
                        <p style={{ margin: 0, fontWeight: 600, color: 'white' }}>@{profile.login}</p>
                        {profile.bio && (
                            <p style={{ margin: '0.25rem 0 0', color: '#a1a1aa', fontSize: '0.85rem' }}>
                                {profile.bio.slice(0, 60)}{profile.bio.length > 60 && '...'}
                            </p>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{
                        background: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.75rem',
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                        minWidth: '80px'
                    }}>
                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
                            {formatCount(profile.public_repos)}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#71717a' }}>Repos</p>
                    </div>
                    <div style={{
                        background: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.75rem',
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                        minWidth: '80px'
                    }}>
                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
                            {formatCount(profile.followers)}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#71717a' }}>Followers</p>
                    </div>
                    <div style={{
                        background: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.75rem',
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                        minWidth: '80px'
                    }}>
                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
                            {formatCount(profile.following)}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#71717a' }}>Following</p>
                    </div>
                </div>
            </div>

            {/* Top Repositories */}
            {repos.length > 0 && (
                <>
                    <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '0.75rem' }}>Top Repositories</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '0.75rem'
                    }}>
                        {repos.map(repo => (
                            <a
                                key={repo.id}
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    background: '#0a0a0a',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.75rem',
                                    padding: '1rem',
                                    textDecoration: 'none',
                                    transition: 'border-color 0.2s, transform 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h4 style={{ margin: 0, color: '#3b82f6', fontSize: '0.95rem', fontWeight: 600 }}>
                                        📁 {repo.name}
                                    </h4>
                                    {repo.stargazers_count > 0 && (
                                        <span style={{ color: '#fbbf24', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            ⭐ {formatCount(repo.stargazers_count)}
                                        </span>
                                    )}
                                </div>
                                {repo.description && (
                                    <p style={{
                                        margin: '0 0 0.5rem',
                                        color: '#a1a1aa',
                                        fontSize: '0.85rem',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {repo.description}
                                    </p>
                                )}
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    {repo.language && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#a1a1aa' }}>
                                            <span style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                background: getLanguageColor(repo.language)
                                            }} />
                                            {repo.language}
                                        </span>
                                    )}
                                    {repo.forks_count > 0 && (
                                        <span style={{ fontSize: '0.8rem', color: '#71717a' }}>
                                            🍴 {repo.forks_count}
                                        </span>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const ProfileView = () => {
    const { userProfile, teams, allUsers, profileCompleted } = useOutletContext();
    const { leaveTeam, deleteTeam, transferLeadership } = useContext(TeamContext);
    const navigate = useNavigate();

    // Bookmarks Hook
    const { bookmarkedTeams, bookmarkedUsers, toggleBookmarkTeam, toggleBookmarkUser } = useBookmarks();


    // Team Management State
    const [editingTeam, setEditingTeam] = useState(null);

    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editSize, setEditSize] = useState("");
    const [editSkills, setEditSkills] = useState([]);
    const [skillInput, setSkillInput] = useState("");
    const [saving, setSaving] = useState(false);

    // Profile Edit Modal State
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({});
    const [profileSkillInput, setProfileSkillInput] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    // Team Action States
    const [leavingTeam, setLeavingTeam] = useState(null);
    const [deletingTeam, setDeletingTeam] = useState(null);
    const [transferringTeam, setTransferringTeam] = useState(null);
    const [selectedNewLeader, setSelectedNewLeader] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    // Request History State
    const [sentRequests, setSentRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);

    // Project Portfolio State
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    // Fetch Sent Requests
    React.useEffect(() => {
        if (!auth.currentUser) return;

        const q = query(
            collection(dataBase, "notifications"),
            where("fromUserId", "==", auth.currentUser.uid),
            where("type", "==", "join_request"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSentRequests(requests);
            setLoadingRequests(false);
        });

        return () => unsubscribe();
    }, []);

    // Cancel Request Handler
    const handleCancelRequest = async (requestId) => {
        if (!confirm("Are you sure you want to cancel this request?")) return;
        try {
            await deleteDoc(doc(dataBase, "notifications", requestId));
            toast.success("Request cancelled successfully");
        } catch (error) {
            console.error("Error cancelling request:", error);
            toast.error("Failed to cancel request");
        }
    };

    // Open Profile Edit Modal
    const openProfileEditModal = () => {
        setProfileData({
            fullName: userProfile?.fullName || "",
            bio: userProfile?.bio || "",
            phone: userProfile?.phone || "",
            pemail: userProfile?.pemail || "",
            nitpemail: userProfile?.nitpemail || "",
            availability: userProfile?.availability || "",
            technicalSkills: userProfile?.technicalSkills || [],
            softSkills: userProfile?.softSkills || [],
            experience: userProfile?.experience || "",
            year: userProfile?.year || "",
            branch: userProfile?.branch || "",
            githubUsername: userProfile?.githubUsername || ""
        });
        setEditingProfile(true);
    };

    // Close Profile Edit Modal
    const closeProfileEditModal = () => {
        setEditingProfile(false);
        setProfileData({});
        setProfileSkillInput("");
    };

    // Toggle Technical Skill
    const toggleProfileTechSkill = (skill) => {
        if (!skill.trim()) return;
        setProfileData(prev => ({
            ...prev,
            technicalSkills: prev.technicalSkills.includes(skill)
                ? prev.technicalSkills.filter(s => s !== skill)
                : prev.technicalSkills.length < 10 ? [...prev.technicalSkills, skill] : prev.technicalSkills
        }));
        setProfileSkillInput("");
    };

    // Toggle Soft Skill
    const toggleProfileSoftSkill = (skill) => {
        if (!skill.trim()) return;
        setProfileData(prev => ({
            ...prev,
            softSkills: prev.softSkills.includes(skill)
                ? prev.softSkills.filter(s => s !== skill)
                : prev.softSkills.length < 10 ? [...prev.softSkills, skill] : prev.softSkills
        }));
    };

    // Save Profile Changes
    const handleSaveProfile = async () => {
        if (!auth.currentUser) return;
        setSavingProfile(true);
        try {
            await updateDoc(doc(dataBase, "users", auth.currentUser.uid), {
                ...profileData,
                profileCompleted: true // Ensure this flag is set
            });
            toast.success("Profile updated successfully!");
            closeProfileEditModal();
            // Navigate to same page to trigger data refetch without full page reload
            navigate(0); // React Router's way to refresh current route
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile: " + error.message);
        } finally {
            setSavingProfile(false);
        }
    };


    const createdTeams = teams.filter(t => t.createdBy === auth.currentUser?.uid);
    const joinedTeams = teams.filter(t => t.members?.includes(auth.currentUser?.uid) && t.createdBy !== auth.currentUser?.uid);

    // Open Edit Modal
    const openEditModal = (team) => {
        setEditingTeam(team);
        setEditName(team.teamName);
        setEditDesc(team.teamDesc);
        setEditSize(team.teamSize);
        setEditSkills(team.skills || []);
    };

    // Close Edit Modal
    const closeEditModal = () => {
        setEditingTeam(null);
        setEditName("");
        setEditDesc("");
        setEditSize("");
        setEditSkills([]);
    };

    // Toggle Skill
    const toggleSkill = (skill) => {
        if (!skill.trim()) return;
        setEditSkills(prev => {
            if (prev.includes(skill)) return prev.filter(s => s !== skill);
            if (prev.length >= 10) return prev;
            return [...prev, skill];
        });
        setSkillInput("");
    };

    // Save Team Changes
    const handleSaveTeam = async () => {
        if (!editingTeam) return;
        setSaving(true);
        try {
            await updateDoc(doc(dataBase, "teams", editingTeam.id), {
                teamName: editName,
                teamDesc: editDesc,
                teamSize: editSize,
                skills: editSkills
            });
            toast.success("Team updated successfully!");
            closeEditModal();
        } catch (error) {
            console.error("Error updating team:", error);
            toast.error("Failed to update team: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    // Leave Team Handler
    const handleLeaveTeam = async () => {
        if (!leavingTeam) return;
        setActionLoading(true);
        const result = await leaveTeam(leavingTeam.id);
        setActionLoading(false);
        if (result.success) {
            toast.success(`Left "${leavingTeam.teamName}" successfully!`);
            setLeavingTeam(null);
        } else {
            toast.error(result.error?.message || "Failed to leave team");
        }
    };

    // Delete Team Handler
    const handleDeleteTeam = async () => {
        if (!deletingTeam) return;
        setActionLoading(true);
        const result = await deleteTeam(deletingTeam.id);
        setActionLoading(false);
        if (result.success) {
            toast.success(`Team "${deletingTeam.teamName}" deleted successfully!`);
            setDeletingTeam(null);
            closeEditModal();
        } else {
            toast.error(result.error?.message || "Failed to delete team");
        }
    };

    // Transfer Leadership Handler
    const handleTransferLeadership = async () => {
        if (!transferringTeam || !selectedNewLeader) return;
        setActionLoading(true);
        const result = await transferLeadership(transferringTeam.id, selectedNewLeader);
        setActionLoading(false);
        if (result.success) {
            toast.success("Leadership transferred successfully!");
            setTransferringTeam(null);
            setSelectedNewLeader("");
        } else {
            toast.error(result.error?.message || "Failed to transfer leadership");
        }
    };

    // Remove Member
    const handleRemoveMember = async (memberId) => {
        if (!editingTeam) return;
        if (memberId === editingTeam.createdBy) {
            alert("You cannot remove yourself as the leader.");
            return;
        }
        if (!confirm("Are you sure you want to remove this member?")) return;

        try {
            await updateDoc(doc(dataBase, "teams", editingTeam.id), {
                members: arrayRemove(memberId)
            });
            setEditingTeam(prev => ({
                ...prev,
                members: prev.members.filter(m => m !== memberId)
            }));
            alert("Member removed successfully.");
        } catch (error) {
            console.error("Error removing member:", error);
            alert("Failed to remove member.");
        }
    };

    if (!userProfile) {
        return (
            <div className="profile--section" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                textAlign: 'center',
                gap: '1.5rem'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '1.5rem',
                    padding: '3rem 2rem',
                    maxWidth: '500px',
                    width: '90%'
                }}>
                    <h1 className="section--heading" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to ConnectU! 🚀</h1>
                    <p className="section--desc" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
                        Your profile is your digital identity here. Complete it to unlock the full potential of ConnectU:
                    </p>
                    <ul style={{
                        textAlign: 'left',
                        color: '#a1a1aa',
                        marginBottom: '2.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem',
                        listStyle: 'none'
                    }}>
                        <li>✨ Showcase your skills and projects</li>
                        <li>👥 Find the perfect teammates</li>
                        <li>📅 Join exciting events and hackathons</li>
                        <li>🔍 Get discovered by others</li>
                    </ul>
                    <button
                        className="edit--clicked"
                        onClick={() => navigate('/profile')}

                        style={{
                            fontSize: '1.1rem',
                            padding: '0.8rem 2rem',
                            width: '100%',
                            background: 'white',
                            color: 'black',
                            fontWeight: '600'
                        }}
                    >
                        Complete Profile Now
                    </button>
                </div>

                {/* Profile Edit Modal - Required here as well since we return early */}
                {editingProfile && (
                    <ProfileEditModal
                        profileData={profileData}
                        setProfileData={setProfileData}
                        profileSkillInput={profileSkillInput}
                        setProfileSkillInput={setProfileSkillInput}
                        toggleProfileTechSkill={toggleProfileTechSkill}
                        toggleProfileSoftSkill={toggleProfileSoftSkill}
                        handleSaveProfile={handleSaveProfile}
                        closeProfileEditModal={closeProfileEditModal}
                        savingProfile={savingProfile}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="profile--section" style={{ position: 'relative', minHeight: '80vh' }}>
            {/* Blur Content Wrapper */}
            <div style={{
                filter: !profileCompleted ? 'blur(10px)' : 'none',
                pointerEvents: !profileCompleted ? 'none' : 'auto',
                userSelect: !profileCompleted ? 'none' : 'auto',
                opacity: !profileCompleted ? 0.6 : 1,
                transition: 'all 0.3s ease'
            }}>
                {/* EDIT TEAM MODAL */}
                <TeamEditModal
                    editingTeam={editingTeam}
                    editName={editName}
                    setEditName={setEditName}
                    editDesc={editDesc}
                    setEditDesc={setEditDesc}
                    editSize={editSize}
                    setEditSize={setEditSize}
                    editSkills={editSkills}
                    skillInput={skillInput}
                    setSkillInput={setSkillInput}
                    toggleSkill={toggleSkill}
                    allUsers={allUsers}
                    handleRemoveMember={handleRemoveMember}
                    handleSaveTeam={handleSaveTeam}
                    closeEditModal={closeEditModal}
                    saving={saving}
                />

                <h1 className="section--heading">Your Profile</h1>
                <p className="section--desc">Manage your profile for better team recommendations</p>

                <div className="complete--profile">
                    <div className="profile--model">
                        <div className="image--upload">
                            <span className="upload--plus">{userProfile.fullName?.charAt(0).toUpperCase()}</span>
                        </div>

                        <div className="identity--lines">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <h3 style={{ margin: 0 }}>{userProfile.fullName}</h3>
                                <BadgeCollection badges={calculateBadges({ ...userProfile, id: auth.currentUser?.uid }, teams)} size="small" maxDisplay={4} />
                            </div>
                            <p>{userProfile.branch} <strong className="dot">•</strong> Year {userProfile.year}</p>
                        </div>

                        <button className="edit--clicked" onClick={openProfileEditModal}>Edit Profile</button>
                    </div>

                    {/* Profile Completeness Section */}
                    <ProfileCompleteness userProfile={{ ...userProfile, id: auth.currentUser?.uid }} teams={teams} />

                    <p className="user--email">📧 {userProfile.pemail}</p>
                    {userProfile.nitpemail && <p className="user--email">🎓 {userProfile.nitpemail}</p>}
                    <p className="user--email">📱 {userProfile.phone}</p>

                    <div className="user--skills">
                        <p>💻 Technical Skills:</p>
                        <div className="tech--arena">
                            {userProfile.technicalSkills?.map((skill, i) => (
                                <span key={i} className="skill--box">{skill}</span>
                            ))}
                        </div>

                        <p>🤝 Soft Skills:</p>
                        <div className="soft--arena">
                            {userProfile.softSkills?.map((skill, i) => (
                                <span key={i} className="skill--box">{skill}</span>
                            ))}
                        </div>
                    </div>

                    <div className="user--interest">
                        <p>🎯 Project Interests:</p>
                        <div className="project--arena">
                            {userProfile.interests?.map((interest, i) => (
                                <span key={i} className="interest--box">{interest}</span>
                            ))}
                        </div>

                        <p>⭐ General Interests:</p>
                        <div className="general--arena">
                            {userProfile.generalInterest?.map((interest, i) => (
                                <span key={i} className="interest--box">{interest}</span>
                            ))}
                        </div>

                        {/* Activities (Sports, Esports, Cultural) */}
                        {userProfile.activities && userProfile.activities.length > 0 && userProfile.activities[0] !== "None" && (
                            <>
                                <p>🎮 Activities:</p>
                                <div className="activities--arena" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {userProfile.activities?.map((activity, i) => (
                                        <span key={i} style={{
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.9rem',
                                            color: 'white'
                                        }}>{activity}</span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* GITHUB PROFILE SECTION */}
                {userProfile.githubUsername && (
                    <GitHubSection username={userProfile.githubUsername} />
                )}

                {/* PROJECT PORTFOLIO SECTION */}
                <div className="teammates--section" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 className="section--heading" style={{ margin: 0 }}>🚀 Project Portfolio</h2>
                        {(userProfile.projects?.length || 0) < 6 && (
                            <button
                                onClick={() => {
                                    setEditingProject(null);
                                    setShowProjectModal(true);
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'white',
                                    color: 'black',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}
                            >
                                + Add Project
                            </button>
                        )}
                    </div>

                    {(!userProfile.projects || userProfile.projects.length === 0) ? (
                        <div style={{
                            background: '#0a0a0a',
                            borderRadius: '1rem',
                            border: '1px dashed rgba(255,255,255,0.2)',
                            padding: '3rem 2rem',
                            textAlign: 'center'
                        }}>
                            <p style={{ color: '#a1a1aa', fontSize: '1.1rem', marginBottom: '1rem' }}>
                                No projects added yet
                            </p>
                            <p style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Showcase your work to stand out to potential teammates!
                            </p>
                            <button
                                onClick={() => {
                                    setEditingProject(null);
                                    setShowProjectModal(true);
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'white',
                                    color: 'black',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Add Your First Project
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '1rem'
                        }}>
                            {userProfile.projects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    isOwner={true}
                                    onEdit={(p) => {
                                        setEditingProject(p);
                                        setShowProjectModal(true);
                                    }}
                                    onDelete={async (p) => {
                                        if (!confirm(`Delete project "${p.title}"? This cannot be undone.`)) return;
                                        try {
                                            const updatedProjects = userProfile.projects.filter(proj => proj.id !== p.id);
                                            await updateDoc(doc(dataBase, "users", auth.currentUser.uid), {
                                                projects: updatedProjects
                                            });
                                            toast.success('Project deleted!');
                                            navigate(0);
                                        } catch (error) {
                                            console.error('Error deleting project:', error);
                                            toast.error('Failed to delete project');
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {userProfile.projects?.length >= 6 && (
                        <p style={{ color: '#71717a', fontSize: '0.85rem', marginTop: '1rem', textAlign: 'center' }}>
                            Maximum 6 projects allowed
                        </p>
                    )}
                </div>

                {/* SAVED ITEMS SECTION */}
                <div className="teammates--section" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                    <h2 className="section--heading">Saved Items</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>

                        {/* Saved Users */}
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                ⭐ Saved Profiles
                                <span style={{ background: '#27272a', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>{bookmarkedUsers.length}</span>
                            </h3>
                            {bookmarkedUsers.length === 0 ? <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>No profiles saved.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {allUsers.filter(u => bookmarkedUsers.includes(u.id)).map(user => (
                                        <div key={user.id} style={{ padding: '1rem', background: '#0a0a0a', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                    {user.fullName?.[0]}
                                                </div>
                                                <div>
                                                    <strong style={{ fontSize: '0.95rem', color: 'white', display: 'block' }}>{user.fullName}</strong>
                                                    <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{user.branch} • Year {user.year}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleBookmarkUser(user.id)}
                                                style={{ background: 'transparent', border: 'none', color: '#fbbf24', cursor: 'pointer', fontSize: '1.1rem' }}
                                                title="Remove bookmark"
                                            >
                                                ★
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Saved Teams */}
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                🔖 Saved Teams
                                <span style={{ background: '#27272a', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>{bookmarkedTeams.length}</span>
                            </h3>
                            {bookmarkedTeams.length === 0 ? <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>No teams saved.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {teams.filter(t => bookmarkedTeams.includes(t.id)).map(team => (
                                        <div key={team.id} style={{ padding: '1rem', background: '#0a0a0a', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <strong style={{ fontSize: '0.95rem', color: 'white', display: 'block' }}>{team.teamName}</strong>
                                                <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>🏆 {team.eventName}</span>
                                            </div>
                                            <button
                                                onClick={() => toggleBookmarkTeam(team.id)}
                                                style={{ background: 'transparent', border: 'none', color: '#fbbf24', cursor: 'pointer', fontSize: '1.1rem' }}
                                                title="Remove bookmark"
                                            >
                                                ★
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* TEAMS SECTION */}
                <div className="teammates--section" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                    <h2 className="section--heading">Your Teams</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>

                        {/* Teams You Lead */}
                        <div className="created-teams">
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                👑 Teams You Lead
                                <span style={{ background: '#27272a', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>{createdTeams.length}</span>
                            </h3>
                            {createdTeams.length === 0 ? <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>No teams created yet.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {createdTeams.map(t => (
                                        <div key={t.id} style={{ padding: '1rem', background: '#0a0a0a', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                                <div>
                                                    <strong style={{ fontSize: '1rem', color: 'white' }}>{t.teamName}</strong>
                                                    <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '0.25rem' }}>🏆 {t.eventName}</p>
                                                    <p style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>👥 {t.members?.length || 1}/{t.teamSize} members</p>
                                                </div>
                                                <button
                                                    onClick={() => openEditModal(t)}
                                                    style={{ background: 'white', color: 'black', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                                                >
                                                    Manage
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {t.members?.length > 1 && (
                                                    <button
                                                        onClick={() => setTransferringTeam(t)}
                                                        style={{ background: 'transparent', color: '#3b82f6', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #3b82f6', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        Transfer Leadership
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setDeletingTeam(t)}
                                                    style={{ background: 'transparent', color: '#ef4444', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    Delete Team
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Teams You Joined */}
                        <div className="joined-teams">
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                👥 Teams You Joined
                                <span style={{ background: '#27272a', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>{joinedTeams.length}</span>
                            </h3>
                            {joinedTeams.length === 0 ? <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Haven't joined any teams yet.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {joinedTeams.map(t => (
                                        <div key={t.id} style={{ padding: '1rem', background: '#0a0a0a', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <strong style={{ fontSize: '1rem', color: 'white' }}>{t.teamName}</strong>
                                                    <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '0.25rem' }}>🏆 {t.eventName}</p>
                                                    <p style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>👑 Led by {allUsers?.find(u => u.id === t.createdBy)?.fullName || "Unknown"}</p>
                                                </div>
                                                <button
                                                    onClick={() => setLeavingTeam(t)}
                                                    style={{ background: '#dc2626', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                                                >
                                                    Leave
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SENT REQUESTS SECTION */}
                <div className="teammates--section" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                    <h2 className="section--heading">Sent Join Requests</h2>

                    {loadingRequests ? (
                        <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Loading requests...</p>
                    ) : sentRequests.length === 0 ? (
                        <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>No pending requests sent.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                            {sentRequests.map(req => {
                                let statusColor = '#eab308'; // Pending - Yellow
                                if (req.status === 'accepted') statusColor = '#22c55e'; // Green
                                if (req.status === 'rejected') statusColor = '#ef4444'; // Red

                                return (
                                    <div key={req.id} style={{ padding: '1rem', background: '#0a0a0a', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <strong style={{ fontSize: '1rem', color: 'white' }}>{req.teamName}</strong>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                                    <span style={{
                                                        background: statusColor,
                                                        color: 'black',
                                                        padding: '0.1rem 0.5rem',
                                                        borderRadius: '0.25rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {req.status}
                                                    </span>
                                                    <span style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>
                                                        {req.createdAt?.toDate ? new Date(req.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                                                    </span>
                                                </div>
                                            </div>
                                            {req.status === 'pending' ? (
                                                <button
                                                    onClick={() => handleCancelRequest(req.id)}
                                                    style={{ background: 'transparent', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.2)', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    Cancel
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleCancelRequest(req.id)} // Reuse logic to delete resolved notifications
                                                    style={{ background: 'transparent', color: '#52525b', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Profile Edit Modal */}
                {editingProfile && (
                    <ProfileEditModal
                        profileData={profileData}
                        setProfileData={setProfileData}
                        profileSkillInput={profileSkillInput}
                        setProfileSkillInput={setProfileSkillInput}
                        toggleProfileTechSkill={toggleProfileTechSkill}
                        toggleProfileSoftSkill={toggleProfileSoftSkill}
                        handleSaveProfile={handleSaveProfile}
                        closeProfileEditModal={closeProfileEditModal}
                        savingProfile={savingProfile}
                    />
                )}

                {/* Project Edit Modal */}
                <ProjectEditModal
                    isOpen={showProjectModal}
                    project={editingProject}
                    onClose={() => {
                        setShowProjectModal(false);
                        setEditingProject(null);
                    }}
                    onSave={async (projectData) => {
                        try {
                            const currentProjects = userProfile.projects || [];
                            let updatedProjects;

                            if (editingProject) {
                                // Update existing project
                                updatedProjects = currentProjects.map(p =>
                                    p.id === projectData.id ? projectData : p
                                );
                            } else {
                                // Add new project
                                updatedProjects = [...currentProjects, projectData];
                            }

                            await updateDoc(doc(dataBase, "users", auth.currentUser.uid), {
                                projects: updatedProjects
                            });

                            toast.success(editingProject ? 'Project updated!' : 'Project added!');
                            setShowProjectModal(false);
                            setEditingProject(null);
                            navigate(0);
                        } catch (error) {
                            console.error('Error saving project:', error);
                            throw error;
                        }
                    }}
                />

                {/* Leave Team Confirmation Modal */}
                {leavingTeam && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
                    }}>
                        <div style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '1rem', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Leave Team?</h3>
                            <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>
                                Are you sure you want to leave <strong style={{ color: 'white' }}>"{leavingTeam.teamName}"</strong>? You'll need to request to join again if you change your mind.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setLeavingTeam(null)} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem', color: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleLeaveTeam} disabled={actionLoading} style={{ padding: '0.5rem 1rem', background: '#dc2626', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer', fontWeight: 600 }}>{actionLoading ? 'Leaving...' : 'Leave Team'}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Team Confirmation Modal */}
                {deletingTeam && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
                    }}>
                        <div style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '1rem', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠️ Delete Team?</h3>
                            <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>
                                This will permanently delete <strong style={{ color: 'white' }}>"{deletingTeam.teamName}"</strong> and all related notifications. This action cannot be undone!
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setDeletingTeam(null)} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem', color: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleDeleteTeam} disabled={actionLoading} style={{ padding: '0.5rem 1rem', background: '#dc2626', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer', fontWeight: 600 }}>{actionLoading ? 'Deleting...' : 'Delete Team'}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transfer Leadership Modal */}
                {transferringTeam && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
                    }}>
                        <div style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '1rem', maxWidth: '450px', width: '90%', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Transfer Leadership</h3>
                            <p style={{ color: '#a1a1aa', marginBottom: '1rem' }}>
                                Select a new leader for <strong style={{ color: 'white' }}>"{transferringTeam.teamName}"</strong>:
                            </p>
                            <select
                                value={selectedNewLeader}
                                onChange={(e) => setSelectedNewLeader(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem', color: 'white', marginBottom: '1.5rem', fontSize: '1rem' }}
                            >
                                <option value="">Select a team member...</option>
                                {transferringTeam.members?.filter(m => m !== auth.currentUser?.uid).map(memberId => {
                                    const member = allUsers?.find(u => u.id === memberId);
                                    return (
                                        <option key={memberId} value={memberId}>
                                            {member?.fullName || 'Unknown Member'}
                                        </option>
                                    );
                                })}
                            </select>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => { setTransferringTeam(null); setSelectedNewLeader(''); }} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem', color: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleTransferLeadership} disabled={actionLoading || !selectedNewLeader} style={{ padding: '0.5rem 1rem', background: '#16a34a', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer', fontWeight: 600, opacity: selectedNewLeader ? 1 : 0.5 }}>{actionLoading ? 'Transferring...' : 'Transfer'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Restriction Overlay for New Users */}
            {!profileCompleted && (
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    left: '50%',
                    transform: 'translate(-50%, 0)',
                    zIndex: 50,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    pointerEvents: 'auto'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '1.5rem',
                        padding: '3rem 2rem',
                        maxWidth: '500px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <h1 className="section--heading" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to ConnectU! 🚀</h1>
                        <p className="section--desc" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
                            Your profile is your digital identity here. Complete it to unlock the full potential of ConnectU:
                        </p>
                        <ul style={{
                            textAlign: 'left',
                            color: '#a1a1aa',
                            marginBottom: '2.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.8rem',
                            listStyle: 'none'
                        }}>
                            <li>✨ Showcase your skills and projects</li>
                            <li>👥 Find the perfect teammates</li>
                            <li>📅 Join exciting events and hackathons</li>
                            <li>🔍 Get discovered by others</li>
                        </ul>
                        <button
                            className="edit--clicked"
                            onClick={() => navigate('/profile')}
                            style={{
                                fontSize: '1.1rem',
                                padding: '0.8rem 2rem',
                                width: '100%',
                                background: 'white',
                                color: 'black',
                                fontWeight: '600'
                            }}
                        >
                            Complete Profile Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileView;
