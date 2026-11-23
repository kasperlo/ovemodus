import type { PracticeHand } from './music/song';

export type Mode = 'vent' | 'takt';
export type View = 'noter' | 'bokstaver';
export type Sensitivity = 'lav' | 'middels' | 'hoy' | 'kalibrert';

export interface Settings {
  section: string;
  /** Hånden man øver på. */
  hand: PracticeHand;
  mode: Mode;
  oct: boolean;
  /** MIDI: ignorer den andre hånden (delt ved midtre C). Navnet er fra da bare venstre hånd kunne ignoreres. */
  lh: boolean;
  acc: boolean;
  /** MIDI: en akkord er riktig først når alle tonene er spilt. */
  chordAll: boolean;
  sens: Sensitivity;
  /** Tempo per del, og per utsnitt av en del (nøkkel fra `partKey`). */
  tempo: Record<string, number>;
  view: View;
  lhStaff: boolean;
  /** Oppsettet er åpent på smal skjerm. */
  setupOpen: boolean;
  /** Grensen fra mikrofontesten, brukt når følsomheten er «kalibrert». */
  calGate?: number;
  /** Utsnittet man øver på i hver del: første og siste takt, tellt fra 0. Mangler når man øver hele delen. */
  ranges: Record<string, [number, number]>;
  /** Start på nytt av seg selv når delen eller utsnittet er ferdig. */
  loop: boolean;
  /** Måltempo for tempotrappen per del. Mangler når det er delens standardtempo. */
  target: Record<string, number>;
}

export interface WaitRecord { time: number; misses: number }
export interface TaktRecord { tempo: number; pct: number }

/** Én runde: `tempo` og `pct` i «Spill i takt», `time` og `misses` i «Vent på meg». `at` er Date.now(). */
export interface Round { at: number; tempo?: number; pct?: number; time?: number; misses?: number }

export interface Progress {
  /** De siste rundene, eldste først. */
  rounds: Round[];
  /** «Spill i takt»: høyeste tempo med minst 90 % treff per dag (`2026-11-23`). */
  days: Record<string, number>;
}

export interface Store {
  /** Versjon av formatet. Data fra før utsnitt og løkke (versjon 1) har ikke feltet. */
  v: number;
  settings: Settings;
  /** Nøkkel fra `recKey`, for eksempel `delA|vent`, `delA|lh|takt` og `delA|t5-8|both|takt`. */
  rec: Record<string, WaitRecord | TaktRecord>;
  /** Runder og beste tempo per dag, med samme nøkler som `rec`. */
  progress: Record<string, Progress>;
}

const STORE_KEY = 'dovregubben-ovemodus-v1';
export const STORE_VERSION = 2;

export function defaultStore(): Store {
  return {
    v: STORE_VERSION,
    settings: {
      section: 'delA', hand: 'rh', mode: 'vent', oct: true, lh: true, acc: true, chordAll: true, sens: 'middels', tempo: {}, view: 'noter',
      lhStaff: false, setupOpen: true, ranges: {}, loop: false, target: {}
    },
    rec: {},
    progress: {}
  };
}

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);

function numbers(x: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (isObj(x)) for (const [k, v] of Object.entries(x)) if (isNum(v)) out[k] = v;
  return out;
}

function ranges(x: unknown): Record<string, [number, number]> {
  const out: Record<string, [number, number]> = {};
  if (isObj(x)) for (const [k, v] of Object.entries(x)) {
    if (Array.isArray(v) && v.length === 2 && v.every(n => Number.isInteger(n) && n >= 0)) out[k] = [v[0], v[1]];
  }
  return out;
}

function progress(x: unknown): Record<string, Progress> {
  const out: Record<string, Progress> = {};
  if (!isObj(x)) return out;
  for (const [k, v] of Object.entries(x)) {
    if (!isObj(v)) continue;
    const rounds = Array.isArray(v.rounds) ? v.rounds.filter((r): r is Round => isObj(r) && isNum(r.at)) : [];
    out[k] = { rounds, days: numbers(v.days) };
  }
  return out;
}

/**
 * Leser lagrede data fra alle versjoner. Versjon 1 hadde bare `settings` og `rec`, og nøklene der gjelder fortsatt
 * (hele delen har samme nøkkel som før). Felter som mangler eller har feil form, får standardverdien.
 * Ukjente felter beholdes, så data fra en nyere versjon av appen ikke forsvinner om en eldre versjon lagrer.
 */
export function parseStore(raw: unknown): Store {
  const st = defaultStore();
  if (!isObj(raw)) return st;
  const saved = isObj(raw.settings) ? raw.settings : {};
  Object.assign(st.settings, saved);
  st.settings.tempo = numbers(saved.tempo);
  st.settings.ranges = ranges(saved.ranges);
  st.settings.target = numbers(saved.target);
  st.settings.loop = saved.loop === true;
  if (isObj(raw.rec)) st.rec = raw.rec as Store['rec'];
  st.progress = progress(raw.progress);
  return { ...raw, ...st, v: STORE_VERSION };
}

function load(): Store {
  try {
    return parseStore(JSON.parse(localStorage.getItem(STORE_KEY) as string));
  } catch {
    return defaultStore(); // lagring er valgfritt
  }
}

export const store: Store = load();

export function save(): void {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { /* ignorer */ }
}

/** Delen, med utsnittet når man øver på noen av taktene: `delA` eller `delA|t5-8`. */
export const partKey = (sectionId: string, range: string): string => range ? `${sectionId}|${range}` : sectionId;

// Høyre hånd beholder nøklene fra før venstre hånd fantes, så gamle rekorder gjelder fortsatt.
const recKey = (part: string, hand: PracticeHand, mode: Mode): string => `${part}${hand === 'rh' ? '' : '|' + hand}|${mode}`;

export const waitRecord = (part: string, hand: PracticeHand): WaitRecord | undefined => store.rec[recKey(part, hand, 'vent')] as WaitRecord | undefined;
export const taktRecord = (part: string, hand: PracticeHand): TaktRecord | undefined => store.rec[recKey(part, hand, 'takt')] as TaktRecord | undefined;
export function setWaitRecord(part: string, hand: PracticeHand, r: WaitRecord): void { store.rec[recKey(part, hand, 'vent')] = r; save(); }
export function setTaktRecord(part: string, hand: PracticeHand, r: TaktRecord): void { store.rec[recKey(part, hand, 'takt')] = r; save(); }

export const progressOf = (part: string, hand: PracticeHand, mode: Mode): Progress | undefined => store.progress[recKey(part, hand, mode)];
export function setProgress(part: string, hand: PracticeHand, mode: Mode, p: Progress): void { store.progress[recKey(part, hand, mode)] = p; save(); }
