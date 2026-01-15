import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { auth, dataBase } from "../../firebase";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import TeamEditModal from "../../components/modals/TeamEditModal";
import ProfileEditModal from "../../components/modals/ProfileEditModal";

const SKILL_SUGGESTIONS = [
    "React.js", "Node.js", "Python", "Machine Learning", "UI/UX Design", "Java", "C++", "Data Science", "Flutter", "AWS",
    "MongoDB", "Express.js", "Figma", "Docker", "Kubernetes", "Cybersecurity", "Blockchain", "DevOps",
    "Android", "iOS", "Swift", "Kotlin", "Go", "Rust", "TypeScript", "Angular", "Vue.js", "Next.js",
    "Firebase", "Digital Marketing", "Video Editing", "Content Writing", "Public Speaking", "Project Management"
];

const ProfileView = () => {
    const { userProfile, teams, allUsers } = useOutletContext();

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

    // Open Profile Edit Modal
    const openProfileEditModal = () => {
        setProfileData({
            fullName: userProfile.fullName || "",
            bio: userProfile.bio || "",
            phone: userProfile.phone || "",
            pemail: userProfile.pemail || "",
            nitpemail: userProfile.nitpemail || "",
            availability: userProfile.availability || "",
            technicalSkills: userProfile.technicalSkills || [],
            softSkills: userProfile.softSkills || [],
            experience: userProfile.experience || "",
            year: userProfile.year || "",
            branch: userProfile.branch || ""
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
            await updateDoc(doc(dataBase, "users", auth.currentUser.uid), profileData);
            alert("Profile updated successfully!");
            closeProfileEditModal();
            window.location.reload();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile: " + error.message);
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
            alert("Team updated successfully!");
            closeEditModal();
        } catch (error) {
            console.error("Error updating team:", error);
            alert("Failed to update team: " + error.message);
        } finally {
            setSaving(false);
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

    if (!userProfile) return <div className="loading">Loading Profile...</div>;

    return (
        <div className="profile--section">
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
                        <h3>{userProfile.fullName}</h3>
                        <p>{userProfile.branch} <strong className="dot">•</strong> Year {userProfile.year}</p>
                    </div>

                    <button className="edit--clicked" onClick={openProfileEditModal}>Edit Profile</button>
                </div>

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
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                                        <strong style={{ fontSize: '1rem', color: 'white' }}>{t.teamName}</strong>
                                        <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '0.25rem' }}>🏆 {t.eventName}</p>
                                        <p style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>👑 Led by {allUsers?.find(u => u.id === t.createdBy)?.fullName || "Unknown"}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
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
        </div>
    );
};

export default ProfileView;
