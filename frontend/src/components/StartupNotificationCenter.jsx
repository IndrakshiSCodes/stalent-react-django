import { useState, useEffect } from "react";
import { fetchStartupNotifications, markNotificationsRead } from "../api/startupDashboard";
import { useAuth } from "../context/AuthContext";
import { IconClose, IconCheck } from "./GlyphIcons";

// Small icon + tint per notification type, so the startup can scan the
// list at a glance (green = good news, amber = needs attention).
const TYPE_META = {
    invite_accepted: { icon: IconCheck, tint: "#d1fae5", color: "#065f46" },
    group_active: { icon: IconCheck, tint: "#d1fae5", color: "#065f46" },
    invite_declined: { icon: IconClose, tint: "#fee2e2", color: "#991b1b" },
    status_change: { icon: IconCheck, tint: "#e9edf3", color: "#101d33" },
    message: { icon: IconCheck, tint: "#e9edf3", color: "#101d33" },
    application: { icon: IconCheck, tint: "#fef3c7", color: "#92400e" },
};

export default function StartupNotificationCenter({ onClose, onViewStudent }) {
    const { auth } = useAuth();
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStartupNotifications(auth.token)
            .then((data) => setNotifs(data.notifications || []))
            .finally(() => setLoading(false));

        // Mark all as read once the panel is opened
        markNotificationsRead(auth.token);
    }, [auth.token]);

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h3 style={{ margin: 0, fontSize: "1rem" }}>Notifications</h3>
                    <button onClick={onClose} style={styles.closeBtn}><IconClose size={16} /></button>
                </div>

                {loading && <p style={styles.empty}>Loading…</p>}
                {!loading && notifs.length === 0 && (
                    <p style={styles.empty}>
                        No notifications yet. You'll be notified here when a student<br />
                        accepts or declines one of your invitations.
                    </p>
                )}

                <div style={styles.list}>
                    {notifs.map((n) => {
                        const meta = TYPE_META[n.type] || TYPE_META.status_change;
                        const Icon = meta.icon;
                        return (
                            <div key={n.id} style={{ ...styles.card, opacity: n.isRead ? 0.75 : 1 }}>
                                <div style={styles.cardTop}>
                                    <span style={{ ...styles.iconWrap, background: meta.tint, color: meta.color }}>
                                        <Icon size={13} />
                                    </span>
                                    <div style={styles.cardTitle}>{n.title}</div>
                                </div>
                                <div style={styles.cardBody}>{n.body}</div>

                                {n.invitation && (
                                    <div style={styles.inviteBox}>
                                        <span style={styles.chip}>{n.invitation.opportunityTitle}</span>
                                        {n.invitation.studentName && (
                                            <button
                                                style={styles.viewBtn}
                                                onClick={() => onViewStudent?.(n.invitation.studentId)}
                                            >
                                                View student
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div style={styles.time}>{n.createdAt}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(16,29,51,0.25)",
        display: "flex", justifyContent: "flex-end",
    },
    panel: {
        width: 380, maxWidth: "90vw", height: "100vh", overflowY: "auto",
        background: "#ffffff", boxShadow: "-4px 0 24px rgba(16,29,51,0.14)",
        display: "flex", flexDirection: "column",
    },
    header: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 24px", borderBottom: "1px solid #dde3ef",
        position: "sticky", top: 0, background: "#ffffff",
    },
    closeBtn: {
        border: "none", background: "transparent", cursor: "pointer",
        fontSize: "1rem", color: "#6b7280",
    },
    list: { padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 },
    card: {
        border: "1px solid #dde3ef", borderRadius: 12, padding: "16px",
        background: "#ffffff",
    },
    cardTop: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 },
    iconWrap: {
        width: 22, height: 22, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    cardTitle: { fontWeight: 600, fontSize: "0.9rem", color: "#111827" },
    cardBody: { fontSize: "0.85rem", color: "#374151", lineHeight: 1.5 },
    inviteBox: { marginTop: 10, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 },
    chip: {
        display: "inline-block", padding: "3px 10px", borderRadius: 20,
        background: "#e9edf3", color: "#101d33", fontSize: "0.78rem", fontWeight: 600,
    },
    viewBtn: {
        border: "1.5px solid #d98e34", background: "transparent", color: "#b7721f",
        borderRadius: 8, padding: "4px 10px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
    },
    time: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 8 },
    empty: { textAlign: "center", color: "#9ca3af", padding: "40px 24px", lineHeight: 1.6 },
};
