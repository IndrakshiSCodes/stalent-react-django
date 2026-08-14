import "./Stats.css";
import { FiStar, FiAward } from "react-icons/fi";
import { FaRocket, FaGraduationCap } from "react-icons/fa";

function Stats() {
  const stats = [
    {
      value: "1,800+",
      label: "Startups onboarded",
      icon: FaRocket,
      color: "#EEF2FF",
    },
    {
      value: "24,000+",
      label: "Student members",
      icon: FaGraduationCap,
      color: "#ECFDF5",
    },
    {
      value: "9,400+",
      label: "Projects completed",
      icon: FiAward,
      color: "#FFF7ED",
    },
    {
      value: "4.8 / 5",
      label: "Avg. satisfaction",
      icon: FiStar,
      color: "#FDF2F8",
    },
  ];

  return (
    <section className="stats-section" id="success">
      <div className="stats-header">
        <span>PLATFORM IMPACT</span>
        <h2>Trusted by startups and students.</h2>
      </div>

      <div className="stats-container">
        {stats.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div className="stat-card" key={stat.label}>
              <div
                className="stat-icon"
                style={{ backgroundColor: stat.color }}
              >
                <StatIcon />
              </div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Stats;
