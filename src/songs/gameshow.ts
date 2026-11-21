import { CH, DY, N, R, dh, e, ed, h, q, qd, s16, w, type Song } from '../music/song';

// Egne gameshow-lyder, laget for appen. Korte, så de kan spilles live mellom spørsmålene.
// Variantene av samme lyd er deler i samme låt, så de deler toneart, taktart og registrering på keyboardet.

const C44 = { beats: 4, unit: 4 };
const egne = (s: Omit<Song, 'category' | 'by' | 'meter'> & { meter?: Song['meter'] }): Song =>
  ({ category: 'egne', by: 'Egen', meter: C44, ...s });

const C_MAJOR = (d: number) => CH(['C5', 'E5', 'G5', 'C6'], d, '1 2 3 5', 'C-dur', 'C');
const A_MINOR = (d: number) => CH(['A4', 'C5', 'E5', 'A5'], d, '1 2 3 5', 'A-moll', 'Am');

export const riktigSvar = egne({
  id: 'riktig-svar',
  title: 'Riktig svar',
  key: 'C',
  casio: { reg: [1, 2], tone: 224, layer: 205 },
  bars: {
    FAN: [N('C4', s16, 1), N('E4', s16, 2), N('G4', s16, 3), N('C5', s16, 5), CH(['C4', 'E4', 'G4', 'C5'], dh, '1 2 3 5', 'C-dur', 'C')],
    TD: [CH(['G4', 'B4', 'D5', 'F5'], e, '1 2 3 5', 'G7'), R(e), C_MAJOR(dh)],
    SG1: [N('C5', e, 1), N('C5', s16, 1), N('C5', s16, 1), N('E5', e, 3), N('C5', e, 1), N('G5', q, 5), N('E5', q, 3)],
    SG2: [N('D5', e, 2), N('E5', e, 3), N('F5', e, 4), N('D5', e, 2), CH(['C5', 'E5', 'G5'], h, '1 3 5', 'C-dur', 'C')],
    LA1: [N('C5', e, 1), N('E5', e, 2), N('G5', e, 3), N('E5', e, 2), N('C6', q, 5), N('G5', q, 3)],
    LA2: [N('A5', e, 5), N('G5', e, 4), N('F5', e, 3), N('D5', e, 1), C_MAJOR(h)]
  },
  lh: {
    FAN: [R(q), DY('C2', 'C3', dh)],
    TD: [DY('G2', 'D3', e), R(e), DY('C2', 'C3', dh)],
    C: [DY('C3', 'G3', w)],
    SG2: [DY('G2', 'D3', h), DY('C3', 'G3', h)],
    LA2: [DY('F2', 'C3', q), DY('G2', 'D3', q), DY('C2', 'C3', h)]
  },
  sections: [
    { id: 'riktig', title: 'Fanfare', tempo: 120, use: 'Når noen svarer riktig.', groups: [{ label: 'Riktig svar – fanfare', bars: [['FAN', 'FAN']] }] },
    { id: 'riktig-tada', title: 'Ta-da', tempo: 100, use: 'Kort og kontant: to akkorder.', groups: [{ label: 'Riktig svar – ta-da', bars: [['TD', 'TD']] }] },
    { id: 'riktig-signal', title: 'Signal', tempo: 110, use: 'Trompetsignal når noen er først med riktig svar.', groups: [{ label: 'Riktig svar – signal', bars: [['SG1', 'C'], ['SG2', 'SG2']] }] },
    { id: 'riktig-lang', title: 'Lang', tempo: 120, use: 'Når et vanskelig spørsmål blir besvart riktig.', groups: [{ label: 'Riktig svar – lang', bars: [['LA1', 'C'], ['LA2', 'LA2']] }] }
  ]
});

