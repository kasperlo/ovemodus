import path from 'node:path';

/** Testkroken appen legger på window. Behold den uendret når appen bygges om. */
export interface OvemodusHook {
  input(midi: number, src?: string): void;
  setSection(id: string): void;
  setMode(mode: 'vent' | 'takt'): void;
  setTempo(bpm: number, quiet?: boolean): void;
  startRun(kind: 'takt' | 'demo'): void;
  stopRun(quiet?: boolean): void;
  /** Takt `first` til `last` i delen, tellt fra 1. Uten argumenter: hele delen. */
  setRange(first?: number, last?: number): void;
  setLoop(on: boolean): void;
  setTarget(bpm: number): void;
  readonly state: {
    section: string;
    mode: 'vent' | 'takt';
    cur: number;
    steps: number;
    hits: number;
    misses: number;
    extra: number;
    finished: boolean;
    runActive: boolean;
    micOn: boolean;
    result: { big: string; sub: string; then: string } | null;
    run: { t0: number; countIn: number; e8: number; kind: string | null };
    sheet: { ok: boolean; count: number; perLine: number; cursorW: number };
    /** `rh` og `lh` finnes bare når man øver begge hender. */
    notes: { m: number; t: number; judged: string | null; rh?: number; lh?: number }[];
    tempo: number;
    /** Taktene man øver på, tellt fra 1 i delen. `null` for hele delen. */
    range: { first: number; last: number } | null;
    /** `pending`: neste runde i løkken starter etter pausen. `rounds`: lagrede runder for delen, hånden og modusen. */
    loop: { on: boolean; pending: boolean; round: number; target: number; rounds: { at: number; tempo?: number; pct?: number; time?: number; misses?: number }[] };
  };
}

declare global {
  interface Window {
    ovemodus: OvemodusHook;
  }
}

/** Adressen testene åpner. Standard er `vite preview` (se playwright.config.ts). */
export const appUrl = (): string => process.env.APP_URL ?? 'http://localhost:4173/';

export const fixture = (name: string): string => path.resolve(process.cwd(), 'tests/fixtures', name);

/** Chromium-flagg som gjør en WAV-fil om til mikrofon og godtar tillatelsen automatisk. */
export const fakeMicArgs = (wav: string): string[] => [
  '--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream',
  `--use-file-for-fake-audio-capture=${fixture(wav)}%noloop`,
  '--autoplay-policy=no-user-gesture-required',
];
