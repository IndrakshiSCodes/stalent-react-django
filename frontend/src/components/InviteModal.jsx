import { useState, useEffect } from "react";
import { fetchStudentList, sendInvitations } from "../api/startupDashboard";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiUsers } from "react-icons/fi";
import { FaGraduationCap, FaRocket } from "react-icons/fa";
import { IconClose, IconCheck, IconArrowLeft } from "./GlyphIcons";

const MODES = [
  {
    value: "solo",
    label: "Solo",
    icon: FiUser,
    desc: "One student builds the entire website alone.",
  },
  {
    value: "group_student_led",
    label: "Group – Student Led",
    icon: FaGraduationCap,
    desc: "You pick one student. They recruit their own teammates.",
  },
  {
    value: "group_startup_led",
    label: "Group – Startup Led",
    icon: FaRocket,
    desc: "You hand-pick 3–4 students. Project starts when all accept.",
  },
];

export default function InviteModal({ opportunity, onClose, onSuccess }) {
  const { auth } = useAuth();
  const [step, setStep] = useState(1);         // 1 = pick mode, 2 = pick students
  const [mode, setMode] = useState(null);
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]); // array of student ids
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteTarget, setInviteTarget] = useState(null); // opportunity object or null

  useEffect(() => {
    fetchStudentList(auth.token).then((data) => setStudents(data.students || []));
  }, [auth.token]);

  function chooseMode(value) {
    setMode(value);
    setSelected([]); // switching modes changes the max allowed — don't carry over old picks
    setError("");
  }

  function toggleStudent(id) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      // Solo + student-led: max 1;  startup-led: max 4
      const max = mode === "group_startup_led" ? 4 : 1;
      if (prev.length >= max) return prev;
      return [...prev, id];
    });
  }

  async function handleSend() {
    if (!selected.length) { setError("Select at least one student."); return; }
    setLoading(true);
    setError("");
    try {
      await sendInvitations(auth.token, opportunity.id, selected, mode);
      onSuccess?.();
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const maxAllowed = mode === "group_startup_led" ? 4 : 1;

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.headerSub}>Invite students</div>
            <div style={s.headerTitle}>{opportunity?.title}</div>
          </div>
          <button style={s.closeBtn} onClick={onClose}><IconClose size={16} /></button>
        </div>

        {/* Step 1 — Choose mode */}
        {step === 1 && (
          <div style={s.body}>
            <p style={s.label}>How do you want to hire?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {MODES.map((m) => (
                <div
                  key={m.value}
                  onClick={() => chooseMode(m.value)}
                  style={{
                    ...s.modeCard,
                    borderColor: mode === m.value ? "#1b2a4a" : "#e5e7eb",
                    background: mode === m.value ? "#e9edf3" : "#ffffff",
                  }}
                >
                  <span style={s.modeEmoji}><m.icon /></span>
                  <div>
                    <div style={s.modeLabel}>{m.label}</div>
                    <div style={s.modeDesc}>{m.desc}</div>
                  </div>
                  {mode === m.value && <span style={s.check}><IconCheck size={14} /></span>}
                </div>
              ))}
            </div>
            <button
              style={{ ...s.primaryBtn, marginTop: 24, opacity: mode ? 1 : 0.5 }}
              disabled={!mode}
              onClick={() => setStep(2)}
            >
              Next — Pick student{mode === "group_startup_led" ? "s" : ""}
            </button>
          </div>
        )}

        {/* Step 2 — Pick students */}
        {step === 2 && (
          <div style={s.body}>
            <button style={s.backBtn} onClick={() => setStep(1)}><IconArrowLeft size={13} /> Back</button>
            <p style={s.label}>
              {mode === "group_startup_led"
                ? `Select up to 4 students (${selected.length}/4 chosen)`
                : "Select 1 student"}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 360, overflowY: "auto" }}>
              {students.map((st) => {
                const isSelected = selected.includes(st.id);
                const isDisabled = !isSelected && selected.length >= maxAllowed;
                return (
                  <div
                    key={st.id}
                    onClick={() => !isDisabled && toggleStudent(st.id)}
                    style={{
                      ...s.studentCard,
                      borderColor: isSelected ? "#1b2a4a" : "#e5e7eb",
                      background: isSelected ? "#e9edf3" : "#ffffff",
                      opacity: isDisabled ? 0.45 : 1,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                    }}
                  >
                    <div style={{ ...s.avatar, background: st.avatarColor }}>
                      {st.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={s.studentName}>{st.firstName} {st.lastName}</div>
                      <div style={s.studentSub}>{st.university} · {st.major} · Y{st.year}</div>
                      {st.skills.length > 0 && (
                        <div style={s.skillRow}>
                          {st.skills.slice(0, 4).map((sk) => (
                            <span key={sk} style={s.skillTag}>{sk}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {isSelected && <span style={s.check}><IconCheck size={14} /></span>}
                  </div>
                );
              })}
            </div>

            {error && <p style={{ color: "#dc2626", fontSize: "0.85rem", marginTop: 8 }}>{error}</p>}

            <button
              style={{ ...s.primaryBtn, marginTop: 16, opacity: selected.length ? 1 : 0.5 }}
              disabled={!selected.length || loading}
              onClick={handleSend}
            >
              {loading ? "Sending…" : `Send invitation${selected.length > 1 ? "s" : ""}`}
            </button>
          </div>
        )}
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
  modeCard: {
    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
    border: "2px solid", borderRadius: 12, cursor: "pointer", position: "relative",
  },
  modeEmoji: { fontSize: "1.5rem", flexShrink: 0 },
  modeLabel: { fontWeight: 700, fontSize: "0.9rem", color: "#111827" },
  modeDesc: { fontSize: "0.82rem", color: "#6b7280", marginTop: 2 },
  check: {
    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
    color: "#1b2a4a", fontWeight: 700, fontSize: "1rem",
  },
  studentCard: {
    display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
    border: "2px solid", borderRadius: 12, cursor: "pointer", position: "relative",
    transition: "border-color 0.15s",
  },
  avatar: {
    width: 40, height: 40, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#ffffff", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
  },
  studentName: { fontWeight: 600, fontSize: "0.9rem", color: "#111827" },
  studentSub: { fontSize: "0.78rem", color: "#9ca3af", marginTop: 2 },
  skillRow: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 },
  skillTag: {
    padding: "2px 8px", borderRadius: 20,
    background: "#e9edf3", color: "#101d33", fontSize: "0.72rem",
  },
  primaryBtn: {
    width: "100%", padding: "12px", borderRadius: 10, border: "none",
    background: "#1b2a4a", color: "#ffffff", fontWeight: 700, fontSize: "0.95rem",
    cursor: "pointer",
  },
  backBtn: {
    border: "none", background: "transparent", cursor: "pointer",
    color: "#1b2a4a", fontWeight: 600, fontSize: "0.85rem", padding: 0, marginBottom: 12,
  },
};