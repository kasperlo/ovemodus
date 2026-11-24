import type { CasioSetup } from '../casio';
import { SHARP, parsePitch, pc } from './theory';

/** Varigheter i åttedeler. `s16d` er punktert sekstendedel, `ed` punktert åttendedel, `qd` punktert fjerdedel. */
export const s32 = 0.25, s16 = 0.5, s16d = 0.75, e = 1, ed = 1.5, q = 2, qd = 3, h = 4, dh = 6, w = 8;

/** Tone i en triol. `written` er varigheten som står i noten (tre sekstendeler i en triol skrives som sekstendeler). */
export interface Triplet {
  written: number;
  /** Første tone i triolen. Notearket skriver triolmerket foran den. */
  first: boolean;
}

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
  /** Trille. Vises i notearket og spilles i avspillingen. Bare hovedtonen dømmes. */
  trill?: boolean;
  /** Forslagsnoter foran tonen, for eksempel `['F4', 'A4']`. Vises i notearket og spilles i avspillingen, men dømmes ikke. */
  grace?: string[];
  triplet?: Triplet;
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
  triplet?: Triplet;
}

export interface RestEvent {
  type: 'rest';
  d: number;
  triplet?: Triplet;
}

export type BarEvent = NoteEvent | ChordEvent | RestEvent;

/** Finger kan være tom («») for importerte noter uten fingersetting. */
export const N = (s: string, d: number, f: number | string, opts: { fermata?: boolean; trill?: boolean; grace?: string[] } = {}): NoteEvent => {
  opts.grace?.forEach(parsePitch);
  return {
    type: 'note', ...parsePitch(s), d, f: String(f),
    ...(opts.fermata ? { fermata: true } : {}), ...(opts.trill ? { trill: true } : {}), ...(opts.grace?.length ? { grace: opts.grace } : {})
  };
};

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

/**
 * Triol: tre toner (eller pauser) på plassen til to. Varighetene skrives som i noten, for eksempel tre sekstendeler
 * på en åttendedel.
 */
export function T3(...evs: BarEvent[]): BarEvent[] {
  if (evs.length !== 3) throw new Error(`En triol har tre toner, ikke ${evs.length}`);
  return evs.map((ev, i) => ({ ...ev, d: ev.d * 2 / 3, triplet: { written: ev.d, first: i === 0 } }));
}

/**
 * Plasser i takten legges på et rutenett av 1/48 åttedel. Det dekker 32-deler og trioler, og gjør at tre tredjedeler
 * blir nøyaktig en hel, så toner i hver hånd som slås an samtidig, får samme plass.
 */
const snap = (x: number): number => Math.round(x * 48) / 48;

export type Hand = 'rh' | 'lh';
/** Hånden man øver på, eller begge samtidig. */
export type PracticeHand = Hand | 'both';

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
  /** Taktnummeret til første takt, når delen begynner midt i stykket. Standard 1. */
  firstBar?: number;
}

export type SongCategory = 'låt' | 'stykke' | 'egne' | 'klassisk' | 'mine';

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
  /**
   * En ekstra stemme over hovedstemmen i samme hånd, med samme taktnøkler som `bars` og `lh`, for eksempel melodien over
   * triolene i Måneskinn. I notearket har den halsene opp og hovedstemmen halsene ned. Stegene er begge stemmene slått
   * sammen etter plassen i takten. Takter som ikke står her, har bare hovedstemmen.
   */
  upper?: Partial<Record<Hand, Record<string, BarEvent[]>>>;
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
  /** Bare når man øver begge hender: delen til hver hånd. */
  parts?: Partial<Record<Hand, Part>>;
  /** Vent på meg med begge hender: hendene som har spilt sin del av steget. */
  got?: Partial<Record<Hand, boolean>>;
  /** Forsiringer: forslagsnotene og hovedtonen i en trille, som MIDI-tall. Dømmes ikke. */
  ornaments?: Ornaments;
  /** MIDI med «hele akkorden»: akkordtonene som er spilt (tonenavn når alle oktaver godtas). */
  played?: number[];
};

