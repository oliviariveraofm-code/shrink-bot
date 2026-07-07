const SYMBOLS = [
  "ES", "NQ", "YM", "RTY", "CL", "GC", "6E", "ZB",
  "SPY", "QQQ", "BTC", "ETH", "DXY", "VIX"
];

function randomQuote(symbol) {
  const up = Math.random() > 0.45;
  const pct = (Math.random() * 3.2).toFixed(2);
  const arrow = up ? "▲" : "▼";
  const cls = up ? "up" : "down";
  return `<span class="${cls}">${symbol} ${arrow} ${pct}%</span>`;
}

export function buildTicker(trackEl) {
  const row = SYMBOLS.map(randomQuote).join("");
  // duplicate for seamless loop
  trackEl.innerHTML = row + row;
}
