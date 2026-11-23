import { CH, N, R, s16, e, w, type Song } from '../music/song';
import { stykke } from './klassisk';

// ---------- Bach: Preludium i C-dur, BWV 846 ----------
// Hentet fra Mutopia (wtk1-prelude1, Public Domain) med et skript og sjekket mot MIDI-filen derfra. Venstre hånd har
// to stemmer i originalen (bass og tenor). Her er de én stemme i anslagsrekkefølge: bassen en sekstendel, så tenoren
// holdt ut halvtakten. Fingersettingen er et eget forslag. Se assumptions.md (2026-11-23).

/** Hele stykket takt for takt (35 takter). */
const PRELUDIUM: [string, string | null][] = [
  ['t0', 't0'], ['t1', 't1'], ['t2', 't2'], ['t0', 't0'], ['t4', 't0'], ['t5', 't1'],  // 0
  ['t6', 't2'], ['t7', 't7'], ['t7', 't8'], ['t9', 't9'], ['t10', 't10'], ['t11', 't11'],  // 6
  ['t12', 't12'], ['t13', 't13'], ['t14', 't14'], ['t15', 't15'], ['t15', 't16'], ['t17', 't17'],  // 12
  ['t18', 't18'], ['t19', 't19'], ['t20', 't20'], ['t21', 't21'], ['t22', 't22'], ['t23', 't23'],  // 18
  ['t18', 't24'], ['t25', 't17'], ['t17', 't17'], ['t27', 't27'], ['t28', 't24'], ['t25', 't17'],  // 24
  ['t17', 't17'], ['t31', 't31'], ['t32', 't32'], ['t33', 't33'], ['t34', 't34'],  // 30
];
const span = (from: number, to: number): [string, string | null][] => PRELUDIUM.slice(from, to + 1);

