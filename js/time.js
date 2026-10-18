/**
 * time.js — PURE functions only.
 * No DOM, no timers, no globals: same input -> same output.
 * That makes every function here easy to test and to reuse.
 */
export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const LIMITS = { maxMinutes: 99, maxSeconds: 59};
export const pad = (value, length = 2) => String(value).padStart(length, "0");

/** Break milliseconds into minutes / seconds / centiseconds. */
export function splitTime(ms) {
  const safe = Math.max(0, Math.floor(ms));
  return {
    minutes: Math.floor(safe / MINUTE),
    seconds: Math.floor((safe % MINUTE) / SECOND),
    centis: Math.floor((safe % SECOND) / 10),
  };
}

/** 83450 -> "01:23.45" */
export function formatTime(ms) {
  const { minutes, seconds, centis } = splitTime(ms);
  return `${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
}

/** 83450 -> "01:23" (used for the page title) */
export function formatClock(ms) {
  const { minutes, seconds } = splitTime(ms);
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Validate the timer inputs.
 * Returns { ok: true, ms } or { ok: false, error, field }.
 * Never trust user input — even from a number field.
 */
export function parseDuration(minutesRaw, secondsRaw) {
  const toInt = (raw) => {
    const text = String(raw ?? "").trim();
    if (text === "") return 0;
    return /^\d+$/.test(text) ? Number(text) : NaN;
  };
const minutes = toInt(minutesRaw);
const seconds = toInt(secondsRaw);

if (Number.isNaN(minutes)) {
    return { ok: false, field: "minutes", error: "Minutes must be a whole number." };
  }
  if (Number.isNaN(seconds)) {
    return { ok: false, field: "seconds", error: "Seconds must be a whole number." };
  }
  if (minutes > LIMITS.maxMinutes) {
    return { ok: false, field: "minutes", error: `Minutes can't be more than ${LIMITS.maxMinutes}.` };
  }
  if (seconds > LIMITS.maxSeconds) {
    return { ok: false, field: "seconds", error: `Seconds can't be more than ${LIMITS.maxSeconds}.` };
  }

  const ms = minutes * MINUTE + seconds * SECOND;
  if (ms === 0) {
    return { ok: false, field: "minutes", error: "Set a duration longer than zero." };
  }
  return { ok: true, ms };
}

/**
 * Ring fill between 0 and 1.
 * - stopwatch: one full turn per minute
 * - timer: starts full, empties as time runs out
 */
export function ringProgress({mode, rlapsed, duration}) {
    if (mode === "timer") {
        if (duration <= 0) return 0;
        return Math.min(1, Math.max(0, 1-elapsed/duration));

    }
    return (elapsed % MINUTE) / MINUTE;
}
/** Returns a NEW laps array (never mutates the old one). */
export function addLap(laps, totalMs) {
  const previousTotal = laps.length ? laps[laps.length - 1].total : 0;
  return [
    ...laps,
    { index: laps.length + 1, total: totalMs, split: totalMs - previousTotal },
  ];
}

/** Fastest / slowest lap — only meaningful from 3 laps up. */
export function findExtremes(laps) {
  if (laps.length < 3) return { best: null, worst: null };
  const splits = laps.map((lap) => lap.split);
  const fastest = Math.min(...splits);
  const slowest = Math.max(...splits);
  return {
    best: laps.find((lap) => lap.split === fastest).index,
    worst: laps.find((lap) => lap.split === slowest).index,
  };
}