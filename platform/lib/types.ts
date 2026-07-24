export type ChartStatus = "pending" | "complete";

export type Chart = {
  id: string;
  user_id: string;
  image_path: string;
  status: ChartStatus;
  created_at: string;
};

export type AnalysisSource = "mock" | "claude-vision";

export type ChartAnalysis = {
  id: string;
  chart_id: string;
  user_id: string;
  source: AnalysisSource;
  pair: string;
  direction: "LONG" | "SHORT";
  confidence: number;
  entry: string;
  entry_note: string;
  sl: string;
  sl_note: string;
  tp1: string;
  tp1_rr: string;
  tp2: string;
  tp2_rr: string;
  note: string;
  size: string;
  valid_until: string;
  strategy: string;
  killzone: string;
  consensus: string;
  flags: string[];
  created_at: string;
};
