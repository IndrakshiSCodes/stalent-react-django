import { useState } from "react";
import { FaRocket, FaGraduationCap } from "react-icons/fa";
import "./HowItWorks.css";

const startupSteps = [
  {
    step: "01",
    title: "Post your project",
    description:
      "Describe what you need — a React dev for 3 months, a UX researcher for a sprint, or a marketing intern.",
  },
  {
    step: "02",
    title: "Get matched instantly",
    description:
      "Stalent surfaces top student profiles that fit your stack, timeline, and budget within 24 hours.",
  },
  {
    step: "03",
    title: "Collaborate & hire",
    description:
      "Work together through our platform. Love the result? Convert to a full offer directly.",
  },
];

const studentSteps = [
  {
    step: "01",
    title: "Build your profile",
    description:
      "Showcase your skills, university, portfolio projects, and availability so startups can find you.",
  },
  {
    step: "02",
    title: "Get matched to projects",
    description:
      "Receive curated startup opportunities aligned with your interests, skills, and career goals.",
  },
  {
    step: "03",
    title: "Work, learn & grow",
    description:
      "Collaborate with real teams, earn mentorship, and add meaningful work to your portfolio.",
  },
];

function HowItWorks() {
  const [activeTab, setActiveTab] = useState("startup");
  const steps = activeTab === "startup" ? startupSteps : studentSteps;

  return (
    <section className="how-section" id="how-it-works">
      <div className="how-header">
        <span>HOW IT WORKS</span>
        <h2>Simple for both sides.</h2>
      </div>

      <div className="how-toggle">
        <button
          type="button"
          className={activeTab === "startup" ? "active startup" : ""}
          onClick={() => setActiveTab("startup")}
          id="startups"
        >
          <FaRocket /> For Startups
        </button>
        <button
          type="button"
          className={activeTab === "student" ? "active student" : ""}
          onClick={() => setActiveTab("student")}
          id="students"
        >
          <FaGraduationCap /> For Students
        </button>
      </div>

      <div className="how-steps">
        {steps.map((item) => (
          <div className="how-step" key={item.step}>
            <div className="step-number">{item.step}</div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;
