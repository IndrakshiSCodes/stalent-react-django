import { useNavigate } from "react-router-dom";
import "./CtaBanner.css";

function CtaBanner() {
  const navigate = useNavigate();

  return (
    <section className="cta-banner" id="pricing">
      <div className="cta-content">
        <h2>Ready to build something real?</h2>
        <p>
          Join thousands of startups and students already collaborating on
          Stalent. Your next great project starts here.
        </p>
        <div className="cta-buttons">
          <button
            type="button"
            className="cta-startup"
            onClick={() => navigate("/signup?role=startup")}
          >
            Get started as Startup
          </button>
          <button
            type="button"
            className="cta-student"
            onClick={() => navigate("/signup?role=student")}
          >
            Join as Student — Free
          </button>
        </div>
      </div>
    </section>
  );
}

export default CtaBanner;
