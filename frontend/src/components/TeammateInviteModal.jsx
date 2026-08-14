import { useState, useEffect } from "react";
import { fetchTeammateCandidates, inviteTeammate } from "../api/studentDashboard";
import { useAuth } from "../context/AuthContext";
import { IconClose, IconCheck } from "./GlyphIcons";

/**
 * Lets a student who accepted a group_student_led invitation recruit
 * teammates onto their team. Mirrors InviteModal's picker UI but talks to
 * student_invite_teammate (one teammate per call) instead of startup_invite.
 */
export default function TeammateInviteModal({ invitationId, opportunityTitle, onClose, onSuccess }) {
  const { auth } = useAuth();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeammateCandidates(auth.token).then((data) => setStudents(data.students || []));
  }, [auth.token]);

  function toggleStudent(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSend() {
    if (!selected.length) { setError("Select at least one teammate."); return; }
    setLoading(true);
    setError("");
    try {
      // Backend invites one teammate per call — send them in sequence.
      for (const studentId of selected) {
        await inviteTeammate(auth.token, invitationId, studentId);
      }
      onSuccess?.();
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <div>
            <div style={s.headerSub}>Recruit teammates</div>
            <div style={s.headerTitle}>{opportunityTitle}</div>
          </div>
          <button style={s.closeBtn} onClick={onClose}><IconClose size={16} /></button>
        </div>

        <div style={s.body}>
          <p style={s.label}>Select students to invite onto your team</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 360, overflowY: "auto" }}>
            {students.map((st) => {
              const isSelected = selected.includes(st.id);
              return (
                <div
                  key={st.id}
                  onClick={() => toggleStudent(st.id)}
                  style={{
                    ...s.studentCard,
                    borderColor: isSelected ? "#1b2a4a" : "#e5e7eb",
                    background: isSelected ? "#e9edf3" : "#ffffff",
                  }}
                >
                  <div style={{ ...s.avatar, background: st.avatarColor }}>{st.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={s.studentName}>{st.firstName} {st.lastName}</div>
                    <div style={s.studentSub}>{st.university} · {st.major} · Y{st.year}</div>
                  </div>
                  {isSelected && <span style={s.check}><IconCheck size={14} /></span>}
                </div>
              );
            })}
            {students.length === 0 && (
              <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>No other students to invite yet.</p>
            )}
          </div>

          {error && <p style={{ color: "#dc2626", fontSize: "0.85rem", marginTop: 8 }}>{error}</p>}

          <button
            style={{ ...s.primaryBtn, marginTop: 16, opacity: selected.length ? 1 : 0.5 }}
            disabled={!selected.length || loading}
            onClick={handleSend}
          >
            {loading ? "Sending…" : `Invite ${selected.length || ""} teammate${selected.length === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(0,0,0,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  modal: {
    background: "#ffffff", borderRadius: 16,
    width: 480, maxWidth: "95vw",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    display: "flex", flexDirection: "column", maxHeight: "90vh",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "24px 24px 16px", borderBottom: "1px solid #f3f4f6",
  },
  headerSub: { fontSize: "0.78rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 },
  headerTitle: { fontWeight: 700, fontSize: "1.1rem", color: "#111827", marginTop: 2 },
  closeBtn: { border: "none", background: "transparent", cursor: "pointer", fontSize: "1rem", color: "#6b7280" },
  body: { padding: "20px 24px 28px", overflowY: "auto" },
  label: { fontWeight: 600, color: "#374151", marginBottom: 12, fontSize: "0.9rem" },
  studentCard: {
    display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
    border: "2px solid", borderRadius: 12, cursor: "pointer", position: "relative",
  },
  avatar: {
    width: 40, height: 40, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#ffffff", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
  },
  studentName: { fontWeight: 600, fontSize: "0.9rem", color: "#111827" },
  studentSub: { fontSize: "0.78rem", color: "#9ca3af", marginTop: 2 },
  check: {
    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
    color: "#1b2a4a", fontWeight: 700, fontSize: "1rem",
  },
  primaryBtn: {
    width: "100%", padding: "12px", borderRadius: 10, border: "none",
    background: "#1b2a4a", color: "#ffffff", fontWeight: 700, fontSize: "0.95rem",
    cursor: "pointer",
  },
};
