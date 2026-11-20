import { CH, DY, N, R, dh, e, h, q, qd, s16, w, type Song } from '../music/song';

// Egne gameshow-lyder, laget for appen. Korte, så de kan spilles live mellom spørsmålene.

const C44 = { beats: 4, unit: 4 };
const egne = (s: Omit<Song, 'category' | 'by' | 'meter'> & { meter?: Song['meter'] }): Song =>
  ({ category: 'egne', by: 'Egen', meter: C44, ...s });

export const riktigSvar = egne({
  id: 'riktig-svar',
  title: 'Riktig svar',
  key: 'C',
  bars: { FAN: [N('C4', s16, 1), N('E4', s16, 2), N('G4', s16, 3), N('C5', s16, 5), CH(['C4', 'E4', 'G4', 'C5'], dh, '1 2 3 5', 'C-dur', 'C')] },
  lh: { FAN: [R(q), DY('C2', 'C3', dh)] },
  sections: [{ id: 'riktig', title: 'Riktig svar', tempo: 120, use: 'Når noen svarer riktig.', groups: [{ label: 'Riktig svar – fanfare', bars: [['FAN', 'FAN']] }] }]
});

export const feilSvar = egne({
  id: 'feil-svar',
  title: 'Feil svar',
  key: 'C',
  bars: {
    FE1: [R(q), N('G4', q, 4), N('F#4', q, 3), N('F4', q, 2)],
    FE2: [N('E4', w, 1)]
  },
  // Samme toner en oktav lavere gir en fyldigere trombone
  lh: {
    FE1: [R(q), N('G3', q, 1), N('F#3', q, 2), N('F3', q, 3)],
    FE2: [N('E3', w, 4)]
  },
  sections: [{ id: 'feil', title: 'Feil svar', tempo: 76, use: 'Når noen svarer feil.', groups: [{ label: 'Feil svar – sad trombone', bars: [['FE1', 'FE1'], ['FE2', 'FE2']] }] }]
});

// C-lydisk skala (med F♯) gir et magisk, svevende preg, og Cmaj7 til slutt skiller jokeren fra «riktig svar».
const RUN_C = [N('C5', s16, 1), N('D5', s16, 2), N('E5', s16, 3), N('F#5', s16, 1), N('G5', s16, 2), N('A5', s16, 3), N('B5', s16, 4), N('C6', s16, 5)];
const RUN_G = [N('G4', s16, 1), N('A4', s16, 2), N('B4', s16, 3), N('C#5', s16, 1), N('D5', s16, 2), N('E5', s16, 3), N('F#5', s16, 4), N('G5', s16, 5)];
const SPARKLE = [N('B5', s16, 4), N('C6', s16, 5), N('B5', s16, 4), N('C6', s16, 5)];
const CMAJ7 = (d: number) => CH(['C5', 'E5', 'G5', 'B5'], d, '1 2 3 5', 'Cmaj7');

export const joker = egne({
  id: 'joker',
  title: 'Joker',
  key: 'C',
  bars: {
    J1: [...RUN_C, ...SPARKLE, R(q)],
    J2: [CMAJ7(dh), R(q)]
  },
  lh: {
    J1: [DY('C3', 'G3', w)],
    J2: [DY('C2', 'C3', dh), R(q)]
  },
  sections: [{ id: 'joker', title: 'Joker', tempo: 120, use: 'Når noen bruker et jokerkort.', groups: [{ label: 'Joker', bars: [['J1', 'J1'], ['J2', 'J2']] }] }]
});

export const bonus = egne({
  id: 'dobbel-poeng',
  title: 'Dobbel poeng',
  key: 'C',
  bars: {
    B1: [...RUN_G, ...RUN_C],
    B2: [...SPARKLE, CMAJ7(dh)]
  },
  lh: {
    B1: [DY('G2', 'D3', h), DY('C3', 'G3', h)],
    B2: [R(q), DY('C2', 'C3', dh)]
  },
  sections: [{ id: 'bonus', title: 'Dobbel poeng', tempo: 120, use: 'Ved dobbel poeng eller bonus. Jokerens glitter, to ganger.', groups: [{ label: 'Dobbel poeng', bars: [['B1', 'B1'], ['B2', 'B2']] }] }]
});

