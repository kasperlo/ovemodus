import { CH, DY, N, R, dh, e, ed, h, q, qd, s16, w, type Song } from '../music/song';

// Klassiske temaer der komponisten døde for mer enn 70 år siden. Forenklet: melodien i høyre hånd og enkle
// akkorder i venstre. Melodiene er kontrollert mot partiturer uten opphavsrett (se assumptions.md, 2026-11-21).

export const klassisk = (s: Omit<Song, 'category'>): Song => ({ category: 'klassisk', ...s });
/** Hele klaverstykker til å øve på, ikke gameshow-lyder. */
export const stykke = (s: Omit<Song, 'category'>): Song => ({ category: 'stykke', ...s });
export const M24 = { beats: 2, unit: 4 }, M44 = { beats: 4, unit: 4 };

// ---------- Rossini: Wilhelm Tell, finalen i ouverturen (E-dur i originalen, her C-dur) ----------

const G16 = () => N('G4', s16, 1);
const GALLOP = [N('G4', e, 1), G16(), G16(), N('G4', e, 1), G16(), G16()];
const OOM_C = [N('C3', e, 5), DY('E3', 'G3', e, '3 1'), N('C3', e, 5), DY('E3', 'G3', e, '3 1')];
const OOM_G = [N('G2', e, 5), DY('B2', 'D3', e, '3 1'), N('G2', e, 5), DY('B2', 'D3', e, '3 1')];

export const wilhelmTell = klassisk({
  id: 'wilhelm-tell',
  title: 'Wilhelm Tell',
  by: 'Gioachino Rossini, galoppen i ouverturen. Forenklet og flyttet fra E-dur til C-dur.',
  key: 'C',
  meter: M24,
  casio: { reg: [3, 1], tone: 224, layer: 183, tip: 'Øk tempoet for hver runde, som en nedtelling.' },
  bars: {
    P: [R(qd), G16(), G16()],
    GAL: GALLOP,
    UP: [N('C5', e, 2), N('D5', e, 3), N('E5', e, 4), G16(), G16()],
    T4: [N('G4', e, 1), G16(), G16(), N('C5', e, 2), N('E5', s16, 4), N('E5', s16, 4)],
    T5: [N('D5', e, 3), N('B4', e, 2), N('G4', e, 1), G16(), G16()],
    T7: [N('C5', e, 2), N('D5', e, 3), N('E5', e, 4), N('C5', s16, 2), N('E5', s16, 4)],
    // I originalen er toppnoten bundet over en sekstendedel. Her blir bindingen en pause.
    T8: [N('G5', q, 5), R(s16), N('F5', s16, 4), N('E5', s16, 3), N('D5', s16, 2)],
    END: [N('C5', q, 1), R(q)]
  },
  lh: {
    P: [R(h)],
    C: OOM_C,
    G: OOM_G,
    END: [DY('C3', 'G3', q), R(q)]
  },
  sections: [{
    id: 'tell', title: 'Wilhelm Tell', tempo: 120, use: 'Fart og nedtelling.',
    groups: [{ label: 'Wilhelm Tell – galopp', bars: [
      ['P', 'P'], ['GAL', 'C'], ['UP', 'C'], ['GAL', 'C'], ['T4', 'C'], ['T5', 'G'], ['GAL', 'C'], ['T7', 'C'], ['T8', 'G'], ['END', 'END']
    ] }]
  }]
});

// ---------- Offenbach: Can-can (Galop infernal fra Orfeus i underverdenen) ----------

const LG = [N('G2', q, 5), DY('B2', 'D3', q, '3 1')];
const LD = [N('D3', q, 5), DY('F#3', 'A3', q, '3 1')];

