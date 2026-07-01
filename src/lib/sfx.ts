type SfxName = "send" | "accept" | "request" | "tick" | "newOrder" | "help";

type ToneStep = {
  frequency: number;
  delay: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
};

const patterns: Record<SfxName, ToneStep[]> = {
  send: [
    { frequency: 587.33, delay: 0, duration: 0.08, volume: 0.032 },
    { frequency: 783.99, delay: 0.075, duration: 0.11, volume: 0.026 },
  ],
  accept: [
    { frequency: 659.25, delay: 0, duration: 0.09, volume: 0.03 },
    { frequency: 880, delay: 0.085, duration: 0.12, volume: 0.026 },
    { frequency: 1174.66, delay: 0.18, duration: 0.16, volume: 0.02 },
  ],
  request: [
    { frequency: 523.25, delay: 0, duration: 0.09, volume: 0.026 },
    { frequency: 698.46, delay: 0.085, duration: 0.12, volume: 0.022 },
  ],
  // Crisp confirmation tick when a customer places an order.
  tick: [
    { frequency: 1318.51, delay: 0, duration: 0.03, type: "square", volume: 0.085 },
    { frequency: 1760, delay: 0.05, duration: 0.06, type: "triangle", volume: 0.07 },
  ],
  // Attention chime for staff when a new order arrives.
  newOrder: [
    { frequency: 880, delay: 0, duration: 0.14, volume: 0.14 },
    { frequency: 1108.73, delay: 0.13, duration: 0.16, volume: 0.13 },
    { frequency: 1318.51, delay: 0.28, duration: 0.26, volume: 0.12 },
  ],
  // Loud, urgent call-bell when a customer asks for assistance (ding-dong x2).
  help: [
    { frequency: 1244.51, delay: 0, duration: 0.14, volume: 0.17 },
    { frequency: 932.33, delay: 0.18, duration: 0.14, volume: 0.17 },
    { frequency: 1244.51, delay: 0.38, duration: 0.14, volume: 0.17 },
    { frequency: 932.33, delay: 0.56, duration: 0.22, volume: 0.16 },
  ],
};

export function playSfx(name: SfxName) {
  if (typeof window === "undefined") return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const master = context.createGain();
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2800;
  master.gain.value = 1.15;
  filter.connect(master);
  master.connect(context.destination);

  patterns[name].forEach((step) => {
    const start = context.currentTime + step.delay;
    const end = start + step.duration;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = step.type ?? "triangle";
    oscillator.frequency.setValueAtTime(step.frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(step.frequency * 0.985, end);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(step.volume ?? 0.024, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gain);
    gain.connect(filter);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  });

  window.setTimeout(() => void context.close(), 700);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
