import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import StalentLogo from "../StalentLogo";
import "./AuthLayout.css";

function AuthLayout({
  role = "general",
  title,
  subtitle,
  accentColor = "var(--primary)",
  children,
}) {
  const roleLabels = {
    student: "Student Portal",
    startup: "Startup Portal",
    general: "Welcome to Stalent",
  };

  return (
    <div className="auth-page">
      <div className="auth-brand" style={{ "--accent": accentColor }}>
        <Link to="/" className="auth-logo">
          <StalentLogo size={36} id="authLogoGrad" />
          <span className="logo-text">Stalent</span>
        </Link>

        <div className="auth-brand-content">
          <span className="auth-badge">{roleLabels[role]}</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        <div className="auth-brand-footer">
          <p>© 2026 Stalent Technologies, Inc.</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <Link to="/" className="auth-back-link">
          <FiArrowLeft style={{ marginRight: 4, verticalAlign: "middle" }} /> Back to home
        </Link>
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
