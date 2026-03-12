export type Ganzhi = {
  year: string;
  month: string;
  day: string;
};

/**
 * 在真实产品里：这里应由后端/本地历法库输出“今日干支”。
 * 这个实现只做接口占位，避免把复杂历法塞进前端。
 */
export function getTodayGanzhi(): Ganzhi {
  // Placeholder: keep deterministic-ish for dev without external deps.
  const d = new Date();
  const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  // Very lightweight pseudo mapping.
  const stems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  const branches = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  const hash = [...key].reduce((acc, ch) => (acc * 33 + ch.charCodeAt(0)) >>> 0, 5381);
  const stem = stems[hash % stems.length];
  const branch = branches[(hash >>> 8) % branches.length];
  return { year: "—", month: "—", day: `${stem}${branch}` };
}

