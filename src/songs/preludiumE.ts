import { CH, N, R, T3, s16, ed, e, qd, q, dh, h, w, type Song } from '../music/song';
import { stykke } from './klassisk';

// ---------- Chopin: Preludium i e-moll, op. 28 nr. 4 ----------
// Hentet fra Mutopia (Chop-28-4, Peters 1879, Public Domain) med et skript og sjekket mot MIDI-filen derfra.
// Endret: G𝄪5 i takt 16 er skrevet som A5, H1 og E1 i bassen til slutt er flyttet en oktav opp, forslagsnotene er
// sløyfet, og bindingen over taktstreken i takt 8–9 er en pause. Fingersettingen er et eget forslag. Se assumptions.md.

/** Hele stykket takt for takt. Takt 0 er opptakten. */
const PRELUDIUM_E: [string, string | null][] = [
  ['t0', null], ['t1', 't1'], ['t1', 't2'], ['t1', 't3'], ['t4', 't4'], ['t5', 't5'],  // 0
  ['t5', 't6'], ['t7', 't7'], ['t8', 't8'], ['t9', 't9'], ['t10', 't10'], ['t10', 't11'],  // 6
  ['t12', 't12'], ['t1', 't1'], ['t1', 't14'], ['t1', 't15'], ['t16', 't16'], ['t17', 't17'],  // 12
  ['t18', 't18'], ['t10', 't19'], ['t20', 't20'], ['t21', 't21'], ['t21', 't22'], ['t23', 't23'],  // 18
  ['t24', 't24'], ['t25', 't25'],  // 24
];
const span = (from: number, to: number): [string, string | null][] => PRELUDIUM_E.slice(from, to + 1);

