import "./Features.css";
import { FiSearch, FiBriefcase, FiCheckCircle, FiMessageCircle, FiTrendingUp } from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";

const features = [
  {
    icon: FiSearch,
    iconBg: "#EEF2FF",
    title: "Smart Matching",
    description:
      "Our algorithm pairs startups with students based on skills, project needs, availability, and learning goals — not just keywords.",
  },
  {
    icon: FiBriefcase,
    iconBg: "#FEF9C3",
    title: "Real Projects, Real Impact",
    description:
      "Students work on live startup challenges — product design, dev, marketing, research — and build portfolios that actually matter.",
  },
  {
    icon: FaGraduationCap,
    iconBg: "#ECFDF5",
    title: "Mentorship Built In",
    description:
      "Every engagement includes structured check-ins and mentorship from startup founders and senior team members.",
  },
  {
    icon: FiCheckCircle,
    iconBg: "#F3E8FF",
    title: "Verified Profiles",
    description:
      "Startups are vetted for legitimacy. Students are verified through their university. Both sides trust the platform completely.",
  },
  {
    icon: FiMessageCircle,
    iconBg: "#FDF2F8",
    title: "Seamless Collaboration",
    description:
      "Built-in workspace with task boards, messaging, file sharing, and milestone tracking — no extra tools required.",
  },
  {
    icon: FiTrendingUp,
    iconBg: "#EFF6FF",
    title: "Outcome Tracking",
    description:
      "Track skill growth, project milestones, and hiring conversions. Every collaboration ends with a measurable outcome report.",
  },
];

function Features() {
  return (
    <section className="features-section">
      <div className="features-header">
        <span>PLATFORM FEATURES</span>
        <h2>Built for real collaboration.</h2>
        <p>
          Every feature is designed to make the startup-student relationship
          productive, fair, and career-defining.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature) => {
          const FeatureIcon = feature.icon;
          return (
            <article className="feature-card" key={feature.title}>
              <div
                className="feature-icon"
                style={{ backgroundColor: feature.iconBg }}
              >
                <FeatureIcon />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Features;
