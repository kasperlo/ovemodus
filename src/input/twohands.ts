// Tonegjenkjenning med begge hender i samme mikrofonsignal. Appen vet hvilke toner som skal komme, og sjekker dem:
// - Venstre hånd: bare bassen har energi under skillet (høyre hånd har ingen energi under sin egen grunntone, bortsett
//   fra et kort dunk ved anslaget), så bassnotene rangeres i et lavpassfiltrert, langt vindu.
// - Høyre hånd: venstre hånds toner og overtoner trekkes fra med kamfiltre, og YIN finner tonen som er igjen.
// Toner i høyre hånd som ligger på en overtone av venstre hånd (A4 over A2), kan ikke skilles ut med én mikrofon.
// Ikke endre uten å kjøre twohands.test.ts, twohands.wav.test.ts og micdiag.spec.ts (se CLAUDE.md).

import type { Step } from '../music/song';
import { pc } from '../music/theory';
import { ATTACK_HOLDOFF_MS, ATTACK_RATIO, STABLE_FRAMES, SUSTAIN_FRAMES, estimatePitch, type PitchEstimate } from './pitch';

export const hz = (m: number): number => 440 * 2 ** ((m - 69) / 12);

export function rmsOf(x: Float32Array): number {
  let s = 0;
  for (let i = 0; i < x.length; i++) s += x[i] * x[i];
  return Math.sqrt(s / Math.max(1, x.length));
}

/** Lavpass av fjerde orden (to Butterworth-ledd). */
export function lowpass(x: Float32Array, sr: number, fc: number): Float32Array {
  const w = 2 * Math.PI * fc / sr, a = Math.sin(w) / (2 * Math.SQRT1_2), c = Math.cos(w);
  const b0 = (1 - c) / 2, b1 = 1 - c, b2 = b0, a0 = 1 + a, a1 = -2 * c, a2 = 1 - a;
  let y = x;
  for (let pass = 0; pass < 2; pass++) {
    const out = new Float32Array(y.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < y.length; i++) {
      const v = (b0 * y[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
      x2 = x1; x1 = y[i]; y2 = y1; y1 = v; out[i] = v;
    }
    y = out;
  }
  return y;
}

/** Fjerner tonene (grunntone og alle overtoner) med ett kamfilter per tone: y[n] = x[n] − x[n − T]. */
export function cancelNotes(x: Float32Array, sr: number, midis: number[]): Float32Array {
  let y = x;
  for (const m of midis) {
    const T = sr / hz(m), out = new Float32Array(y.length);
    for (let i = 0; i < y.length; i++) {
      const j = i - T, k = Math.floor(j), fr = j - k;
      out[i] = y[i] - (k >= 0 && k + 1 < y.length ? y[k] * (1 - fr) + y[k + 1] * fr : 0);
    }
    y = out;
  }
  return y;
}

const hannCache = new Map<number, Float32Array>();
function hann(n: number): Float32Array {
  let w = hannCache.get(n);
  if (!w) {
    w = new Float32Array(n);
    for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (n - 1));
    hannCache.set(n, w);
  }
  return w;
}

/** Effekt rundt frekvensen `f` (Goertzel med Hann-vindu), sterkeste av tre punkter innen ±0,6 %. */
export function bandPower(x: Float32Array, sr: number, f: number): number {
  const w = hann(x.length);
  let best = 0;
  for (const k of [-0.006, 0, 0.006]) {
    const c = 2 * Math.cos(2 * Math.PI * f * (1 + k) / sr);
    let s1 = 0, s2 = 0;
    for (let i = 0; i < x.length; i++) { const s0 = x[i] * w[i] + c * s1 - s2; s2 = s1; s1 = s0; }
    best = Math.max(best, s1 * s1 + s2 * s2 - c * s1 * s2);
  }
  return best;
}

/** Styrken til hver bassnote fra `lo` til `hi` (MIDI, brukt som indeks): grunntone pluss halvparten av andre deltone. */
export function bassScores(low: Float32Array, sr: number, lo: number, hi: number): number[] {
  const score: number[] = [];
  for (let m = lo; m <= hi; m++) score[m] = bandPower(low, sr, hz(m)) + 0.5 * bandPower(low, sr, 2 * hz(m));
  return score;
}

/**
 * Tonene fra `lo` til `hi` som er sterkere enn begge nabotonene, sterkest først. En tone ved siden av en som spilles,
 * får lekkasje fra den (G2 ved A2), men blir ingen topp. `score` må ha verdier fra `lo − 1` til `hi + 1`.
 */
export function peaks(score: number[], lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let m = lo; m <= hi; m++) if (score[m] > score[m - 1] && score[m] > score[m + 1]) out.push(m);
  return out.sort((a, b) => score[b] - score[a]);
}

