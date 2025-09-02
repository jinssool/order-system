// src/utils/dateUtils.ts
// Use local date parts (not toISOString) to avoid timezone shift that breaks calendar dots.
export const pad2 = (n: number) => n.toString().padStart(2, '0');

export const getYYYYMMDD = (date: Date): string => {
  // Returns 'YYYY-MM-DD' in local time.
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};
