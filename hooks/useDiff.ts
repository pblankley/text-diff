import { useState, useEffect, useRef, useCallback } from 'react';
import { computeDiff } from '@/lib/diffEngine';
import { DiffResult } from '@/lib/types';

const DEBOUNCE_MS = 1000; // Wait 1 second after user stops typing
const PASTE_DEBOUNCE_MS = 100; // Much faster for paste operations

export function useDiff(leftText: string, rightText: string) {
  const [diffResult, setDiffResult] = useState<DiffResult>({
    leftLines: [],
    rightLines: []
  });
  const [isComputing, setIsComputing] = useState(false);
  
  // Track if we should use fast mode (for paste)
  const useFastModeRef = useRef(false);

  // Debounce to avoid interrupting user while typing
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Function to trigger immediate diff computation (for paste)
  const triggerImmediateDiff = useCallback(() => {
    useFastModeRef.current = true;
  }, []);

  useEffect(() => {
    // Clear previous timeout - user is still typing
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Use fast mode if triggered, then reset
    const debounceTime = useFastModeRef.current ? PASTE_DEBOUNCE_MS : DEBOUNCE_MS;
    useFastModeRef.current = false;

    // Debounce - wait for user to stop typing before computing diff
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
    }, debounceTime);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [leftText, rightText]);

  return { diffResult, isComputing, triggerImmediateDiff };
}
