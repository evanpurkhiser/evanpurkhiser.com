'use client';

import {useEffect, useMemo, useState} from 'react';

import {
  dailyActivityToTimeRaster,
  type DailyActivity,
  loadAtuinActivity,
  loadGitHubActivity,
} from '../lib/activityAdapters';

import styles from './ActivityTimeline.module.css';
import MonthMarks from './MonthMarks';
import {TimelineCursor, useTimelineCursor} from './TimelineCursor';
import TimeRasterGraph from './TimeRasterGraph';

const DAY = 24 * 60 * 60 * 1000;
const INTENSITY_EXPONENT = 2;

const palettes = {
  terminalActivity: {darkColor: '#ffa96e', color: '#ff6800'},
  github: {darkColor: '#72ed88', color: '#00d638'},
  monochrome: {darkColor: '#a0a0a0', color: '#000000'},
} as const;

type ActivityGraphProps = {
  id: string;
  label: string;
  source: ActivitySource;
  color?: string;
  darkColor?: string;
  intensityExponent?: number;
  revealColor?: string;
  revealDarkColor?: string;
};

type ActivityLoader = (signal: AbortSignal) => Promise<DailyActivity[]>;
type ActivitySource = ReturnType<typeof useActivity>;

function useActivity(load: ActivityLoader) {
  const [activity, setActivity] = useState<DailyActivity[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    load(controller.signal)
      .then(setActivity)
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setFailed(true);
      });

    return () => controller.abort();
  }, [load]);

  const rasterData = useMemo(() => dailyActivityToTimeRaster(activity), [activity]);

  return {
    activity,
    failed,
    rasterData,
    start: rasterData.at(0)?.start ?? 0,
    end: rasterData.at(-1)?.end ?? DAY,
  };
}

function ActivityGraph({
  id,
  label,
  source,
  color,
  darkColor,
  intensityExponent,
  revealColor,
  revealDarkColor,
}: ActivityGraphProps) {
  const {activity, failed, rasterData, start, end} = source;
  const total = activity.reduce((sum, bucket) => sum + bucket.count, 0);
  const loading = !failed && activity.length === 0;
  const summary = failed
    ? 'unavailable'
    : loading
      ? 'loading…'
      : `${total.toLocaleString()} data points`;

  return (
    <section className={styles.demo} aria-labelledby={id}>
      <div className={styles.heading}>
        <h2 id={id}>{label}</h2>
        <span aria-live="polite">{summary}</span>
      </div>

      <TimeRasterGraph
        data={rasterData}
        start={start}
        end={end}
        color={color}
        darkColor={darkColor}
        intensityExponent={intensityExponent}
        revealColor={revealColor}
        revealDarkColor={revealDarkColor}
        loading={loading}
        emptyColor={loading ? 'var(--color-surface)' : undefined}
        aria-label={`${label} activity over the last 365 days`}
      />
    </section>
  );
}

export default function ActivityTimeline() {
  const palette = palettes.monochrome;
  const terminalActivity = useActivity(loadAtuinActivity);
  const github = useActivity(loadGitHubActivity);
  const cursor = useTimelineCursor<HTMLDivElement>();
  const hasGitHubActivity = github.activity.length > 0;

  return (
    <div className={styles.collection}>
      <div className={styles.cursorRegion} {...cursor.containerProps}>
        <div className={styles.graphs}>
          <ActivityGraph
            id="terminal-activity-title"
            label="Terminal Activity"
            source={terminalActivity}
            color={palette.color}
            darkColor={palette.darkColor}
            intensityExponent={INTENSITY_EXPONENT}
            revealColor={palettes.terminalActivity.color}
            revealDarkColor={palettes.terminalActivity.darkColor}
          />
          <ActivityGraph
            id="github-title"
            label="GitHub Activity"
            source={github}
            color={palette.color}
            darkColor={palette.darkColor}
            intensityExponent={INTENSITY_EXPONENT}
            revealColor={palettes.github.color}
            revealDarkColor={palettes.github.darkColor}
          />
        </div>
        <MonthMarks loading={!hasGitHubActivity} start={github.start} end={github.end} />
        <TimelineCursor active={cursor.active} />
      </div>
    </div>
  );
}
