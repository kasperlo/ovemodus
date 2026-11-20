const PCS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export const SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

export const pc = (m: number): number => ((m % 12) + 12) % 12;
export const octOf = (m: number): number => Math.floor(m / 12) - 1;
export const sciName = (m: number): string => SHARP[pc(m)] + octOf(m);
export const isBlack = (m: number): boolean => [1, 3, 6, 8, 10].includes(pc(m));

export interface Pitch {
  midi: number;
  /** Tonenavn med ♯/♭, uten oktav. */
  name: string;
  /** Tonenavn med oktav, for eksempel «D♯5». */
  sci: string;
}

/** Leser «D#5», «Bb4» eller «A4». Stavemåten i navnet bestemmer om tonen vises med ♯ eller ♭. */
export function parsePitch(s: string): Pitch {
  const r = /^([A-G])(#|b)?(\d)$/.exec(s);
  if (!r) throw new Error(`Ugyldig tonenavn: ${s}`);
  const acc = r[2] === '#' ? 1 : r[2] === 'b' ? -1 : 0;
  const name = r[1] + (acc === 1 ? '♯' : acc === -1 ? '♭' : '');
  return { midi: 12 * (Number(r[3]) + 1) + PCS[r[1]] + acc, name, sci: name + r[3] };
}
