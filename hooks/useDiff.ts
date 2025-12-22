import { useState, useEffect, useRef } from 'react';
import { computeDiff } from '@/lib/diffEngine';
import { DiffResult } from '@/lib/types';

export function useDiff(leftText: string, rightText: string) {
  const [diffResult, setDiffResult] = useState<DiffResult>({
    leftLines: [],
    rightLines: []
  });
  const [isComputing, setIsComputing] = useState(false);

  // Debounce for performance with large texts
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // For very large texts (>10k lines), use debouncing
    const leftLineCount = leftText.split('\n').length;
    const rightLineCount = rightText.split('\n').length;
    const shouldDebounce = leftLineCount > 10000 || rightLineCount > 10000;

    const computeDiffAsync = () => {
      setIsComputing(true);

      // Use requestIdleCallback for non-blocking computation
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          const result = computeDiff(leftText, rightText);
          setDiffResult(result);
          setIsComputing(false);
        }, { timeout: 500 });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          const result = computeDiff(leftText, rightText);
          setDiffResult(result);
          setIsComputing(false);
        }, 0);
      }
    };

    if (shouldDebounce) {
      timeoutRef.current = setTimeout(computeDiffAsync, 300);
    } else {
      computeDiffAsync();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [leftText, rightText]);

  return { diffResult, isComputing };
}
