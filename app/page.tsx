import { FlowPulse } from "@/components/FlowPulse";
import { getTodayGanzhiClientSafe } from "@/lib/ganzhi";
import styles from "./page.module.css";

async function getAdvice(params: { timezone: string; ganzhiDay: string }) {
  const url = new URL("/api/v1/today/advice", "http://localhost");
  url.searchParams.set("timezone", params.timezone);
  url.searchParams.set("ganzhiDay", params.ganzhiDay);

  // On Vercel/Next, relative fetch works; URL base doesn't matter for Request init.
  const res = await fetch(url.pathname + url.search, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as { adviceShort: string; adviceLong?: string; ganzhi?: { day: string } };
}

export default async function HomePage() {
  // Server Component: use a safe default timezone; client can refine later if needed.
  const timezone = "Asia/Shanghai";
  const ganzhi = getTodayGanzhiClientSafe();
  const advice = await getAdvice({ timezone, ganzhiDay: ganzhi.day });

  const adviceShort = advice?.adviceShort ?? "今日宜：放慢一点，先把心放回身体里";

  return (
    <main className={styles.root}>
      <FlowPulse adviceShort={adviceShort} subtitle={`今日干支：${advice?.ganzhi?.day ?? ganzhi.day}`} />

      <section className={styles.section}>
        <h1 className={styles.h1}>Today</h1>
        <p className={styles.p}>
          用一句话把今天的重心抓住，然后再开始记录。后续你可以在这里扩展 Capture（语音/多模态）与 Tracks（故事线）。
        </p>
      </section>
    </main>
  );
}