export interface Ornaments {
  grace?: number[];
  trill?: number;
}

/** Den ene hånden sin del av et steg når man øver begge hender samtidig. */
export interface Part {
  hand: Hand;
  type: 'note' | 'chord';
  midis: number[];
  pcs: Set<number>;
  name: string;
  sci: string;
  f: string;
  /** Takt-modus: treff eller bom for denne hånden, og avviket i sekunder. */
  judged?: Judgement | null;
  offset?: number;
  /** MIDI med «hele akkorden»: akkordtonene denne hånden har spilt. */
  played?: number[];
}

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
  hand: PracticeHand;
  barLen: number;
  /** Stegene og pausene takt for takt: hånden man øver på, eller begge hender slått sammen. */
  bars: Bar[];
  /** Hver hånd for seg, til notearket. Hovedstemmen når hånden har to stemmer. */
  staffs: Record<Hand, Bar[]>;
  /** Den ekstra stemmen i hver hånd (`Song.upper`), takt for takt som `staffs`. `null` når hånden har én stemme i delen. */
  uppers: Record<Hand, Bar[] | null>;
  items: Item[];
  steps: Step[];
  /** Den andre hånden, til avspilling. */
  acc: AccEvent[];
  total: number;
  /**
   * Tonen som skiller hendene: høyre hånd fra og med denne, venstre under. Midtre C (60) når det går,
   * ellers laveste tone i høyre hånd. `null` når hendene overlapper, og da ignoreres ingen toner.
   */
  split: number | null;
  /** Taktnummeret til første takt (`Section.firstBar`). */
  firstBar: number;
}

function ornamentsOf(ev: NoteEvent | ChordEvent): Ornaments | undefined {
  if (ev.type !== 'note' || (!ev.grace && !ev.trill)) return undefined;
  return { ...(ev.grace ? { grace: ev.grace.map(g => parsePitch(g).midi) } : {}), ...(ev.trill ? { trill: ev.midi } : {}) };
}

function place(events: BarEvent[], start: number, label: string | null, out: Item[]): Bar {
  const bar: Bar = { label, start, items: [] };
  let pos = start;
  events.forEach(ev => {
    const orn = ev.type === 'rest' ? undefined : ornamentsOf(ev);
    const it: Item = ev.type === 'rest' ? { ...ev, pos } : { ...ev, pos, si: -1, ...(orn ? { ornaments: orn } : {}) };
    bar.items.push(it); out.push(it); pos = snap(pos + ev.d);
  });
  return bar;
}

const isStep = (it: Item): it is Step => it.type !== 'rest';
const midisOf = (s: NoteEvent | ChordEvent): number[] => s.type === 'chord' ? s.midis : [s.midi];
const HANDS: Hand[] = ['rh', 'lh'];

interface Tone { midi: number; name: string; sci: string; f: string }

const tonesOf = (ev: NoteEvent | ChordEvent): Tone[] => ev.type === 'note'
  ? [{ midi: ev.midi, name: ev.name, sci: ev.sci, f: ev.f }]
  : ev.midis.map((midi, i) => ({ midi, name: ev.names[i], sci: ev.sci.split(' ')[i] ?? '', f: ev.f.split(' ')[i] ?? '' }));

/**
 * Toner fra begge stemmene i en hånd som slås an samtidig, som én akkord med tonene nedenfra og navn som «G♯+G♯».
 * Samme tone i begge stemmene teller én gang. Varigheten er den korteste tonen, som når stemmene er skrevet som akkord.
 */
