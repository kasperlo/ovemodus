import path from 'node:path';

/** Testkroken appen legger på window. Behold den uendret når appen bygges om. */
export interface OvemodusHook {
  input(midi: number, src?: string): void;
  setSection(id: string): void;
  setMode(mode: 'vent' | 'takt'): void;
  setTempo(bpm: number, quiet?: boolean): void;
  startRun(kind: 'takt' | 'demo'): void;
  stopRun(quiet?: boolean): void;
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
    notes: { m: number; t: number; judged: string | null }[];
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