export const canCan = klassisk({
  id: 'can-can',
  title: 'Can-can',
  by: 'Jacques Offenbach, Orfeus i underverdenen. Forenklet.',
  key: 'G',
  meter: M24,
  casio: { reg: [3, 2], tone: 11, tip: 'Saloonpiano. Spill kort og spretent.' },
  bars: {
    P: [R(q), N('D4', q, 1)],
    C1: [N('G4', h, 1)],
    C2: [N('A4', e, 2), N('C5', e, 4), N('B4', e, 3), N('A4', e, 2)],
    C3: [N('D5', q, 5), N('D5', q, 5)],
    C4: [N('D5', e, 4), N('E5', e, 5), N('B4', e, 2), N('C5', e, 3)],
    C5: [N('A4', q, 1), N('A4', q, 1)],
    C6: [N('A4', e, 1), N('C5', e, 3), N('B4', e, 2), N('A4', e, 1)],
    C7: [N('G4', e, 1), N('G5', e, 5), N('F#5', e, 4), N('E5', e, 3)],
    C8: [N('D5', e, 2), N('C5', e, 1), N('B4', e, 3), N('A4', e, 2)],
    C15: [N('G4', e, 1), N('D5', e, 5), N('A4', e, 2), N('B4', e, 3)]
  },
  lh: {
    P: [R(h)],
    G: LG,
    D: LD,
    END: [DY('G2', 'D3', h)]
  },
  sections: [{
    id: 'cancan', title: 'Can-can', tempo: 120, use: 'Fart og fest.',
    groups: [{ label: 'Can-can', bars: [
      ['P', 'P'], ['C1', 'G'], ['C2', 'D'], ['C3', 'G'], ['C4', 'G'], ['C5', 'D'], ['C6', 'D'], ['C7', 'G'], ['C8', 'D'],
      ['C1', 'G'], ['C2', 'D'], ['C3', 'G'], ['C4', 'G'], ['C5', 'D'], ['C6', 'D'], ['C15', 'G'], ['C1', 'END']
    ] }]
  }]
});

// ---------- Saint-Saëns: Akvariet (Dyrenes karneval) ----------

export const akvariet = klassisk({
  id: 'akvariet',
  title: 'Akvariet',
  by: 'Camille Saint-Saëns, Dyrenes karneval. Melodien, med akkorder i stedet for de bølgende løpene.',
  key: 'Am',
  meter: M44,
  casio: { reg: [3, 3], tone: 253, layer: 534, lower: 202, tip: 'Fløyte og glass i høyre hånd, harpe i venstre.' },
  bars: {
    A1: [N('E5', q, 5), N('D#5', q, 4), N('E5', q, 5), N('D5', q, 4)],
    // I originalen holdes A-en en åttedel kortere, med pause til slutt
    A2: [N('E5', q, 5), N('A4', dh, 1)],
    A5: [N('E5', q, 3), N('D#5', q, 2), N('E5', q, 3), N('F5', q, 4)],
    A6: [N('D5', q, 3), N('C#5', q, 2), N('D5', q, 3), N('E5', q, 4)],
    A7: [N('C5', q, 2), N('B4', q, 1), N('C5', q, 2), N('D5', q, 3)],
    A8: [N('B4', w, 1)]
  },
  // Under F♯3, så venstre hånd havner på harpen når keyboardet er splittet
  lh: {
    L1: [DY('A2', 'E3', w)],
    L2: [DY('A2', 'E3', q), DY('D3', 'F3', dh, '3 1')],
    L5: [DY('A2', 'E3', dh), DY('F2', 'C3', q)],
    L6: [DY('G2', 'D3', w)],
    L8: [DY('E2', 'B2', w)]
  },
  sections: [{
    id: 'akvariet', title: 'Akvariet', tempo: 80, use: 'Mystikk, for eksempel før svaret avsløres.',
    groups: [{ label: 'Akvariet', bars: [['A1', 'L1'], ['A2', 'L2'], ['A1', 'L1'], ['A2', 'L2'], ['A5', 'L5'], ['A6', 'L6'], ['A7', 'L1'], ['A8', 'L8']] }]
  }]
});

// ---------- Dukas: Trollmannens læregutt (fagottemaet, en oktav opp) ----------

