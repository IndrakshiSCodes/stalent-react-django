import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchStartupDashboard,
  updateApplicantStatus,
  sendCandidateAction,
  sendStartupMessage,
  getStartupChatHistory,
  addProject,
  saveStartupSettings,
} from "../api/startupDashboard";
import InviteModal from "../components/InviteModal";
import StalentLogo from "../components/StalentLogo";
import TeamUpInviteModal from "../components/TeamUpInviteModal";
import PostProjectModal from "../components/PostProjectModal";
import StartupNotificationCenter from "../components/StartupNotificationCenter";
import "./StartupDashboard.css";

/* ─── SVG Icon Helpers ────────────────────────────────────────────────── */
const Icon = ({ name, size = 20, color = "currentColor", className = "" }) => {
  const s = { width: size, height: size, display: "inline-block", verticalAlign: "middle" };
  const icons = {
    edit: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    dashboard: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    search: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    briefcase: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
    users: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M21 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      </svg>
    ),
    message: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    chart: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    document: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    settings: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    filter: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
      </svg>
    ),
    bell: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    mappin: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    link: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    ),
    plus: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    chevron: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    ),
    check: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    send: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    logout: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    alert: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    globe: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    upload: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    download: (
      <svg style={s} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    )
  };
  return icons[name] || null;
};

/* ─── Stalent Logo — imported from shared components/StalentLogo.jsx ─── */