export const feilSvar = egne({
  id: 'feil-svar',
  title: 'Feil svar',
  key: 'C',
  casio: { reg: [1, 3], tone: 228, tip: 'Trekk pitch bend-hjulet sakte ned på siste tone for en ekte «wah».' },
  bars: {
    FE1: [R(q), N('G4', q, 4), N('F#4', q, 3), N('F4', q, 2)],
    FE2: [N('E4', w, 1)],
    WO: [N('D4', q, 2), R(q), N('C#4', h, 1)],
    SK: [CH(['E4', 'Bb4'], e, '1 4', 'E+B♭'), R(e), CH(['Eb4', 'A4'], e, '1 4', 'E♭+A'), R(e), CH(['D4', 'Ab4'], h, '1 4', 'D+A♭')],
    NT: [N('G4', q, 5), N('Eb4', q, 3), N('C4', h, 1)]
  },
  // Samme toner en oktav lavere gir en fyldigere trombone
  lh: {
    FE1: [R(q), N('G3', q, 1), N('F#3', q, 2), N('F3', q, 3)],
    FE2: [N('E3', w, 4)],
    WO: [N('D3', q, 1), R(q), N('C#3', h, 2)],
    SK: [N('E3', e, 1), R(e), N('Eb3', e, 2), R(e), N('D3', h, 3)],
    NT: [N('G3', q, 1), N('Eb3', q, 3), N('C3', h, 5)]
  },
  sections: [
    { id: 'feil', title: 'Trist trombone', tempo: 75, use: 'Når noen svarer feil.', groups: [{ label: 'Feil svar – sad trombone', bars: [['FE1', 'FE1'], ['FE2', 'FE2']] }] },
    { id: 'feil-womp', title: 'Womp womp', tempo: 90, use: 'Kort og tørt. Bøy den siste tonen ned med pitch bend.', groups: [{ label: 'Feil svar – womp womp', bars: [['WO', 'WO']] }] },
    { id: 'feil-skurr', title: 'Skurr', tempo: 100, use: 'Tre skurrende toner som sklir nedover.', groups: [{ label: 'Feil svar – skurr', bars: [['SK', 'SK']] }] },
    { id: 'feil-nedtur', title: 'Nedtur', tempo: 80, use: 'Når noen taper mange poeng.', groups: [{ label: 'Feil svar – nedtur', bars: [['NT', 'NT']] }] }
  ]
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
  casio: { reg: [1, 4], tone: 49, layer: 202, tip: 'Spill lett og raskt.' },
  bars: {
    J1: [...RUN_C, ...SPARKLE, R(q)],
    J2: [CMAJ7(dh), R(q)],
    TR: [N('C6', s16, 5), N('Bb5', s16, 4), N('Ab5', s16, 3), N('F#5', s16, 2), N('E5', s16, 1), N('D5', s16, 3), N('C5', s16, 2), N('Bb4', s16, 1), CMAJ7(h)],
    HA1: [R(h), N('C4', s16, 1), N('E4', s16, 2), N('G4', s16, 3), N('B4', s16, 4), N('C5', s16, 1), N('E5', s16, 2), N('G5', s16, 3), N('B5', s16, 4)],
    HA2: [N('D6', s16, 5), N('B5', s16, 4), N('G5', s16, 3), N('E5', s16, 2), CMAJ7(dh)],
    HE1: [CH(['C5', 'E5', 'G5'], h, '1 3 5', 'C-dur', 'C'), CH(['C5', 'Eb5', 'Ab5'], h, '1 2 5', 'A♭-dur', 'A♭')],
    HE2: [CH(['B4', 'E5', 'G#5'], h, '1 3 5', 'E-dur', 'E'), CMAJ7(h)]
  },
  lh: {
    J1: [DY('C3', 'G3', w)],
    J2: [DY('C2', 'C3', dh), R(q)],
    TR: [R(h), DY('C2', 'G2', h)],
    HA1: [N('C2', s16, 5), N('E2', s16, 4), N('G2', s16, 3), N('B2', s16, 2), N('C3', s16, 1), N('E3', s16, 3), N('G3', s16, 2), N('B3', s16, 1), R(h)],
    HA2: [R(q), DY('C2', 'G2', dh)],
    HE1: [DY('C3', 'G3', h), DY('Ab2', 'Eb3', h)],
    HE2: [DY('E2', 'B2', h), DY('C3', 'G3', h)]
  },
  sections: [
    { id: 'joker', title: 'Glitter', tempo: 120, use: 'Når noen bruker et jokerkort.', groups: [{ label: 'Joker', bars: [['J1', 'J1'], ['J2', 'J2']] }] },
    { id: 'joker-tryllestav', title: 'Tryllestav', tempo: 110, use: 'Glitter som drysser nedover.', groups: [{ label: 'Joker – tryllestav', bars: [['TR', 'TR']] }] },
    { id: 'joker-harpe', title: 'Harpe', tempo: 100, use: 'Som en harpe fra bunnen til toppen: venstre hånd begynner, høyre fortsetter.', groups: [{ label: 'Joker – harpe', bars: [['HA1', 'HA1'], ['HA2', 'HA2']] }] },
    { id: 'joker-hemmelig', title: 'Hemmelig', tempo: 70, use: 'Langsomt og magisk, når jokeren er en hemmelighet.', groups: [{ label: 'Joker – hemmelig', bars: [['HE1', 'HE1'], ['HE2', 'HE2']] }] }
  ]
});

