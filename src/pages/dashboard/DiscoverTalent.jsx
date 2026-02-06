import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useSearchParams } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { dataBase, auth } from "../../firebase";
import { sendInviteEmail } from "../../utils/emailService";
import toast from "react-hot-toast";
import CompleteProfileModal from "../../components/modals/ProfileEditModal"; // Reusing ProfileEditModal as it contains the form logic
import { doc, updateDoc } from "firebase/firestore";
import usePagination from "../../hooks/usePagination";
import PaginationControls from "../../components/ui/PaginationControls";
import { SkeletonGrid } from "../../components/ui/SkeletonCard";
import { useBookmarks } from "../../hooks/useBookmarks";
import { calculateBadges, BadgeCollection } from "../../components/ui/BadgeSystem";

// Filter constants
const YEARS = ["1", "2", "3", "4"];
const BRANCHES = ["CSE", "ECE", "EE", "ME", "CE", "MNC", "Architecture"];
const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

const DiscoverTalent = () => {
    const { allUsers, teams, userProfile, searchQuery, searchBySkill, profileCompleted, isDataLoading } = useOutletContext();
    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState(null);
    const [inviteTeamId, setInviteTeamId] = useState("");
    const [inviteMessage, setInviteMessage] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);

    // Bookmarks Hook
    const { toggleBookmarkUser, isUserBookmarked } = useBookmarks();

    const [searchParams, setSearchParams] = useSearchParams();

    // Advanced Filters State
    const [filters, setFilters] = useState({
        year: searchParams.get('year') || '',
        branch: searchParams.get('branch') || '',
        availability: searchParams.get('availability') || 'all',
        experience: searchParams.get('experience') || ''
    });

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        // Preserve existing params (like q for search if any)
        if (filters.year) params.set('year', filters.year); else params.delete('year');
        if (filters.branch) params.set('branch', filters.branch); else params.delete('branch');

        if (filters.availability && filters.availability !== 'all') {
            params.set('availability', filters.availability);
        } else {
            params.delete('availability');
        }

        if (filters.experience) params.set('experience', filters.experience); else params.delete('experience');

        setSearchParams(params, { replace: true });
    }, [filters, searchParams, setSearchParams]);

    const [showFilters, setShowFilters] = useState(false);

    // Profile Edit Modal State - needed for the complete profile button
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({});


    // Import from ProfileView logic (simplified for modal)
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
            activities: userProfile?.activities || [],
            interests: userProfile?.interests || [],
            generalInterest: userProfile?.generalInterest || []
        });
        setEditingProfile(true);
    };

    const closeProfileEditModal = () => {
        setEditingProfile(false);
        setProfileData({});
    };





    const handleSaveProfile = async () => {
        if (!auth.currentUser) return;

        try {
            await updateDoc(doc(dataBase, "users", auth.currentUser.uid), {
                ...profileData,
                profileCompleted: true
            });
            toast.success("Profile updated successfully!");
            closeProfileEditModal();
            navigate(0); // React Router's way to refresh current route
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile: " + error.message);
        }
    };

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

    // Helper function to clear all filters
    const clearFilters = () => {
        setFilters({
            year: '',
            branch: '',
            availability: 'all',
            experience: ''
        });
    };

    // Check if any filters are active
    const hasActiveFilters = filters.year || filters.branch || filters.availability !== 'all' || filters.experience;
    const activeFilterCount = [
        filters.year,
        filters.branch,
        filters.availability !== 'all' ? filters.availability : '',
        filters.experience
    ].filter(Boolean).length;

    // Filter users based on search query AND advanced filters
    const filteredUsers = React.useMemo(() => {
        return allUsers.filter((user) => {
            // Apply advanced filters first

            // Year filter
            if (filters.year && user.year !== filters.year) return false;

            // Branch filter
            if (filters.branch && user.branch !== filters.branch) return false;

            // Availability filter
            if (filters.availability !== 'all') {
                const userAvailability = user.availability?.toLowerCase();
                if (filters.availability === 'yes' && userAvailability !== 'yes') return false;
                if (filters.availability === 'no' && userAvailability !== 'no') return false;
            }

            // Experience filter
            if (filters.experience && user.experience !== filters.experience) return false;

            // Then apply search query
            if (searchQuery && searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                if (searchBySkill) {
                    // When searching by skill, filter users whose skills start with the query
                    const hasMatchingSkill = user.technicalSkills?.some((skill) =>
                        skill.toLowerCase().startsWith(query)
                    ) || user.softSkills?.some((skill) =>
                        skill.toLowerCase().startsWith(query)
                    );
                    if (!hasMatchingSkill) return false;
                } else {
                    // Default: filter users whose names start with the query
                    if (!user.fullName?.toLowerCase().startsWith(query)) return false;
                }
            }

            return true;
        });
    }, [allUsers, searchQuery, searchBySkill, filters]);

    // Pagination for users list (12 per page)
    const {
        paginatedItems: paginatedUsers,
        currentPage,
        totalPages,
        totalItems,
        startIndex,
        endIndex,
        goToPage,
        hasNextPage,
        hasPrevPage,
        resetPagination
    } = usePagination(filteredUsers, 12);

    // Reset to page 1 when search or filters change
    React.useEffect(() => {
        resetPagination();
    }, [searchQuery, searchBySkill, filters, resetPagination]);

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
        <div className="discover--section" style={{ position: 'relative', minHeight: '80vh' }}>
            {/* Blur Content Wrapper */}
            <div style={{
                filter: !profileCompleted ? 'blur(10px)' : 'none',
                pointerEvents: !profileCompleted ? 'none' : 'auto',
                userSelect: !profileCompleted ? 'none' : 'auto',
                opacity: !profileCompleted ? 0.6 : 1,
                transition: 'all 0.3s ease'
            }}>
                <h1 className="section--heading">Discover Teammates</h1>
                <p className="section--desc">Find students with the skills you need for your team</p>

                {/* Filter Toggle Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="filter-toggle-btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1rem',
                            background: hasActiveFilters ? 'white' : '#27272a',
                            color: hasActiveFilters ? 'black' : 'white',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            transition: 'all 0.2s'
                        }}
                    >
                        🎛️ Filters
                        {activeFilterCount > 0 && (
                            <span style={{
                                background: hasActiveFilters ? 'black' : 'white',
                                color: hasActiveFilters ? 'white' : 'black',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}>
                                {activeFilterCount}
                            </span>
                        )}
                        <span style={{ marginLeft: '0.25rem' }}>{showFilters ? '▲' : '▼'}</span>
                    </button>
                </div>

                {/* Filter Panel - Collapsible */}
                {showFilters && (
                    <div className="filter-panel" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1.5rem',
                        padding: '1.5rem',
                        background: '#0a0a0a',
                        borderRadius: '1rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        marginTop: '1rem',
                        animation: 'fadeIn 0.2s ease'
                    }}>
                        {/* Year Filter */}
                        <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500 }}>Year</label>
                            <select
                                value={filters.year}
                                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                                className="filter-select"
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#27272a',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    minWidth: '120px',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">All Years</option>
                                {YEARS.map(year => (
                                    <option key={year} value={year}>{year === '1' ? '1st' : year === '2' ? '2nd' : year === '3' ? '3rd' : '4th'} Year</option>
                                ))}
                            </select>
                        </div>

                        {/* Branch Filter */}
                        <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500 }}>Branch</label>
                            <select
                                value={filters.branch}
                                onChange={(e) => setFilters(prev => ({ ...prev, branch: e.target.value }))}
                                className="filter-select"
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#27272a',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    minWidth: '140px',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">All Branches</option>
                                {BRANCHES.map(branch => (
                                    <option key={branch} value={branch}>{branch}</option>
                                ))}
                            </select>
                        </div>

                        {/* Experience Filter */}
                        <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500 }}>Experience</label>
                            <select
                                value={filters.experience}
                                onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                                className="filter-select"
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#27272a',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    minWidth: '140px',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">All Levels</option>
                                {EXPERIENCE_LEVELS.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>

                        {/* Availability Filter - Pills */}
                        <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500 }}>Availability</label>
                            <div className="filter-pills" style={{ display: 'flex', gap: '0.5rem' }}>
                                {[
                                    { value: 'all', label: 'All' },
                                    { value: 'yes', label: '✓ Available' },
                                    { value: 'no', label: 'Not Available' }
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setFilters(prev => ({ ...prev, availability: option.value }))}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '2rem',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            background: filters.availability === option.value ? 'white' : 'transparent',
                                            color: filters.availability === option.value ? 'black' : '#a1a1aa',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: filters.availability === option.value ? 600 : 400,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Clear Filters Button */}
                        {hasActiveFilters && (
                            <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={clearFilters}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'transparent',
                                        border: '1px solid rgba(239, 68, 68, 0.5)',
                                        borderRadius: '0.5rem',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    ✕ Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Results Count */}
                {(hasActiveFilters || searchQuery) && (
                    <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginTop: '1rem' }}>
                        Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'}
                        {hasActiveFilters && ' with filters applied'}
                    </p>
                )}

                {/* Reuse user card grid */}
                <div className="users-grid" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem'
                }}>
                    {/* Show skeleton loading while data is loading */}
                    {isDataLoading ? (
                        <SkeletonGrid count={6} type="user" />
                    ) : filteredUsers.length === 0 ? (
                        <p style={{ color: '#a1a1aa', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                            {hasActiveFilters || searchQuery?.trim()
                                ? `No users found matching your ${hasActiveFilters ? 'filters' : ''}${hasActiveFilters && searchQuery?.trim() ? ' and ' : ''}${searchQuery?.trim() ? 'search' : ''}. Try adjusting your criteria.`
                                : 'No other users found. Be the first to complete your profile!'}
                        </p>
                    ) : (
                        <>
                            {paginatedUsers.map((user) => (
                                <div key={user.id} className="user-card" style={{
                                    background: '#0a0a0a', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative'
                                }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleBookmarkUser(user.id);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            background: 'transparent',
                                            border: 'none',
                                            color: isUserBookmarked(user.id) ? '#fbbf24' : '#52525b',
                                            fontSize: '1.2rem',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s, color 0.2s',
                                            zIndex: 2
                                        }}
                                        title={isUserBookmarked(user.id) ? "Remove from saved" : "Save user"}
                                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                    >
                                        {isUserBookmarked(user.id) ? '★' : '☆'}
                                    </button>
                                    <div className="user-card-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div className="user-avatar-large" style={{
                                            width: '50px', height: '50px', background: '#3b82f6', color: 'white', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold'
                                        }}>
                                            {user.fullName?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-card-info">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <h3 style={{ margin: 0, color: 'white' }}>{user.fullName}</h3>
                                                <BadgeCollection badges={calculateBadges({ ...user }, teams)} size="small" maxDisplay={3} />
                                            </div>
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
                                                    openProfileEditModal();
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
                            ))}

                            {/* Pagination Controls */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={goToPage}
                                    totalItems={totalItems}
                                    startIndex={startIndex}
                                    endIndex={endIndex}
                                    hasNextPage={hasNextPage}
                                    hasPrevPage={hasPrevPage}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Profile Restriction Overlay */}
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

            {/* Complete Profile Modal used for editing as well */}
            {(showCompleteProfileModal || editingProfile) && (
                <div style={{ position: 'fixed', zIndex: 1000, inset: 0 }}>
                    <CompleteProfileModal
                        // Pass props if reusing CompleteProfileModal directly or use specific ProfileEditModal if that's what we want
                        // However, based on imports, there's a ProfileEditModal imported in ProfileView.jsx but not here.
                        // We imported CompleteProfileModal at top. Let's stick to using that or copying ProfileEditModal functionality
                        isOpen={true}
                        onClose={() => {
                            setShowCompleteProfileModal(false);
                            closeProfileEditModal();
                        }}
                        initialData={editingProfile ? profileData : null}
                        isEditing={editingProfile}
                        onSave={editingProfile ? handleSaveProfile : undefined}
                    />
                </div>
            )}

            {/* Reuse ProfileEditModal logic but with CompleteProfileModal component as container if possible 
                Actually, let's fix the Modal usage. ProfileView calls it ProfileEditModal.
                Here we have CompleteProfileModal imported.
                Let's replace the import to use ProfileEditModal to be consistent with ProfileView logic we copied.
             */}
        </div>
    );
};

export default DiscoverTalent;
