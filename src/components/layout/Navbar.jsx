import React, { useState } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import logo from "../../assets/connect.webp";
import NotificationDropdown from "../notifications/NotificationDropdown";
import { useAuth } from "../../AuthContext";

const Navbar = ({
    userProfile,
    notifications,
    unreadCount
}) => {
    const { logOut } = useAuth();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logOut();
            navigate("/login", { replace: true });
        } catch (e) {
            console.error(e);
        }
    };

    const [searchParams] = useSearchParams();
    const notificationId = searchParams.get("notification_id");

    React.useEffect(() => {
        if (notificationId) {
            setShowNotifications(true);
        }
    }, [notificationId]);

    // Close menu when navigating
    const handleNavClick = () => {
        setMobileMenuOpen(false);
    };

    return (
        <>
            <div className="header--navbar">
                <Link to="/app/events" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                    <img src={logo} alt="logo" className="mainlogo" />
                    <div className="logo--desc">
                        <h2 className="logo--heading">ConnectU</h2>
                        <p>Find your perfect team</p>
                    </div>
                </Link>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        className="notification--navbar"
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{ position: "relative" }}
                    >
                        🔔 <span className="hide-on-mobile">Notifications</span> {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                    </button>

                    {/* Desktop Logout */}
                    <button className="logout-btn hide-on-mobile" onClick={handleLogout}>
                        Logout
                    </button>

                    {/* Mobile Hamburger Button */}
                    <button
                        className="hamburger-btn show-on-mobile-flex"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Open menu"
                    >
                        <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
                        <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
                        <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
                    <div className="mobile-menu-glass" onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-menu-header">
                            <h3>Menu</h3>
                            <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
                        </div>

                        <nav className="mobile-menu-nav">
                            <NavLink to="/app/events" className={({ isActive }) => `mobile-menu-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                                <span className="mobile-menu-icon">📅</span> Events
                            </NavLink>
                            <NavLink to="/app/teams" className={({ isActive }) => `mobile-menu-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                                <span className="mobile-menu-icon">👥</span> Teams
                            </NavLink>
                            <NavLink to="/app/recommendations" className={({ isActive }) => `mobile-menu-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                                <span className="mobile-menu-icon">✨</span> For You
                            </NavLink>
                            <NavLink to="/app/profile" className={({ isActive }) => `mobile-menu-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                                <span className="mobile-menu-icon">👤</span> Profile
                            </NavLink>
                            <NavLink to="/app/discover" className={({ isActive }) => `mobile-menu-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                                <span className="mobile-menu-icon">🔍</span> Discover
                            </NavLink>
                        </nav>

                        <div className="mobile-menu-footer">
                            <button className="mobile-logout-btn" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                                ↪ Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showNotifications && (
                <NotificationDropdown
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                    userProfile={userProfile}
                    initialNotificationId={notificationId}
                />
            )}
        </>
    );
};

export default Navbar;
