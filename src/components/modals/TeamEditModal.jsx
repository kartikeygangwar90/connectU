import React from "react";

const SKILL_SUGGESTIONS = [
    "React.js", "Node.js", "Python", "Machine Learning", "UI/UX Design", "Java", "C++", "Data Science", "Flutter", "AWS",
    "MongoDB", "Express.js", "Figma", "Docker", "Kubernetes", "Cybersecurity", "Blockchain", "DevOps",
    "Android", "iOS", "Swift", "Kotlin", "Go", "Rust", "TypeScript", "Angular", "Vue.js", "Next.js",
    "Firebase", "Digital Marketing", "Video Editing", "Content Writing", "Public Speaking", "Project Management"
];

const TeamEditModal = ({
    editingTeam,
    editName,
    setEditName,
    editDesc,
    setEditDesc,
    editSize,
    setEditSize,
    editSkills,
    skillInput,
    setSkillInput,
    toggleSkill,
    allUsers,
    handleRemoveMember,
    handleSaveTeam,
    closeEditModal,
    saving
}) => {
    if (!editingTeam) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '1rem', width: '95%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>✏️ Manage Team</h2>
                    <button onClick={closeEditModal} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'white' }}>×</button>
                </div>

                {/* Edit Fields */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'white' }}>Team Name</label>
                    <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', background: '#27272a', color: 'white' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'white' }}>Description</label>
                    <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', minHeight: '100px', background: '#27272a', color: 'white' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'white' }}>Team Size</label>
                    <select
                        value={editSize}
                        onChange={(e) => setEditSize(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', background: '#27272a', color: 'white' }}
                    >
                        {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} members</option>)}
                    </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'white' }}>Required Skills</label>
                    <input
                        type="text"
                        placeholder="Type skill and press Enter"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); toggleSkill(skillInput); } }}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', marginBottom: '0.5rem', background: '#27272a', color: 'white' }}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {editSkills.map(s => (
                            <span key={s} onClick={() => toggleSkill(s)} style={{ background: 'white', color: 'black', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                                {s} ✕
                            </span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {SKILL_SUGGESTIONS
                            .filter(s => !editSkills.includes(s) && s.toLowerCase().includes(skillInput.toLowerCase()))
                            .slice(0, 8)
                            .map(s => (
                                <span key={s} onClick={() => toggleSkill(s)} style={{ background: '#27272a', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                                    + {s}
                                </span>
                            ))
                        }
                    </div>
                </div>

                {/* Members Section */}
                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                    <h3 style={{ fontWeight: '500', marginBottom: '1rem', color: 'white' }}>👥 Team Members ({editingTeam.members?.length || 1}/{editingTeam.teamSize})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {allUsers
                            ?.filter(u => editingTeam.members?.includes(u.id))
                            .map(u => (
                                <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#27272a', borderRadius: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '500', color: 'white' }}>
                                            {u.fullName?.[0]}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '500', color: 'white' }}>{u.fullName} {u.id === editingTeam.createdBy && '👑'}</p>
                                            <p style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{u.branch} • {u.year}</p>
                                        </div>
                                    </div>
                                    {u.id !== editingTeam.createdBy && (
                                        <button
                                            onClick={() => handleRemoveMember(u.id)}
                                            style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.4rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button
                        onClick={() => {
                            const link = `${window.location.origin}/app/teams?directJoin=${editingTeam.id}`;
                            navigator.clipboard.writeText(link);
                            // Simple alert for now, assuming toast is handled in parent or we can import toast if needed
                            alert("Join link copied to clipboard! Share it with anyone.");
                        }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#27272a',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        🔗 Copy Join Link
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={closeEditModal} style={{ padding: '0.75rem 1.5rem', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', borderRadius: '0.5rem', cursor: 'pointer', color: 'white' }}>Cancel</button>
                        <button onClick={handleSaveTeam} disabled={saving} style={{ padding: '0.75rem 1.5rem', background: 'white', color: 'black', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamEditModal;