export default function StartupDashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatMessage, setChatMessage] = useState("");

  const [selectedStudentForChat, setSelectedStudentForChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  const [filterSkills, setFilterSkills] = useState([]);
  const [filterMatchThreshold, setFilterMatchThreshold] = useState(70);
  const [filterUniversity, setFilterUniversity] = useState("");

  // ── NEW: which opportunity the invite modal is open for (null = closed) ──
  const [inviteTarget, setInviteTarget] = useState(null);
  const [teamInviteTarget, setTeamInviteTarget] = useState(null);
  const [showPostProject, setShowPostProject] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [settingsForm, setSettingsForm] = useState({
    name: "Orbitly",
    tagline: "The developer dashboard for engineering teams.",
    about: "",
    location: "San Francisco, CA",
    website: "orbitly.io",
    employees: "12 employees",
    founded: "Founded 2022",
    industry: "SaaS / DevTools",
    linkedinUrl: "",
    logoColor: "#1b2a4a"
  });

  const chatEndRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchStartupDashboard();
      setDashboardData(res);
      if (res.profile) {
        setSettingsForm({
          name: res.profile.name,
          tagline: res.profile.tagline,
          about: res.profile.about || "",
          location: res.profile.location,
          website: res.profile.website,
          employees: res.profile.employees,
          founded: res.profile.founded,
          industry: res.profile.industry,
          linkedinUrl: res.profile.linkedinUrl || "",
          logoColor: res.profile.logoColor || "#1b2a4a"
        });
      }
    } catch (err) {
      setError("Failed to fetch dashboard data. Make sure the Django server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Keep the dashboard live: quietly re-fetch in the background every few
  // seconds, and immediately whenever the tab regains focus/visibility —
  // so a student accepting/applying shows up here without needing to log
  // out and back in.
  useEffect(() => {
    const silentRefresh = async () => {
      try {
        const res = await fetchStartupDashboard();
        setDashboardData(res);
      } catch {
        // Silent — don't disrupt the UI over a background refresh failing.
      }
    };
    const intervalId = setInterval(silentRefresh, 8000);
    const onFocus = () => silentRefresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") silentRefresh();
    });
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (dashboardData?.applicants?.length > 0 && !selectedStudentForChat) {
      setSelectedStudentForChat(dashboardData.applicants[0].name);
    }
  }, [dashboardData, selectedStudentForChat]);

  const loadChatHistory = useCallback(async (studentName) => {
    try {
      const msgs = await getStartupChatHistory(studentName);
      setChatMessages(msgs);
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "messages" || !selectedStudentForChat) return;
    loadChatHistory(selectedStudentForChat);
    const interval = setInterval(() => { loadChatHistory(selectedStudentForChat); }, 3000);
    return () => clearInterval(interval);
  }, [activeTab, selectedStudentForChat, loadChatHistory]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [dashboardData?.messages, selectedStudentForChat, activeTab]);

  const handleLogout = () => { logout(); navigate("/login/startup"); };

  const handleStatusChange = async (applicantId, status) => {
    try {
      await updateApplicantStatus(applicantId, status);
      const res = await fetchStartupDashboard();
      setDashboardData(res);
    } catch (err) { console.error(err); }
  };

  const handleCandidateAction = async (studentId, action) => {
    try {
      await sendCandidateAction(studentId, action);
      const res = await fetchStartupDashboard();
      setDashboardData(res);
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong.";
      alert(msg);
    }
  };

  // Shared action buttons for a candidate card — branches on whether this
  // candidate has a real Application (Pending/Hired/Rejected flow) or is a
  // plain platform-wide student/invite (Hire sends a request that only
  // becomes Hired once accepted; Reject is immediate).
  const renderCandidateActions = (app) => {
    if (app.hasApplication) {
      // A hire offer has been sent but the student hasn't accepted or
      // declined it yet — hiring isn't instant, it always waits on the
      // student's response from their own notifications.
      if (app.status === "Pending" && app.offerPending) {
        return <span className="sud-hired-working">Offer sent — awaiting response</span>;
      }
      return (
        <>
          {/* "Interview" is legacy data from before that stage was removed —
              treated the same as Pending so old rows still have working actions. */}
          {(app.status === "Pending" || app.status === "Interview") && (
            <>
              <button className="sud-btn-decline" onClick={() => handleStatusChange(app.id, "Rejected")}>Decline</button>
              <button className="sud-btn-hire" onClick={() => handleStatusChange(app.id, "Hired")}>Hire student</button>
            </>
          )}
          {app.status === "Hired" && <span className="sud-hired-working"><Icon name="check" size={16} color="#10b981" /> Hired — working with you</span>}
          {app.status === "Rejected" && <span className="sud-rejected-label">Application Declined</span>}
        </>
      );
    }
    if (app.status === "Pending" && app.invitePending) {
      return <span className="sud-hired-working">Invite sent — awaiting response</span>;
    }
    if (app.status === "Pending") {
      return (
        <>
          <button className="sud-btn-decline" onClick={() => handleCandidateAction(app.studentId, "reject")}>Reject</button>
          <button className="sud-btn-hire" onClick={() => handleCandidateAction(app.studentId, "hire")}>Hire</button>
        </>
      );
    }
    if (app.status === "Hired") return <span className="sud-hired-working"><Icon name="check" size={16} color="#10b981" /> Hired — working with you</span>;
    if (app.status === "Rejected") return <span className="sud-rejected-label">Application Declined</span>;
    return null;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedStudentForChat) return;
    try {
      const text = chatMessage;
      setChatMessage("");
      await sendStartupMessage(selectedStudentForChat, text);
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now(), senderName: "Orbitly", avatarColor: dashboardData?.profile?.logoColor || "#1b2a4a", timeAgo: "Just now", text, isUnread: false },
      ]);
    } catch (err) { console.error(err); }
  };

  const handlePostProject = () => setShowPostProject(true);

  const handleSubmitNewProject = async (form) => {
    const updatedEngagements = await addProject(form);
    setDashboardData((prev) => {
      if (!prev) return prev;
      return { ...prev, engagements: updatedEngagements, stats: { ...prev.stats, activeProjects: updatedEngagements.length } };
    });
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await saveStartupSettings(settingsForm);
      setDashboardData(prev => {
        if (!prev) return prev;
        return { ...prev, profile: { ...prev.profile, ...settingsForm } };
      });
      alert("Company profile updated successfully!");
      setActiveTab("dashboard");
    } catch (err) {
      console.error("Failed to save settings", err);
      alert("Settings saved locally.");
      setActiveTab("dashboard");
    }
  };

  if (loading) {
    return (
      <div className="sud-loading-screen">
        <div className="sud-spinner" />
        <p>Loading Orbitly dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sud-error-screen">
        <p><Icon name="alert" size={16} /> {error}</p>
        <button onClick={loadData}>Retry</button>
      </div>
    );
  }

  const { profile, applicants, engagements, opportunities = [], stats, messages = [] } = dashboardData;
  const company = { ...profile, ...settingsForm };

  // The invite picker needs to target real open postings (Opportunity rows),
  // not already-hired engagements — those are two different things.
  const opportunitiesForInvite = opportunities.map((opp) => ({
    id: opp.id,
    title: opp.title,
  }));

  const filteredApplicants = applicants.filter((app) => {
    const matchesFilter = activeFilter === "All" || app.status === activeFilter;
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.appliedFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAdvancedSkills =
      filterSkills.length === 0 ||
      filterSkills.every(skill => app.tags.map(t => t.toLowerCase()).includes(skill.toLowerCase()));
    const matchesAdvancedThreshold = app.matchPercent >= filterMatchThreshold;
    const matchesAdvancedUniversity =
      !filterUniversity || app.university.toLowerCase().includes(filterUniversity.toLowerCase());
    return matchesFilter && matchesSearch && matchesAdvancedSkills && matchesAdvancedThreshold && matchesAdvancedUniversity;
  });

  const chatMessagesForSelectedStudent = chatMessages;

  return (
    <div className="sud-wrapper">

      {/* ── NOTIFICATION PANEL — invite accepted/declined, group activated ── */}
      {showNotifications && (
        <StartupNotificationCenter
          onClose={() => {
            setShowNotifications(false);
            setDashboardData((prev) =>
              prev ? { ...prev, stats: { ...prev.stats, unreadNotifications: 0 } } : prev
            );
          }}
          onViewStudent={(studentId) => {
            setShowNotifications(false);
            navigate(`/profile/student/${studentId}`);
          }}
        />
      )}

      {/* ── POST PROJECT MODAL ── */}
      {showPostProject && (
        <PostProjectModal
          onClose={() => setShowPostProject(false)}
          onSubmit={handleSubmitNewProject}
        />
      )}

      {/* ── INVITE MODAL — renders over everything when a project is selected ── */}
      {inviteTarget && (
        <InviteModal
          opportunity={inviteTarget}
          onClose={() => setInviteTarget(null)}
          onSuccess={() => {
            setInviteTarget(null);
            alert("Invitations sent! Students will see them in their notification panel.");
          }}
        />
      )}

      {/* ── TEAM UP INVITE MODAL — invite an already-teamed-up pair together ── */}
      {teamInviteTarget && (
        <TeamUpInviteModal
          team={teamInviteTarget}
          opportunities={opportunitiesForInvite}
          onClose={() => setTeamInviteTarget(null)}
          onSuccess={async () => {
            setTeamInviteTarget(null);
            alert("Team invitation sent! Both students will see it in their notification panel.");
            const fresh = await fetchStartupDashboard(auth.token);
            setDashboardData(fresh);
          }}
        />
      )}

      {/* —— LEFT FULL SIDEBAR —— */}
      <aside className="sud-sidebar">
        <div className="sud-sidebar-top">
          <div className="sud-sidebar-logo" onClick={() => setActiveTab("dashboard")} title="Stalent Dashboard">
            <StalentLogo />
            <span className="sud-logo-text logo-text">Stalent</span>
          </div>

          <nav className="sud-nav">
            <button className={`sud-nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")} title="Dashboard">
              <div className="sud-nav-icon-wrapper"><Icon name="dashboard" size={20} /></div>
              <span className="sud-nav-label">Dashboard</span>
            </button>

            <button className={`sud-nav-item ${activeTab === "candidates" ? "active" : ""}`} onClick={() => setActiveTab("candidates")} title="Candidates">
              <div className="sud-nav-icon-wrapper"><Icon name="users" size={20} /></div>
              <span className="sud-nav-label">Candidates</span>
              {stats.pendingApplicants > 0 && <span className="sud-badge-red-dot">{stats.pendingApplicants}</span>}
            </button>

            <button className={`sud-nav-item ${activeTab === "projects" ? "active" : ""}`} onClick={() => setActiveTab("projects")} title="Projects">
              <div className="sud-nav-icon-wrapper"><Icon name="briefcase" size={20} /></div>
              <span className="sud-nav-label">Projects</span>
            </button>

            <button className={`sud-nav-item ${activeTab === "messages" ? "active" : ""}`} onClick={() => setActiveTab("messages")} title="Messages">
              <div className="sud-nav-icon-wrapper"><Icon name="message" size={20} /></div>
              <span className="sud-nav-label">Messages</span>
              {stats.unreadMessages > 0 && <span className="sud-badge-red-dot">{stats.unreadMessages}</span>}
            </button>

            <button className={`sud-nav-item ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")} title="Analytics">
              <div className="sud-nav-icon-wrapper"><Icon name="chart" size={20} /></div>
              <span className="sud-nav-label">Analytics</span>
            </button>
          </nav>
        </div>

        <div className="sud-sidebar-bottom">
          <button className={`sud-nav-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")} title="Edit Profile">
            <div className="sud-nav-icon-wrapper"><Icon name="edit" size={20} /></div>
            <span className="sud-nav-label">Edit Profile</span>
          </button>

          <button className={`sud-nav-item ${activeTab === "filters" ? "active" : ""}`} onClick={() => setActiveTab("filters")} title="Filters">
            <div className="sud-nav-icon-wrapper"><Icon name="filter" size={20} /></div>
            <span className="sud-nav-label">Filters</span>
          </button>

          <button className="sud-nav-item logout-btn-sidebar" onClick={handleLogout} title="Logout">
            <div className="sud-nav-icon-wrapper"><Icon name="logout" size={20} /></div>
            <span className="sud-nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="sud-main">
        {/* ── TOP HEADER ── */}
        <header className="sud-header">
          <div className="sud-header-right">
            <div
              className="sud-bell-container"
              title="Notifications"
              onClick={() => setShowNotifications(true)}
              style={{ cursor: "pointer" }}
            >
              <Icon name="bell" size={20} />
              {stats.unreadNotifications > 0 && <span className="sud-bell-dot" />}
            </div>

            <div className="sud-user-dropdown" onClick={() => setActiveTab("settings")}>
              <div className="sud-user-initials" style={{ backgroundColor: company.logoColor }}>
                {company.initials || "OR"}
              </div>
              <div className="sud-user-info">
                <span className="sud-user-name">{company.name || "Orbitly"}</span>
                <span className="sud-user-role">{company.industry || "SaaS / DevTools"}</span>
              </div>
              <Icon name="chevron" size={14} color="var(--sud-muted)" />
            </div>
          </div>
        </header>

        {/* ── TAB VIEWS CONTAINER ── */}
        <div className="sud-scrollable-content">

          {/* =========================================
              VIEW 1: OVERVIEW DASHBOARD
              ========================================= */}
          {activeTab === "dashboard" && (
            <>
              {/* HERO BANNER */}
              <section className="sud-hero">
                <div className="sud-hero-left">
                  <div className="sud-company-logo" style={{ backgroundColor: company.logoColor || "rgba(255,255,255,0.15)" }}>
                    {company.initials || "OR"}
                  </div>
                  <div className="sud-hero-details">
                    <div className="sud-hero-badges">
                      <span className="sud-badge-green"><span className="dot" /> Logged in as {company.name || "Orbitly"}</span>
                      <span className="sud-badge-verified">
                        <span className="checkmark"><Icon name="check" size={12} color="#10b981" /></span> Verified Company
                      </span>
                      <span className="sud-badge-pro">Startup Pro</span>
                    </div>
                    <h1>{company.name || "Orbitly"}</h1>
                    <p className="sud-hero-tagline">{company.tagline || "The developer dashboard for engineering teams."}</p>
                    <div className="sud-hero-meta">
                      <span><Icon name="mappin" size={14} /> {company.location || "San Francisco, CA"}</span>
                      <span><Icon name="globe" size={14} /> {company.website || "orbitly.io"}</span>
                      <span><Icon name="users" size={14} /> {company.employees || "12 employees"}</span>
                      <span>{company.founded || "Founded 2022"}</span>
                      <span>{company.industry || "SaaS / DevTools"}</span>
                    </div>
                  </div>
                </div>

                <div className="sud-hero-actions">
                  <button className="sud-btn-outline" onClick={() => navigate(`/profile/startup/${auth.user.id}`)}>
                    <Icon name="link" size={16} />
                    <span>Public profile</span>
                  </button>
                  <button className="sud-btn-primary" onClick={handlePostProject}>
                    <Icon name="plus" size={16} color="#1f2937" />
                    <span>Post a project</span>
                  </button>
                </div>
              </section>

              {/* STATS ROW */}
              <section className="sud-stats-grid">
                <div className="sud-stat-card" onClick={() => setActiveTab("candidates")} style={{ cursor: "pointer" }}>
                  <div className="sud-stat-icon-wrapper blue"><Icon name="users" size={24} color="#1b2a4a" /></div>
                  <div className="sud-stat-values">
                    <span className="sud-stat-label">Total Applicants</span>
                    <span className="sud-stat-number">{stats.totalApplicants}</span>
                    <span className="sud-stat-sub">{stats.pendingApplicants} pending review</span>
                  </div>
                </div>

                <div className="sud-stat-card" onClick={() => { setActiveTab("candidates"); setActiveFilter("Hired"); }} style={{ cursor: "pointer" }}>
                  <div className="sud-stat-icon-wrapper green"><Icon name="check" size={24} color="#10b981" /></div>
                  <div className="sud-stat-values">
                    <span className="sud-stat-label">Hired Students</span>
                    <span className="sud-stat-number">{stats.hiredStudents}</span>
                    <span className="sud-stat-sub">Active right now</span>
                  </div>
                </div>

                <div className="sud-stat-card" onClick={() => setActiveTab("projects")} style={{ cursor: "pointer" }}>
                  <div className="sud-stat-icon-wrapper yellow"><Icon name="briefcase" size={24} color="#f59e0b" /></div>
                  <div className="sud-stat-values">
                    <span className="sud-stat-label">Active Projects</span>
                    <span className="sud-stat-number">{stats.activeProjects}</span>
                    <span className="sud-stat-sub">{stats.activeProjects} on track</span>
                  </div>
                </div>

                <div className="sud-stat-card" onClick={() => setActiveTab("messages")} style={{ cursor: "pointer" }}>
                  <div className="sud-stat-icon-wrapper pink"><Icon name="message" size={24} color="#ec4899" /></div>
                  <div className="sud-stat-values">
                    <span className="sud-stat-label">Unread Messages</span>
                    <span className="sud-stat-number">{stats.unreadMessages}</span>
                    <span className="sud-stat-sub">From students</span>
                  </div>
                </div>
              </section>

              {/* MAIN CONTENT GRID */}
              <div className="sud-main-grid">
                {/* APPLICANTS PANEL */}
                <div className="sud-grid-left">
                  <div className="sud-section-card">
                    <div className="sud-section-header">
                      <div>
                        <h2>Student Applications</h2>
                        <p className="sud-section-subtitle">{filteredApplicants.length} applications · {filteredApplicants.filter(a => a.status === 'Pending').length} need action</p>
                      </div>
                      <div className="sud-filter-tabs">
                        {["All", "Pending", "Hired", "Rejected"].map((f) => (
                          <button key={f} className={`sud-filter-tab ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
                        ))}
                      </div>
                    </div>

                    <div className="sud-applicants-list">
                      {filteredApplicants.length === 0 ? (
                        <div className="sud-empty-state"><p>No student applications found matching the criteria.</p></div>
                      ) : (
                        filteredApplicants.map((app) => (
                          <div className="sud-applicant-card" key={app.id}>
                            <div className="sud-applicant-header">
                              <div className="sud-applicant-profile">
                                <div className="sud-applicant-avatar" style={{ backgroundColor: app.avatarColor }}>{app.initials}</div>
                                <div className="sud-applicant-meta">
                                  <div className="sud-applicant-name-row">
                                    <span className="sud-applicant-name">{app.name}</span>
                                    <span className="sud-match-badge">{app.matchPercent}% match</span>
                                    <span className={`sud-status-badge ${app.status.toLowerCase()}`}>{app.status}</span>
                                  </div>
                                  <p className="sud-applicant-school">{app.university} · {app.degree}, Year {app.year}</p>
                                  <p className="sud-applicant-applied">Applied for: <strong>{app.appliedFor}</strong> · {app.timeAgo}</p>
                                </div>
                              </div>
                            </div>

                            <div className="sud-applicant-body">
                              <p className="sud-applicant-quote">&ldquo;{app.quote}&rdquo;</p>
                              <div className="sud-applicant-tags">
                                {app.tags.map((tag) => <span key={tag} className="sud-tag">{tag}</span>)}
                              </div>
                            </div>

                            <div className="sud-applicant-footer">
                              <div className="sud-applicant-actions-left">
                                <button className="sud-btn-text" onClick={() => navigate(`/profile/student/${app.studentId}`)}><Icon name="link" size={14} color="#1b2a4a" /><span>View Profile</span></button>
                                <button className="sud-btn-text" onClick={() => { setSelectedStudentForChat(app.name); setActiveTab("messages"); }}>
                                  <Icon name="message" size={14} color="#1b2a4a" /><span>Message</span>
                                </button>
                              </div>

                              <div className="sud-applicant-actions-right">
                                {renderCandidateActions(app)}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="sud-grid-right">
                  {/* OPEN POSTINGS — invite students (solo or group) before anyone's hired */}
                  {opportunities.length > 0 && (
                    <div className="sud-section-card margin-bottom">
                      <div className="sud-section-header no-border">
                        <h2>Open Postings</h2>
                      </div>
                      <div className="sud-engagements-list">
                        {opportunities.map((opp) => (
                          <div className="sud-engagement-card" key={opp.id} style={{ padding: "12px 14px" }}>
                            <div className="sud-engagement-header">
                              <div className="sud-engagement-info">
                                <h3 style={{ margin: 0 }}>{opp.title}</h3>
                                <p style={{ margin: "2px 0 0" }}>{opp.applicantCount} applicant{opp.applicantCount === 1 ? "" : "s"}</p>
                              </div>
                            </div>
                            <div style={{ marginTop: 8 }}>
                              <button
                                onClick={() => setInviteTarget({ id: opp.id, title: opp.title })}
                                style={{
                                  width: "100%", padding: "8px", borderRadius: 8,
                                  border: "1.5px dashed #1b2a4a", background: "transparent",
                                  color: "#1b2a4a", fontWeight: 600, fontSize: "0.82rem",
                                  cursor: "pointer", display: "flex", alignItems: "center",
                                  justifyContent: "center", gap: 6,
                                }}
                              >
                                <Icon name="plus" size={14} color="#1b2a4a" />
                                Invite Students
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ENGAGEMENTS */}
                  <div className="sud-section-card margin-bottom">
                    <div className="sud-section-header no-border">
                      <h2>Active Engagements</h2>
                      <button className="sud-btn-primary-small" onClick={handlePostProject}>
                        <Icon name="plus" size={14} color="#ffffff" /><span>Post project</span>
                      </button>
                    </div>

                    <div className="sud-engagements-list">
                      {engagements.map((eng) => (
                        <div className="sud-engagement-card" key={eng.id}>
                          <div className="sud-engagement-header">
                            <div className="sud-engagement-profile">
                              <div className="sud-engagement-avatar" style={{ backgroundColor: eng.avatarColor }}>{eng.initials}</div>
                              <div className="sud-engagement-info">
                                <h3>{eng.role}</h3>
                                <p>{eng.studentName} · {eng.duration}</p>
                              </div>
                            </div>
                            <span className="sud-track-badge"><span className="dot" /> {eng.status}</span>
                          </div>

                          <div className="sud-progress-wrapper">
                            <div className="sud-progress-header"><span>Progress</span><span>{eng.progress}%</span></div>
                            <div className="sud-progress-bar-bg">
                              <div className="sud-progress-bar-fill" style={{ width: `${eng.progress}%` }} />
                            </div>
                          </div>

                          {/* ── INVITE STUDENTS BUTTON on each engagement card ── */}
                          <div style={{ padding: "0 0 4px", marginTop: 8 }}>
                            <button
                              onClick={() => setInviteTarget({ id: eng.opportunityId, title: eng.role })}
                              style={{
                                width: "100%", padding: "8px", borderRadius: 8,
                                border: "1.5px dashed #1b2a4a", background: "transparent",
                                color: "#1b2a4a", fontWeight: 600, fontSize: "0.82rem",
                                cursor: "pointer", display: "flex", alignItems: "center",
                                justifyContent: "center", gap: 6,
                              }}
                            >
                              <Icon name="plus" size={14} color="#1b2a4a" />
                              Invite Students
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MESSAGES PREVIEW */}
                  <div className="sud-section-card messages-card">
                    <div className="sud-section-header">
                      <div className="sud-messages-title-row">
                        <h2>Messages Overview</h2>
                        {stats.unreadMessages > 0 && <span className="sud-messages-unread-badge">{stats.unreadMessages} new</span>}
                      </div>
                    </div>

                    <div className="sud-chat-history">
                      {messages.slice(-4).map((msg) => (
                        <div className={`sud-chat-msg ${msg.senderName === 'Orbitly' ? 'outgoing' : 'incoming'}`} key={msg.id}>
                          {msg.senderName !== 'Orbitly' && (
                            <div className="sud-chat-avatar" style={{ backgroundColor: msg.avatarColor }}>
                              {msg.senderName.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                          <div className="sud-chat-bubble-container">
                            <div className="sud-chat-bubble-meta">
                              <span className="sud-chat-sender">{msg.senderName}</span>
                              <span className="sud-chat-time">{msg.timeAgo}</span>
                            </div>
                            <div className="sud-chat-bubble"><p>{msg.text}</p></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form className="sud-chat-reply-form" onSubmit={handleSendMessage}>
                      <input type="text" placeholder="Type standard quick response..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} />
                      <button type="submit" className="sud-btn-send"><Icon name="send" size={16} color="#ffffff" /></button>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =========================================
              VIEW 2: DEDICATED CANDIDATES PAGE
              ========================================= */}
          {activeTab === "candidates" && (
            <div className="sud-section-card full-width">
              <div className="sud-section-header">
                <div>
                  <h2>All Candidates Manager</h2>
                  <p className="sud-section-subtitle">Review, communicate, and hire qualified student matches</p>
                </div>
                <div className="sud-filter-tabs">
                  {["All", "Pending", "Hired", "Rejected", "Team Up"].map((f) => (
                    <button key={f} className={`sud-filter-tab ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
                  ))}
                </div>
              </div>

              {activeFilter === "Team Up" ? (
                <div className="sud-applicants-list">
                  <p className="sud-section-subtitle" style={{ marginBottom: 16 }}>
                    Students who have teamed up with each other — consider hiring them together as a pair
                  </p>
                  {(dashboardData?.teamUps || []).length === 0 ? (
                    <div className="sud-empty-state"><p>No students have teamed up yet.</p></div>
                  ) : (
                    dashboardData.teamUps.map((team) => (
                      <div className="sud-applicant-card" key={team.id}>
                        <div className="sud-applicant-header" style={{ gap: 24 }}>
                          {team.members.map((m) => (
                            <div className="sud-applicant-profile" key={m.id}>
                              <div className="sud-applicant-avatar" style={{ backgroundColor: m.avatarColor }}>{m.initials}</div>
                              <div className="sud-applicant-meta">
                                <div className="sud-applicant-name-row">
                                  <span className="sud-applicant-name">{m.name}</span>
                                </div>
                                <p className="sud-applicant-school">{m.university} · {m.major}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="sud-applicant-footer">
                          <div className="sud-applicant-actions-left">
                            <span className="sud-applicant-applied">Teamed up {team.teamedUpAgo}</span>
                          </div>
                          <div className="sud-applicant-actions-right">
                            {team.members.map((m) => (
                              <button key={m.id} className="sud-btn-text" onClick={() => navigate(`/profile/student/${m.id}`)}>
                                <Icon name="link" size={14} color="#1b2a4a" /><span>View {m.name.split(" ")[0]}</span>
                              </button>
                            ))}
                            <button className="sud-btn-action" onClick={() => setTeamInviteTarget(team)}>
                              Invite as a team
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="sud-applicants-list">
                {filteredApplicants.length === 0 ? (
                  <div className="sud-empty-state"><p>No candidates found matching filters.</p></div>
                ) : (
                  filteredApplicants.map((app) => (
                    <div className="sud-applicant-card" key={app.id}>
                      <div className="sud-applicant-header">
                        <div className="sud-applicant-profile">
                          <div className="sud-applicant-avatar" style={{ backgroundColor: app.avatarColor }}>{app.initials}</div>
                          <div className="sud-applicant-meta">
                            <div className="sud-applicant-name-row">
                              <span className="sud-applicant-name">{app.name}</span>
                              <span className="sud-match-badge">{app.matchPercent}% match</span>
                              <span className={`sud-status-badge ${app.status.toLowerCase()}`}>{app.status}</span>
                            </div>
                            <p className="sud-applicant-school">{app.university} · {app.degree}, Year {app.year}</p>
                            <p className="sud-applicant-applied">Applied for: <strong>{app.appliedFor}</strong> · {app.timeAgo}</p>
                          </div>
                        </div>
                      </div>

                      <div className="sud-applicant-body">
                        <p className="sud-applicant-quote">&ldquo;{app.quote}&rdquo;</p>
                        <div className="sud-applicant-tags">
                          {app.tags.map((tag) => <span key={tag} className="sud-tag">{tag}</span>)}
                        </div>
                      </div>

                      <div className="sud-applicant-footer">
                        <div className="sud-applicant-actions-left">
                          <button className="sud-btn-text" onClick={() => navigate(`/profile/student/${app.studentId}`)}><Icon name="link" size={14} color="#1b2a4a" /><span>View Profile</span></button>
                          <button className="sud-btn-text" onClick={() => { setSelectedStudentForChat(app.name); setActiveTab("messages"); }}>
                            <Icon name="message" size={14} color="#1b2a4a" /><span>Start Chat</span>
                          </button>
                        </div>

                        <div className="sud-applicant-actions-right">
                          {renderCandidateActions(app)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                </div>
              )}
            </div>
          )}

          {/* =========================================
              VIEW 3: DEDICATED PROJECTS PAGE
              ========================================= */}
          {activeTab === "projects" && (
            <div className="sud-section-card full-width">
              <div className="sud-section-header">
                <div>
                  <h2>Projects & Engagements Portal</h2>
                  <p className="sud-section-subtitle">Manage open postings and active engagements</p>
                </div>
                <button className="sud-btn-primary" onClick={handlePostProject}>
                  <Icon name="plus" size={16} color="#1f2937" /><span>Post new project</span>
                </button>
              </div>

              {/* ── OPEN POSTINGS — every project you've posted, whether or not
                  anyone's been hired yet. This is the primary place to invite
                  students: it doesn't depend on an engagement already existing. ── */}
              <h3 className="sud-subsection-title">Open postings</h3>
              {opportunities.length === 0 && (
                <p className="sud-empty-state">You haven't posted any projects yet. Use "Post new project" above to create one, then invite students to it.</p>
              )}
              <div className="sud-postings-grid-layout">
                {opportunities.map((opp) => (
                  <div className="sud-posting-card" key={opp.id}>
                    <div className="sud-posting-card-top">
                      <span className="sud-track-badge"><span className="dot" /> {opp.hiredCount > 0 ? "Hiring" : "Open"}</span>
                      <h3>{opp.title}</h3>
                      <p className="sud-duration-desc">{opp.location || "Remote"} · {opp.type || "Part-time"}</p>
                    </div>
                    <div className="sud-posting-card-stats">
                      <span><strong>{opp.applicantCount}</strong> applicant{opp.applicantCount === 1 ? "" : "s"}</span>
                      <span><strong>{opp.hiredCount}</strong> hired</span>
                      {opp.pendingInvites > 0 && <span><strong>{opp.pendingInvites}</strong> invite{opp.pendingInvites === 1 ? "" : "s"} pending</span>}
                    </div>
                    <button
                      className="sud-btn-invite-posting"
                      onClick={() => setInviteTarget({ id: opp.id, title: opp.title })}
                    >
                      <Icon name="users" size={15} /><span>Invite / hire students</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* ── ACTIVE ENGAGEMENTS — students who have accepted and are working ── */}
              <h3 className="sud-subsection-title" style={{ marginTop: 32 }}>Active engagements</h3>
              {engagements.length === 0 && (
                <p className="sud-empty-state">No one's been hired yet — invite a student above to get started.</p>
              )}
              <div className="sud-engagements-grid-layout">
                {engagements.map((eng) => (
                  <div className="sud-engagement-grid-card" key={eng.id}>
                    <div className="sud-engagement-card-top">
                      <span className="sud-track-badge"><span className="dot" /> {eng.status}</span>
                      <h3>{eng.role}</h3>
                      <p className="sud-student-desc">Assigned: <strong>{eng.studentName}</strong></p>
                      <p className="sud-duration-desc">Timeline: {eng.duration}</p>
                    </div>

                    <div className="sud-progress-wrapper" style={{ padding: "0 20px 12px" }}>
                      <div className="sud-progress-header"><span>Milestone Progress</span><span>{eng.progress}%</span></div>
                      <div className="sud-progress-bar-bg">
                        <div className="sud-progress-bar-fill" style={{ width: `${eng.progress}%` }} />
                      </div>

                      <div className="sud-project-card-actions" style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button
                          className="sud-btn-outline-small"
                          onClick={() => {
                            const newProgress = prompt(`Enter progress % for ${eng.role} (0-100):`, eng.progress);
                            const parsed = parseInt(newProgress);
                            if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                              setDashboardData(prev => {
                                const updatedEngs = prev.engagements.map(e => e.id === eng.id ? { ...e, progress: parsed } : e);
                                return { ...prev, engagements: updatedEngs };
                              });
                            }
                          }}
                        >
                          Update progress
                        </button>

                        {/* ── INVITE STUDENTS BUTTON on projects page ── */}
                        <button
                          onClick={() => setInviteTarget({ id: eng.opportunityId, title: eng.role })}
                          style={{
                            flex: 1, padding: "6px 12px", borderRadius: 8,
                            border: "1.5px dashed #1b2a4a", background: "transparent",
                            color: "#1b2a4a", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer",
                          }}
                        >
                          + Invite Students
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================
              VIEW 4: FULL MESSAGING CHATROOM
              ========================================= */}
          {activeTab === "messages" && (
            <div className="sud-chat-room-layout">
              <div className="sud-chat-students-sidebar">
                <h3>Students</h3>
                <div className="sud-chat-students-list">
                  {applicants.map((student) => (
                    <button
                      key={student.id}
                      className={`sud-chat-student-item ${selectedStudentForChat === student.name ? "active" : ""}`}
                      onClick={() => setSelectedStudentForChat(student.name)}
                    >
                      <div className="sud-student-avatar" style={{ backgroundColor: student.avatarColor }}>{student.initials}</div>
                      <div className="sud-student-chat-details">
                        <h4>{student.name}</h4>
                        <p>{student.appliedFor}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sud-chat-room-main">
                <div className="sud-chat-room-header">
                  <div className="sud-chat-header-profile">
                    <div className="sud-chat-header-avatar">{selectedStudentForChat.split(" ").map(n => n[0]).join("")}</div>
                    <div>
                      <h3>{selectedStudentForChat}</h3>
                      <p>Active communication channel</p>
                    </div>
                  </div>
                </div>

                <div className="sud-chat-room-history">
                  {chatMessagesForSelectedStudent.length === 0 ? (
                    <div className="sud-empty-chat"><p>Start a conversation with {selectedStudentForChat} by typing your reply below.</p></div>
                  ) : (
                    chatMessagesForSelectedStudent.map((msg, idx) => (
                      <div className={`sud-chat-msg ${msg.senderName === 'Orbitly' ? 'outgoing' : 'incoming'}`} key={idx}>
                        {msg.senderName !== 'Orbitly' && (
                          <div className="sud-chat-avatar" style={{ backgroundColor: msg.avatarColor || "#1b2a4a" }}>
                            {msg.senderName.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div className="sud-chat-bubble-container">
                          <div className="sud-chat-bubble-meta">
                            <span className="sud-chat-sender">{msg.senderName}</span>
                            <span className="sud-chat-time">{msg.timeAgo}</span>
                          </div>
                          <div className="sud-chat-bubble"><p>{msg.text}</p></div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form className="sud-chat-room-input-area" onSubmit={handleSendMessage}>
                  <input type="text" placeholder={`Message ${selectedStudentForChat}...`} value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} />
                  <button type="submit" className="sud-btn-send"><Icon name="send" size={18} color="#ffffff" /></button>
                </form>
              </div>
            </div>
          )}

          {/* =========================================
              VIEW 5: ANALYTICS DASHBOARD
              ========================================= */}
          {activeTab === "analytics" && (
            <div className="sud-section-card full-width" style={{ padding: "30px" }}>
              <h2>Startup Analytics Dashboard</h2>
              <p className="sud-section-subtitle">Real-time charts, metrics, and engagement graphs</p>

              <div className="sud-analytics-grid-layout">
                <div className="sud-analytics-chart-card">
                  <h3>Hiring Funnel Conversion</h3>
                  <div className="sud-funnel-graph-mock">
                    <div className="funnel-bar tier-1" style={{ width: "100%" }}><span>Applicants: 5</span></div>
                    <div className="funnel-bar tier-2" style={{ width: "80%" }}><span>Reviewed: 4</span></div>
                    <div className="funnel-bar tier-4" style={{ width: "20%" }}><span>Hired: 1</span></div>
                  </div>
                </div>

                <div className="sud-analytics-chart-card">
                  <h3>Engagement Milestones Complete</h3>
                  <div className="sud-metrics-radial-box">
                    <div className="radial-metric">
                      <div className="radial-circle-mock" style={{ borderImage: "conic-gradient(#1b2a4a 62%, #e2e8f0 0) 1" }}><span>62%</span></div>
                      <h4>Frontend Dev</h4>
                    </div>
                    <div className="radial-metric">
                      <div className="radial-circle-mock" style={{ borderImage: "conic-gradient(#f59e0b 34%, #e2e8f0 0) 1" }}><span>34%</span></div>
                      <h4>Content Writer</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              VIEW 6: DOCUMENTS PORTAL
              ========================================= */}
          {activeTab === "documents" && (
            <div className="sud-section-card full-width" style={{ padding: "30px" }}>
              <h2>Documents Repository</h2>
              <p className="sud-section-subtitle">Important files, candidate resumes, and contract agreements</p>

              <div className="sud-docs-grid">
                <div className="sud-doc-item">
                  <div className="doc-icon"><Icon name="document" size={32} color="#1b2a4a" /></div>
                  <div className="doc-meta"><h4>Stalent_NDA_Template.pdf</h4><p>PDF Document · 245 KB</p></div>
                  <button className="doc-action-btn" title="Download NDA"><Icon name="download" size={18} /></button>
                </div>
                <div className="sud-doc-item">
                  <div className="doc-icon"><Icon name="document" size={32} color="#10b981" /></div>
                  <div className="doc-meta"><h4>Project_Requirement_Brief.docx</h4><p>Word Document · 1.2 MB</p></div>
                  <button className="doc-action-btn" title="Download Brief"><Icon name="download" size={18} /></button>
                </div>
                <div className="sud-doc-item">
                  <div className="doc-icon"><Icon name="document" size={32} color="#ec4899" /></div>
                  <div className="doc-meta"><h4>Lena_Fischer_Resume.pdf</h4><p>PDF Document · 348 KB</p></div>
                  <button className="doc-action-btn" title="Download Resume"><Icon name="download" size={18} /></button>
                </div>
                <div className="sud-doc-item">
                  <div className="doc-icon"><Icon name="document" size={32} color="#f59e0b" /></div>
                  <div className="doc-meta"><h4>Amara_Osei_Portfolio.pdf</h4><p>PDF Document · 4.8 MB</p></div>
                  <button className="doc-action-btn" title="Download Portfolio"><Icon name="download" size={18} /></button>
                </div>
              </div>

              <div className="sud-upload-box">
                <Icon name="upload" size={40} color="var(--sud-subtle)" />
                <p>Drag and drop candidate agreements or contracts here, or <span>browse files</span></p>
                <span className="subtext">Maximum file size: 10MB</span>
              </div>
            </div>
          )}

          {/* =========================================
              VIEW 7: PROFILE SETTINGS
              ========================================= */}
          {activeTab === "settings" && (
            <div className="sud-section-card full-width" style={{ padding: "30px" }}>
              <h2>Startup Profile</h2>
              <p className="sud-section-subtitle">This is what students see on your public profile and across the platform</p>

              <form onSubmit={handleSaveSettings} className="sud-settings-form">
                <div className="form-grid">
                  <div className="form-field">
                    <label>Company Name</label>
                    <input type="text" value={settingsForm.name} onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })} required />
                  </div>
                  <div className="form-field">
                    <label>Website URL</label>
                    <input type="text" value={settingsForm.website} onChange={(e) => setSettingsForm({ ...settingsForm, website: e.target.value })} required />
                  </div>
                  <div className="form-field">
                    <label>Location</label>
                    <input type="text" value={settingsForm.location} onChange={(e) => setSettingsForm({ ...settingsForm, location: e.target.value })} required />
                  </div>
                  <div className="form-field">
                    <label>Company Size (Employees)</label>
                    <input type="text" value={settingsForm.employees} onChange={(e) => setSettingsForm({ ...settingsForm, employees: e.target.value })} required />
                  </div>
                  <div className="form-field">
                    <label>Founded Year</label>
                    <input type="text" value={settingsForm.founded} onChange={(e) => setSettingsForm({ ...settingsForm, founded: e.target.value })} required />
                  </div>
                  <div className="form-field">
                    <label>Industry</label>
                    <input type="text" value={settingsForm.industry} onChange={(e) => setSettingsForm({ ...settingsForm, industry: e.target.value })} required />
                  </div>
                  <div className="form-field full-width-field">
                    <label>Tagline / Description</label>
                    <input type="text" value={settingsForm.tagline} onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })} required />
                  </div>
                  <div className="form-field full-width-field">
                    <label>About / Mission</label>
                    <textarea
                      rows={4}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", fontFamily: "inherit", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box" }}
                      value={settingsForm.about}
                      onChange={(e) => setSettingsForm({ ...settingsForm, about: e.target.value })}
                      placeholder="What is your company building, and why? This shows on your public profile page."
                    />
                  </div>
                  <div className="form-field">
                    <label>LinkedIn URL</label>
                    <input type="text" value={settingsForm.linkedinUrl} onChange={(e) => setSettingsForm({ ...settingsForm, linkedinUrl: e.target.value })} placeholder="linkedin.com/company/..." />
                  </div>
                  <div className="form-field">
                    <label>Profile Theme Color</label>
                    <div className="color-picker-presets">
                      {["#1b2a4a", "#101d33", "#10b981", "#ec4899", "#f59e0b", "#1b2a4a"].map(color => (
                        <button key={color} type="button" className={`color-preset-circle ${settingsForm.logoColor === color ? "active" : ""}`} style={{ backgroundColor: color }} onClick={() => setSettingsForm({ ...settingsForm, logoColor: color })} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="sud-btn-decline" onClick={() => setActiveTab("dashboard")}>Cancel</button>
                  <button type="submit" className="sud-btn-action" style={{ padding: "10px 24px" }}>Save changes</button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================
              VIEW 8: ADVANCED CANDIDATES FILTERS
              ========================================= */}
          {activeTab === "filters" && (
            <div className="sud-section-card full-width" style={{ padding: "30px" }}>
              <h2>Advanced Candidate Matching Filters</h2>
              <p className="sud-section-subtitle">Set granular requirements to filter applicant cards dynamically</p>

              <div className="sud-filters-page-grid">
                <div className="filter-group">
                  <h3>Required Skills Tags</h3>
                  <div className="skills-checklist">
                    {["React", "TypeScript", "Tailwind", "Vue", "Node.js", "GraphQL", "Figma", "UX Research"].map(skill => (
                      <label key={skill} className="checkbox-label">
                        <input type="checkbox" checked={filterSkills.includes(skill)} onChange={(e) => {
                          if (e.target.checked) setFilterSkills([...filterSkills, skill]);
                          else setFilterSkills(filterSkills.filter(s => s !== skill));
                        }} />
                        <span>{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h3>Minimum Match Percentage ({filterMatchThreshold}%)</h3>
                  <input type="range" min="50" max="100" value={filterMatchThreshold} onChange={(e) => setFilterMatchThreshold(parseInt(e.target.value))} className="slider-range-input" />
                  <div className="slider-labels"><span>50%</span><span>75%</span><span>100%</span></div>
                </div>

                <div className="filter-group">
                  <h3>Search Specific University</h3>
                  <input type="text" placeholder="e.g. TU Berlin, Stanford..." value={filterUniversity} onChange={(e) => setFilterUniversity(e.target.value)} className="filter-text-input" />
                </div>
              </div>

              <div className="filter-actions-row">
                <button className="sud-btn-decline" onClick={() => { setFilterSkills([]); setFilterMatchThreshold(70); setFilterUniversity(""); }}>Clear all filters</button>
                <button className="sud-btn-action" onClick={() => setActiveTab("candidates")}>Apply and view candidates ({filteredApplicants.length})</button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