const climb = (root: string, third: string, fifth: string, top: string) =>
  [N(root, s16, 1), N(third, s16, 2), N(fifth, s16, 3), N(top, s16, 5)];

export const bonus = egne({
  id: 'dobbel-poeng',
  title: 'Dobbel poeng',
  key: 'C',
  casio: { reg: [2, 1], tone: 50, layer: 202 },
  bars: {
    B1: [...RUN_G, ...RUN_C],
    B2: [...SPARKLE, CMAJ7(dh)],
    TG1: [N('C5', e, 1), N('E5', e, 2), N('G5', q, 3), N('C6', e, 1), N('E6', e, 2), N('G6', q, 3)],
    TG2: [CH(['C6', 'E6', 'G6', 'C7'], h, '1 2 3 5', 'C-dur', 'C'), R(h)],
    TT1: [...climb('C5', 'E5', 'G5', 'C6'), ...climb('D5', 'F5', 'A5', 'D6'), ...climb('E5', 'G5', 'B5', 'E6'), ...climb('F5', 'A5', 'C6', 'F6')],
    TT2: [...climb('G5', 'B5', 'D6', 'G6'), CH(['C6', 'E6', 'G6', 'C7'], dh, '1 2 3 5', 'C-dur', 'C')],
    JP1: [
      N('G5', s16, 2), N('C6', s16, 5), N('G5', s16, 2), N('C6', s16, 5), N('G5', s16, 2), N('C6', s16, 5), N('G5', s16, 2), N('C6', s16, 5),
      N('A5', s16, 3), N('C6', s16, 5), N('A5', s16, 3), N('C6', s16, 5), N('B5', s16, 3), N('D6', s16, 5), N('B5', s16, 3), N('D6', s16, 5)
    ],
    JP2: [CH(['C6', 'E6', 'G6', 'C7'], dh, '1 2 3 5', 'C-dur', 'C'), R(q)]
  },
  lh: {
    B1: [DY('G2', 'D3', h), DY('C3', 'G3', h)],
    B2: [R(q), DY('C2', 'C3', dh)],
    TG1: [DY('C3', 'G3', w)],
    TG2: [DY('C2', 'C3', h), R(h)],
    TT1: [N('C3', q, 5), N('D3', q, 4), N('E3', q, 3), N('F3', q, 2)],
    TT2: [N('G3', q, 1), DY('C3', 'G3', dh)],
    JP1: [DY('C3', 'G3', h), DY('F2', 'C3', q), DY('G2', 'D3', q)],
    JP2: [DY('C2', 'C3', dh), R(q)]
  },
  sections: [
    { id: 'bonus', title: 'Dobbelt glitter', tempo: 120, use: 'Ved dobbel poeng eller bonus. Jokerens glitter, to ganger.', groups: [{ label: 'Dobbel poeng', bars: [['B1', 'B1'], ['B2', 'B2']] }] },
    { id: 'bonus-to-ganger', title: 'To ganger', tempo: 110, use: 'Samme lille melodi to ganger, andre gang en oktav opp.', groups: [{ label: 'Dobbel poeng – to ganger', bars: [['TG1', 'TG1'], ['TG2', 'TG2']] }] },
    { id: 'bonus-trapp', title: 'Trappetrinn', tempo: 100, use: 'Et trinn opp for hvert poeng.', groups: [{ label: 'Dobbel poeng – trappetrinn', bars: [['TT1', 'TT1'], ['TT2', 'TT2']] }] },
    { id: 'bonus-jackpot', title: 'Jackpot', tempo: 110, use: 'Ringer som en spilleautomat. Når potten er stor.', groups: [{ label: 'Dobbel poeng – jackpot', bars: [['JP1', 'JP1'], ['JP2', 'JP2']] }] }
  ]
});

