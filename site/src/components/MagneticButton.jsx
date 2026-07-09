import { useMagnetic } from "@/hooks/useMagnetic";

export default function MagneticButton({ as: Tag = "a", variant = "gold", className = "", children, ...props }) {
  const ref = useMagnetic(0.3);

  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium tracking-wide transition-colors duration-200 will-change-transform";
  const variants = {
    gold: "bg-[var(--color-gold)] text-[#14161c] hover:bg-[var(--color-gold-bright)] shadow-[0_0_30px_-8px_rgba(196,160,82,0.65)]",
    ghost: "border border-white/15 text-[var(--color-ink)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal-bright)]",
  };

  return (
    <Tag ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