/** Bassnotene mellom `lo` og `hi` som er en topp i spekteret, sterkest først. */
export function bassRanking(low: Float32Array, sr: number, lo: number, hi: number): number[] {
  return peaks(bassScores(low, sr, lo - 1, hi + 1), lo, hi);
}

/** Tonen i høyre hånd etter at venstre hånds toner er trukket fra. */
export function rhEstimate(frame: Float32Array, sr: number, lhNotes: number[]): PitchEstimate | null {
  return estimatePitch(lhNotes.length ? cancelNotes(frame, sr, lhNotes) : frame, sr);
}

/** Ligger tonen `rh` på en overtone (2.–10.) av en av tonene i `lh`, innen 35 cent? Da kan den ikke høres for seg. */
export function maskedBy(rh: number, lh: number[], cents = 35): boolean {
  return lh.some(l => {
    for (let k = 2; k <= 10; k++) if (Math.abs(1200 * Math.log2(hz(rh) / (k * hz(l)))) < cents) return true;
    return false;
  });
}

/**
 * Skillet detektoren bruker i ett steg. Holder hendene seg på hver sin side i delen, gjelder skillet for delen.
 * Overlapper de (`split` er null, som i overgangen i Für Elise), skilles de i steget når det går. Høyre hånd alene
 * skal alltid kunne høres med YIN, også under midtre C, og venstre hånd over skillet høres med YIN.
 */
export function stepSplit(lh: number[] | undefined, rh: number[] | undefined, split: number | null): number {
  if (split != null) return split;
  if (!rh?.length) return 60;
  const hi = Math.min(...rh);
  if (!lh?.length) return Math.min(60, hi);
  const lo = Math.max(...lh);
  if (lo >= hi) return 60;
  return lo < 60 && hi >= 60 ? 60 : hi;
}

/** Venstre hånds toner som kan klinge ved steg `i`: i steget selv, og i siste steg før med venstre hånd. */
export function ringingAt(steps: Step[], i: number): number[] {
  const out = new Set(steps[i]?.parts?.lh?.midis ?? []);
  for (let j = i - 1; j >= 0; j--) {
    const p = steps[j].parts?.lh;
    if (p) { p.midis.forEach(m => out.add(m)); break; }
  }
  return [...out];
}

/** Det appen venter på i steget, og venstre hånds toner som kan klinge nå. */
export interface TwoHandTarget {
  /** Tonene venstre hånd ikke har spilt ennå i steget. */
  lh?: number[];
  /** Tonene høyre hånd ikke har spilt ennå i steget. */
  rh?: number[];
  /** Venstre hånds toner som kan klinge nå. Kamfiltrene trekker dem fra før høyre hånd leses. */
  ringing: number[];
}

export interface TwoHandInput {
  now: number;
  /** Siste 2048 prøver. */
  frame: Float32Array;
  /** Siste 8192 prøver, hentes bare når bassen sjekkes. */
  long: () => Float32Array;
  sr: number;
  rms: number;
  gate: number;
  /** Laveste tone i høyre hånd. */
  split: number;
  anyOct: boolean;
  target: TwoHandTarget;
}

export interface MicEvent {
  midi: number;
  attack: boolean;
  phase: 'stable' | 'sustain';
  /** Tidspunktet (ms) tonen dømmes etter, når det ikke er nå. Venstre hånd sjekkes litt etter anslaget. */
  at?: number;
}

/**
 * Venstre hånd sjekkes så mange rammer (117 ms) etter anslaget i bassen. Før det er det nye anslaget bare en kort bit
 * i enden av det lange vinduet, og spekteret får falske topper ved siden av tonene. Anslaget kan bli oppdaget opptil
 * 40 ms etter at tonen begynte.
 */
const LH_DELAY = 7;
/**
 * Bassen må være minst så stor del av lyden (RMS under skillet delt på all RMS), både ved anslaget og når venstre hånd
 * sjekkes. Et anslag i høyre hånd har et dunk i bassen som dør ut: målt 0,08–0,14 etter 117 ms på pianoopptaket av
 * høyre hånd alene, mot 0,38–0,66 med begge hender.
 */
const LH_SHARE = 0.25;
/** Én ramme (requestAnimationFrame). Brukes til å gi venstre hånd samme tidspunkt som en stabil tone ville fått. */
const FRAME_MS = 1000 / 60;
/** Anslag måles mot laveste nivå i de siste rammene (67 ms), ikke mot et glidende snitt. */
const VALLEY_FRAMES = 4;

/**
 * Tonehendelser når man øver begge hender. Venstre hånd godtas litt etter et anslag i bassen, når bassen fortsatt er
 * en stor nok del av lyden og en av de ventede tonene er blant de tre som har blitt mest styrket. Høyre hånd er tonen
 * YIN finner når venstre hånds toner er trukket fra. Toner i høyre hånd på en overtone av venstre hånd godtas sammen
 * med venstre hånd, eller ved et anslag som ikke kommer fra bassen.
 */
