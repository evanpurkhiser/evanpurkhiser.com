'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

import {useMotionValue} from 'framer-motion';

import styles from './TimelineCursor.module.css';

type TimelineCursorOptions = {
  enabled?: boolean;
};

type TimelineCursorProps = {
  active: boolean;
  className?: string;
  dottedColor?: string;
  solidColor?: string;
};

type CursorContainerProps<E extends HTMLElement> = {
  'data-timeline-cursor-active': true | undefined;
  onPointerCancel: () => void;
  onPointerEnter: (event: ReactPointerEvent<E>) => void;
  onPointerLeave: () => void;
  onPointerMove: (event: ReactPointerEvent<E>) => void;
  ref: RefObject<E | null>;
};

function useTimelineCursor<E extends HTMLElement>({
  enabled = true,
}: TimelineCursorOptions = {}) {
  const containerRef = useRef<E>(null);
  const frameRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);
  const x = useMotionValue(0);
  const width = useMotionValue(0);

  const updatePosition = useCallback(
    (clientX: number) => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = window.requestAnimationFrame(() => {
        const container = containerRef.current;

        if (!container) {
          return;
        }

        const bounds = container.getBoundingClientRect();
        const offset = Math.min(bounds.width, Math.max(0, clientX - bounds.left));

        x.set(offset);
        width.set(bounds.width);
        container.style.setProperty('--timeline-cursor-x', `${offset}px`);
        container.style.setProperty('--timeline-cursor-viewport-x', `${clientX}px`);

        container
          .querySelectorAll<HTMLElement>('[data-timeline-cursor-label-track]')
          .forEach(track => {
            const trackBounds = track.getBoundingClientRect();

            track.style.setProperty(
              '--timeline-cursor-label-x',
              `${clientX - trackBounds.left}px`,
            );
          });
      });
    },
    [width, x],
  );

  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<E>) => {
      if (!enabled) {
        return;
      }

      updatePosition(event.clientX);
      setActive(true);
    },
    [enabled, updatePosition],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<E>) => {
      if (!enabled) {
        return;
      }

      updatePosition(event.clientX);
    },
    [enabled, updatePosition],
  );

  const handlePointerLeave = useCallback(() => setActive(false), []);

  useEffect(() => {
    if (!enabled) {
      setActive(false);
    }
  }, [enabled]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    },
    [],
  );

  const containerProps: CursorContainerProps<E> = {
    ref: containerRef,
    'data-timeline-cursor-active': active || undefined,
    onPointerCancel: handlePointerLeave,
    onPointerEnter: handlePointerEnter,
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
  };

  return {active, containerProps, width, x};
}

function TimelineCursor({
  active,
  className,
  dottedColor,
  solidColor,
}: TimelineCursorProps) {
  const cursorClassName = [styles.cursor, active && styles.active, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cursorClassName}
      style={
        {
          '--timeline-cursor-dotted-color': dottedColor,
          '--timeline-cursor-solid-color': solidColor,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <div className={styles.pageLine} />
      <div className={styles.containerLine} />
    </div>
  );
}

export {TimelineCursor, useTimelineCursor};
