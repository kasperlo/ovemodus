import { SHARP, octOf, pc } from '../music/theory';

const LETTERS = 'CDEFGAB';

/** Plass på notelinjene i diatoniske trinn over midtre C (C4 = 0), samme tall som abcjs-klassen `abcjs-pN`. */
export function staffStep(letter: string, octave: number): number {
  return LETTERS.indexOf(letter) + 7 * (octave - 4);
}

/** Notelinjeplass og fortegn for en tone stavet med ♯, slik spøkelsesnoten tegnes. */
export function ghostPitch(midi: number): { step: number; sharp: boolean } {
  const name = SHARP[pc(midi)];
  return { step: staffStep(name[0], octOf(midi)), sharp: name.length > 1 };
}

/** Tonen som vises som spøkelsesnote. Når alle oktaver godtas, vises den i oktaven nærmest tonen man skulle spille. */
export function ghostMidi(played: number, target: number, anyOctave: boolean): number {
  if (!anyOctave) return played;
  let m = target + ((pc(played) - pc(target) + 12) % 12);
  if (m - target > 6) m -= 12;
  return m;
}

/** Hjelpelinjene en tone på `step` trenger i diskantnøkkel (linjene går fra E4 = 2 til F5 = 10). */
export function ledgerSteps(step: number): number[] {
  const out: number[] = [];
  for (let s = 0; s >= step; s -= 2) out.push(s);
  for (let s = 12; s <= step; s += 2) out.push(s);
  return out;
}
