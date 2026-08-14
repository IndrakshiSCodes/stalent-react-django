import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStudentDashboard } from "../hooks/useStudentDashboard";
import { useAuth } from "../context/AuthContext";
import { getStudentChatHistory, sendStudentChatMessage, fetchConversations, fetchStartupList, applyToCompany, fetchPeerStudents, sendTeamUpRequest, respondTeamUpRequest, toggleStartupBookmark } from "../api/studentDashboard";
import NotificationCenter from "../components/NotificationCenter";
import StalentLogo from "../components/StalentLogo";
import "./StudentDashboard.css";

/* ─── tiny icon helpers ──────────────────────────────────────────────── */
const Icon = ({ name, size = 20 }) => {
  const s = { width: size, height: size, display: "inline-block", verticalAlign: "middle" };
  const icons = {
    dashboard: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    search: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    briefcase: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
    bookmark: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
    users: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    message: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    settings: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    bell: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    chart: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    calendar: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    heart: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    mappin: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    clock: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    star: (
      <svg style={s} viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    eye: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    logout: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    filter: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    arrowRight: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    alert: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    wave: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </svg>
    ),
    zap: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    close: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    globe: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  };
  return icons[name] || null;
};

/* ─── Stalent Logo — imported from shared components/StalentLogo.jsx ─── */

/* ─── activity icons map ─────────────────────────────────────────────── */
const activityIconMap = {
  briefcase: { icon: "briefcase", cls: "green" },
  check: { icon: "check", cls: "green" },
  alert: { icon: "alert", cls: "orange" },
  users: { icon: "users", cls: "purple" },
  chart: { icon: "chart", cls: "blue" },
  message: { icon: "message", cls: "purple" },
  bell: { icon: "bell", cls: "blue" },
};

