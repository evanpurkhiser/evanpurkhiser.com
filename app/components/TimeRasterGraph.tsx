'use client';

import {useEffect, useMemo, useRef, useState, type CSSProperties} from 'react';

import {type DateValue, getMonthStarts, toTimestamp} from '../lib/timeRange';

import styles from './TimeRasterGraph.module.css';

export type TimeRasterDatum = {
  start: DateValue;
  end?: DateValue;
  value: number;
};

export type TimeRasterBucket = {
  start: Date;
  end: Date;
  value: number;
};

type TimeRasterGraphProps = {
  data: readonly TimeRasterDatum[];
  start: DateValue;
  end: DateValue;
  'aria-label': string;
  bucketGap?: number;
  bucketWidth?: number;
  className?: string;
  color?: string;
  darkColor?: string;
  emptyColor?: string;
  height?: number;
  intensityExponent?: number;
  loading?: boolean;
  maxBuckets?: number;
  monthTickGap?: number;
  monthTickHeight?: number;
  revealColor?: string;
  revealDarkColor?: string;
  revealWidth?: number;
  scale?: 'linear' | 'log';
  showMonthTicks?: boolean;
  tickColor?: string;
};

const DEFAULT_MAX_BUCKETS = 2016;
const DEFAULT_INITIAL_WIDTH = 800;
const ACCENT_START = 0.72;
const REVEAL_BACKGROUND_INSET = 4;

export function quantizeTimeRaster(
  data: readonly TimeRasterDatum[],
  start: DateValue,
  end: DateValue,
  bucketCount: number,
): TimeRasterBucket[] {
  const startTimestamp = toTimestamp(start);
  const endTimestamp = toTimestamp(end);
  const count = Math.max(0, Math.floor(bucketCount));
  const duration = endTimestamp - startTimestamp;

  if (!Number.isFinite(duration) || duration <= 0 || count === 0) {
    return [];
  }

  const bucketDuration = duration / count;
  const values = new Float64Array(count);

  for (const datum of data) {
    if (!Number.isFinite(datum.value) || datum.value <= 0) {
      continue;
    }

    const datumStart = toTimestamp(datum.start);

    if (!Number.isFinite(datumStart)) {
      continue;
    }

    if (datum.end === undefined) {
      if (datumStart < startTimestamp || datumStart >= endTimestamp) {
        continue;
      }

      const bucketIndex = Math.min(
        count - 1,
        Math.floor((datumStart - startTimestamp) / bucketDuration),
      );
      values[bucketIndex] += datum.value;
      continue;
    }

    const datumEnd = toTimestamp(datum.end);

    if (
      !Number.isFinite(datumEnd) ||
      datumEnd <= datumStart ||
      datumEnd <= startTimestamp ||
      datumStart >= endTimestamp
    ) {
      continue;
    }

    const visibleStart = Math.max(datumStart, startTimestamp);
    const visibleEnd = Math.min(datumEnd, endTimestamp);
    const firstBucket = Math.max(
      0,
      Math.floor((visibleStart - startTimestamp) / bucketDuration),
    );
    const lastBucket = Math.min(
      count - 1,
      Math.ceil((visibleEnd - startTimestamp) / bucketDuration) - 1,
    );

    for (let bucketIndex = firstBucket; bucketIndex <= lastBucket; bucketIndex++) {
      const bucketStart = startTimestamp + bucketIndex * bucketDuration;
      const bucketEnd = bucketStart + bucketDuration;
      const overlap = Math.max(
        0,
        Math.min(visibleEnd, bucketEnd) - Math.max(visibleStart, bucketStart),
      );

      values[bucketIndex] += datum.value * (overlap / (datumEnd - datumStart));
    }
  }

  return Array.from(values, (value, index) => ({
    start: new Date(startTimestamp + index * bucketDuration),
    end: new Date(startTimestamp + (index + 1) * bucketDuration),
    value,
  }));
}

function getIntensity(
  value: number,
  maximum: number,
  scale: 'linear' | 'log',
  exponent: number,
) {
  if (value <= 0 || maximum <= 0) {
    return 0;
  }

  const normalized =
    scale === 'log' ? Math.log1p(value) / Math.log1p(maximum) : value / maximum;
  const curved = normalized ** Math.max(0.1, exponent);

  return 0.12 + Math.min(1, curved) * 0.88;
}

function getColorIntensities(
  value: number,
  maximum: number,
  scale: 'linear' | 'log',
  exponent: number,
) {
  const intensity = getIntensity(value, maximum, scale, exponent);

  return {
    dark: Math.min(1, intensity / ACCENT_START),
    accent: Math.max(0, (intensity - ACCENT_START) / (1 - ACCENT_START)),
  };
}

