import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { FlowPulse } from "../components/FlowPulse";
import { fetchTodayAdvice } from "../lib/api";
import { getTodayGanzhi } from "../lib/ganzhi";

type Props = {
  apiBaseUrl: string;
  userId?: string;
};

export function TodayScreen({ apiBaseUrl, userId }: Props) {
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Shanghai",
    []
  );
  const ganzhi = useMemo(() => getTodayGanzhi(), []);

  const [adviceShort, setAdviceShort] = useState<string>("今日宜：放慢一点，先把心放回身体里");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    const ac = new AbortController();
    setStatus("loading");
    fetchTodayAdvice({
      baseUrl: apiBaseUrl,
      timezone,
      ganzhiDay: ganzhi.day,
      userId,
      signal: ac.signal,
    })
      .then((r) => {
        setAdviceShort(r.adviceShort);
        setStatus("idle");
      })
      .catch(() => {
        // 保持一个温和的 fallback，不打断用户节奏
        setStatus("error");
      });
    return () => ac.abort();
  }, [apiBaseUrl, timezone, ganzhi.day, userId]);

  return (
    <SafeAreaView style={styles.root}>
      <FlowPulse
        adviceShort={adviceShort}
        subtitle={status === "loading" ? "正在对齐今日节奏…" : `今日干支：${ganzhi.day}`}
      />

      <View style={styles.section}>
        <Text style={styles.h1}>Today</Text>
        <Text style={styles.p}>
          用一句话把今天的重心抓住，然后再开始记录。你可以在 Capture 里用语音或多模态快速写下发生了什么。
        </Text>

        {status === "error" && (
          <Text style={styles.muted}>当前建议获取失败：先用你的体感记录，也一样有效。</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#070B14",
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  h1: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 26,
    letterSpacing: 0.2,
  },
  p: {
    marginTop: 10,
    color: "rgba(255,255,255,0.60)",
    fontSize: 14,
    lineHeight: 22,
  },
  muted: {
    marginTop: 10,
    color: "rgba(255,255,255,0.42)",
    fontSize: 12,
  },
});

