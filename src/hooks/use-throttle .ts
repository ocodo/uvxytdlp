import { useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for throttling function calls.
 * Ensures that a function is called at most once within a specified time interval.
 *
 * @param callback The function to be throttled.
 * @param delay The throttling delay in milliseconds.
 * @returns A throttled version of the callback function.
 */
export const useThrottle = <T extends (...args: []) => void>(callback: T, delay: number): T => {
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastArgs = useRef<[] | null>(null);
  const lastThis = useRef(null);

  const throttledFunction = useCallback(function(this: never, ...args: []) {
    lastArgs.current = args;
    lastThis.current = this;

    // If there's no active timeout, execute immediately and set a new timeout
    if (!throttleTimeout.current) {
      callback.apply(this, args);
      throttleTimeout.current = setTimeout(() => {
        // After the delay, clear the timeout and reset args/this
        throttleTimeout.current = null;
        lastArgs.current = null;
        lastThis.current = null;
      }, delay);
    }
  }, [callback, delay]);

  // Cleanup effect: clear timeout if component unmounts or dependencies change
  useEffect(() => {
    return () => {
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
    };
  }, [delay]);

  return throttledFunction as T;
};
