import MagneticButton from "./MagneticButton";

export default function Footer() {
  return (
    <footer id="join" className="relative border-t border-white/5 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="eyebrow">Pull Up A Seat</div>
        <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
          The floor doesn't wait for <span className="text-gradient-gold">conviction.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--color-ink-dim)] sm:text-base">
          Twelve agents, one consensus engine, and a Shrink that logs everything. Join the server and
          watch how the floor actually runs.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticButton href="https://discord.com" target="_blank" rel="noreferrer" variant="gold">
            Join Discord
          </MagneticButton>
          <MagneticButton href="#agents" variant="ghost">
            Meet The Agents
          </MagneticButton>
        </div>

        <div className="divider-line mx-auto mt-16 max-w-md" />

        <p className="mx-auto mt-8 max-w-lg text-[0.7rem] leading-relaxed text-[var(--color-ink-faint)]">
          The Trading Floor and The Shrink provide educational behavioral analysis, not financial
          advice. Nothing here is a recommendation to buy, sell, or hold any instrument. Consensus
          calls reflect agent agreement, not a guarantee of outcome.
        </p>

        <p className="mt-6 text-[0.68rem] tracking-wide text-[var(--color-ink-faint)]">
          © {new Date().getFullYear()} The Trading Floor. Twelve agents. One analysis.
        </p>
      </div>
    </footer>
  );
}
