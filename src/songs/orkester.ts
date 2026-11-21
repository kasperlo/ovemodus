import { CH, DY, N, R, dh, e, h, q, qd, s16, w, type Song } from '../music/song';
import { M24, M44, klassisk } from './klassisk';

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

// ---------- Charpentier: Te Deum, forspillet (Eurovision-melodien) ----------

export const teDeum = klassisk({
  id: 'te-deum',
  title: 'Te Deum (Eurovision)',
  by: 'Marc-Antoine Charpentier, Te Deum, forspillet. Kjent som Eurovision-melodien. Trillene er sløyfet.',
  key: 'D',
  meter: { beats: 2, unit: 2 },
  casio: { reg: [7, 1], tone: 224, layer: 75, tip: 'Trompet og orgel. Reverb Hall.' },
  bars: {
    P: [R(h), R(q), N('A4', q, 1)],
    T1: [N('D5', q, 2), N('D5', e, 2), N('E5', e, 3), N('F#5', q, 4), N('D5', q, 2)],
    T2: [N('A5', h, 5), N('F#5', qd, 3), N('F#5', e, 3)],
    T3: [N('G5', q, 4), N('A5', e, 5), N('G5', e, 4), N('F#5', e, 3), N('G5', e, 4), N('A5', q, 5)],
    T4: [N('E5', e, 2), N('D5', e, 1), N('E5', e, 2), N('F#5', e, 3), N('E5', q, 2), N('A4', q, 1)],
    T7: [N('G5', e, 4), N('A5', e, 5), N('F#5', e, 3), N('G5', e, 4), N('E5', qd, 2), N('D5', e, 1)],
    T8: [N('D5', dh, 1), R(q)]
  },
  lh: {
    P: [R(h), R(q), N('D3', q, 1)],
    L1: [N('D3', h, 1), N('D3', q, 1), N('D3', q, 1)],
    L2: [N('C#3', q, 2), N('A2', q, 4), N('D3', qd, 1), N('D3', e, 1)],
    L3: [N('G2', q, 5), N('G2', q, 5), N('D3', e, 4), N('E3', e, 3), N('F#3', e, 2), N('G3', e, 1)],
    L4: [N('A3', h, 1), N('A3', e, 1), N('G3', e, 2), N('F#3', e, 3), N('E3', e, 4)],
    L7: [N('G3', q, 2), N('D3', q, 5), N('A3', q, 1), N('A2', q, 5)],
    L8: [N('D3', dh, 1), R(q)]
  },
  sections: [{
    id: 'te-deum', title: 'Te Deum (Eurovision)', tempo: 130, use: 'Intro: kjenningsmelodien fra Eurovision.',
    groups: [{ label: 'Te Deum', bars: [
      ['P', 'P'], ['T1', 'L1'], ['T2', 'L2'], ['T3', 'L3'], ['T4', 'L4'], ['T1', 'L1'], ['T2', 'L2'], ['T7', 'L7'], ['T8', 'L8']
    ] }]
  }]
});

// ---------- Beethoven: Ode til gleden (Symfoni nr. 9), D-dur i originalen, her C-dur ----------

const ODE_C = [DY('C3', 'G3', w)], ODE_G = [DY('G2', 'D3', w)];

