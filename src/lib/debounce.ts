/**
 * Creates a debounced version of a function. The debounced function will only
 * execute once after a specified wait period has passed since the last time
 * the debounced function was invoked. This prevents multiple rapid calls to
 * the function, for example, when typing quickly or resizing a GUI window.
 *
 * Take care to define debounced functions out side of a render loop, or it will
 * re-trigger on every frame of the render loop.
 *
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @param {boolean} [immediate=false] - If true, the function will be invoked
 *        on the leading edge of the wait period (instead of the trailing edge).
 * @returns {Function} A debounced version of the provided function.
 *
 * @example
 * const debouncedLog = debounce(function() {
 *   console.log('Executed after delay');
 * }, 1000);
 *
 * This will only call the function once after 1000ms, even though
 * it might be invoked multiple times in rapid succession.
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return function executedFunction(this: any, ...args: any[]): void {
    const context = this;
    const later = () => {
      timeout = undefined;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}
