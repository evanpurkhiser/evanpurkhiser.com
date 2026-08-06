export type DailyActivity = {
  date: string;
  count: number;
};

export function isDailyActivity(value: unknown): value is DailyActivity[] {
  return (
    Array.isArray(value) &&
    value.every(
      item =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.date === 'string' &&
        typeof item.count === 'number',
    )
  );
}
