const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const toDate = (value: string): Date => {
  const date = new Date(`${value}T00:00:00`);
  return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
};

export const formatISODate = (date: Date): string => date.toISOString().slice(0, 10);

export const addDays = (date: Date, days: number): Date => {
  const output = new Date(date);
  output.setDate(output.getDate() + days);
  return output;
};

export const differenceInDays = (start: Date, end: Date): number => {
  return Math.floor((end.getTime() - start.getTime()) / DAY_IN_MS);
};

export const getDayRange = (startDate: string, totalDays: number): Date[] => {
  const start = toDate(startDate);
  return Array.from({ length: totalDays }, (_, index) => addDays(start, index));
};

export const getWeekLabel = (date: Date): string => {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const dayOffset = Math.floor((date.getTime() - firstDay.getTime()) / DAY_IN_MS);
  const week = Math.ceil((dayOffset + firstDay.getDay() + 1) / 7);
  return `Sem ${week}`;
};

export const formatDayLabel = (date: Date): string => {
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit' });
};