const FM = [N('F2', e, 5), R(e), DY('Ab2', 'C3', e, '3 1')];
const CC = [N('C2', e, 5), R(e), DY('E2', 'G2', e, '3 1')];

export const laerling = klassisk({
  id: 'laerling',
  title: 'Trollmannens læregutt',
  by: 'Paul Dukas. Fagottemaet, forenklet og en oktav opp.',
  key: 'Fm',
  meter: { beats: 3, unit: 8 },
  casio: { reg: [3, 4], tone: 241, lower: 192, tip: 'Fagotten klinger en oktav ned, akkurat som i originalen. Pizzicato i venstre hånd.' },
  bars: {
    L1: [N('F4', q, 1), R(e)],
    L2: [N('C5', q, 5), R(e)],
    L3: [N('C4', e, 1), N('D4', e, 2), N('E4', e, 3)],
    LA: [N('F4', e, 4), R(e), N('Ab4', e, 5)],
    LB: [N('F4', e, 2), R(e), N('Ab4', e, 4)],
    LG: [N('G4', e, 3), N('F4', e, 2), N('E4', e, 1)],
    L11: [N('F4', e, 2), N('Ab4', e, 4), N('G4', e, 3)],
    L12: [N('F4', e, 2), N('G4', e, 3), N('Ab4', e, 4)],
    L13: [N('G4', e, 3), N('Bb4', e, 5), N('Ab4', e, 4)],
    L14: [N('G4', e, 3), R(e), N('B4', e, 5)],
    L19: [N('G4', e, 3), N('Ab4', e, 4), N('Bb4', e, 5)],
    L20: [N('C5', e, 5), N('C5', e, 5), N('C5', e, 5)],
    // Egen slutt på grunntonen, så temaet kan brukes som en kort lyd
    L21: [N('F4', q, 1), R(e)]
  },
  lh: {
    F: FM,
    C: CC,
    END: [DY('F2', 'C3', q), R(e)]
  },
  sections: [{
    id: 'laerling', title: 'Trollmannens læregutt', tempo: 120, use: 'Når noe går galt, eller kaos i studio.',
    groups: [{ label: 'Trollmannens læregutt', bars: [
      ['L1', 'F'], ['L2', 'F'], ['L3', 'C'], ['LA', 'F'], ['LA', 'F'], ['LG', 'C'], ['LB', 'F'], ['LB', 'F'], ['LG', 'C'], ['LB', 'F'],
      ['L11', 'F'], ['L12', 'F'], ['L13', 'C'], ['L14', 'C'], ['LB', 'F'], ['L13', 'C'], ['L14', 'C'], ['LB', 'F'], ['L19', 'C'], ['L20', 'C'], ['L21', 'END']
    ] }]
  }]
});

// ---------- Dukas: Trolldom (klarinettmotivet fra den langsomme innledningen) ----------

export const trolldom = klassisk({
  id: 'trolldom',
  title: 'Trolldom',
  by: 'Paul Dukas, innledningen til Trollmannens læregutt. Forenklet.',
  key: 'Fm',
  meter: { beats: 9, unit: 8 },
  casio: { reg: [4, 1], tone: 340, layer: 49, tip: 'Spill sakte og svevende.' },
  bars: {
    T1: [N('Ab4', e, 3), R(q), R(qd), R(qd)],
    T2: [N('F4', qd, 1), N('C5', qd, 5), N('C4', e, 1), N('D4', e, 2), N('E4', e, 3)],
    T3: [N('F4', h, 4), R(q), R(qd)]
  },
  lh: {
    U1: [DY('F2', 'C3', qd), R(qd), R(qd)],
    U2: [DY('F2', 'C3', qd), R(qd), DY('C2', 'G2', qd)],
    U3: [DY('F2', 'C3', h), R(q), R(qd)]
  },
  sections: [{
    id: 'trolldom', title: 'Trolldom', tempo: 65, use: 'Joker med vri: noe magisk er i gjære.',
    groups: [{ label: 'Trolldom', bars: [['T1', 'U1'], ['T2', 'U2'], ['T3', 'U3']] }]
  }]
});

