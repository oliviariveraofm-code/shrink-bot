import { useEffect, useState } from "react";
import "./login-modal.css";

const WATCH_TEXT = "The Shrink is watching.";

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [typed, setTyped] = useState(0);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  useEffect(() => {
    if (!open) {
      setTyped(0);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(i);
      if (i >= WATCH_TEXT.length) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-noise" />
      <div className="modal-panel glass-panel">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-hex" />
        <p className="modal-watch">
          {WATCH_TEXT.slice(0, typed)}
          <span className="modal-cursor" />
        </p>

        <button className="discord-btn">
          <svg className="discord-btn__logo" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M20.3 5.4A17 17 0 0 0 15.9 4l-.3.6c1.7.4 2.7 1 3.6 1.7-1.6-.8-3.2-1.2-4.9-1.2-1.7 0-3.3.4-4.9 1.2.9-.7 2.1-1.4 3.6-1.7L12.7 4a17 17 0 0 0-4.4 1.4C5.9 8.4 5.1 11.4 5.4 14.3a17 17 0 0 0 5.1 2.6l.7-1.1c-.8-.3-1.6-.7-2.3-1.2.2.1.4.3.6.4A12 12 0 0 0 15.5 16c.2-.1.4-.2.6-.4-.7.5-1.5.9-2.3 1.2l.7 1.1a17 17 0 0 0 5.1-2.6c.4-3.4-.5-6.4-2.6-9.5-.1 0-.1 0-.1-.1zM9.7 12.6c-.6 0-1.1-.6-1.1-1.3s.5-1.3 1.1-1.3 1.1.6 1.1 1.3-.5 1.3-1.1 1.3zm4.6 0c-.6 0-1.1-.6-1.1-1.3s.5-1.3 1.1-1.3 1.1.6 1.1 1.3-.5 1.3-1.1 1.3z" />
          </svg>
          Continue with Discord
        </button>

        <div className="modal-divider">
          <span>or</span>
        </div>

        <form
          className="modal-form"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className={`modal-field ${emailFocus ? "modal-field--focus" : ""}`}>
            <span>Email</span>
            <input type="email" onFocus={() => setEmailFocus(true)} onBlur={() => setEmailFocus(false)} placeholder="trader@floor.com" />
          </label>
          <label className={`modal-field ${passFocus ? "modal-field--focus" : ""}`}>
            <span>Password</span>
            <input type="password" onFocus={() => setPassFocus(true)} onBlur={() => setPassFocus(false)} placeholder="••••••••" />
          </label>
          <button type="submit" className="modal-submit">
            Enter The Floor
          </button>
        </form>
      </div>
    </div>
  );
}
