import { CH, N, R, dh, e, h, q, s16, w, type Song } from '../music/song';

const PART_A: [string, string][] = [['A1', 'A'], ['A2', 'A'], ['A3', 'A'], ['A4', 'A']];
const PART_B: [string, string][] = [['B1', 'B'], ['B2', 'B'], ['B1', 'B'], ['B4', 'B']];

/** «I Dovregubbens hall» (Grieg, forenklet i a-moll) og to gameshow-effekter. */
export const dovregubben: Song = {
  id: 'dovregubben',
  title: 'I Dovregubbens hall',
  bars: {
    A1: [N('A4', e, 1), N('B4', e, 2), N('C5', e, 3), N('D5', e, 4), N('E5', e, 5), N('C5', e, 3), N('E5', q, 5)],
    A2: [N('D#5', e, 4), N('B4', e, 2), N('D#5', q, 4), N('D5', e, 4), N('Bb4', e, 2), N('D5', q, 4)],
    A3: [N('A4', e, 1), N('B4', e, 2), N('C5', e, 3), N('D5', e, 1), N('E5', e, 2), N('C5', e, 1), N('E5', e, 2), N('A5', e, 5)],
    A4: [N('G5', e, 4), N('E5', e, 2), N('C5', e, 1), N('E5', e, 2), N('G5', h, 4)],
    B1: [N('E5', e, 1), N('F#5', e, 2), N('G#5', e, 3), N('A5', e, 4), N('B5', e, 5), N('G#5', e, 3), N('B5', q, 5)],
    B2: [N('C6', e, 5), N('G#5', e, 2), N('C6', q, 5), N('B5', e, 4), N('G#5', e, 2), N('B5', q, 4)],
    B4: [N('C6', e, 5), N('G#5', e, 2), N('C6', q, 5), N('B5', h, 4)],
    END: [CH(['A4', 'C5', 'E5', 'A5'], q, '1 2 3 5', 'A-moll', 'Am'), R(q), R(h)],
    FAN: [N('C4', s16, 1), N('E4', s16, 2), N('G4', s16, 3), N('C5', s16, 5), CH(['C4', 'E4', 'G4', 'C5'], dh, '1 2 3 5', 'C-dur', 'C')],
    FE1: [R(q), N('G4', q, 4), N('F#4', q, 3), N('F4', q, 2)],
    FE2: [N('E4', w, 1)]
  },
  // To toner på hvert slag
  lh: {
    A: [0, 2, 4, 6].map(p => ({ p, d: q, m: [45, 52] })), // A2 + E3
    B: [0, 2, 4, 6].map(p => ({ p, d: q, m: [40, 47] })), // E2 + B2
    END: [{ p: 0, d: q, m: [33, 45] }],                   // A1 + A2
    FAN: [{ p: 2, d: dh, m: [36, 48] }]                   // C2 + C3
  },
  sections: [
    { id: 'delA', title: 'Del A', tempo: 100, groups: [{ label: 'Del A', bars: PART_A }] },
    { id: 'delB', title: 'Del B', tempo: 100, groups: [{ label: 'Del B', bars: PART_B }] },
    { id: 'hele', title: 'Hele stykket', tempo: 100, groups: [
      { label: 'Del A', bars: PART_A }, { label: 'Del A, andre gang', bars: PART_A },
      { label: 'Del B', bars: PART_B }, { label: 'Del A igjen', bars: PART_A },
      { label: 'Sluttakkord', bars: [['END', 'END']] }] },
    { id: 'riktig', title: 'Riktig svar', tempo: 120, groups: [{ label: 'Riktig svar – fanfare', bars: [['FAN', 'FAN']] }] },
    { id: 'feil', title: 'Feil svar', tempo: 76, groups: [{ label: 'Feil svar – sad trombone', bars: [['FE1', null], ['FE2', null]] }] }
  ]
};