export default function StudentDashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    data,
    loading,
    error,
    activeFilter,
    setActiveFilter,
    featuredMatches,
    allOpportunities,
    handleBookmark,
    handleApply,
    reload,
  } = useStudentDashboard();

  const [activeTab, setActiveTab] = useState(location.state?.tab || "dashboard");

  // Keep activeTab in sync with navigation state — e.g. clicking "Companies"
  // or "Saved" from the My Profile sidebar passes state: { tab: ... } via a
  // <Link>, but if StudentDashboard is already mounted the useState above
  // only ran once and won't pick that up on its own.
  useEffect(() => {
    if (location.state?.tab && location.state.tab !== activeTab) {
      setActiveTab(location.state.tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);
  const [msgCompanies, setMsgCompanies] = useState([]);
  const [msgStudents, setMsgStudents] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  // ── NEW: notification panel state ──
  const [showNotifications, setShowNotifications] = useState(false);
  const [detailsOpp, setDetailsOpp] = useState(null);

  // ── NEW: browse-all-companies state ──
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  // ── NEW: "Students Like You" peer team-up state ──
  const [peers, setPeers] = useState([]);
  const [peersLoading, setPeersLoading] = useState(false);

  const loadPeers = useCallback(() => {
    setPeersLoading(true);
    fetchPeerStudents(auth.token)
      .then(({ students }) => setPeers(students || []))
      .catch((err) => console.error("Failed to load peer students", err))
      .finally(() => setPeersLoading(false));
  }, [auth.token]);

  // Load once the Dashboard tab (preview) or the dedicated Students Like You tab is active
  useEffect(() => {
    if (activeTab !== "dashboard" && activeTab !== "students") return;
    loadPeers();
  }, [activeTab, loadPeers]);

  const handleTeamUp = async (studentId) => {
    try {
      await sendTeamUpRequest(studentId, auth.token);
      loadPeers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTeamUpRespond = async (teamUpId, response) => {
    try {
      await respondTeamUpRequest(teamUpId, response, auth.token);
      loadPeers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessagePeer = (firstName, lastName) => {
    setActivePartner(`${firstName} ${lastName}`);
    setActiveTab("messages");
  };

  const renderPeerCard = (p) => (
    <div className="sd-opp-card" key={p.id}>
      <div className="sd-opp-card-top">
        <div className="sd-company-logo" style={{ background: p.avatarColor }}>{p.initials}</div>
      </div>
      <Link to={`/profile/student/${p.id}`} className="sd-company-link" style={{ display: "block" }}>
        <h3 className="sd-card-title">{p.firstName} {p.lastName}</h3>
      </Link>
      <p className="sd-card-sub">{p.university} · {p.major}, Year {p.year}</p>
      {p.skills.length > 0 && (
        <p className="sd-card-desc">{p.skills.slice(0, 3).join(", ")}</p>
      )}
      <div className="sd-card-footer">
        <div className="sd-card-actions" style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Link to={`/profile/student/${p.id}`} className="sd-btn-secondary">View Profile</Link>
          {p.teamUpStatus === "none" && (
            <button className="sd-btn-primary" onClick={() => handleTeamUp(p.id)}>Team Up</button>
          )}
          {p.teamUpStatus === "pending_sent" && (
            <button className="sd-btn-primary" disabled style={{ opacity: 0.6, cursor: "default" }}>Request sent</button>
          )}
          {p.teamUpStatus === "pending_received" && (
            <button className="sd-btn-primary" onClick={() => handleTeamUpRespond(p.teamUpId, "accepted")}>Accept Team Up</button>
          )}
          {p.teamUpStatus === "accepted" && (
            <button className="sd-btn-primary" disabled style={{ opacity: 0.6, cursor: "default" }}>
              <Icon name="check" size={13} /> Teamed up
            </button>
          )}
          <button className="sd-btn-secondary" onClick={() => handleMessagePeer(p.firstName, p.lastName)}>Message</button>
        </div>
      </div>
    </div>
  );

  // Load the full messaging contact list (every company + every other
  // student) once the Messages tab is opened.
  useEffect(() => {
    if (activeTab !== "messages") return;
    fetchConversations(auth.token).then(({ companies: comps, students: studs }) => {
      setMsgCompanies(comps || []);
      setMsgStudents(studs || []);
      setActivePartner((prev) => prev || comps?.[0]?.name || studs?.[0]?.name || null);
    });
  }, [activeTab, auth.token]);

  // Load every registered company once the Companies tab is opened — this
  // includes startups that haven't posted an opportunity yet, so a brand
  // new company signup is visible to students right away.
  useEffect(() => {
    if (activeTab !== "companies" && activeTab !== "dashboard") return;
    setCompaniesLoading(true);
    fetchStartupList(auth.token)
      .then(({ startups }) => setCompanies(startups || []))
      .catch((err) => console.error("Failed to load companies", err))
      .finally(() => setCompaniesLoading(false));
  }, [activeTab, auth.token]);

  // Poll messages every 3 seconds when Messages tab is active and a partner is selected
  const loadMessages = useCallback(async () => {
    if (!activePartner) return;
    try {
      const msgs = await getStudentChatHistory(activePartner);
      setChatMessages(msgs);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  }, [activePartner]);

  useEffect(() => {
    if (activeTab !== "messages") return;
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [activeTab, loadMessages]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  function handleLogout() {
    logout();
    navigate("/login/student");
  }

  async function handleApplyToCompany(startupId) {
    try {
      await applyToCompany(startupId);
      setCompanies((prev) =>
        prev.map((c) => (c.id === startupId ? { ...c, hasApplied: true } : c))
      );
      reload(); // pulls the new "Direct application" card into Opportunities
    } catch (err) {
      console.error("Failed to apply to company", err);
    }
  }

  async function handleBookmarkCompany(startupId) {
    try {
      const { bookmarked } = await toggleStartupBookmark(startupId, auth.token);
      setCompanies((prev) =>
        prev.map((c) => (c.id === startupId ? { ...c, bookmarked } : c))
      );
      reload(); // refresh savedCompanies for the Saved tab
    } catch (err) {
      console.error("Failed to bookmark company", err);
    }
  }

  async function handleSendChat(e) {
    e.preventDefault();
    if (!chatInput.trim() || !activePartner) return;
    const text = chatInput;
    setChatInput("");
    try {
      await sendStudentChatMessage(activePartner, text);
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          senderName: `${data?.profile?.firstName || ""} ${data?.profile?.lastName || ""}`,
          avatarColor: data?.profile?.avatarColor || "var(--sd-primary)",
          timeAgo: "Just now",
          text,
          isUnread: false,
        },
      ]);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  }

  if (loading) {
    return (
      <div className="sd-loading-screen">
        <div className="sd-spinner" />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sd-error-screen">
        <p><Icon name="alert" size={16} /> {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const {
    profile,
    welcome,
    quickStats,
    recentActivity,
    profileTip,
    filters,
  } = data;

  return (
    <div className="sd-wrapper">
      {/* ── LEFT SIDEBAR ── */}
      <aside className="sd-sidebar">
        <a href="/" className="sd-sidebar-logo">
          <StalentLogo />
          <span className="sd-logo-text logo-text">Stalent</span>
        </a>

        <nav className="sd-nav">
          <button
            className={`sd-nav-item${activeTab === "dashboard" ? " active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
            id="nav-dashboard"
          >
            <Icon name="dashboard" size={20} />
            <span>Dashboard</span>
          </button>
          <button
            className={`sd-nav-item${activeTab === "students" ? " active" : ""}`}
            onClick={() => setActiveTab("students")}
            id="nav-students"
          >
            <Icon name="users" size={20} />
            <span>Students Like You</span>
          </button>
          <button
            className={`sd-nav-item${activeTab === "saved" ? " active" : ""}`}
            onClick={() => setActiveTab("saved")}
            id="nav-saved"
          >
            <Icon name="bookmark" size={20} />
            <span>Saved</span>
          </button>
          <button
            className={`sd-nav-item${activeTab === "companies" ? " active" : ""}`}
            onClick={() => setActiveTab("companies")}
            id="nav-companies"
          >
            <Icon name="users" size={20} />
            <span>Companies</span>
          </button>
          <Link to="/student/profile" className="sd-nav-item" id="nav-profile">
            <Icon name="users" size={20} />
            <span>My Profile</span>
          </Link>
          <button
            className={`sd-nav-item${activeTab === "messages" ? " active" : ""}`}
            onClick={() => setActiveTab("messages")}
            id="nav-messages"
          >
            <Icon name="message" size={20} />
            <span>Messages</span>
            {profile.unreadMessages > 0 && (
              <span className="sd-nav-badge">{profile.unreadMessages}</span>
            )}
          </button>
        </nav>

        <div className="sd-sidebar-footer">
          <button className="sd-nav-item sd-logout-btn" onClick={handleLogout} id="btn-logout">
            <Icon name="logout" size={20} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="sd-main">
        {/* Header */}
        <header className="sd-header">
          <div className="sd-header-actions">
            {/* ── BELL BUTTON — now opens NotificationCenter ── */}
            <button
              className="sd-icon-btn"
              id="btn-notifications"
              aria-label="Notifications"
              onClick={() => setShowNotifications(true)}
              style={{ position: "relative" }}
            >
              <Icon name="bell" size={22} />
              {profile.unreadNotifications > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#ef4444",
                    display: "block",
                  }}
                />
              )}
            </button>

            <button
              className="sd-icon-btn"
              id="btn-messages-header"
              aria-label="Messages"
              onClick={() => setActiveTab("messages")}
            >
              <Icon name="message" size={22} />
              {profile.unreadMessages > 0 && <span className="sd-dot-badge" />}
            </button>
            <Link to="/student/profile" className="sd-user-chip" id="user-profile-chip">
              <div className="sd-avatar" style={{ background: profile.avatarColor }}>
                {profile.initials}
              </div>
              <div className="sd-user-info">
                <span className="sd-user-name">{`${profile.firstName} ${profile.lastName}`}</span>
                <span className="sd-user-title">{`${profile.major}, Year ${profile.year}`}</span>
              </div>
            </Link>
          </div>
        </header>

        {/* ── NOTIFICATION CENTER PANEL ── */}
        {showNotifications && (
          <NotificationCenter onClose={() => setShowNotifications(false)} />
        )}

        {/* ── OPPORTUNITY DETAILS MODAL ── */}
        {detailsOpp && (
          <div className="sd-modal-overlay" onClick={() => setDetailsOpp(null)}>
            <div className="sd-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
              <div className="sd-modal-header">
                <h3>{detailsOpp.title}</h3>
                <button className="sd-modal-close" onClick={() => setDetailsOpp(null)} aria-label="Close">
                  <Icon name="close" size={18} />
                </button>
              </div>
              <p className="sd-card-sub">
                <Link to={`/profile/startup/${detailsOpp.startupId}`} className="sd-company-link">{detailsOpp.company}</Link> · {detailsOpp.industry}
              </p>
              <p className="sd-card-desc" style={{ marginTop: 12 }}>{detailsOpp.description}</p>
              <div className="sd-card-tags" style={{ marginTop: 12 }}>
                {detailsOpp.tags.map((t) => <span className="sd-tag" key={t}>{t}</span>)}
              </div>
              <div className="sd-opp-details" style={{ marginTop: 16 }}>
                <span className="sd-opp-meta"><Icon name="mappin" size={13} /> {detailsOpp.location}</span>
                <span className="sd-opp-meta"><Icon name="clock" size={13} /> {detailsOpp.type} · {detailsOpp.duration}</span>
                <span className="sd-opp-meta"><Icon name="briefcase" size={13} /> {detailsOpp.applicantCount} applicant{detailsOpp.applicantCount === 1 ? "" : "s"}</span>
                <span className="sd-opp-salary">{detailsOpp.salary}</span>
              </div>
              <div className="sd-card-actions" style={{ marginTop: 20 }}>
                <button className="sd-btn-secondary" onClick={() => setDetailsOpp(null)}>Close</button>
                <button
                  className="sd-btn-primary"
                  disabled={detailsOpp.applied}
                  onClick={() => { handleApply(detailsOpp.id); setDetailsOpp(null); }}
                >
                  {detailsOpp.applied ? (<><Icon name="check" size={13} /> Applied</>) : (<>Apply now <Icon name="arrowRight" size={13} /></>)}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard content grid */}
        <div className="sd-content">
          {/* ── MESSAGES TAB ── */}
          {activeTab === "messages" && (
            <div style={{ display: "flex", height: "calc(100vh - 72px)", overflow: "hidden", width: "100%" }}>
              {/* Conversation list — every company AND every other student */}
              <div style={{ width: 260, borderRight: "1px solid var(--sd-border)", overflowY: "auto", flexShrink: 0 }}>
                <h2 style={{ padding: "20px 20px 12px", fontSize: "1rem", fontWeight: 700, color: "var(--sd-dark)" }}>
                  Messages
                </h2>

                <p style={{ padding: "8px 20px 4px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--sd-subtle)", textTransform: "uppercase" }}>Companies</p>
                {msgCompanies.length === 0 && (
                  <p style={{ padding: "0 20px", color: "var(--sd-subtle)", fontSize: "0.85rem" }}>No companies yet.</p>
                )}
                {msgCompanies.map((c) => (
                  <button
                    key={`company-${c.id}`}
                    onClick={() => setActivePartner(c.name)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%",
                      padding: "12px 20px", border: "none", cursor: "pointer", textAlign: "left",
                      background: activePartner === c.name ? "var(--sd-primary-bg)" : "transparent",
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: c.logoColor, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sd-white)", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>
                      {c.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--sd-dark)", margin: 0 }}>{c.name}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--sd-muted)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    {c.unread > 0 && <span className="sd-nav-badge">{c.unread}</span>}
                  </button>
                ))}

                <p style={{ padding: "16px 20px 4px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--sd-subtle)", textTransform: "uppercase" }}>Students</p>
                {msgStudents.length === 0 && (
                  <p style={{ padding: "0 20px", color: "var(--sd-subtle)", fontSize: "0.85rem" }}>No other students yet.</p>
                )}
                {msgStudents.map((c) => (
                  <button
                    key={`student-${c.id}`}
                    onClick={() => setActivePartner(c.name)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%",
                      padding: "12px 20px", border: "none", cursor: "pointer", textAlign: "left",
                      background: activePartner === c.name ? "var(--sd-primary-bg)" : "transparent",
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: c.logoColor, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sd-white)", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>
                      {c.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--sd-dark)", margin: 0 }}>{c.name}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--sd-muted)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    {c.unread > 0 && <span className="sd-nav-badge">{c.unread}</span>}
                  </button>
                ))}
              </div>

              {/* Active thread */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px" }}>
                <h2 style={{ marginBottom: "16px", fontSize: "1.1rem", fontWeight: 700, color: "var(--sd-dark)" }}>
                  {activePartner || "Select a conversation"}
                </h2>
                <div style={{
                  flex: 1, overflowY: "auto", background: "var(--sd-bg)", borderRadius: "12px",
                  padding: "16px", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px"
                }}>
                  {activePartner && chatMessages.length === 0 && (
                    <p style={{ color: "var(--sd-subtle)", textAlign: "center", marginTop: "40px" }}>
                      No messages yet. Say hello to {activePartner}!
                    </p>
                  )}
                  {chatMessages.map((msg) => {
                    const isMe = msg.senderName !== activePartner;
                    return (
                      <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", gap: "10px", alignItems: "flex-end" }}>
                        {!isMe && (
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: msg.avatarColor || "var(--sd-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sd-white)", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>
                            {(activePartner || "").slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div style={{
                          maxWidth: "60%", padding: "10px 14px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          background: isMe ? "var(--sd-primary)" : "var(--sd-white)", color: isMe ? "var(--sd-white)" : "var(--sd-text)",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.06)", fontSize: "0.9rem", lineHeight: 1.5
                        }}>
                          {msg.text}
                          <div style={{ fontSize: "0.7rem", opacity: 0.7, marginTop: "4px", textAlign: isMe ? "right" : "left" }}>{msg.timeAgo}</div>
                        </div>
                        {isMe && (
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: profile.avatarColor || "var(--sd-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sd-white)", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>
                            {profile.initials}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendChat} style={{ display: "flex", gap: "12px" }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={activePartner ? `Type a message to ${activePartner}…` : "Select a conversation first"}
                    disabled={!activePartner}
                    style={{
                      flex: 1, padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--sd-border)",
                      fontSize: "0.9rem", outline: "none", background: "var(--sd-white)"
                    }}
                  />
                  <button type="submit" disabled={!activePartner} style={{
                    padding: "12px 24px", background: "var(--sd-primary)", color: "var(--sd-white)", border: "none",
                    borderRadius: "10px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem"
                  }}>
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── DASHBOARD TAB ── */}
          {activeTab === "dashboard" && (
            <>
              {/* ── MAIN COLUMN ── */}
              <main className="sd-main-col">
                {/* Welcome Banner */}
                <div className="sd-welcome-banner" id="welcome-banner">
                  <div className="sd-welcome-text">
                    <p className="sd-greeting">Hello! <Icon name="wave" size={18} /></p>
                    <h1>Welcome back, {profile.firstName}!</h1>
                    <p className="sd-welcome-sub">
                      You have <strong>{welcome.newMatches} new matches</strong> and{" "}
                      <strong>{welcome.newMessages} message</strong> waiting.
                    </p>
                  </div>
                  <div className="sd-banner-stats">
                    <div className="sd-banner-stat">
                      <span className="sd-bstat-val">{welcome.profileComplete}%</span>
                      <span className="sd-bstat-lbl">Profile complete</span>
                    </div>
                    <div className="sd-banner-stat">
                      <span className="sd-bstat-val">{welcome.applications}</span>
                      <span className="sd-bstat-lbl">Applications</span>
                    </div>
                    <div className="sd-banner-stat">
                      <span className="sd-bstat-val">{welcome.matches}</span>
                      <span className="sd-bstat-lbl">Matches</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="sd-metrics-row" id="metrics-row">
                  {quickStats.map((stat) => (
                    <div className="sd-metric-card" key={stat.id} id={`stat-${stat.id}`}>
                      <div className="sd-metric-icon" style={{ background: `${stat.accent}18`, color: stat.accent }}>
                        <Icon name={stat.icon} size={22} />
                      </div>
                      <div className="sd-metric-data">
                        <span className="sd-metric-label">{stat.label}</span>
                        <span className="sd-metric-value">{stat.value}</span>
                        <span className="sd-metric-trend">{stat.subtext}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Opportunities section */}
                <section id="opportunities-section">
                  <div className="sd-section-header">
                    <div>
                      <h2 className="sd-section-title">Companies on Stalent</h2>
                      <p className="sd-section-sub">
                        {companies.length} startup{companies.length === 1 ? "" : "s"} you can apply to directly
                      </p>
                    </div>
                    <button className="sd-filter-btn" onClick={() => setActiveTab("companies")} id="btn-see-all-companies">
                      View all <Icon name="arrowRight" size={14} />
                    </button>
                  </div>

                  {companiesLoading ? (
                    <div className="sd-empty-state"><p>Loading companies…</p></div>
                  ) : companies.length === 0 ? (
                    <div className="sd-empty-state"><p>No companies have joined yet.</p></div>
                  ) : (
                    <div className="sd-opp-grid" id="dashboard-companies-grid">
                      {companies.slice(0, 3).map((c) => (
                        <div className="sd-opp-card" key={c.id}>
                          <div className="sd-opp-card-top">
                            <div className="sd-company-logo" style={{ background: c.logoColor }}>{c.initials}</div>
                            <button
                              className="sd-bookmark-btn"
                              onClick={() => handleBookmarkCompany(c.id)}
                              title={c.bookmarked ? "Remove from Saved" : "Save company"}
                              id={`btn-bookmark-company-${c.id}`}
                              style={{ border: "none", background: "none", cursor: "pointer", color: c.bookmarked ? "#f59e0b" : "#9ca3af" }}
                            >
                              <Icon name="bookmark" size={18} />
                            </button>
                          </div>
                          <h3 className="sd-card-title">{c.name}</h3>
                          <p className="sd-card-sub">{c.industry} · {c.location}</p>
                          <p className="sd-card-desc">{c.tagline}</p>
                          <div className="sd-card-footer">
                            <div className="sd-opp-details">
                              <span className="sd-opp-meta"><Icon name="briefcase" size={13} /> {c.employees}</span>
                              <span className="sd-opp-meta">
                                {c.openRolesCount > 0
                                  ? `${c.openRolesCount} open role${c.openRolesCount === 1 ? "" : "s"}`
                                  : "No open roles yet"}
                              </span>
                            </div>
                            <div className="sd-card-actions">
                              <Link to={`/profile/startup/${c.id}`} className="sd-btn-secondary">View profile</Link>
                              <button
                                className="sd-btn-primary"
                                disabled={c.hasApplied}
                                onClick={() => handleApplyToCompany(c.id)}
                              >
                                {c.hasApplied ? (<><Icon name="check" size={13} /> Applied</>) : (<>Apply <Icon name="arrowRight" size={13} /></>)}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Students Like You — peer browsing + team up (preview) */}
                  <div className="sd-section-header" style={{ marginTop: 40 }}>
                    <div>
                      <h2 className="sd-section-title">Students Like You</h2>
                      <p className="sd-section-sub">Team up with other students or message them directly</p>
                    </div>
                    <button className="sd-btn-secondary" onClick={() => setActiveTab("students")}>See all</button>
                  </div>

                  {peersLoading ? (
                    <div className="sd-empty-state"><p>Loading students…</p></div>
                  ) : peers.length === 0 ? (
                    <div className="sd-empty-state"><p>No other students have joined yet.</p></div>
                  ) : (
                    <div className="sd-opp-grid" id="students-like-you-grid">
                      {peers.slice(0, 3).map(renderPeerCard)}
                    </div>
                  )}
                </section>
              </main>

              {/* ── SIDE COLUMN ── */}
              <aside className="sd-side-col">
                {/* Profile Strength */}
                <div className="sd-card sd-profile-card" id="profile-strength-card">
                  <div className="sd-profile-avatar" style={{ background: `${profile.avatarColor}22`, color: profile.avatarColor }}>
                    {profile.initials}
                  </div>
                  <p className="sd-profile-name">{`${profile.firstName} ${profile.lastName}`}</p>
                  <p className="sd-profile-sub">
                    {profile.university} · {profile.major}, Year {profile.year}
                  </p>
                  <div className="sd-progress-header">
                    <span>Profile strength</span>
                    <span className="sd-progress-pct">{profile.profileComplete}%</span>
                  </div>
                  <div className="sd-progress-bar">
                    <div className="sd-progress-fill" style={{ width: `${profile.profileComplete}%` }} />
                  </div>
                  {profileTip && (
                    <p className="sd-strength-tip">
                      {profileTip} <Link to="/student/profile">Update your profile →</Link>
                    </p>
                  )}
                  <button
                    className="sd-btn-block"
                    id="btn-complete-profile"
                    onClick={() => navigate("/student/profile")}
                  >
                    Complete Profile
                  </button>
                </div>

                {/* Recent Activity */}
                <div className="sd-card" id="recent-activity-card">
                  <h3 className="sd-card-heading">Recent Activity</h3>
                  <div className="sd-timeline">
                    {recentActivity.map((item) => {
                      const meta = activityIconMap[item.icon] || { icon: "bell", cls: "blue" };
                      return (
                        <div className="sd-timeline-item" key={item.id}>
                          <div className={`sd-t-icon ${meta.cls}`}>
                            <Icon name={meta.icon} size={16} />
                          </div>
                          <div className="sd-t-content">
                            <p className="sd-t-text">{item.text}</p>
                            <p className="sd-t-time">{item.timeAgo}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Team Up Students — quick glance at peers, real data only */}
                <div className="sd-card" id="teamup-students-card">
                  <div className="sd-card-heading-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 className="sd-card-heading" style={{ margin: 0 }}>Team Up Students</h3>
                    <button className="sd-text-link-btn" style={{ border: "none", background: "none", cursor: "pointer", fontSize: "0.8rem", color: "var(--sd-accent, #5b5bf7)" }} onClick={() => setActiveTab("students")}>
                      See all
                    </button>
                  </div>
                  {peersLoading ? (
                    <p className="sd-t-time" style={{ padding: "8px 0" }}>Loading students…</p>
                  ) : peers.length === 0 ? (
                    <p className="sd-t-time" style={{ padding: "8px 0" }}>No other students have joined yet.</p>
                  ) : (
                    <div className="sd-timeline" id="teamup-students-list">
                      {peers.slice(0, 3).map((p) => (
                        <div className="sd-timeline-item" key={p.id}>
                          <div className="sd-profile-avatar" style={{ width: 32, height: 32, fontSize: "0.75rem", background: `${p.avatarColor}22`, color: p.avatarColor }}>
                            {p.initials}
                          </div>
                          <div className="sd-t-content">
                            <p className="sd-t-text">{p.firstName} {p.lastName}</p>
                            <p className="sd-t-time">{p.university} · Year {p.year}</p>
                          </div>
                          {p.teamUpStatus === "none" && (
                            <button className="sd-btn-secondary" style={{ padding: "4px 10px", fontSize: "0.75rem" }} onClick={() => handleTeamUp(p.id)}>
                              Team Up
                            </button>
                          )}
                          {p.teamUpStatus === "pending_sent" && (
                            <span className="sd-t-time" style={{ whiteSpace: "nowrap" }}>Request sent</span>
                          )}
                          {p.teamUpStatus === "pending_received" && (
                            <button className="sd-btn-secondary" style={{ padding: "4px 10px", fontSize: "0.75rem" }} onClick={() => handleTeamUpRespond(p.teamUpId, "accepted")}>
                              Accept
                            </button>
                          )}
                          {p.teamUpStatus === "accepted" && (
                            <span className="sd-t-time" style={{ whiteSpace: "nowrap" }}><Icon name="check" size={12} /> Teamed up</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </aside>
            </>
          )}

          {/* ── OPPORTUNITIES TAB — full browse, same filters as dashboard ── */}
          {/* ── COMPANIES TAB — browse every company AND every open posting, apply from here ── */}
          {activeTab === "companies" && (
            <main className="sd-main-col" style={{ width: "100%" }}>
              <section id="companies-tab-section">
                <div className="sd-section-header">
                  <div>
                    <h2 className="sd-section-title">All Companies</h2>
                    <p className="sd-section-sub">
                      Every startup on Stalent — including ones still setting up their first project
                    </p>
                  </div>
                </div>

                {companiesLoading ? (
                  <div className="sd-empty-state"><p>Loading companies…</p></div>
                ) : companies.length === 0 ? (
                  <div className="sd-empty-state">
                    <p>No other companies have joined yet.</p>
                  </div>
                ) : (
                  <div className="sd-opp-grid">
                    {companies.map((c) => (
                      <div className="sd-opp-card" key={c.id} id={`company-card-${c.id}`}>
                        <div className="sd-opp-card-top">
                          <div className="sd-company-logo" style={{ background: c.logoColor }}>{c.initials}</div>
                          <button
                            className="sd-bookmark-btn"
                            onClick={() => handleBookmarkCompany(c.id)}
                            title={c.bookmarked ? "Remove from Saved" : "Save company"}
                            id={`btn-bookmark-company-${c.id}`}
                            style={{ border: "none", background: "none", cursor: "pointer", color: c.bookmarked ? "#f59e0b" : "#9ca3af" }}
                          >
                            <Icon name="bookmark" size={18} />
                          </button>
                        </div>
                        <h3 className="sd-card-title">{c.name}</h3>
                        <p className="sd-card-sub">{c.industry} · {c.location}</p>
                        <p className="sd-card-desc">{c.tagline}</p>
                        <div className="sd-card-footer">
                          <div className="sd-opp-details">
                            <span className="sd-opp-meta"><Icon name="briefcase" size={13} /> {c.employees}</span>
                            <span className="sd-opp-meta">
                              {c.openRolesCount > 0
                                ? `${c.openRolesCount} open role${c.openRolesCount === 1 ? "" : "s"}`
                                : "No open roles yet"}
                            </span>
                          </div>
                          <div className="sd-card-actions">
                            <Link to={`/profile/startup/${c.id}`} className="sd-btn-secondary" id={`btn-view-company-${c.id}`}>
                              View profile
                            </Link>
                            <button
                              className="sd-btn-primary"
                              id={`btn-apply-company-${c.id}`}
                              disabled={c.hasApplied}
                              onClick={() => handleApplyToCompany(c.id)}
                            >
                              {c.hasApplied ? (<><Icon name="check" size={13} /> Applied</>) : (<>Apply <Icon name="arrowRight" size={13} /></>)}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Every open posting across all companies — merged in from the old
                     standalone Opportunities page, so you can browse + apply to a
                     specific role right here too ── */}
                <div className="sd-section-header" style={{ marginTop: 40 }}>
                  <div>
                    <h2 className="sd-section-title">Open Postings</h2>
                    <p className="sd-section-sub">
                      {allOpportunities.length + featuredMatches.length} projects match your profile
                    </p>
                  </div>
                </div>

                <div className="sd-filter-pills" id="filter-pills-opps">
                  {filters.map((f) => (
                    <button
                      key={f}
                      className={`sd-pill${activeFilter === f ? " active" : ""}`}
                      onClick={() => setActiveFilter(f)}
                      id={`filter-opps-${f.toLowerCase().replace(/\s|\//g, "-")}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {featuredMatches.length > 0 && (
                  <>
                    <p className="sd-featured-label">FEATURED MATCHES</p>
                    <div className="sd-opp-grid">
                      {featuredMatches.map((opp) => (
                        <OpportunityCard key={opp.id} opp={opp} onBookmark={handleBookmark} onApply={handleApply} onDetails={setDetailsOpp} />
                      ))}
                    </div>
                  </>
                )}

                {allOpportunities.length > 0 && (
                  <>
                    <p className="sd-featured-label" style={{ marginTop: 32 }}>ALL OPEN POSTINGS</p>
                    <div className="sd-opp-list">
                      {allOpportunities.map((opp) => (
                        <OpportunityRow key={opp.id} opp={opp} onBookmark={handleBookmark} onApply={handleApply} />
                      ))}
                    </div>
                  </>
                )}

                {featuredMatches.length === 0 && allOpportunities.length === 0 && (
                  <div className="sd-empty-state">
                    <p>No open postings match your current filter. Try selecting "All".</p>
                  </div>
                )}
              </section>
            </main>
          )}

          {/* ── STUDENTS LIKE YOU TAB — dedicated page, every registered student, team up + message ── */}
          {activeTab === "students" && (
            <main className="sd-main-col" style={{ width: "100%" }}>
              <section id="students-tab-section">
                <div className="sd-section-header">
                  <div>
                    <h2 className="sd-section-title">Students Like You</h2>
                    <p className="sd-section-sub">
                      Every student on Stalent — team up with them or message them directly
                    </p>
                  </div>
                </div>

                {peersLoading ? (
                  <div className="sd-empty-state"><p>Loading students…</p></div>
                ) : peers.length === 0 ? (
                  <div className="sd-empty-state"><p>No other students have joined yet.</p></div>
                ) : (
                  <div className="sd-opp-grid" id="students-like-you-full-grid">
                    {peers.map(renderPeerCard)}
                  </div>
                )}
              </section>
            </main>
          )}

          {activeTab === "saved" && (
            <main className="sd-main-col" style={{ width: "100%" }}>
              <section id="saved-tab-section">
                <div className="sd-section-header">
                  <div>
                    <h2 className="sd-section-title">Saved Companies</h2>
                    <p className="sd-section-sub">Companies you've bookmarked to come back to</p>
                  </div>
                </div>

                {(() => {
                  const savedCompanies = data.savedCompanies || [];
                  if (savedCompanies.length === 0) {
                    return (
                      <div className="sd-empty-state">
                        <p>No companies saved yet — tap the bookmark icon on a company in Companies to save it here.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="sd-opp-grid" id="saved-companies-grid" style={{ marginBottom: 40 }}>
                      {savedCompanies.map((c) => (
                        <div className="sd-opp-card" key={c.id} id={`saved-company-card-${c.id}`}>
                          <div className="sd-opp-card-top">
                            <div className="sd-company-logo" style={{ background: c.logoColor }}>{c.initials}</div>
                            <button
                              className="sd-bookmark-btn"
                              onClick={() => handleBookmarkCompany(c.id)}
                              title="Remove from Saved"
                              style={{ border: "none", background: "none", cursor: "pointer", color: "#f59e0b" }}
                            >
                              <Icon name="bookmark" size={18} />
                            </button>
                          </div>
                          <h3 className="sd-card-title">{c.name}</h3>
                          <p className="sd-card-sub">{c.industry} · {c.location}</p>
                          <p className="sd-card-desc">{c.tagline}</p>
                          <div className="sd-card-footer">
                            <div className="sd-opp-details">
                              <span className="sd-opp-meta"><Icon name="briefcase" size={13} /> {c.employees}</span>
                              <span className="sd-opp-meta">
                                {c.openRolesCount > 0
                                  ? `${c.openRolesCount} open role${c.openRolesCount === 1 ? "" : "s"}`
                                  : "No open roles yet"}
                              </span>
                            </div>
                            <div className="sd-card-actions">
                              <Link to={`/profile/startup/${c.id}`} className="sd-btn-secondary">View profile</Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <div className="sd-section-header">
                  <div>
                    <h2 className="sd-section-title">Saved Opportunities</h2>
                    <p className="sd-section-sub">Projects you've bookmarked to come back to</p>
                  </div>
                </div>

                {(() => {
                  const saved = (data.opportunities || []).filter((o) => o.bookmarked);
                  if (saved.length === 0) {
                    return (
                      <div className="sd-empty-state">
                        <p>Nothing saved yet — bookmark a project from Companies to see it here.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="sd-opp-list">
                      {saved.map((opp) => (
                        <OpportunityRow key={opp.id} opp={opp} onBookmark={handleBookmark} onApply={handleApply} />
                      ))}
                    </div>
                  );
                })()}
              </section>
            </main>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Opportunity Card (featured) ────────────────────────────────────── */
function OpportunityCard({ opp, onBookmark, onApply, onDetails }) {
  return (
    <div className="sd-opp-card" id={`opp-card-${opp.id}`}>
      <div className="sd-opp-card-top">
        <div className="sd-company-logo" style={{ background: opp.logoColor }}>{opp.initials}</div>
        <span className="sd-match-score">{opp.matchPercent}% match</span>
      </div>
      <button
        className={`sd-bookmark-btn${opp.bookmarked ? " active" : ""}`}
        onClick={() => onBookmark(opp.id)}
        aria-label="Bookmark"
        id={`bookmark-${opp.id}`}
      >
        <Icon name="bookmark" size={18} />
      </button>
      <h3 className="sd-card-title">{opp.title}</h3>
      <p className="sd-card-sub">
        <Link to={`/profile/startup/${opp.startupId}`} className="sd-company-link">{opp.company}</Link> · {opp.industry}
      </p>
      <p className="sd-card-desc">{opp.description}</p>
      <div className="sd-card-tags">
        {opp.tags.map((t) => <span className="sd-tag" key={t}>{t}</span>)}
      </div>
      <div className="sd-card-footer">
        <div className="sd-opp-details">
          <span className="sd-opp-meta"><Icon name="mappin" size={13} /> {opp.location}</span>
          <span className="sd-opp-meta"><Icon name="clock" size={13} /> {opp.type} · {opp.duration}</span>
          <span className="sd-opp-meta">
            <Icon name="briefcase" size={13} /> {opp.applicantCount} applicant{opp.applicantCount === 1 ? "" : "s"}
          </span>
          <span className="sd-opp-salary">{opp.salary}</span>
        </div>
        <div className="sd-card-actions">
          <button className="sd-btn-secondary" id={`btn-details-${opp.id}`} onClick={() => onDetails(opp)}>Details</button>
          <button className="sd-btn-primary" id={`btn-apply-${opp.id}`} disabled={opp.applied} onClick={() => onApply(opp.id)}>
            {opp.applied ? (<><Icon name="check" size={13} /> Applied</>) : (<>Apply now <Icon name="arrowRight" size={13} /></>)}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Opportunity Row (all opportunities list) ───────────────────────── */
function OpportunityRow({ opp, onBookmark, onApply }) {
  return (
    <div className="sd-opp-row" id={`opp-row-${opp.id}`}>
      <div className="sd-row-logo-info">
        <div className="sd-company-logo sm" style={{ background: opp.logoColor }}>{opp.initials}</div>
        <div className="sd-row-text">
          <span className="sd-row-title">{opp.title}</span>
          <span className="sd-row-company">
            <Link to={`/profile/startup/${opp.startupId}`} className="sd-company-link">{opp.company}</Link> · {opp.industry}
          </span>
        </div>
      </div>
      <div className="sd-row-details">
        <span className="sd-row-meta"><Icon name="mappin" size={14} /> {opp.location}</span>
        <span className="sd-row-meta"><Icon name="clock" size={14} /> {opp.type}</span>
        <span className="sd-row-meta"><Icon name="briefcase" size={14} /> {opp.applicantCount} applicant{opp.applicantCount === 1 ? "" : "s"}</span>
      </div>
      <div className="sd-row-match">
        <span className="sd-row-match-label">{opp.matchPercent}% match</span>
        <div className="sd-row-match-bar">
          <div className="sd-row-match-fill" style={{ width: `${opp.matchPercent}%` }} />
        </div>
      </div>
      <div className="sd-row-actions">
        <span className="sd-row-salary">{opp.salary}</span>
        <button className="sd-btn-row-apply" id={`btn-row-apply-${opp.id}`} disabled={opp.applied} onClick={() => onApply(opp.id)}>
          {opp.applied ? (<><Icon name="check" size={12} /> Applied</>) : (<>Apply <Icon name="arrowRight" size={12} /></>)}
        </button>
        <button
          className={`sd-bookmark-btn sm${opp.bookmarked ? " active" : ""}`}
          onClick={() => onBookmark(opp.id)}
          aria-label="Bookmark"
        >
          <Icon name="bookmark" size={16} />
        </button>
      </div>
    </div>
  );
}