// Klokketikk som kryper oppover en halvtone per takt, over et hjerteslag i bassen.
const tick = (hi: string, lo: string, fh: number, fl: number) =>
  [N(hi, e, fh), N(lo, e, fl), N(hi, e, fh), N(lo, e, fl), N(hi, e, fh), N(lo, e, fl), N(hi, e, fh), N(lo, e, fl)];
const HEARTBEAT = [N('A2', e, 5), N('A2', e, 5), R(q), R(h)];

export const spenning = egne({
  id: 'spenning',
  title: 'Spenning',
  key: 'Am',
  bars: {
    S1: tick('E5', 'D#5', 3, 2),
    S2: tick('F5', 'E5', 4, 3),
    S3: tick('F#5', 'F5', 4, 3),
    S4: tick('G5', 'F#5', 5, 4)
  },
  lh: { HB: HEARTBEAT },
  sections: [{ id: 'spenning', title: 'Spenning', tempo: 104, use: 'Mens deltakerne tenker. Gjenta så lenge det trengs.', groups: [{ label: 'Spenning – tenketid', bars: [['S1', 'HB'], ['S2', 'HB'], ['S3', 'HB'], ['S4', 'HB']] }] }]
});

const BUZZ = (d: number) => CH(['B4', 'F5'], d, '1 4', 'B+F');
const BUZZ_LH = (d: number) => DY('B2', 'F3', d, '5 2');

export const tidenErUte = egne({
  id: 'tiden-er-ute',
  title: 'Tiden er ute',
  key: 'C',
  bars: { T1: [BUZZ(e), R(e), BUZZ(e), R(e), BUZZ(q), R(q)] },
  lh: { T1: [BUZZ_LH(e), R(e), BUZZ_LH(e), R(e), BUZZ_LH(q), R(q)] },
  sections: [{ id: 'tidute', title: 'Tiden er ute', tempo: 120, use: 'Når tiden er ute. Spill hardt.', groups: [{ label: 'Tiden er ute', bars: [['T1', 'T1']] }] }]
});

export const intro = egne({
  id: 'intro',
  title: 'Intro',
  key: 'F',
  bars: {
    I1: [N('C5', e, 1), N('C5', e, 1), N('F5', q, 4), N('E5', e, 3), N('F5', e, 4), N('G5', q, 5)],
    I2: [N('G5', e, 5), N('F5', e, 4), N('E5', e, 3), N('F5', e, 4), N('D5', q, 2), N('C5', q, 1)],
    I3: [N('E5', e, 2), N('G5', e, 4), CH(['C5', 'F5', 'A5'], dh, '1 3 5', 'F-dur', 'F')]
  },
  lh: {
    I1: [DY('F2', 'C3', h), DY('F2', 'C3', h)],
    I2: [DY('C3', 'G3', h), DY('C3', 'G3', h)],
    I3: [R(q), DY('F2', 'F3', dh)]
  },
  sections: [{ id: 'intro', title: 'Intro', tempo: 120, use: 'Kjenningsmelodi når showet starter.', groups: [{ label: 'Intro', bars: [['I1', 'I1'], ['I2', 'I2'], ['I3', 'I3']] }] }]
});

export const vinner = egne({
  id: 'vinner',
  title: 'Vinner',
  key: 'C',
  bars: {
    V1: [N('C5', q, 2), N('G4', e, 1), N('C5', e, 2), N('E5', q, 3), N('C5', q, 2)],
    V2: [N('G5', qd, 5), N('F5', e, 4), N('E5', e, 3), N('D5', e, 2), N('E5', q, 3)],
    V3: [N('C5', e, 1), N('E5', e, 2), N('G5', e, 3), N('C6', e, 5), CH(['C5', 'E5', 'G5', 'C6'], h, '1 2 3 5', 'C-dur', 'C')]
  },
  lh: {
    V1: [DY('C3', 'G3', w)],
    V2: [DY('G2', 'D3', h), DY('G2', 'D3', h)],
    V3: [R(h), DY('C2', 'C3', h)]
  },
  sections: [{ id: 'vinner', title: 'Vinner', tempo: 112, use: 'Når vinneren kåres. En lengre fanfare.', groups: [{ label: 'Vinner – finale', bars: [['V1', 'V1'], ['V2', 'V2'], ['V3', 'V3']] }] }]
});

export const gameshow: Song[] = [intro, riktigSvar, feilSvar, joker, bonus, spenning, tidenErUte, vinner];