export function mergeTones(evs: (NoteEvent | ChordEvent)[]): NoteEvent | ChordEvent {
  const byMidi = new Map<number, Tone>();
  evs.flatMap(tonesOf).forEach(t => { if (!byMidi.has(t.midi)) byMidi.set(t.midi, t); });
  if (evs.length === 1 || byMidi.size === 1) return evs[0];
  const tones = [...byMidi.values()].sort((a, b) => a.midi - b.midi);
  const names = tones.map(t => t.name), fs = tones.map(t => t.f);
  const name = names.join('+');
  return {
    type: 'chord', midis: tones.map(t => t.midi), names, pcs: new Set(tones.map(t => pc(t.midi))), name, short: name,
    sci: tones.map(t => t.sci).join(' '), d: Math.min(...evs.map(ev => ev.d)), f: fs.every(Boolean) ? fs.join(' ') : ''
  };
}

function mergeOrnaments(steps: Step[]): Ornaments | undefined {
  const grace = steps.flatMap(s => s.ornaments?.grace ?? []);
  const trill = steps.find(s => s.ornaments?.trill != null)?.ornaments?.trill;
  return grace.length || trill != null ? { ...(grace.length ? { grace } : {}), ...(trill != null ? { trill } : {}) } : undefined;
}

/** Begge stemmene i en hånd som ett steg per anslag. Der ingen av stemmene slår an, blir det pause til neste anslag. */
function mergeVoices(main: Item[], upper: Item[], end: number): Item[] {
  const all = [...main, ...upper];
  const at = new Map<number, Step[]>();
  all.filter(isStep).forEach(s => at.set(s.pos, [...(at.get(s.pos) ?? []), s]));
  const onsets = [...new Set(all.map(it => it.pos))].sort((a, b) => a - b);
  return onsets.map((p, i): Item => {
    const here = at.get(p);
    if (!here) return { type: 'rest', d: (onsets[i + 1] ?? end) - p, pos: p };
    if (here.length === 1) return here[0];
    const ornaments = mergeOrnaments(here);
    return { ...mergeTones(here), pos: p, si: -1, ...(ornaments ? { ornaments } : {}) };
  });
}

/** Stegene og pausene fordelt på taktene, med etikettene fra `template`. */
function inBars(list: Item[], template: Bar[], len: number): Bar[] {
  const bars: Bar[] = template.map(b => ({ label: b.label, start: b.start, items: [] }));
  list.forEach(it => bars[Math.min(bars.length - 1, Math.floor(it.pos / len + 1e-9))].items.push(it));
  return bars;
}

function part(s: Step, hand: Hand): Part {
  return { hand, type: s.type, midis: midisOf(s), pcs: s.type === 'chord' ? s.pcs : new Set([pc(s.midi)]), name: s.name, sci: s.sci, f: s.f };
}

/** Et steg med begge hender: alt som slås an samtidig. Venstre hånds toner står først i `midis`, så høyre. */
function combine(r: Step | undefined, l: Step | undefined, pos: number, d: number): Step {
  const parts: Partial<Record<Hand, Part>> = {};
  if (l) parts.lh = part(l, 'lh');
  if (r) parts.rh = part(r, 'rh');
  const ps = [parts.lh, parts.rh].filter((x): x is Part => !!x);
  const midis = ps.flatMap(x => x.midis);
  const name = [parts.rh?.name, parts.lh?.name].filter(Boolean).join(' / ');
  const ornaments = mergeOrnaments([r, l].filter((x): x is Step => !!x));
  return {
    type: 'chord', midis, names: midis.map(m => SHARP[pc(m)]), pcs: new Set(midis.map(pc)),
    name, short: name, sci: [parts.rh?.sci, parts.lh?.sci].filter(Boolean).join(' + '), d,
    f: [parts.rh?.f, parts.lh?.f].filter(Boolean).join(' / '), pos, si: -1, parts, ...(ornaments ? { ornaments } : {})
  };
}

