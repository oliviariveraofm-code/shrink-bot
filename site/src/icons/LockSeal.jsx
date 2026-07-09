export default function LockSeal({ className = "" }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" opacity="0.7" />
      <path
        d="M24 14a5 5 0 0 0-5 5v2.2c-1.2.4-2 1.5-2 2.8v5a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-5c0-1.3-.8-2.4-2-2.8V19a5 5 0 0 0-5-5Zm-3 5a3 3 0 0 1 6 0v2h-6v-2Z"
        fill="currentColor"
      />
    </svg>
  );
}
