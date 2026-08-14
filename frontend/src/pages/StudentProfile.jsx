import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiFileText, FiCheckCircle, FiStar, FiAward, FiArrowRight } from "react-icons/fi";
import {
  fetchStudentPublicProfile,
  updateStudentProfile,
  addContribution,
  deleteContribution,
  addExperience,
  deleteExperience,
  addCertification,
  deleteCertification,
  addEducation,
  updateEducation,
  deleteEducation,
} from "../api/profiles";
import StalentLogo from "../components/StalentLogo";
import "./StudentProfile.css";

/* ─── Inline SVG Icons ────────────────────────────────────────────── */
const Icon = ({ name, size = 18 }) => {
  const s = { width: size, height: size, display: "inline-block", verticalAlign: "middle", flexShrink: 0 };
  const icons = {
    arrow: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>),
    edit: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
    mappin: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>),
    globe: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>),
    linkedin: (<svg style={s} viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>),
    github: (<svg style={s} viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>),
    briefcase: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>),
    graduationcap: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>),
    star: (<svg style={s} viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>),
    code: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>),
    check: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
    trophy: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/><rect x="6" y="18" width="12" height="4" rx="1"/></svg>),
    plus: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
    users: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
    calendar: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>),
    logout: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>),
    bookmark: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>),
    message: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
    settings: (<svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>),
  };
  return icons[name] || null;
};

/* ─── Stalent Logo — imported from shared components/StalentLogo.jsx ─── */

/* ─── Static mock profile data ─────────────────────────────────────── */
const profileData = {
  firstName: "Alex", lastName: "Rivera", initials: "AR",
  avatarColor: "#1b2a4a",
  university: "Stanford University", major: "Computer Science", year: 3,
  location: "San Francisco, CA", website: "alexrivera.dev",
  linkedin: "linkedin.com/in/alexrivera", github: "github.com/alexrivera",
  profileComplete: 98,
  bio: "Passionate CS student specializing in full-stack development and machine learning. I love building products that solve real problems and collaborating with ambitious startups.",
  openTo: ["Full-time Internship", "Part-time Projects", "Remote Work"],
  skills: [
    { id: 1, name: "React", percent: 88, color: "#1b2a4a" },
    { id: 2, name: "Python", percent: 72, color: "#10b981" },
    { id: 3, name: "TypeScript", percent: 80, color: "#3b82f6" },
    { id: 4, name: "Figma", percent: 65, color: "#f59e0b" },
    { id: 5, name: "SQL", percent: 58, color: "#3d5a80" },
    { id: 6, name: "Node.js", percent: 70, color: "#ec4899" },
  ],
  education: [
    { id: 1, institution: "Stanford University", degree: "BSc Computer Science", period: "2022 – 2026", gpa: "3.9 / 4.0", courses: ["Machine Learning", "Systems Design", "Algorithms", "HCI"] },
    { id: 2, institution: "IB World School, Karachi", degree: "International Baccalaureate", period: "2018 – 2022", gpa: "44 / 45", courses: [] },
  ],
  projects: [
    { id: 1, title: "StudySync", desc: "AI-powered study scheduler that adapts to student performance using ML predictions.", tags: ["React", "Python", "TensorFlow"], stars: 142, link: "#" },
    { id: 2, title: "OpenResume", desc: "Open-source resume builder with live PDF export and ATS optimization hints.", tags: ["Next.js", "TypeScript", "PDF.js"], stars: 87, link: "#" },
    { id: 3, title: "DataLens", desc: "Visual analytics dashboard for exploring large CSV datasets without code.", tags: ["D3.js", "Python", "FastAPI"], stars: 64, link: "#" },
  ],
  activity: [
    { id: 1, icon: FiFileText, text: "Applied to Frontend Developer at Orbitly", time: "2 days ago", type: "application" },
    { id: 2, icon: FiCheckCircle, text: "Interview scheduled with Leafly AI", time: "5 days ago", type: "interview" },
    { id: 3, icon: FiStar, text: "Profile viewed by 12 startups this week", time: "1 week ago", type: "view" },
    { id: 4, icon: FiAward, text: "Reached 98% profile completeness", time: "2 weeks ago", type: "milestone" },
  ],
};

/* ─── Nav sidebar (shared layout) ──────────────────────────────────── */
function ProfileSidebar({ onLogout }) {
  return (
    <aside className="sp-sidebar">
      <Link to="/student/dashboard" className="sp-sidebar-logo">
        <StalentLogo />
        <span className="sp-logo-text logo-text">Stalent</span>
      </Link>
      <nav className="sp-nav">
        <Link to="/student/dashboard" className="sp-nav-item" id="sp-nav-dashboard"><span className="sp-nav-icon">⊞</span><span>Dashboard</span></Link>
        <Link to="/student/dashboard" state={{ tab: "students" }} className="sp-nav-item" id="sp-nav-students"><Icon name="users" size={18}/><span>Students Like You</span></Link>
        <Link to="/student/dashboard" state={{ tab: "saved" }} className="sp-nav-item" id="sp-nav-saved"><Icon name="bookmark" size={18}/><span>Saved</span></Link>
        <Link to="/student/dashboard" state={{ tab: "companies" }} className="sp-nav-item" id="sp-nav-opportunities"><Icon name="briefcase" size={18}/><span>Companies</span></Link>
        <Link to="/student/profile" className="sp-nav-item active" id="sp-nav-profile"><Icon name="users" size={18}/><span>Profile</span></Link>
        <Link to="/student/dashboard" state={{ tab: "messages" }} className="sp-nav-item" id="sp-nav-messages"><Icon name="message" size={18}/><span>Messages</span></Link>
      </nav>
      <div className="sp-sidebar-footer">
        <button className="sp-nav-item sp-logout" onClick={onLogout} id="btn-profile-logout"><Icon name="logout" size={18}/><span>Log out</span></button>
      </div>
    </aside>
  );
}

