import { CH, DY, N, R, e, h, q, type Song } from '../music/song';

const PART_A: [string, string][] = [['A1', 'A'], ['A2', 'A'], ['A3', 'A'], ['A4', 'A']];
const PART_B: [string, string][] = [['B1', 'B'], ['B2', 'B'], ['B1', 'B'], ['B4', 'B']];

/** «I Dovregubbens hall» (Grieg, forenklet i a-moll). */
export const dovregubben: Song = {
  id: 'dovregubben',
  title: 'I Dovregubbens hall',
  by: 'Edvard Grieg, forenklet',
  category: 'låt',
  key: 'Am',
  meter: { beats: 4, unit: 4 },
  casio: { reg: [5, 2], tone: 241, lower: 192, tip: 'Som Grieg skrev det: fagott i melodien og pizzicato i bassen. Til vanlig øving: 001 STAGE PIANO.' },
  bars: {
    A1: [N('A4', e, 1), N('B4', e, 2), N('C5', e, 3), N('D5', e, 4), N('E5', e, 5), N('C5', e, 3), N('E5', q, 5)],
    A2: [N('D#5', e, 4), N('B4', e, 2), N('D#5', q, 4), N('D5', e, 4), N('Bb4', e, 2), N('D5', q, 4)],
    A3: [N('A4', e, 1), N('B4', e, 2), N('C5', e, 3), N('D5', e, 1), N('E5', e, 2), N('C5', e, 1), N('E5', e, 2), N('A5', e, 5)],
    A4: [N('G5', e, 4), N('E5', e, 2), N('C5', e, 1), N('E5', e, 2), N('G5', h, 4)],
    B1: [N('E5', e, 1), N('F#5', e, 2), N('G#5', e, 3), N('A5', e, 4), N('B5', e, 5), N('G#5', e, 3), N('B5', q, 5)],
    B2: [N('C6', e, 5), N('G#5', e, 2), N('C6', q, 5), N('B5', e, 4), N('G#5', e, 2), N('B5', q, 4)],
    B4: [N('C6', e, 5), N('G#5', e, 2), N('C6', q, 5), N('B5', h, 4)],
    END: [CH(['A4', 'C5', 'E5', 'A5'], q, '1 2 3 5', 'A-moll', 'Am'), R(q), R(h)]
  },
  // Kvint på hvert slag: A2 + E3 i del A, E2 + B2 i del B
  lh: {
    A: [DY('A2', 'E3', q), DY('A2', 'E3', q), DY('A2', 'E3', q), DY('A2', 'E3', q)],
    B: [DY('E2', 'B2', q), DY('E2', 'B2', q), DY('E2', 'B2', q), DY('E2', 'B2', q)],
    // Under F♯3, så den havner i venstre hånd også når keyboardet er splittet
    END: [DY('A2', 'E3', q), R(q), R(h)]
  },
  sections: [
    { id: 'delA', title: 'Del A', tempo: 100, groups: [{ label: 'Del A', bars: PART_A }] },
    { id: 'delB', title: 'Del B', tempo: 100, groups: [{ label: 'Del B', bars: PART_B }] },
    { id: 'hele', title: 'Hele stykket', tempo: 100, use: 'Spill den raskere for hver runde som nedtelling.', groups: [
      { label: 'Del A', bars: PART_A }, { label: 'Del A, andre gang', bars: PART_A },
      { label: 'Del B', bars: PART_B }, { label: 'Del A igjen', bars: PART_A },
      { label: 'Sluttakkord', bars: [['END', 'END']] }] }
  ]
};
