const DAY_IN_MS = 24 * 60 * 60 * 1000;
const SATURDAY = 6;
const SUNDAY = 0;

const holidayCache = new Map<number, Set<string>>();

export const toDate = (value: string): Date => {
  const date = new Date(`${value}T00:00:00`);
  return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
};

export const formatISODate = (date: Date): string =>
  date.toISOString().slice(0, 10);

export const addDays = (date: Date, days: number): Date => {
  const output = new Date(date);
  output.setDate(output.getDate() + days);
  return output;
};

const getEasterSunday = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

const buildHolidaySetBW = (year: number): Set<string> => {
  const easterSunday = getEasterSunday(year);

  const staticHolidays = [
    new Date(year, 0, 1),
    new Date(year, 0, 6),
    new Date(year, 4, 1),
    new Date(year, 9, 3),
    new Date(year, 10, 1),
    new Date(year, 11, 25),
    new Date(year, 11, 26),
  ];

  const dynamicHolidays = [
    addDays(easterSunday, -2),
    addDays(easterSunday, 1),
    addDays(easterSunday, 39),
    addDays(easterSunday, 50),
    addDays(easterSunday, 60),
  ];

  return new Set(
    [...staticHolidays, ...dynamicHolidays].map((holiday) => formatISODate(holiday)),
  );
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === SATURDAY || day === SUNDAY;
};

export const isHolidayBW = (date: Date): boolean => {
  const year = date.getFullYear();
  if (!holidayCache.has(year)) {
    holidayCache.set(year, buildHolidaySetBW(year));
  }

  return holidayCache.get(year)!.has(formatISODate(date));
};

export const isWorkingDay = (date: Date): boolean => {
  return !isWeekend(date) && !isHolidayBW(date);
};

export const getNextWorkingDay = (date: Date): Date => {
  const output = new Date(date);
  while (!isWorkingDay(output)) {
    output.setDate(output.getDate() + 1);
  }
  return output;
};

export const addWorkingDays = (date: Date, days: number): Date => {
  if (days === 0) {
    return getNextWorkingDay(date);
  }

  const output = new Date(date);
  const direction = days > 0 ? 1 : -1;
  let remaining = Math.abs(days);

  while (remaining > 0) {
    output.setDate(output.getDate() + direction);
    if (isWorkingDay(output)) {
      remaining -= 1;
    }
  }

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
  const isoWeek = getISOWeek(date);
  return `KW ${isoWeek}`;
};

export const startOfISOWeek = (date: Date): Date => {
  const output = new Date(date);
  const day = output.getDay() || 7;
  output.setDate(output.getDate() - (day - 1));
  return output;
};

export const endOfISOWeek = (date: Date): Date => {
  const output = startOfISOWeek(date);
  output.setDate(output.getDate() + 6);
  return output;
};

export const formatDayMonth = (date: Date): string => {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
  });
};

export interface WeekHeaderGroup {
  key: string;
  weekNumber: number;
  visibleDays: number;
  weekStart: Date;
  weekEnd: Date;
}

export const getWeekHeaderGroups = (days: Date[]): WeekHeaderGroup[] => {
  if (days.length === 0) {
    return [];
  }

  const groups: WeekHeaderGroup[] = [];
  days.forEach((day) => {
    const weekStart = startOfISOWeek(day);
    const weekNumber = getISOWeek(day);
    const year = weekStart.getFullYear();
    const key = `${year}-${weekNumber}`;
    const currentGroup = groups[groups.length - 1];

    if (!currentGroup || currentGroup.key !== key) {
      groups.push({
        key,
        weekNumber,
        visibleDays: 1,
        weekStart,
        weekEnd: endOfISOWeek(day),
      });
      return;
    }

    currentGroup.visibleDays += 1;
  });

  return groups;
};

export const getISOWeek = (date: Date): number => {
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const daysSinceYearStart = Math.floor(
    (utcDate.getTime() - yearStart.getTime()) / DAY_IN_MS,
  );
  return Math.ceil((daysSinceYearStart + 1) / 7);
};

export const formatDayLabel = (date: Date): string => {
  return date.toLocaleDateString("es-ES", { weekday: "short", day: "2-digit" });
};
