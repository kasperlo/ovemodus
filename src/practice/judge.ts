import { pc } from '../music/theory';
import type { ChordEvent, NoteEvent } from '../music/song';

/** Riktig tone? En akkord godtas når én av akkordtonene spilles. */
export function matches(step: NoteEvent | ChordEvent, m: number, anyOctave: boolean): boolean {
  if (step.type === 'chord') return anyOctave ? step.pcs.has(pc(m)) : step.midis.includes(m);
  return anyOctave ? pc(m) === pc(step.midi) : m === step.midi;
}

/** Tidsvindu i sekunder til hver side av tonen: halve varigheten, maks en kvartnote, mellom 90 og 200 ms. */
export const hitWindow = (dur: number, e8: number): number => Math.max(0.09, Math.min(0.2, 0.5 * Math.min(dur, 2 * e8)));

/** Rekord i takt-modus krever minst så mange prosent treff. */
export const RECORD_MIN_PCT = 90;

export function timingText(avgOffsetMs: number): string {
  const a = avgOffsetMs;
  return Math.abs(a) < 30 ? 'Timingen sitter.' : a > 0 ? `I snitt ${Math.round(a)} ms for sent.` : `I snitt ${Math.round(-a)} ms for tidlig.`;
}