export const odeTilGleden = klassisk({
  id: 'ode-til-gleden',
  title: 'Ode til gleden',
  by: 'Ludwig van Beethoven, Symfoni nr. 9. Melodien, flyttet til C-dur. Venstre hånd er en enkel harmonisering.',
  key: 'C',
  meter: M44,
  casio: { reg: [7, 4], tone: 363, layer: 183, tip: 'Kor og strykere.' },
  bars: {
    O1: [N('E5', q, 3), N('E5', q, 3), N('F5', q, 4), N('G5', q, 5)],
    O2: [N('G5', q, 5), N('F5', q, 4), N('E5', q, 3), N('D5', q, 2)],
    O3: [N('C5', q, 1), N('C5', q, 1), N('D5', q, 2), N('E5', q, 3)],
    O4: [N('E5', qd, 3), N('D5', e, 2), N('D5', h, 2)],
    O8: [N('D5', qd, 2), N('C5', e, 1), N('C5', h, 1)],
    O9: [N('D5', q, 2), N('D5', q, 2), N('E5', q, 3), N('C5', q, 1)],
    O10: [N('D5', q, 2), N('E5', e, 3), N('F5', e, 4), N('E5', q, 3), N('C5', q, 1)],
    O11: [N('D5', q, 2), N('E5', e, 3), N('F5', e, 4), N('E5', q, 3), N('D5', q, 2)],
    O12: [N('C5', q, 2), N('D5', q, 3), N('G4', q, 1), N('E5', q, 4)],
    // I originalen er E-en bundet over taktstreken. Her blir bindingen en pause.
    O13: [R(q), N('E5', q, 3), N('F5', q, 4), N('G5', q, 5)]
  },
  lh: {
    C: ODE_C,
    G: ODE_G,
    GC: [DY('G2', 'D3', q), DY('C3', 'G3', dh)],
    GHC: [DY('G2', 'D3', h), DY('C3', 'G3', h)],
    GG: [DY('G2', 'D3', h), DY('G2', 'F3', h)],
    CG: [DY('C3', 'G3', h), DY('G2', 'D3', h)]
  },
  sections: [{
    id: 'ode', title: 'Ode til gleden', tempo: 110, use: 'Feiring, eller når alle har svart riktig.',
    groups: [{ label: 'Ode til gleden', bars: [
      ['O1', 'C'], ['O2', 'G'], ['O3', 'C'], ['O4', 'G'], ['O1', 'C'], ['O2', 'G'], ['O3', 'C'], ['O8', 'GC'],
      ['O9', 'GHC'], ['O10', 'GHC'], ['O11', 'GG'], ['O12', 'CG'], ['O13', 'C'], ['O2', 'G'], ['O3', 'C'], ['O8', 'GC']
    ] }]
  }]
});

// ---------- Haydn: Symfoni nr. 94 «Paukeslaget», andre sats ----------

export const paukeslaget = klassisk({
  id: 'paukeslaget',
  title: 'Paukeslaget',
  by: 'Joseph Haydn, Symfoni nr. 94, andre sats. Melodien en oktav opp, med overraskelsesakkorden til slutt.',
  key: 'C',
  meter: M24,
  casio: { tone: 183, tip: 'Spill svakt hele veien, og den siste akkorden så hardt du kan.' },
  bars: {
    H1: [N('C5', e, 1), N('C5', e, 1), N('E5', e, 3), N('E5', e, 3)],
    H2: [N('G5', e, 5), N('G5', e, 5), N('E5', q, 3)],
    H3: [N('F5', e, 4), N('F5', e, 4), N('D5', e, 2), N('D5', e, 2)],
    H4: [N('B4', e, 2), N('B4', e, 2), N('G4', q, 1)],
    H7: [N('C6', e, 5), N('C6', e, 5), N('F#5', e, 1), N('F#5', e, 1)],
    H8: [N('G5', q, 2), N('G4', e, 1), R(e)],
    H16: [N('G5', e, 5), R(e), CH(['G4', 'B4', 'D5', 'G5'], q, '1 2 3 5', 'G-dur', 'G')]
  },
  lh: {
    C: [DY('C3', 'G3', h)],
    G7: [DY('G2', 'F3', h)],
    D7: [DY('C3', 'F#3', h, '5 2')],
    GB: [DY('B2', 'D3', q, '3 1'), R(q)],
    BANG: [N('G2', e, 5), R(e), DY('G2', 'G3', q)]
  },
  sections: [{
    id: 'paukeslaget', title: 'Paukeslaget', tempo: 60, use: 'Når noe overraskende skjer.',
    groups: [{ label: 'Paukeslaget', bars: [
      ['H1', 'C'], ['H2', 'C'], ['H3', 'G7'], ['H4', 'G7'], ['H1', 'C'], ['H2', 'C'], ['H7', 'D7'], ['H8', 'GB'],
      ['H1', 'C'], ['H2', 'C'], ['H3', 'G7'], ['H4', 'G7'], ['H1', 'C'], ['H2', 'C'], ['H7', 'D7'], ['H16', 'BANG']
    ] }]
  }]
});