// Klokketikk som kryper oppover en halvtone per takt, over et hjerteslag i bassen.
const tick = (hi: string, lo: string, fh: number, fl: number) =>
  [N(hi, e, fh), N(lo, e, fl), N(hi, e, fh), N(lo, e, fl), N(hi, e, fh), N(lo, e, fl), N(hi, e, fh), N(lo, e, fl)];
const HEARTBEAT = [N('A2', e, 5), N('A2', e, 5), R(q), R(h)];
const twice = (n: string, f: number) => [N(n, e, f), N(n, e, f)];
const drum = (a: string, fa: number, b = a, fb = fa) => [N(a, q, fa), R(q), N(b, q, fb), R(q)];

export const spenning = egne({
  id: 'spenning',
  title: 'Spenning',
  key: 'Am',
  casio: { reg: [2, 2], tone: 192, lower: 592, tip: 'Med split blir venstre hånd pauker (F2–F3). Splittpunktet skal stå på F♯3.' },
  bars: {
    S1: tick('E5', 'D#5', 3, 2),
    S2: tick('F5', 'E5', 4, 3),
    S3: tick('F#5', 'F5', 4, 3),
    S4: tick('G5', 'F#5', 5, 4),
    KR1: [...twice('A4', 1), ...twice('Bb4', 2), ...twice('B4', 3), ...twice('C5', 4)],
    KR2: [...twice('C#5', 1), ...twice('D5', 2), ...twice('D#5', 3), ...twice('E5', 4)],
    TS1: [N('A4', q, 5), N('G#4', q, 4), N('G4', q, 3), N('F#4', q, 2)],
    TS2: [N('F4', q, 1), R(q), N('E4', q, 1), R(q)],
    TK1: [N('E5', e, 5), N('C5', e, 3), N('A4', e, 1), N('C5', e, 3), N('E5', q, 5), N('A4', q, 1)],
    TK2: [N('F5', e, 5), N('D5', e, 3), N('A4', e, 1), N('D5', e, 3), N('F5', q, 5), N('A4', q, 1)],
    TK3: [N('E5', e, 5), N('B4', e, 2), N('G#4', e, 1), N('B4', e, 2), N('E5', q, 5), N('G#4', q, 1)],
    TK4: [N('E5', e, 5), N('C5', e, 3), N('A4', e, 1), N('C5', e, 3), N('A4', h, 1)]
  },
  // Under F♯3, så venstre hånd blir pauker når keyboardet er splittet
  lh: {
    HB: HEARTBEAT,
    PA: drum('A2', 5),
    PE: drum('E3', 1),
    PAE: drum('A2', 5, 'E3', 1),
    PDA: drum('D3', 2, 'A2', 5),
    PEB: drum('E3', 1, 'B2', 4)
  },
  sections: [
    { id: 'spenning', title: 'Klokketikk', tempo: 105, use: 'Mens deltakerne tenker. Gjenta så lenge det trengs.', groups: [{ label: 'Spenning – tenketid', bars: [['S1', 'HB'], ['S2', 'HB'], ['S3', 'HB'], ['S4', 'HB']] }] },
    { id: 'spenning-krypende', title: 'Krypende', tempo: 100, use: 'Kryper oppover en halvtone om gangen. Gjenta så lenge det trengs.', groups: [{ label: 'Spenning – krypende', bars: [['KR1', 'PA'], ['KR2', 'PE']] }] },
    { id: 'spenning-trussel', title: 'Trussel', tempo: 80, use: 'Mørkt og truende, før svaret avsløres.', groups: [{ label: 'Spenning – trussel', bars: [['TS1', 'PA'], ['TS2', 'PE']] }] },
    { id: 'spenning-tenketid', title: 'Tenketid', tempo: 100, use: 'Roligere tenkemusikk som kan gå i ring.', groups: [{ label: 'Spenning – tenketid', bars: [['TK1', 'PAE'], ['TK2', 'PDA'], ['TK3', 'PEB'], ['TK4', 'PAE']] }] }
  ]
});

const tickTock = [N('E5', q, 5), N('A4', q, 1), N('E5', q, 5), N('A4', q, 1)];
const pulse = (n: string, f: number) => [N(n, q, f), N(n, q, f), N(n, q, f), N(n, q, f)];

