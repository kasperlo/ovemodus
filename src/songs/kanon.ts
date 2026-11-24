import { CH, N, R, s32, s16, e, ed, q, qd, h, w, type Song } from '../music/song';
import { stykke } from './klassisk';

// ---------- Pachelbel: Kanon i D-dur ----------
// Eget arrangement av hele kanonen: første fiolin i høyre hånd og grunnbassen i venstre. Første fiolin spiller alle
// variasjonene etter tur, og fiolin II og III spiller det samme to og fire takter senere. Notene er transkribert fra
// Seiffert-utgaven (Kistner & Siegel 1929, Public Domain, IMSLP #83324) og sjekket tone for tone mot fiolin II og III
// i samme utgave. Fingersettingen er et eget forslag. Se assumptions.md (2026-11-24).

/** Hele kanonen takt for takt (57 takter). Første fiolin kommer inn i takt 3, som i originalen. */
const KANON: [string, string | null][] = [
  ['REST', 'lhA'], ['REST', 'lhB'], ['t2', 'lhA'], ['t3', 'lhB'], ['t4', 'lhA'], ['t5', 'lhB'],  // 0
  ['t6', 'lhA'], ['t7', 'lhB'], ['t8', 'lhA'], ['t9', 'lhB'], ['t10', 'lhA'], ['t11', 'lhB'],  // 6
  ['t12', 'lhA'], ['t13', 'lhB'], ['t14', 'lhA'], ['t15', 'lhB'], ['t16', 'lhA'], ['t17', 'lhB'],  // 12
  ['t18', 'lhA'], ['t19', 'lhB'], ['t20', 'lhA'], ['t21', 'lhB'], ['t22', 'lhA'], ['t23', 'lhB'],  // 18
  ['t24', 'lhA'], ['t25', 'lhB'], ['t26', 'lhA'], ['t27', 'lhB'], ['t28', 'lhA'], ['t29', 'lhB'],  // 24
  ['t30', 'lhA'], ['t31', 'lhB'], ['t32', 'lhA'], ['t33', 'lhB'], ['t34', 'lhA'], ['t35', 'lhB'],  // 30
  ['t36', 'lhA'], ['t37', 'lhB'], ['t38', 'lhA'], ['t39', 'lhB'], ['t40', 'lhA'], ['t41', 'lhB'],  // 36
  ['t42', 'lhA'], ['t43', 'lhB'], ['t44', 'lhA'], ['t45', 'lhB'], ['t46', 'lhA'], ['t47', 'lhB'],  // 42
  ['t48', 'lhA'], ['t49', 'lhB'], ['t50', 'lhA'], ['t51', 'lhB'], ['t52', 'lhA'], ['t53', 'lhB'],  // 48
  ['t54', 'lhA'], ['t55', 'lhB'], ['t56', 'tEnd'],  // 54
];
const span = (from: number, to: number): [string, string | null][] => KANON.slice(from, to + 1);

