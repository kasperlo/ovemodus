import { CH, DY, N, R, T3, dh, e, ed, h, q, qd, s16, s16d, s32, w, type Song } from '../music/song';
import { M24, M44, klassisk, stykke } from './klassisk';

// Klassiske verk skrevet for klaver og orgel. Melodiene er kontrollert mot partiturer uten opphavsrett
// (se assumptions.md, 2026-11-21).

// ---------- Beethoven: Für Elise ----------

const ELISE_A = [N('A2', s16, 5), N('E3', s16, 2), N('A3', s16, 1), R(ed)];
const ELISE_E = [N('E2', s16, 5), N('E3', s16, 2), N('G#3', s16, 1), R(ed)];

/**
 * Hele stykket takt for takt, med repetisjonene skrevet ut (126 takter, opptakten er takt 0). Hentet fra Mutopia
 * (Breitkopf & Härtel 1888) med et skript. Fingersettingen er et eget forslag. Se assumptions.md (2026-11-23).
 */
const ELISE: [string, string | null][] = [
  ['P', null], ['E1', null], ['E2', 'A'], ['E3', 'E'], ['E4', 'A'], ['E1', null],  // 0
  ['E2', 'A'], ['E7', 'E'], ['t8', 'A'], ['E1', null], ['E2', 'A'], ['E3', 'E'],  // 6
  ['E4', 'A'], ['E1', null], ['E2', 'A'], ['E7', 'E'], ['t16', 'A'], ['t17', 't17'],  // 12
  ['t18', 't18'], ['t19', 'A'], ['t20', 't20'], ['t21', 't21'], ['t22', 't22'], ['E1', null],  // 18
  ['E2', 'A'], ['E3', 'E'], ['E4', 'A'], ['E1', null], ['E2', 'A'], ['E7', 'E'],  // 24
  ['t16', 'A'], ['t17', 't17'], ['t18', 't18'], ['t19', 'A'], ['t20', 't20'], ['t21', 't21'],  // 30
  ['t22', 't22'], ['E1', null], ['E2', 'A'], ['E3', 'E'], ['E4', 'A'], ['E1', null],  // 36
  ['E2', 'A'], ['E7', 'E'], ['t44', 't44'], ['t45', 't45'], ['t46', 't46'], ['t47', 't47'],  // 42
  ['t48', 't45'], ['t49', 't45'], ['t50', 't50'], ['t51', 't51'], ['t52', 't52'], ['t53', 't53'],  // 48
  ['t52', 't54'], ['t53', 't53'], ['t56', 't56'], ['t57', null], ['t57', null], ['t59', null],  // 54
  ['E1', null], ['E2', 'A'], ['E3', 'E'], ['E4', 'A'], ['E1', null], ['E2', 'A'],  // 60
  ['E7', 'E'], ['t16', 'A'], ['t17', 't17'], ['t18', 't18'], ['t19', 'A'], ['t20', 't20'],  // 66
  ['t21', 't21'], ['t73', 't22'], ['E1', null], ['E2', 'A'], ['E3', 'E'], ['E4', 'A'],  // 72
  ['E1', null], ['E2', 'A'], ['E7', 'E'], ['t81', 't81'], ['t82', 't81'], ['t83', 't81'],  // 78
  ['t84', 't81'], ['t85', 't81'], ['t86', 't86'], ['t87', 't87'], ['t88', 't88'], ['t89', 't81'],  // 84
  ['t82', 't81'], ['t83', 't81'], ['t92', 't81'], ['t93', 't93'], ['t94', 't93'], ['t95', 't93'],  // 90
  ['t96', 't96'], ['t97', 't97'], ['t98', 't98'], ['t99', 't99'], ['t100', 't100'], ['t101', 't100'],  // 96
  ['t102', 't102'], ['t103', null], ['E1', null], ['E2', 'A'], ['E3', 'E'], ['E4', 'A'],  // 102
  ['E1', null], ['E2', 'A'], ['E7', 'E'], ['t16', 'A'], ['t17', 't17'], ['t18', 't18'],  // 108
  ['t19', 'A'], ['t20', 't20'], ['t21', 't21'], ['t73', 't22'], ['E1', null], ['E2', 'A'],  // 114
  ['E3', 'E'], ['E4', 'A'], ['E1', null], ['E2', 'A'], ['E7', 'E'], ['t81', 't125'],  // 120
];
const eliseBars = (from: number, to: number): [string, string | null][] => ELISE.slice(from, to + 1);

