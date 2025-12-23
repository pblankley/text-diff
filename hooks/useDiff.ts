import { useState, useEffect, useRef } from 'react';
import { computeDiff } from '@/lib/diffEngine';
import { DiffResult } from '@/lib/types';

const DEBOUNCE_MS = 1000; // Wait 1 second after user stops typing

export function useDiff(leftText: string, rightText: string) {
  const [diffResult, setDiffResult] = useState<DiffResult>({
    leftLines: [],
    rightLines: []
  });
  const [isComputing, setIsComputing] = useState(false);

  // Debounce to avoid interrupting user while typing
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear previous timeout - user is still typing
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Always debounce - wait for user to stop typing before computing diff
    timeoutRef.current = setTimeout(() => {
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
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [leftText, rightText]);

  return { diffResult, isComputing };
}
