import { pc } from '../music/theory';
import type { ChordEvent, Hand, NoteEvent, Part } from '../music/song';

/** Riktig tone? En akkord godtas når én av akkordtonene spilles. */
export function matches(step: NoteEvent | ChordEvent, m: number, anyOctave: boolean): boolean {
  if (step.type === 'chord') return anyOctave ? step.pcs.has(pc(m)) : step.midis.includes(m);
  return anyOctave ? pc(m) === pc(step.midi) : m === step.midi;
}

/** Riktig tone for den ene hånden sin del av et steg (begge hender)? En akkord godtas når én av tonene spilles. */
export function matchesPart(part: Part, m: number, anyOctave: boolean): boolean {
  return anyOctave ? part.pcs.has(pc(m)) : part.midis.includes(m);
}

/**
 * Hvilken hånd en tone hører til når man øver begge hender. Kanal 3 er venstre hånd når Casio-keyboardet er
 * splittet. Ellers avgjør skillet mellom hendene. `null` når hendene overlapper og kanalen ikke sier noe.
 */
export function handOf(m: number, split: number | null, channel?: number): Hand | null {
  if (channel === 3) return 'lh';
  if (split == null) return null;
  return m >= split ? 'rh' : 'lh';
}

/** Tidsvindu i sekunder til hver side av tonen: halve varigheten, maks en kvartnote, mellom 90 og 200 ms. */
export const hitWindow = (dur: number, e8: number): number => Math.max(0.09, Math.min(0.2, 0.5 * Math.min(dur, 2 * e8)));

/** Rekord i takt-modus krever minst så mange prosent treff. */
export const RECORD_MIN_PCT = 90;

/** Avvik mindre enn dette regnes som i takt, både i snittet og per note. */
export const ON_TIME_S = 0.03;

export function timingClass(offsetS: number): 'early' | 'late' | null {
  if (Math.abs(offsetS) < ON_TIME_S) return null;
  return offsetS > 0 ? 'late' : 'early';
}

export function timingText(avgOffsetMs: number): string {
  const a = avgOffsetMs;
  return Math.abs(a) < ON_TIME_S * 1000 ? 'Timingen sitter.' : a > 0 ? `I snitt ${Math.round(a)} ms for sent.` : `I snitt ${Math.round(-a)} ms for tidlig.`;
}
