import React from "react";
import PropTypes from "prop-types";

/**
 * Badge definitions with conditions and display properties
 */
const BADGE_DEFINITIONS = [
    {
        id: "profile_complete",
        name: "Profile Complete",
        icon: "✅",
        color: "#22c55e",
        description: "All required profile fields are filled",
        check: (profile) => {
            return Boolean(
                profile?.fullName &&
                profile?.branch &&
                profile?.year &&
                profile?.phone &&
                (profile?.pemail || profile?.nitpemail) &&
                profile?.technicalSkills?.length > 0 &&
                profile?.softSkills?.length > 0 &&
                profile?.experience
            );
        }
    },
    {
        id: "github_connected",
        name: "GitHub Connected",
        icon: "🔗",
        color: "#8b5cf6",
        description: "GitHub profile is linked",
        check: (profile) => Boolean(profile?.githubUsername)
    },

    {
        id: "builder",
        name: "Builder",
        icon: "🚀",
        color: "#f59e0b",
        description: "Has added 3 or more projects",
        check: (profile) => (profile?.projects?.length || 0) >= 3
    },
    {
        id: "experienced",
        name: "Experienced",
        icon: "⭐",
        color: "#eab308",
        description: "Advanced or Expert experience level",
        check: (profile) => ["Advanced", "Expert"].includes(profile?.experience)
    },
    {
        id: "team_player",
        name: "Team Player",
        icon: "👥",
        color: "#06b6d4",
        description: "Member of 3 or more teams",
        check: (profile, teams) => {
            const memberTeams = teams?.filter(t => t.members?.includes(profile?.id)) || [];
            return memberTeams.length >= 3;
        }
    }
];

/**
 * Calculate which badges a user has earned
 * @param {Object} userProfile - User profile data
 * @param {Array} teams - All teams (optional, needed for team_player badge)
 * @returns {Array} Array of earned badge objects
 */
export const calculateBadges = (userProfile, teams = []) => {
    if (!userProfile) return [];

    return BADGE_DEFINITIONS.filter(badge => badge.check(userProfile, teams));
};

/**
 * Get all available badge definitions
 * @returns {Array} All badge definitions
 */
export const getAllBadges = () => BADGE_DEFINITIONS;

/**
 * Individual badge component with tooltip on hover
 */
export const ProfileBadge = ({ badge, size = "medium" }) => {
    const [showTooltip, setShowTooltip] = React.useState(false);

    const sizes = {
        small: { fontSize: "0.9rem", padding: "0.2rem 0.4rem" },
        medium: { fontSize: "1.1rem", padding: "0.3rem 0.5rem" },
        large: { fontSize: "1.3rem", padding: "0.4rem 0.6rem" }
    };

    const sizeStyle = sizes[size] || sizes.medium;

    return (
        <div
            style={{ position: "relative", display: "inline-block" }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <span
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `${badge.color}20`,
                    border: `1px solid ${badge.color}40`,
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    ...sizeStyle
                }}
                title={badge.name}
            >
                {badge.icon}
            </span>

            {/* Tooltip */}
            {showTooltip && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "calc(100% + 8px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#1a1a1a",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "0.5rem",
                        padding: "0.5rem 0.75rem",
                        whiteSpace: "nowrap",
                        zIndex: 1000,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                    }}
                >
                    <p style={{ color: "white", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>
                        {badge.icon} {badge.name}
                    </p>
                    <p style={{ color: "#a1a1aa", fontSize: "0.75rem", margin: "0.25rem 0 0 0" }}>
                        {badge.description}
                    </p>
                    {/* Tooltip arrow */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: "-6px",
                            left: "50%",
                            transform: "translateX(-50%) rotate(45deg)",
                            width: "10px",
                            height: "10px",
                            background: "#1a1a1a",
                            borderRight: "1px solid rgba(255,255,255,0.2)",
                            borderBottom: "1px solid rgba(255,255,255,0.2)"
                        }}
                    />
                </div>
            )}
        </div>
    );
};

/**
 * Badge collection component - displays all earned badges
 */
export const BadgeCollection = ({ badges, size = "medium", maxDisplay = 6 }) => {
    if (!badges || badges.length === 0) return null;

    const displayBadges = badges.slice(0, maxDisplay);
    const remainingCount = badges.length - maxDisplay;

    return (
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", alignItems: "center" }}>
            {displayBadges.map(badge => (
                <ProfileBadge key={badge.id} badge={badge} size={size} />
            ))}
            {remainingCount > 0 && (
                <span style={{
                    fontSize: "0.75rem",
                    color: "#a1a1aa",
                    padding: "0.2rem 0.4rem",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "0.25rem"
                }}>
                    +{remainingCount}
                </span>
            )}
        </div>
    );
};

/**
 * Profile completeness indicator
 */
export const ProfileCompleteness = ({ userProfile, teams = [] }) => {
    const earnedBadges = calculateBadges(userProfile, teams);
    const totalBadges = BADGE_DEFINITIONS.length;
    const percentage = Math.round((earnedBadges.length / totalBadges) * 100);

    return (
        <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ color: "#a1a1aa", fontSize: "0.85rem" }}>Profile Strength</span>
                <span style={{ color: "white", fontSize: "0.85rem", fontWeight: 600 }}>{percentage}%</span>
            </div>
            <div style={{
                width: "100%",
                height: "6px",
                background: "#27272a",
                borderRadius: "3px",
                overflow: "hidden"
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: "100%",
                    background: percentage >= 80 ? "#22c55e" : percentage >= 50 ? "#eab308" : "#ef4444",
                    borderRadius: "3px",
                    transition: "width 0.3s ease"
                }} />
            </div>
            <div style={{ marginTop: "0.75rem" }}>
                <BadgeCollection badges={earnedBadges} size="small" />
            </div>
        </div>
    );
};

// PropTypes for badge shape
const badgeShape = PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    description: PropTypes.string
});

ProfileBadge.propTypes = {
    badge: badgeShape.isRequired,
    size: PropTypes.oneOf(['small', 'medium', 'large'])
};

BadgeCollection.propTypes = {
    badges: PropTypes.arrayOf(badgeShape),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    maxDisplay: PropTypes.number
};

ProfileCompleteness.propTypes = {
    userProfile: PropTypes.object,
    teams: PropTypes.array
};

export default {
    calculateBadges,
    getAllBadges,
    ProfileBadge,
    BadgeCollection,
    ProfileCompleteness
};
