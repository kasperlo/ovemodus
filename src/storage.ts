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
  sens: Sensitivity;
  /** Tempo per del. */
  tempo: Record<string, number>;
  view: View;
  lhStaff: boolean;
  /** Oppsettet er åpent på smal skjerm. */
  setupOpen: boolean;
  /** Grensen fra mikrofontesten, brukt når følsomheten er «kalibrert». */
  calGate?: number;
}

export interface WaitRecord { time: number; misses: number }
export interface TaktRecord { tempo: number; pct: number }

export interface Store {
  settings: Settings;
  /** Nøkkel: `${delId}|vent` og `${delId}|takt` for høyre hånd, `${delId}|lh|vent` og `${delId}|lh|takt` for venstre. */
  rec: Record<string, WaitRecord | TaktRecord>;
}

const STORE_KEY = 'dovregubben-ovemodus-v1';

export const store: Store = {
  settings: { section: 'delA', hand: 'rh', mode: 'vent', oct: true, lh: true, acc: true, sens: 'middels', tempo: {}, view: 'noter', lhStaff: false, setupOpen: true },
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

// Høyre hånd beholder nøklene fra før venstre hånd fantes, så gamle rekorder gjelder fortsatt.
const recKey = (sectionId: string, hand: PracticeHand, mode: Mode): string => `${sectionId}${hand === 'rh' ? '' : '|' + hand}|${mode}`;

export const waitRecord = (sectionId: string, hand: PracticeHand): WaitRecord | undefined => store.rec[recKey(sectionId, hand, 'vent')] as WaitRecord | undefined;
export const taktRecord = (sectionId: string, hand: PracticeHand): TaktRecord | undefined => store.rec[recKey(sectionId, hand, 'takt')] as TaktRecord | undefined;
export function setWaitRecord(sectionId: string, hand: PracticeHand, r: WaitRecord): void { store.rec[recKey(sectionId, hand, 'vent')] = r; save(); }
export function setTaktRecord(sectionId: string, hand: PracticeHand, r: TaktRecord): void { store.rec[recKey(sectionId, hand, 'takt')] = r; save(); }
