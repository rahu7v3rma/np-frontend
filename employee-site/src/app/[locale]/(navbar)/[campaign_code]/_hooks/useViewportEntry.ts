'use client';

import { MutableRefObject, useEffect } from 'react';

const useViewportEntry = (
  ref: MutableRefObject<HTMLDivElement | null>,
  cb: () => void,
  observerOptions?: IntersectionObserverInit,
) => {
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // if the element is intersecting (with the viewport) call the callback
      if (entry.isIntersecting) {
        cb();
      }
    }, observerOptions);

    const currentElement = ref.current;

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => observer.disconnect();

    // need to add ref.current instead of ref to work beyond page 2 that's why i add ref.current
  }, [ref.current, cb, observerOptions]);

  return null;
};

export default useViewportEntry;
