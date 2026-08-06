export type DateValue = Date | number | string;

export function toTimestamp(value: DateValue) {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

export function getMonthStarts(start: DateValue, end: DateValue) {
  const startTimestamp = toTimestamp(start);
  const endTimestamp = toTimestamp(end);

  if (!Number.isFinite(startTimestamp) || !Number.isFinite(endTimestamp)) {
    return [];
  }

  const startDate = new Date(startTimestamp);
  const firstMonth = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1);
  const monthStarts: number[] = [];
  let monthStart =
    firstMonth < startTimestamp
      ? Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, 1)
      : firstMonth;

  while (monthStart < endTimestamp) {
    monthStarts.push(monthStart);
    const date = new Date(monthStart);
    monthStart = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
  }

  return monthStarts;
}
