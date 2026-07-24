import type { MockAnalysis } from "@/lib/types";

/**
 * Renders with the exact .tradecard classes ported from the marketing
 * site's Anatomy Of A Card section -- same visual component, real data
 * swapped for placeholder data. The MOCK badge is the honesty signal:
 * nothing here should be mistaken for a real trading signal.
 */
export default function TradeCardMock({
  analysis,
}: {
  analysis: MockAnalysis;
}) {
  return (
    <div>
      <div className="badge badge--mock" style={{ marginBottom: "16px" }}>
        MOCK ANALYSIS — AI ENGINE COMING SOON
      </div>
      <div className="panel tradecard">
        <div className="tradecard__head">
          <div className="tradecard__pair">{analysis.pair}</div>
          <div className="tradecard__conf tabular">{analysis.confidence}%</div>
        </div>
        <div className="tradecard__row">
          <span className="tradecard__k">Entry</span>
          <span className="tradecard__v tabular">
            {analysis.entry}{" "}
            <span style={{ color: "var(--stone)", fontWeight: 400 }}>
              ({analysis.entry_note})
            </span>
          </span>
        </div>
        <div className="tradecard__row">
          <span className="tradecard__k">SL</span>
          <span className="tradecard__v tabular">
            {analysis.sl}{" "}
            <span style={{ color: "var(--stone)", fontWeight: 400 }}>
              ({analysis.sl_note})
            </span>
          </span>
        </div>
        <div className="tradecard__row">
          <span className="tradecard__k">TP1</span>
          <span className="tradecard__v tabular">
            {analysis.tp1} → R:R {analysis.tp1_rr}
          </span>
        </div>
        <div className="tradecard__row">
          <span className="tradecard__k">TP2</span>
          <span className="tradecard__v tabular">
            {analysis.tp2} → R:R {analysis.tp2_rr}
          </span>
        </div>
        <div className="tradecard__note">{analysis.note}</div>
        <div className="tradecard__meta tabular">
          <span>SIZE {analysis.size}</span>
          <span>VALID {analysis.valid_until}</span>
          <span>{analysis.strategy}</span>
          <span>{analysis.killzone}</span>
          <span>CONSENSUS {analysis.consensus}</span>
        </div>
        <div className="tradecard__flags">
          {analysis.flags.map((flag) => (
            <span key={flag} className="flag">
              {flag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
