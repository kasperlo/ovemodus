// Tonegjenkjenning. Ikke endre uten å kjøre mikrofontestene (se CLAUDE.md).

export const F_MIN = 75;
export const F_MAX = 1400;
const YIN_THRESHOLD = 0.15;
const YIN_FALLBACK_MAX = 0.3;
export const MIN_CONFIDENCE = 0.75;
/** Toner lenger unna nærmeste halvtone enn dette (i halvtoner) forkastes. */
export const MAX_SEMITONE_OFFSET = 0.42;
/** Samme tone så mange rammer på rad gir en `stable`-hendelse, og så mange en `sustain`. */
export const STABLE_FRAMES = 3;
export const SUSTAIN_FRAMES = 9;
/** Et anslag er et RMS-hopp over så mange ganger nivået før, minst så mange ms etter forrige anslag. */
export const ATTACK_RATIO = 1.4;
export const ATTACK_HOLDOFF_MS = 140;

let yinD: Float32Array | null = null;

export function yin(buf: Float32Array, sr: number): { f: number; conf: number } | null {
  const tauMin = Math.max(2, Math.floor(sr / F_MAX));
  const tauMax = Math.min(Math.floor(sr / F_MIN), buf.length >> 1);
  if (!yinD || yinD.length < tauMax + 2) yinD = new Float32Array(tauMax + 2);
  const d = yinD, W = buf.length - tauMax;
  d[0] = 1;
  let acc = 0;
  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0;
    for (let i = 0; i < W; i++) { const x = buf[i] - buf[i + tau]; sum += x * x; }
    acc += sum;
    d[tau] = acc > 0 ? sum * tau / acc : 1;
  }
  let tau = -1;
  for (let t = tauMin; t <= tauMax; t++) {
    if (d[t] < YIN_THRESHOLD) { while (t + 1 <= tauMax && d[t + 1] < d[t]) t++; tau = t; break; }
  }
  if (tau < 0) {
    let best = tauMin;
    for (let t = tauMin + 1; t <= tauMax; t++) if (d[t] < d[best]) best = t;
    if (d[best] > YIN_FALLBACK_MAX) return null;
    tau = best;
  }
  let better = tau;
  if (tau > 1 && tau < tauMax) {
    const s0 = d[tau - 1], s1 = d[tau], s2 = d[tau + 1];
    const den = s0 - 2 * s1 + s2;
    if (den !== 0) better = tau + (s0 - s2) / (2 * den);
  }
  return { f: sr / better, conf: 1 - d[tau] };
}

// YIN finner perioden, men pianotoner leses ofte 15–45 cent for høyt (inharmoniske overtoner).
// Derfor finjusteres grunntonen med en fin DFT (Goertzel) rundt YIN-estimatet.
let hann: Float32Array | null = null, wbuf: Float32Array | null = null;

export function refineF(buf: Float32Array, sr: number, f0: number): number {
  const N = buf.length;
  if (!hann || !wbuf || hann.length !== N) {
    hann = new Float32Array(N); wbuf = new Float32Array(N);
    for (let i = 0; i < N; i++) hann[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1));
  }
  for (let i = 0; i < N; i++) wbuf[i] = buf[i] * hann[i];
  const lo = f0 * 0.95, step = f0 * 0.002, K = 50;
  const pw = new Float64Array(K + 1);
  let bi = 0;
  for (let k = 0; k <= K; k++) {
    const c = 2 * Math.cos(2 * Math.PI * (lo + k * step) / sr);
    let s1 = 0, s2 = 0;
    for (let i = 0; i < N; i++) { const s0 = wbuf[i] + c * s1 - s2; s2 = s1; s1 = s0; }
    pw[k] = s1 * s1 + s2 * s2 - c * s1 * s2;
    if (pw[k] > pw[bi]) bi = k;
  }
  if (bi === 0 || bi === K) return f0; // ingen tydelig topp: behold YIN
  const a = Math.log(pw[bi - 1] + 1e-20), b = Math.log(pw[bi] + 1e-20), c2 = Math.log(pw[bi + 1] + 1e-20);
  const den = a - 2 * b + c2;
  const p = den !== 0 ? 0.5 * (a - c2) / den : 0;
  return lo + (bi + p) * step;
}

export interface PitchEstimate {
  midi: number;
  f: number;
  /** YIN-sikkerhet, 0–1. */
  conf: number;
  /** Avstand fra nærmeste halvtone. */
  cents: number;
}

/** YIN + Goertzel-finjustering. Gir nærmeste MIDI-tone, eller null hvis tonen er usikker eller for langt fra en halvtone. */
export function estimatePitch(buf: Float32Array, sr: number): PitchEstimate | null {
  const r = yin(buf, sr);
  if (!r || r.conf < MIN_CONFIDENCE) return null;
  const f = refineF(buf, sr, r.f);
  const mf = 69 + 12 * Math.log2(f / 440);
  const midi = Math.round(mf);
  if (Math.abs(mf - midi) > MAX_SEMITONE_OFFSET) return null;
  return { midi, f, conf: r.conf, cents: Math.round((mf - midi) * 100) };
}
