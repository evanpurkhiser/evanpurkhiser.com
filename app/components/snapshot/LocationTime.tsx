'use client';

import useCurrentTime from '../../hooks/useCurrentTime';

import styles from './LocationFact.module.css';

const newYorkTime = new Intl.DateTimeFormat('en', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/New_York',
});

export default function LocationTime({initialTime}: {initialTime: number}) {
  const now = useCurrentTime(initialTime);

  return (
    <time className={styles.localTime} dateTime={new Date(now).toISOString()}>
      {newYorkTime.format(now)},
    </time>
  );
}
