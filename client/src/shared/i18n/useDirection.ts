import { useCallback } from 'react';
import { useLanguage } from './LanguageContext';

type Direction = 'ltr' | 'rtl';

type LogicalArrowKey = 'prev' | 'next' | 'up' | 'down' | null;

type UseDirectionResult = {
  dir: Direction;
  isRTL: boolean;
  /**
   * Maps a physical KeyboardEvent arrow key to its logical equivalent.
   * In RTL, ArrowLeft is physically left but logically *next* (forward
   * reading direction). Consumed by D3 nodes + keyboard navigation.
   */
  logicalKey: (e: KeyboardEvent | React.KeyboardEvent) => LogicalArrowKey;
};

/**
 * `useDirection` - the canonical hook for direction-aware UI per agent_08 R3.
 *
 * Reads from LanguageContext (which writes <html lang dir>). Returns helpers
 * for logical key mapping. Do not read `document.dir` directly elsewhere.
 */
export function useDirection(): UseDirectionResult {
  const { dir, isRTL } = useLanguage();

  const logicalKey = useCallback(
    (e: KeyboardEvent | React.KeyboardEvent): LogicalArrowKey => {
      switch (e.key) {
        case 'ArrowLeft':
          return isRTL ? 'next' : 'prev';
        case 'ArrowRight':
          return isRTL ? 'prev' : 'next';
        case 'ArrowUp':
          return 'up';
        case 'ArrowDown':
          return 'down';
        default:
          return null;
      }
    },
    [isRTL],
  );

  return { dir, isRTL, logicalKey };
}