// ---------- Beethoven: Symfoni nr. 5, åpningen ----------

export const beethoven5 = klassisk({
  id: 'beethoven-5',
  title: 'Skjebnesymfonien',
  by: 'Ludwig van Beethoven, Symfoni nr. 5. De fire første taktene.',
  key: 'Cm',
  meter: M24,
  casio: { reg: [4, 2], tone: 183, layer: 205, tip: 'Hold fermatene så lenge du vil.' },
  bars: {
    B1: [R(e), N('G4', e, 4), N('G4', e, 4), N('G4', e, 4)],
    B2: [N('Eb4', h, 2, { fermata: true })],
    B3: [R(e), N('F4', e, 3), N('F4', e, 3), N('F4', e, 3)],
    // I originalen holdes D-en over to takter
    B4: [N('D4', h, 1, { fermata: true })]
  },
  lh: {
    K1: [R(e), N('G3', e, 1), N('G3', e, 1), N('G3', e, 1)],
    K2: [N('Eb3', h, 3, { fermata: true })],
    K3: [R(e), N('F3', e, 2), N('F3', e, 2), N('F3', e, 2)],
    K4: [N('D3', h, 4, { fermata: true })]
  },
  sections: [{
    id: 'beethoven5', title: 'Skjebnesymfonien', tempo: 160, use: 'Dramatisk feil svar.',
    groups: [{ label: 'Beethoven 5', bars: [['B1', 'K1'], ['B2', 'K2'], ['B3', 'K3'], ['B4', 'K4']] }]
  }]
});

// ---------- Chopin: Sørgemarsj (Pianosonate nr. 2), b-moll i originalen, her a-moll ----------

const MARCH_LH = [DY('A2', 'E3', q), DY('C3', 'F3', q, '3 1'), DY('A2', 'E3', q), DY('C3', 'F3', q, '3 1')];

export const sorgemarsj = klassisk({
  id: 'sorgemarsj',
  title: 'Sørgemarsj',
  by: 'Frédéric Chopin, Pianosonate nr. 2. De fire første taktene, flyttet fra b-moll til a-moll.',
  key: 'Am',
  meter: M44,
  casio: { reg: [4, 3], tone: 75, tip: 'Langsomt og høytidelig.' },
  bars: {
    S1: [N('A4', q, 1), N('A4', ed, 1), N('A4', s16, 1), N('A4', h, 1)],
    S3: [N('A4', q, 1), N('A4', ed, 1), N('A4', s16, 1), N('A4', q, 1), N('C5', ed, 3), N('B4', s16, 2)],
    S4: [N('B4', ed, 2), N('A4', s16, 1), N('A4', ed, 1), N('A4', s16, 1), N('A4', h, 1)]
  },
  lh: { M: MARCH_LH },
  sections: [{
    id: 'sorgemarsj', title: 'Sørgemarsj', tempo: 60, use: 'Når noen er ute av spillet.',
    groups: [{ label: 'Sørgemarsj', bars: [['S1', 'M'], ['S1', 'M'], ['S3', 'M'], ['S4', 'M']] }]
  }]
});

// ---------- Elgar: Pomp and Circumstance nr. 1, trioen (G-dur i originalen, her C-dur) ----------

const bass = (n: string, f: number) => [N(n, h, f)];

