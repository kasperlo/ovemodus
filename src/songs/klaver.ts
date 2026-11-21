import { CH, DY, N, R, e, ed, h, q, s16, w, type Song } from '../music/song';
import { M24, M44, klassisk } from './klassisk';

// Klassiske verk skrevet for klaver og orgel. Melodiene er kontrollert mot partiturer uten opphavsrett
// (se assumptions.md, 2026-11-21).

// ---------- Beethoven: Für Elise ----------

const ELISE_A = [N('A2', s16, 5), N('E3', s16, 2), N('A3', s16, 1), R(ed)];
const ELISE_E = [N('E2', s16, 5), N('E3', s16, 2), N('G#3', s16, 1), R(ed)];

export const furElise = klassisk({
  id: 'fur-elise',
  title: 'Für Elise',
  by: 'Ludwig van Beethoven. De åtte første taktene.',
  key: 'Am',
  meter: { beats: 3, unit: 8 },
  casio: { reg: [8, 2], tone: 1, tip: 'Lett og rolig.' },
  bars: {
    P: [R(q), N('E5', s16, 5), N('D#5', s16, 4)],
    E1: [N('E5', s16, 5), N('D#5', s16, 4), N('E5', s16, 5), N('B4', s16, 2), N('D5', s16, 4), N('C5', s16, 3)],
    E2: [N('A4', e, 1), R(s16), N('C4', s16, 1), N('E4', s16, 2), N('A4', s16, 4)],
    E3: [N('B4', e, 5), R(s16), N('E4', s16, 1), N('G#4', s16, 3), N('B4', s16, 4)],
    E4: [N('C5', e, 5), R(s16), N('E4', s16, 1), N('E5', s16, 5), N('D#5', s16, 4)],
    E7: [N('B4', e, 5), R(s16), N('E4', s16, 1), N('C5', s16, 5), N('B4', s16, 4)],
    E8: [N('A4', q, 3), R(e)]
  },
  lh: { A: ELISE_A, E: ELISE_E },
  sections: [{
    id: 'elise', title: 'Für Elise', tempo: 70, use: 'Rolig pause, eller når noen tenker lenge.',
    groups: [{ label: 'Für Elise', bars: [
      ['P', null], ['E1', null], ['E2', 'A'], ['E3', 'E'], ['E4', 'A'], ['E1', null], ['E2', 'A'], ['E7', 'E'], ['E8', 'A']
    ] }]
  }]
});

// ---------- Mozart: Rondo alla turca (Pianosonate nr. 11, siste sats) ----------

const TURCA_A = [N('A2', e, 5), DY('C3', 'E3', e, '2 1'), DY('C3', 'E3', e, '2 1'), DY('C3', 'E3', e, '2 1')];

export const rondoAllaTurca = klassisk({
  id: 'rondo-alla-turca',
  title: 'Rondo alla turca',
  by: 'Wolfgang Amadeus Mozart, Pianosonate nr. 11, siste sats. Temaet slik det slutter første gang (takt 16–24), forenklet.',
  key: 'Am',
  meter: M24,
  casio: { tone: 1, tip: 'Lett og tydelig, nesten staccato.' },
  bars: {
    P: [R(q), N('B4', s16, 3), N('A4', s16, 2), N('G#4', s16, 1), N('A4', s16, 2)],
    T1: [N('C5', e, 4), R(e), N('D5', s16, 3), N('C5', s16, 2), N('B4', s16, 1), N('C5', s16, 2)],
    T2: [N('E5', e, 4), R(e), N('F5', s16, 3), N('E5', s16, 2), N('D#5', s16, 1), N('E5', s16, 2)],
    T3: [N('B5', s16, 3), N('A5', s16, 2), N('G#5', s16, 1), N('A5', s16, 2), N('B5', s16, 3), N('A5', s16, 2), N('G#5', s16, 1), N('A5', s16, 2)],
    T4: [N('C6', e, 4), R(e), N('A5', e, 2), N('B5', e, 3)],
    T5: [N('C6', e, 4), N('B5', e, 3), N('A5', e, 2), N('G#5', e, 1)],
    T6: [N('A5', e, 4), N('E5', e, 1), N('F5', e, 2), N('D5', e, 1)],
    // Trillen og tretiandedelene i originalen er forenklet til to fjerdedeler
    T7: [N('C5', q, 2), N('B4', q, 1)],
    T8: [N('A4', q, 1), R(q)]
  },
  // Takt 1–5 en oktav lavere enn originalen, så venstre hånd holder seg under midtre C
  lh: {
    T1: TURCA_A,
    T3: [N('A2', e, 5), DY('C3', 'E3', e, '2 1'), N('A2', e, 5), DY('C3', 'E3', e, '2 1')],
    T4: [N('F2', e, 5), DY('A2', 'D#3', e, '2 1'), DY('A2', 'D#3', e, '2 1'), DY('A2', 'D#3', e, '2 1')],
    T5: [N('E2', e, 5), DY('A2', 'E3', e, '2 1'), N('D2', e, 5), DY('F2', 'B2', e, '2 1')],
    T6: [N('C3', e, 5), DY('E3', 'A3', e, '2 1'), N('D3', e, 5), DY('F3', 'B3', e, '2 1')],
    T7: [DY('E3', 'A3', e), DY('E3', 'A3', e), DY('E3', 'G#3', e), DY('E3', 'G#3', e)],
    T8: [DY('A2', 'A3', q), R(q)]
  },
  sections: [{
    id: 'turca', title: 'Rondo alla turca', tempo: 100, use: 'Fart og moro, for eksempel i en hurtigrunde.',
    groups: [{ label: 'Rondo alla turca', bars: [
      ['P', null], ['T1', 'T1'], ['T2', 'T1'], ['T3', 'T3'], ['T4', 'T4'], ['T5', 'T5'], ['T6', 'T6'], ['T7', 'T7'], ['T8', 'T8']
    ] }]
  }]
});

