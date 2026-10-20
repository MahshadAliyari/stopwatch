/**
 * ui.js — everything that touches the DOM lives here.
 * It only DISPLAYS state; it never decides anything.
 * Security: we use textContent / createElement only — never innerHTML.
 */
import {
  formatTime,
  formatClock,
  splitTime,
  pad,
  findExtremes,
} from "./time.js";
const RING_CIRCUMFERENCE = 816.81; // 2 * PI * 130 (matches the CSS token)
const BASE_TITLE = "Curtain Call . Stopwatch & Timer";

const byId = (id) => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node;
};
export const el = {
  stage: document.querySelector(".stage"),
  tabs: document.querySelectorAll(".tab"),
  minutes: byId("minutes"),
  seconds: byId("seconds"),
  centis: byId("centis"),
  ring: byId("ring"),
  status: byId("status"),
  inputMinutes: byId("input-minutes"),
  inputSeconds: byId("input-seconds"),
  presets: document.querySelectorAll(".chip"),
  error: byId("timer-error"),
  primary: byId("btn-primary"),
  secondary: byId("btn-secondary"),
  reset: byId("btn-reset"),
  lapsList: byId("laps-list"),
};
/* ---------- time & ring ---------- */
export function renderTime(ms) {
  const { minutes, seconds, centis } = splitTime(ms);
  el.minutes.textContent = pad(minutes);
  el.seconds.textContent = pad(seconds);
  el.centis.textContent = pad(centis);
}

export function renderRing(progress) {
  el.ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - progress));
}

let lastTitle = "";
/** Show the running time in the browser tab (only when the second changes). */
export function renderTitle(ms) {
  const next = ms === null ? BASE_TITLE : `${formatClock(ms)} · Curtain Call`;
  if (next !== lastTitle) {
    document.title = next;
    lastTitle = next;
  }
}

/* ---------- mode, state, buttons ---------- */
export function setMode(mode) {
  el.stage.dataset.mode = mode;
  el.tabs.forEach((tab) => {
    tab.setAttribute("aria-selected", String(tab.dataset.mode === mode));
  });
}
const PRIMARY_LABEL = {
  idle: "Start",
  running: "Pause",
  paused: "Resume",
  finished: "Restart",
};

const STATUS_TEXT = {
  stopwatch: {
    idle: "Ready when you are",
    running: "Running",
    paused: "Paused",
  },
  timer: {
    idle: "Set a duration",
    running: "Counting down",
    paused: "Paused",
    finished: "Time's up!",
  },
};

export function renderControls({ mode, status }) {
  el.stage.dataset.state = status;
  el.primary.textContent = PRIMARY_LABEL[status];
  el.status.textContent = STATUS_TEXT[mode][status] ?? "";

  el.secondary.disabled = !(mode === "stopwatch" && status === "running");
  el.reset.disabled = status === "idle";

  // Timer inputs can only be edited while idle
  const locked = status !== "idle";
  el.inputMinutes.disabled = locked;
  el.inputSeconds.disabled = locked;
  el.presets.forEach((chip) => (chip.disabled = locked));
}

/* ---------- timer inputs & errors ---------- */
export function readInputs() {
  return { minutes: el.inputMinutes.value, seconds: el.inputSeconds.value };
}

export function writeInputs(totalSeconds) {
  el.inputMinutes.value = Math.floor(totalSeconds / 60);
  el.inputSeconds.value = totalSeconds % 60;
}

export function showError(message, field) {
  el.error.textContent = message;
  el.error.hidden = false;
  const target = field === "seconds" ? el.inputSeconds : el.inputMinutes;
  target.setAttribute("aria-invalid", "true");
  target.focus();
}

export function clearError() {
  el.error.hidden = true;
  el.error.textContent = "";
  el.inputMinutes.removeAttribute("aria-invalid");
  el.inputSeconds.removeAttribute("aria-invalid");
}

/* ---------- laps ---------- */
function makeSpan(className, text) {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
}

export function renderLaps(laps) {
  const { best, worst } = findExtremes(laps);
  const items = [...laps].reverse().map((lap) => {
    const li = document.createElement("li");
    li.className = "lap";
    if (lap.index === best) li.classList.add("lap--best");
    if (lap.index === worst) li.classList.add("lap--worst");

    li.append(
      makeSpan("lap__index", `Lap ${lap.index}`),
      makeSpan("lap__split", `+${formatTime(lap.split)}`),
      makeSpan("lap__total", formatTime(lap.total)),
    );
    return li;
  });
  el.lapsList.replaceChildren(...items);
}
