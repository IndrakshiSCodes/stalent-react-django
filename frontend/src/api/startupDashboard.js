import axios from "axios";

// The Django dev server (see myApp/middleware.py CORS config, which only
// allows http://localhost:5173 as the frontend origin).
const API_BASE = "http://localhost:8000";

const STORAGE_KEY = "stalent_auth";

/** Read the saved auth token from localStorage (set by AuthContext on login). */
function storedToken() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw)?.token : null;
  } catch {
    return null;
  }
}

/**
 * Build request headers. `token` can be passed explicitly (some callers,
 * like InviteModal, already have it from useAuth()) — otherwise we fall
 * back to whatever is in localStorage so the dashboard's own internal
 * calls (which don't have a token in scope) keep working.
 */
function authHeaders(token) {
  const t = token || storedToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/* ─── Auth ─────────────────────────────────────────────────────────────── */

export async function signupStartup({ role, email, password, companyName, companySize }) {
  const res = await axios.post(`${API_BASE}/api/auth/signup/`, {
    role, email, password, companyName, companySize,
  });
  return res.data;
}

export async function loginStartup(email, password) {
  const res = await axios.post(`${API_BASE}/api/auth/login/`, { email, password });
  return res.data; // { token, user }
}

/* ─── Dashboard ────────────────────────────────────────────────────────── */

export async function fetchStartupDashboard(token) {
  const res = await axios.get(`${API_BASE}/api/startup/dashboard/`, {
    headers: authHeaders(token),
  });
  return res.data; // { profile, applicants, engagements, opportunities, stats }
}

export async function updateApplicantStatus(applicantId, status, token) {
  const res = await axios.post(
    `${API_BASE}/api/startup/update-status/`,
    { applicantId, status },
    { headers: authHeaders(token) }
  );
  return res.data;
}

/**
 * Hire or Reject a candidate who doesn't have a real Application yet
 * (browsed straight from the merged Candidates list). "hire" sends an
 * invitation rather than hiring outright — the candidate stays Pending
 * until they accept it.
 */
export async function sendCandidateAction(studentId, action, token) {
  const res = await axios.post(
    `${API_BASE}/api/startup/candidate-action/`,
    { studentId, action },
    { headers: authHeaders(token) }
  );
  return res.data; // { success, status }
}

export async function addProject(details, token) {
  // `details` is an object: { title, description, location, type, duration, salary, tags }
  await axios.post(
    `${API_BASE}/api/startup/post-project/`,
    { role: details.title, ...details },
    { headers: authHeaders(token) }
  );
  // Backend only confirms success — pull the fresh engagements list so
  // callers (e.g. handlePostProject) can update local state directly.
  const dashboard = await fetchStartupDashboard(token);
  return dashboard.engagements;
}

export async function saveStartupSettings(settingsForm, token) {
  const res = await axios.post(
    `${API_BASE}/api/startup/save-settings/`,
    {
      name: settingsForm.name,
      tagline: settingsForm.tagline,
      location: settingsForm.location,
      website: settingsForm.website,
      employees: settingsForm.employees,
      founded: settingsForm.founded,
      industry: settingsForm.industry,
      logoColor: settingsForm.logoColor,
    },
    { headers: authHeaders(token) }
  );
  return res.data;
}

/* ─── Messaging ────────────────────────────────────────────────────────── */

export async function getStartupChatHistory(studentName, token) {
  const res = await axios.get(`${API_BASE}/api/messages/`, {
    params: { chat_with: studentName },
    headers: authHeaders(token),
  });
  return res.data.messages;
}

export async function sendStartupMessage(studentName, text, token) {
  const res = await axios.post(
    `${API_BASE}/api/messages/send/`,
    { chat_with: studentName, text },
    { headers: authHeaders(token) }
  );
  return res.data;
}

/* ─── Notifications ────────────────────────────────────────────────────── */

export async function fetchStartupNotifications(token) {
  const res = await axios.get(`${API_BASE}/api/startup/notifications/`, {
    headers: authHeaders(token),
  });
  return res.data; // { notifications, unreadCount }
}

export async function markNotificationsRead(token) {
  const res = await axios.post(
    `${API_BASE}/api/notifications/read/`,
    {},
    { headers: authHeaders(token) }
  );
  return res.data;
}

/* ─── Grouping / invitations ──────────────────────────────────────────────
   These power the Solo / Group-Student-Led / Group-Startup-Led hiring flow
   from InviteModal.jsx. */

export async function fetchStudentList(token) {
  const res = await axios.get(`${API_BASE}/api/startup/students/`, {
    headers: authHeaders(token),
  });
  return res.data; // { students: [...] }
}

/**
 * hiringMode: "solo" | "group_student_led" | "group_startup_led"
 * studentIds: for solo/group_student_led → [studentId]; for
 *             group_startup_led → up to 4 studentIds.
 */
export async function sendInvitations(token, opportunityId, studentIds, hiringMode) {
  const res = await axios.post(
    `${API_BASE}/api/startup/invite/`,
    { opportunityId, studentIds, hiringMode },
    { headers: authHeaders(token) }
  );
  return res.data; // { success, groupId }
}
