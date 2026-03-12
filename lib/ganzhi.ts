export type Ganzhi = { year?: string; month?: string; day: string };

function hashString(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h >>> 0;
}

export function getPseudoGanzhiDay(date = new Date()): string {
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const h = hashString(key);
  return `${stems[h % stems.length]}${branches[(h >>> 8) % branches.length]}`;
}

export function getTodayGanzhiClientSafe(): Ganzhi {
  return { day: getPseudoGanzhiDay(new Date()) };
}

