import { CH, N, R, e, q, dh, h, type Song } from '../music/song';
import { stykke } from './klassisk';

// ---------- Petzold: Menuett i G-dur, BWV Anh. 114 ----------
// Hentet fra Mutopia (Bach-Gesellschaft, Public Domain) med et skript og sjekket mot MIDI-filen derfra.
// Fingersettingen er et eget forslag. Se assumptions.md (2026-11-23).

/** Hele stykket takt for takt, med repetisjonene skrevet ut (64 takter). */
const MENUETT: [string, string | null][] = [
  ['t0', 't0'], ['t1', 't1'], ['t2', 't2'], ['t3', 't1'], ['t4', 't4'], ['t5', 't5'],  // 0
  ['t6', 't6'], ['t7', 't7'], ['t0', 't8'], ['t1', 't9'], ['t2', 't2'], ['t3', 't11'],  // 6
  ['t4', 't12'], ['t5', 't13'], ['t14', 't14'], ['t15', 't15'], ['t0', 't0'], ['t1', 't1'],  // 12
  ['t2', 't2'], ['t3', 't1'], ['t4', 't4'], ['t5', 't5'], ['t6', 't6'], ['t7', 't7'],  // 18
  ['t0', 't8'], ['t1', 't9'], ['t2', 't2'], ['t3', 't11'], ['t4', 't12'], ['t5', 't13'],  // 24
  ['t14', 't14'], ['t15', 't15'], ['t32', 't5'], ['t33', 't33'], ['t34', 't34'], ['t35', 't35'],  // 30
  ['t36', 't4'], ['t37', 't37'], ['t38', 't38'], ['t39', 't39'], ['t40', 't40'], ['t41', 't41'],  // 36
  ['t42', 't42'], ['t43', 't43'], ['t44', 't44'], ['t45', 't45'], ['t46', 't46'], ['t47', 't47'],  // 42
  ['t32', 't5'], ['t33', 't33'], ['t34', 't34'], ['t35', 't35'], ['t36', 't4'], ['t37', 't37'],  // 48
  ['t38', 't38'], ['t39', 't39'], ['t40', 't40'], ['t41', 't41'], ['t42', 't42'], ['t43', 't43'],  // 54
  ['t44', 't44'], ['t45', 't45'], ['t46', 't46'], ['t47', 't47'],  // 60
];
const span = (from: number, to: number): [string, string | null][] => MENUETT.slice(from, to + 1);