export const kanon: Song = stykke({
  id: 'kanon-d',
  title: 'Kanon i D-dur',
  by: 'Johann Pachelbel. Eget arrangement: første fiolin i høyre hånd og grunnbassen i venstre, etter Seiffert-utgaven. Sluttakkorden har tonene fra alle tre fiolinene.',
  key: 'D',
  meter: { beats: 4, unit: 4 },
  casio: { tone: 1, tip: 'Rolig og bundet. Grunnbassen går likt hele veien.' },
  bars: {
    REST: [R(w)],
    t2: [N('F#5', q, 3), N('E5', q, 2), N('D5', q, 1), N('C#5', q, 3)],
    t3: [N('B4', q, 2), N('A4', q, 1), N('B4', q, 2), N('C#5', q, 3)],
    t4: [N('D5', q, 4), N('C#5', q, 3), N('B4', q, 2), N('A4', q, 1)],
    t5: [N('G4', q, 3), N('F#4', q, 2), N('G4', q, 3), N('E4', q, 2)],
    t6: [N('D4', e, 1), N('F#4', e, 2), N('A4', e, 4), N('G4', e, 3), N('F#4', e, 2), N('D4', e, 1), N('F#4', e, 4), N('E4', e, 3)],
    t7: [N('D4', e, 2), N('B3', e, 1), N('D4', e, 2), N('A4', e, 5), N('G4', e, 3), N('B4', e, 5), N('A4', e, 4), N('G4', e, 3)],
    t8: [N('F#4', e, 2), N('D4', e, 1), N('E4', e, 2), N('C#5', e, 5), N('D5', e, 1), N('F#5', e, 3), N('A5', e, 5), N('A4', e, 1)],
    t9: [N('B4', e, 2), N('G4', e, 1), N('A4', e, 3), N('F#4', e, 2), N('D4', e, 1), N('D5', e, 5), N('D5', ed, 5, { trill: true }), N('C#5', s16, 4)],
    t10: [N('D5', s16, 5), N('C#5', s16, 4), N('D5', s16, 5), N('D4', s16, 1), N('C#4', s16, 2), N('A4', s16, 5), N('E4', s16, 2), N('F#4', s16, 3), N('D4', s16, 1), N('D5', s16, 5), N('C#5', s16, 4), N('B4', s16, 3), N('C#5', s16, 1), N('F#5', s16, 2), N('A5', s16, 4), N('B5', s16, 5)],
    t11: [N('G5', s16, 3), N('F#5', s16, 2), N('E5', s16, 1), N('G5', s16, 4), N('F#5', s16, 3), N('E5', s16, 2), N('D5', s16, 1), N('C#5', s16, 4), N('B4', s16, 3), N('A4', s16, 2), N('G4', s16, 1), N('F#4', s16, 3), N('E4', s16, 2), N('G4', s16, 4), N('F#4', s16, 3), N('E4', s16, 2)],
    t12: [N('D4', s16, 1), N('E4', s16, 2), N('F#4', s16, 3), N('G4', s16, 4), N('A4', s16, 5), N('E4', s16, 2), N('A4', s16, 5), N('G4', s16, 3), N('F#4', s16, 2), N('B4', s16, 5), N('A4', s16, 4), N('G4', s16, 3), N('A4', s16, 4), N('G4', s16, 3), N('F#4', s16, 2), N('E4', s16, 1)],
    t13: [N('D4', s16, 3), N('B3', s16, 1), N('B4', s16, 3), N('C#5', s16, 4), N('D5', s16, 5), N('C#5', s16, 4), N('B4', s16, 3), N('A4', s16, 2), N('G4', s16, 1), N('F#4', s16, 2), N('E4', s16, 1), N('B4', s16, 4), N('A4', s16, 3), N('B4', s16, 4), N('A4', s16, 3), N('G4', s16, 2)],
    t14: [N('F#4', e, 1), N('F#5', e, 4), N('E5', q, 3), R(e), N('D5', e, 1), N('F#5', q, 2)],
    t15: [N('B5', q, 4), N('A5', q, 2), N('B5', q, 3), N('C#6', q, 4)],
    t16: [N('D6', e, 5), N('D5', e, 1), N('C#5', q, 3), R(e), N('B4', e, 1), N('D5', q, 2)],
    t17: [N('D5', qd, 2), N('D5', e, 2), N('D5', e, 2), N('G5', e, 5), N('E5', e, 3), N('A5', e, 5)],
    t18: [N('A5', s16, 5), N('F#5', s32, 3), N('G5', s32, 4), N('A5', s16, 5), N('F#5', s32, 3), N('G5', s32, 4), N('A5', s32, 5), N('A4', s32, 1), N('B4', s32, 2), N('C#5', s32, 3), N('D5', s32, 1), N('E5', s32, 2), N('F#5', s32, 3), N('G5', s32, 4), N('F#5', s16, 3), N('D5', s32, 1), N('E5', s32, 3), N('F#5', s16, 4), N('F#4', s32, 1), N('G4', s32, 2), N('A4', s32, 3), N('B4', s32, 4), N('A4', s32, 3), N('G4', s32, 2), N('A4', s32, 3), N('F#4', s32, 2), N('G4', s32, 3), N('A4', s32, 4)],
    t19: [N('G4', s16, 3), N('B4', s32, 5), N('A4', s32, 4), N('G4', s16, 3), N('F#4', s32, 2), N('E4', s32, 1), N('F#4', s32, 3), N('E4', s32, 2), N('D4', s32, 1), N('E4', s32, 2), N('F#4', s32, 3), N('G4', s32, 1), N('A4', s32, 2), N('B4', s32, 3), N('G4', s16, 1), N('B4', s32, 2), N('A4', s32, 1), N('B4', s16, 2), N('C#5', s32, 3), N('D5', s32, 4), N('A4', s32, 1), N('B4', s32, 2), N('C#5', s32, 3), N('D5', s32, 1), N('E5', s32, 2), N('F#5', s32, 3), N('G5', s32, 4), N('A5', s32, 5)],
    t20: [N('F#5', s16, 3), N('D5', s32, 1), N('E5', s32, 2), N('F#5', s16, 3), N('E5', s32, 2), N('D5', s32, 1), N('E5', s32, 3), N('C#5', s32, 2), N('D5', s32, 3), N('E5', s32, 4), N('F#5', s32, 5), N('E5', s32, 4), N('D5', s32, 3), N('C#5', s32, 2), N('D5', s16, 3), N('B4', s32, 1), N('C#5', s32, 3), N('D5', s16, 4), N('D4', s32, 1), N('E4', s32, 2), N('F#4', s32, 3), N('G4', s32, 4), N('F#4', s32, 3), N('E4', s32, 1), N('F#4', s32, 2), N('D5', s32, 5), N('C#5', s32, 4), N('D5', s32, 5)],
    t21: [N('B4', s16, 3), N('D5', s32, 5), N('C#5', s32, 4), N('B4', s16, 3), N('A4', s32, 2), N('G4', s32, 1), N('A4', s32, 3), N('G4', s32, 2), N('F#4', s32, 1), N('G4', s32, 2), N('A4', s32, 3), N('B4', s32, 1), N('C#5', s32, 2), N('D5', s32, 3), N('B4', s16, 1), N('D5', s32, 3), N('C#5', s32, 2), N('D5', s16, 3), N('C#5', s32, 2), N('B4', s32, 1), N('C#5', s32, 2), N('D5', s32, 3), N('E5', s32, 4), N('D5', s32, 3), N('C#5', s32, 2), N('D5', s32, 3), N('B4', s32, 1), N('C#5', s32, 2)],
    t22: [N('D5', e, 3), R(e), N('C#5', e, 2), R(e), N('B4', e, 1), R(e), N('D5', e, 4), R(e)],
    t23: [N('D4', e, 1), R(e), N('D4', e, 1), R(e), N('D4', e, 1), R(e), N('E4', e, 2), R(e)],
    t24: [R(e), N('A4', e, 5), R(e), N('A4', e, 5), R(e), N('F#4', e, 3), R(e), N('A4', e, 5)],
    t25: [R(e), N('G4', e, 4), R(e), N('F#4', e, 3), R(e), N('G4', e, 1), R(e), N('E5', e, 4)],
    t26: [N('F#5', s16, 5), N('F#4', s16, 1), N('G4', s16, 3), N('F#4', s16, 2), N('E4', s16, 1), N('E5', s16, 4), N('F#5', s16, 5), N('E5', s16, 4), N('D5', s16, 3), N('F#4', s16, 1), N('D4', s16, 1), N('B4', s16, 5), N('A4', s16, 4), N('A3', s16, 1), N('G3', s16, 2), N('A3', s16, 3)],
    t27: [N('B3', s16, 1), N('B4', s16, 4), N('C#5', s16, 5), N('B4', s16, 4), N('A4', s16, 3), N('A3', s16, 1), N('G3', s16, 2), N('A3', s16, 3), N('B3', s16, 1), N('B4', s16, 4), N('A4', s16, 3), N('B4', s16, 4), N('C#5', s16, 5), N('C#4', s16, 1), N('B3', s16, 2), N('C#4', s16, 3)],
    t28: [N('D4', s16, 1), N('D5', s16, 4), N('E5', s16, 5), N('D5', s16, 4), N('C#5', s16, 3), N('C#4', s16, 1), N('D4', s16, 3), N('C#4', s16, 2), N('B3', s16, 1), N('B4', s16, 4), N('A4', s16, 3), N('B4', s16, 4), N('C#5', s16, 5), N('C#4', s16, 1), N('F#4', s16, 3), N('E4', s16, 2)],
    t29: [N('D4', s16, 1), N('D5', s16, 3), N('E5', s16, 4), N('G5', s16, 5), N('F#5', s16, 4), N('F#4', s16, 1), N('A4', s16, 2), N('F#5', s16, 5), N('D5', s16, 2), N('G5', s16, 5), N('F#5', s16, 4), N('G5', s16, 5), N('E5', s16, 3), N('A4', s16, 1), N('G4', s16, 3), N('A4', s16, 4)],
    t30: [N('F#4', s16, 2), N('A4', s16, 3), N('A4', s16, 3), N('A4', s16, 3), N('A4', s16, 3), N('A4', s16, 3), N('A4', s16, 3), N('A4', s16, 3), N('F#4', s16, 2), N('F#4', s16, 2), N('F#4', s16, 2), N('F#4', s16, 2), N('F#4', s16, 2), N('F#4', s16, 2), N('A4', s16, 3), N('A4', s16, 3)],
    t31: [N('G4', s16, 1), N('G4', s16, 1), N('G4', s16, 1), N('D5', s16, 3), N('D5', s16, 3), N('D5', s16, 3), N('D5', s16, 3), N('D5', s16, 3), N('D5', s16, 3), N('D5', s16, 3), N('B4', s16, 2), N('B4', s16, 2), N('A4', s16, 1), N('A4', s16, 1), N('E5', s16, 5), N('C#5', s16, 3)],
    t32: [N('A4', s16, 1), N('F#5', s16, 3), N('F#5', s16, 3), N('F#5', s16, 3), N('E5', s16, 2), N('E5', s16, 2), N('E5', s16, 2), N('E5', s16, 2), N('D5', s16, 1), N('D5', s16, 1), N('D5', s16, 1), N('D5', s16, 1), N('A5', s16, 2), N('A5', s16, 2), N('A5', s16, 2), N('A5', s16, 2)],
    t33: [N('B5', s16, 3), N('B5', s16, 3), N('B5', s16, 3), N('B5', s16, 3), N('A5', s16, 2), N('A5', s16, 2), N('A5', s16, 2), N('A5', s16, 2), N('B5', s16, 3), N('B5', s16, 3), N('B5', s16, 3), N('B5', s16, 3), N('C#6', s16, 4), N('C#5', s16, 1), N('C#5', s16, 4), N('C#5', s16, 4)],
    t34: [N('D5', e, 5), N('D4', s32, 1), N('E4', s32, 3), N('F#4', s32, 4), N('D4', s32, 2), N('C#4', e, 1), N('C#5', s32, 3), N('D5', s32, 4), N('E5', s32, 5), N('C#5', s32, 4), N('B4', e, 3), N('B3', s32, 1), N('C#4', s32, 2), N('D4', s32, 3), N('B3', s32, 1), N('C#4', e, 2), N('A4', s32, 5), N('G4', s32, 4), N('F#4', s32, 3), N('E4', s32, 2)],
    t35: [N('D4', e, 1), N('G4', s32, 3), N('F#4', s32, 2), N('E4', s32, 1), N('G4', s32, 3), N('F#4', e, 2), N('D4', s32, 1), N('E4', s32, 2), N('F#4', s32, 3), N('A4', s32, 5), N('G4', e, 3), N('B4', s32, 5), N('A4', s32, 4), N('G4', s32, 3), N('F#4', s32, 2), N('E4', e, 1), N('A4', s32, 4), N('G4', s32, 3), N('F#4', s32, 2), N('E4', s32, 1)],
    t36: [N('F#4', e, 2), N('D5', s32, 5), N('C#5', s32, 4), N('D5', s32, 5), N('F#4', s32, 1), N('A4', e, 2), N('A4', s32, 2), N('B4', s32, 3), N('C#5', s32, 4), N('A4', s32, 2), N('F#4', e, 1), N('D5', s32, 3), N('E5', s32, 4), N('F#5', s32, 5), N('D5', s32, 3), N('F#5', e, 5), N('F#5', s32, 5), N('E5', s32, 4), N('D5', s32, 3), N('C#5', s32, 2)],
    t37: [N('B4', e, 1), N('B4', s32, 2), N('A4', s32, 1), N('B4', s32, 2), N('C#5', s32, 3), N('D5', e, 1), N('F#5', s32, 3), N('E5', s32, 2), N('D5', s32, 1), N('F#5', s32, 2), N('G5', e, 3), N('D5', s32, 1), N('C#5', s32, 4), N('B4', s32, 3), N('B4', s32, 3), N('A4', s16, 2), N('E4', s16, 1), N('A4', s16, 3), N('A4', s16, 3)],
    t38: [N('A4', qd, 3), N('A4', e, 3), N('D4', qd, 1), N('A4', e, 3)],
    t39: [N('G4', q, 2), N('A4', q, 3), N('G4', e, 2), N('D4', e, 1), N('D4', ed, 4, { trill: true }), N('C#4', s16, 3)],
    t40: [N('D4', e, 1), N('D5', e, 5), N('C#5', q, 4), N('B4', q, 3), N('A4', q, 2)],
    t41: [N('D4', ed, 1), N('E4', s16, 2), N('F#4', q, 3), N('B4', q, 5), N('E4', ed, 2), N('E4', s16, 2)],
    t42: [N('F#4', ed, 1), N('F#5', s16, 4), N('F#5', s16, 4), N('G5', s16, 5), N('F#5', s16, 4), N('E5', s16, 3), N('D5', ed, 2), N('D5', s16, 2), N('D5', s16, 2), N('E5', s16, 4), N('D5', s16, 3), N('C#5', s16, 2)],
    t43: [N('B4', q, 1), N('D5', q, 3), N('D5', s16, 3), N('C5', s16, 2), N('B4', s16, 1), N('C5', s16, 2), N('A4', ed, 1), N('A4', s16, 1)],
    t44: [N('A4', ed, 1), N('A5', s16, 4), N('A5', s16, 4), N('B5', s16, 5), N('A5', s16, 4), N('G5', s16, 3), N('F#5', ed, 2), N('F#5', s16, 2), N('F#5', s16, 2), N('G5', s16, 3), N('F#5', s16, 2), N('E5', s16, 1)],
    t45: [N('D5', s16, 3), N('C5', s16, 2), N('B4', s16, 1), N('C5', s16, 2), N('A4', ed, 1), N('A4', s16, 2), N('G4', e, 1), N('D5', e, 5), N('C#5', ed, 4), N('C#5', s16, 4)],
    t46: [N('D5', e, 5), N('D5', q, 5), N('C#5', q, 4), N('B4', q, 3), N('A4', e, 2)],
    t47: [R(e), N('G4', q, 1), N('F#4', q, 3), R(s16), N('E4', s16, 2), N('E4', q, 2)],
    t48: [N('F#4', e, 1), N('F#5', q, 4), N('E5', e, 2), N('D5', e, 1), N('D6', q, 5), N('C6', e, 4)],
    t49: [N('B5', q, 3), N('D6', e, 5), N('A5', e, 2), N('B5', q, 3), N('A5', q, 2)],
    t50: [N('A5', q, 5), N('A4', ed, 1), N('G4', s16, 2), N('F#4', q, 1), N('F#5', ed, 5), N('E5', s16, 4)],
    t51: [N('D5', qd, 3), N('D5', e, 3), N('D5', q, 3), N('C#5', q, 2)],
    t52: [N('D5', e, 4), N('D4', e, 1), N('C#4', e, 1), N('C#5', e, 5), N('B4', e, 4), N('B3', e, 1), N('A3', e, 1), N('A4', e, 4)],
    t53: [N('G4', e, 1), N('G5', e, 5), N('F#5', e, 4), N('F#4', e, 1), N('E4', e, 2), N('B4', e, 5), N('E4', e, 1), N('E5', e, 4)],
    t54: [N('F#5', e, 5), N('F#4', e, 1), N('E4', e, 1), N('E5', e, 5), N('D5', e, 4), N('D4', e, 1), N('C#4', e, 1), N('C#5', e, 4)],
    t55: [N('B4', e, 1), N('B5', e, 5), N('A5', e, 4), N('A4', e, 1), N('G4', ed, 2), N('E5', s16, 5), N('A4', e, 1), N('A4', e, 1)],
    t56: [CH(['A4', 'D5', 'F#5'], q, '1 2 4', 'D-dur', 'D'), R(q), R(h)],
  },
  lh: {
    lhA: [N('D3', q, 1), N('A2', q, 3), N('B2', q, 2), N('F#2', q, 5)],
    lhB: [N('G2', q, 3), N('D2', q, 5), N('G2', q, 3), N('A2', q, 2)],
    tEnd: [N('D3', q, 1), R(q), R(h)],
  },
  sections: [
    { id: 'kanon-1', title: 'Takt 1–10', tempo: 55, use: 'Grunnbassen alene, så melodien i fjerdedeler og åttedeler, med trille i takt 10.', groups: [{ label: 'Kanon', bars: span(0, 9) }] },
    { id: 'kanon-2', title: 'Takt 11–18', tempo: 55, firstBar: 11, use: 'Sekstendeler, så fjerdedeler og åttedeler med pauser.', groups: [{ label: 'Takt 11', bars: span(10, 17) }] },
    { id: 'kanon-3', title: 'Takt 19–26', tempo: 55, firstBar: 19, use: 'Raske 32-deler, så korte åttedeler med pauser imellom.', groups: [{ label: 'Takt 19', bars: span(18, 25) }] },
    { id: 'kanon-4', title: 'Takt 27–34', tempo: 55, firstBar: 27, use: 'Sekstendeler med oktavsprang, så gjentatte toner.', groups: [{ label: 'Takt 27', bars: span(26, 33) }] },
    { id: 'kanon-5', title: 'Takt 35–42', tempo: 55, firstBar: 35, use: 'Åttedel og fire 32-deler, så roligere, med trille i takt 40.', groups: [{ label: 'Takt 35', bars: span(34, 41) }] },
    { id: 'kanon-6', title: 'Takt 43–50', tempo: 55, firstBar: 43, use: 'Punkterte rytmer og synkoper, opp til D6.', groups: [{ label: 'Takt 43', bars: span(42, 49) }] },
    { id: 'kanon-7', title: 'Takt 51–57', tempo: 55, firstBar: 51, use: 'Slutten, med sluttakkorden.', groups: [{ label: 'Takt 51', bars: span(50, 56) }] },
    { id: 'kanon-hele', title: 'Hele stykket', tempo: 55, groups: [{ label: 'Kanon', bars: span(0, 56) }] }
  ]
});
