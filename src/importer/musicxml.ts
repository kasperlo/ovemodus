// Leser MusicXML (fra MuseScore og lignende) og gjør det om til appens låtformat.
// Alt skjer i nettleseren. Filen sendes ingen steder.

import type { Meter } from '../music/song';

export class ImportError extends Error {}

/** Lagringsformat for en importert låt: som låtfilene, men uten Set-felt, så det kan lagres som JSON. */
export type StoredEvent =
  | { t: 'n'; p: string; d: number; f: string }
  | { t: 'c'; p: string[]; d: number; f: string }
  | { t: 'r'; d: number };

export interface StoredSong {
  id: string;
  title: string;
  key: string;
  meter: Meter;
  tempo: number;
  /** Takter for høyre og venstre hånd, like mange. Venstre er tom når filen bare har én stemme. */
  rh: StoredEvent[][];
  lh: StoredEvent[][];
  fileName: string;
  importedAt: string;
}

const MAJOR: Record<number, string> = { 0: 'C', 1: 'G', 2: 'D', 3: 'A', 4: 'E', 5: 'B', 6: 'F#', 7: 'C#', [-1]: 'F', [-2]: 'Bb', [-3]: 'Eb', [-4]: 'Ab', [-5]: 'Db', [-6]: 'Gb', [-7]: 'Cb' };
const MINOR: Record<number, string> = { 0: 'Am', 1: 'Em', 2: 'Bm', 3: 'F#m', 4: 'C#m', 5: 'G#m', 6: 'D#m', 7: 'A#m', [-1]: 'Dm', [-2]: 'Gm', [-3]: 'Cm', [-4]: 'Fm', [-5]: 'Bbm', [-6]: 'Ebm', [-7]: 'Abm' };
const STEP_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const ASCII_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
/** Minste varighet appen kan vise: en 32-delsnote, i åttedeler. */
const GRID = 0.25;
const EPS = 1e-6;
/** Standard notelengder i åttedeler, til å dele opp pauser som fyller hull. */
const REST_SIZES = [8, 6, 4, 3, 2, 1.5, 1, 0.75, 0.5, 0.25];

// Små hjelpere som virker likt i nettleserens og jsdoms XML-DOM
const kids = (el: Element, name?: string): Element[] => Array.from(el.children).filter(c => !name || c.tagName === name);
const kid = (el: Element, name: string): Element | undefined => kids(el, name)[0];
const textOf = (el: Element | undefined, name: string): string | undefined => el ? kid(el, name)?.textContent?.trim() : undefined;
const numOf = (el: Element | undefined, name: string): number | undefined => {
  const t = textOf(el, name);
  return t == null || t === '' ? undefined : Number(t);
};
const find = (el: Element, path: string[]): Element | undefined => {
  let cur: Element | undefined = el;
  for (const p of path) cur = cur && kid(cur, p);
  return cur;
};

