import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";

// Professional SVG Icons for each category
const CategoryIcons = {
    research: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="researchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
            </defs>
            <path d="M9 2C6.38 2 4.25 4.13 4.25 6.75C4.25 9.32 6.26 11.4 8.81 11.49L9 20.5C9 21.33 9.67 22 10.5 22H13.5C14.33 22 15 21.33 15 20.5L15.19 11.49C17.74 11.4 19.75 9.32 19.75 6.75C19.75 4.13 17.62 2 15 2H9Z" stroke="url(#researchGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 2V6" stroke="url(#researchGrad)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M7 6H17" stroke="url(#researchGrad)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="9" r="2" stroke="url(#researchGrad)" strokeWidth="1.5" />
        </svg>
    ),
    hackathon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="hackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
            </defs>
            <rect x="2" y="4" width="20" height="14" rx="2" stroke="url(#hackGrad)" strokeWidth="1.5" />
            <path d="M7 20H17" stroke="url(#hackGrad)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 18V20" stroke="url(#hackGrad)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M7 9L9 11L7 13" stroke="url(#hackGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 13H16" stroke="url(#hackGrad)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    startup: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="startupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
            </defs>
            <path d="M12 2L12.9 5.64C13.74 8.85 16.15 11.26 19.36 12.1L23 13L19.36 13.9C16.15 14.74 13.74 17.15 12.9 20.36L12 24L11.1 20.36C10.26 17.15 7.85 14.74 4.64 13.9L1 13L4.64 12.1C7.85 11.26 10.26 8.85 11.1 5.64L12 2Z" stroke="url(#startupGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    sports: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="sportsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="10" stroke="url(#sportsGrad)" strokeWidth="1.5" />
            <path d="M12 2C12 2 14.5 5.5 14.5 12C14.5 18.5 12 22 12 22" stroke="url(#sportsGrad)" strokeWidth="1.5" />
            <path d="M12 2C12 2 9.5 5.5 9.5 12C9.5 18.5 12 22 12 22" stroke="url(#sportsGrad)" strokeWidth="1.5" />
            <path d="M2 12H22" stroke="url(#sportsGrad)" strokeWidth="1.5" />
            <path d="M4 6.5C7 8.5 17 8.5 20 6.5" stroke="url(#sportsGrad)" strokeWidth="1.5" />
            <path d="M4 17.5C7 15.5 17 15.5 20 17.5" stroke="url(#sportsGrad)" strokeWidth="1.5" />
        </svg>
    ),
    esports: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="esportsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
            </defs>
            <rect x="2" y="6" width="20" height="12" rx="3" stroke="url(#esportsGrad)" strokeWidth="1.5" />
            <circle cx="7" cy="12" r="2" stroke="url(#esportsGrad)" strokeWidth="1.5" />
            <circle cx="16" cy="10" r="1" fill="url(#esportsGrad)" />
            <circle cx="18" cy="12" r="1" fill="url(#esportsGrad)" />
            <circle cx="16" cy="14" r="1" fill="url(#esportsGrad)" />
            <circle cx="14" cy="12" r="1" fill="url(#esportsGrad)" />
            <path d="M5 6V4C5 3.45 5.45 3 6 3H8" stroke="url(#esportsGrad)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M19 6V4C19 3.45 18.55 3 18 3H16" stroke="url(#esportsGrad)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    cultural: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="culturalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
            </defs>
            <path d="M8 3C8 3 5 6 5 10C5 12 6 14 8 14" stroke="url(#culturalGrad)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 3C16 3 19 6 19 10C19 12 18 14 16 14" stroke="url(#culturalGrad)" strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="12" cy="16" rx="5" ry="3" stroke="url(#culturalGrad)" strokeWidth="1.5" />
            <path d="M7 16V19C7 20.66 9.24 22 12 22C14.76 22 17 20.66 17 19V16" stroke="url(#culturalGrad)" strokeWidth="1.5" />
            <circle cx="9" cy="9" r="1.5" fill="url(#culturalGrad)" />
            <circle cx="15" cy="9" r="1.5" fill="url(#culturalGrad)" />
            <path d="M10 12C10 12 11 13 12 13C13 13 14 12 14 12" stroke="url(#culturalGrad)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
};

const CATEGORIES = [
    { id: "research", name: "Research" },
    { id: "hackathon", name: "Hackathon" },
    { id: "startup", name: "Startup" },
    { id: "sports", name: "Sports" },
    { id: "esports", name: "Esports" },
    { id: "cultural", name: "Cultural" },
];

const Events = () => {
    const { events, teams } = useOutletContext();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState(null);

    return (
        <div className="events--section">
            {!selectedCategory ? (
                // LEVEL 1: Categories
                <>
                    <h1 className="event--heading">Explore Categories</h1>
                    <p className="event--desc">Select a category to find relevant events</p>
                    <div className="categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                        {CATEGORIES.map(cat => (
                            <div key={cat.id} className="category-card"
                                onClick={() => setSelectedCategory(cat.id)}
                                style={{
                                    padding: '2rem',
                                    background: '#0a0a0a',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '1rem',
                                    padding: '1rem'
                                }}>
                                    {CategoryIcons[cat.id]}
                                </div>
                                <h3 style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{cat.name}</h3>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                // LEVEL 2: Events in Category
                <>
                    <div className="category-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <button onClick={() => setSelectedCategory(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'white' }}>←</button>
                        <h1 className="event--heading" style={{ margin: 0 }}>{CATEGORIES.find(c => c.id === selectedCategory)?.name} Events</h1>
                    </div>

                    <div className="event--cards--section">
                        {events
                            .filter(e => e.category?.toLowerCase() === selectedCategory.toLowerCase())
                            .map(event => (
                                <div key={event.id} className="events--card" onClick={() => {
                                    // Navigate to Teams page with filter
                                    navigate(`/app/teams?event=${encodeURIComponent(event.name)}`);
                                }}>
                                    <div className="event--idea">
                                        <h2>{event.name}</h2>
                                        <p>Deadline: {event.deadline}</p>
                                        <a href={event.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Visit Website ↗</a>
                                        <h4>👥 {teams.filter(t => t.eventName === event.name).length} Teams</h4>
                                    </div>
                                </div>
                            ))}
                        {events.filter(e => e.category?.toLowerCase() === selectedCategory.toLowerCase()).length === 0 && (
                            <p>No events found in this category.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Events;
