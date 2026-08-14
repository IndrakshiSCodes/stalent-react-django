import { useState } from "react";
import { IconClose } from "./GlyphIcons";

const TYPE_OPTIONS = ["Part-time", "Full-time", "Internship", "Contract"];

export default function PostProjectModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "Remote",
    type: "Part-time",
    duration: "",
    salary: "",
    tags: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <form style={s.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div style={s.header}>
          <div style={s.headerTitle}>Post a new project</div>
          <button type="button" style={s.closeBtn} onClick={onClose}><IconClose size={16} /></button>
        </div>

        <div style={s.body}>
          <label style={s.label}>Title *</label>
          <input style={s.input} value={form.title} onChange={update("title")} placeholder="e.g. Build our marketing website" autoFocus />

          <label style={s.label}>Description</label>
          <textarea style={{ ...s.input, minHeight: 90, resize: "vertical" }} value={form.description} onChange={update("description")} placeholder="What will the student(s) actually be doing?" />

          <div style={s.row}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Location</label>
              <input style={s.input} value={form.location} onChange={update("location")} placeholder="Remote" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Type</label>
              <select style={s.input} value={form.type} onChange={update("type")}>
                {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={s.row}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Duration</label>
              <input style={s.input} value={form.duration} onChange={update("duration")} placeholder="e.g. 3 months" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Compensation</label>
              <input style={s.input} value={form.salary} onChange={update("salary")} placeholder="e.g. $800/mo" />
            </div>
          </div>

          <label style={s.label}>Tags (comma separated)</label>
          <input style={s.input} value={form.tags} onChange={update("tags")} placeholder="React, TypeScript, Tailwind" />

          {error && <p style={{ color: "#dc2626", fontSize: "0.85rem", marginTop: 6 }}>{error}</p>}

          <button type="submit" style={{ ...s.primaryBtn, opacity: submitting ? 0.6 : 1 }} disabled={submitting}>
            {submitting ? "Posting…" : "Post project"}
          </button>
        </div>
      </form>
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
    width: 520, maxWidth: "95vw",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    display: "flex", flexDirection: "column", maxHeight: "90vh",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "22px 24px 16px", borderBottom: "1px solid #f3f4f6",
  },
  headerTitle: { fontWeight: 700, fontSize: "1.1rem", color: "#111827" },
  closeBtn: { border: "none", background: "transparent", cursor: "pointer", color: "#6b7280" },
  body: { padding: "18px 24px 26px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 },
  row: { display: "flex", gap: 14 },
  label: { fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginTop: 12, marginBottom: 6 },
  input: {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: "1px solid #e5e7eb", fontSize: "0.9rem", color: "#111827",
    fontFamily: "inherit", boxSizing: "border-box",
  },
  primaryBtn: {
    marginTop: 20, width: "100%", padding: "12px", borderRadius: 10, border: "none",
    background: "#1b2a4a", color: "#ffffff", fontWeight: 700, fontSize: "0.95rem",
    cursor: "pointer",
  },
};
