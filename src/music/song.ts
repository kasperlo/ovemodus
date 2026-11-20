import type { CasioSetup } from '../casio';
import { parsePitch, pc } from './theory';

/** Varigheter i åttedeler. `ed` er punktert åttendedel, `qd` punktert fjerdedel. */
export const s16 = 0.5, e = 1, ed = 1.5, q = 2, qd = 3, h = 4, dh = 6, w = 8;

export interface NoteEvent {
  type: 'note';
  midi: number;
  name: string;
  sci: string;
  d: number;
  /** Finger, 1–5. */
  f: string;
  /** Fermat: hold tonen litt lenger. Vises bare i notearket. */
  fermata?: boolean;
}

export interface ChordEvent {
  type: 'chord';
  midis: number[];
  /** Tonenavnene med ♯/♭, uten oktav, i samme rekkefølge som `midis`. Styrer stavemåten i notearket. */
  names: string[];
  pcs: Set<number>;
  name: string;
  short: string;
  sci: string;
  d: number;
  /** Fingre, én per tone fra den dypeste, skilt med mellomrom. */
  f: string;
}

export interface RestEvent {
  type: 'rest';
  d: number;
}

export type BarEvent = NoteEvent | ChordEvent | RestEvent;

export const N = (s: string, d: number, f: number, opts: { fermata?: boolean } = {}): NoteEvent =>
  ({ type: 'note', ...parsePitch(s), d, f: String(f), ...(opts.fermata ? { fermata: true } : {}) });

/** Akkord eller flere toner samtidig. Godtas når én av tonene spilles. */
export const CH = (notes: string[], d: number, f: string, name: string, short: string = name): ChordEvent => {
  const ps = notes.map(parsePitch);
  return {
    type: 'chord', midis: ps.map(p => p.midi), names: ps.map(p => p.name), pcs: new Set(ps.map(p => pc(p.midi))),
    name, short, sci: ps.map(p => p.sci).join(' '), d, f
  };
};

/** To toner i venstre hånd, for eksempel A2 + E3. Navnet blir «A+E». */
export const DY = (lo: string, hi: string, d: number, f = '5 1'): ChordEvent => {
  const name = `${parsePitch(lo).name}+${parsePitch(hi).name}`;
  return CH([lo, hi], d, f, name, name);
};

export const R = (d: number): RestEvent => ({ type: 'rest', d });

export type Hand = 'rh' | 'lh';

export interface Meter {
  beats: number;
  /** Notenverdien som telles: 4 = fjerdedel, 8 = åttedel. */
  unit: number;
}

/** Taktlengde i åttedeler. */
export const barLength = (m: Meter): number => m.beats * 8 / m.unit;

/** Sammensatt taktart (6/8, 3/8, 9/8): slagene er punkterte fjerdedeler. */
const compound = (m: Meter): boolean => m.unit === 8 && m.beats % 3 === 0;

/** Lengden på ett metronomslag i åttedeler. */
export const clickLength = (m: Meter): number => compound(m) ? 3 : 8 / m.unit;

/** Hvor mange åttedeler som bjelkes sammen: per slag i 2/4 og 3/4 (tydelig galopprytme), per halve takt i 4/4. */
export const beamGroup = (m: Meter): number => compound(m) ? 3 : m.unit === 4 && m.beats !== 4 ? 2 : 4;

/** Inntelling: hele takter, minst fire slag. */
export const countInBars = (m: Meter): number => Math.ceil(4 / (barLength(m) / clickLength(m)));

export interface SectionGroup {
  label: string;
  /** Takter som par av høyre- og venstrehåndstakt. `null` betyr pause i venstre hånd. */
  bars: [rhKey: string, lhKey: string | null][];
}

export interface Section {
  id: string;
  title: string;
  tempo: number;
  groups: SectionGroup[];
  /** Kort om bruken, vises i appen. */
  use?: string;
}

export type SongCategory = 'låt' | 'egne' | 'klassisk';

export interface Song {
  id: string;
  title: string;
  /** Komponist og opprinnelse, for eksempel «Edvard Grieg». */
  by: string;
  category: SongCategory;
  /** Toneart som i ABC (K:), for eksempel «Am», «C», «Cm». */
  key: string;
  meter: Meter;
  bars: Record<string, BarEvent[]>;
  lh: Record<string, BarEvent[]>;
  sections: Section[];
  /** Forslag til lyd på Casio CT-S400. */
  casio?: CasioSetup;
}

export type StepStatus = 'done' | 'hit' | 'stumbled' | 'missed';
export type Judgement = 'hit' | 'miss';

interface Placed {
  /** Startposisjon i åttedeler fra begynnelsen av delen. */
  pos: number;
}

/** En tone eller akkord som skal spilles. Feltene under `si` fylles ut mens man øver. */
export type Step = (NoteEvent | ChordEvent) & Placed & {
  si: number;
  status?: StepStatus | null;
  judged?: Judgement | null;
  /** Tidspunkt i sekunder fra start av runden, inkludert innteller. */
  t?: number;
  dur?: number;
  /** Tidsvindu i sekunder til hver side. */
  win?: number;
  /** Bommet minst én gang før riktig tone (Vent på meg). */
  stumbled?: boolean;
  /** Avvik i sekunder for et treff i takt-modus. Positivt er for sent. */
  offset?: number;
};

export type Item = Step | (RestEvent & Placed);

export interface Bar {
  label: string | null;
  start: number;
  items: Item[];
}

/** En tone eller akkord i den andre hånden, til avspilling. */
export interface AccEvent {
  pos: number;
  d: number;
  midis: number[];
}

export interface Model {
  song: Song;
  hand: Hand;
  barLen: number;
  /** Takter for hånden man øver på. */
  bars: Bar[];
  /** Takter for den andre hånden (til notearket). */
  other: Bar[];
  items: Item[];
  steps: Step[];
  /** Den andre hånden, til avspilling. */
  acc: AccEvent[];
  total: number;
}

function place(events: BarEvent[], start: number, label: string | null, out: Item[]): Bar {
  const bar: Bar = { label, start, items: [] };
  let pos = start;
  events.forEach(ev => {
    const it: Item = ev.type === 'rest' ? { ...ev, pos } : { ...ev, pos, si: -1 };
    bar.items.push(it); out.push(it); pos += ev.d;
  });
  return bar;
}

export function build(song: Song, sec: Section, hand: Hand = 'rh'): Model {
  const len = barLength(song.meter);
  const rest = [R(len)];
  const bars: Bar[] = [], other: Bar[] = [], items: Item[] = [], otherItems: Item[] = [];
  let pos = 0;
  sec.groups.forEach(g => {
    g.bars.forEach(([rhKey, lhKey], bi) => {
      const rh = song.bars[rhKey];
      const lh = lhKey ? song.lh[lhKey] : rest;
      if (!rh || !lh) throw new Error(`Ukjent takt i ${song.id}: ${rhKey} / ${lhKey}`);
      const label = bi === 0 ? g.label : null;
      bars.push(place(hand === 'rh' ? rh : lh, pos, label, items));
      other.push(place(hand === 'rh' ? lh : rh, pos, null, otherItems));
      pos += len;
    });
  });
  const steps = items.filter((it): it is Step => it.type !== 'rest');
  steps.forEach((s, i) => { s.si = i; });
  const acc = otherItems.filter((it): it is Step => it.type !== 'rest')
    .map(it => ({ pos: it.pos, d: it.d, midis: it.type === 'chord' ? it.midis : [it.midi] }));
  return { song, hand, barLen: len, bars, other, items, steps, acc, total: pos };
}
