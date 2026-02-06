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

// Research, Hackathon, Startup removed - skills already collected in profile setup
const EVENT_CATEGORIES = [
    { id: "sports", name: "Sports", icon: "⚽" },
    { id: "esports", name: "Esports", icon: "🎮" },
    { id: "cultural", name: "Cultural", icon: "🎭" },
];

// Activities separated by category
const SPORTS_ACTIVITIES = ["Football", "Cricket", "Basketball", "Badminton", "Table Tennis", "Chess", "Volleyball", "Tennis", "Swimming"];
const ESPORTS_ACTIVITIES = ["Valorant", "BGMI", "FIFA", "COD", "Free Fire", "CS2", "Minecraft", "League of Legends", "Dota 2"];
const CULTURAL_ACTIVITIES = ["Dance", "Music", "Singing", "Drama", "Art", "Photography", "Content Creation", "Poetry", "Writing"];

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

                    {/* GitHub Username */}
                    <label style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', marginTop: '1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub Username (optional)
                        </span>
                    </label>
                    <input
                        type="text"
                        value={profileData.githubUsername || ""}
                        onChange={(e) => setProfileData(prev => ({ ...prev, githubUsername: e.target.value.replace(/[^a-zA-Z0-9-]/g, '') }))}
                        placeholder="e.g., octocat"
                        style={{ width: '100%', padding: '0.75rem', background: '#27272a', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}
                    />
                    <p style={{ color: '#71717a', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        Your GitHub username will be used to display your repositories and contributions.
                    </p>
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

                {/* Event Categories */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '1rem' }}>🏆 Event Categories</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '0.75rem' }}>Which types of events interest you?</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {EVENT_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setProfileData(prev => ({
                                    ...prev,
                                    categoryInterests: (prev.categoryInterests || []).includes(cat.name)
                                        ? prev.categoryInterests.filter(c => c !== cat.name)
                                        : [...(prev.categoryInterests || []), cat.name]
                                }))}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: (profileData.categoryInterests || []).includes(cat.name) ? 'white' : '#27272a',
                                    color: (profileData.categoryInterests || []).includes(cat.name) ? 'black' : 'white',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {cat.icon} {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Activities & Hobbies */}
                {((profileData.categoryInterests || []).includes("Sports") ||
                    (profileData.categoryInterests || []).includes("Esports") ||
                    (profileData.categoryInterests || []).includes("Cultural")) && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '1rem' }}>⚡ Activities & Hobbies</h3>
                            <p style={{ color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '0.75rem' }}>Select activities related to your chosen categories</p>

                            {/* Selected Activities */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                {(profileData.activities || []).map(activity => (
                                    <span
                                        key={activity}
                                        onClick={() => setProfileData(prev => ({
                                            ...prev,
                                            activities: prev.activities.filter(a => a !== activity)
                                        }))}
                                        style={{ padding: '0.4rem 0.8rem', background: 'white', color: 'black', borderRadius: '1rem', fontSize: '0.85rem', cursor: 'pointer' }}
                                    >
                                        {activity} ✕
                                    </span>
                                ))}
                            </div>

                            {/* Sports Activities */}
                            {(profileData.categoryInterests || []).includes("Sports") && (
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <p style={{ color: '#a1a1aa', fontSize: '0.75rem', marginBottom: '0.5rem' }}>⚽ Sports</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                        {SPORTS_ACTIVITIES.filter(a => !(profileData.activities || []).includes(a)).map(activity => (
                                            <span
                                                key={activity}
                                                onClick={() => setProfileData(prev => ({
                                                    ...prev,
                                                    activities: [...(prev.activities || []), activity]
                                                }))}
                                                style={{ padding: '0.3rem 0.6rem', background: '#27272a', color: '#a1a1aa', borderRadius: '1rem', fontSize: '0.75rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                                            >
                                                + {activity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Esports Activities */}
                            {(profileData.categoryInterests || []).includes("Esports") && (
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <p style={{ color: '#a1a1aa', fontSize: '0.75rem', marginBottom: '0.5rem' }}>🎮 Esports</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                        {ESPORTS_ACTIVITIES.filter(a => !(profileData.activities || []).includes(a)).map(activity => (
                                            <span
                                                key={activity}
                                                onClick={() => setProfileData(prev => ({
                                                    ...prev,
                                                    activities: [...(prev.activities || []), activity]
                                                }))}
                                                style={{ padding: '0.3rem 0.6rem', background: '#27272a', color: '#a1a1aa', borderRadius: '1rem', fontSize: '0.75rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                                            >
                                                + {activity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Cultural Activities */}
                            {(profileData.categoryInterests || []).includes("Cultural") && (
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <p style={{ color: '#a1a1aa', fontSize: '0.75rem', marginBottom: '0.5rem' }}>🎭 Cultural</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                        {CULTURAL_ACTIVITIES.filter(a => !(profileData.activities || []).includes(a)).map(activity => (
                                            <span
                                                key={activity}
                                                onClick={() => setProfileData(prev => ({
                                                    ...prev,
                                                    activities: [...(prev.activities || []), activity]
                                                }))}
                                                style={{ padding: '0.3rem 0.6rem', background: '#27272a', color: '#a1a1aa', borderRadius: '1rem', fontSize: '0.75rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                                            >
                                                + {activity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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
