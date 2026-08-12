'use client';

import {useLayoutEffect, useState, type RefObject} from 'react';

export default function useIsOverflowing(ref: RefObject<HTMLElement | null>) {
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    let active = true;
    const update = () => {
      if (active) {
        setIsOverflowing(element.scrollWidth > element.clientWidth);
      }
    };
    const observer = new ResizeObserver(update);

    update();
    observer.observe(element);
    void document.fonts.ready.then(update);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [ref]);

  return isOverflowing;
}
