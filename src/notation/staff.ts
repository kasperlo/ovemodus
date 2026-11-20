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

/** Nederste notelinje: E4 i diskantnøkkel, G2 i bassnøkkel. Systemet har fem linjer, åtte trinn høyt. */
export const TREBLE_BOTTOM = 2, BASS_BOTTOM = -10;

/** Hjelpelinjene en tone på `step` trenger. */
export function ledgerSteps(step: number, bottom = TREBLE_BOTTOM): number[] {
  const out: number[] = [];
  for (let s = bottom - 2; s >= step; s -= 2) out.push(s);
  for (let s = bottom + 10; s <= step; s += 2) out.push(s);
  return out;
}
