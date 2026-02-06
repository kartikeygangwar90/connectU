import React, { useState, useEffect } from "react";
import { doc, updateDoc, addDoc, collection, serverTimestamp, deleteDoc, arrayUnion, getDoc, writeBatch } from "firebase/firestore";
import { dataBase, auth } from "../../firebase";
import toast from "react-hot-toast";
import { formatTimeAgo } from "../../utils/dateUtils";
import "./notifications.css";

const NotificationDropdown = ({ notifications, onClose, userProfile, initialNotificationId }) => {

    const [selectedNotification, setSelectedNotification] = useState(null);
    const [marketingAllRead, setMarkingAllRead] = useState(false);

    // Auto-open if initialNotificationId matches
    useEffect(() => {
        if (initialNotificationId && notifications.length > 0) {
            const target = notifications.find(n => n.id === initialNotificationId);
            if (target) setSelectedNotification(target);
        }
    }, [initialNotificationId, notifications]);

    // Mark all as read
    const markAllAsRead = async () => {
        const unreadNotifications = notifications.filter(n => !n.read);
        if (unreadNotifications.length === 0) return;

        setMarkingAllRead(true);
        try {
            const batch = writeBatch(dataBase);
            unreadNotifications.forEach(n => {
                const ref = doc(dataBase, "notifications", n.id);
                batch.update(ref, { read: true });
            });
            await batch.commit();
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Error marking all as read:", error);
            toast.error("Failed to mark all as read");
        } finally {
            setMarkingAllRead(false);
        }
    };

    const handleAcceptRequest = async (notification) => {
        try {
            // Determine which user to add
            const userToAdd = notification.type === 'team_invite'
                ? auth.currentUser.uid
                : notification.fromUserId;

            // Check team capacity/existence logic...
            if (notification.teamId) {
                const teamRef = doc(dataBase, "teams", notification.teamId);
                const teamSnap = await getDoc(teamRef);

                if (!teamSnap.exists()) {
                    toast.error("This team no longer exists.");
                    await updateDoc(doc(dataBase, "notifications", notification.id), { status: "rejected", read: true });
                    setSelectedNotification(null);
                    return;
                }

                const teamData = teamSnap.data();
                const currentMembers = teamData.members?.length || 1;
                const maxSize = parseInt(teamData.teamSize) || 10;

                if (teamData.members?.includes(userToAdd)) {
                    toast.error("User is already a member.");
                    await updateDoc(doc(dataBase, "notifications", notification.id), { status: "rejected", read: true });
                    setSelectedNotification(null);
                    return;
                }

                if (currentMembers >= maxSize) {
                    toast.error("Team is full.");
                    await updateDoc(doc(dataBase, "notifications", notification.id), { status: "rejected", read: true });
                    setSelectedNotification(null);
                    return;
                }

                // Add Member
                await updateDoc(teamRef, {
                    members: arrayUnion(userToAdd)
                });
            }

            // Update Notification Status
            await updateDoc(doc(dataBase, "notifications", notification.id), { status: "accepted", read: true });

            // Notify sender
            const notifyUserId = notification.type === 'team_invite' ? notification.fromUserId : notification.fromUserId;
            const message = notification.type === 'team_invite'
                ? `${userProfile?.fullName} accepted your invite to "${notification.teamName}"!`
                : `Your request to join "${notification.teamName}" was accepted!`;

            await addDoc(collection(dataBase, "notifications"), {
                type: "request_accepted",
                fromUserId: auth.currentUser.uid,
                fromUserName: userProfile?.fullName,
                toUserId: notifyUserId,
                teamName: notification.teamName,
                message: message,
                createdAt: serverTimestamp(),
                read: false,
            });

            toast.success("Accepted! 🎉");
            setSelectedNotification(null);
        } catch (error) {
            console.error(error);
            toast.error("Error: " + error.message);
        }
    };

    const handleRejectRequest = async (notification) => {
        try {
            await updateDoc(doc(dataBase, "notifications", notification.id), { status: "rejected", read: true });

            // Notify rejection
            await addDoc(collection(dataBase, "notifications"), {
                type: "request_rejected",
                fromUserId: auth.currentUser.uid,
                toUserId: notification.fromUserId,
                teamName: notification.teamName,
                message: `Request to join "${notification.teamName}" declined.`,
                createdAt: serverTimestamp(),
                read: false,
            });

            toast.success("Rejected.");
            setSelectedNotification(null);
        } catch (error) { console.error(error); }
    };

    const markAsRead = async (id, isRead) => {
        if (isRead) return;
        try { await updateDoc(doc(dataBase, "notifications", id), { read: true }); } catch (error) { console.error(error); }
    };

    const deleteNotification = async (id) => {
        try { await deleteDoc(doc(dataBase, "notifications", id)); } catch (error) { console.error(error); }
    };

    const deleteAllNotifications = async () => {
        if (notifications.length === 0) return;
        if (!window.confirm("Delete all notifications?")) return;
        try {
            const batch = writeBatch(dataBase);
            notifications.forEach(n => {
                const ref = doc(dataBase, "notifications", n.id);
                batch.delete(ref);
            });
            await batch.commit();
            toast.success("All notifications deleted");
        } catch (e) {
            console.error(e);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'join_request': return <span className="notification-icon-wrapper icon-request">👋</span>;
            case 'team_invite': return <span className="notification-icon-wrapper icon-invite">📩</span>;
            case 'request_accepted': return <span className="notification-icon-wrapper icon-system">✅</span>;
            case 'request_rejected': return <span className="notification-icon-wrapper icon-reject">❌</span>;
            default: return <span className="notification-icon-wrapper icon-system">📢</span>;
        }
    };

    const hasUnread = notifications.some(n => !n.read);

    return (
        <>
            <div className="notifications-dropdown">
                <div className="notifications-header">
                    <h3>Notifications</h3>
                    <div className="notifications-header-actions">
                        {hasUnread && (
                            <button
                                className="header-action-btn"
                                onClick={markAllAsRead}
                                disabled={marketingAllRead}
                            >
                                {marketingAllRead ? 'Marking...' : 'Mark all read'}
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button className="header-action-btn" onClick={deleteAllNotifications}>Clear all</button>
                        )}
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>
                </div>

                <div className="notifications-list">
                    {notifications.length === 0 ? (
                        <div className="no-notifications">
                            <span className="empty-icon">🔕</span>
                            <p>No new notifications</p>
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div
                                key={n.id}
                                className={`notification-item ${!n.read ? 'unread' : ''}`}
                                onClick={() => { markAsRead(n.id, n.read); setSelectedNotification(n); }}
                            >
                                {getIcon(n.type)}
                                <div className="notification-text-content">
                                    <p className="notification-main-text">
                                        {n.type === 'join_request' ? (
                                            <><strong>{n.fromUserName}</strong> requested to join <strong>{n.teamName}</strong></>
                                        ) : n.type === 'team_invite' ? (
                                            <>Invited to join <strong>{n.teamName}</strong></>
                                        ) : (
                                            n.message
                                        )}
                                    </p>
                                    <div className="notification-meta">
                                        <span className="notification-time">{formatTimeAgo(n.createdAt)}</span>
                                        <div className="notification-actions">
                                            <button
                                                className="action-btn-mini"
                                                onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Notification Detail Modal */}
            {selectedNotification && (
                <div className="modal-overlay" style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, backdropFilter: 'blur(5px)'
                }} onClick={() => setSelectedNotification(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                            <h3 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {getIcon(selectedNotification.type)}
                                {selectedNotification.type === 'join_request' ? "Join Request" : selectedNotification.type === 'team_invite' ? "Team Invitation" : "Notification"}
                            </h3>
                            <button onClick={() => setSelectedNotification(null)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        <div style={{ color: '#e4e4e7', fontSize: '0.95rem', lineHeight: '1.6' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.75rem 1rem', alignItems: 'baseline' }}>
                                {selectedNotification.fromUserName && (
                                    <>
                                        <span style={{ color: '#a1a1aa' }}>From:</span>
                                        <strong>{selectedNotification.fromUserName}</strong>
                                    </>
                                )}
                                {selectedNotification.teamName && (
                                    <>
                                        <span style={{ color: '#a1a1aa' }}>Team:</span>
                                        <strong>{selectedNotification.teamName}</strong>
                                    </>
                                )}
                                <span style={{ color: '#a1a1aa' }}>Received:</span>
                                <span>{formatTimeAgo(selectedNotification.createdAt)}</span>
                            </div>

                            <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                {selectedNotification.message || "No additional message."}
                            </div>

                            {selectedNotification.fromUserSkills?.length > 0 && (
                                <div style={{ marginTop: '1rem' }}>
                                    <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Skills:</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {selectedNotification.fromUserSkills.map((s, i) => (
                                            <span key={i} style={{ background: '#27272a', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            {(selectedNotification.type === 'join_request' || selectedNotification.type === 'team_invite') && selectedNotification.status === 'pending' ? (
                                <>
                                    <button onClick={() => handleRejectRequest(selectedNotification)} style={{ padding: '0.6rem 1.2rem', background: '#27272a', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>Decline</button>
                                    <button onClick={() => handleAcceptRequest(selectedNotification)} style={{ padding: '0.6rem 1.2rem', background: '#22c55e', color: 'black', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>Accept</button>
                                </>
                            ) : (
                                <button onClick={() => setSelectedNotification(null)} style={{ padding: '0.6rem 1.2rem', background: 'white', color: 'black', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>Close</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NotificationDropdown;