export const nedtelling = egne({
  id: 'nedtelling',
  title: 'Nedtelling',
  key: 'Am',
  casio: {
    reg: [5, 3], tone: 50, lower: 592,
    tip: 'Ved tempo 60 er hvert slag ett sekund. Med split blir venstre hånd pauker. Gong til slutt: 598 CHINESE SET, tangent E5.'
  },
  bars: {
    T10: tickTock,
    T10E: [N('E5', q, 5), N('G#4', q, 1), A_MINOR(h)],
    F1: [N('A4', q, 1), N('B4', q, 2), N('C5', q, 3), N('D5', q, 4)],
    F2: [N('E5', q, 5), A_MINOR(dh)],
    T3: [N('E5', q, 5), N('D5', q, 4), N('C5', q, 3), A_MINOR(q)],
    SI1: [N('E5', q, 5), N('A4', q, 1), N('E5', e, 5), N('A4', e, 1), N('E5', e, 5), N('A4', e, 1)],
    SI2: [N('E5', s16, 5), N('A4', s16, 1), N('E5', s16, 5), N('A4', s16, 1), N('E5', s16, 5), N('A4', s16, 1), N('E5', s16, 5), N('A4', s16, 1), A_MINOR(h)]
  },
  lh: {
    P1: drum('A2', 5),
    P2: pulse('A2', 5),
    P3: [N('E3', q, 1), N('E3', q, 1), DY('A2', 'E3', h)],
    Q2: [N('E3', q, 1), DY('A2', 'E3', dh)],
    T3: [N('A2', q, 5), N('A2', q, 5), N('A2', q, 5), DY('A2', 'E3', q)],
    SI2: [N('E3', e, 1), N('E3', e, 1), N('E3', e, 1), N('E3', e, 1), DY('A2', 'E3', h)]
  },
  sections: [
    { id: 'nedtelling-10', title: 'Ti sekunder', tempo: 60, use: 'Ti slag og en sluttakkord. Ved tempo 60 tar det ti sekunder.', groups: [{ label: 'Nedtelling – ti sekunder', bars: [['T10', 'P1'], ['T10', 'P2'], ['T10E', 'P3']] }] },
    { id: 'nedtelling-5', title: 'Fem sekunder', tempo: 60, use: 'Fem toner som stiger, og en sluttakkord.', groups: [{ label: 'Nedtelling – fem sekunder', bars: [['F1', 'P2'], ['F2', 'Q2']] }] },
    { id: 'nedtelling-3', title: 'Tre, to, en', tempo: 60, use: 'Tre, to, en, nå! Før en runde starter.', groups: [{ label: 'Nedtelling – tre, to, en', bars: [['T3', 'T3']] }] },
    { id: 'nedtelling-siste', title: 'Siste sekunder', tempo: 60, use: 'Tikkingen går fortere og fortere.', groups: [{ label: 'Nedtelling – siste sekunder', bars: [['SI1', 'P2'], ['SI2', 'SI2']] }] }
  ]
});

const BUZZ = (d: number) => CH(['B4', 'F5'], d, '1 4', 'B+F');
const BUZZ_LH = (d: number) => DY('B2', 'F3', d, '5 2');
const SIREN = (d: number) => CH(['A4', 'D#5'], d, '1 4', 'A+D♯');
const SIREN_LH = (d: number) => DY('A2', 'D#3', d, '5 2');