// ---------- Strauss: Den blå Donau, første vals ----------

const DANUBE_D = [N('D3', q, 5), DY('F#3', 'A3', q, '2 1'), DY('F#3', 'A3', q, '2 1')];
const DANUBE_A7 = [N('A2', q, 5), DY('C#3', 'G3', q, '3 1'), DY('C#3', 'G3', q, '3 1')];

export const donau = klassisk({
  id: 'donau',
  title: 'Den blå Donau',
  by: 'Johann Strauss d.y., første vals. De første 16 taktene, forenklet.',
  key: 'D',
  meter: { beats: 3, unit: 4 },
  casio: { tone: 183, tip: 'Vals: tell én-to-tre og legg tyngden på én.' },
  bars: {
    U1: [N('D4', q, 1), N('F#4', q, 2), N('A4', q, 3)],
    U2: [N('A4', h, 3), CH(['F#5', 'A5'], q, '3 5', 'F♯+A')],
    U3: [CH(['F#5', 'A5'], h, '3 5', 'F♯+A'), CH(['D5', 'F#5'], q, '1 3', 'D+F♯')],
    U4: [CH(['D5', 'F#5'], h, '1 3', 'D+F♯'), N('D4', q, 1)],
    U6: [N('A4', h, 3), CH(['G5', 'A5'], q, '4 5', 'G+A')],
    U7: [CH(['G5', 'A5'], h, '4 5', 'G+A'), CH(['C#5', 'G5'], q, '1 4', 'C♯+G')],
    U8: [CH(['C#5', 'G5'], h, '1 4', 'C♯+G'), N('C#4', q, 1)],
    U9: [N('C#4', q, 1), N('E4', q, 2), N('B4', q, 5)],
    U10: [N('B4', h, 5), CH(['G5', 'B5'], q, '3 5', 'G+B')],
    U11: [CH(['G5', 'B5'], h, '3 5', 'G+B'), CH(['C#5', 'G5'], q, '1 3', 'C♯+G')],
    U12: [CH(['C#5', 'G5'], h, '1 3', 'C♯+G'), N('C#4', q, 1)],
    U14: [N('B4', h, 5), CH(['F#5', 'B5'], q, '3 5', 'F♯+B')],
    U15: [CH(['F#5', 'B5'], h, '3 5', 'F♯+B'), CH(['D5', 'F#5'], q, '1 3', 'D+F♯')],
    U16: [CH(['D5', 'F#5'], h, '1 3', 'D+F♯'), R(q)]
  },
  lh: {
    D: DANUBE_D,
    A7: DANUBE_A7,
    END: [DY('D3', 'A3', h), R(q)]
  },
  sections: [{
    id: 'donau', title: 'Den blå Donau', tempo: 150, use: 'Pause med dans, eller når to lag skal bytte plass.',
    groups: [{ label: 'Den blå Donau', bars: [
      ['U1', null], ['U2', 'D'], ['U3', 'D'], ['U4', 'D'], ['U1', 'D'], ['U6', 'A7'], ['U7', 'A7'], ['U8', 'A7'],
      ['U9', 'A7'], ['U10', 'A7'], ['U11', 'A7'], ['U12', 'A7'], ['U9', 'A7'], ['U14', 'D'], ['U15', 'D'], ['U16', 'END']
    ] }]
  }]
});

export const orkester: Song[] = [nachtmusik, morgenstemning, zarathustra, danseMacabre, teDeum, odeTilGleden, paukeslaget, donau];
