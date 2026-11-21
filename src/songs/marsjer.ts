import { CH, DY, N, R, e, ed, h, q, qd, s16, w, type Song } from '../music/song';
import { M44, klassisk } from './klassisk';

// Marsjer. Melodiene er kontrollert mot partiturer uten opphavsrett (se assumptions.md, 2026-11-21).

// ---------- Sousa: The Stars and Stripes Forever, siste del av trioen (A♭-dur i originalen, her C-dur) ----------

const STARS_C = [N('C3', q, 5), DY('E3', 'G3', q, '2 1'), DY('E3', 'G3', q, '2 1'), N('G2', q, 5)];

export const starsAndStripes = klassisk({
  id: 'stars-and-stripes',
  title: 'Stars and Stripes Forever',
  by: 'John Philip Sousa, siste del av trioen. Forenklet og flyttet fra A♭-dur til C-dur.',
  key: 'C',
  meter: { beats: 2, unit: 2 },
  casio: { tone: 211, tip: 'Marsjtempo. Øk tempoet når du kan den.' },
  bars: {
    P: [R(h), N('G5', h, 5)],
    S1: [N('G5', h, 5), N('F5', q, 4), N('E5', q, 3)],
    S2: [N('E5', h, 3), N('D#5', q, 2), N('E5', q, 3)],
    S3: [N('E5', w, 3)],
    // I originalen er E-en bundet over taktstreken. Her blir bindingen en pause.
    S4: [R(h), N('D#5', q, 2), N('E5', q, 3)],
    S6: [N('F5', q, 3), N('E5', q, 2), N('D5', qd, 1), N('B5', e, 5)],
    S7: [N('D5', w, 1)],
    S8: [N('C5', h, 1), N('C5', h, 1)],
    S9: [N('C5', h, 2), N('B4', q, 1), N('C5', q, 2)],
    S10: [N('Eb5', h, 4), N('D5', q, 3), N('C5', q, 2)],
    S11: [CH(['C5', 'C6'], w, '1 5', 'C')],
    S12: [R(q), N('C5', q, 1), N('D5', q, 2), N('E5', q, 3)],
    S13: [N('G5', e, 5), R(e), N('C5', q, 1), N('D5', q, 2), N('E5', q, 3)],
    S14: [N('G5', e, 5), R(e), N('G4', q, 1), N('A4', q, 2), N('E5', q, 5)],
    S15: [N('D5', w, 4)],
    S16: [N('C5', q, 3), R(q), R(h)]
  },
  lh: {
    C: STARS_C,
    E7: [N('B2', q, 5), DY('D3', 'G#3', q, '2 1'), DY('D3', 'G#3', q, '2 1'), N('E3', q, 1)],
    DM: [N('A2', q, 5), DY('D3', 'A3', q, '3 1'), DY('D3', 'A3', q, '3 1'), N('E3', q, 2)],
    AM: [N('A2', q, 5), DY('C3', 'E3', q, '2 1'), DY('C3', 'E3', q, '2 1'), N('E3', q, 1)],
    FM: [N('Ab2', q, 5), DY('C3', 'F3', q, '2 1'), DY('C3', 'F3', q, '2 1'), DY('C3', 'F3', q, '2 1')],
    AB: [N('Ab2', q, 5), DY('C3', 'Eb3', q, '2 1'), DY('C3', 'Eb3', q, '2 1'), DY('C3', 'Eb3', q, '2 1')],
    CG: [N('G2', q, 5), DY('E3', 'G3', q, '2 1'), N('C3', q, 4), DY('E3', 'G3', q, '2 1')],
    CE: [N('E2', q, 5), DY('E3', 'G3', q, '2 1'), N('G2', q, 4), DY('E3', 'G3', q, '2 1')],
    G7: [N('B2', q, 5), DY('F3', 'G3', q, '2 1'), N('G2', q, 5), DY('F3', 'G3', q, '2 1')],
    END: [DY('C3', 'G3', q), R(q), DY('C2', 'C3', q), DY('C2', 'C3', q)]
  },
  sections: [{
    id: 'stars', title: 'Stars and Stripes Forever', tempo: 160, use: 'Feiring, for eksempel når vinneren går opp på scenen.',
    groups: [{ label: 'Stars and Stripes Forever', bars: [
      ['P', null], ['S1', 'C'], ['S2', 'C'], ['S3', 'C'], ['S4', 'C'], ['S2', 'E7'], ['S6', 'E7'], ['S7', 'DM'], ['S8', 'AM'],
      ['S9', 'FM'], ['S10', 'AB'], ['S11', 'CG'], ['S12', 'CE'], ['S13', 'CE'], ['S14', 'C'], ['S15', 'G7'], ['S16', 'END']
    ] }]
  }]
});

