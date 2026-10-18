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
  const rule = new Audio(
    `${import.meta.env.BASE_URL}instructions/${step + 1}-rule.mp3`,
  );
  narration = rule;
  if (prompt) {
    const line = new Audio(
      `${import.meta.env.BASE_URL}instructions/${step + 1}-line.mp3`,
    );
    line.preload = "auto";
    rule.onended = () => {
      if (id !== narrationId) return;
      narration = line;
      line.play().catch(() => {});
    };
  }
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

export function chime(kind = "find", enabled = true) {
  if (!enabled) return;
  respectDeviceMute();
  try {
    context ||= new (window.AudioContext || window.webkitAudioContext)();
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
