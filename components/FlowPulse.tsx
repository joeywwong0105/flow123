"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./FlowPulse.module.css";

type Props = {
  title?: string;
  adviceShort: string;
  subtitle?: string;
};

export function FlowPulse({ title = "Flow Pulse", adviceShort, subtitle }: Props) {
  const [fadeKey, setFadeKey] = useState(0);
  const lastAdviceRef = useRef(adviceShort);

  useEffect(() => {
    if (lastAdviceRef.current === adviceShort) return;
    lastAdviceRef.current = adviceShort;
    setFadeKey((k) => k + 1);
  }, [adviceShort]);

  const a11yLabel = useMemo(() => `${title}，${adviceShort}`, [title, adviceShort]);

  return (
    <section className={styles.wrap} aria-label={a11yLabel}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <div className={styles.title}>{title}</div>
          {!!subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>

        <div key={fadeKey} className={styles.adviceFade}>
          <div className={styles.advice}>{adviceShort}</div>
        </div>
      </div>
    </section>
  );
}

