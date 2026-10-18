# Curtain Call · Stopwatch & Timer

A stopwatch and countdown timer built with ** JavaScript** — no libraries, no frameworks.
Crimson-and-black stage theme, mobile-first and fully responsive.

> Sahneh Holding · Phase 04 (JavaScript) · Exercise 09

## Features

- **Stopwatch** with start / pause / resume / reset
- **Lap tracking** — split time and total time per lap; fastest lap highlighted green, slowest red (from 3 laps)
- **Countdown timer** with minutes + seconds inputs and quick presets (1, 5, 10, 25 min)
- **Input validation** with clear error messages (empty, zero, negative, non-numeric, over 99 min / 59 s)
- Progress ring and live time in the browser tab title
- Alarm sound + vibration when the timer ends
- Keyboard shortcuts and accessible markup (ARIA roles, focus styles, reduced-motion support)

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Space` | Start / pause / resume |
| `L` | Record a lap (stopwatch, while running) |
| `R` | Reset |

## Run locally

The app uses ES modules, so it must be served over HTTP — opening `index.html` directly (`file://`) will not work.

**VS Code:** install the *Live Server* extension, then right-click `index.html` → *Open with Live Server*.

**Terminal:**

```bash
npx serve
# or
python -m http.server 5500
```

## Project structure

```
stopwatch/
├── index.html        # Markup and JS hooks
├── css/
│   └── style.css     # Mobile-first styles, design tokens, responsive layouts
├── js/
│   ├── time.js       # Pure functions: formatting, validation, lap logic
│   ├── clock.js      # Timing engine (setInterval + Date.now)
│   ├── ui.js         # All DOM access and rendering
│   ├── alarm.js      # Beep and vibration
│   └── app.js        # App state and event wiring
└── README.md
```

## How it works

- **Separation of concerns.** `time.js` and `clock.js` never touch the DOM; `ui.js` is the only file that does. `app.js` owns the state and connects them.
- **Accurate time.** `setInterval` is not a reliable clock (browsers throttle it in background tabs), so every tick recomputes elapsed time from `Date.now()` instead of adding a fixed step.
- **Interval cleanup.** `clearInterval` runs on pause, reset and when the timer finishes. `start()` guards against creating a second interval.
- **State-driven UI.** CSS reads two attributes on `.stage` — `data-mode` (`stopwatch` | `timer`) and `data-state` (`idle` | `running` | `paused` | `finished`). JavaScript only flips them.
- **Safe rendering.** Content is inserted with `textContent` / `createElement` — never `innerHTML`.
- **Immutable laps.** `addLap` returns a new array instead of mutating the old one.

## Tech

HTML · CSS (custom properties, grid, conic-gradient, SVG) · JavaScript (ES modules, closures, Web Audio API)

Fonts: [Syne](https://fonts.google.com/specimen/Syne) and [Chivo Mono](https://fonts.google.com/specimen/Chivo+Mono) via Google Fonts.

## Live Demo



## AI Transparency

- **Section:** JavaScript concepts (stopwatch logic) and the color scheme of the project's appearance.
- **How I used it:** I asked the AI to explain the JavaScript concepts required to build the stopwatch. I also asked it for help choosing the color scheme for the project's appearance.
