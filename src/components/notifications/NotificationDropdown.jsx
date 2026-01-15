import React from "react";
import { doc, updateDoc, addDoc, collection, serverTimestamp, deleteDoc, arrayUnion } from "firebase/firestore";
import { dataBase, auth } from "../../firebase";
import toast from "react-hot-toast";

const NotificationDropdown = ({ notifications, onClose, userProfile, initialNotificationId }) => {

    const [selectedNotification, setSelectedNotification] = React.useState(null);

    // Auto-open if initialNotificationId matches
    React.useEffect(() => {
        if (initialNotificationId && notifications.length > 0) {
            const target = notifications.find(n => n.id === initialNotificationId);
            if (target) setSelectedNotification(target);
        }
    }, [initialNotificationId, notifications]);

    const handleAcceptRequest = async (notification) => {
        try {
            // Determine which user to add based on notification type
            // join_request: add the person who requested (fromUserId)
            // team_invite: add the current user who is accepting the invite (me)
            const userToAdd = notification.type === 'team_invite'
                ? auth.currentUser.uid
                : notification.fromUserId;

            // Add Member to Team
            if (notification.teamId) {
                await updateDoc(doc(dataBase, "teams", notification.teamId), {
                    members: arrayUnion(userToAdd)
                });
            }

            await updateDoc(doc(dataBase, "notifications", notification.id), { status: "accepted", read: true });

            // Notify the other party
            const notifyUserId = notification.type === 'team_invite'
                ? notification.fromUserId  // Notify the leader
                : notification.fromUserId; // Notify the requester

            const message = notification.type === 'team_invite'
                ? `${userProfile?.fullName} has accepted your invite to join "${notification.teamName}"!`
                : `Your request to join "${notification.teamName}" has been accepted!`;

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
            toast.success("Accepted! You have been added to the team. 🎉");
            setSelectedNotification(null);
        } catch (error) {
            console.error(error);
            toast.error("Error accepting request: " + error.message);
        }
    };

    const handleRejectRequest = async (notification) => {
        try {
            await updateDoc(doc(dataBase, "notifications", notification.id), { status: "rejected", read: true });
            await addDoc(collection(dataBase, "notifications"), {
                type: "request_rejected",
                fromUserId: auth.currentUser.uid,
                toUserId: notification.fromUserId,
                teamName: notification.teamName,
                message: `Your request to join "${notification.teamName}" was not accepted.`,
                createdAt: serverTimestamp(),
                read: false,
            });
            toast.success("Request rejected.");
            setSelectedNotification(null); // Close modal
        } catch (error) { console.error(error); }
    };

    const markAsRead = async (id) => {
        try { await updateDoc(doc(dataBase, "notifications", id), { read: true }); } catch (error) { console.error("Error marking notification as read:", error); }
    };

    const deleteNotification = async (id) => {
        try { await deleteDoc(doc(dataBase, "notifications", id)); } catch (error) { console.error("Error deleting notification:", error); }
    };

    const deleteAllNotifications = async () => {
        if (notifications.length === 0) return;
        if (!window.confirm("Are you sure you want to delete all notifications?")) return;
        try {
            await Promise.all(notifications.map(n => deleteDoc(doc(dataBase, "notifications", n.id))));
        } catch (e) {
            console.error("Error deleting all notifications:", e);
        }
    };

    return (
        <>
            <div className="notifications-dropdown">
                <div className="notifications-header">
                    <h3>Notifications</h3>
                    <div className="notifications-header-actions">
                        {notifications.length > 0 && (
                            <button className="delete-all-btn" onClick={deleteAllNotifications}>Delete All</button>
                        )}
                        <button onClick={onClose}>✕</button>
                    </div>
                </div>
                <div className="notifications-list">
                    {notifications.length === 0 ? <p className="no-notifications">No notifications</p> : notifications.map(n => (
                        <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`} onClick={() => { markAsRead(n.id); setSelectedNotification(n); }}>
                            <div className="notification-text-content">
                                <p className="notification-main-text">
                                    {n.type === 'join_request' ? `Request from ${n.fromUserName}` : (n.message || "Notification")}
                                </p>
                                <span className="notification-hint">to view details</span>
                            </div>
                            <button className="notification-delete-btn" onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}>🗑️</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notification Detail Modal */}
            {selectedNotification && (
                <div className="modal-overlay" style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
                }}>
                    <div className="modal-content" style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ color: 'white', marginBottom: '1rem' }}>{selectedNotification.type === 'join_request' ? "Join Request Details" : selectedNotification.type === 'team_invite' ? "Team Invite" : "Notification Details"}</h3>

                        <div style={{ margin: '1rem 0', color: 'white' }}>
                            <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#a1a1aa' }}>From:</strong> {selectedNotification.fromUserName || 'Unknown'}</p>
                            {selectedNotification.fromUserEmail && <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#a1a1aa' }}>Email:</strong> {selectedNotification.fromUserEmail}</p>}
                            <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#a1a1aa' }}>Team:</strong> {selectedNotification.teamName || 'N/A'}</p>

                            <p style={{ marginTop: '1rem', marginBottom: '0.5rem' }}><strong style={{ color: '#a1a1aa' }}>Message:</strong></p>
                            <p style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '0.5rem', color: '#e4e4e7', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {selectedNotification.message || 'No message provided'}
                            </p>

                            {selectedNotification.fromUserSkills && selectedNotification.fromUserSkills.length > 0 && (
                                <div style={{ marginTop: '1rem' }}>
                                    <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#a1a1aa' }}>Skills:</strong></p>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {selectedNotification.fromUserSkills.map((s, i) => <span key={i} style={{ background: '#27272a', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.1)' }}>{s}</span>)}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setSelectedNotification(null)} style={{ padding: '0.5rem 1rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem', background: 'transparent', color: 'white', cursor: 'pointer' }}>Close</button>

                            {(selectedNotification.type === 'join_request' || selectedNotification.type === 'team_invite') && selectedNotification.status === 'pending' && (
                                <>
                                    <button onClick={() => handleRejectRequest(selectedNotification)} style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Reject</button>
                                    <button onClick={() => handleAcceptRequest(selectedNotification)} style={{ padding: '0.5rem 1rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Accept</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NotificationDropdown;
