import { parsePitch, pc } from './theory';

/** Varigheter i åttedeler. */
export const s16 = 0.5, e = 1, q = 2, h = 4, dh = 6, w = 8;

export interface NoteEvent {
  type: 'note';
  midi: number;
  name: string;
  sci: string;
  d: number;
  /** Finger, 1–5. */
  f: string;
}

export interface ChordEvent {
  type: 'chord';
  midis: number[];
  pcs: Set<number>;
  name: string;
  short: string;
  sci: string;
  d: number;
  /** Fingre, én per tone, skilt med mellomrom. */
  f: string;
}

export interface RestEvent {
  type: 'rest';
  d: number;
}

export type BarEvent = NoteEvent | ChordEvent | RestEvent;

export const N = (s: string, d: number, f: number): NoteEvent => ({ type: 'note', ...parsePitch(s), d, f: String(f) });

/** Akkord. Godtas når én av akkordtonene spilles. */
export const CH = (notes: string[], d: number, f: string, name: string, short: string): ChordEvent => {
  const ps = notes.map(parsePitch);
  return {
    type: 'chord', midis: ps.map(p => p.midi), pcs: new Set(ps.map(p => pc(p.midi))),
    name, short, sci: ps.map(p => p.name).join(' '), d, f
  };
};

export const R = (d: number): RestEvent => ({ type: 'rest', d });

/** Venstre hånd: tidspunkt i takten, varighet og toner. Bare til avspilling og noteark. */
export interface LhPattern {
  p: number;
  d: number;
  m: number[];
}

export interface SectionGroup {
  label: string;
  bars: [barKey: string, lhKey: string | null][];
}

export interface Section {
  id: string;
  title: string;
  tempo: number;
  groups: SectionGroup[];
}

export interface Song {
  id: string;
  title: string;
  bars: Record<string, BarEvent[]>;
  lh: Record<string, LhPattern[]>;
  sections: Section[];
}

export type StepStatus = 'done' | 'hit' | 'missed';
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
};

export type Item = Step | (RestEvent & Placed);

export interface Bar {
  label: string | null;
  start: number;
  items: Item[];
}

export interface LhEvent {
  pos: number;
  d: number;
  midis: number[];
}

export interface Model {
  bars: Bar[];
  items: Item[];
  steps: Step[];
  lh: LhEvent[];
  total: number;
}

export function build(song: Song, sec: Section): Model {
  const bars: Bar[] = [], items: Item[] = [], lh: LhEvent[] = [];
  let pos = 0;
  sec.groups.forEach(g => {
    g.bars.forEach(([key, lhKey], bi) => {
      const bar: Bar = { label: bi === 0 ? g.label : null, start: pos, items: [] };
      if (lhKey && song.lh[lhKey]) song.lh[lhKey].forEach(ev => lh.push({ pos: pos + ev.p, d: ev.d, midis: ev.m }));
      song.bars[key].forEach(ev => {
        const it: Item = ev.type === 'rest' ? { ...ev, pos } : { ...ev, pos, si: -1 };
        bar.items.push(it); items.push(it); pos += ev.d;
      });
      bars.push(bar);
    });
  });
  const steps = items.filter((it): it is Step => it.type !== 'rest');
  steps.forEach((s, i) => { s.si = i; });
  return { bars, items, steps, lh, total: pos };
}
