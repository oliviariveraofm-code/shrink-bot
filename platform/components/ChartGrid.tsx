import type { Chart, ChartAnalysis } from "@/lib/types";

type Item = {
  chart: Chart;
  signedUrl: string | null;
  analysis: ChartAnalysis | null;
};

export default function ChartGrid({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="eyebrow">No charts yet</div>
        <p>
          Upload your first chart screenshot to see it here. You&rsquo;ll get
          an analysis card back instantly -- real AI analysis if it&rsquo;s
          configured, a clearly labeled mock result if not.
        </p>
        <a className="btn btn--ghost" href="#upload">
          Upload your first chart
        </a>
      </div>
    );
  }

  return (
    <div className="chart-grid">
      {items.map(({ chart, signedUrl, analysis }) => (
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
          {analysis ? (
            <div className="chart-card__analysis">
              <span>{analysis.pair}</span>
              <span
                className={`chart-card__direction chart-card__direction--${analysis.direction.toLowerCase()}`}
              >
                {analysis.direction} {analysis.confidence}%
              </span>
            </div>
          ) : null}
          <div className="chart-card__meta">
            <span>{new Date(chart.created_at).toLocaleDateString()}</span>
            <span className={chart.status === "complete" ? undefined : "tabular"}>
              {chart.status === "complete" ? "Analyzed" : "Pending"}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
