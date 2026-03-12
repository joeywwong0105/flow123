import type { EnergyContextInput, LifeAdvice } from "../types/energy";
import { buildLifeAdvicePrompt } from "../ai/buildLifeAdvicePrompt";

type RequestLike = {
  query: {
    timezone?: string;
    ganzhiDay?: string;
    userId?: string;
  };
};

type ResponseLike = {
  status(code: number): ResponseLike;
  json(body: unknown): void;
};

/**
 * 这是一个“可移植”的路由处理器：
 * - Express: (req,res) => todayAdviceHandler(req,res,{...})
 * - Fastify: 包一层适配 req.query / reply
 */
export async function todayAdviceHandler(
  req: RequestLike,
  res: ResponseLike,
  deps: {
    // 你可以替换为 OpenAI/Anthropic/自建模型。这里用 fetch 作为最小依赖。
    ai: (args: { system: string; user: string }) => Promise<LifeAdvice>;
    // 将“今日干支/五行分布”计算放在后端，这里只留注入点。
    buildEnergyContext: (args: {
      timezone: string;
      ganzhiDayHint?: string;
      userId?: string;
    }) => Promise<EnergyContextInput>;
  }
) {
  const timezone = req.query.timezone || "Asia/Shanghai";
  try {
    const energy = await deps.buildEnergyContext({
      timezone,
      ganzhiDayHint: req.query.ganzhiDay,
      userId: req.query.userId,
    });

    const prompt = buildLifeAdvicePrompt(energy);
    const advice = await deps.ai(prompt);

    return res.json({
      date: energy.dateISO,
      timezone: energy.timezone,
      ganzhi: energy.ganzhi,
      adviceShort: advice.adviceShort,
      adviceLong: advice.adviceLong,
      do: advice.do,
      avoid: advice.avoid,
      tone: advice.tone,
    });
  } catch (e) {
    return res.status(500).json({ error: "TODAY_ADVICE_FAILED" });
  }
}

/**
 * 一个最小 AI 调用实现（可直接用在 deps.ai）。
 * 约定：你的 AI 网关返回 JSON（即 LifeAdvice）。
 */
export function makeGatewayAI(args: {
  endpoint: string; // e.g. https://api.openai.com/v1/responses OR your gateway
  apiKey?: string;
  model: string;
}) {
  return async ({ system, user }: { system: string; user: string }): Promise<LifeAdvice> => {
    const r = await fetch(args.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(args.apiKey ? { Authorization: `Bearer ${args.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: args.model,
        // Vendor-agnostic payload (adapt to your gateway).
        input: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        // Strongly encourage JSON-only outputs on gateways that support it.
        response_format: { type: "json_object" },
      }),
    });

    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(`AI gateway failed: ${r.status} ${t}`.trim());
    }

    const data = (await r.json()) as any;

    // Accept a few common shapes.
    const json =
      data.output_json ??
      data.json ??
      data.result ??
      (typeof data.output_text === "string" ? JSON.parse(data.output_text) : null);

    if (!json || typeof json !== "object") throw new Error("AI output is not JSON");
    return json as LifeAdvice;
  };
}

