export interface MonthOption {
  num: number;
  name: string;
}

export const MONTHS: MonthOption[] = [
  { num: 1, name: "JANUARY" },
  { num: 2, name: "FEBRUARY" },
  { num: 3, name: "MARCH" },
  { num: 4, name: "APRIL" },
  { num: 5, name: "MAY" },
  { num: 6, name: "JUNE" },
  { num: 7, name: "JULY" },
  { num: 8, name: "AUGUST" },
  { num: 9, name: "SEPTEMBER" },
  { num: 10, name: "OCTOBER" },
  { num: 11, name: "NOVEMBER" },
  { num: 12, name: "DECEMBER" },
];

export const WEEK_DAYS_SHORT = ["일", "월", "화", "수", "목", "금", "토"];
export const WEEK_DAYS_LONG = WEEK_DAYS_SHORT.map((day) => `${day}요일`);

const pad2 = (value: number) => String(value).padStart(2, "0");

export function formatDateKeyFromParts(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function formatDateKey(date: Date) {
  return formatDateKeyFromParts(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}

export function isDateKeyAfter(dateKey: string, maxDateKey: string) {
  return dateKey > maxDateKey;
}

export function isFutureDate(date: Date) {
  return isDateKeyAfter(formatDateKey(date), formatDateKey(new Date()));
}

export function isFutureMonth(year: number, month: number) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  return year > currentYear || (year === currentYear && month > currentMonth);
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

export function toDateFromKey(dateKey: string) {
  const { year, month, day } = parseDateKey(dateKey);
  return new Date(year, month - 1, day);
}

export function formatKoreanDate(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function formatKoreanDateKey(dateKey: string) {
  const { year, month, day } = parseDateKey(dateKey);
  return `${year}년 ${month}월 ${day}일`;
}

export function getKoreanDayLabel(date: Date) {
  return WEEK_DAYS_LONG[date.getDay()];
}

export function getKoreanDayLabelFromKey(dateKey: string) {
  return getKoreanDayLabel(toDateFromKey(dateKey));
}

export function getCalendarDays(date: Date) {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  return [
    ...Array.from({ length: firstDayOfMonth }, () => null as number | null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
}

export function getWeeksInMonth(year: number, month: number) {
  const calendarDays = getCalendarDays(new Date(year, month - 1, 1));
  const weeks: (number | null)[][] = [];

  for (let index = 0; index < calendarDays.length; index += 7) {
    weeks.push(calendarDays.slice(index, index + 7));
  }

  return weeks;
}
