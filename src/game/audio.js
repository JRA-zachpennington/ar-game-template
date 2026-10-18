let context;

// iOS exposes no mute-switch reading. An ambient audio session is what makes
// Safari follow the hardware silent switch. Desktop and Android already mute
// with the system volume, which a page cannot read.
export function respectDeviceMute() {
  const session = navigator.audioSession;
  if (!session || session.type === "ambient") return;
  try {
    session.type = "ambient";
  } catch {
    /* The browser has no writable audio session. */
  }
}

// Trail briefing narration. The rule file already ends with a short breath,
// then the on-screen line plays. Files are public/instructions/N-rule.mp3
// and N-line.mp3 (see scripts/briefing-speech.mjs).
let narration = null;
let narrationId = 0;
let missClip = null;
const clips = new Map(); // "1-rule" → HTMLAudioElement

function clip(name) {
  if (!clips.has(name)) {
    const audio = new Audio(
      `${import.meta.env.BASE_URL}instructions/${name}.mp3`,
    );
    audio.preload = "auto";
    clips.set(name, audio);
  }
  return clips.get(name);
}

// Call inside a user gesture (home Start). Creates and loads every rule/line
// clip so later steps may play() outside a gesture and start with warm bytes.
export function primeBriefing(steps = 4) {
  for (let n = 1; n <= steps; n++) {
    clip(`${n}-rule`).load();
    clip(`${n}-line`).load();
  }
}

export function hush() {
  narrationId += 1;
  if (narration) {
    narration.onended = null;
    narration.pause();
    narration = null;
  }
  if (missClip) missClip.pause();
}

export function playBriefing(step, { prompt = true, enabled = true } = {}) {
  hush();
  if (!enabled) return;
  respectDeviceMute();
  const id = narrationId;
  const rule = clip(`${step + 1}-rule`);
  rule.currentTime = 0;
  narration = rule;
  if (prompt) {
    const line = clip(`${step + 1}-line`);
    rule.onended = () => {
      if (id !== narrationId) return;
      line.currentTime = 0;
      narration = line;
      line.play().catch(() => {});
    };
  } else rule.onended = null;
  rule.play().catch(() => {});
}

// Soft two-note synth for a missed briefing tap. CC0, no attribution
// required (Kenney Interface Sounds, question_004). A correct tap hushes it.
export function playMiss(enabled = true) {
  hush();
  if (!enabled) return;
  respectDeviceMute();
  missClip ||= new Audio(`${import.meta.env.BASE_URL}instructions/miss.wav`);
  missClip.currentTime = 0;
  missClip.play().catch(() => {});
}

function ensureContext() {
  try {
    context ||= new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    /* No Web Audio here; chimes stay silent. */
  }
  return context;
}

// Call once at app init. Builds the (suspended) context now and resumes it on
// the first user gesture so the first real chime does not pay startup cost.
export function warmAudio() {
  if (!ensureContext()) return;
  const unlock = () => void context.resume().catch(() => {});
  document.addEventListener("pointerdown", unlock, { once: true, capture: true });
  document.addEventListener("keydown", unlock, { once: true, capture: true });
}

export function chime(kind = "find", enabled = true) {
  if (!enabled) return;
  respectDeviceMute();
  if (!ensureContext()) return;
  try {
    void context.resume().catch(() => {});
    const notes =
      kind === "victory"
        ? [523.25, 659.25, 783.99, 1046.5]
        : kind === "cookie"
          ? [659.25, 880]
          : [523.25, 783.99, 1046.5];
    notes.forEach((frequency, index) => {
      const start = context.currentTime + index * 0.12;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.075, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.65);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    });
  } catch {
    /* Silent play remains fully functional. */
  }
}
