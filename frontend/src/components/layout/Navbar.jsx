import { Link, useNavigate } from "react-router-dom";
import StalentLogo from "../StalentLogo";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <StalentLogo size={36} id="navbarLogoGrad" />
        <span className="logo-text">Stalent</span>
      </Link>

      <ul className="navbar-links">
        <li><a href="/#how-it-works">How it works</a></li>
        <li><a href="/#startups">For Startups</a></li>
        <li><a href="/#students">For Students</a></li>
        <li><a href="/#success">Success Stories</a></li>
      </ul>

      <div className="navbar-buttons">
        <button className="login-btn" onClick={() => navigate("/login")}>
          Log in
        </button>
        <button className="signup-btn" onClick={() => navigate("/signup")}>
          Sign up free
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
