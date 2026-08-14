import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";

function StartupLogin() {
  const { loginStartup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/startup/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await loginStartup(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const serverError = err.response?.data?.error;
      setError(serverError || err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      role="startup"
      title="Welcome back, startup"
      subtitle="Sign in to post projects, review student matches, and manage your hiring pipeline."
      accentColor="#1b2a4a"
    >
      <div className="auth-form">
        <h2>Startup login</h2>
        <p className="auth-subtitle">
          Access your company dashboard and talent matches
        </p>

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
          <div className="auth-field">
            <label htmlFor="startup-email">Company email</label>
            <input
              id="startup-email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="startup-password">Password</label>
            <input
              id="startup-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="auth-row">
            <label className="auth-remember">
              <input type="checkbox" />
              Remember me
            </label>
            <a href="#forgot" className="auth-forgot">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="auth-submit startup"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in…" : "Sign in as Startup"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link to="/signup?role=startup">Sign up free</Link>
        </p>
        <p className="auth-switch">
          Are you a student? <Link to="/login/student">Student login</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default StartupLogin;
