import type { EnergyContextInput } from "../types/energy";

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function normalizeElements(e: EnergyContextInput["elements"]) {
  return {
    wood: clamp01(e.wood),
    fire: clamp01(e.fire),
    earth: clamp01(e.earth),
    metal: clamp01(e.metal),
    water: clamp01(e.water),
  };
}

export function buildLifeAdvicePrompt(input: EnergyContextInput) {
  const elements = normalizeElements(input.elements);
  const recentTags = input.userSignals?.recentTags?.slice(0, 8) ?? [];

  const system = [
    "你是 Flow，一款极简生活记录 App 的节奏建议引擎。",
    "目标：给出“松弛感、可执行、不神秘化”的生活建议。",
    "约束：现代简约语气；不使用古风/玄学/占卜口吻；不恐吓；不做医疗/法律建议。",
    "输出只允许 JSON（不要 Markdown、不要多余文字）。",
    '语言：简体中文。用词轻，句子短，避免命令式。用“今日宜：”开头。',
  ].join("\n");

  const user = {
    context: {
      dateISO: input.dateISO,
      timezone: input.timezone,
      ganzhiDay: input.ganzhi.day,
      elements,
      userSignals: {
        recentTags,
        sleepDebt: input.userSignals?.sleepDebt ?? null,
        stress: input.userSignals?.stress ?? null,
      },
    },
    task: {
      instruction:
        "把五行能量与用户信号转换为当日节奏建议，强调可执行的行为类别（沟通/整理/学习/运动/休息/创作/社交/独处等），给出轻量的“宜/忌”。",
      outputSchema: {
        adviceShort: "string (<= 18 个中文字符，格式：今日宜：……)",
        adviceLong: "string (<= 80 个中文字符，可省略)",
        do: "string[] (3-5 条，每条 <= 10 字)",
        avoid: "string[] (2-4 条，每条 <= 10 字，语气温和)",
        tone: 'one of ["calm","focused","social","restorative"]',
      },
      styleExamples: [
        "今日宜：深度沟通",
        "今日宜：把事做少一点",
        "今日宜：轻运动，慢下来",
        "今日宜：整理空间与思绪",
      ],
    },
  };

  return { system, user: JSON.stringify(user) };
}

