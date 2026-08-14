import axios from "axios";

const API_BASE = "http://localhost:8000";
const STORAGE_KEY = "stalent_auth";

function storedToken() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw)?.token : null;
  } catch {
    return null;
  }
}

function authHeaders(token) {
  const t = token || storedToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/* ─── Auth ─────────────────────────────────────────────────────────────── */

export async function signupStudent({ role, email, password, studentName, university }) {
  const res = await axios.post(`${API_BASE}/api/auth/signup/`, {
    role, email, password, studentName, university,
  });
  return res.data;
}

export async function loginStudent(email, password) {
  const res = await axios.post(`${API_BASE}/api/auth/login/`, { email, password });
  return res.data; // { token, user }
}

/* ─── Dashboard ────────────────────────────────────────────────────────── */

export async function fetchStudentDashboard(token) {
  const res = await axios.get(`${API_BASE}/api/student/dashboard/`, {
    headers: authHeaders(token),
  });
  return res.data; // { profile, welcome, quickStats, opportunities, recentActivity, filters }
}

// There's no dedicated backend filter/search endpoint — the dashboard
// returns the full opportunity list in one shot, so we filter it client-side.
export async function fetchOpportunities(filter, token) {
  const dashboard = await fetchStudentDashboard(token);
  if (!filter || filter === "All") return dashboard.opportunities;
  return dashboard.opportunities.filter((o) => o.filters.includes(filter));
}

export async function searchDashboard(query, token) {
  const dashboard = await fetchStudentDashboard(token);
  const q = query.toLowerCase();
  return dashboard.opportunities.filter(
    (o) =>
      o.title.toLowerCase().includes(q) ||
      o.company.toLowerCase().includes(q) ||
      o.tags.some((t) => t.toLowerCase().includes(q))
  );
}

// Bookmarks are now persisted server-side (Student.bookmarks M2M).
export async function toggleOpportunityBookmark(opportunityId, token) {
  const res = await axios.post(
    `${API_BASE}/api/student/opportunities/${opportunityId}/bookmark/`,
    {},
    { headers: authHeaders(token) }
  );
  return res.data; // { success, bookmarked }
}

export async function connectWithStudent(opportunityId, token) {
  const res = await axios.post(
    `${API_BASE}/api/student/apply/`,
    { opportunityId },
    { headers: authHeaders(token) }
  );
  return res.data;
}

/* ─── Browse all companies ───────────────────────────────────────────────
   Every registered startup, even ones that haven't posted an opportunity
   yet — so a brand-new company is still visible to students right away. */

export async function fetchStartupList(token) {
  const res = await axios.get(`${API_BASE}/api/student/startups/`, {
    headers: authHeaders(token),
  });
  return res.data; // { startups: [...] }
}

// Save/un-save ("bookmark") a company — the company then shows up under
// the student's Saved tab, persisted server-side (Student.bookmarked_startups).
export async function toggleStartupBookmark(startupId, token) {
  const res = await axios.post(
    `${API_BASE}/api/student/startups/${startupId}/bookmark/`,
    {},
    { headers: authHeaders(token) }
  );
  return res.data; // { success, bookmarked }
}

// Apply directly to a company with no specific opportunity selected — shows
// up in the startup's Candidates list, and in the student's own
// Opportunities feed, just like a normal application.
export async function applyToCompany(startupId, token) {
  const res = await axios.post(
    `${API_BASE}/api/student/apply-company/`,
    { startupId },
    { headers: authHeaders(token) }
  );
  return res.data; // { success, applied }
}

/* ─── Conversations ─────────────────────────────────────────────────────
   Every startup this student can message (from applications + invitations),
   used to power a real conversation list instead of one hardcoded partner. */

/* ─── Students like you / Team up ────────────────────────────────────────
   Browse every other student, and send/accept peer team-up requests —
   independent of any startup, surfaced afterwards on the startup's
   Candidates page under "Team Up Students". */

export async function fetchPeerStudents(token) {
  const res = await axios.get(`${API_BASE}/api/student/peers/`, {
    headers: authHeaders(token),
  });
  return res.data; // { students: [...] }
}

export async function sendTeamUpRequest(studentId, token) {
  const res = await axios.post(
    `${API_BASE}/api/student/teamup/request/`,
    { studentId },
    { headers: authHeaders(token) }
  );
  return res.data; // { success, status, teamUpId }
}

export async function respondTeamUpRequest(teamUpId, response, token) {
  const res = await axios.post(
    `${API_BASE}/api/student/teamup/respond/`,
    { teamUpId, response },
    { headers: authHeaders(token) }
  );
  return res.data; // { success, status }
}

export async function fetchConversations(token) {
  const res = await axios.get(`${API_BASE}/api/student/conversations/`, {
    headers: authHeaders(token),
  });
  return res.data; // { companies: [...], students: [...] }
}

/* ─── Messaging ────────────────────────────────────────────────────────── */

export async function getStudentChatHistory(chatWithName, token) {
  const res = await axios.get(`${API_BASE}/api/messages/`, {
    params: { chat_with: chatWithName },
    headers: authHeaders(token),
  });
  return res.data.messages;
}

export async function sendStudentChatMessage(chatWithName, text, token) {
  const res = await axios.post(
    `${API_BASE}/api/messages/send/`,
    { chat_with: chatWithName, text },
    { headers: authHeaders(token) }
  );
  return res.data;
}

/* ─── Notifications & invitations ───────────────────────────────────────
   Powers NotificationCenter.jsx (accept/decline a Solo, Group-Student-Led,
   or Group-Startup-Led invite). */

export async function fetchNotifications(token) {
  const res = await axios.get(`${API_BASE}/api/student/notifications/`, {
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

export async function respondToInvitation(token, invitationId, response) {
  const res = await axios.post(
    `${API_BASE}/api/student/invitations/${invitationId}/respond/`,
    { response },
    { headers: authHeaders(token) }
  );
  return res.data; // { success, newStatus }
}

/* ─── Group-Student-Led teammate recruiting ─────────────────────────────
   Once a student accepts a group_student_led invite, they need to be able
   to browse other students and invite them onto the team. */

export async function fetchTeammateCandidates(token) {
  // Same endpoint the startup invite picker uses — now open to students too.
  const res = await axios.get(`${API_BASE}/api/startup/students/`, {
    headers: authHeaders(token),
  });
  return res.data; // { students: [...] }
}

export async function inviteTeammate(token, invitationId, studentId) {
  const res = await axios.post(
    `${API_BASE}/api/student/invite-teammate/`,
    { invitationId, studentId },
    { headers: authHeaders(token) }
  );
  return res.data; // { success, invitationId }
}
