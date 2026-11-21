import { CH, DY, N, R, dh, e, h, q, s16, w, type Song } from '../music/song';
import { M44, klassisk } from './klassisk';

// Orkesterverk. Melodiene er kontrollert mot partiturer uten opphavsrett (se assumptions.md, 2026-11-21).

// ---------- Mozart: Eine kleine Nachtmusik, første sats ----------

export const nachtmusik = klassisk({
  id: 'nachtmusik',
  title: 'Eine kleine Nachtmusik',
  by: 'Wolfgang Amadeus Mozart, første sats. De fire første taktene, med G-durakkorden fra takt 5 som slutt.',
  key: 'G',
  meter: M44,
  casio: { tone: 183, tip: 'Kort og spenstig.' },
  bars: {
    N1: [N('G5', q, 2), R(e), N('D5', e, 1), N('G5', q, 2), R(e), N('D5', e, 1)],
    N2: [N('G5', e, 2), N('D5', e, 1), N('G5', e, 2), N('B5', e, 3), N('D6', q, 5), R(q)],
    N3: [N('C6', q, 5), R(e), N('A5', e, 3), N('C6', q, 5), R(e), N('A5', e, 3)],
    N4: [N('C6', e, 5), N('A5', e, 3), N('F#5', e, 2), N('A5', e, 3), N('D5', q, 1), R(q)],
    N5: [CH(['B4', 'D5', 'G5'], h, '1 2 4', 'G-dur', 'G'), R(h)]
  },
  // Strykerne spiller åpningen unisont, så venstre hånd spiller melodien tre oktaver lavere
  lh: {
    N1: [N('G2', q, 3), R(e), N('D2', e, 5), N('G2', q, 3), R(e), N('D2', e, 5)],
    N2: [N('G2', e, 3), N('D2', e, 5), N('G2', e, 3), N('B2', e, 2), N('D3', q, 1), R(q)],
    N3: [N('C3', q, 1), R(e), N('A2', e, 2), N('C3', q, 1), R(e), N('A2', e, 2)],
    N4: [N('C3', e, 1), N('A2', e, 2), N('F#2', e, 3), N('A2', e, 2), N('D2', q, 5), R(q)],
    N5: [DY('G2', 'D3', h), R(h)]
  },
  sections: [{
    id: 'nachtmusik', title: 'Eine kleine Nachtmusik', tempo: 130, use: 'Elegant inngang, for eksempel når en deltaker presenteres.',
    groups: [{ label: 'Eine kleine Nachtmusik', bars: [['N1', 'N1'], ['N2', 'N2'], ['N3', 'N3'], ['N4', 'N4'], ['N5', 'N5']] }]
  }]
});

// ---------- Grieg: Morgenstemning (Peer Gynt), E-dur i originalen, her C-dur ----------

export const morgenstemning = klassisk({
  id: 'morgenstemning',
  title: 'Morgenstemning',
  by: 'Edvard Grieg, Peer Gynt. Fløytemelodien i de fire første taktene, flyttet fra E-dur til C-dur.',
  key: 'C',
  meter: { beats: 6, unit: 8 },
  casio: { reg: [6, 2], tone: 253, layer: 183, tip: 'Rolig og lyst. Melodien ligger under fem fingre: C, D, E, G og A.' },
  bars: {
    M1: [N('G5', e, 4), N('E5', e, 3), N('D5', e, 2), N('C5', e, 1), N('D5', e, 2), N('E5', e, 3)],
    M2: [N('G5', e, 4), N('E5', e, 3), N('D5', e, 2), N('C5', e, 1), N('D5', s16, 2), N('E5', s16, 3), N('D5', s16, 2), N('E5', s16, 3)],
    M3: [N('G5', e, 4), N('E5', e, 3), N('G5', e, 4), N('A5', e, 5), N('E5', e, 3), N('A5', e, 5)],
    M4: [N('G5', e, 4), N('E5', e, 3), N('D5', e, 2), N('C5', q, 1), R(e)]
  },
  lh: { C: [DY('C3', 'G3', dh)] },
  sections: [{
    id: 'morgenstemning', title: 'Morgenstemning', tempo: 90, use: 'Rolig intro, eller når en ny runde begynner.',
    groups: [{ label: 'Morgenstemning', bars: [['M1', 'C'], ['M2', 'C'], ['M3', 'C'], ['M4', 'C']] }]
  }]
});

// ---------- Strauss: Also sprach Zarathustra, åpningen ----------

