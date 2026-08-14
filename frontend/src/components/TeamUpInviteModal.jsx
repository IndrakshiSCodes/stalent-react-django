import { useState } from "react";
import { sendInvitations } from "../api/startupDashboard";
import { useAuth } from "../context/AuthContext";
import { IconClose, IconCheck } from "./GlyphIcons";

/**
 * Lets a startup invite a pair of students who have already teamed up
 * (see TeamUp model) to one of the startup's own opportunities together,
 * as a group_startup_led project. Reuses the existing startup_invite
 * endpoint — no backend changes needed, since it already accepts multiple
 * studentIds under that hiring mode.
 */
export default function TeamUpInviteModal({ team, opportunities, onClose, onSuccess }) {
  const { auth } = useAuth();
  const [opportunityId, setOpportunityId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const memberIds = team.members.map((m) => m.id);

  async function handleSend() {
    if (!opportunityId) { setError("Select a project first."); return; }
    setLoading(true);
    setError("");
    try {
      await sendInvitations(auth.token, opportunityId, memberIds, "group_startup_led");
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
            <div style={s.headerSub}>Invite as a team</div>
            <div style={s.headerTitle}>
              {team.members.map((m) => m.name).join(" & ")}
            </div>
          </div>
          <button style={s.closeBtn} onClick={onClose}><IconClose size={16} /></button>
        </div>

        <div style={s.body}>
          {opportunities.length === 0 ? (
            <p style={s.emptyNote}>
              You don't have any projects posted yet. Post a project before inviting this team.
            </p>
          ) : (
            <>
              <p style={s.label}>Which project should they work on together?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflowY: "auto" }}>
                {opportunities.map((opp) => {
                  const isSelected = opportunityId === opp.id;
                  return (
                    <div
                      key={opp.id}
                      onClick={() => { setOpportunityId(opp.id); setError(""); }}
                      style={{
                        ...s.oppCard,
                        borderColor: isSelected ? "#1b2a4a" : "#e5e7eb",
                        background: isSelected ? "#e9edf3" : "#ffffff",
                      }}
                    >
                      <span style={s.oppTitle}>{opp.title}</span>
                      {isSelected && <span style={s.check}><IconCheck size={14} /></span>}
                    </div>
                  );
                })}
              </div>

              {error && <p style={{ color: "#dc2626", fontSize: "0.85rem", marginTop: 8 }}>{error}</p>}

              <button
                style={{ ...s.primaryBtn, marginTop: 16, opacity: opportunityId ? 1 : 0.5 }}
                disabled={!opportunityId || loading}
                onClick={handleSend}
              >
                {loading ? "Sending…" : "Send team invitation"}
              </button>
            </>
          )}
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
  emptyNote: { fontSize: "0.88rem", color: "#6b7280", lineHeight: 1.5 },
  oppCard: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
    padding: "12px 14px", border: "2px solid", borderRadius: 12, cursor: "pointer",
  },
  oppTitle: { fontWeight: 600, fontSize: "0.9rem", color: "#111827" },
  check: { color: "#1b2a4a", fontWeight: 700, fontSize: "1rem" },
  primaryBtn: {
    width: "100%", padding: "12px", borderRadius: 10, border: "none",
    background: "#1b2a4a", color: "#ffffff", fontWeight: 700, fontSize: "0.95rem",
    cursor: "pointer",
  },
};
