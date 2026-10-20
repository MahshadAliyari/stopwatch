/**
 * alarm.js — a short beep + vibration when the timer ends.
 * Browsers only allow audio after a user gesture, so primeAudio()
 * is called from the Start button click.
 */
let audioContext = null;

export function primeAudio() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioContext ??= new Ctx();
    if (audioContext.state === "suspended") audioContext.resume();
  } catch {
    audioContext = null; // sound is a bonus, never a requirement
  }
}
export function playAlarm() {
  navigator.vibrate?.([200, 100, 200, 100, 400]);
  if (!audioContext) return;

  try {
    [0, 0.32, 0.64].forEach((offset) => {
      const start = audioContext.currentTime + offset;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);

      osc.connect(gain).connect(audioContext.destination);
      osc.start(start);
      osc.stop(start + 0.27);
    });
  } catch {
    /* ignore audio failures */
  }
}
