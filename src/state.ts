import { build, type Model, type PracticeHand, type Section, type Song, type Step } from './music/song';
import { sciName, octOf, pc } from './music/theory';
import { songs } from './songs';
import type { Mode } from './storage';

export type ClueAction = [text: string, fn: () => void, primary?: boolean];

export interface Result {
  label: string;
  big: string;
  sub: string;
  then: string;
  badge: string | null;
  small?: boolean;
  actions: ClueAction[];
}

export type RunKind = 'takt' | 'demo';

const firstSong = songs[0], firstSection = firstSong.sections[0];

export const state = {
  song: firstSong as Song,
  sec: firstSection as Section,
  hand: 'rh' as PracticeHand,
  model: build(firstSong, firstSection) as Model,
  mode: 'vent' as Mode,
  tempo: 100,
  cur: 0,
  hits: 0,
  misses: 0,
  /** Toner i takt-modus som ikke traff noen note. */
  extra: 0,
  tStart: null as number | null,
  tEnd: null as number | null,
  finished: false,
  /** Startet fra en note midt i delen: tiden lagres ikke som rekord. */
  partial: false,
  /** Siste godkjente tone, for å skille utklang fra nytt anslag. */
  lastAcc: null as number | null,
  result: null as Result | null,
  suppressMicUntil: 0
};

export const run = {
  active: false,
  kind: null as RunKind | null,
  /** performance.now() når første slag høres. */
  t0: 0,
  /** Sekunder per åttedel. */
  e8: 0.3,
  countIn: 0,
  /** Metronomslag i åttedeler (2 = fjerdedel, 3 = punktert fjerdedel). */
  clickLen: 2,
  countInClicks: 4,
  end: 0,
  tempo: 100,
  cursor: -1,
  lastCursor: -2,
  lastBeat: -1,
  bus: null as GainNode | null,
  /** Avvik i sekunder for hvert treff. */
  offsets: [] as number[]
};

export const mic = {
  on: false,
  stream: null as MediaStream | null,
  analyser: null as AnalyserNode | null,
  buf: new Float32Array(0),
  /** Lengre vindu (8192 prøver) for bassen når man øver begge hender. */
  longAnalyser: null as AnalyserNode | null,
  long: new Float32Array(0)
};

/** Steget appen venter på nå: neste i «Vent på meg», eller nærmeste udømte steg i en takt-runde. */
export function expectedStep(): Step | undefined {
  const steps = state.model.steps;
  if (state.mode === 'vent') return state.finished ? undefined : steps[state.cur];
  if (!run.active || run.kind !== 'takt') return undefined;
  const tt = (performance.now() - run.t0) / 1000;
  return steps.find(s => !s.judged && tt <= (s.t ?? 0) + (s.win ?? 0));
}

export function currentIndex(): number {
  if (run.active) return run.cursor;
  if (state.mode === 'vent' && !state.finished) return state.cur;
  return -1;
}

/** Tonenavn for det som ble spilt, med samme stavemåte som noten man skulle spille. */
export function spell(m: number): string {
  const s = state.model.steps[currentIndex()];
  if (s && s.type === 'note' && pc(s.midi) === pc(m)) return s.name + octOf(m);
  return sciName(m);
}

export function elapsed(): number {
  if (state.tStart == null) return 0;
  return ((state.tEnd || performance.now()) - state.tStart) / 1000;
}

export const avgOffsetMs = (): number => run.offsets.reduce((a, b) => a + b, 0) / run.offsets.length * 1000;
