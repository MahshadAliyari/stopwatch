/**
 * app.js — the conductor.
 * Owns the app state and wires clock (engine) + ui (display) + time (logic).
 */
import {createClock} from "./clock.js";
import {parseDuration, ringProgress, addLap} from "./time.js";
