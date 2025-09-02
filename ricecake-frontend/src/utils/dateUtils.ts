// src/utils/dateUtils.ts
export const getYYYYMMDD = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };