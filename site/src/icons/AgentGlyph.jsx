// Minimal single-stroke glyphs, one per agent. Deliberately geometric /
// technical rather than illustrative — instrument-panel iconography.
const paths = {
  chair: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <circle cx="12" cy="4" r="1.4" />
      <circle cx="19.3" cy="8" r="1.4" />
      <circle cx="19.3" cy="16" r="1.4" />
      <circle cx="12" cy="20" r="1.4" />
      <circle cx="4.7" cy="16" r="1.4" />
      <circle cx="4.7" cy="8" r="1.4" />
      <path d="M12 8.8V5.4M14.8 10.2l3.5-2.7M14.8 13.8l3.5 2.7M12 15.2v3.4M9.2 13.8l-3.5 2.7M9.2 10.2l-3.5-2.7" />
    </>
  ),
  macro: (
    <>
      <path d="M3 18c3-1 3.5-8 6-8s2.5 5 5 5 2.5-9 7-9" />
      <circle cx="19" cy="6" r="1.3" />
      <circle cx="3" cy="18" r="1.3" />
    </>
  ),
  technician: (
    <>
      <path d="M4 20V10l4-3 4 5 4-7 4 4v11" />
      <path d="M4 20h16" />
    </>
  ),
  quant: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M8 16V10M12 16V7M16 16v-4" />
    </>
  ),
  shrink: (
    <>
      <path d="M12 4a5 5 0 0 0-5 5c0 2 1 3 1 5a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3c0-2 1-3 1-5a5 5 0 0 0-5-5Z" />
      <path d="M9.5 9c.6 1 1 1.6 1 3M14.5 9c-.6 1-1 1.6-1 3" />
      <path d="M12 17v3" />
    </>
  ),
  risk: (
    <>
      <path d="M12 3 4 6.5v5c0 5 3.4 8.4 8 9.5 4.6-1.1 8-4.5 8-9.5v-5L12 3Z" />
      <path d="M9 12l2 2 4-4.5" />
    </>
  ),
  scanner: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.5-4.5" />
      <path d="M11 7.5v7M7.5 11h7" />
    </>
  ),
  historian: (
    <>
      <path d="M4 6a8 8 0 1 1 2 10.5" />
      <path d="M4 6v4h4" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  sentinel: (
    <>
      <path d="M12 3 5 6v5c0 4.8 3 7.7 7 10 4-2.3 7-5.2 7-10V6l-7-3Z" />
      <path d="M12 8v4.5M12 15.2v.1" />
    </>
  ),
  executioner: (
    <>
      <path d="M4 12h11M11 7l5 5-5 5" />
      <path d="M17 7v10" />
    </>
  ),
  contrarian: (
    <>
      <path d="M12 3v18M3 12h18" />
      <circle cx="12" cy="12" r="8.5" />
    </>
  ),
  auditor: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
      <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4" />
    </>
  ),
};

export default function AgentGlyph({ id, className = "", strokeWidth = 1.4 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[id] ?? <circle cx="12" cy="12" r="7" />}
    </svg>
  );
}