export const tidenErUte = egne({
  id: 'tiden-er-ute',
  title: 'Tiden er ute',
  key: 'C',
  casio: { reg: [2, 3], tone: 213, tip: 'Ekte buzzer: velg 599 SFX SET 1 og trykk C5.' },
  bars: {
    T1: [BUZZ(e), R(e), BUZZ(e), R(e), BUZZ(q), R(q)],
    AL: [N('A4', e, 1), N('D#5', e, 4), N('A4', e, 1), N('D#5', e, 4), N('A4', e, 1), N('D#5', e, 4), SIREN(q)],
    SL: [CH(['E4', 'G4', 'C5'], q, '1 2 4', 'C-dur', 'C'), CH(['D4', 'F4', 'B4'], q, '1 2 4', 'G7'), CH(['C4', 'E4', 'G4', 'C5'], h, '1 2 3 5', 'C-dur', 'C')],
    FA: [N('C6', s16, 5), N('B5', s16, 4), N('A5', s16, 3), N('G5', s16, 2), N('F5', s16, 1), N('E5', s16, 3), N('D5', s16, 2), N('C5', s16, 1), CH(['C4', 'C5'], q, '1 5', 'C'), R(q)]
  },
  lh: {
    T1: [BUZZ_LH(e), R(e), BUZZ_LH(e), R(e), BUZZ_LH(q), R(q)],
    AL: [SIREN_LH(q), R(q), SIREN_LH(q), SIREN_LH(q)],
    SL: [N('C3', q, 1), N('G2', q, 4), DY('C2', 'C3', h)],
    FA: [R(h), DY('C2', 'C3', q), R(q)]
  },
  sections: [
    { id: 'tidute', title: 'Buzzer', tempo: 120, use: 'Når tiden er ute. Spill hardt.', groups: [{ label: 'Tiden er ute', bars: [['T1', 'T1']] }] },
    { id: 'tidute-alarm', title: 'Alarm', tempo: 120, use: 'Som en sirene.', groups: [{ label: 'Tiden er ute – alarm', bars: [['AL', 'AL']] }] },
    { id: 'tidute-slutt', title: 'Slutt', tempo: 90, use: 'Tre slag: nå er det slutt.', groups: [{ label: 'Tiden er ute – slutt', bars: [['SL', 'SL']] }] },
    { id: 'tidute-fall', title: 'Fall', tempo: 110, use: 'En skala som faller og lander hardt.', groups: [{ label: 'Tiden er ute – fall', bars: [['FA', 'FA']] }] }
  ]
});

export const intro = egne({
  id: 'intro',
  title: 'Intro',
  key: 'F',
  casio: { reg: [1, 1], tone: 205, tip: 'Sett reverb til Hall (MENU → SYS FX) før du lagrer registreringen.' },
  bars: {
    I1: [N('C5', e, 1), N('C5', e, 1), N('F5', q, 4), N('E5', e, 3), N('F5', e, 4), N('G5', q, 5)],
    I2: [N('G5', e, 5), N('F5', e, 4), N('E5', e, 3), N('F5', e, 4), N('D5', q, 2), N('C5', q, 1)],
    I3: [N('E5', e, 2), N('G5', e, 4), CH(['C5', 'F5', 'A5'], dh, '1 3 5', 'F-dur', 'F')],
    K1: [N('F4', e, 1), N('A4', e, 2), N('C5', e, 3), N('F5', e, 5), N('E5', q, 4), N('C5', q, 3)],
    K2: [N('D5', e, 3), N('E5', e, 4), CH(['A4', 'C5', 'F5'], dh, '1 2 5', 'F-dur', 'F')],
    M1: [N('C5', ed, 1), N('C5', s16, 1), N('F5', q, 3), N('A5', q, 5), N('F5', q, 3)],
    M2: [N('G5', ed, 4), N('F5', s16, 3), N('E5', e, 2), N('F5', e, 3), N('G5', h, 4)],
    M3: [N('A5', ed, 5), N('G5', s16, 4), N('F5', e, 3), N('E5', e, 2), N('D5', q, 1), N('G5', q, 4)],
    M4: [N('E5', ed, 2), N('F5', s16, 3), CH(['A4', 'C5', 'F5'], dh, '1 2 5', 'F-dur', 'F')]
  },
  lh: {
    I1: [DY('F2', 'C3', h), DY('F2', 'C3', h)],
    I2: [DY('C3', 'G3', h), DY('C3', 'G3', h)],
    I3: [R(q), DY('F2', 'F3', dh)],
    F: [DY('F2', 'C3', w)],
    END: [DY('C3', 'G3', q), DY('F2', 'F3', dh)],
    M3: [DY('F2', 'C3', h), DY('Bb2', 'F3', h)]
  },
  sections: [
    { id: 'intro', title: 'Kjenningsmelodi', tempo: 120, use: 'Kjenningsmelodi når showet starter.', groups: [{ label: 'Intro', bars: [['I1', 'I1'], ['I2', 'I2'], ['I3', 'I3']] }] },
    { id: 'intro-kort', title: 'Kort', tempo: 110, use: 'Kort fanfare før neste runde.', groups: [{ label: 'Intro – kort', bars: [['K1', 'F'], ['K2', 'END']] }] },
    { id: 'intro-marsj', title: 'Marsj', tempo: 110, use: 'Når deltakerne kommer inn.', groups: [{ label: 'Intro – marsj', bars: [['M1', 'F'], ['M2', 'I2'], ['M3', 'M3'], ['M4', 'END']] }] }
  ]
});