/** Tonenavn i formatet appen bruker («D#5», «Bb4»). Dobbelte fortegn staves med ett fortegn. */
export function pitchName(step: string, alter: number, octave: number): string {
  const a = Math.round(alter);
  if (a === 0) return `${step}${octave}`;
  if (a === 1) return `${step}#${octave}`;
  if (a === -1) return `${step}b${octave}`;
  const midi = 12 * (octave + 1) + STEP_PC[step] + a;
  return ASCII_SHARP[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
}

const midiOf = (name: string): number => {
  const r = /^([A-G])(#|b)?(-?\d+)$/.exec(name)!;
  return 12 * (Number(r[3]) + 1) + STEP_PC[r[1]] + (r[2] === '#' ? 1 : r[2] === 'b' ? -1 : 0);
};

interface NoteRec {
  onset: number;
  dur: number;
  rest: boolean;
  pitch?: { name: string; midi: number; finger?: string };
  voice: string;
  staff: number;
  tieStop: boolean;
  tuplet: boolean;
}

interface Measure {
  /** Lengden innholdet faktisk fyller, i åttedeler. */
  len: number;
  notes: NoteRec[];
  number: string;
}

interface PartInfo {
  measures: Measure[];
  staves: number;
  key?: string;
  meter?: Meter;
  meterChangeAt?: string;
  tempo?: number;
}

function readPart(part: Element): PartInfo {
  let divisions = 1, staves = 1;
  let key: string | undefined, meter: Meter | undefined, meterChangeAt: string | undefined, tempo: number | undefined;
  const measures: Measure[] = [];
  for (const m of kids(part, 'measure')) {
    let time = 0, maxTime = 0, lastOnset = 0;
    const notes: NoteRec[] = [];
    for (const el of kids(m)) {
      if (el.tagName === 'attributes') {
        divisions = numOf(el, 'divisions') ?? divisions;
        staves = Math.max(staves, numOf(el, 'staves') ?? 1);
        const k = kid(el, 'key');
        if (k && key == null) {
          const fifths = numOf(k, 'fifths') ?? 0;
          key = (textOf(k, 'mode') === 'minor' ? MINOR : MAJOR)[Math.max(-7, Math.min(7, fifths))];
        }
        const t = kid(el, 'time');
        if (t && numOf(t, 'beats') != null) {
          const next = { beats: numOf(t, 'beats')!, unit: numOf(t, 'beat-type')! };
          if (!meter) meter = next;
          else if ((next.beats !== meter.beats || next.unit !== meter.unit) && !meterChangeAt) meterChangeAt = m.getAttribute('number') ?? String(measures.length + 1);
        }
      } else if (el.tagName === 'direction' || el.tagName === 'sound') {
        const sound = el.tagName === 'sound' ? el : kid(el, 'sound');
        const t = sound?.getAttribute('tempo');
        if (t && tempo == null) tempo = Number(t);
        const metro = find(el, ['direction-type', 'metronome']);
        if (metro && tempo == null) {
          const unit = textOf(metro, 'beat-unit'), per = numOf(metro, 'per-minute');
          const dotted = !!kid(metro, 'beat-unit-dot');
          const factor = ({ half: 2, quarter: 1, eighth: 0.5 } as Record<string, number>)[unit ?? ''] ?? 1;
          if (per) tempo = per * factor * (dotted ? 1.5 : 1);
        }
      } else if (el.tagName === 'backup') {
        time -= (numOf(el, 'duration') ?? 0) / divisions * 2;
      } else if (el.tagName === 'forward') {
        time += (numOf(el, 'duration') ?? 0) / divisions * 2;
        maxTime = Math.max(maxTime, time);
      } else if (el.tagName === 'note') {
        if (kid(el, 'grace')) continue; // pyntenoter tar ingen tid
        const dur = (numOf(el, 'duration') ?? 0) / divisions * 2;
        const chord = !!kid(el, 'chord');
        const onset = chord ? lastOnset : time;
        if (!chord) { lastOnset = time; time += dur; maxTime = Math.max(maxTime, time); }
        if (kid(el, 'cue') || kid(el, 'unpitched')) continue;
        const pitchEl = kid(el, 'pitch');
        const finger = el.getElementsByTagName('fingering')[0]?.textContent?.trim();
        notes.push({
          onset, dur,
          rest: !!kid(el, 'rest') || !pitchEl,
          pitch: pitchEl ? (() => {
            const name = pitchName(textOf(pitchEl, 'step')!, numOf(pitchEl, 'alter') ?? 0, numOf(pitchEl, 'octave')!);
            return { name, midi: midiOf(name), finger: finger && /^[1-5]$/.test(finger) ? finger : undefined };
          })() : undefined,
          voice: textOf(el, 'voice') ?? '1',
          staff: numOf(el, 'staff') ?? 1,
          tieStop: kids(el, 'tie').some(t => t.getAttribute('type') === 'stop'),
          tuplet: !!kid(el, 'time-modification')
        });
      }
    }
    measures.push({ len: maxTime, notes, number: m.getAttribute('number') ?? String(measures.length + 1) });
  }
  return { measures, staves, key, meter, meterChangeAt, tempo };
}

function restsFor(d: number): StoredEvent[] {
  const out: StoredEvent[] = [];
  let left = d;
  while (left > EPS) {
    const size = REST_SIZES.find(s => s <= left + EPS) ?? GRID;
    out.push({ t: 'r', d: size });
    left -= size;
  }
  return out;
}

const onGrid = (x: number): boolean => Math.abs(x / GRID - Math.round(x / GRID)) < 1e-4;

/** Én hånd i én takt: hovedstemmen i notesystemet, med akkorder samlet og hull fylt med pauser. */
function barEvents(notes: NoteRec[], staff: number, barLen: number, shift: number, measure: string): StoredEvent[] {
  const mine = notes.filter(n => n.staff === staff);
  const voices = [...new Set(mine.map(n => n.voice))].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));
  const main = mine.filter(n => n.voice === voices[0]);
  if (main.some(n => n.tuplet || !onGrid(n.dur) || !onGrid(n.onset))) {
    throw new ImportError(`Takt ${measure} har trioler eller andre notegrupper som appen ikke kan vise ennå.`);
  }
  const byOnset = new Map<number, NoteRec[]>();
  main.forEach(n => {
    const k = Math.round((n.onset + shift) / GRID) * GRID;
    byOnset.set(k, [...(byOnset.get(k) ?? []), n]);
  });
  const out: StoredEvent[] = [];
  let cursor = 0;
  [...byOnset.keys()].sort((a, b) => a - b).forEach(onset => {
    const group = byOnset.get(onset)!;
    if (onset < cursor - EPS) return; // overlapp i samme stemme: behold den første
    if (onset > cursor + EPS) out.push(...restsFor(onset - cursor));
    const dur = Math.min(...group.map(n => n.dur));
    // Bundne toner (fortsettelser) blir pauser, så hvert steg er et nytt anslag
    const sounding = group.filter(n => !n.rest && n.pitch && !n.tieStop).map(n => n.pitch!).sort((a, b) => a.midi - b.midi);
    const unique = sounding.filter((p, i) => i === 0 || p.midi !== sounding[i - 1].midi);
    if (!unique.length) out.push(...restsFor(dur));
    else if (unique.length === 1) out.push({ t: 'n', p: unique[0].name, d: dur, f: unique[0].finger ?? '' });
    else out.push({ t: 'c', p: unique.map(p => p.name), d: dur, f: unique.every(p => p.finger) ? unique.map(p => p.finger).join(' ') : '' });
    cursor = onset + dur;
  });
  if (cursor > barLen + EPS) throw new ImportError(`Takt ${measure} er lengre enn taktarten.`);
  if (cursor < barLen - EPS) out.push(...restsFor(barLen - cursor));
  return out;
}