export const zarathustra = klassisk({
  id: 'zarathustra',
  title: 'Also sprach Zarathustra',
  by: 'Richard Strauss, åpningen. Forenklet, med egen slutt på C-durakkorden.',
  key: 'C',
  meter: M44,
  casio: { reg: [5, 4], tone: 205, layer: 75, tip: 'Venstre hånd er orgelpunktet og paukene. Spill bredt.' },
  bars: {
    REST: [R(w)],
    Z2: [N('C4', h, 1), N('G4', h, 3)],
    Z3: [N('C5', w, 5)],
    Z4: [CH(['G4', 'C5', 'E5'], q, '1 2 4', 'C-dur', 'C'), CH(['G4', 'C5', 'Eb5'], dh, '1 2 4', 'C-moll', 'Cm')],
    Z6: [CH(['C4', 'E4', 'G4', 'C5'], w, '1 2 3 5', 'C-dur', 'C')]
  },
  lh: {
    PED: [DY('C2', 'C3', w)],
    Z4: [DY('C2', 'C3', q), DY('C2', 'C3', dh)],
    // Paukene spiller trioler i originalen. Trioler finnes ikke i appen.
    PK: [N('C3', e, 1), N('G2', e, 4), N('C3', e, 1), N('G2', e, 4), N('C3', e, 1), N('G2', e, 4), N('C3', e, 1), N('G2', e, 4)]
  },
  sections: [{
    id: 'zarathustra', title: 'Also sprach Zarathustra', tempo: 60, use: 'Den store avsløringen, eller når vinneren kåres.',
    groups: [{ label: 'Also sprach Zarathustra', bars: [['REST', 'PED'], ['Z2', 'PED'], ['Z3', 'PED'], ['Z4', 'Z4'], ['REST', 'PK'], ['Z6', 'PED']] }]
  }]
});

// ---------- Saint-Saëns: Danse macabre, valsetemaet ----------

const waltz = (bass: string, lo: string, hi: string, f = '3 1') => [N(bass, q, 5), DY(lo, hi, q, f), DY(lo, hi, q, f)];

export const danseMacabre = klassisk({
  id: 'danse-macabre',
  title: 'Danse macabre',
  by: 'Camille Saint-Saëns. Valsetemaet, med egen slutt på grunntonen. Venstre hånd er en enkel vals.',
  key: 'Gm',
  meter: { beats: 3, unit: 4 },
  casio: { tone: 253, lower: 192, tip: 'Fløyte i høyre hånd, pizzicato i venstre. Splittpunktet skal stå på F♯3.' },
  bars: {
    P: [R(h), N('D4', q, 1)],
    D1: [N('G4', h, 4), N('G4', q, 4)],
    D2: [N('F4', h, 3), N('F4', q, 3)],
    D3: [N('E4', h, 2), N('E4', q, 2)],
    D4: [N('Eb4', h, 2), N('Eb4', q, 2)],
    D5: [N('D4', q, 1), N('E4', q, 2), N('G4', q, 4)],
    D6: [N('F#4', q, 3), N('E4', q, 2), N('D4', q, 1)],
    D8: [N('F#4', h, 3), R(q)],
    D9: [N('G4', dh, 4)]
  },
  // Under F♯3, så venstre hånd havner på pizzicato når keyboardet er splittet
  lh: {
    GM: waltz('G2', 'Bb2', 'D3'),
    GF: waltz('F2', 'Bb2', 'D3'),
    CE: waltz('E2', 'G2', 'C3'),
    CEB: waltz('Eb2', 'G2', 'C3'),
    GD: waltz('D2', 'G2', 'Bb2', '2 1'),
    D7: waltz('D2', 'F#2', 'C3'),
    A: waltz('A2', 'C#3', 'E3', '2 1'),
    D: waltz('D2', 'F#2', 'A2', '2 1'),
    END: [DY('G2', 'D3', h), R(q)]
  },
  sections: [{
    id: 'danse-macabre', title: 'Danse macabre', tempo: 140, use: 'Skummelt, men med glimt i øyet. Halloween-spørsmål.',
    groups: [{ label: 'Danse macabre', bars: [
      ['P', null], ['D1', 'GM'], ['D2', 'GF'], ['D3', 'CE'], ['D4', 'CEB'], ['D5', 'GD'], ['D6', 'D7'], ['D3', 'A'], ['D8', 'D'], ['D9', 'END']
    ] }]
  }]
});

export const orkester: Song[] = [nachtmusik, morgenstemning, zarathustra, danseMacabre];
