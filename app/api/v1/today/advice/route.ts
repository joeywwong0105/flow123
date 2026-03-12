import { NextResponse, type NextRequest } from "next/server";
import type { EnergyContextInput, LifeAdvice } from "@/lib/energy";
import { buildLifeAdvicePrompt } from "@/lib/buildLifeAdvicePrompt";
import { getPseudoGanzhiDay } from "@/lib/ganzhi";

function isoDateInTZ(timezone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pseudoElements(seed: string) {
  const h = hashString(seed);
  const f = (shift: number) => clamp01(((h >>> shift) % 100) / 100);
  return { wood: f(0), fire: f(7), earth: f(14), metal: f(21), water: f(28) };
}

function fallbackAdvice(ganzhiDay: string): LifeAdvice {
  // 温和、可执行，不带玄学口吻
  const options: LifeAdvice[] = [
    {
      adviceShort: "今日宜：深度沟通",
      adviceLong: "把一句没说完的话说完整，关系会更松一点。",
      do: ["认真倾听", "慢一点说", "写下重点", "留 10 分钟空白"],
      avoid: ["情绪化回复", "多任务聊天"],
      tone: "social",
    },
    {
      adviceShort: "今日宜：整理空间与思绪",
      adviceLong: "清掉一小块杂乱，你会更容易进入状态。",
      do: ["清理桌面", "列 3 件事", "关闭通知", "短时专注"],
      avoid: ["一次做太多", "边刷边想"],
      tone: "focused",
    },
    {
      adviceShort: "今日宜：轻运动，慢下来",
      adviceLong: "让身体先松，脑子自然也会松一点。",
      do: ["散步 20 分钟", "拉伸 8 分钟", "补水", "早点收尾"],
      avoid: ["硬扛到很晚", "高强度透支"],
      tone: "restorative",
    },
  ];
  return options[hashString(ganzhiDay) % options.length]!;
}

async function callAI(prompt: { system: string; user: string }): Promise<LifeAdvice> {
  const endpoint = process.env.AI_ENDPOINT;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || "gpt-4.1-mini";

  if (!endpoint) throw new Error("AI_ENDPOINT missing");

  const r = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`AI failed: ${r.status} ${t}`.trim());
  }

  const data = (await r.json()) as any;
  const json =
    data.output_json ??
    data.json ??
    data.result ??
    (typeof data.output_text === "string" ? JSON.parse(data.output_text) : null);

  if (!json || typeof json !== "object") throw new Error("AI output is not JSON");
  return json as LifeAdvice;
}

async function buildEnergyContext(args: {
  timezone: string;
  ganzhiDayHint?: string | null;
}): Promise<EnergyContextInput> {
  const dateISO = isoDateInTZ(args.timezone);
  const ganzhiDay = (args.ganzhiDayHint && args.ganzhiDayHint.trim()) || getPseudoGanzhiDay(new Date());
  const elements = pseudoElements(`${dateISO}|${args.timezone}|${ganzhiDay}`);

  return {
    dateISO,
    timezone: args.timezone,
    ganzhi: { day: ganzhiDay },
    elements,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const timezone = searchParams.get("timezone") || "Asia/Shanghai";
  const ganzhiDay = searchParams.get("ganzhiDay");

  try {
    const energy = await buildEnergyContext({ timezone, ganzhiDayHint: ganzhiDay });
    const prompt = buildLifeAdvicePrompt(energy);

    let advice: LifeAdvice;
    try {
      advice = await callAI(prompt);
    } catch {
      advice = fallbackAdvice(energy.ganzhi.day);
    }

    return NextResponse.json({
      date: energy.dateISO,
      timezone: energy.timezone,
      ganzhi: energy.ganzhi,
      adviceShort: advice.adviceShort,
      adviceLong: advice.adviceLong,
      do: advice.do,
      avoid: advice.avoid,
      tone: advice.tone,
    });
  } catch {
    return NextResponse.json({ error: "TODAY_ADVICE_FAILED" }, { status: 500 });
  }
}

