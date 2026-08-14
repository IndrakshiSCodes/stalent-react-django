import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchStudentPublicProfile, addContribution, deleteContribution } from "../api/profiles";
import { useAuth } from "../context/AuthContext";
import { FiArrowLeft, FiArrowRight, FiMapPin } from "react-icons/fi";

export default function StudentPublicProfile() {
  const { studentId } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwnProfile = auth?.role === "student" && String(auth.user?.id) === String(studentId);

  const load = useCallback(() => {
    setLoading(true);
    fetchStudentPublicProfile(studentId, auth?.token)
      .then((data) => setProfile(data))
      .catch(() => setError("Couldn't load this profile."))
      .finally(() => setLoading(false));
  }, [studentId, auth?.token]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={s.page}><p style={s.muted}>Loading profile…</p></div>;
  if (error || !profile) return <div style={s.page}><p style={s.muted}>{error || "Profile not found."}</p></div>;

  const links = [
    { label: "GitHub", url: profile.githubUrl },
    { label: "Portfolio", url: profile.portfolioUrl },
    { label: "LinkedIn", url: profile.linkedinUrl },
  ].filter((l) => l.url);

  return (
    <div style={s.page}>
      <div style={s.container}>
        <button style={s.backBtn} onClick={() => navigate(-1)}><FiArrowLeft size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />Back</button>

        {/* Header */}
        <div style={s.headerCard}>
          <div style={{ ...s.avatar, background: profile.avatarColor }}>{profile.initials}</div>
          <div style={{ flex: 1 }}>
            <h1 style={s.name}>{profile.firstName} {profile.lastName}</h1>
            <p style={s.subline}>
              {profile.university}{profile.major ? ` · ${profile.major}` : ""}{profile.year ? ` · Year ${profile.year}` : ""}
            </p>
            {profile.location && <p style={s.location}><FiMapPin size={13} style={{ marginRight: 4, verticalAlign: "middle" }} />{profile.location}</p>}
          </div>
        </div>

        {/* Links — GitHub / Portfolio / LinkedIn */}
        <div style={s.linksRow}>
          {links.length === 0 && isOwnProfile && (
            <p style={s.mutedSmall}>Add your GitHub, portfolio, and LinkedIn from your profile settings so startups can find your work.</p>
          )}
          {links.map((l) => (
            <a key={l.label} href={normalizeUrl(l.url)} target="_blank" rel="noreferrer" style={s.linkPill}>
              {l.label}
            </a>
          ))}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>About</h2>
            <p style={s.bio}>{profile.bio}</p>
          </div>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Skills</h2>
            <div style={s.tagRow}>
              {profile.skills.map((sk) => <span key={sk} style={s.skillTag}>{sk}</span>)}
            </div>
          </div>
        )}

        {/* Open to */}
        {profile.openTo?.length > 0 && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Open to</h2>
            <div style={s.tagRow}>
              {profile.openTo.map((o) => <span key={o} style={s.openTag}>{o}</span>)}
            </div>
          </div>
        )}

        {/* Past contributions */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>Past Contributions</h2>
          <p style={s.mutedSmall}>Websites and projects built for other startups, or on their own.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            {profile.contributions.map((c) => (
              <div key={c.id} style={s.contribCard}>
                <div style={{ flex: 1 }}>
                  <div style={s.contribTitle}>{c.title}{c.organization ? ` — ${c.organization}` : ""}</div>
                  {c.description && <p style={s.contribDesc}>{c.description}</p>}
                  <a href={normalizeUrl(c.link)} target="_blank" rel="noreferrer" style={s.contribLink}>View project <FiArrowRight size={13} style={{ verticalAlign: "middle" }} /></a>
                </div>
                {isOwnProfile && (
                  <button
                    style={s.removeBtn}
                    onClick={async () => {
                      await deleteContribution(c.id, auth.token);
                      load();
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {profile.contributions.length === 0 && (
              <p style={s.mutedSmall}>No contributions listed yet.</p>
            )}
          </div>

          {isOwnProfile && <AddContributionForm onAdded={load} />}
        </div>
      </div>
    </div>
  );
}

function AddContributionForm({ onAdded }) {
  const { auth } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [organization, setOrganization] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !link.trim()) {
      setError("Title and link are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await addContribution({ title, link, organization, description }, auth.token);
      setTitle(""); setLink(""); setOrganization(""); setDescription("");
      setOpen(false);
      onAdded();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't add that.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button style={s.addBtn} onClick={() => setOpen(true)}>+ Add a project</button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={s.addForm}>
      <input style={s.input} placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input style={s.input} placeholder="Link (https://...)" value={link} onChange={(e) => setLink(e.target.value)} />
      <input style={s.input} placeholder="Built for (optional)" value={organization} onChange={(e) => setOrganization(e.target.value)} />
      <textarea style={{ ...s.input, minHeight: 60 }} placeholder="Short description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      {error && <p style={{ color: "#dc2626", fontSize: "0.82rem", margin: 0 }}>{error}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" style={s.addBtn} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        <button type="button" style={s.cancelBtn} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}

function normalizeUrl(url) {
  if (!url) return "#";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

const s = {
  page: { minHeight: "100vh", background: "#f9fafb", padding: "32px 20px" },
  container: { maxWidth: 720, margin: "0 auto" },
  backBtn: { border: "none", background: "transparent", color: "#1b2a4a", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem", padding: 0, marginBottom: 16 },
  headerCard: { display: "flex", alignItems: "center", gap: 18, background: "#ffffff", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  avatar: { width: 72, height: 72, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 700, fontSize: "1.3rem", flexShrink: 0 },
  name: { margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#111827" },
  subline: { margin: "4px 0 0", color: "#6b7280", fontSize: "0.9rem" },
  location: { margin: "4px 0 0", color: "#9ca3af", fontSize: "0.85rem" },
  linksRow: { display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" },
  linkPill: { padding: "8px 16px", borderRadius: 20, background: "#ffffff", border: "1.5px solid #e5e7eb", color: "#374151", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" },
  card: { background: "#ffffff", borderRadius: 16, padding: 24, marginTop: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  sectionTitle: { margin: 0, fontSize: "1rem", fontWeight: 700, color: "#111827" },
  bio: { color: "#374151", fontSize: "0.92rem", lineHeight: 1.6, marginTop: 10 },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 },
  skillTag: { padding: "5px 12px", borderRadius: 20, background: "#e9edf3", color: "#101d33", fontSize: "0.8rem", fontWeight: 600 },
  openTag: { padding: "5px 12px", borderRadius: 20, background: "#d1fae5", color: "#065f46", fontSize: "0.8rem", fontWeight: 600 },
  muted: { color: "#9ca3af" },
  mutedSmall: { color: "#9ca3af", fontSize: "0.82rem", margin: "6px 0 0" },
  contribCard: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px" },
  contribTitle: { fontWeight: 700, fontSize: "0.92rem", color: "#111827" },
  contribDesc: { fontSize: "0.85rem", color: "#6b7280", marginTop: 4 },
  contribLink: { fontSize: "0.82rem", color: "#1b2a4a", fontWeight: 600, textDecoration: "none", marginTop: 6, display: "inline-block" },
  removeBtn: { border: "none", background: "transparent", color: "#dc2626", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" },
  addBtn: { marginTop: 14, padding: "9px 16px", borderRadius: 8, border: "none", background: "#1b2a4a", color: "#ffffff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", alignSelf: "flex-start" },
  cancelBtn: { marginTop: 14, padding: "9px 16px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "transparent", color: "#6b7280", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" },
  addForm: { display: "flex", flexDirection: "column", gap: 8, marginTop: 16 },
  input: { padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: "0.85rem", fontFamily: "inherit" },
};