export default function TimeRasterGraph({
  data,
  start,
  end,
  'aria-label': ariaLabel,
  bucketGap = 1,
  bucketWidth = 2,
  className,
  color = 'var(--color-orange)',
  darkColor = 'color-mix(in oklch, var(--color-canvas), var(--color-orange) 45%)',
  emptyColor = 'transparent',
  height = 16,
  intensityExponent = 1,
  loading = false,
  maxBuckets = DEFAULT_MAX_BUCKETS,
  monthTickGap = 2,
  monthTickHeight = 6,
  revealColor,
  revealDarkColor,
  revealWidth = 100,
  scale = 'log',
  showMonthTicks = true,
  tickColor = 'var(--color-text-muted)',
}: TimeRasterGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(() =>
    Math.min(DEFAULT_INITIAL_WIDTH, Math.max(1, Math.floor(maxBuckets))),
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const updateWidth = () =>
      setWidth(Math.floor(container.getBoundingClientRect().width));
    const observer = new ResizeObserver(updateWidth);

    updateWidth();
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const stripWidth = Math.max(1, Math.floor(bucketWidth));
  const stripGap = Math.max(0, Math.floor(bucketGap));
  const stripSlot = stripWidth + stripGap;
  const tickHeight = showMonthTicks ? Math.max(0, Math.floor(monthTickHeight)) : 0;
  const tickGap = tickHeight > 0 ? Math.max(0, Math.floor(monthTickGap)) : 0;
  const chartHeight = height + tickGap + tickHeight;
  const bucketCount = Math.min(
    Math.max(1, Math.floor((width + stripGap) / stripSlot)),
    Math.max(1, Math.floor(maxBuckets)),
  );
  const buckets = useMemo(
    () => quantizeTimeRaster(data, start, end, bucketCount),
    [bucketCount, data, end, start],
  );
  const maximum = Math.max(0, ...buckets.map(bucket => bucket.value));
  const graphClassName = [styles.graph, className].filter(Boolean).join(' ');
  const graphWidth = bucketCount * stripSlot - stripGap;
  const startTimestamp = toTimestamp(start);
  const duration = toTimestamp(end) - startTimestamp;
  const monthStarts = useMemo(() => getMonthStarts(start, end), [end, start]);
  const colorRevealWidth = Math.max(1, revealWidth);

  const renderBuckets = () =>
    buckets.map((bucket, index) => {
      const intensity = getColorIntensities(
        bucket.value,
        maximum,
        scale,
        intensityExponent,
      );

      return (
        <rect
          className={styles.bucket}
          style={
            {
              '--time-raster-dark-intensity': `${intensity.dark * 100}%`,
              '--time-raster-color-intensity': `${intensity.accent * 100}%`,
            } as CSSProperties
          }
          x={index * stripSlot}
          y={0}
          width={stripWidth}
          height={height}
          key={bucket.start.getTime()}
        />
      );
    });

  const renderMonthTicks = () =>
    tickHeight > 0 &&
    duration > 0 &&
    monthStarts.map(monthStart => (
      <rect
        className={styles.monthTick}
        x={Math.round(((monthStart - startTimestamp) / duration) * graphWidth)}
        y={height + tickGap}
        width={1}
        height={tickHeight}
        key={monthStart}
      />
    ));

  return (
    <div
      className={styles.container}
      style={
        {
          '--time-raster-chart-height': `${chartHeight}px`,
          '--time-raster-height': `${height}px`,
          '--time-raster-empty': emptyColor,
        } as CSSProperties
      }
      ref={containerRef}
    >
      {loading ? (
        <div
          className={styles.placeholder}
          role="img"
          aria-label={`${ariaLabel}, loading`}
        />
      ) : (
        bucketCount > 0 && (
          <>
            <svg
              className={`${graphClassName} ${styles.baseLayer}`}
              style={
                {
                  '--time-raster-color': color,
                  '--time-raster-dark': darkColor,
                  '--time-raster-empty': emptyColor,
                  '--time-raster-tick': tickColor,
                } as CSSProperties
              }
              height={chartHeight}
              viewBox={`0 0 ${graphWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              shapeRendering="crispEdges"
              role="img"
              aria-label={ariaLabel}
            >
              {renderBuckets()}
              {renderMonthTicks()}
            </svg>
            {revealColor && (
              <svg
                className={`${graphClassName} ${styles.colorLayer}`}
                style={
                  {
                    '--time-raster-color': revealColor,
                    '--time-raster-dark': revealDarkColor ?? revealColor,
                    '--time-raster-empty': emptyColor,
                    '--time-raster-tick': tickColor,
                    '--time-raster-reveal-half-width': `${colorRevealWidth / 2}px`,
                  } as CSSProperties
                }
                height={chartHeight + REVEAL_BACKGROUND_INSET * 2}
                viewBox={`-${REVEAL_BACKGROUND_INSET} -${REVEAL_BACKGROUND_INSET} ${graphWidth + REVEAL_BACKGROUND_INSET * 2} ${chartHeight + REVEAL_BACKGROUND_INSET * 2}`}
                preserveAspectRatio="none"
                shapeRendering="crispEdges"
                aria-hidden="true"
              >
                <rect
                  className={styles.colorBackdrop}
                  x={-REVEAL_BACKGROUND_INSET}
                  y={-REVEAL_BACKGROUND_INSET}
                  width={graphWidth + REVEAL_BACKGROUND_INSET * 2}
                  height={height + REVEAL_BACKGROUND_INSET * 2}
                />
                {renderBuckets()}
                {renderMonthTicks()}
              </svg>
            )}
          </>
        )
      )}
    </div>
  );
}
