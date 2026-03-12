export type TodayAdviceResponse = {
  date: string; // ISO
  timezone: string;
  ganzhi: { year: string; month: string; day: string };
  adviceShort: string; // e.g. "今日宜：深度沟通"
  adviceLong?: string;
};

export async function fetchTodayAdvice(params: {
  baseUrl: string; // e.g. https://api.yourdomain.com
  timezone: string;
  ganzhiDay?: string;
  userId?: string;
  signal?: AbortSignal;
}): Promise<TodayAdviceResponse> {
  const url = new URL("/v1/today/advice", params.baseUrl);
  url.searchParams.set("timezone", params.timezone);
  if (params.ganzhiDay) url.searchParams.set("ganzhiDay", params.ganzhiDay);
  if (params.userId) url.searchParams.set("userId", params.userId);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: params.signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fetchTodayAdvice failed: ${res.status} ${text}`.trim());
  }
  return (await res.json()) as TodayAdviceResponse;
}