export const preludiumC: Song = stykke({
  id: 'preludium-c',
  title: 'Preludium i C-dur',
  by: 'Johann Sebastian Bach, Das wohltemperierte Klavier I, BWV 846. Venstre hånds to stemmer er skrevet som én, i den rekkefølgen tonene slås an.',
  key: 'C',
  meter: { beats: 4, unit: 4 },
  casio: { tone: 1, tip: 'Jevne sekstendeler. Hold bassnoten så lenge du kan.' },
  bars: {
    t0: [R(e), N('G4', s16, 1), N('C5', s16, 3), N('E5', s16, 5), N('G4', s16, 1), N('C5', s16, 3), N('E5', s16, 5), R(e), N('G4', s16, 1), N('C5', s16, 3), N('E5', s16, 5), N('G4', s16, 1), N('C5', s16, 3), N('E5', s16, 5)],
    t1: [R(e), N('A4', s16, 1), N('D5', s16, 3), N('F5', s16, 5), N('A4', s16, 1), N('D5', s16, 3), N('F5', s16, 5), R(e), N('A4', s16, 1), N('D5', s16, 3), N('F5', s16, 5), N('A4', s16, 1), N('D5', s16, 3), N('F5', s16, 5)],
    t2: [R(e), N('G4', s16, 1), N('D5', s16, 3), N('F5', s16, 5), N('G4', s16, 1), N('D5', s16, 3), N('F5', s16, 5), R(e), N('G4', s16, 1), N('D5', s16, 3), N('F5', s16, 5), N('G4', s16, 1), N('D5', s16, 3), N('F5', s16, 5)],
    t4: [R(e), N('A4', s16, 1), N('E5', s16, 2), N('A5', s16, 5), N('A4', s16, 1), N('E5', s16, 2), N('A5', s16, 5), R(e), N('A4', s16, 1), N('E5', s16, 2), N('A5', s16, 5), N('A4', s16, 1), N('E5', s16, 2), N('A5', s16, 5)],
    t5: [R(e), N('F#4', s16, 1), N('A4', s16, 2), N('D5', s16, 5), N('F#4', s16, 1), N('A4', s16, 2), N('D5', s16, 5), R(e), N('F#4', s16, 1), N('A4', s16, 2), N('D5', s16, 5), N('F#4', s16, 1), N('A4', s16, 2), N('D5', s16, 5)],
    t6: [R(e), N('G4', s16, 1), N('D5', s16, 2), N('G5', s16, 5), N('G4', s16, 1), N('D5', s16, 2), N('G5', s16, 5), R(e), N('G4', s16, 1), N('D5', s16, 2), N('G5', s16, 5), N('G4', s16, 1), N('D5', s16, 2), N('G5', s16, 5)],
    t7: [R(e), N('E4', s16, 1), N('G4', s16, 2), N('C5', s16, 5), N('E4', s16, 1), N('G4', s16, 2), N('C5', s16, 5), R(e), N('E4', s16, 1), N('G4', s16, 2), N('C5', s16, 5), N('E4', s16, 1), N('G4', s16, 2), N('C5', s16, 5)],
    t9: [R(e), N('D4', s16, 1), N('F#4', s16, 2), N('C5', s16, 5), N('D4', s16, 1), N('F#4', s16, 2), N('C5', s16, 5), R(e), N('D4', s16, 1), N('F#4', s16, 2), N('C5', s16, 5), N('D4', s16, 1), N('F#4', s16, 2), N('C5', s16, 5)],
    t10: [R(e), N('D4', s16, 1), N('G4', s16, 3), N('B4', s16, 5), N('D4', s16, 1), N('G4', s16, 3), N('B4', s16, 5), R(e), N('D4', s16, 1), N('G4', s16, 3), N('B4', s16, 5), N('D4', s16, 1), N('G4', s16, 3), N('B4', s16, 5)],
    t11: [R(e), N('E4', s16, 1), N('G4', s16, 2), N('C#5', s16, 5), N('E4', s16, 1), N('G4', s16, 2), N('C#5', s16, 5), R(e), N('E4', s16, 1), N('G4', s16, 2), N('C#5', s16, 5), N('E4', s16, 1), N('G4', s16, 2), N('C#5', s16, 5)],
    t12: [R(e), N('D4', s16, 1), N('A4', s16, 2), N('D5', s16, 5), N('D4', s16, 1), N('A4', s16, 2), N('D5', s16, 5), R(e), N('D4', s16, 1), N('A4', s16, 2), N('D5', s16, 5), N('D4', s16, 1), N('A4', s16, 2), N('D5', s16, 5)],
    t13: [R(e), N('D4', s16, 1), N('F4', s16, 2), N('B4', s16, 5), N('D4', s16, 1), N('F4', s16, 2), N('B4', s16, 5), R(e), N('D4', s16, 1), N('F4', s16, 2), N('B4', s16, 5), N('D4', s16, 1), N('F4', s16, 2), N('B4', s16, 5)],
    t14: [R(e), N('C4', s16, 1), N('G4', s16, 2), N('C5', s16, 5), N('C4', s16, 1), N('G4', s16, 2), N('C5', s16, 5), R(e), N('C4', s16, 1), N('G4', s16, 2), N('C5', s16, 5), N('C4', s16, 1), N('G4', s16, 2), N('C5', s16, 5)],
    t15: [R(e), N('A3', s16, 1), N('C4', s16, 2), N('F4', s16, 5), N('A3', s16, 1), N('C4', s16, 2), N('F4', s16, 5), R(e), N('A3', s16, 1), N('C4', s16, 2), N('F4', s16, 5), N('A3', s16, 1), N('C4', s16, 2), N('F4', s16, 5)],
    t17: [R(e), N('G3', s16, 1), N('B3', s16, 2), N('F4', s16, 5), N('G3', s16, 1), N('B3', s16, 2), N('F4', s16, 5), R(e), N('G3', s16, 1), N('B3', s16, 2), N('F4', s16, 5), N('G3', s16, 1), N('B3', s16, 2), N('F4', s16, 5)],
    t18: [R(e), N('G3', s16, 1), N('C4', s16, 3), N('E4', s16, 5), N('G3', s16, 1), N('C4', s16, 3), N('E4', s16, 5), R(e), N('G3', s16, 1), N('C4', s16, 3), N('E4', s16, 5), N('G3', s16, 1), N('C4', s16, 3), N('E4', s16, 5)],
    t19: [R(e), N('Bb3', s16, 2), N('C4', s16, 3), N('E4', s16, 5), N('Bb3', s16, 2), N('C4', s16, 3), N('E4', s16, 5), R(e), N('Bb3', s16, 2), N('C4', s16, 3), N('E4', s16, 5), N('Bb3', s16, 2), N('C4', s16, 3), N('E4', s16, 5)],
    t20: [R(e), N('A3', s16, 1), N('C4', s16, 3), N('E4', s16, 5), N('A3', s16, 1), N('C4', s16, 3), N('E4', s16, 5), R(e), N('A3', s16, 1), N('C4', s16, 3), N('E4', s16, 5), N('A3', s16, 1), N('C4', s16, 3), N('E4', s16, 5)],
    t21: [R(e), N('A3', s16, 1), N('C4', s16, 2), N('Eb4', s16, 4), N('A3', s16, 1), N('C4', s16, 2), N('Eb4', s16, 4), R(e), N('A3', s16, 1), N('C4', s16, 2), N('Eb4', s16, 4), N('A3', s16, 1), N('C4', s16, 2), N('Eb4', s16, 4)],
    t22: [R(e), N('B3', s16, 1), N('C4', s16, 2), N('D4', s16, 3), N('B3', s16, 1), N('C4', s16, 2), N('D4', s16, 3), R(e), N('B3', s16, 1), N('C4', s16, 2), N('D4', s16, 3), N('B3', s16, 1), N('C4', s16, 2), N('D4', s16, 3)],
    t23: [R(e), N('G3', s16, 1), N('B3', s16, 3), N('D4', s16, 5), N('G3', s16, 1), N('B3', s16, 3), N('D4', s16, 5), R(e), N('G3', s16, 1), N('B3', s16, 3), N('D4', s16, 5), N('G3', s16, 1), N('B3', s16, 3), N('D4', s16, 5)],
    t25: [R(e), N('G3', s16, 1), N('C4', s16, 2), N('F4', s16, 5), N('G3', s16, 1), N('C4', s16, 2), N('F4', s16, 5), R(e), N('G3', s16, 1), N('C4', s16, 2), N('F4', s16, 5), N('G3', s16, 1), N('C4', s16, 2), N('F4', s16, 5)],
    t27: [R(e), N('A3', s16, 1), N('C4', s16, 2), N('F#4', s16, 5), N('A3', s16, 1), N('C4', s16, 2), N('F#4', s16, 5), R(e), N('A3', s16, 1), N('C4', s16, 2), N('F#4', s16, 5), N('A3', s16, 1), N('C4', s16, 2), N('F#4', s16, 5)],
    t28: [R(e), N('G3', s16, 1), N('C4', s16, 2), N('G4', s16, 5), N('G3', s16, 1), N('C4', s16, 2), N('G4', s16, 5), R(e), N('G3', s16, 1), N('C4', s16, 2), N('G4', s16, 5), N('G3', s16, 1), N('C4', s16, 2), N('G4', s16, 5)],
    t31: [R(e), N('G3', s16, 1), N('Bb3', s16, 2), N('E4', s16, 5), N('G3', s16, 1), N('Bb3', s16, 2), N('E4', s16, 5), R(e), N('G3', s16, 1), N('Bb3', s16, 2), N('E4', s16, 5), N('G3', s16, 1), N('Bb3', s16, 2), N('E4', s16, 5)],
    t32: [R(e), N('F3', s16, 1), N('A3', s16, 2), N('C4', s16, 3), N('F4', s16, 5), N('C4', s16, 2), N('A3', s16, 1), N('C4', s16, 3), N('A3', s16, 2), N('F3', s16, 1), N('A3', s16, 4), N('F3', s16, 2), N('D3', s16, 1), N('F3', s16, 2), N('D3', s16, 1)],
    t33: [R(e), N('G4', s16, 1), N('B4', s16, 2), N('D5', s16, 3), N('F5', s16, 5), N('D5', s16, 3), N('B4', s16, 1), N('D5', s16, 3), N('B4', s16, 2), N('G4', s16, 1), N('B4', s16, 4), N('D4', s16, 1), N('F4', s16, 3), N('E4', s16, 2), N('D4', s16, 1)],
    t34: [CH(['E4', 'G4', 'C5'], w, '1 2 5', 'E+G+C')],
  },
  lh: {
    t0: [N('C4', s16, 2), N('E4', 3.5, 1), N('C4', s16, 2), N('E4', 3.5, 1)],
    t1: [N('C4', s16, 2), N('D4', 3.5, 1), N('C4', s16, 2), N('D4', 3.5, 1)],
    t2: [N('B3', s16, 2), N('D4', 3.5, 1), N('B3', s16, 2), N('D4', 3.5, 1)],
    t7: [N('B3', s16, 2), N('C4', 3.5, 1), N('B3', s16, 2), N('C4', 3.5, 1)],
    t8: [N('A3', s16, 2), N('C4', 3.5, 1), N('A3', s16, 2), N('C4', 3.5, 1)],
    t9: [N('D3', s16, 5), N('A3', 3.5, 1), N('D3', s16, 5), N('A3', 3.5, 1)],
    t10: [N('G3', s16, 2), N('B3', 3.5, 1), N('G3', s16, 2), N('B3', 3.5, 1)],
    t11: [N('G3', s16, 4), N('Bb3', 3.5, 2), N('G3', s16, 4), N('Bb3', 3.5, 2)],
    t12: [N('F3', s16, 4), N('A3', 3.5, 2), N('F3', s16, 4), N('A3', 3.5, 2)],
    t13: [N('F3', s16, 4), N('Ab3', 3.5, 2), N('F3', s16, 4), N('Ab3', 3.5, 2)],
    t14: [N('E3', s16, 4), N('G3', 3.5, 2), N('E3', s16, 4), N('G3', 3.5, 2)],
    t15: [N('E3', s16, 2), N('F3', 3.5, 1), N('E3', s16, 2), N('F3', 3.5, 1)],
    t16: [N('D3', s16, 2), N('F3', 3.5, 1), N('D3', s16, 2), N('F3', 3.5, 1)],
    t17: [N('G2', s16, 5), N('D3', 3.5, 1), N('G2', s16, 5), N('D3', 3.5, 1)],
    t18: [N('C3', s16, 2), N('E3', 3.5, 1), N('C3', s16, 2), N('E3', 3.5, 1)],
    t19: [N('C3', s16, 3), N('G3', 3.5, 1), N('C3', s16, 3), N('G3', 3.5, 1)],
    t20: [N('F2', s16, 5), N('F3', 3.5, 1), N('F2', s16, 5), N('F3', 3.5, 1)],
    t21: [N('F#2', s16, 4), N('C3', 3.5, 1), N('F#2', s16, 4), N('C3', 3.5, 1)],
    t22: [N('Ab2', s16, 4), N('F3', 3.5, 1), N('Ab2', s16, 4), N('F3', 3.5, 1)],
    t23: [N('G2', s16, 5), N('F3', 3.5, 1), N('G2', s16, 5), N('F3', 3.5, 1)],
    t24: [N('G2', s16, 5), N('E3', 3.5, 1), N('G2', s16, 5), N('E3', 3.5, 1)],
    t27: [N('G2', s16, 5), N('Eb3', 3.5, 1), N('G2', s16, 5), N('Eb3', 3.5, 1)],
    t31: [N('C2', s16, 5), N('C3', 3.5, 1), N('C2', s16, 5), N('C3', 3.5, 1)],
    t32: [N('C2', s16, 5), N('C3', 7.5, 1)],
    t33: [N('C2', s16, 5), N('B2', 7.5, 1)],
    t34: [CH(['C2', 'C3'], w, '5 1', 'C+C')],
  },
  sections: [
    { id: 'preludium-1', title: 'Takt 1–8', tempo: 50, use: 'C-dur, og ut til G-dur.', groups: [{ label: 'Takt 1', bars: span(0, 7) }] },
    { id: 'preludium-2', title: 'Takt 9–16', tempo: 50, firstBar: 9, use: 'Gjennom a-moll og G-dur.', groups: [{ label: 'Takt 9', bars: span(8, 15) }] },
    { id: 'preludium-3', title: 'Takt 17–23', tempo: 50, firstBar: 17, use: 'Ned mot F-dur og de kromatiske akkordene.', groups: [{ label: 'Takt 17', bars: span(16, 22) }] },
    { id: 'preludium-4', title: 'Takt 24–31', tempo: 50, firstBar: 24, use: 'Orgelpunkt på G i bassen.', groups: [{ label: 'Takt 24', bars: span(23, 30) }] },
    { id: 'preludium-5', title: 'Takt 32–35', tempo: 50, firstBar: 32, use: 'Orgelpunkt på C og slutten.', groups: [{ label: 'Takt 32', bars: span(31, 34) }] },
    { id: 'preludium-hele', title: 'Hele stykket', tempo: 60, groups: [{ label: 'Preludium', bars: span(0, 34) }] }
  ]
});