// ---------- Joplin: The Entertainer ----------

export const entertainer = klassisk({
  id: 'entertainer',
  title: 'The Entertainer',
  by: 'Scott Joplin. Første del av hovedtemaet, forenklet.',
  key: 'C',
  meter: M24,
  casio: { reg: [8, 1], tone: 11, tip: 'Ikke for fort. Joplin skrev «Not fast» over noten.' },
  bars: {
    P: [R(q), R(e), N('D4', s16, 2), N('D#4', s16, 3)],
    E1: [N('E4', s16, 1), N('C5', e, 5), N('E4', s16, 1), N('C5', e, 5), N('E4', s16, 1), N('C5', s16, 5)],
    // I originalen er C-en bundet over taktstreken. Her blir bindingen en pause.
    E2: [R(q), R(s16), N('C5', s16, 2), N('D5', s16, 3), N('D#5', s16, 4)],
    E3: [N('E5', s16, 4), N('C5', s16, 2), N('D5', s16, 3), N('E5', e, 4), N('B4', s16, 1), N('D5', e, 3)],
    E4: [CH(['C5', 'E5', 'C6'], q, '1 2 5', 'C-dur', 'C'), R(q)]
  },
  lh: {
    E1: [N('C3', e, 5), DY('E3', 'G3', e, '2 1'), N('G2', e, 5), DY('G3', 'Bb3', e, '2 1')],
    E2: [N('F2', e, 5), DY('F3', 'A3', e, '2 1'), N('E2', e, 5), DY('E3', 'G3', e, '2 1')],
    E3: [N('G2', e, 5), DY('E3', 'G3', e, '2 1'), N('G2', e, 5), DY('F3', 'B3', e, '2 1')],
    E4: [N('C3', e, 5), DY('E3', 'G3', e, '2 1'), R(q)]
  },
  sections: [{
    id: 'entertainer', title: 'The Entertainer', tempo: 80, use: 'Pause, eller når noen gjør noe morsomt.',
    groups: [{ label: 'The Entertainer', bars: [['P', null], ['E1', 'E1'], ['E2', 'E2'], ['E3', 'E3'], ['E4', 'E4']] }]
  }]
});

// ---------- Bach: Toccata i d-moll, BWV 565 ----------

export const toccata = klassisk({
  id: 'toccata',
  title: 'Toccata i d-moll',
  by: 'Johann Sebastian Bach, BWV 565, åpningen. Forenklet: de raske figurene er skrevet som sekstendeler.',
  key: 'Dm',
  meter: M44,
  casio: { reg: [6, 1], tone: 75, tip: 'Hold fermatene lenge. Reverb Hall gjør orgelet større.' },
  bars: {
    T1: [
      N('A5', s16, 3), N('G5', s16, 2), N('A5', q, 3, { fermata: true }),
      N('G5', s16, 5), N('F5', s16, 4), N('E5', s16, 3), N('D5', s16, 2), N('C#5', e, 1), N('D5', q, 2, { fermata: true })
    ],
    T2: [
      N('A4', s16, 3), N('G4', s16, 2), N('A4', q, 3, { fermata: true }),
      R(e), N('E4', s16, 2), N('F4', s16, 3), N('C#4', e, 1), N('D4', q, 2, { fermata: true })
    ],
    REST: [R(w)],
    T4: [CH(['C#4', 'E4', 'G4', 'Bb4'], h, '1 2 3 5', 'C♯°7'), CH(['D4', 'F#4', 'A4'], h, '1 3 5', 'D-dur', 'D')]
  },
  lh: {
    T2: [
      N('A3', s16, 2), N('G3', s16, 3), N('A3', q, 2, { fermata: true }),
      R(e), N('E3', s16, 4), N('F3', s16, 3), N('C#3', e, 5), N('D3', q, 4, { fermata: true })
    ],
    T3: [
      N('A2', s16, 1), N('G2', s16, 2), N('A2', q, 1, { fermata: true }),
      N('G2', s16, 1), N('F2', s16, 2), N('E2', s16, 3), N('D2', s16, 4), N('C#2', e, 5), N('D2', q, 4, { fermata: true })
    ],
    T4: [DY('D2', 'D3', w)]
  },
  sections: [{
    id: 'toccata', title: 'Toccata i d-moll', tempo: 70, use: 'Dramatisk: når noe skummelt eller avgjørende skjer.',
    groups: [{ label: 'Toccata', bars: [['T1', null], ['T2', 'T2'], ['REST', 'T3'], ['T4', 'T4']] }]
  }]
});

export const klaver: Song[] = [furElise, rondoAllaTurca, entertainer, toccata];
