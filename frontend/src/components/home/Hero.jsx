import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { FaRocket, FaGraduationCap } from "react-icons/fa";
import StalentLogo from "../StalentLogo";
import "./Hero.css";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-background" />

      <div className="hero-content">
        <div className="hero-icon"><StalentLogo size={100} id="heroLogoGrad" /></div>

        <h1 className="hero-title">
          Where startups find
          <span> student talent.</span>
        </h1>

        <p className="hero-description">
          Stalent bridges the gap between ambitious startups and high-potential
          students. Real projects. Real mentorship. Real careers — built
          together.
        </p>

        <div className="hero-buttons">
          <button
            className="startup-btn"
            onClick={() => navigate("/login/startup")}
          >
            <span><FaRocket /> I'm a Startup</span>
            <FiArrowRight />
          </button>

          <button
            className="student-btn"
            onClick={() => navigate("/login/student")}
          >
            <span><FaGraduationCap /> I'm a Student</span>
            <FiArrowRight />
          </button>
        </div>

        <p className="hero-footer-text">
          Free for students · No hiring fees · Cancel startups plan anytime
        </p>
      </div>
    </section>
  );
}

export default Hero;
