import {type CSSProperties, useMemo} from 'react';

import {type DateValue, getMonthStarts, toTimestamp} from '../lib/timeRange';

import styles from './MonthMarks.module.css';

type MonthMarksProps = {
  start: DateValue;
  end: DateValue;
  className?: string;
  loading?: boolean;
};

const monthFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  timeZone: 'UTC',
});

export default function MonthMarks({
  start,
  end,
  className,
  loading = false,
}: MonthMarksProps) {
  const startTimestamp = toTimestamp(start);
  const duration = toTimestamp(end) - startTimestamp;
  const monthStarts = useMemo(() => getMonthStarts(start, end), [end, start]);
  const marksClassName = [styles.marks, className].filter(Boolean).join(' ');

  if (loading) {
    return (
      <div className={marksClassName} aria-hidden="true">
        <span className={styles.loading}>loading</span>
      </div>
    );
  }

  if (duration <= 0) {
    return null;
  }

  return (
    <div className={marksClassName} aria-hidden="true">
      {monthStarts.map(monthStart => (
        <span
          className={styles.mark}
          data-timeline-cursor-focus-target
          style={
            {
              '--month-mark-position': `${
                ((monthStart - startTimestamp) / duration) * 100
              }%`,
            } as CSSProperties
          }
          key={monthStart}
        >
          {monthFormatter.format(monthStart).toLowerCase()}
        </span>
      ))}
    </div>
  );
}
