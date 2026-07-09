import { useEffect, useState } from "react";

export default function Typewriter({ text, speed = 32, startDelay = 300, className = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let interval;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setCount((c) => {
          if (c >= text.length) {
            clearInterval(interval);
            return c;
          }
          return c + 1;
        });
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  const done = count >= text.length;

  return (
    <span className={className}>
      {text.slice(0, count)}
      <span className={`caret ${done ? "" : ""}`}>{done ? "" : "|"}</span>
      {done && <span className="caret text-[var(--color-gold)]">_</span>}
    </span>
  );
}
