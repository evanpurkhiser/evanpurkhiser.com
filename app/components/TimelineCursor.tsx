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

import Mark from './Mark';
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
  onPointerEnter: (event: ReactPointerEvent<E>) => void;
  onPointerLeave: (event: ReactPointerEvent<E>) => void;
  onPointerMove: (event: ReactPointerEvent<E>) => void;
  ref: RefObject<E | null>;
};

function useTimelineCursor<E extends HTMLElement>({
  enabled = true,
}: TimelineCursorOptions = {}) {
  const containerRef = useRef<E>(null);
  const frameRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);

  const updatePosition = useCallback((clientX: number, clientY: number) => {
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

      container.style.setProperty('--timeline-cursor-x', `${offset}px`);
      container.style.setProperty('--timeline-cursor-viewport-x', `${clientX}px`);
      container.style.setProperty('--timeline-cursor-viewport-y', `${clientY}px`);
    });
  }, []);

  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<E>) => {
      if (!enabled || event.pointerType === 'touch') {
        return;
      }

      updatePosition(event.clientX, event.clientY);
      setActive(true);
    },
    [enabled, updatePosition],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<E>) => {
      if (!enabled || event.pointerType === 'touch') {
        return;
      }

      updatePosition(event.clientX, event.clientY);
    },
    [enabled, updatePosition],
  );

  const handlePointerLeave = useCallback((event: ReactPointerEvent<E>) => {
    if (event.pointerType !== 'touch') {
      setActive(false);
    }
  }, []);

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
    onPointerEnter: handlePointerEnter,
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
  };

  return {active, containerProps};
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
      <Mark
        className={styles.pointer}
        size={12}
        fill="var(--timeline-cursor-solid-color)"
        stroke="var(--color-canvas)"
        strokeWidth={1}
      />
    </div>
  );
}

export {TimelineCursor, useTimelineCursor};