/* ─── TABS ──────────────────────────────────────────────────────────── */
const TABS = ["Overview", "Experience", "Projects", "Certifications", "Activity"];

export default function StudentProfile() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");

  // ── Real profile data, loaded from the backend. Education/Experience/
  // Certifications/Activity below still fall back to the static mock —
  // there's no backend model for those yet, so those tabs aren't editable. ──
  const [real, setReal] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(profileData.bio);
  const [savingBio, setSavingBio] = useState(false);

  const [editingSkills, setEditingSkills] = useState(false);
  const [skillsList, setSkillsList] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  const [editingDetails, setEditingDetails] = useState(false);
  const [detailsForm, setDetailsForm] = useState({ firstName: "", lastName: "", location: "", portfolioUrl: "", linkedinUrl: "", githubUrl: "", openTo: [] });
  const [newOpenTo, setNewOpenTo] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  const [addingProject, setAddingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: "", organization: "", description: "", link: "" });
  const [savingProject, setSavingProject] = useState(false);

  const [addingExperience, setAddingExperience] = useState(false);
  const [experienceForm, setExperienceForm] = useState({ company: "", role: "", period: "", type: "", desc: "", tags: "" });
  const [savingExperience, setSavingExperience] = useState(false);

  const [addingCert, setAddingCert] = useState(false);
  const [certForm, setCertForm] = useState({ name: "", issuer: "", date: "" });
  const [savingCert, setSavingCert] = useState(false);

  const [addingEducation, setAddingEducation] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [educationForm, setEducationForm] = useState({ institution: "", degree: "", period: "", gpa: "", courses: "" });
  const [savingEducation, setSavingEducation] = useState(false);

  useEffect(() => {
    if (!auth?.user?.id) return;
    fetchStudentPublicProfile(auth.user.id, auth.token)
      .then((data) => {
        setReal(data);
        setBio(data.bio || "");
        setSkillsList(data.skills || []);
        setDetailsForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          location: data.location || "",
          portfolioUrl: data.portfolioUrl || "",
          linkedinUrl: data.linkedinUrl || "",
          githubUrl: data.githubUrl || "",
          openTo: data.openTo || [],
        });
      })
      .catch((err) => console.error("Failed to load profile", err))
      .finally(() => setLoadingProfile(false));
  }, [auth?.user?.id, auth?.token]);

  // Real fetched data wins over the static mock; auth carries name/avatar.
  const p = { ...profileData, ...(auth?.user || {}), ...(real || {}) };
  const contributions = real?.contributions || [];
  const experienceList = real?.experience || [];
  const certificationsList = real?.certifications || [];
  const educationList = real?.education || [];

  async function saveBio() {
    setSavingBio(true);
    try {
      await updateStudentProfile({ bio }, auth.token);
      setReal((prev) => (prev ? { ...prev, bio } : prev));
      setEditingBio(false);
    } catch (err) {
      console.error("Failed to save bio", err);
    } finally {
      setSavingBio(false);
    }
  }

  async function saveSkills(nextSkills) {
    setSkillsList(nextSkills);
    try {
      await updateStudentProfile({ skills: nextSkills.join(", ") }, auth.token);
      setReal((prev) => (prev ? { ...prev, skills: nextSkills } : prev));
    } catch (err) {
      console.error("Failed to save skills", err);
    }
  }

  function addSkill() {
    const s = newSkill.trim();
    if (!s || skillsList.includes(s)) { setNewSkill(""); return; }
    saveSkills([...skillsList, s]);
    setNewSkill("");
  }

  function removeSkill(skill) {
    saveSkills(skillsList.filter((s) => s !== skill));
  }

  async function saveDetails() {
    setSavingDetails(true);
    try {
      await updateStudentProfile(
        { ...detailsForm, openTo: detailsForm.openTo.join(", ") },
        auth.token
      );
      setReal((prev) => (prev ? { ...prev, ...detailsForm } : prev));
      setEditingDetails(false);
    } catch (err) {
      console.error("Failed to save profile details", err);
    } finally {
      setSavingDetails(false);
    }
  }

  function addOpenTo() {
    const t = newOpenTo.trim();
    if (!t || detailsForm.openTo.includes(t)) { setNewOpenTo(""); return; }
    setDetailsForm({ ...detailsForm, openTo: [...detailsForm.openTo, t] });
    setNewOpenTo("");
  }

  function removeOpenTo(tag) {
    setDetailsForm({ ...detailsForm, openTo: detailsForm.openTo.filter((t) => t !== tag) });
  }

  async function submitProject(e) {
    e.preventDefault();
    if (!projectForm.title.trim() || !projectForm.link.trim()) return;
    setSavingProject(true);
    try {
      const res = await addContribution(projectForm, auth.token);
      setReal((prev) =>
        prev ? { ...prev, contributions: [res.contribution, ...(prev.contributions || [])] } : prev
      );
      setProjectForm({ title: "", organization: "", description: "", link: "" });
      setAddingProject(false);
    } catch (err) {
      console.error("Failed to add project", err);
    } finally {
      setSavingProject(false);
    }
  }

  async function removeProject(id) {
    try {
      await deleteContribution(id, auth.token);
      setReal((prev) =>
        prev ? { ...prev, contributions: (prev.contributions || []).filter((c) => c.id !== id) } : prev
      );
    } catch (err) {
      console.error("Failed to delete project", err);
    }
  }

  async function submitExperience(e) {
    e.preventDefault();
    if (!experienceForm.company.trim() || !experienceForm.role.trim()) return;
    setSavingExperience(true);
    try {
      const res = await addExperience(experienceForm, auth.token);
      setReal((prev) =>
        prev ? { ...prev, experience: [res.experience, ...(prev.experience || [])] } : prev
      );
      setExperienceForm({ company: "", role: "", period: "", type: "", desc: "", tags: "" });
      setAddingExperience(false);
    } catch (err) {
      console.error("Failed to add experience", err);
    } finally {
      setSavingExperience(false);
    }
  }

  async function removeExperience(id) {
    try {
      await deleteExperience(id, auth.token);
      setReal((prev) =>
        prev ? { ...prev, experience: (prev.experience || []).filter((e) => e.id !== id) } : prev
      );
    } catch (err) {
      console.error("Failed to delete experience", err);
    }
  }

  async function submitCert(e) {
    e.preventDefault();
    if (!certForm.name.trim()) return;
    setSavingCert(true);
    try {
      const res = await addCertification(certForm, auth.token);
      setReal((prev) =>
        prev ? { ...prev, certifications: [res.certification, ...(prev.certifications || [])] } : prev
      );
      setCertForm({ name: "", issuer: "", date: "" });
      setAddingCert(false);
    } catch (err) {
      console.error("Failed to add certification", err);
    } finally {
      setSavingCert(false);
    }
  }

  async function removeCert(id) {
    try {
      await deleteCertification(id, auth.token);
      setReal((prev) =>
        prev ? { ...prev, certifications: (prev.certifications || []).filter((c) => c.id !== id) } : prev
      );
    } catch (err) {
      console.error("Failed to delete certification", err);
    }
  }

  function openAddEducation() {
    setEditingEducationId(null);
    setEducationForm({ institution: "", degree: "", period: "", gpa: "", courses: "" });
    setAddingEducation(true);
  }

  function openEditEducation(edu) {
    setEditingEducationId(edu.id);
    setEducationForm({
      institution: edu.institution || "",
      degree: edu.degree || "",
      period: edu.period || "",
      gpa: edu.gpa || "",
      courses: (edu.courses || []).join(", "),
    });
    setAddingEducation(true);
  }

  async function submitEducation(e) {
    e.preventDefault();
    if (!educationForm.institution.trim()) return;
    setSavingEducation(true);
    try {
      if (editingEducationId) {
        const res = await updateEducation(editingEducationId, educationForm, auth.token);
        setReal((prev) =>
          prev
            ? { ...prev, education: (prev.education || []).map((ed) => (ed.id === editingEducationId ? res.education : ed)) }
            : prev
        );
      } else {
        const res = await addEducation(educationForm, auth.token);
        setReal((prev) =>
          prev ? { ...prev, education: [res.education, ...(prev.education || [])] } : prev
        );
      }
      setEducationForm({ institution: "", degree: "", period: "", gpa: "", courses: "" });
      setEditingEducationId(null);
      setAddingEducation(false);
    } catch (err) {
      console.error("Failed to save education", err);
    } finally {
      setSavingEducation(false);
    }
  }

  async function removeEducation(id) {
    try {
      await deleteEducation(id, auth.token);
      setReal((prev) =>
        prev ? { ...prev, education: (prev.education || []).filter((ed) => ed.id !== id) } : prev
      );
    } catch (err) {
      console.error("Failed to delete education", err);
    }
  }

  function handleLogout() { logout(); navigate("/login/student"); }

  return (
    <div className="sp-wrapper">
      <ProfileSidebar onLogout={handleLogout} />

      <div className="sp-main">
        {/* ── sticky header ── */}
        <header className="sp-header">
          <Link to="/student/dashboard" className="sp-back-btn" id="btn-back-to-dashboard">
            <Icon name="arrow" size={18} /> Back to Dashboard
          </Link>
          <button className="sp-edit-profile-btn" id="btn-edit-profile" onClick={() => setEditingDetails(true)}>
            <Icon name="edit" size={16} /> Edit Profile
          </button>
        </header>

        {/* ── Profile Hero Card ── */}
        <div className="sp-hero-card" id="profile-hero-card">
          {/* Banner */}
          <div className="sp-banner" />

          <div className="sp-hero-body">
            {/* Avatar */}
            <div className="sp-hero-avatar-wrap">
              <div className="sp-hero-avatar" style={{ background: `linear-gradient(135deg, ${p.avatarColor}, #101d33)` }}>
                {p.initials || "AR"}
              </div>
              <span className="sp-online-dot" title="Open to opportunities" />
            </div>

            {/* Name & meta */}
            <div className="sp-hero-info">
              <div className="sp-hero-name-row">
                <h1 className="sp-hero-name">{p.firstName} {p.lastName}</h1>
                <span className="sp-open-badge">Open to work <span className="sp-status-dot" /></span>
              </div>
              <p className="sp-hero-role">{p.major} Student · {p.university}</p>
              <div className="sp-hero-meta-row">
                <span className="sp-hero-meta"><Icon name="graduationcap" size={15}/> Year {p.year}</span>
                {p.location && <span className="sp-hero-meta"><Icon name="mappin" size={15}/> {p.location}</span>}
                {p.portfolioUrl && <a href={p.portfolioUrl.startsWith("http") ? p.portfolioUrl : `https://${p.portfolioUrl}`} target="_blank" rel="noreferrer" className="sp-hero-meta sp-link"><Icon name="globe" size={15}/> {p.portfolioUrl}</a>}
                {p.linkedinUrl && <a href={p.linkedinUrl.startsWith("http") ? p.linkedinUrl : `https://${p.linkedinUrl}`} target="_blank" rel="noreferrer" className="sp-hero-meta sp-link"><Icon name="linkedin" size={15}/> LinkedIn</a>}
                {p.githubUrl && <a href={p.githubUrl.startsWith("http") ? p.githubUrl : `https://${p.githubUrl}`} target="_blank" rel="noreferrer" className="sp-hero-meta sp-link"><Icon name="github" size={15}/> GitHub</a>}
                {!loadingProfile && !p.location && !p.portfolioUrl && !p.linkedinUrl && !p.githubUrl && (
                  <button className="sp-hero-meta sp-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} onClick={() => setEditingDetails(true)}>
                    + Add location &amp; links
                  </button>
                )}
              </div>
              {/* Open to tags */}
              <div className="sp-open-tags">
                {(real?.openTo || []).map((t) => (
                  <span className="sp-open-tag" key={t}>{t}</span>
                ))}
                {real && real.openTo?.length === 0 && (
                  <button className="sp-add-chip" onClick={() => setEditingDetails(true)}><Icon name="plus" size={13}/> Add availability</button>
                )}
              </div>
            </div>

            {/* Hero stats */}
            <div className="sp-hero-stats">
              <div className="sp-hero-stat"><span className="sp-hstat-val">{loadingProfile ? "—" : `${p.profileComplete ?? 0}%`}</span><span className="sp-hstat-lbl">Profile</span></div>
              <div className="sp-hero-stat"><span className="sp-hstat-val">{loadingProfile ? "—" : (p.profileViews ?? 0)}</span><span className="sp-hstat-lbl">Views</span></div>
              <div className="sp-hero-stat"><span className="sp-hstat-val">{loadingProfile ? "—" : (p.applicationsCount ?? 0)}</span><span className="sp-hstat-lbl">Applications</span></div>
              <div className="sp-hero-stat"><span className="sp-hstat-val">{loadingProfile ? "—" : contributions.length}</span><span className="sp-hstat-lbl">Projects</span></div>
            </div>
          </div>

          {/* Profile strength bar */}
          <div className="sp-hero-progress-wrap">
            <div className="sp-hero-progress-label">
              <span>Profile Strength</span>
              <span className="sp-hero-progress-pct">{p.profileComplete ?? 0}%</span>
            </div>
            <div className="sp-hero-progress-bar">
              <div className="sp-hero-progress-fill" style={{ width: `${p.profileComplete ?? 0}%` }} />
            </div>
            <p className="sp-hero-progress-tip">Add a portfolio link and a few skills to complete your profile.</p>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="sp-tabs" id="profile-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              id={`tab-${tab.toLowerCase()}`}
              className={`sp-tab${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className="sp-tab-content">
          {/* ══ OVERVIEW ══ */}
          {activeTab === "Overview" && (
            <div className="sp-grid-2col">
              {/* Left */}
              <div className="sp-left-col">
                {/* About */}
                <section className="sp-section-card" id="section-about">
                  <div className="sp-section-head">
                    <h2 className="sp-section-title">About</h2>
                    <button className="sp-icon-edit" onClick={() => setEditingBio(!editingBio)} id="btn-edit-bio">
                      <Icon name="edit" size={15}/>
                    </button>
                  </div>
                  {editingBio ? (
                    <div>
                      <textarea className="sp-bio-textarea" value={bio} onChange={(e) => setBio(e.target.value)} rows={5} />
                      <button className="sp-save-btn" onClick={saveBio} disabled={savingBio}>{savingBio ? "Saving…" : "Save"}</button>
                    </div>
                  ) : (
                    <p className="sp-bio-text">{bio || "Add a short bio so startups know what you're about."}</p>
                  )}
                </section>

                {/* Skills Overview — real, editable tag list backed by the database */}
                <section className="sp-section-card" id="section-skills">
                  <div className="sp-section-head">
                    <h2 className="sp-section-title">Skills</h2>
                    <button className="sp-text-btn" onClick={() => setEditingSkills(!editingSkills)} id="btn-edit-skills"><Icon name="edit" size={15}/> {editingSkills ? "Done" : "Edit"}</button>
                  </div>
                  <div className="sp-skill-chips">
                    {skillsList.length === 0 && !editingSkills && (
                      <p className="sp-bio-text" style={{ margin: 0 }}>No skills added yet.</p>
                    )}
                    {skillsList.map((sk) => (
                      <span className="sp-skill-chip" key={sk} style={{ borderColor: "#1b2a4a", color: "#1b2a4a" }}>
                        {sk}
                        {editingSkills && (
                          <button
                            onClick={() => removeSkill(sk)}
                            style={{ marginLeft: 6, border: "none", background: "none", cursor: "pointer", color: "inherit", fontWeight: 700 }}
                            title={`Remove ${sk}`}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                    {editingSkills && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                          placeholder="Add a skill…"
                          style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid #e5e2da", fontSize: "0.85rem" }}
                        />
                        <button className="sp-add-chip" onClick={addSkill}><Icon name="plus" size={13}/> Add</button>
                      </span>
                    )}
                  </div>
                </section>

                {/* Education preview */}
                <section className="sp-section-card" id="section-education-preview">
                  <div className="sp-section-head">
                    <h2 className="sp-section-title">Education</h2>
                    <button className="sp-text-btn" id="btn-add-education" onClick={openAddEducation}><Icon name="plus" size={15}/> Add</button>
                  </div>

                  {addingEducation && (
                    <form onSubmit={submitEducation} style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16, padding: 16, background: "#faf9f6", borderRadius: 14 }}>
                      <input
                        value={educationForm.institution}
                        onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                        placeholder="Institution (e.g. Stanford University)"
                        style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                      />
                      <input
                        value={educationForm.degree}
                        onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                        placeholder="Degree (e.g. BSc Computer Science)"
                        style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                      />
                      <div style={{ display: "flex", gap: 10 }}>
                        <input
                          value={educationForm.period}
                          onChange={(e) => setEducationForm({ ...educationForm, period: e.target.value })}
                          placeholder="Period (e.g. 2022 – 2026)"
                          style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                        />
                        <input
                          value={educationForm.gpa}
                          onChange={(e) => setEducationForm({ ...educationForm, gpa: e.target.value })}
                          placeholder="GPA (optional)"
                          style={{ width: 140, padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                        />
                      </div>
                      <input
                        value={educationForm.courses}
                        onChange={(e) => setEducationForm({ ...educationForm, courses: e.target.value })}
                        placeholder="Courses, comma-separated (optional)"
                        style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                      />
                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <button type="button" className="sp-text-btn" onClick={() => { setAddingEducation(false); setEditingEducationId(null); }}>Cancel</button>
                        <button type="submit" className="sp-save-btn" disabled={savingEducation}>
                          {savingEducation ? "Saving…" : editingEducationId ? "Save changes" : "Add education"}
                        </button>
                      </div>
                    </form>
                  )}

                  {educationList.map((edu) => (
                    <div className="sp-edu-item" key={edu.id} style={{ cursor: "pointer" }} onClick={() => openEditEducation(edu)}>
                      <div className="sp-edu-icon"><Icon name="graduationcap" size={20}/></div>
                      <div className="sp-edu-details">
                        <p className="sp-edu-institution">{edu.institution}</p>
                        <p className="sp-edu-degree">{edu.degree}</p>
                        <p className="sp-edu-period">{edu.period}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</p>
                        {edu.courses.length > 0 && (
                          <div className="sp-edu-courses">
                            {edu.courses.map((c) => <span className="sp-edu-course" key={c}>{c}</span>)}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeEducation(edu.id); }}
                        title="Remove"
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", fontWeight: 700, fontSize: "1.1rem" }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {educationList.length === 0 && !addingEducation && (
                    <p style={{ color: "var(--sp-muted)", fontSize: "0.9rem" }}>No education added yet.</p>
                  )}
                </section>
              </div>

              {/* Right */}
              <div className="sp-right-col">
                {/* Availability */}
                <section className="sp-section-card sp-availability-card" id="section-availability">
                  <h2 className="sp-section-title" style={{ marginBottom: 16 }}>Availability</h2>
                  <div className="sp-avail-list">
                    {(real?.openTo || []).map((item) => (
                      <div className="sp-avail-item" key={item}>
                        <span className="sp-avail-check"><Icon name="check" size={14}/></span>
                        <span>{item}</span>
                      </div>
                    ))}
                    {real && real.openTo?.length === 0 && (
                      <button className="sp-text-btn" onClick={() => setEditingDetails(true)}>+ Add what you're open to</button>
                    )}
                  </div>
                </section>

                {/* Certifications snapshot */}
                <section className="sp-section-card" id="section-certs-preview">
                  <div className="sp-section-head">
                    <h2 className="sp-section-title">Certifications</h2>
                    <button className="sp-text-btn" onClick={() => setActiveTab("Certifications")} id="btn-view-all-certs">View all</button>
                  </div>
                  {certificationsList.length === 0 && (
                    <p className="sp-bio-text" style={{ margin: 0 }}>No certifications added yet.</p>
                  )}
                  {certificationsList.slice(0, 3).map((c) => (
                    <div className="sp-cert-item" key={c.id}>
                      <span className="sp-cert-badge"><FiAward /></span>
                      <div>
                        <p className="sp-cert-name">{c.name}</p>
                        <p className="sp-cert-issuer">{c.issuer} · {c.date}</p>
                      </div>
                    </div>
                  ))}
                </section>

                {/* Recent Activity snapshot */}
                <section className="sp-section-card" id="section-activity-preview">
                  <div className="sp-section-head">
                    <h2 className="sp-section-title">Recent Activity</h2>
                    <button className="sp-text-btn" onClick={() => setActiveTab("Activity")} id="btn-view-all-activity">View all</button>
                  </div>
                  {profileData.activity.slice(0, 3).map((a) => (
                    <div className="sp-activity-item" key={a.id}>
                      <span className="sp-activity-icon"><a.icon /></span>
                      <div>
                        <p className="sp-activity-text">{a.text}</p>
                        <p className="sp-activity-time">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            </div>
          )}

          {/* ══ EXPERIENCE ══ */}
          {activeTab === "Experience" && (
            <div className="sp-single-col">
              <div className="sp-section-head" style={{ marginBottom: 24 }}>
                <h2 className="sp-section-title">Work Experience</h2>
                <button className="sp-add-btn" onClick={() => setAddingExperience(!addingExperience)} id="btn-add-experience">
                  <Icon name="plus" size={15}/> {addingExperience ? "Cancel" : "Add Experience"}
                </button>
              </div>

              {addingExperience && (
                <form onSubmit={submitExperience} className="sp-section-card" style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    placeholder="Company *"
                    value={experienceForm.company}
                    onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                    required
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                  <input
                    placeholder="Role *"
                    value={experienceForm.role}
                    onChange={(e) => setExperienceForm({ ...experienceForm, role: e.target.value })}
                    required
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                  <input
                    placeholder="Period (e.g. Jun 2025 – Sep 2025)"
                    value={experienceForm.period}
                    onChange={(e) => setExperienceForm({ ...experienceForm, period: e.target.value })}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                  <input
                    placeholder="Type (e.g. Part-time · Remote)"
                    value={experienceForm.type}
                    onChange={(e) => setExperienceForm({ ...experienceForm, type: e.target.value })}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                  <textarea
                    placeholder="Short description"
                    rows={3}
                    value={experienceForm.desc}
                    onChange={(e) => setExperienceForm({ ...experienceForm, desc: e.target.value })}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da", fontFamily: "inherit" }}
                  />
                  <input
                    placeholder="Tags, comma-separated (e.g. React, TypeScript)"
                    value={experienceForm.tags}
                    onChange={(e) => setExperienceForm({ ...experienceForm, tags: e.target.value })}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                  <button className="sp-save-btn" type="submit" disabled={savingExperience} style={{ alignSelf: "flex-start" }}>
                    {savingExperience ? "Saving…" : "Save experience"}
                  </button>
                </form>
              )}

              {experienceList.length === 0 && !addingExperience && (
                <p className="sp-bio-text">No work experience added yet — click "Add Experience" to show startups your background.</p>
              )}

              {experienceList.map((exp) => (
                <div className="sp-section-card sp-exp-card" key={exp.id} id={`exp-${exp.id}`}>
                  <div className="sp-exp-top">
                    <div className="sp-exp-logo" style={{ background: exp.logoColor }}>{exp.initials}</div>
                    <div className="sp-exp-info">
                      <h3 className="sp-exp-role">{exp.role}</h3>
                      <p className="sp-exp-company">{exp.company}</p>
                      <p className="sp-exp-period"><Icon name="calendar" size={13}/> {exp.period} · {exp.type}</p>
                    </div>
                    <button
                      className="sp-icon-edit"
                      id={`btn-delete-exp-${exp.id}`}
                      onClick={() => removeExperience(exp.id)}
                      title="Remove experience"
                    >
                      ×
                    </button>
                  </div>
                  {exp.desc && <p className="sp-exp-desc">{exp.desc}</p>}
                  {exp.tags.length > 0 && (
                    <div className="sp-exp-tags">
                      {exp.tags.map((t) => <span className="sp-exp-tag" key={t}>{t}</span>)}
                    </div>
                  )}
                </div>
              ))}

              {/* Education */}
              <div className="sp-section-head" style={{ marginTop: 36, marginBottom: 24 }}>
                <h2 className="sp-section-title">Education</h2>
                <button className="sp-add-btn" onClick={() => (addingEducation ? (setAddingEducation(false), setEditingEducationId(null)) : openAddEducation())} id="btn-add-edu">
                  <Icon name="plus" size={15}/> {addingEducation ? "Cancel" : "Add Education"}
                </button>
              </div>

              {addingEducation && (
                <form onSubmit={submitEducation} className="sp-section-card" style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    placeholder="Institution *"
                    value={educationForm.institution}
                    onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                    required
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                  <input
                    placeholder="Degree (e.g. BSc Computer Science)"
                    value={educationForm.degree}
                    onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      placeholder="Period (e.g. 2022 – 2026)"
                      value={educationForm.period}
                      onChange={(e) => setEducationForm({ ...educationForm, period: e.target.value })}
                      style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                    />
                    <input
                      placeholder="GPA (optional)"
                      value={educationForm.gpa}
                      onChange={(e) => setEducationForm({ ...educationForm, gpa: e.target.value })}
                      style={{ width: 160, padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                    />
                  </div>
                  <input
                    placeholder="Courses, comma-separated (optional)"
                    value={educationForm.courses}
                    onChange={(e) => setEducationForm({ ...educationForm, courses: e.target.value })}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                  <button className="sp-save-btn" type="submit" disabled={savingEducation} style={{ alignSelf: "flex-start" }}>
                    {savingEducation ? "Saving…" : editingEducationId ? "Save changes" : "Save education"}
                  </button>
                </form>
              )}

              {educationList.length === 0 && !addingEducation && (
                <p className="sp-bio-text">No education added yet — click "Add Education" to add your school or degree.</p>
              )}

              {educationList.map((edu) => (
                <div className="sp-section-card" key={edu.id} id={`edu-${edu.id}`}>
                  <div className="sp-exp-top">
                    <div className="sp-edu-logo"><Icon name="graduationcap" size={24}/></div>
                    <div className="sp-exp-info">
                      <h3 className="sp-exp-role">{edu.degree}</h3>
                      <p className="sp-exp-company">{edu.institution}</p>
                      <p className="sp-exp-period"><Icon name="calendar" size={13}/> {edu.period}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</p>
                    </div>
                    <button className="sp-icon-edit" id={`btn-edit-edu-${edu.id}`} onClick={() => openEditEducation(edu)} title="Edit">
                      <Icon name="edit" size={15}/>
                    </button>
                    <button
                      className="sp-icon-edit"
                      id={`btn-delete-edu-${edu.id}`}
                      onClick={() => removeEducation(edu.id)}
                      title="Remove"
                      style={{ marginLeft: 4 }}
                    >
                      ×
                    </button>
                  </div>
                  {edu.courses.length > 0 && (
                    <div className="sp-exp-tags" style={{ marginTop: 12 }}>
                      {edu.courses.map((c) => <span className="sp-exp-tag" key={c}>{c}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ══ PROJECTS ══ */}
          {activeTab === "Projects" && (
            <div className="sp-single-col">
              <div className="sp-section-head" style={{ marginBottom: 24 }}>
                <h2 className="sp-section-title">Projects</h2>
                <button className="sp-add-btn" onClick={() => setAddingProject(!addingProject)} id="btn-add-project">
                  <Icon name="plus" size={15}/> {addingProject ? "Cancel" : "Add Project"}
                </button>
              </div>

              {addingProject && (
                <form onSubmit={submitProject} className="sp-section-card" style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    placeholder="Project title *"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    required
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                  <input
                    placeholder="Organization (optional — e.g. built for a startup, or personal project)"
                    value={projectForm.organization}
                    onChange={(e) => setProjectForm({ ...projectForm, organization: e.target.value })}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                  <textarea
                    placeholder="Short description"
                    rows={3}
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da", fontFamily: "inherit" }}
                  />
                  <input
                    placeholder="Link (GitHub, live site, etc.) *"
                    value={projectForm.link}
                    onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                    required
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                  <button className="sp-save-btn" type="submit" disabled={savingProject} style={{ alignSelf: "flex-start" }}>
                    {savingProject ? "Saving…" : "Save project"}
                  </button>
                </form>
              )}

              {contributions.length === 0 && !addingProject && (
                <p className="sp-bio-text">No projects added yet — click "Add Project" to show startups what you've built.</p>
              )}

              <div className="sp-projects-grid">
                {contributions.map((proj) => (
                  <div className="sp-project-card" key={proj.id} id={`proj-${proj.id}`}>
                    <div className="sp-proj-top">
                      <div className="sp-proj-icon"><Icon name="code" size={22}/></div>
                      <button
                        onClick={() => removeProject(proj.id)}
                        title="Remove project"
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", fontSize: "1.1rem", lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                    <h3 className="sp-proj-title">{proj.title}</h3>
                    {proj.organization && <p className="sp-proj-desc" style={{ fontWeight: 600, marginBottom: 2 }}>{proj.organization}</p>}
                    <p className="sp-proj-desc">{proj.description}</p>
                    <a href={proj.link} target="_blank" rel="noreferrer" className="sp-proj-link" id={`btn-view-proj-${proj.id}`}>View project <FiArrowRight style={{ verticalAlign: "middle" }} /></a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ CERTIFICATIONS ══ */}
          {activeTab === "Certifications" && (
            <div className="sp-single-col">
              <div className="sp-section-head" style={{ marginBottom: 24 }}>
                <h2 className="sp-section-title">Certifications & Awards</h2>
                <button className="sp-add-btn" onClick={() => setAddingCert(!addingCert)} id="btn-add-cert">
                  <Icon name="plus" size={15}/> {addingCert ? "Cancel" : "Add Certificate"}
                </button>
              </div>

              {addingCert && (
                <form onSubmit={submitCert} className="sp-section-card" style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    placeholder="Certificate name *"
                    value={certForm.name}
                    onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                    required
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                  <input
                    placeholder="Issuer (e.g. Amazon Web Services)"
                    value={certForm.issuer}
                    onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                  <input
                    placeholder="Date issued (e.g. Mar 2025)"
                    value={certForm.date}
                    onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                  <button className="sp-save-btn" type="submit" disabled={savingCert} style={{ alignSelf: "flex-start" }}>
                    {savingCert ? "Saving…" : "Save certificate"}
                  </button>
                </form>
              )}

              {certificationsList.length === 0 && !addingCert && (
                <p className="sp-bio-text">No certifications added yet — click "Add Certificate" to showcase your credentials.</p>
              )}

              <div className="sp-certs-grid">
                {certificationsList.map((c) => (
                  <div className="sp-section-card sp-cert-card" key={c.id} id={`cert-${c.id}`}>
                    <div className="sp-cert-card-top">
                      <div className="sp-cert-card-badge"><FiAward /></div>
                      <button
                        className="sp-icon-edit"
                        id={`btn-delete-cert-${c.id}`}
                        onClick={() => removeCert(c.id)}
                        title="Remove certificate"
                      >
                        ×
                      </button>
                    </div>
                    <h3 className="sp-cert-card-name">{c.name}</h3>
                    <p className="sp-cert-card-issuer">{c.issuer}</p>
                    <p className="sp-cert-card-date"><Icon name="calendar" size={13}/> Issued {c.date}</p>
                    <div className="sp-cert-card-verify">
                      <span><Icon name="check" size={13}/> Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ ACTIVITY ══ */}
          {activeTab === "Activity" && (
            <div className="sp-single-col">
              <div className="sp-section-head" style={{ marginBottom: 24 }}>
                <h2 className="sp-section-title">Recent Activity</h2>
              </div>
              <div className="sp-section-card">
                {profileData.activity.map((a, i) => (
                  <div className={`sp-act-row${i < profileData.activity.length - 1 ? " bordered" : ""}`} key={a.id} id={`activity-${a.id}`}>
                    <span className="sp-act-emoji"><a.icon /></span>
                    <div className="sp-act-info">
                      <p className="sp-act-text">{a.text}</p>
                      <p className="sp-act-time">{a.time}</p>
                    </div>
                    <span className={`sp-act-badge sp-act-${a.type}`}>{a.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── EDIT PROFILE MODAL — location, links, availability tags ── */}
      {editingDetails && (
        <div
          onClick={() => setEditingDetails(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(16,29,51,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto" }}
          >
            <h2 className="sp-section-title" style={{ marginBottom: 20 }}>Edit Profile</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", flex: 1 }}>
                  First name
                  <input
                    value={detailsForm.firstName}
                    onChange={(e) => setDetailsForm({ ...detailsForm, firstName: e.target.value })}
                    placeholder="Alex"
                    style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                </label>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", flex: 1 }}>
                  Last name
                  <input
                    value={detailsForm.lastName}
                    onChange={(e) => setDetailsForm({ ...detailsForm, lastName: e.target.value })}
                    placeholder="Rivera"
                    style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                </label>
              </div>

              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                Location
                <input
                  value={detailsForm.location}
                  onChange={(e) => setDetailsForm({ ...detailsForm, location: e.target.value })}
                  placeholder="San Francisco, CA"
                  style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                />
              </label>

              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                Portfolio / website
                <input
                  value={detailsForm.portfolioUrl}
                  onChange={(e) => setDetailsForm({ ...detailsForm, portfolioUrl: e.target.value })}
                  placeholder="yourname.dev"
                  style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                />
              </label>

              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                LinkedIn
                <input
                  value={detailsForm.linkedinUrl}
                  onChange={(e) => setDetailsForm({ ...detailsForm, linkedinUrl: e.target.value })}
                  placeholder="linkedin.com/in/yourname"
                  style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                />
              </label>

              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                GitHub
                <input
                  value={detailsForm.githubUrl}
                  onChange={(e) => setDetailsForm({ ...detailsForm, githubUrl: e.target.value })}
                  placeholder="github.com/yourname"
                  style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                />
              </label>

              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>Open to</p>
                <div className="sp-open-tags" style={{ marginBottom: 8 }}>
                  {detailsForm.openTo.map((t) => (
                    <span className="sp-open-tag" key={t}>
                      {t}
                      <button
                        onClick={() => removeOpenTo(t)}
                        style={{ marginLeft: 6, border: "none", background: "none", cursor: "pointer", color: "inherit", fontWeight: 700 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={newOpenTo}
                    onChange={(e) => setNewOpenTo(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOpenTo(); } }}
                    placeholder="e.g. Full-time Internship"
                    style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e2da" }}
                  />
                  <button className="sp-add-chip" type="button" onClick={addOpenTo}><Icon name="plus" size={13}/> Add</button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button className="sp-text-btn" onClick={() => setEditingDetails(false)}>Cancel</button>
              <button className="sp-save-btn" onClick={saveDetails} disabled={savingDetails}>
                {savingDetails ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