export function build(song: Song, sec: Section, hand: PracticeHand = 'rh'): Model {
  const len = barLength(song.meter);
  const rest = [R(len)];
  const staffs: Record<Hand, Bar[]> = { rh: [], lh: [] };
  const upperBars: Record<Hand, Bar[]> = { rh: [], lh: [] };
  const items: Record<Hand, Item[]> = { rh: [], lh: [] };
  const upperItems: Record<Hand, Item[]> = { rh: [], lh: [] };
  let pos = 0;
  sec.groups.forEach(g => {
    g.bars.forEach(([rhKey, lhKey], bi) => {
      const rh = song.bars[rhKey];
      const lh = lhKey ? song.lh[lhKey] : rest;
      if (!rh || !lh) throw new Error(`Ukjent takt i ${song.id}: ${rhKey} / ${lhKey}`);
      const label = bi === 0 ? g.label : null;
      staffs.rh.push(place(rh, pos, label, items.rh));
      staffs.lh.push(place(lh, pos, label, items.lh));
      const upper = { rh: song.upper?.rh?.[rhKey], lh: lhKey ? song.upper?.lh?.[lhKey] : undefined };
      HANDS.forEach(h => { if (song.upper?.[h]) upperBars[h].push(place(upper[h] ?? rest, pos, null, upperItems[h])); });
      pos += len;
    });
  });
  const voiced = (h: Hand): boolean => upperItems[h].some(isStep);
  const uppers = { rh: voiced('rh') ? upperBars.rh : null, lh: voiced('lh') ? upperBars.lh : null };
  const merged = { rh: uppers.rh ? mergeVoices(items.rh, upperItems.rh, pos) : items.rh, lh: uppers.lh ? mergeVoices(items.lh, upperItems.lh, pos) : items.lh };
  const stepsOf = (h: Hand): Step[] => {
    const list = merged[h].filter(isStep);
    list.forEach((x, i) => { x.si = i; });
    return list;
  };
  const base = { song, hand, barLen: len, staffs, uppers, total: pos, split: splitPoint(song, sec), firstBar: sec.firstBar ?? 1 };
  if (hand !== 'both') {
    const steps = stepsOf(hand);
    const other: Hand = hand === 'rh' ? 'lh' : 'rh';
    const acc = [...items[other], ...upperItems[other]].filter(isStep).map(it => ({ pos: it.pos, d: it.d, midis: midisOf(it) }));
    const bars = uppers[hand] ? inBars(merged[hand], staffs[hand], len) : staffs[hand];
    return { ...base, bars, items: merged[hand], steps, acc };
  }
  const rhAt = new Map(stepsOf('rh').map(x => [x.pos, x]));
  const lhAt = new Map(stepsOf('lh').map(x => [x.pos, x]));
  const onsets = [...new Set([...merged.rh, ...merged.lh].map(it => it.pos))].sort((a, b) => a - b);
  const all = onsets.map((p, i): Item => {
    const d = (onsets[i + 1] ?? pos) - p;
    const r = rhAt.get(p), l = lhAt.get(p);
    return r || l ? combine(r, l, p, d) : { type: 'rest', d, pos: p };
  });
  const steps = all.filter(isStep);
  steps.forEach((x, i) => { x.si = i; });
  return { ...base, bars: inBars(all, staffs.rh, len), items: all, steps, acc: [] };
}

const pitchesOf = (events: BarEvent[]): number[] => events.flatMap(ev => ev.type === 'rest' ? [] : ev.type === 'chord' ? ev.midis : [ev.midi]);

function splitPoint(song: Song, sec: Section): number | null {
  const voices = (h: Hand, k: string | null): BarEvent[] => k ? [...(h === 'rh' ? song.bars : song.lh)[k], ...(song.upper?.[h]?.[k] ?? [])] : [];
  const rh = sec.groups.flatMap(g => g.bars.flatMap(([k]) => pitchesOf(voices('rh', k))));
  const lh = sec.groups.flatMap(g => g.bars.flatMap(([, k]) => pitchesOf(voices('lh', k))));
  if (!rh.length || !lh.length) return lh.length ? Math.max(...lh) + 1 : rh.length ? Math.min(...rh) : null;
  const lo = Math.max(...lh), hi = Math.min(...rh);
  if (lo >= hi) return null;
  return lo < 60 && hi >= 60 ? 60 : hi;
}
