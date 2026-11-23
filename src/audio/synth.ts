let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

declare global {
  interface Window { webkitAudioContext?: typeof AudioContext }
}

/** Lager AudioContext ved første bruk og vekker den hvis nettleseren har stoppet den. */
export function audio(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext!;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp);
    comp.connect(ctx.destination);
  }
  // Safari på iPad har også tilstanden «interrupted» når lydøkten blir avbrutt (bytte app, samtale, Siri).
  // Da får mikrofonen bare nuller, og den våkner ikke alltid av seg selv.
  if (ctx.state !== 'running' && ctx.state !== 'closed') void ctx.resume().catch(() => {});
  return ctx;
}

/**
 * Ny lydmotor, og den gamle stenges. Brukes til mikrofonen: på iPad kan en lydmotor som har spilt lyd før mikrofonen
 * ble åpnet, gi bare nuller fra den.
 */
export function freshAudio(): AudioContext {
  const old = ctx;
  ctx = null; master = null; noiseBuf = null;
  if (old && old.state !== 'closed') void old.close().catch(() => {});
  return audio();
}

/** AudioContext uten å vekke den. Bare gyldig etter at `audio()` er kalt. */
export const audioCtx = (): AudioContext => ctx!;
export const masterBus = (): GainNode => master!;

export function tone(m: number, when: number, dur: number, vel: number, dest?: AudioNode): void {
  const c = ctx!;
  const f = 440 * Math.pow(2, (m - 69) / 12);
  const o1 = c.createOscillator(), o2 = c.createOscillator();
  const g = c.createGain(), g2 = c.createGain(), lp = c.createBiquadFilter();
  o1.type = 'triangle'; o1.frequency.value = f;
  o2.type = 'sine'; o2.frequency.value = f * 2;
  g2.gain.value = 0.28;
  lp.type = 'lowpass'; lp.frequency.value = Math.min(9000, f * 7);
  o1.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(dest || master!);
  const peak = 0.32 * vel;
  const end = when + Math.max(dur, 0.06);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(peak, when + 0.006);
  g.gain.exponentialRampToValueAtTime(peak * 0.4, when + 0.2);
  g.gain.setTargetAtTime(0.0001, end, 0.05);
  o1.start(when); o2.start(when);
  o1.stop(end + 0.4); o2.stop(end + 0.4);
}

export function click(when: number, accent: boolean, dest?: AudioNode): void {
  const c = ctx!;
  if (!noiseBuf) {
    const len = Math.floor(c.sampleRate * 0.03);
    noiseBuf = c.createBuffer(1, len, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
  }
  const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
  src.buffer = noiseBuf;
  bp.type = 'bandpass'; bp.frequency.value = accent ? 2600 : 1700; bp.Q.value = 1.1;
  g.gain.value = accent ? 1.0 : 0.6;
  src.connect(bp); bp.connect(g); g.connect(dest || master!);
  src.start(when);
}