export const pomp = klassisk({
  id: 'pomp',
  title: 'Pomp and Circumstance',
  by: 'Edward Elgar, marsj nr. 1, trioen. Forenklet og flyttet fra G-dur til C-dur.',
  key: 'C',
  meter: M24,
  casio: { reg: [4, 4], tone: 183, layer: 230, tip: 'Bredt og høytidelig.' },
  bars: {
    P1: [N('C5', h, 4)],
    P2: [N('B4', e, 3), N('C5', e, 4), N('D5', q, 5)],
    P3: [N('A4', h, 2)],
    P4: [N('G4', h, 1)],
    P5: [N('F4', h, 3)],
    P6: [N('E4', e, 2), N('F4', e, 3), N('G4', q, 4)],
    P7: [N('D4', h, 1)],
    // I originalen holdes D-en videre. Her blir den en pause.
    REST: [R(h)],
    P9: [N('E4', h, 2)],
    P10: [N('F#4', e, 3), N('G4', q, 4), N('A4', e, 5)],
    P11: [N('D5', h, 5)],
    P12: [N('G4', h, 1)],
    P13: [N('C5', h, 4)],
    P14: [N('C5', e, 4), N('B4', q, 3), N('A4', e, 2)],
    P15: [N('G4', h, 1)],
    P16: [N('G4', q, 1), R(q)],
    // Egen slutt på grunnakkorden, der melodien ellers begynner på nytt
    P17: [CH(['C4', 'E4', 'G4', 'C5'], h, '1 2 3 5', 'C-dur', 'C')]
  },
  lh: {
    C3: bass('C3', 5), D3: bass('D3', 4), E3: bass('E3', 3), F3: bass('F3', 2), G3: bass('G3', 1), A3: bass('A3', 1),
    G3b: bass('G3', 2), B2: bass('B2', 5), E3b: bass('E3', 2), A2: bass('A2', 5), D3b: bass('D3', 2),
    END: [DY('C3', 'G3', h)]
  },
  sections: [{
    id: 'pomp', title: 'Pomp and Circumstance', tempo: 80, use: 'Når vinneren kåres, høytidelig.',
    groups: [{ label: 'Pomp and Circumstance', bars: [
      ['P1', 'C3'], ['P2', 'D3'], ['P3', 'E3'], ['P4', 'E3'], ['P5', 'F3'], ['P6', 'G3'], ['P7', 'A3'], ['REST', 'G3b'],
      ['P9', 'C3'], ['P10', 'C3'], ['P11', 'B2'], ['P12', 'E3b'], ['P13', 'A2'], ['P14', 'D3b'], ['P15', 'G3'], ['P16', 'G3'], ['P17', 'END']
    ] }]
  }]
});

// ---------- Händel: Halleluja (Messias) ----------

const HAL_LH = [DY('D3', 'A3', qd), DY('G2', 'D3', q), DY('D3', 'A3', e), R(q)];

export const halleluja = klassisk({
  id: 'halleluja',
  title: 'Halleluja',
  by: 'Georg Friedrich Händel, Messias. Sopranstemmen i de første «Halleluja».',
  key: 'D',
  meter: M44,
  casio: { reg: [5, 1], tone: 363, layer: 75, tip: 'Kor og orgel.' },
  bars: {
    H4: [N('D5', qd, 4), N('A4', e, 1), N('B4', e, 2), N('A4', e, 1), R(q)],
    H5: [N('D5', qd, 4), N('A4', e, 1), N('B4', e, 2), N('A4', e, 1), R(e), N('D5', s16, 4), N('D5', s16, 4)],
    H6: [N('D5', e, 4), N('D5', e, 4), R(e), N('D5', s16, 4), N('D5', s16, 4), N('D5', e, 4), N('D5', e, 4), R(e), N('D5', e, 4)],
    H7: [N('C#5', e, 3), N('D5', q, 4), N('C#5', e, 3), N('D5', q, 4), R(q)]
  },
  lh: {
    G4: HAL_LH,
    G6: [DY('D3', 'A3', h), DY('D3', 'A3', h)],
    G7: [DY('A2', 'E3', e), DY('D3', 'A3', q), DY('A2', 'E3', e), DY('D3', 'A3', q), R(q)]
  },
  sections: [{
    id: 'halleluja', title: 'Halleluja', tempo: 80, use: 'Jackpot, eller når noen vinner stort.',
    groups: [{ label: 'Halleluja', bars: [['H4', 'G4'], ['H5', 'G4'], ['H6', 'G6'], ['H7', 'G7']] }]
  }]
});

export const classical: Song[] = [wilhelmTell, canCan, laerling, trolldom, beethoven5, akvariet, sorgemarsj, pomp, halleluja];
