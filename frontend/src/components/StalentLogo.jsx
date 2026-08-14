// The one Stalent logo mark — same SVG everywhere the wordmark appears
// (landing navbar, auth pages, student/startup dashboards, profile pages).
// `id` just needs to be unique per instance so multiple copies on one page
// don't collide on the gradient definition.
export default function StalentLogo({ size = 36, id = "stalentLogoGrad" }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1b2a4a" />
          <stop offset="100%" stopColor="#101d33" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="28" fill={`url(#${id})`} />
      <circle cx="30" cy="70" r="7" fill="none" stroke="white" strokeWidth="7" />
      <path d="M 30,70 C 40,55 45,35 55,45 C 65,55 55,65 70,30" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="70" cy="30" r="7" fill="none" stroke="white" strokeWidth="7" />
    </svg>
  );
}
