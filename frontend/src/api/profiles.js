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

/* ─── Public profiles ──────────────────────────────────────────────────
   Used both when a startup views a student's profile and when a student
   views a startup's profile — either party can hit either endpoint. */

export async function fetchStudentPublicProfile(studentId, token) {
  const res = await axios.get(`${API_BASE}/api/profile/student/${studentId}/`, {
    headers: authHeaders(token),
  });
  return res.data;
}

export async function fetchStartupPublicProfile(startupId, token) {
  const res = await axios.get(`${API_BASE}/api/profile/startup/${startupId}/`, {
    headers: authHeaders(token),
  });
  return res.data;
}

/* ─── Editing a student's own profile ───────────────────────────────────
   bio / skills / location / portfolioUrl / linkedinUrl / githubUrl / openTo.
   skills and openTo are sent as comma-separated strings (matches how the
   backend stores + parses them). */

export async function updateStudentProfile(fields, token) {
  const res = await axios.post(
    `${API_BASE}/api/student/update-profile/`,
    fields,
    { headers: authHeaders(token) }
  );
  return res.data; // { success }
}

/* ─── Managing a student's own "past contributions" list ───────────────
   Websites/projects a student built for other startups or on their own —
   shown on their public profile alongside GitHub / portfolio / LinkedIn. */

export async function addContribution({ title, link, organization, description }, token) {
  const res = await axios.post(
    `${API_BASE}/api/student/contributions/add/`,
    { title, link, organization, description },
    { headers: authHeaders(token) }
  );
  return res.data; // { success, contribution }
}

export async function deleteContribution(contributionId, token) {
  const res = await axios.post(
    `${API_BASE}/api/student/contributions/${contributionId}/delete/`,
    {},
    { headers: authHeaders(token) }
  );
  return res.data;
}

/* ─── Managing a student's own work experience list ─────────────────── */

export async function addExperience({ company, role, period, type, desc, tags }, token) {
  const res = await axios.post(
    `${API_BASE}/api/student/experience/add/`,
    { company, role, period, type, desc, tags },
    { headers: authHeaders(token) }
  );
  return res.data; // { success, experience }
}

export async function deleteExperience(experienceId, token) {
  const res = await axios.post(
    `${API_BASE}/api/student/experience/${experienceId}/delete/`,
    {},
    { headers: authHeaders(token) }
  );
  return res.data;
}

/* ─── Managing a student's own certifications list ──────────────────── */

export async function addCertification({ name, issuer, date }, token) {
  const res = await axios.post(
    `${API_BASE}/api/student/certifications/add/`,
    { name, issuer, date },
    { headers: authHeaders(token) }
  );
  return res.data; // { success, certification }
}

export async function deleteCertification(certificationId, token) {
  const res = await axios.post(
    `${API_BASE}/api/student/certifications/${certificationId}/delete/`,
    {},
    { headers: authHeaders(token) }
  );
  return res.data;
}

/* ─── Managing a student's own education list ───────────────────────── */

export async function addEducation({ institution, degree, period, gpa, courses }, token) {
  const res = await axios.post(
    `${API_BASE}/api/student/education/add/`,
    { institution, degree, period, gpa, courses },
    { headers: authHeaders(token) }
  );
  return res.data; // { success, education }
}

export async function updateEducation(educationId, { institution, degree, period, gpa, courses }, token) {
  const res = await axios.post(
    `${API_BASE}/api/student/education/${educationId}/update/`,
    { institution, degree, period, gpa, courses },
    { headers: authHeaders(token) }
  );
  return res.data; // { success, education }
}

export async function deleteEducation(educationId, token) {
  const res = await axios.post(
    `${API_BASE}/api/student/education/${educationId}/delete/`,
    {},
    { headers: authHeaders(token) }
  );
  return res.data;
}
