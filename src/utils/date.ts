export const parseDateString = (dateStr: string): Date => {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const m = parseInt(parts[0], 10) - 1;
    const d = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    if (!isNaN(m) && !isNaN(d) && !isNaN(y)) {
      return new Date(y, m, d);
    }
  }
  return new Date();
};

export const getTodayDateString = (): string => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const y = d.getFullYear();
  return `${m}-${day}-${y}`;
};

export const isSameMonthYear = (dateStr1: string, dateStr2: string): boolean => {
  const p1 = dateStr1.split('-');
  const p2 = dateStr2.split('-');
  if (p1.length === 3 && p2.length === 3) {
    return p1[0] === p2[0] && p1[2] === p2[2];
  }
  return false;
};

export const isBeforeOrSameMonthYear = (dateStr: string, targetDateStr: string): boolean => {
  const p = dateStr.split('-');
  const t = targetDateStr.split('-');
  if (p.length === 3 && t.length === 3) {
    const pYear = parseInt(p[2], 10);
    const pMonth = parseInt(p[0], 10);
    const tYear = parseInt(t[2], 10);
    const tMonth = parseInt(t[0], 10);
    if (pYear < tYear) return true;
    if (pYear === tYear) return pMonth <= tMonth;
  }
  return false;
};

export const getRelativeMonth = (dateStr: string, offset: number): string => {
  const parsed = parseDateString(dateStr);
  const year = parsed.getFullYear();
  const month = parsed.getMonth(); // 0-indexed
  const newDate = new Date(year, month + offset, 1);
  const m = String(newDate.getMonth() + 1).padStart(2, '0');
  const d = String(newDate.getDate()).padStart(2, '0');
  const y = newDate.getFullYear();
  return `${m}-${d}-${y}`;
};