// ---------- Sousa: The Liberty Bell, første del ----------

const LIBERTY_F = [N('F2', qd, 5), DY('F3', 'A3', qd, '2 1')];
const LIBERTY_A = [N('A4', e, 3), R(e), N('A4', e, 3), N('A4', e, 3), N('G#4', e, 2), N('A4', e, 3)];

export const libertyBell = klassisk({
  id: 'liberty-bell',
  title: 'The Liberty Bell',
  by: 'John Philip Sousa. Første del av marsjen, kjent fra Monty Python. Forenklet.',
  key: 'F',
  meter: { beats: 6, unit: 8 },
  casio: { reg: [8, 3], tone: 205, tip: 'Marsj i 6/8: tell to slag i takten.' },
  bars: {
    L1: LIBERTY_A,
    L2: [N('F5', e, 5), R(e), N('C5', e, 2), N('C5', e, 2), R(e), N('A4', e, 1)],
    L3: [N('Bb4', q, 2), N('Bb4', e, 2), N('Bb4', q, 2), N('C5', e, 3)],
    L4: [N('D5', h, 4), R(e), N('Bb4', e, 2)],
    L5: [N('G4', e, 2), R(e), N('G4', e, 2), N('G4', e, 2), N('F#4', e, 1), N('G4', e, 2)],
    L6: [N('E5', e, 4), R(e), N('D5', e, 3), N('D5', e, 3), R(e), N('Bb4', e, 1)],
    L7: [N('A4', e, 1), R(e), N('A4', e, 1), N('A4', e, 1), R(e), N('Bb4', e, 2)],
    L8: [N('C5', h, 3), R(e), N('C5', e, 3)],
    L10: [N('A5', e, 5), R(e), N('F5', e, 3), N('F5', e, 3), R(e), N('C5', e, 1)],
    L11: [N('B4', e, 1), R(e), N('G5', e, 5), N('G5', e, 5), R(e), N('G5', e, 5)],
    L12: [N('G5', h, 5), R(e), N('F5', e, 4)],
    L13: [N('E5', e, 3), R(e), N('G5', e, 5), N('G5', e, 5), N('F#5', e, 4), N('G5', e, 5)],
    L14: [N('D5', e, 2), R(e), N('G5', e, 5), N('G5', e, 5), N('F#5', e, 4), N('G5', e, 5)],
    L15: [N('C5', e, 2), R(e), N('B4', e, 1), N('C5', e, 2), R(e), N('B4', e, 1)],
    L16: [N('C5', qd, 2), N('C5', qd, 2)]
  },
  lh: {
    F: LIBERTY_F,
    W3: [N('E3', q, 3), N('F3', e, 2), N('G3', q, 1), N('F3', e, 2)],
    W4: [N('E3', q, 1), N('D3', e, 2), N('C3', q, 3), R(e)],
    C7: [N('C3', qd, 5), DY('G3', 'Bb3', qd, '2 1')],
    C7G: [N('G2', qd, 5), DY('E3', 'Bb3', qd, '3 1')],
    W7: [N('F3', q, 3), N('G3', e, 2), N('A3', q, 1), N('G3', e, 2)],
    W8: [N('F3', q, 1), N('E3', e, 2), N('D3', q, 3), N('C3', e, 4)],
    W11: [N('D3', q, 3), N('E3', e, 2), N('F3', q, 1), N('E3', e, 2)],
    W12: [N('D3', q, 1), N('C3', e, 2), N('B2', q, 3), N('A2', e, 4)],
    CG: [N('G2', qd, 5), DY('E3', 'G3', qd, '2 1')],
    G7: [N('G2', qd, 5), DY('F3', 'B3', qd, '2 1')],
    W15: [N('C3', e, 1), R(e), N('G2', e, 4), N('C3', e, 1), R(e), N('G2', e, 4)],
    END: [DY('C2', 'C3', qd), DY('E3', 'G3', qd, '2 1')]
  },
  sections: [{
    id: 'liberty', title: 'The Liberty Bell', tempo: 150, use: 'Når noe helt absurd skjer.',
    groups: [{ label: 'The Liberty Bell', bars: [
      ['L1', 'F'], ['L2', 'F'], ['L3', 'W3'], ['L4', 'W4'], ['L5', 'C7'], ['L6', 'C7G'], ['L7', 'W7'], ['L8', 'W8'],
      ['L1', 'F'], ['L10', 'F'], ['L11', 'W11'], ['L12', 'W12'], ['L13', 'CG'], ['L14', 'G7'], ['L15', 'W15'], ['L16', 'END']
    ] }]
  }]
});

