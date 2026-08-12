'use client';

import {Temporal} from '@js-temporal/polyfill';

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
  const zonedTime =
    Temporal.Instant.fromEpochMilliseconds(now).toZonedDateTimeISO('America/New_York');

  return (
    <time className={styles.localTime} dateTime={zonedTime.toString()}>
      {newYorkTime.format(now)},
    </time>
  );
}
