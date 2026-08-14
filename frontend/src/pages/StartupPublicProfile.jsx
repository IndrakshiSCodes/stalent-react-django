import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchStartupPublicProfile } from "../api/profiles";
import { useAuth } from "../context/AuthContext";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

export default function StartupPublicProfile() {
  const { startupId } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwnProfile = auth?.role === "startup" && String(auth.user?.id) === String(startupId);

  useEffect(() => {
    setLoading(true);
    fetchStartupPublicProfile(startupId, auth?.token)
      .then((data) => setProfile(data))
      .catch(() => setError("Couldn't load this profile."))
      .finally(() => setLoading(false));
  }, [startupId, auth?.token]);

  if (loading) return <div style={s.page}><p style={s.muted}>Loading profile…</p></div>;
  if (error || !profile) return <div style={s.page}><p style={s.muted}>{error || "Profile not found."}</p></div>;

  return (
    <div style={s.page}>
      <div style={s.container}>
        <button style={s.backBtn} onClick={() => navigate(-1)}><FiArrowLeft size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />Back</button>

        {/* Header */}
        <div style={s.headerCard}>
          <div style={{ ...s.logo, background: profile.logoColor }}>{profile.initials}</div>
          <div style={{ flex: 1 }}>
            <h1 style={s.name}>{profile.name}</h1>
            <p style={s.tagline}>{profile.tagline}</p>
            <p style={s.subline}>{profile.industry}{profile.location ? ` · ${profile.location}` : ""}</p>
          </div>
          {isOwnProfile && (
            <Link to="/startup/dashboard" style={s.editLink}>Edit in dashboard <FiArrowRight size={13} style={{ verticalAlign: "middle" }} /></Link>
          )}
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statValue}>{profile.stats.projectsPosted}</div>
            <div style={s.statLabel}>Projects posted</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statValue}>{profile.stats.studentsHired}</div>
            <div style={s.statLabel}>Students hired</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statValue}>{profile.employees}</div>
            <div style={s.statLabel}>Team size</div>
          </div>
        </div>

        {/* About / mission */}
        {profile.about && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>About</h2>
            <p style={s.body}>{profile.about}</p>
          </div>
        )}

        {/* Facts */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>Company details</h2>
          <div style={s.factsGrid}>
            <Fact label="Industry" value={profile.industry} />
            <Fact label="Location" value={profile.location} />
            <Fact label="Team size" value={profile.employees} />
            <Fact label="Founded" value={profile.founded} />
            {profile.website && (
              <Fact label="Website" value={<a href={normalizeUrl(profile.website)} target="_blank" rel="noreferrer" style={s.factLink}>{profile.website}</a>} />
            )}
            {profile.linkedinUrl && (
              <Fact label="LinkedIn" value={<a href={normalizeUrl(profile.linkedinUrl)} target="_blank" rel="noreferrer" style={s.factLink}>View profile</a>} />
            )}
          </div>
        </div>

        {/* Open opportunities */}
        {profile.opportunities?.length > 0 && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Open Postings</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {profile.opportunities.map((opp) => (
                <div key={opp.id} style={s.oppCard}>
                  <div style={s.oppTitle}>{opp.title}</div>
                  <div style={s.tagRow}>
                    {opp.tags.map((t) => <span key={t} style={s.skillTag}>{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Fact({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div style={s.factLabel}>{label}</div>
      <div style={s.factValue}>{value}</div>
    </div>
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
  logo: { width: 64, height: 64, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 700, fontSize: "1.2rem", flexShrink: 0 },
  name: { margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#111827" },
  tagline: { margin: "4px 0 0", color: "#374151", fontSize: "0.92rem" },
  subline: { margin: "4px 0 0", color: "#9ca3af", fontSize: "0.85rem" },
  editLink: { fontSize: "0.82rem", color: "#1b2a4a", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" },
  statsRow: { display: "flex", gap: 12, marginTop: 16 },
  statCard: { flex: 1, background: "#ffffff", borderRadius: 12, padding: "14px 12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  statValue: { fontWeight: 800, fontSize: "1.2rem", color: "#111827" },
  statLabel: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 2 },
  card: { background: "#ffffff", borderRadius: 16, padding: 24, marginTop: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  sectionTitle: { margin: 0, fontSize: "1rem", fontWeight: 700, color: "#111827" },
  body: { color: "#374151", fontSize: "0.92rem", lineHeight: 1.6, marginTop: 10 },
  factsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 14 },
  factLabel: { fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 },
  factValue: { fontSize: "0.9rem", color: "#111827", fontWeight: 600, marginTop: 2 },
  factLink: { fontSize: "0.9rem", color: "#1b2a4a", fontWeight: 600, textDecoration: "none" },
  oppCard: { border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 14px" },
  oppTitle: { fontWeight: 700, fontSize: "0.9rem", color: "#111827" },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 },
  skillTag: { padding: "3px 10px", borderRadius: 20, background: "#e9edf3", color: "#101d33", fontSize: "0.75rem", fontWeight: 600 },
  muted: { color: "#9ca3af" },
};
