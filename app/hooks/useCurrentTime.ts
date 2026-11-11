'use client';

import {useEffect, useState} from 'react';

const MINUTE_MILLISECONDS = 60_000;

function currentTime() {
  return Date.now();
}

function timeUntilNextMinute(now: number) {
  return MINUTE_MILLISECONDS - (now % MINUTE_MILLISECONDS);
}

export default function useCurrentTime(initialTime: number) {
  const [now, setNow] = useState(initialTime);

  useEffect(() => {
    let timeout: number;

    function updateAndSchedule() {
      const updatedTime = currentTime();
      setNow(updatedTime);
      timeout = window.setTimeout(updateAndSchedule, timeUntilNextMinute(updatedTime));
    }

    updateAndSchedule();

    return () => window.clearTimeout(timeout);
  }, []);

  return now;
}
