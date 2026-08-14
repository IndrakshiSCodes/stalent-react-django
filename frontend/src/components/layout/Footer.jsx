import { Link } from "react-router-dom";
import { FiGlobe } from "react-icons/fi";
import { FaRocket, FaGraduationCap } from "react-icons/fa";
import StalentLogo from "../StalentLogo";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <StalentLogo size={36} id="footerLogoGrad" />
            <span className="logo-text">Stalent</span>
          </Link>
          <p>
            Connecting ambitious startups with high-potential students. Real
            work. Real growth. Real futures.
          </p>
        </div>

        <div className="footer-columns">
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><a href="/#how-it-works">How it works</a></li>
              <li><a href="/#startups">For Startups</a></li>
              <li><a href="/#students">For Students</a></li>
              <li><a href="/#pricing">Pricing</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="/#about">About us</a></li>
              <li><a href="/#blog">Blog</a></li>
              <li><a href="/#careers">Careers</a></li>
              <li><a href="/#press">Press</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="/#privacy">Privacy</a></li>
              <li><a href="/#terms">Terms</a></li>
              <li><a href="/#security">Security</a></li>
              <li><a href="/#contact">Contact</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Stalent Technologies, Inc. All rights reserved.</p>
        <div className="footer-badges">
          <span><FiGlobe /> Available worldwide</span>
          <span><FaGraduationCap /> 100+ universities</span>
          <span><FaRocket /> 1,800+ startups</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