// ---------- Mendelssohn: Bryllupsmarsj (En midtsommernattsdrøm) ----------

const WEDDING_E = [DY('E2', 'E3', h), DY('B2', 'A3', qd, '5 1'), DY('B2', 'A3', e, '5 1')];
const WEDDING_C = [DY('C2', 'C3', h), DY('B2', 'F3', q, '5 1'), DY('B2', 'F3', q, '5 1')];
const WEDDING_G = [DY('G2', 'E3', h, '5 1'), DY('G2', 'F3', h, '5 1')];

export const bryllupsmarsj = klassisk({
  id: 'bryllupsmarsj',
  title: 'Bryllupsmarsj',
  by: 'Felix Mendelssohn, En midtsommernattsdrøm. Temaet etter trompetsignalet, uten triller. Venstre hånd har bare bassen.',
  key: 'C',
  meter: M44,
  casio: { reg: [7, 3], tone: 205, layer: 75, tip: 'Bredt og festlig.' },
  bars: {
    W1: [CH(['C5', 'C6'], h, '1 5', 'C'), N('B5', qd, 4), N('F#5', e, 1)],
    W2: [N('A5', q, 4), N('G5', q, 3), N('F5', q, 2), N('D5', q, 1)],
    W3: [N('C5', h, 2), N('D5', q, 3), N('G4', ed, 1), N('D5', s16, 4)],
    W4: [N('E5', q, 3), N('C4', e, 1), N('E4', e, 2), N('G4', e, 3), N('C5', e, 1), N('E5', e, 2), N('G5', e, 3)],
    W5: [N('C6', h, 5), N('B5', qd, 4), N('F#5', e, 1)],
    W7: [N('C5', h, 1), N('E5', q, 3), N('D5', ed, 2), N('E5', s16, 3)],
    W8: [N('D5', h, 2), N('C5', q, 1), R(q)]
  },
  lh: {
    E: WEDDING_E,
    C: WEDDING_C,
    G: WEDDING_G,
    W4: [DY('C2', 'C3', h), DY('C3', 'G3', h)],
    END: [DY('G2', 'F3', h, '5 1'), DY('C2', 'C3', q), R(q)]
  },
  sections: [{
    id: 'bryllupsmarsj', title: 'Bryllupsmarsj', tempo: 100, use: 'Når vinneren kåres, eller når to lag slår seg sammen.',
    groups: [{ label: 'Bryllupsmarsj', bars: [['W1', 'E'], ['W2', 'C'], ['W3', 'G'], ['W4', 'W4'], ['W5', 'E'], ['W2', 'C'], ['W7', 'G'], ['W8', 'END']] }]
  }]
});

export const marsjer: Song[] = [starsAndStripes, libertyBell, bryllupsmarsj];
