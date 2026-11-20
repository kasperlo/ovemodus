export type Mode = 'vent' | 'takt';
export type View = 'noter' | 'bokstaver';
export type Sensitivity = 'lav' | 'middels' | 'hoy';

export interface Settings {
  section: string;
  mode: Mode;
  oct: boolean;
  lh: boolean;
  acc: boolean;
  sens: Sensitivity;
  /** Tempo per del. */
  tempo: Record<string, number>;
  view: View;
  lhStaff: boolean;
  /** Oppsettet er åpent på smal skjerm. */
  setupOpen: boolean;
}

export interface WaitRecord { time: number; misses: number }
export interface TaktRecord { tempo: number; pct: number }

export interface Store {
  settings: Settings;
  /** Nøkkel: `${delId}|vent` eller `${delId}|takt`. */
  rec: Record<string, WaitRecord | TaktRecord>;
}

const STORE_KEY = 'dovregubben-ovemodus-v1';

export const store: Store = {
  settings: { section: 'delA', mode: 'vent', oct: true, lh: true, acc: true, sens: 'middels', tempo: {}, view: 'noter', lhStaff: false, setupOpen: true },
  rec: {}
};

try {
  const saved = JSON.parse(localStorage.getItem(STORE_KEY) as string);
  if (saved && typeof saved === 'object') {
    store.settings = Object.assign(store.settings, saved.settings || {});
    store.rec = saved.rec || {};
  }
} catch { /* lagring er valgfritt */ }

export function save(): void {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { /* ignorer */ }
}

export const waitRecord = (sectionId: string): WaitRecord | undefined => store.rec[sectionId + '|vent'] as WaitRecord | undefined;
export const taktRecord = (sectionId: string): TaktRecord | undefined => store.rec[sectionId + '|takt'] as TaktRecord | undefined;
export function setWaitRecord(sectionId: string, r: WaitRecord): void { store.rec[sectionId + '|vent'] = r; save(); }
export function setTaktRecord(sectionId: string, r: TaktRecord): void { store.rec[sectionId + '|takt'] = r; save(); }