export class TwoHandDetector {
  /** Tonen høyre hånd hører nå, til «Hører:». */
  heard: PitchEstimate | null = null;
  // Med venstre hånd som klinger faller ikke nivået mellom tonene i høyre hånd, og et glidende snitt henger
  // etter det raske fallet rett etter et anslag. Da blir neste anslag for lite til å telle.
  private recent: number[] = [];
  private lowRecent: number[] = [];
  private attackT = -1e9;
  private lowAttackT = -1e9;
  /** Bassnotenes styrke da anslaget i bassen kom. Venstre hånd godtas bare for toner som har blitt sterkere siden. */
  private lhBefore: number[] | null = null;
  private lhWait = 0;
  private cand: number | null = null;
  private count = 0;
  private emitted: number | null = null;
  private afterAttack = false;
  private silent = 0;

  frame(i: TwoHandInput): MicEvent[] {
    const out: MicEvent[] = [];
    const jump = Math.min(0.001, i.gate * 0.3);
    const cutoff = hz(i.split) * 0.94;
    // Også under grensen, ellers blir det et kunstig bunnpunkt som får neste anslag i høyre hånd til å se ut som bass
    const low = rmsOf(lowpass(i.frame, i.sr, cutoff));
    const valley = Math.min(...this.recent, Infinity), lowValley = Math.min(...this.lowRecent, Infinity);
    push(this.recent, i.rms); push(this.lowRecent, low);
    if (this.lhBefore && --this.lhWait <= 0) this.checkLh(i, low, out);
    if (i.rms < i.gate) {
      this.cand = null; this.count = 0; this.heard = null;
      if (++this.silent > 5) this.emitted = null;
      return out;
    }
    this.silent = 0;
    const attack = i.rms > valley * ATTACK_RATIO + jump && i.now - this.attackT > ATTACK_HOLDOFF_MS;
    if (attack) { this.attackT = i.now; this.afterAttack = true; this.cand = null; this.count = 0; }
    const bassAttack = low > lowValley * ATTACK_RATIO + jump && low > LH_SHARE * i.rms && i.now - this.lowAttackT > ATTACK_HOLDOFF_MS;
    if (bassAttack) {
      this.lowAttackT = i.now;
      this.lhBefore = bassScores(lowpass(i.long(), i.sr, cutoff), i.sr, 35, i.split);
      this.lhWait = LH_DELAY;
    }
    const { lh, rh, ringing } = i.target;

    if (attack && !bassAttack && rh && !lh && rh.every(r => maskedBy(r, ringing))) {
      out.push({ midi: rh[0], attack: true, phase: 'stable', at: i.now + (STABLE_FRAMES - 1) * FRAME_MS });
      return out;
    }

    const est = rhEstimate(i.frame, i.sr, ringing);
    this.heard = est && est.midi >= i.split ? est : null;
    if (!this.heard) { this.cand = null; this.count = 0; return out; }
    const m = this.heard.midi;
    if (m === this.cand) this.count++; else { this.cand = m; this.count = 1; }
    if (this.count === STABLE_FRAMES) {
      if (m !== this.emitted || this.afterAttack) {
        out.push({ midi: m, attack: this.afterAttack || this.emitted === null, phase: 'stable' });
        this.emitted = m; this.afterAttack = false;
      }
    } else if (this.count === SUSTAIN_FRAMES && this.emitted === m) {
      out.push({ midi: m, attack: false, phase: 'sustain' });
    }
    return out;
  }

  /** Venstre hånd: en av de ventede tonene må være blant de tre som har blitt mest styrket siden anslaget. */
  private checkLh(i: TwoHandInput, low: number, out: MicEvent[]): void {
    const before = this.lhBefore!;
    this.lhBefore = null;
    const { lh, rh } = i.target;
    if (!lh || low < LH_SHARE * i.rms) return;
    // Det som har blitt sterkere siden anslaget, er det som ble slått an nå. Toner som bare klinger, faller.
    const after = bassScores(lowpass(i.long(), i.sr, hz(i.split) * 0.94), i.sr, 35, i.split);
    const top = peaks(after.map((a, m) => Math.max(0, a - before[m])), 36, i.split - 1).slice(0, 3);
    const hit = lh.find(x => top.some(m => (i.anyOct ? pc(m) === pc(x) : m === x)));
    if (hit == null) return;
    const at = this.lowAttackT + (STABLE_FRAMES - 1) * FRAME_MS;
    out.push({ midi: hit, attack: true, phase: 'stable', at });
    if (rh?.every(r => maskedBy(r, lh))) out.push({ midi: rh[0], attack: true, phase: 'stable', at });
  }
}

function push(xs: number[], x: number): void {
  xs.push(x);
  if (xs.length > VALLEY_FRAMES) xs.shift();
}
