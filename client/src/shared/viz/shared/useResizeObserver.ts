import { useEffect, useRef, useState } from 'react';

export type Size = { width: number; height: number };

/**
 * Observe a target element's content-box size. Returns a ref to attach to the
 * element and the latest measured size (rounded to integers to avoid sub-pixel
 * re-renders that would invalidate d3 memoized layouts).
 */
export function useResizeObserver<T extends Element>(
  initial?: Size,
): {
  ref: React.RefObject<T | null>;
  size: Size;
} {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<Size>(initial ?? { width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        const next = { width: Math.round(cr.width), height: Math.round(cr.height) };
        setSize((prev) => (prev.width === next.width && prev.height === next.height ? prev : next));
      }
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  return { ref, size };
}