export const menuett: Song = stykke({
  id: 'menuett-g',
  title: 'Menuett i G-dur',
  by: 'Christian Petzold, BWV Anh. 114 (fra notisboka til Anna Magdalena Bach). Etter Bach-Gesellschaft.',
  key: 'G',
  meter: { beats: 3, unit: 4 },
  casio: { tone: 1, tip: 'Lett og jevnt. La melodien synge litt over venstre hånd.' },
  bars: {
    t0: [N('D5', q, 5), N('G4', e, 1), N('A4', e, 2), N('B4', e, 3), N('C5', e, 4)],
    t1: [N('D5', q, 5), N('G4', q, 1), N('G4', q, 1)],
    t2: [N('E5', q, 5), N('C5', e, 1), N('D5', e, 2), N('E5', e, 3), N('F#5', e, 4)],
    t3: [N('G5', q, 5), N('G4', q, 1), N('G4', q, 1)],
    t4: [N('C5', q, 4), N('D5', e, 5), N('C5', e, 4), N('B4', e, 3), N('A4', e, 2)],
    t5: [N('B4', q, 3), N('C5', e, 4), N('B4', e, 3), N('A4', e, 2), N('G4', e, 1)],
    t6: [N('F#4', q, 2), N('G4', e, 1), N('A4', e, 2), N('B4', e, 3), N('G4', e, 1)],
    t7: [N('A4', dh, 2)],
    t14: [N('A4', q, 3), N('B4', e, 4), N('A4', e, 3), N('G4', e, 2), N('F#4', e, 1)],
    t15: [N('G4', dh, 2)],
    t32: [N('B5', q, 5), N('G5', e, 3), N('A5', e, 4), N('B5', e, 5), N('G5', e, 3)],
    t33: [N('A5', q, 4), N('D5', e, 1), N('E5', e, 2), N('F#5', e, 3), N('D5', e, 1)],
    t34: [N('G5', q, 4), N('E5', e, 2), N('F#5', e, 3), N('G5', e, 4), N('D5', e, 1)],
    t35: [N('C#5', q, 3), N('B4', e, 2), N('C#5', e, 3), N('A4', q, 1)],
    t36: [N('A4', e, 1), N('B4', e, 2), N('C#5', e, 3), N('D5', e, 1), N('E5', e, 2), N('F#5', e, 3)],
    t37: [N('G5', q, 4), N('F#5', q, 3), N('E5', q, 2)],
    t38: [N('F#5', q, 3), N('A4', q, 1), N('C#5', q, 2)],
    t39: [N('D5', dh, 3)],
    t40: [N('D5', q, 5), N('G4', e, 2), N('F#4', e, 1), N('G4', q, 2)],
    t41: [N('E5', q, 5), N('G4', e, 2), N('F#4', e, 1), N('G4', q, 2)],
    t42: [N('D5', q, 5), N('C5', q, 4), N('B4', q, 3)],
    t43: [N('A4', e, 3), N('G4', e, 2), N('F#4', e, 1), N('G4', e, 2), N('A4', q, 3)],
    t44: [N('D4', e, 1), N('E4', e, 2), N('F#4', e, 3), N('G4', e, 1), N('A4', e, 2), N('B4', e, 3)],
    t45: [N('C5', q, 4), N('B4', q, 3), N('A4', q, 2)],
    t46: [N('B4', e, 3), N('D5', e, 5), N('G4', q, 2), N('F#4', q, 1)],
    t47: [CH(['B3', 'D4', 'G4'], dh, '1 2 5', 'B+D+G')],
  },
  lh: {
    t0: [CH(['G3', 'B3', 'D4'], h, '5 3 1', 'G+B+D'), N('A3', q, 2)],
    t1: [N('B3', dh, 2)],
    t2: [N('C4', dh, 1)],
    t4: [N('A3', dh, 3)],
    t5: [N('G3', dh, 4)],
    t6: [N('D4', q, 1), N('B3', q, 3), N('G3', q, 5)],
    t7: [N('D4', q, 1), N('D3', e, 5), N('C4', e, 1), N('B3', e, 2), N('A3', e, 3)],
    t8: [N('B3', h, 1), N('A3', q, 2)],
    t9: [N('G3', q, 3), N('B3', q, 1), N('G3', q, 3)],
    t11: [N('B3', q, 2), N('C4', e, 1), N('B3', e, 2), N('A3', e, 3), N('G3', e, 4)],
    t12: [N('A3', h, 3), N('F#3', q, 5)],
    t13: [N('G3', h, 4), N('B3', q, 1)],
    t14: [N('C4', q, 2), N('D4', q, 1), N('D3', q, 5)],
    t15: [N('G3', h, 1), N('G2', q, 5)],
    t33: [N('F#3', dh, 5)],
    t34: [N('E3', q, 5), N('G3', q, 3), N('E3', q, 5)],
    t35: [N('A3', h, 1), N('A2', q, 5)],
    t37: [N('B3', q, 2), N('D4', q, 1), N('C#4', q, 2)],
    t38: [N('D4', q, 1), N('F#3', q, 4), N('A3', q, 2)],
    t39: [N('D4', q, 1), N('D3', q, 5), N('C4', q, 1)],
    t40: [N('B3', q, 2), N('D4', q, 1), N('B3', q, 2)],
    t41: [N('C4', q, 2), N('E4', q, 1), N('C4', q, 2)],
    t42: [N('B3', q, 3), N('A3', q, 4), N('G3', q, 5)],
    t43: [N('D4', h, 1), R(q)],
    t44: [N('D3', h, 5), N('F#3', q, 3)],
    t45: [N('E3', q, 4), N('G3', q, 2), N('F#3', q, 3)],
    t46: [N('G3', q, 2), N('B2', q, 5), N('D3', q, 3)],
    t47: [N('G3', q, 1), N('D3', q, 3), N('G2', q, 5)],
  },
  sections: [
    { id: 'menuett-1', title: 'Takt 1–8', tempo: 80, use: 'Første halvdel av del A.', groups: [{ label: 'Del A', bars: span(0, 7) }] },
    { id: 'menuett-2', title: 'Takt 9–16', tempo: 80, firstBar: 9, use: 'Andre halvdel av del A.', groups: [{ label: 'Del A, takt 9', bars: span(8, 15) }] },
    { id: 'menuett-3', title: 'Takt 17–24', tempo: 80, firstBar: 17, use: 'Første halvdel av del B, i D-dur.', groups: [{ label: 'Del B', bars: span(32, 39) }] },
    { id: 'menuett-4', title: 'Takt 25–32', tempo: 80, firstBar: 25, use: 'Andre halvdel av del B, tilbake til G-dur.', groups: [{ label: 'Del B, takt 25', bars: span(40, 47) }] },
    { id: 'menuett-hele', title: 'Hele stykket', tempo: 90, use: 'Med repetisjonene.', groups: [{ label: 'Del A', bars: span(0, 15) }, { label: 'Del A igjen', bars: span(16, 31) }, { label: 'Del B', bars: span(32, 47) }, { label: 'Del B igjen', bars: span(48, 63) }] }
  ]
});
