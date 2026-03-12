import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

type Props = {
  title?: string; // "Flow Pulse"
  adviceShort: string; // e.g. "今日宜：深度沟通"
  subtitle?: string; // optional tiny hint like "基于今日干支"
};

/**
 * 设计要点（移动端“松弛感”）：
 * - 视觉：冷色、留白、轻量边框 + 轻微光晕
 * - 动画：持续“呼吸”而非弹窗；文案更新用淡入淡出
 */
export function FlowPulse({ title = "Flow Pulse", adviceShort, subtitle }: Props) {
  const breathe = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(1)).current;

  const glowScale = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  const glowOpacity = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.24],
  });

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathe]);

  // When advice changes: quick cross-fade (no popups).
  const lastAdviceRef = useRef(adviceShort);
  useEffect(() => {
    if (lastAdviceRef.current === adviceShort) return;
    lastAdviceRef.current = adviceShort;
    textFade.setValue(0);
    Animated.timing(textFade, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [adviceShort, textFade]);

  const a11yLabel = useMemo(() => `${title}，${adviceShort}`, [title, adviceShort]);

  return (
    <View style={styles.wrap} accessible accessibilityRole="summary" accessibilityLabel={a11yLabel}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <Animated.View style={{ opacity: textFade }}>
          <Text style={styles.advice}>{adviceShort}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 10,
  },
  glow: {
    position: "absolute",
    left: -8,
    right: -8,
    top: -8,
    bottom: -8,
    borderRadius: 20,
    backgroundColor: "#6EA8FF", // cool glow
  },
  card: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#0B1220", // deep cool background
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    letterSpacing: 0.4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
  },
  advice: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
  },
});