export const furElise = stykke({
  id: 'fur-elise',
  title: 'Für Elise',
  by: 'Ludwig van Beethoven, WoO 59. Hele stykket etter Breitkopf & Härtel (1888).',
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
    E8: [N('A4', q, 3), R(e)],
    t8: [N('A4', q, 3), N('E5', s16, 5), N('D#5', s16, 4)],
    t16: [N('A4', e, 1), R(s16), N('B4', s16, 2), N('C5', s16, 3), N('D5', s16, 4)],
    t17: [N('E5', ed, 5), N('G4', s16, 1), N('F5', s16, 5), N('E5', s16, 4)],
    t18: [N('D5', ed, 3), N('F4', s16, 1), N('E5', s16, 5), N('D5', s16, 4)],
    t19: [N('C5', ed, 3), N('E4', s16, 1), N('D5', s16, 5), N('C5', s16, 4)],
    t20: [N('B4', e, 3), R(s16), N('E4', s16, 1), N('E5', s16, 5), R(s16)],
    t21: [R(s16), N('E5', s16, 1), N('E6', s16, 5), R(s16), R(s16), N('D#5', s16, 4)],
    t22: [N('E5', e, 5), R(s16), N('D#5', s16, 4), N('E5', s16, 5), N('D#5', s16, 4)],
    t44: [N('A4', e, 3), R(s16), CH(['E4', 'C5'], s16, '1 5', 'E+C'), CH(['F4', 'C5'], s16, '2 5', 'F+C'), CH(['E4', 'G4', 'C5'], s16, '1 3 5', 'E+G+C')],
    t45: [N('C5', q, 2), N('F5', s16d, 5), N('E5', s32, 4)],
    t46: [N('E5', e, 3), N('D5', e, 2), N('Bb5', s16d, 5), N('A5', s32, 4)],
    t47: [N('A5', s16, 4), N('G5', s16, 3), N('F5', s16, 2), N('E5', s16, 1), N('D5', s16, 3), N('C5', s16, 2)],
    t48: [N('Bb4', e, 1), N('A4', e, 3), N('A4', s32, 2), N('G4', s32, 1), N('A4', s32, 2), N('Bb4', s32, 3)],
    t49: [N('C5', q, 4), N('D5', s16, 1), N('D#5', s16, 2)],
    t50: [N('E5', ed, 3), N('E5', s16, 3), N('F5', s16, 4), N('A4', s16, 1)],
    t51: [N('C5', q, 3), N('D5', s16d, 4), N('B4', s32, 2)],
    t52: [N('C5', s32, 1), N('G5', s32, 5), N('G4', s32, 1), N('G5', s32, 5), N('A4', s32, 1), N('G5', s32, 5), N('B4', s32, 2), N('G5', s32, 5), N('C5', s32, 1), N('G5', s32, 5), N('D5', s32, 2), N('G5', s32, 5)],
    t53: [N('E5', s32, 1), N('G5', s32, 2), N('C6', s32, 5), N('B5', s32, 4), N('A5', s32, 3), N('G5', s32, 2), N('F5', s32, 1), N('E5', s32, 3), N('D5', s32, 2), N('G5', s32, 5), N('F5', s32, 4), N('D5', s32, 2)],
    t56: [N('E5', s32, 3), N('F5', s32, 4), N('E5', s32, 3), N('D#5', s32, 2), N('E5', s32, 3), N('B4', s32, 1), N('E5', s32, 3), N('D#5', s32, 2), N('E5', s32, 3), N('B4', s32, 1), N('E5', s32, 3), N('D#5', s32, 2)],
    t57: [N('E5', ed, 5), N('B4', s16, 1), N('E5', s16, 5), N('D#5', s16, 4)],
    t59: [N('E5', s16, 5), N('D#5', s16, 4), N('E5', s16, 5), N('D#5', s16, 4), N('E5', s16, 5), N('D#5', s16, 4)],
    t73: [N('E5', s16, 5), R(s16), R(s16), N('D#5', s16, 4), N('E5', s16, 5), N('D#5', s16, 4)],
    t81: [N('A4', e, 3), R(e), R(e)],
    t82: [CH(['E4', 'G4', 'Bb4', 'C#5'], qd, '1 2 3 5', 'E+G+B♭+C♯')],
    t83: [CH(['F4', 'A4', 'D5'], q, '1 2 4', 'F+A+D'), CH(['C#5', 'E5'], s16, '2 4', 'C♯+E'), CH(['D5', 'F5'], s16, '3 5', 'D+F')],
    t84: [CH(['G#4', 'D5', 'F5'], q, '1 3 5', 'G♯+D+F'), CH(['G#4', 'D5', 'F5'], e, '1 3 5', 'G♯+D+F')],
    t85: [CH(['A4', 'C5', 'E5'], qd, '1 2 4', 'A+C+E')],
    t86: [CH(['F4', 'D5'], q, '1 5', 'F+D'), CH(['E4', 'C5'], s16, '1 4', 'E+C'), CH(['D4', 'B4'], s16, '1 4', 'D+B')],
    t87: [CH(['C4', 'F#4', 'A4'], q, '1 3 5', 'C+F♯+A'), CH(['C4', 'A4'], e, '1 4', 'C+A')],
    t88: [CH(['C4', 'A4'], e, '1 4', 'C+A'), CH(['E4', 'C5'], e, '2 5', 'E+C'), CH(['D4', 'B4'], e, '1 4', 'D+B')],
    t89: [CH(['C4', 'A4'], qd, '1 3', 'C+A')],
    t92: [CH(['D5', 'F5'], q, '3 5', 'D+F'), CH(['D5', 'F5'], e, '3 5', 'D+F')],
    t93: [CH(['D5', 'F5'], qd, '3 5', 'D+F')],
    t94: [CH(['G4', 'Eb5'], q, '1 5', 'G+E♭'), CH(['F4', 'D5'], s16, '1 4', 'F+D'), CH(['Eb4', 'C5'], s16, '1 4', 'E♭+C')],
    t95: [CH(['D4', 'F4', 'Bb4'], q, '1 2 5', 'D+F+B♭'), CH(['D4', 'F4', 'A4'], e, '1 2 4', 'D+F+A')],
    t96: [CH(['D4', 'F4', 'G#4'], q, '1 2 4', 'D+F+G♯'), CH(['D4', 'F4', 'G#4'], e, '1 2 4', 'D+F+G♯')],
    t97: [CH(['C4', 'E4', 'A4'], q, '1 2 4', 'C+E+A'), R(e)],
    t98: [CH(['E4', 'B4'], e, '1 5', 'E+B'), R(e), R(e)],
    t99: [...T3(N('A3', s16, 1), N('C4', s16, 2), N('E4', s16, 3)), ...T3(N('A4', s16, 1), N('C5', s16, 2), N('E5', s16, 5)), ...T3(N('D5', s16, 4), N('C5', s16, 3), N('B4', s16, 2))],
    t100: [...T3(N('A4', s16, 1), N('C5', s16, 2), N('E5', s16, 3)), ...T3(N('A5', s16, 1), N('C6', s16, 2), N('E6', s16, 5)), ...T3(N('D6', s16, 4), N('C6', s16, 3), N('B5', s16, 2))],
    t101: [...T3(N('A5', s16, 1), N('C6', s16, 2), N('E6', s16, 1)), ...T3(N('A6', s16, 3), N('C7', s16, 5), N('E6', s16, 1)), ...T3(N('D6', s16, 1), N('C7', s16, 5), N('B6', s16, 4))],
    t102: [...T3(N('Bb6', s16, 3), N('A6', s16, 1), N('G#6', s16, 3)), ...T3(N('G6', s16, 1), N('F#6', s16, 3), N('F6', s16, 2)), ...T3(N('E6', s16, 1), N('D#6', s16, 3), N('D6', s16, 1))],
    t103: [...T3(N('C#6', s16, 3), N('C6', s16, 2), N('B5', s16, 1)), ...T3(N('Bb5', s16, 3), N('A5', s16, 1), N('G#5', s16, 3)), ...T3(N('G5', s16, 1), N('F#5', s16, 3), N('F5', s16, 2))],
  },
  lh: {
    A: ELISE_A,
    E: ELISE_E,
    t17: [N('C3', s16, 5), N('G3', s16, 2), N('C4', s16, 1), R(s16), R(e)],
    t18: [N('G2', s16, 5), N('G3', s16, 2), N('B3', s16, 1), R(s16), R(e)],
    t20: [N('E2', s16, 5), N('E3', s16, 1), N('E4', s16, 1), R(s16), R(s16), N('E4', s16, 5)],
    t21: [N('E5', s16, 1), R(s16), R(s16), N('D#5', s16, 2), N('E5', s16, 1), R(s16)],
    t22: [R(s16), N('D#5', s16, 2), N('E5', s16, 1), R(s16), R(e)],
    t44: [N('A2', s16, 5), N('E3', s16, 2), N('A3', s16, 1), CH(['Bb3', 'C4'], s16, '2 1', 'B♭+C'), CH(['A3', 'C4'], s16, '3 1', 'A+C'), CH(['G3', 'Bb3', 'C4'], s16, '4 2 1', 'G+B♭+C')],
    t45: [N('F3', s16, 5), N('A3', s16, 3), N('C4', s16, 1), N('A3', s16, 3), N('C4', s16, 1), N('A3', s16, 3)],
    t46: [N('F3', s16, 5), N('Bb3', s16, 2), N('D4', s16, 1), N('Bb3', s16, 2), N('D4', s16, 1), N('Bb3', s16, 2)],
    t47: [N('F3', s16, 5), N('E4', s16, 1), CH(['F3', 'G3', 'Bb3'], s16, '5 3 2', 'F+G+B♭'), N('E4', s16, 1), CH(['F3', 'G3', 'Bb3'], s16, '5 3 2', 'F+G+B♭'), N('E4', s16, 1)],
    t50: [N('E3', s16, 5), N('A3', s16, 2), N('C4', s16, 1), N('A3', s16, 2), CH(['D3', 'D4'], s16, '5 1', 'D+D'), N('F3', s16, 4)],
    t51: [N('G3', s16, 3), N('E4', s16, 1), N('G3', s16, 3), N('E4', s16, 1), N('G3', s16, 3), N('F4', s16, 1)],
    t52: [CH(['C4', 'E4'], e, '5 3', 'C+E'), R(s16), CH(['F4', 'G4'], s16, '2 1', 'F+G'), CH(['E4', 'G4'], s16, '3 1', 'E+G'), CH(['D4', 'F4', 'G4'], s16, '4 2 1', 'D+F+G')],
    t53: [CH(['C4', 'E4', 'G4'], e, '5 3 1', 'C+E+G'), CH(['F3', 'A3'], e, '5 3', 'F+A'), CH(['G3', 'B3'], e, '4 2', 'G+B')],
    t54: [N('C4', e, 5), R(s16), CH(['F4', 'G4'], s16, '2 1', 'F+G'), CH(['E4', 'G4'], s16, '3 1', 'E+G'), CH(['D4', 'F4', 'G4'], s16, '4 2 1', 'D+F+G')],
    t56: [CH(['G#3', 'B3'], e, '2 1', 'G♯+B'), R(e), R(e)],
    t81: [N('A2', s16, 1), N('A2', s16, 1), N('A2', s16, 1), N('A2', s16, 1), N('A2', s16, 1), N('A2', s16, 1)],
    t86: [CH(['D2', 'A2'], s16, '5 1', 'D+A'), CH(['D2', 'A2'], s16, '5 1', 'D+A'), CH(['D2', 'A2'], s16, '5 1', 'D+A'), CH(['D2', 'A2'], s16, '5 1', 'D+A'), CH(['D2', 'A2'], s16, '5 1', 'D+A'), CH(['D2', 'A2'], s16, '5 1', 'D+A')],
    t87: [CH(['D#2', 'A2'], s16, '5 1', 'D♯+A'), CH(['D#2', 'A2'], s16, '5 1', 'D♯+A'), CH(['D#2', 'A2'], s16, '5 1', 'D♯+A'), CH(['D#2', 'A2'], s16, '5 1', 'D♯+A'), CH(['D#2', 'A2'], s16, '5 1', 'D♯+A'), CH(['D#2', 'A2'], s16, '5 1', 'D♯+A')],
    t88: [CH(['E2', 'A2'], s16, '5 1', 'E+A'), CH(['E2', 'A2'], s16, '5 1', 'E+A'), CH(['E2', 'A2'], s16, '5 1', 'E+A'), CH(['E2', 'A2'], s16, '5 1', 'E+A'), CH(['E2', 'G#2'], s16, '5 2', 'E+G♯'), CH(['E2', 'G#2'], s16, '5 2', 'E+G♯')],
    t93: [N('Bb2', s16, 2), N('Bb2', s16, 2), N('Bb2', s16, 2), N('Bb2', s16, 2), N('Bb2', s16, 2), N('Bb2', s16, 2)],
    t96: [N('B2', s16, 2), N('B2', s16, 2), N('B2', s16, 2), N('B2', s16, 2), N('B2', s16, 2), N('B2', s16, 2)],
    t97: [N('C3', q, 1), R(e)],
    t98: [CH(['E3', 'G#3'], e, '2 1', 'E+G♯'), R(e), R(e)],
    t99: [N('A2', e, 5), R(e), CH(['A3', 'C4', 'E4'], e, '5 3 1', 'A+C+E')],
    t100: [CH(['A3', 'C4', 'E4'], e, '5 3 1', 'A+C+E'), R(e), CH(['A3', 'C4', 'E4'], e, '5 3 1', 'A+C+E')],
    t102: [CH(['A3', 'C4', 'E4'], e, '5 3 1', 'A+C+E'), R(e), R(e)],
    t125: [N('A2', e, 5), R(e), R(e)],
  },
  sections: [
    {
      id: 'elise', title: 'Tema', tempo: 70, firstBar: 0, use: 'Rolig pause, eller når noen tenker lenge.',
      groups: [{ label: 'Für Elise', bars: [
        ['P', null], ['E1', null], ['E2', 'A'], ['E3', 'E'], ['E4', 'A'], ['E1', null], ['E2', 'A'], ['E7', 'E'], ['E8', 'A']
      ] }]
    },
    { id: 'elise-mellomspill', title: 'Mellomspill', tempo: 60, firstBar: 16, use: 'Fra slutten av temaet, gjennom C-dur og G-dur, og tilbake.', groups: [{ label: 'Mellomspill', bars: eliseBars(16, 23) }] },
    { id: 'elise-fdur', title: 'F-dur', tempo: 50, firstBar: 44, use: 'Inn i F-dur-delen. Venstre hånd går over midtre C.', groups: [{ label: 'F-dur', bars: eliseBars(44, 51) }] },
    { id: 'elise-32', title: '32-deler', tempo: 50, firstBar: 52, use: 'De raske figurene og veien tilbake til temaet. Ta dem sakte først.', groups: [{ label: '32-deler', bars: eliseBars(52, 60) }] },
    { id: 'elise-orgelpunkt', title: 'Orgelpunkt', tempo: 60, firstBar: 81, use: 'Akkorder i høyre hånd over A-en i bassen.', groups: [{ label: 'Orgelpunkt', bars: eliseBars(81, 89) }] },
    { id: 'elise-orgelpunkt2', title: 'Orgelpunkt 2', tempo: 60, firstBar: 90, use: 'Andre halvdel av akkordene, over B♭ og B i bassen.', groups: [{ label: 'Orgelpunkt 2', bars: eliseBars(90, 98) }] },
    { id: 'elise-arpeggio', title: 'Arpeggio', tempo: 50, firstBar: 98, use: 'Triolene opp og den kromatiske skalaen ned, tilbake til temaet.', groups: [{ label: 'Arpeggio', bars: eliseBars(98, 105) }] },
    {
      id: 'elise-hele', title: 'Hele stykket', tempo: 60, firstBar: 0, use: 'Med repetisjonene.',
      groups: [
        { label: 'Tema', bars: eliseBars(0, 15) },
        { label: 'Mellomspill', bars: eliseBars(16, 22) },
        { label: 'Tema', bars: eliseBars(23, 29) },
        { label: 'Mellomspill', bars: eliseBars(30, 36) },
        { label: 'Tema', bars: eliseBars(37, 43) },
        { label: 'F-dur', bars: eliseBars(44, 59) },
        { label: 'Tema', bars: eliseBars(60, 66) },
        { label: 'Mellomspill', bars: eliseBars(67, 73) },
        { label: 'Tema', bars: eliseBars(74, 80) },
        { label: 'Orgelpunkt', bars: eliseBars(81, 98) },
        { label: 'Arpeggio', bars: eliseBars(99, 103) },
        { label: 'Tema', bars: eliseBars(104, 110) },
        { label: 'Mellomspill', bars: eliseBars(111, 117) },
        { label: 'Tema', bars: eliseBars(118, 125) }
      ]
    }
  ]
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

// ---------- Satie: Gymnopédie nr. 1 ----------

export const gymnopedie = klassisk({
  id: 'gymnopedie',
  title: 'Gymnopédie nr. 1',
  by: 'Erik Satie. To takter innledning og den første frasen, med egen slutt på F♯.',
  key: 'D',
  meter: { beats: 3, unit: 4 },
  casio: { tone: 1, tip: 'Langsomt og stille.' },
  bars: {
    REST: [R(dh)],
    G5: [R(q), N('F#5', q, 3), N('A5', q, 5)],
    G6: [N('G5', q, 4), N('F#5', q, 3), N('C#5', q, 1)],
    G7: [N('B4', q, 1), N('C#5', q, 2), N('D5', q, 3)],
    G8: [N('A4', dh, 1)],
    G9: [N('F#4', dh, 1)]
  },
  // Akkordene står i diskanten i originalen. Her spiller venstre hånd dem en oktav lavere.
  lh: {
    G: [N('G2', q, 5), DY('D3', 'F#3', h, '2 1')],
    D: [N('D2', q, 5), DY('C#3', 'F#3', h, '2 1')]
  },
  sections: [{
    id: 'gymnopedie', title: 'Gymnopédie nr. 1', tempo: 70, use: 'Rolig pause, eller når noen tenker veldig lenge.',
    groups: [{ label: 'Gymnopédie', bars: [['REST', 'G'], ['REST', 'D'], ['G5', 'G'], ['G6', 'D'], ['G7', 'G'], ['G8', 'D'], ['G9', 'G']] }]
  }]
});

// ---------- Liszt: Ungarsk rapsodi nr. 2, friska (F♯-dur i originalen, her F-dur) ----------

const FRISKA_C = [DY('G2', 'G3', e), DY('C3', 'E3', e, '2 1'), DY('C2', 'C3', e), DY('C3', 'E3', e, '2 1')];
const FRISKA_F = [DY('F2', 'F3', e), DY('F3', 'A3', e, '2 1'), DY('C2', 'C3', e), DY('F3', 'A3', e, '2 1')];
const FRISKA_C7 = [DY('G2', 'G3', e), DY('Bb2', 'E3', e, '2 1'), DY('C2', 'C3', e), DY('Bb2', 'E3', e, '2 1')];

export const rapsodi = klassisk({
  id: 'ungarsk-rapsodi',
  title: 'Ungarsk rapsodi nr. 2',
  by: 'Franz Liszt, friskaen. Flyttet fra F♯-dur til F-dur. Høyre hånd spiller den nederste tonen i oktavene.',
  key: 'F',
  meter: M24,
  casio: { reg: [6, 4], tone: 1, tip: 'Start rolig og øk tempoet for hver runde.' },
  bars: {
    F1: [N('B4', e, 2), N('C5', e, 3), N('Bb4', ed, 1), N('C5', s16, 3)],
    F3: [N('B4', e, 2), N('C5', e, 3), N('A4', ed, 1), N('C5', s16, 3)],
    F5: [N('B4', e, 1), N('C5', e, 2), N('D5', ed, 3), N('C5', s16, 2)],
    F7: [N('B4', e, 1), N('C5', e, 2), N('F5', ed, 5), N('C5', s16, 2)],
    F8: [N('B4', e, 1), N('C5', e, 2), N('F5', q, 5)]
  },
  lh: {
    C: FRISKA_C,
    F: FRISKA_F,
    C7: FRISKA_C7,
    END: [DY('F2', 'F3', e), DY('F3', 'A3', e, '2 1'), DY('F2', 'C3', q)]
  },
  sections: [{
    id: 'rapsodi', title: 'Ungarsk rapsodi nr. 2', tempo: 140, use: 'Hurtigrunde, eller når alt går i kaos.',
    groups: [{ label: 'Ungarsk rapsodi nr. 2', bars: [
      ['F1', 'C'], ['F1', 'C'], ['F3', 'F'], ['F3', 'F'], ['F5', 'C7'], ['F5', 'C7'], ['F7', 'F'], ['F8', 'END']
    ] }]
  }]
});

/** Gameshow-lydene. Für Elise står for seg, blant klaverstykkene. */
export const klaver: Song[] = [rondoAllaTurca, entertainer, toccata, gymnopedie, rapsodi];
