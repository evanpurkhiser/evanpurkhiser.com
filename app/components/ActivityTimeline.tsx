'use client';

import {useMemo, useRef} from 'react';

import {useQuery, type QueryFunction} from '@tanstack/react-query';
import {
  useMotionValueEvent,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';

import {
  dailyActivityToTimeRaster,
  loadAtuinActivity,
  loadGitHubActivity,
} from '../lib/activityAdapters';
import type {DailyActivity} from '../lib/dailyActivity';
import {type DateValue, toTimestamp} from '../lib/timeRange';

import styles from './ActivityTimeline.module.css';
import MonthMarks from './MonthMarks';
import {TimelineCursor, useTimelineCursor} from './TimelineCursor';
import TimeRasterGraph from './TimeRasterGraph';

const DAY = 24 * 60 * 60 * 1000;
const INTENSITY_EXPONENT = 2;
const REVEAL_WIDTH = 100;

const palettes = {
  terminalActivity: {darkColor: '#ffa96e', color: '#ff6800'},
  github: {darkColor: '#72ed88', color: '#00d638'},
  monochrome: {darkColor: '#a0a0a0', color: '#000000'},
} as const;

type ActivityGraphProps = {
  active: boolean;
  cursorWidth: MotionValue<number>;
  cursorX: MotionValue<number>;
  id: string;
  label: string;
  source: ActivitySource;
  indicatorColor?: string;
  color?: string;
  darkColor?: string;
  intensityExponent?: number;
  revealColor?: string;
  revealDarkColor?: string;
  showRevealMonthTicks?: boolean;
};

type ActivitySource = ReturnType<typeof useActivity>;

function getWindowTotal(
  data: ReadonlyArray<{start: DateValue; value: number}>,
  start: DateValue,
  end: DateValue,
  cursorX: number,
  cursorWidth: number,
  revealWidth: number,
) {
  const startTimestamp = toTimestamp(start);
  const duration = toTimestamp(end) - startTimestamp;

  if (duration <= 0 || cursorWidth <= 0) {
    return 0;
  }

  const halfWindow = (duration * revealWidth) / cursorWidth / 2;
  const center = startTimestamp + (duration * cursorX) / cursorWidth;
  const windowStart = center - halfWindow;
  const windowEnd = center + halfWindow;

  return data.reduce((total, datum) => {
    const timestamp = toTimestamp(datum.start);

    return timestamp >= windowStart && timestamp < windowEnd
      ? total + datum.value
      : total;
  }, 0);
}

function MotionNumber({value}: {value: MotionValue<number>}) {
  const ref = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(value, 'change', latest => {
    if (!ref.current) {
      return;
    }

    ref.current.textContent = `${Math.round(latest).toLocaleString()}×`;
  });

  return <span ref={ref}>0×</span>;
}

function useActivity(
  queryKey: readonly string[],
  queryFn: QueryFunction<DailyActivity[]>,
) {
  const {
    data: activity = [],
    isError: failed,
    isPending: loading,
  } = useQuery({
    queryKey,
    queryFn,
  });

  const rasterData = useMemo(() => dailyActivityToTimeRaster(activity), [activity]);

  return {
    activity,
    failed,
    loading,
    rasterData,
    start: rasterData.at(0)?.start ?? 0,
    end: rasterData.at(-1)?.end ?? DAY,
  };
}

function ActivityGraph({
  active,
  cursorWidth,
  cursorX,
  id,
  label,
  source,
  indicatorColor,
  color,
  darkColor,
  intensityExponent,
  revealColor,
  revealDarkColor,
  showRevealMonthTicks,
}: ActivityGraphProps) {
  const {activity, failed, loading, rasterData, start, end} = source;
  const total = activity.reduce((sum, bucket) => sum + bucket.count, 0);
  const summary = failed
    ? 'unavailable'
    : loading
      ? 'loading…'
      : `${total.toLocaleString()}× / 365d`;
  const summaryLabel = failed
    ? `${label} unavailable`
    : loading
      ? `${label} loading`
      : `${total.toLocaleString()} entries over 365 days`;
  const windowTotal = useTransform(() =>
    getWindowTotal(
      rasterData,
      start,
      end,
      cursorX.get(),
      cursorWidth.get(),
      REVEAL_WIDTH,
    ),
  );
  const animatedWindowTotal = useSpring(windowTotal, {
    damping: 80,
    mass: 0.1,
    stiffness: 1000,
  });

  return (
    <section className={styles.activityGraph} aria-labelledby={id}>
      <div className={styles.heading}>
        <h2 id={id}>
          {indicatorColor && (
            <span
              className={styles.indicator}
              style={{backgroundColor: indicatorColor}}
              aria-hidden="true"
            />
          )}
          {label}
        </h2>
        <span
          className={styles.cursorLabelTrack}
          data-timeline-cursor-label-track
          aria-hidden="true"
        >
          <span className={styles.cursorLabel}>
            <MotionNumber value={animatedWindowTotal} />
          </span>
        </span>
        <span className={styles.summary} role="status" aria-label={summaryLabel}>
          {summary}
        </span>
      </div>

      <TimeRasterGraph
        active={active}
        data={rasterData}
        start={start}
        end={end}
        color={color}
        darkColor={darkColor}
        intensityExponent={intensityExponent}
        revealColor={revealColor}
        revealDarkColor={revealDarkColor}
        revealWidth={REVEAL_WIDTH}
        showRevealMonthTicks={showRevealMonthTicks}
        loading={loading}
        emptyColor={loading ? 'var(--color-surface)' : undefined}
        aria-label={`${label} activity over the last 365 days`}
      />
    </section>
  );
}

export default function ActivityTimeline() {
  const palette = palettes.monochrome;
  const terminalActivity = useActivity(['activity', 'atuin'], loadAtuinActivity);
  const github = useActivity(['activity', 'github'], loadGitHubActivity);
  const cursor = useTimelineCursor<HTMLDivElement>({focusWidth: REVEAL_WIDTH});
  const hasGitHubActivity = github.activity.length > 0;

  return (
    <div className={styles.collection}>
      <div className={styles.cursorRegion} {...cursor.containerProps}>
        <div className={styles.graphs}>
          <ActivityGraph
            active={cursor.active}
            cursorWidth={cursor.width}
            cursorX={cursor.x}
            id="terminal-activity-title"
            label="Terminal"
            source={terminalActivity}
            indicatorColor={palettes.terminalActivity.color}
            color={palette.color}
            darkColor={palette.darkColor}
            intensityExponent={INTENSITY_EXPONENT}
            revealColor={palettes.terminalActivity.color}
            revealDarkColor={palettes.terminalActivity.darkColor}
          />
          <ActivityGraph
            active={cursor.active}
            cursorWidth={cursor.width}
            cursorX={cursor.x}
            id="github-title"
            label="GitHub"
            source={github}
            indicatorColor={palettes.github.color}
            color={palette.color}
            darkColor={palette.darkColor}
            intensityExponent={INTENSITY_EXPONENT}
            revealColor={palettes.github.color}
            revealDarkColor={palettes.github.darkColor}
            showRevealMonthTicks={false}
          />
        </div>
        <MonthMarks loading={!hasGitHubActivity} start={github.start} end={github.end} />
        <TimelineCursor active={cursor.active} />
      </div>
    </div>
  );
}
