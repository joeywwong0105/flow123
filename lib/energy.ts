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
    day: string;
  };
  elements: FiveElements;
  userSignals?: {
    recentTags?: string[];
    sleepDebt?: "low" | "medium" | "high";
    stress?: "low" | "medium" | "high";
  };
};

export type LifeAdvice = {
  adviceShort: string; // "今日宜：…"
  adviceLong?: string;
  do: string[];
  avoid: string[];
  tone: "calm" | "focused" | "social" | "restorative";
};

