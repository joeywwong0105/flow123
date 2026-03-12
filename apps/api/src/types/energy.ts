export type FiveElements = {
  wood: number; // 0..1
  fire: number;
  earth: number;
  metal: number;
  water: number;
};

export type EnergyContextInput = {
  dateISO: string; // "2026-03-12"
  timezone: string; // "Asia/Shanghai"
  ganzhi: {
    year?: string;
    month?: string;
    day: string; // required for Today pulse
  };
  elements: FiveElements;
  // Optional user signals; keep it minimal and non-invasive.
  userSignals?: {
    recentTags?: string[]; // from Records auto-tags
    sleepDebt?: "low" | "medium" | "high";
    stress?: "low" | "medium" | "high";
  };
};

export type LifeAdvice = {
  adviceShort: string; // one-liner: "今日宜：…"
  adviceLong?: string; // optional paragraph
  do: string[]; // concise actions
  avoid: string[]; // gentle cautions
  tone: "calm" | "focused" | "social" | "restorative";
};