const pitchesIn = (info: PartInfo, staff: number): number[] =>
  info.measures.flatMap(m => m.notes.filter(n => n.staff === staff && n.pitch).map(n => n.pitch!.midi));
const avg = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);

function titleOf(root: Element, fileName: string): string {
  const work = textOf(kid(root, 'work'), 'work-title') || textOf(root, 'movement-title');
  const credit = Array.from(root.getElementsByTagName('credit-words')).map(c => c.textContent?.trim()).find(Boolean);
  return (work || credit || fileName.replace(/\.(musicxml|mxl|xml)$/i, '')).slice(0, 80);
}

/** Leser en MusicXML-fil (score-partwise). Kaster ImportError med en melding på norsk når noe ikke støttes. */
export function parseMusicXml(xml: string, fileName: string, id: string): StoredSong {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const root = doc.documentElement;
  if (!root || doc.getElementsByTagName('parsererror').length) throw new ImportError('Filen kunne ikke leses som MusicXML.');
  if (root.tagName === 'score-timewise') throw new ImportError('Filen er MusicXML av typen «timewise», som appen ikke leser. Eksporter på nytt fra MuseScore.');
  if (root.tagName !== 'score-partwise') throw new ImportError('Filen er ikke MusicXML.');

  const parts = kids(root, 'part').map(readPart);
  if (!parts.length || !parts.some(p => p.measures.some(m => m.notes.some(n => n.pitch)))) throw new ImportError('Fant ingen toner i filen.');

  // Piano: én stemme med to notesystemer. Ellers første stemme i høyre hånd, og neste i venstre hvis den ligger lavere.
  const piano = parts.find(p => p.staves >= 2);
  let rh: { part: PartInfo; staff: number }, lh: { part: PartInfo; staff: number } | null = null;
  if (piano) {
    rh = { part: piano, staff: 1 };
    lh = { part: piano, staff: 2 };
  } else {
    rh = { part: parts[0], staff: 1 };
    if (parts[1] && avg(pitchesIn(parts[1], 1)) < avg(pitchesIn(parts[0], 1))) lh = { part: parts[1], staff: 1 };
  }

  const src = rh.part;
  if (src.meterChangeAt) throw new ImportError(`Taktarten skifter i takt ${src.meterChangeAt}. Det støttes ikke ennå.`);
  const meter = src.meter ?? { beats: 4, unit: 4 };
  const barLen = meter.beats * 8 / meter.unit;
  if (!onGrid(barLen)) throw new ImportError(`Taktarten ${meter.beats}/${meter.unit} støttes ikke.`);

  const count = src.measures.length;
  const rhBars: StoredEvent[][] = [], lhBars: StoredEvent[][] = [];
  for (let i = 0; i < count; i++) {
    const m = src.measures[i];
    // Opptakt: første takt er kortere. Den fylles med pauser foran, så takten blir hel.
    const shift = i === 0 && m.len < barLen - EPS ? barLen - m.len : 0;
    rhBars.push(barEvents(m.notes, rh.staff, barLen, shift, m.number));
    if (lh) {
      const lm = lh.part.measures[i];
      lhBars.push(lm ? barEvents(lm.notes, lh.staff, barLen, i === 0 && lm.len < barLen - EPS ? barLen - lm.len : 0, lm.number) : restsFor(barLen));
    }
  }
  const hasLh = lhBars.some(b => b.some(ev => ev.t !== 'r'));
  if (!rhBars.some(b => b.some(ev => ev.t !== 'r'))) throw new ImportError('Fant ingen toner i høyre hånd.');

  const tempo = Math.max(50, Math.min(220, Math.round((src.tempo ?? 100) / 5) * 5));
  return {
    id, title: titleOf(root, fileName), key: src.key ?? 'C', meter, tempo,
    rh: rhBars, lh: hasLh ? lhBars : [], fileName, importedAt: new Date().toISOString()
  };
}
