import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import { FaRocket, FaGraduationCap } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { signupStudent } from "../api/studentDashboard";
import { signupStartup } from "../api/startupDashboard";

function Signup() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "student" ? "student" : "startup";
  const [role, setRole] = useState(initialRole);
  const { loginStudent, loginStartup } = useAuth();
  const navigate = useNavigate();

  const isStudent = role === "student";

  const [studentName, setStudentName] = useState("");
  const [university, setUniversity] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [startupEmail, setStartupEmail] = useState("");
  const [companySize, setCompanySize] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (isStudent) {
        if (!studentName || !university || !studentEmail || !password) {
          throw new Error("Please fill in all student fields.");
        }
        await signupStudent({
          role: "student",
          email: studentEmail,
          password,
          studentName,
          university,
        });
        await loginStudent(studentEmail, password);
        navigate("/student/dashboard");
      } else {
        if (!companyName || !startupEmail || !companySize || !password) {
          throw new Error("Please fill in all startup fields.");
        }
        await signupStartup({
          role: "startup",
          email: startupEmail,
          password,
          companyName,
          companySize,
        });
        await loginStartup(startupEmail, password);
        navigate("/startup/dashboard");
      }
    } catch (err) {
      const serverError = err.response?.data?.error;
      setError(serverError || err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      role={role}
      title={isStudent ? "Start your student journey" : "Grow your startup team"}
      subtitle={
        isStudent
          ? "Create a free account to discover real projects, build your portfolio, and connect with ambitious startups."
          : "Create your company account to post projects, get matched with top student talent, and hire with confidence."
      }
      accentColor={isStudent ? "#10b981" : "#1b2a4a"}
    >
      <div className="auth-form">
        <h2>Create your account</h2>
        <p className="auth-subtitle">Join Stalent — it&apos;s free for students</p>

        <div className="signup-toggle">
          <button
            type="button"
            className={role === "startup" ? "active" : ""}
            onClick={() => setRole("startup")}
            disabled={loading}
          >
            <FaRocket /> Startup
          </button>
          <button
            type="button"
            className={role === "student" ? "active" : ""}
            onClick={() => setRole("student")}
            disabled={loading}
          >
            <FaGraduationCap /> Student
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "12px 16px",
              borderRadius: "10px",
              fontSize: "0.9rem",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isStudent ? (
            <>
              <div className="auth-field">
                <label htmlFor="full-name">Full name</label>
                <input
                  id="full-name"
                  type="text"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="university">University</label>
                <input
                  id="university"
                  type="text"
                  placeholder="Your university name"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="signup-student-email">University email</label>
                <input
                  id="signup-student-email"
                  type="email"
                  placeholder="you@university.edu"
                  autoComplete="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </>
          ) : (
            <>
              <div className="auth-field">
                <label htmlFor="company-name">Company name</label>
                <input
                  id="company-name"
                  type="text"
                  placeholder="Acme Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="signup-startup-email">Work email</label>
                <input
                  id="signup-startup-email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  value={startupEmail}
                  onChange={(e) => setStartupEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="company-size">Company size</label>
                <input
                  id="company-size"
                  type="text"
                  placeholder="e.g. 1–10 employees"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="auth-field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirm-password">Confirm password</label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`auth-submit ${isStudent ? "student" : "startup"}`}
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating Account…" : isStudent ? "Create Student Account" : "Create Startup Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to={isStudent ? "/login/student" : "/login/startup"}>
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Signup;