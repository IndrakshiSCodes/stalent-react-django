import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import { FaRocket, FaGraduationCap } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

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
      const session = await login(email, password);
      navigate(session.role === "startup" ? "/startup/dashboard" : "/student/dashboard");
    } catch (err) {
      const serverError = err.response?.data?.error;
      setError(serverError || err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      role="general"
      title="Sign in to your account"
      subtitle="Choose how you'd like to continue, or sign in with your email below."
      accentColor="#1b2a4a"
    >
      <div className="auth-form">
        <h2>Log in</h2>
        <p className="auth-subtitle">Select your account type to continue</p>

        <div className="role-cards">
          <Link to="/login/startup" className="role-card startup">
            <span className="role-icon"><FaRocket /></span>
            <span>I'm a Startup</span>
          </Link>
          <Link to="/login/student" className="role-card student">
            <span className="role-icon"><FaGraduationCap /></span>
            <span>I'm a Student</span>
          </Link>
        </div>

        <div className="auth-divider">or sign in with email</div>

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
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
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

          <button type="submit" className="auth-submit primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link to="/signup">Sign up free</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;
