import React from "react";
import PropTypes from "prop-types";

/**
 * ProjectCard - Displays a user's project with title, description, tech stack, and links
 */
const ProjectCard = ({
    project,
    onEdit,
    onDelete,
    isOwner = false,
    compact = false
}) => {
    const { title, description, techStack = [], githubUrl, liveUrl, imageUrl } = project;

    return (
        <div style={{
            background: '#0a0a0a',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            height: '100%'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Project Image (optional) */}
            {imageUrl && !compact && (
                <div style={{
                    width: '100%',
                    height: '140px',
                    background: `url(${imageUrl}) center/cover no-repeat`,
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }} />
            )}

            {/* Content */}
            <div style={{
                padding: compact ? '1rem' : '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                flex: 1
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{
                            margin: 0,
                            color: 'white',
                            fontSize: compact ? '1rem' : '1.15rem',
                            fontWeight: 600,
                            lineHeight: 1.3
                        }}>
                            🚀 {title}
                        </h3>
                    </div>

                    {/* Owner Actions */}
                    {isOwner && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => onEdit?.(project)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#a1a1aa',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    fontSize: '0.9rem',
                                    transition: 'color 0.2s'
                                }}
                                title="Edit project"
                                onMouseEnter={(e) => e.target.style.color = 'white'}
                                onMouseLeave={(e) => e.target.style.color = '#a1a1aa'}
                            >
                                ✏️
                            </button>
                            <button
                                onClick={() => onDelete?.(project)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#a1a1aa',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    fontSize: '0.9rem',
                                    transition: 'color 0.2s'
                                }}
                                title="Delete project"
                                onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                                onMouseLeave={(e) => e.target.style.color = '#a1a1aa'}
                            >
                                🗑️
                            </button>
                        </div>
                    )}
                </div>

                {/* Description */}
                <p style={{
                    margin: 0,
                    color: '#a1a1aa',
                    fontSize: compact ? '0.85rem' : '0.9rem',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: compact ? 2 : 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1
                }}>
                    {description}
                </p>

                {/* Tech Stack */}
                {techStack.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {techStack.slice(0, compact ? 3 : 5).map((tech, i) => (
                            <span
                                key={i}
                                style={{
                                    background: '#27272a',
                                    color: '#a1a1aa',
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '0.4rem',
                                    fontSize: '0.75rem',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                {tech}
                            </span>
                        ))}
                        {techStack.length > (compact ? 3 : 5) && (
                            <span style={{
                                color: '#71717a',
                                fontSize: '0.75rem',
                                padding: '0.25rem 0'
                            }}>
                                +{techStack.length - (compact ? 3 : 5)}
                            </span>
                        )}
                    </div>
                )}

                {/* Links */}
                {(githubUrl || liveUrl) && (
                    <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        marginTop: 'auto',
                        paddingTop: '0.5rem'
                    }}>
                        {githubUrl && (
                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    color: '#a1a1aa',
                                    textDecoration: 'none',
                                    fontSize: '0.85rem',
                                    transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'white'}
                                onMouseLeave={(e) => e.target.style.color = '#a1a1aa'}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                GitHub
                            </a>
                        )}
                        {liveUrl && (
                            <a
                                href={liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    color: '#3b82f6',
                                    textDecoration: 'none',
                                    fontSize: '0.85rem',
                                    transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.color = '#60a5fa'}
                                onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
                            >
                                🔗 Live Demo
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

ProjectCard.propTypes = {
    project: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        techStack: PropTypes.arrayOf(PropTypes.string),
        githubUrl: PropTypes.string,
        liveUrl: PropTypes.string,
        imageUrl: PropTypes.string
    }).isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    isOwner: PropTypes.bool,
    compact: PropTypes.bool
};

// Memoize for performance in lists
export default React.memo(ProjectCard);
