import type { Chart } from "@/lib/types";

type Item = { chart: Chart; signedUrl: string | null };

export default function ChartGrid({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="eyebrow">No charts yet</div>
        <p>
          Upload your first chart screenshot to see it here. You&rsquo;ll get
          a mock analysis card back instantly -- real AI analysis is coming
          in a later phase.
        </p>
        <a className="btn btn--ghost" href="#upload">
          Upload your first chart
        </a>
      </div>
    );
  }

  return (
    <div className="chart-grid">
      {items.map(({ chart, signedUrl }) => (
        <a
          key={chart.id}
          className="panel chart-card"
          href={`/dashboard/charts/${chart.id}`}
        >
          {signedUrl ? (
            // Signed URLs are short-lived and per-request, not worth
            // next/image's remote-pattern allowlist for a private bucket.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="chart-card__thumb"
              src={signedUrl}
              alt="Uploaded chart"
            />
          ) : (
            <div className="chart-card__thumb" />
          )}
          <div className="chart-card__meta">
            <span>{new Date(chart.created_at).toLocaleDateString()}</span>
            <span className={chart.status === "mock_complete" ? undefined : "tabular"}>
              {chart.status === "mock_complete" ? "Analyzed" : "Pending"}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
