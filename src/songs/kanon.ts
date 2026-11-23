import { CH, N, R, s16, ed, e, q, w, type Song } from '../music/song';
import { stykke } from './klassisk';

// ---------- Pachelbel: Kanon i D-dur ----------
// Eget arrangement. Grunnbassen og første fiolin (takt 3–12) er hentet fra notesnutten i Wikipedia-artikkelen
// «Pachelbel's Canon». Trillen i takt 10 er sløyfet, og sluttakkorden er egen. Se assumptions.md (2026-11-23).

/** Hele arrangementet takt for takt (11 takter). Første fiolin kommer inn i takt 3, som i originalen. */
const KANON: [string, string | null][] = [
  ['REST', 't0'], ['REST', 't1'], ['t2', 't0'], ['t3', 't1'], ['t4', 't0'], ['t5', 't1'],  // 0
  ['t6', 't0'], ['t7', 't1'], ['t8', 't0'], ['t9', 't1'], ['t10', 't10'],  // 6
];
const span = (from: number, to: number): [string, string | null][] => KANON.slice(from, to + 1);

export const kanon: Song = stykke({
  id: 'kanon-d',
  title: 'Kanon i D-dur',
  by: 'Johann Pachelbel. Eget enkelt arrangement: grunnbassen i venstre hånd og første fiolin i høyre, med egen slutt.',
  key: 'D',
  meter: { beats: 4, unit: 4 },
  casio: { tone: 1, tip: 'Rolig og bundet. Grunnbassen går likt hele veien.' },
  bars: {
    REST: [R(w)],
    t2: [N('F#5', q, 4), N('E5', q, 3), N('D5', q, 2), N('C#5', q, 1)],
    t3: [N('B4', q, 3), N('A4', q, 2), N('B4', q, 3), N('C#5', q, 4)],
    t4: [N('D5', q, 5), N('C#5', q, 4), N('B4', q, 3), N('A4', q, 2)],
    t5: [N('G4', q, 1), N('F#4', q, 3), N('G4', q, 4), N('E4', q, 2)],
    t6: [N('D4', e, 1), N('F#4', e, 2), N('A4', e, 4), N('G4', e, 3), N('F#4', e, 2), N('D4', e, 1), N('F#4', e, 4), N('E4', e, 3)],
    t7: [N('D4', e, 2), N('B3', e, 1), N('D4', e, 2), N('A4', e, 5), N('G4', e, 1), N('B4', e, 3), N('A4', e, 2), N('G4', e, 1)],
    t8: [N('F#4', e, 3), N('D4', e, 1), N('E4', e, 2), N('C#5', e, 1), N('D5', e, 2), N('F#5', e, 3), N('A5', e, 5), N('A4', e, 1)],
    t9: [N('B4', e, 2), N('G4', e, 1), N('A4', e, 3), N('F#4', e, 2), N('D4', e, 1), N('D5', e, 5), N('D5', ed, 5), N('C#5', s16, 4)],
    t10: [CH(['F#4', 'A4', 'D5'], w, '1 2 5', 'F♯+A+D')],
  },
  lh: {
    t0: [N('D3', q, 1), N('A2', q, 3), N('B2', q, 2), N('F#2', q, 5)],
    t1: [N('G2', q, 3), N('D2', q, 5), N('G2', q, 3), N('A2', q, 2)],
    t10: [CH(['D2', 'D3'], w, '5 1', 'D+D')],
  },
  sections: [
    { id: 'kanon-1', title: 'Takt 1–6', tempo: 60, use: 'Grunnbassen alene, så melodien i fjerdedeler.', groups: [{ label: 'Kanon', bars: span(0, 5) }] },
    { id: 'kanon-2', title: 'Takt 7–11', tempo: 60, firstBar: 7, use: 'Åttedeler i høyre hånd og slutten.', groups: [{ label: 'Takt 7', bars: span(6, 10) }] },
    { id: 'kanon-hele', title: 'Hele stykket', tempo: 60, groups: [{ label: 'Kanon', bars: span(0, 10) }] }
  ]
});
