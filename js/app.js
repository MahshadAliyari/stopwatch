/**
 * app.js — the conductor.
 * Owns the app state and wires clock (engine) + ui (display) + time (logic).
 */
import {createClock} from "./clock.js";
import {parseDuration, ringProgress, addLap} from "./time.js";
import {playAlarm, primeAudio} from "./alarm.js";
import * as ui from "./ui.js";

const state = {
    mode: "stopwatch",   // "stopwatch" | "timer"
  status: "idle",      // "idle" | "running" | "paused" | "finished"
  duration: 0,         // timer length in ms (fixed when the timer starts)
  laps: [],
};

const clock = createClock({ onTick: handleTick, onFinish: handleFinish});
/* ---------- clock callbacks ---------- */
function handleTick(elapsed) {
  const shown = state.mode === "timer" ? state.duration - elapsed : elapsed;
  ui.renderTime(shown);
  ui.renderRing(ringProgress({ mode: state.mode, elapsed, duration: state.duration }));
  ui.renderTitle(shown);
}
function handleFinish() {
    setStatus("finished");
    playAlarm();
}
/* ---------- state helpers ---------- */
function setStatus(status) {
  state.status = status;
  ui.renderControls({ mode: state.mode, status });
}

/** What the dial shows while idle (0 for stopwatch, chosen duration for timer). */
function refreshIdleDisplay() {
  let ms = 0;
  if (state.mode === "timer") {
    const { minutes, seconds } = ui.readInputs();
    const result = parseDuration(minutes, seconds);
    ms = result.ok ? result.ms : 0;
  }
  ui.renderTime(ms);
  ui.renderRing(ringProgress({ mode: state.mode, elapsed: 0, duration: ms }));
  ui.renderTitle(null);
}

/* ---------- actions ---------- */
function startFresh() {
  if (state.mode === "timer") {
    const { minutes, seconds } = ui.readInputs();
    const result = parseDuration(minutes, seconds);
    if (!result.ok) {
      ui.showError(result.error, result.field);
      return;
    }
    state.duration = result.ms;
    clock.setLimit(result.ms);
  } else {
    clock.setLimit(null);
  }
  ui.clearError();
  clock.start();
  setStatus("running");
}

function togglePrimary() {
    primeAudio();// user gesture: lets the alarm play later

    switch (state.status) {
        case "idle":
            startFresh();
            break;
        case "running":
            clock.pause();
            setStatus("paused") ;
            break;
        case "paused":
            clock.start();
            setStatus("running");
            break;
        case "finished":
            rest();
            startFresh();
            break;
    }
}
function lap() {
  if (state.mode !== "stopwatch" || state.status !== "running") return;
  state.laps = addLap(state.laps, clock.getElapsed());
  ui.renderLaps(state.laps);
}

function reset() {
  clock.reset();
  state.laps = [];
  ui.clearError();
  ui.renderLaps(state.laps);
  setStatus("idle");
  refreshIdleDisplay();
}

function switchMode(mode) {
  if (mode === state.mode) return;
  state.mode = mode;
  ui.setMode(mode);
  reset();
}
/* ---------- events ---------- */
ui.el.primary.addEventListener("click", togglePrimary);
ui.el.secondary.addEventListener("click", lap);
ui.el.reset.addEventListener("click", reset);

ui.el.tabs.forEach((tab) =>
  tab.addEventListener("click", () => switchMode(tab.dataset.mode)),
);

// Presets: one listener per chip is fine here (only four, never re-created)
ui.el.presets.forEach((chip) =>
  chip.addEventListener("click", () => {
    ui.writeInputs(Number(chip.dataset.seconds));
    ui.clearError();
    refreshIdleDisplay();
  }),
);

[ui.el.inputMinutes, ui.el.inputSeconds].forEach((input) =>
  input.addEventListener("input", () => {
    ui.clearError();
    if (state.status === "idle") refreshIdleDisplay();
  }),
);

// Keyboard shortcuts: Space = start/pause, L = lap, R = reset
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target.closest("input, button, [role='tab']")) return;

  switch (event.code) {
    case "Space":
      event.preventDefault();
      togglePrimary();
      break;
    case "KeyL":
      lap();
      break;
    case "KeyR":
      reset();
      break;
  }
});

/* ---------- init ---------- */
ui.setMode(state.mode);
reset();