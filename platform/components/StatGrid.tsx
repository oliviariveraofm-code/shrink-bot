export type Stat = { label: string; value: string; compact?: boolean };

export default function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="stat-grid">
      {stats.map((stat) => (
        <div key={stat.label} className="panel stat-panel">
          <div
            className={`stat__value tabular${stat.compact ? " stat__value--compact" : ""}`}
          >
            {stat.value}
          </div>
          <div className="stat__label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
