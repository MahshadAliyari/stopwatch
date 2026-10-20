/**
 * clock.js — the timing engine.
 * Knows nothing about the DOM. It only counts time and reports back.
 *
 * Accuracy rule: setInterval is NOT a reliable clock (browsers throttle it,
 * especially in background tabs). So we never add "10ms per tick".
 * Instead every tick re-reads Date.now() and computes the real elapsed time.
 */
export function createClock({ onTick, onFinish, tickMs = 10 }) {
  let intervalId = null; // null => not running
  let startedAt = 0; // Date.now() when the current run began
  let accumulated = 0; // time banked from earlier runs (before pauses)
  let limit = null; // ms for countdown, null for stopwatch

  const isRunning = () => intervalId !== null;

  const getElapsed = () =>
    accumulated + (isRunning() ? Date.now() - startedAt : 0);
  function stopInterval() {
    clearInterval(intervalId); // always clean up the interval
    intervalId = null;
  }
  function tick() {
    const elapsed = getElapsed();

    if (limit !== null && elapsed >= limit) {
      stopInterval();
      accumulated = limit;
      onTick(limit);
      onFinish();
      return;
    }
    onTick(elapsed);
  }
  function start() {
    if (isRunning()) return; // guard: never create two intervals
    startedAt = Date.now();
    intervalId = setInterval(tick, tickMs);
    tick();
  }
  function pause() {
    if (!isRunning()) return;
    accumulated = getElapsed(); // bank the time before stopping
    stopInterval();
  }

  function reset() {
    stopInterval();
    accumulated = 0;
    startedAt = 0;
  }

  function setLimit(ms) {
    limit = ms;
  }
  return { start, pause, reset, setLimit, getElapsed, isRunning };
}