export const vinner = egne({
  id: 'vinner',
  title: 'Vinner',
  key: 'C',
  casio: { reg: [2, 4], tone: 205, layer: 183, tip: 'Reverb Hall gir mer pomp.' },
  bars: {
    V1: [N('C5', q, 2), N('G4', e, 1), N('C5', e, 2), N('E5', q, 3), N('C5', q, 2)],
    V2: [N('G5', qd, 5), N('F5', e, 4), N('E5', e, 3), N('D5', e, 2), N('E5', q, 3)],
    V3: [N('C5', e, 1), N('E5', e, 2), N('G5', e, 3), N('C6', e, 5), CH(['C5', 'E5', 'G5', 'C6'], h, '1 2 3 5', 'C-dur', 'C')],
    SR1: [N('G5', q, 3), N('E5', e, 1), N('G5', e, 3), N('C6', q, 5), N('G5', q, 3)],
    SR2: [N('A5', e, 5), N('G5', e, 4), N('F5', e, 3), N('E5', e, 2), N('D5', h, 1)],
    SR3: [N('G5', q, 3), N('E5', e, 1), N('G5', e, 3), N('C6', q, 5), N('A5', q, 4)],
    SR4: [N('G5', e, 5), N('E5', e, 3), N('D5', e, 2), N('E5', e, 3), C_MAJOR(h)],
    KR1: [
      CH(['E5', 'G5', 'C6'], q, '1 2 5', 'C-dur', 'C'), CH(['F5', 'A5', 'C6'], q, '1 3 5', 'F-dur', 'F'),
      CH(['D5', 'G5', 'B5'], q, '1 3 5', 'G-dur', 'G'), CH(['E5', 'G5', 'C6'], q, '1 2 5', 'C-dur', 'C')
    ],
    KR2: [CH(['E5', 'A5', 'C6'], q, '1 3 5', 'A-moll', 'Am'), CH(['D5', 'G5', 'B5'], q, '1 3 5', 'G-dur', 'G'), CH(['E5', 'G5', 'C6'], h, '1 2 5', 'C-dur', 'C')]
  },
  lh: {
    V1: [DY('C3', 'G3', w)],
    V2: [DY('G2', 'D3', h), DY('G2', 'D3', h)],
    V3: [R(h), DY('C2', 'C3', h)],
    SR2: [DY('F2', 'C3', h), DY('G2', 'D3', h)],
    SR3: [DY('C3', 'G3', h), DY('F2', 'C3', h)],
    SR4: [DY('G2', 'D3', h), DY('C2', 'C3', h)],
    KR1: [DY('C2', 'C3', q), DY('F2', 'F3', q), DY('G2', 'G3', q), DY('C2', 'C3', q)],
    KR2: [DY('A2', 'A3', q), DY('G2', 'G3', q), DY('C2', 'C3', h)]
  },
  sections: [
    { id: 'vinner', title: 'Finale', tempo: 110, use: 'Når vinneren kåres. En lengre fanfare.', groups: [{ label: 'Vinner – finale', bars: [['V1', 'V1'], ['V2', 'V2'], ['V3', 'V3']] }] },
    { id: 'vinner-seiersrunde', title: 'Seiersrunde', tempo: 120, use: 'Mens vinneren tar en seiersrunde.', groups: [{ label: 'Vinner – seiersrunde', bars: [['SR1', 'V1'], ['SR2', 'SR2'], ['SR3', 'SR3'], ['SR4', 'SR4']] }] },
    { id: 'vinner-kroning', title: 'Kroning', tempo: 70, use: 'Høytidelig, når vinneren får premien.', groups: [{ label: 'Vinner – kroning', bars: [['KR1', 'KR1'], ['KR2', 'KR2']] }] }
  ]
});

export const gameshow: Song[] = [intro, riktigSvar, feilSvar, joker, bonus, spenning, nedtelling, tidenErUte, vinner];
