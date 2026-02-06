import React, { useState, useEffect } from "react";

/**
 * Tech stack suggestions for quick selection
 */
const TECH_SUGGESTIONS = [
    "React", "Node.js", "Python", "JavaScript", "TypeScript", "Firebase", "MongoDB",
    "Express.js", "Next.js", "Vue.js", "Angular", "Flutter", "React Native",
    "TailwindCSS", "CSS", "HTML", "PostgreSQL", "MySQL", "Redis", "Docker",
    "AWS", "GCP", "Azure", "Figma", "GraphQL", "REST API"
];

/**
 * ProjectEditModal - Modal for adding or editing projects
 */
const ProjectEditModal = ({
    isOpen,
    project = null, // null for new project, object for editing
    onSave,
    onClose
}) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        techStack: [],
        githubUrl: "",
        liveUrl: "",
        imageUrl: ""
    });
    const [techInput, setTechInput] = useState("");
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Initialize form when project changes
    useEffect(() => {
        if (project) {
            setFormData({
                title: project.title || "",
                description: project.description || "",
                techStack: project.techStack || [],
                githubUrl: project.githubUrl || "",
                liveUrl: project.liveUrl || "",
                imageUrl: project.imageUrl || ""
            });
        } else {
            setFormData({
                title: "",
                description: "",
                techStack: [],
                githubUrl: "",
                liveUrl: "",
                imageUrl: ""
            });
        }
        setErrors({});
    }, [project, isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const addTech = (tech) => {
        const trimmedTech = tech.trim();
        if (!trimmedTech) return;
        if (formData.techStack.includes(trimmedTech)) return;
        if (formData.techStack.length >= 5) return;

        setFormData(prev => ({
            ...prev,
            techStack: [...prev.techStack, trimmedTech]
        }));
        setTechInput("");
    };

    const removeTech = (techToRemove) => {
        setFormData(prev => ({
            ...prev,
            techStack: prev.techStack.filter(t => t !== techToRemove)
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Project title is required";
        } else if (formData.title.length > 50) {
            newErrors.title = "Title must be 50 characters or less";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Project description is required";
        } else if (formData.description.length > 300) {
            newErrors.description = "Description must be 300 characters or less";
        }

        if (formData.githubUrl && !isValidUrl(formData.githubUrl)) {
            newErrors.githubUrl = "Please enter a valid URL";
        }

        if (formData.liveUrl && !isValidUrl(formData.liveUrl)) {
            newErrors.liveUrl = "Please enter a valid URL";
        }

        if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
            newErrors.imageUrl = "Please enter a valid image URL";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setSaving(true);
        try {
            await onSave({
                ...formData,
                id: project?.id || crypto.randomUUID(),
                createdAt: project?.createdAt || new Date()
            });
            onClose();
        } catch (error) {
            console.error("Error saving project:", error);
            setErrors({ submit: "Failed to save project. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                padding: '1rem'
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="modal-content"
                style={{
                    background: '#0a0a0a',
                    padding: '2rem',
                    borderRadius: '1rem',
                    width: '100%',
                    maxWidth: '550px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'white',
                        margin: 0
                    }}>
                        {project ? '✏️ Edit Project' : '🚀 Add New Project'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Title */}
                    <div>
                        <label style={{
                            color: '#a1a1aa',
                            fontSize: '0.85rem',
                            display: 'block',
                            marginBottom: '0.5rem'
                        }}>
                            Project Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="e.g., ConnectU - Team Finding Platform"
                            maxLength={50}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#27272a',
                                color: 'white',
                                border: errors.title ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.5rem',
                                fontSize: '1rem'
                            }}
                        />
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '0.25rem'
                        }}>
                            {errors.title && (
                                <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.title}</span>
                            )}
                            <span style={{ color: '#71717a', fontSize: '0.75rem', marginLeft: 'auto' }}>
                                {formData.title.length}/50
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{
                            color: '#a1a1aa',
                            fontSize: '0.85rem',
                            display: 'block',
                            marginBottom: '0.5rem'
                        }}>
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Describe your project, what problem it solves, key features..."
                            maxLength={300}
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#27272a',
                                color: 'white',
                                border: errors.description ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                resize: 'vertical',
                                minHeight: '100px'
                            }}
                        />
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '0.25rem'
                        }}>
                            {errors.description && (
                                <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.description}</span>
                            )}
                            <span style={{ color: '#71717a', fontSize: '0.75rem', marginLeft: 'auto' }}>
                                {formData.description.length}/300
                            </span>
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div>
                        <label style={{
                            color: '#a1a1aa',
                            fontSize: '0.85rem',
                            display: 'block',
                            marginBottom: '0.5rem'
                        }}>
                            Tech Stack (max 5)
                        </label>

                        {/* Selected Tech */}
                        {formData.techStack.length > 0 && (
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                                marginBottom: '0.75rem'
                            }}>
                                {formData.techStack.map(tech => (
                                    <span
                                        key={tech}
                                        onClick={() => removeTech(tech)}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            background: 'white',
                                            color: 'black',
                                            borderRadius: '1rem',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}
                                    >
                                        {tech} ✕
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Tech Input */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTech(techInput);
                                    }
                                }}
                                placeholder="Add technology..."
                                disabled={formData.techStack.length >= 5}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem 0.75rem',
                                    background: '#27272a',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.5rem',
                                    opacity: formData.techStack.length >= 5 ? 0.5 : 1
                                }}
                            />
                            <button
                                onClick={() => addTech(techInput)}
                                disabled={formData.techStack.length >= 5 || !techInput.trim()}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: formData.techStack.length >= 5 ? '#52525b' : 'white',
                                    color: formData.techStack.length >= 5 ? '#a1a1aa' : 'black',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    cursor: formData.techStack.length >= 5 ? 'not-allowed' : 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                Add
                            </button>
                        </div>

                        {/* Suggestions */}
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.25rem',
                            marginTop: '0.75rem'
                        }}>
                            {TECH_SUGGESTIONS
                                .filter(t => !formData.techStack.includes(t))
                                .slice(0, 8)
                                .map(tech => (
                                    <span
                                        key={tech}
                                        onClick={() => addTech(tech)}
                                        style={{
                                            padding: '0.3rem 0.6rem',
                                            background: '#27272a',
                                            color: '#a1a1aa',
                                            borderRadius: '1rem',
                                            fontSize: '0.75rem',
                                            cursor: formData.techStack.length >= 5 ? 'not-allowed' : 'pointer',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            opacity: formData.techStack.length >= 5 ? 0.5 : 1
                                        }}
                                    >
                                        + {tech}
                                    </span>
                                ))}
                        </div>
                    </div>

                    {/* GitHub URL */}
                    <div>
                        <label style={{
                            color: '#a1a1aa',
                            fontSize: '0.85rem',
                            display: 'block',
                            marginBottom: '0.5rem'
                        }}>
                            GitHub URL (optional)
                        </label>
                        <input
                            type="url"
                            value={formData.githubUrl}
                            onChange={(e) => handleChange('githubUrl', e.target.value)}
                            placeholder="https://github.com/username/project"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#27272a',
                                color: 'white',
                                border: errors.githubUrl ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.5rem'
                            }}
                        />
                        {errors.githubUrl && (
                            <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.githubUrl}</span>
                        )}
                    </div>

                    {/* Live URL */}
                    <div>
                        <label style={{
                            color: '#a1a1aa',
                            fontSize: '0.85rem',
                            display: 'block',
                            marginBottom: '0.5rem'
                        }}>
                            Live Demo URL (optional)
                        </label>
                        <input
                            type="url"
                            value={formData.liveUrl}
                            onChange={(e) => handleChange('liveUrl', e.target.value)}
                            placeholder="https://your-project.com"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#27272a',
                                color: 'white',
                                border: errors.liveUrl ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.5rem'
                            }}
                        />
                        {errors.liveUrl && (
                            <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.liveUrl}</span>
                        )}
                    </div>

                    {/* Image URL (optional) */}
                    <div>
                        <label style={{
                            color: '#a1a1aa',
                            fontSize: '0.85rem',
                            display: 'block',
                            marginBottom: '0.5rem'
                        }}>
                            Preview Image URL (optional)
                        </label>
                        <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => handleChange('imageUrl', e.target.value)}
                            placeholder="https://example.com/project-screenshot.png"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#27272a',
                                color: 'white',
                                border: errors.imageUrl ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.5rem'
                            }}
                        />
                        {errors.imageUrl && (
                            <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.imageUrl}</span>
                        )}
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '0.5rem',
                            padding: '0.75rem',
                            color: '#ef4444',
                            fontSize: '0.9rem'
                        }}>
                            {errors.submit}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'flex-end',
                        marginTop: '0.5rem'
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'transparent',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                color: 'white'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: saving ? '#52525b' : 'white',
                                color: 'black',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                fontWeight: 600
                            }}
                        >
                            {saving ? 'Saving...' : (project ? 'Save Changes' : 'Add Project')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectEditModal;
