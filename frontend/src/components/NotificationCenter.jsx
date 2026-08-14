import { useState, useEffect } from "react";
import { fetchNotifications, markNotificationsRead, respondToInvitation } from "../api/studentDashboard";
import { useAuth } from "../context/AuthContext";
import TeammateInviteModal from "./TeammateInviteModal";
import { IconClose, IconCheck } from "./GlyphIcons";

// Mode labels for display in the notification card
const MODE_LABEL = {
    solo: "Solo project — you'd build this alone",
    group_student_led: "Group project — you recruit teammates",
    group_startup_led: "Group project — the startup chose the team",
};

export default function NotificationCenter({ onClose }) {
    const { auth } = useAuth();
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [recruitingFor, setRecruitingFor] = useState(null); // { invitationId, title } or null

    useEffect(() => {
        fetchNotifications(auth.token)
            .then((data) => setNotifs(data.notifications || []))
            .finally(() => setLoading(false));

        // Mark all as read when panel opens
        markNotificationsRead(auth.token);
    }, [auth.token]);

    async function handleRespond(invitationId, response) {
        await respondToInvitation(auth.token, invitationId, response);
        setNotifs((prev) =>
            prev.map((n) =>
                n.invitation?.id === invitationId
                    ? { ...n, invitation: { ...n.invitation, status: response } }
                    : n
            )
        );
    }

    return (
        <div style={styles.overlay} onClick={onClose}>
            {recruitingFor && (
                <TeammateInviteModal
                    invitationId={recruitingFor.invitationId}
                    opportunityTitle={recruitingFor.title}
                    onClose={() => setRecruitingFor(null)}
                    onSuccess={() => {
                        setRecruitingFor(null);
                        alert("Invitations sent! Your teammates will see them in their notifications.");
                    }}
                />
            )}
            <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h3 style={{ margin: 0, fontSize: "1rem" }}>Notifications</h3>
                    <button onClick={onClose} style={styles.closeBtn}><IconClose size={16} /></button>
                </div>

                {loading && <p style={styles.empty}>Loading…</p>}
                {!loading && notifs.length === 0 && (
                    <p style={styles.empty}>No notifications yet.</p>
                )}

                <div style={styles.list}>
                    {notifs.map((n) => (
                        <div key={n.id} style={{ ...styles.card, opacity: n.isRead ? 0.7 : 1 }}>
                            <div style={styles.cardTitle}>{n.title}</div>
                            <div style={styles.cardBody}>{n.body}</div>

                            {/* Extra context for invitations */}
                            {n.invitation && (
                                <div style={styles.inviteBox}>
                                    <span style={styles.modeBadge}>
                                        {MODE_LABEL[n.invitation.mode] || n.invitation.mode}
                                    </span>
                                    {n.invitation.groupId && (
                                        <span style={styles.groupBadge}>Group ID: {n.invitation.groupId}</span>
                                    )}
                                </div>
                            )}

                            {/* Accept / Decline buttons — only show if still pending */}
                            {n.type === "invitation" && n.invitation?.status === "pending" && (
                                <div style={styles.actions}>
                                    <button
                                        style={styles.acceptBtn}
                                        onClick={() => handleRespond(n.invitation.id, "accepted")}
                                    >
                                        <IconCheck size={13} /> Accept
                                    </button>
                                    <button
                                        style={styles.declineBtn}
                                        onClick={() => handleRespond(n.invitation.id, "declined")}
                                    >
                                        <IconClose size={13} /> Decline
                                    </button>
                                </div>
                            )}

                            {/* Resolved status */}
                            {n.invitation?.status === "accepted" && (
                                <span style={{ ...styles.pill, background: "#d1fae5", color: "#065f46" }}>
                                    <IconCheck size={13} /> Accepted
                                </span>
                            )}

                            {/* Group-student-led: once accepted, let them recruit teammates */}
                            {n.invitation?.status === "accepted" && n.invitation?.mode === "group_student_led" && (
                                <div style={{ marginTop: 10 }}>
                                    <button
                                        style={styles.acceptBtn}
                                        onClick={() =>
                                            setRecruitingFor({
                                                invitationId: n.invitation.id,
                                                title: n.invitation.opportunityTitle,
                                            })
                                        }
                                    >
                                        + Recruit teammates
                                    </button>
                                </div>
                            )}
                            {n.invitation?.status === "declined" && (
                                <span style={{ ...styles.pill, background: "#fee2e2", color: "#991b1b" }}>
                                    <IconClose size={13} /> Declined
                                </span>
                            )}

                            <div style={styles.time}>{n.createdAt}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.25)",
        display: "flex", justifyContent: "flex-end",
    },
    panel: {
        width: 380, height: "100vh", overflowY: "auto",
        background: "#ffffff", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)",
        display: "flex", flexDirection: "column",
    },
    header: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 24px", borderBottom: "1px solid #e5e7eb",
        position: "sticky", top: 0, background: "#ffffff",
    },
    closeBtn: {
        border: "none", background: "transparent", cursor: "pointer",
        fontSize: "1rem", color: "#6b7280",
    },
    list: { padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 },
    card: {
        border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px",
        background: "#fafafa",
    },
    cardTitle: { fontWeight: 600, fontSize: "0.9rem", color: "#111827", marginBottom: 4 },
    cardBody: { fontSize: "0.85rem", color: "#374151", lineHeight: 1.5 },
    inviteBox: { marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 },
    modeBadge: {
        display: "inline-block", padding: "3px 10px", borderRadius: 20,
        background: "#e9edf3", color: "#101d33", fontSize: "0.78rem", fontWeight: 600,
    },
    groupBadge: {
        display: "inline-block", padding: "3px 10px", borderRadius: 20,
        background: "#e0f2fe", color: "#0369a1", fontSize: "0.78rem",
    },
    actions: { display: "flex", gap: 8, marginTop: 12 },
    acceptBtn: {
        padding: "7px 18px", borderRadius: 8, border: "none", cursor: "pointer",
        background: "#1b2a4a", color: "#ffffff", fontWeight: 600, fontSize: "0.85rem",
    },
    declineBtn: {
        padding: "7px 18px", borderRadius: 8, cursor: "pointer",
        background: "transparent", border: "1.5px solid #e5e7eb",
        color: "#6b7280", fontWeight: 600, fontSize: "0.85rem",
    },
    pill: {
        display: "inline-block", marginTop: 10, padding: "4px 12px",
        borderRadius: 20, fontSize: "0.8rem", fontWeight: 600,
    },
    time: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 8 },
    empty: { textAlign: "center", color: "#9ca3af", padding: "40px 0" },
};