export const preludiumE: Song = stykke({
  id: 'preludium-e',
  title: 'Preludium i e-moll',
  by: 'Frédéric Chopin, op. 28 nr. 4. Etter Peters (1879).',
  key: 'Em',
  meter: { beats: 2, unit: 2 },
  casio: { tone: 1, tip: 'Langsomt og stille. Venstre hånd jevnt og svakt, melodien litt sterkere.' },
  bars: {
    t0: [R(dh), N('B3', ed, 1), N('B4', s16, 4)],
    t1: [N('B4', dh, 4), N('C5', q, 5)],
    t4: [N('B4', dh, 4), N('Bb4', q, 3)],
    t5: [N('A4', dh, 2), N('B4', q, 3)],
    t7: [N('A4', dh, 2), N('B4', ed, 3), N('A4', s16, 2)],
    t8: [N('A4', dh, 2), N('G#4', q, 1)],
    t9: [R(q), N('A4', e, 2), N('B4', e, 3), N('D5', e, 5), N('C5', e, 4), N('E4', e, 1), N('A4', e, 4)],
    t10: [N('F#4', dh, 2), N('A4', q, 5)],
    t12: [N('G4', e, 4), N('F#4', e, 3), N('C4', e, 2), N('B3', e, 1), N('D#4', e, 3), N('F#4', e, 5), ...T3(N('D5', e, 4), N('C5', e, 3), N('B4', e, 2))],
    t16: [N('B4', ed, 2), N('A#4', s16, 1), N('A#4', q, 1), N('A5', q, 5), N('F#5', ed, 3), N('E5', s16, 2)],
    t17: [N('E5', e, 2), N('D#5', e, 1), N('C6', e, 5), N('D#5', e, 1), N('D#5', e, 1), N('E5', e, 2), N('G5', e, 4), N('B4', e, 1)],
    t18: [N('D5', e, 3), N('C5', e, 2), ...T3(N('E5', e, 5), N('E4', e, 1), N('A4', e, 3)), N('F#4', qd, 2), N('A4', e, 4)],
    t20: [N('F#4', 7.5, 2), N('E4', s16, 1)],
    t21: [N('E4', dh, 1), N('F#4', q, 2)],
    t23: [N('E4', h, 1), R(h)],
    t24: [CH(['E3', 'F#3', 'B3', 'E4'], h, '1 2 3 5', 'E+F♯+B+E'), CH(['D#3', 'F#3', 'B3', 'D#4'], h, '1 2 3 5', 'D♯+F♯+B+D♯')],
    t25: [CH(['E3', 'G3', 'B3', 'E4'], w, '1 2 3 5', 'E+G+B+E')],
  },
  lh: {
    t1: [CH(['G3', 'B3', 'E4'], e, '5 3 1', 'G+B+E'), CH(['G3', 'B3', 'E4'], e, '5 3 1', 'G+B+E'), CH(['G3', 'B3', 'E4'], e, '5 3 1', 'G+B+E'), CH(['G3', 'B3', 'E4'], e, '5 3 1', 'G+B+E'), CH(['G3', 'B3', 'E4'], e, '5 3 1', 'G+B+E'), CH(['G3', 'B3', 'E4'], e, '5 3 1', 'G+B+E'), CH(['G3', 'B3', 'E4'], e, '5 3 1', 'G+B+E'), CH(['G3', 'B3', 'E4'], e, '5 3 1', 'G+B+E')],
    t2: [CH(['F#3', 'A3', 'E4'], e, '5 3 1', 'F♯+A+E'), CH(['F#3', 'A3', 'E4'], e, '5 3 1', 'F♯+A+E'), CH(['F#3', 'A3', 'E4'], e, '5 3 1', 'F♯+A+E'), CH(['F#3', 'A3', 'E4'], e, '5 3 1', 'F♯+A+E'), CH(['F#3', 'A3', 'D#4'], e, '5 3 1', 'F♯+A+D♯'), CH(['F#3', 'A3', 'D#4'], e, '5 3 1', 'F♯+A+D♯'), CH(['F#3', 'A3', 'D#4'], e, '5 3 1', 'F♯+A+D♯'), CH(['F#3', 'A3', 'D#4'], e, '5 3 1', 'F♯+A+D♯')],
    t3: [CH(['F3', 'A3', 'D#4'], e, '5 3 1', 'F+A+D♯'), CH(['F3', 'A3', 'D#4'], e, '5 3 1', 'F+A+D♯'), CH(['F3', 'A3', 'D#4'], e, '5 3 1', 'F+A+D♯'), CH(['F3', 'A3', 'D#4'], e, '5 3 1', 'F+A+D♯'), CH(['F3', 'A3', 'D4'], e, '5 3 1', 'F+A+D'), CH(['F3', 'A3', 'D4'], e, '5 3 1', 'F+A+D'), CH(['F3', 'G#3', 'D4'], e, '5 3 1', 'F+G♯+D'), CH(['F3', 'G#3', 'D4'], e, '5 3 1', 'F+G♯+D')],
    t4: [CH(['E3', 'G#3', 'D4'], e, '5 3 1', 'E+G♯+D'), CH(['E3', 'G#3', 'D4'], e, '5 3 1', 'E+G♯+D'), CH(['E3', 'G#3', 'D4'], e, '5 3 1', 'E+G♯+D'), CH(['E3', 'G#3', 'D4'], e, '5 3 1', 'E+G♯+D'), CH(['E3', 'G3', 'D4'], e, '5 3 1', 'E+G+D'), CH(['E3', 'G3', 'D4'], e, '5 3 1', 'E+G+D'), CH(['E3', 'G3', 'C#4'], e, '5 3 1', 'E+G+C♯'), CH(['E3', 'G3', 'C#4'], e, '5 3 1', 'E+G+C♯')],
    t5: [CH(['E3', 'G3', 'C4'], e, '5 3 1', 'E+G+C'), CH(['E3', 'G3', 'C4'], e, '5 3 1', 'E+G+C'), CH(['E3', 'G3', 'C4'], e, '5 3 1', 'E+G+C'), CH(['E3', 'G3', 'C4'], e, '5 3 1', 'E+G+C'), CH(['E3', 'F#3', 'C4'], e, '5 4 1', 'E+F♯+C'), CH(['E3', 'F#3', 'C4'], e, '5 4 1', 'E+F♯+C'), CH(['E3', 'F#3', 'C4'], e, '5 4 1', 'E+F♯+C'), CH(['E3', 'F#3', 'C4'], e, '5 4 1', 'E+F♯+C')],
    t6: [CH(['E3', 'F#3', 'C4'], e, '5 4 1', 'E+F♯+C'), CH(['E3', 'F#3', 'C4'], e, '5 4 1', 'E+F♯+C'), CH(['E3', 'F#3', 'C4'], e, '5 4 1', 'E+F♯+C'), CH(['E3', 'F#3', 'C4'], e, '5 4 1', 'E+F♯+C'), CH(['D#3', 'F#3', 'C4'], e, '5 3 1', 'D♯+F♯+C'), CH(['D#3', 'F#3', 'C4'], e, '5 3 1', 'D♯+F♯+C'), CH(['D#3', 'F#3', 'C4'], e, '5 3 1', 'D♯+F♯+C'), CH(['D#3', 'F#3', 'C4'], e, '5 3 1', 'D♯+F♯+C')],
    t7: [CH(['D3', 'F#3', 'C4'], e, '5 3 1', 'D+F♯+C'), CH(['D3', 'F#3', 'C4'], e, '5 3 1', 'D+F♯+C'), CH(['D3', 'F#3', 'C4'], e, '5 3 1', 'D+F♯+C'), CH(['D3', 'F#3', 'C4'], e, '5 3 1', 'D+F♯+C'), CH(['D3', 'F#3', 'C4'], e, '5 3 1', 'D+F♯+C'), CH(['D3', 'F#3', 'C4'], e, '5 3 1', 'D+F♯+C'), CH(['D3', 'F#3', 'C4'], e, '5 3 1', 'D+F♯+C'), CH(['D3', 'F#3', 'C4'], e, '5 3 1', 'D+F♯+C')],
    t8: [CH(['D3', 'F3', 'C4'], e, '5 3 1', 'D+F+C'), CH(['D3', 'F3', 'C4'], e, '5 3 1', 'D+F+C'), CH(['D3', 'F3', 'C4'], e, '5 3 1', 'D+F+C'), CH(['D3', 'F3', 'C4'], e, '5 3 1', 'D+F+C'), CH(['D3', 'F3', 'B3'], e, '5 3 1', 'D+F+B'), CH(['D3', 'F3', 'B3'], e, '5 3 1', 'D+F+B'), CH(['D3', 'F3', 'B3'], e, '5 3 1', 'D+F+B'), CH(['D3', 'F3', 'B3'], e, '5 3 1', 'D+F+B')],
    t9: [CH(['C3', 'E3', 'B3'], e, '5 3 1', 'C+E+B'), CH(['C3', 'E3', 'B3'], e, '5 3 1', 'C+E+B'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A')],
    t10: [CH(['B2', 'E3', 'A3'], e, '5 2 1', 'B+E+A'), CH(['B2', 'E3', 'A3'], e, '5 2 1', 'B+E+A'), CH(['B2', 'D#3', 'A3'], e, '5 3 1', 'B+D♯+A'), CH(['B2', 'D#3', 'A3'], e, '5 3 1', 'B+D♯+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A')],
    t11: [CH(['B2', 'D#3', 'A3'], e, '5 3 1', 'B+D♯+A'), CH(['B2', 'D#3', 'A3'], e, '5 3 1', 'B+D♯+A'), CH(['B2', 'D#3', 'A3'], e, '5 3 1', 'B+D♯+A'), CH(['B2', 'D#3', 'A3'], e, '5 3 1', 'B+D♯+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A')],
    t12: [CH(['B2', 'D#3', 'A3'], q, '5 3 1', 'B+D♯+A'), R(dh)],
    t14: [CH(['F#3', 'A3', 'E4'], e, '5 3 1', 'F♯+A+E'), CH(['F#3', 'A3', 'E4'], e, '5 3 1', 'F♯+A+E'), CH(['F#3', 'A3', 'E4'], e, '5 3 1', 'F♯+A+E'), CH(['F#3', 'A3', 'E4'], e, '5 3 1', 'F♯+A+E'), CH(['F3', 'A3', 'D#4'], e, '5 3 1', 'F+A+D♯'), CH(['F3', 'A3', 'D#4'], e, '5 3 1', 'F+A+D♯'), CH(['F3', 'A3', 'D#4'], e, '5 3 1', 'F+A+D♯'), CH(['F3', 'A3', 'D#4'], e, '5 3 1', 'F+A+D♯')],
    t15: [CH(['F3', 'G#3', 'D#4'], e, '5 3 1', 'F+G♯+D♯'), CH(['F3', 'G#3', 'D#4'], e, '5 3 1', 'F+G♯+D♯'), CH(['F3', 'G#3', 'D4'], e, '5 3 1', 'F+G♯+D'), CH(['F3', 'G#3', 'D4'], e, '5 3 1', 'F+G♯+D'), CH(['E3', 'G#3', 'D4'], e, '5 3 1', 'E+G♯+D'), CH(['E3', 'G#3', 'D4'], e, '5 3 1', 'E+G♯+D'), CH(['E3', 'G#3', 'D4'], e, '5 3 1', 'E+G♯+D'), CH(['E3', 'G#3', 'D4'], e, '5 3 1', 'E+G♯+D')],
    t16: [CH(['E3', 'G3', 'D4'], e, '5 3 1', 'E+G+D'), CH(['E3', 'G3', 'D4'], e, '5 3 1', 'E+G+D'), CH(['E3', 'G3', 'C#4'], e, '5 3 1', 'E+G+C♯'), CH(['E3', 'G3', 'C#4'], e, '5 3 1', 'E+G+C♯'), CH(['C#3', 'E3', 'A#3'], e, '5 3 1', 'C♯+E+A♯'), CH(['C#3', 'E3', 'A#3'], e, '5 3 1', 'C♯+E+A♯'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A')],
    t17: [N('B2', e, 5), CH(['A3', 'C4', 'F#4', 'A4'], e, '5 4 2 1', 'A+C+F♯+A'), CH(['A3', 'C4', 'F#4', 'A4'], e, '5 4 2 1', 'A+C+F♯+A'), CH(['A3', 'C4', 'F#4', 'A4'], e, '5 4 2 1', 'A+C+F♯+A'), CH(['G3', 'B3', 'D#4', 'F#4'], e, '5 4 3 2', 'G+B+D♯+F♯'), CH(['G3', 'B3', 'E4'], e, '5 3 1', 'G+B+E'), CH(['G3', 'B3', 'E4'], e, '5 3 1', 'G+B+E'), CH(['G3', 'B3', 'E4'], e, '5 3 1', 'G+B+E')],
    t18: [CH(['A3', 'C4', 'E4'], e, '5 3 1', 'A+C+E'), CH(['A3', 'C4', 'E4'], e, '5 3 1', 'A+C+E'), N('A2', e, 5), CH(['E3', 'F#3', 'C4'], e, '5 4 1', 'E+F♯+C'), CH(['B2', 'E3', 'B3'], e, '5 2 1', 'B+E+B'), CH(['B2', 'E3', 'B3'], e, '5 2 1', 'B+E+B'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A')],
    t19: [CH(['B2', 'E3', 'B3'], e, '5 2 1', 'B+E+B'), CH(['B2', 'E3', 'B3'], e, '5 2 1', 'B+E+B'), CH(['B2', 'E3', 'B3'], e, '5 2 1', 'B+E+B'), CH(['B2', 'E3', 'B3'], e, '5 2 1', 'B+E+B'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A')],
    t20: [CH(['B2', 'E3', 'B3'], e, '5 2 1', 'B+E+B'), CH(['B2', 'E3', 'B3'], e, '5 2 1', 'B+E+B'), CH(['B2', 'E3', 'B3'], e, '5 2 1', 'B+E+B'), CH(['B2', 'E3', 'B3'], e, '5 2 1', 'B+E+B'), CH(['B2', 'D#3', 'B3'], e, '5 3 1', 'B+D♯+B'), CH(['B2', 'D#3', 'B3'], e, '5 3 1', 'B+D♯+B'), CH(['B2', 'D#3', 'A3'], e, '5 3 1', 'B+D♯+A'), CH(['B2', 'D#3', 'A3'], e, '5 3 1', 'B+D♯+A')],
    t21: [CH(['C3', 'G3'], e, '5 1', 'C+G'), CH(['C3', 'G3'], e, '5 1', 'C+G'), CH(['C3', 'G3'], e, '5 1', 'C+G'), CH(['C3', 'G3'], e, '5 1', 'C+G'), CH(['C3', 'Bb3'], e, '5 1', 'C+B♭'), CH(['C3', 'Bb3'], e, '5 1', 'C+B♭'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A'), CH(['C3', 'E3', 'A3'], e, '5 3 1', 'C+E+A')],
    t22: [CH(['B2', 'E3', 'A3'], e, '5 2 1', 'B+E+A'), CH(['B2', 'E3', 'A3'], e, '5 2 1', 'B+E+A'), CH(['B2', 'E3', 'G#3'], e, '5 2 1', 'B+E+G♯'), CH(['B2', 'E3', 'G#3'], e, '5 2 1', 'B+E+G♯'), CH(['B2', 'E3', 'G3'], e, '5 2 1', 'B+E+G'), CH(['B2', 'E3', 'G3'], e, '5 2 1', 'B+E+G'), CH(['B2', 'E3', 'G3'], e, '5 2 1', 'B+E+G'), CH(['B2', 'E3', 'G3'], e, '5 2 1', 'B+E+G')],
    t23: [CH(['Bb2', 'C3', 'G3'], h, '5 4 1', 'B♭+C+G'), R(h)],
    t24: [N('B2', h, 1), CH(['F#2', 'B2'], h, '5 1', 'F♯+B')],
    t25: [N('E2', w, 5)],
  },
  sections: [
    { id: 'chopin-1', title: 'Takt 1–8', tempo: 50, firstBar: 0, use: 'Opptakten og de første åtte taktene.', groups: [{ label: 'Largo', bars: span(0, 8) }] },
    { id: 'chopin-2', title: 'Takt 9–12', tempo: 50, firstBar: 9, use: 'Slutten av første halvdel.', groups: [{ label: 'Takt 9', bars: span(9, 12) }] },
    { id: 'chopin-3', title: 'Takt 13–18', tempo: 50, firstBar: 13, use: 'Andre halvdel og høydepunktet (stretto).', groups: [{ label: 'Takt 13', bars: span(13, 18) }] },
    { id: 'chopin-4', title: 'Takt 19–25', tempo: 50, firstBar: 19, use: 'Mot slutten, med de siste akkordene.', groups: [{ label: 'Takt 19', bars: span(19, 25) }] },
    { id: 'chopin-hele', title: 'Hele stykket', tempo: 55, firstBar: 0, groups: [{ label: 'Largo', bars: span(0, 12) }, { label: 'Takt 13', bars: span(13, 25) }] }
  ]
});
