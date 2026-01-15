import React from "react";

const SKILL_SUGGESTIONS = [
    "React.js", "Node.js", "Python", "Machine Learning", "UI/UX Design", "Java", "C++", "Data Science", "Flutter", "AWS",
    "MongoDB", "Express.js", "Figma", "Docker", "Kubernetes", "Cybersecurity", "Blockchain", "DevOps",
    "Android", "iOS", "Swift", "Kotlin", "Go", "Rust", "TypeScript", "Angular", "Vue.js", "Next.js",
    "Firebase", "Digital Marketing", "Video Editing", "Content Writing", "Public Speaking", "Project Management"
];

const SOFT_SKILLS = [
    "Leadership", "Problem Solving", "Critical Thinking", "Team Work", "Communication",
    "Time Management", "Creativity", "Adaptability"
];

const ProfileEditModal = ({
    profileData,
    setProfileData,
    profileSkillInput,
    setProfileSkillInput,
    toggleProfileTechSkill,
    toggleProfileSoftSkill,
    handleSaveProfile,
    closeProfileEditModal,
    savingProfile
}) => {
    return (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="modal-content" style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Edit Profile</h2>
                    <button onClick={closeProfileEditModal} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'white' }}>×</button>
                </div>

                {/* Personal Info Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '1rem' }}>👤 Personal Info</h3>

                    <label style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                    <input
                        type="text"
                        value={profileData.fullName || ""}
                        onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                        style={{ width: '100%', padding: '0.75rem', background: '#27272a', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', marginBottom: '1rem' }}
                    />

                    <label style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Bio</label>
                    <textarea
                        value={profileData.bio || ""}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        style={{ width: '100%', padding: '0.75rem', background: '#27272a', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', marginBottom: '1rem', minHeight: '80px', resize: 'vertical' }}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Year</label>
                            <select
                                value={profileData.year || ""}
                                onChange={(e) => setProfileData(prev => ({ ...prev, year: e.target.value }))}
                                style={{ width: '100%', padding: '0.75rem', background: '#27272a', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}
                            >
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Branch</label>
                            <select
                                value={profileData.branch || ""}
                                onChange={(e) => setProfileData(prev => ({ ...prev, branch: e.target.value }))}
                                style={{ width: '100%', padding: '0.75rem', background: '#27272a', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}
                            >
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="EE">EE</option>
                                <option value="ME">ME</option>
                                <option value="CE">CE</option>
                                <option value="MNC">MNC</option>
                                <option value="Architecture">Architecture</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contact Info Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '1rem' }}>📞 Contact Info</h3>

                    <label style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Personal Email</label>
                    <input
                        type="email"
                        value={profileData.pemail || ""}
                        onChange={(e) => setProfileData(prev => ({ ...prev, pemail: e.target.value }))}
                        placeholder="your.email@gmail.com"
                        style={{ width: '100%', padding: '0.75rem', background: '#27272a', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', marginBottom: '1rem' }}
                    />

                    <label style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>NITP Email ID</label>
                    <input
                        type="email"
                        value={profileData.nitpemail || ""}
                        onChange={(e) => setProfileData(prev => ({ ...prev, nitpemail: e.target.value }))}
                        placeholder="yourname_branch@nitp.ac.in"
                        style={{ width: '100%', padding: '0.75rem', background: '#27272a', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', marginBottom: '1rem' }}
                    />

                    <label style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Phone</label>
                    <input
                        type="tel"
                        value={profileData.phone || ""}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        style={{ width: '100%', padding: '0.75rem', background: '#27272a', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', marginBottom: '1rem' }}
                    />

                    <label style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Available for Teams?</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setProfileData(prev => ({ ...prev, availability: 'Yes' }))}
                            style={{ flex: 1, padding: '0.75rem', background: profileData.availability === 'Yes' ? '#22c55e' : '#27272a', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', cursor: 'pointer' }}
                        >
                            ✓ Yes
                        </button>
                        <button
                            onClick={() => setProfileData(prev => ({ ...prev, availability: 'No' }))}
                            style={{ flex: 1, padding: '0.75rem', background: profileData.availability === 'No' ? '#ef4444' : '#27272a', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', cursor: 'pointer' }}
                        >
                            ✗ No
                        </button>
                    </div>
                </div>

                {/* Technical Skills Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '1rem' }}>💻 Technical Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {profileData.technicalSkills?.map(skill => (
                            <span key={skill} onClick={() => toggleProfileTechSkill(skill)} style={{ padding: '0.4rem 0.8rem', background: 'white', color: 'black', borderRadius: '1rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                                {skill} ✕
                            </span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="Add skill..."
                            value={profileSkillInput}
                            onChange={(e) => setProfileSkillInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); toggleProfileTechSkill(profileSkillInput.trim()); } }}
                            style={{ flex: 1, padding: '0.5rem', background: '#27272a', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}
                        />
                        <button onClick={() => toggleProfileTechSkill(profileSkillInput.trim())} style={{ padding: '0.5rem 1rem', background: 'white', color: 'black', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>Add</button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.75rem' }}>
                        {SKILL_SUGGESTIONS.filter(s => !profileData.technicalSkills?.includes(s)).slice(0, 8).map(skill => (
                            <span key={skill} onClick={() => toggleProfileTechSkill(skill)} style={{ padding: '0.3rem 0.6rem', background: '#27272a', color: '#a1a1aa', borderRadius: '1rem', fontSize: '0.75rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
                                + {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Soft Skills Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '1rem' }}>🤝 Soft Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {profileData.softSkills?.map(skill => (
                            <span key={skill} onClick={() => toggleProfileSoftSkill(skill)} style={{ padding: '0.4rem 0.8rem', background: 'white', color: 'black', borderRadius: '1rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                                {skill} ✕
                            </span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {SOFT_SKILLS.filter(s => !profileData.softSkills?.includes(s)).map(skill => (
                            <span key={skill} onClick={() => toggleProfileSoftSkill(skill)} style={{ padding: '0.3rem 0.6rem', background: '#27272a', color: '#a1a1aa', borderRadius: '1rem', fontSize: '0.75rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
                                + {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Experience Level */}
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '1rem' }}>📊 Experience Level</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(level => (
                            <button
                                key={level}
                                onClick={() => setProfileData(prev => ({ ...prev, experience: level }))}
                                style={{ padding: '0.5rem 1rem', background: profileData.experience === level ? 'white' : '#27272a', color: profileData.experience === level ? 'black' : 'white', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button onClick={closeProfileEditModal} style={{ padding: '0.75rem 1.5rem', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', borderRadius: '0.5rem', cursor: 'pointer', color: 'white' }}>Cancel</button>
                    <button onClick={handleSaveProfile} disabled={savingProfile} style={{ padding: '0.75rem 1.5rem', background: 'white', color: 'black', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditModal;
