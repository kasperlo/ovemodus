import { CH, DY, N, R, dh, e, ed, h, q, qd, s16, type Song } from '../music/song';
import { M24, klassisk } from './klassisk';

// Opera og sang. Melodiene er kontrollert mot partiturer uten opphavsrett (se assumptions.md, 2026-11-21).

// ---------- Bizet: Toreador (Carmen), refrenget slik det står i forspillet ----------

const TOREADOR_F = [DY('F3', 'A3', e, '2 1'), R(e), DY('C3', 'A3', e, '5 1'), R(e)];

export const toreador = klassisk({
  id: 'toreador',
  title: 'Toreador',
  by: 'Georges Bizet, Carmen. Refrenget slik det står i forspillet, med egen slutt på F-durakkorden.',
  key: 'F',
  meter: M24,
  casio: { reg: [7, 2], tone: 224, layer: 183, tip: 'Stolt og markert.' },
  bars: {
    R1: [N('C5', q, 4), N('D5', ed, 5), N('C5', s16, 4)],
    R2: [N('A4', q, 2), N('A4', q, 2)],
    R3: [N('A4', ed, 2), N('G4', s16, 1), N('A4', ed, 2), N('Bb4', s16, 3)],
    R4: [N('A4', qd, 2), R(e)],
    R5: [N('Bb4', q, 3), N('G4', ed, 1), N('C5', s16, 4)],
    R7: [N('F4', q, 3), N('D4', ed, 1), N('G4', s16, 4)],
    R8: [N('C4', qd, 1), R(e)],
    R9: [CH(['A4', 'C5', 'F5'], q, '1 2 5', 'F-dur', 'F'), R(q)]
  },
  lh: {
    F: TOREADOR_F,
    L5: [DY('G3', 'Bb3', e, '2 1'), R(e), DY('C3', 'Bb3', e, '5 1'), R(e)],
    L6: [DY('F3', 'A3', e, '2 1'), R(e), DY('E3', 'A3', e, '3 1'), R(e)],
    L7: [DY('D3', 'A3', e, '5 1'), R(e), DY('G2', 'F3', e, '5 1'), R(e)],
    L8: [DY('C3', 'E3', e, '2 1'), R(e), DY('C2', 'C3', e), R(e)],
    L9: [DY('F2', 'C3', q), R(q)]
  },
  sections: [{
    id: 'toreador', title: 'Toreador', tempo: 100, use: 'Når to deltakere skal duellere.',
    groups: [{ label: 'Toreador', bars: [
      ['R1', 'F'], ['R2', 'F'], ['R3', 'F'], ['R4', 'F'], ['R5', 'L5'], ['R4', 'L6'], ['R7', 'L7'], ['R8', 'L8'], ['R9', 'L9']
    ] }]
  }]
});

// ---------- Brahms: Wiegenlied op. 49 nr. 4, Ess-dur i originalen, her C-dur ----------

const LULLABY_C = [DY('C3', 'G3', dh)], LULLABY_G7 = [DY('G2', 'F3', dh)], LULLABY_F = [DY('F2', 'C3', dh)];

export const vuggevise = klassisk({
  id: 'vuggevise',
  title: 'Brahms’ vuggevise',
  by: 'Johannes Brahms, Wiegenlied op. 49 nr. 4. Flyttet fra Ess-dur til C-dur. Venstre hånd er enkle akkorder.',
  key: 'C',
  meter: { beats: 3, unit: 4 },
  casio: { tone: 49, tip: 'Celesta høres ut som en spilledåse.' },
  bars: {
    P: [R(h), N('E4', e, 2), N('E4', e, 2)],
    V1: [N('G4', qd, 4), N('E4', e, 2), N('E4', q, 2)],
    V2: [N('G4', q, 4), R(q), N('E4', e, 2), N('G4', e, 4)],
    V3: [N('C5', q, 5), N('B4', qd, 4), N('A4', e, 3)],
    V4: [N('A4', q, 3), N('G4', q, 2), N('D4', e, 1), N('E4', e, 2)],
    V5: [N('F4', q, 3), N('D4', q, 1), N('D4', e, 1), N('E4', e, 2)],
    V6: [N('F4', q, 3), R(q), N('D4', e, 1), N('F4', e, 3)],
    V7: [N('B4', e, 5), N('A4', e, 4), N('G4', q, 3), N('B4', q, 5)],
    V8: [N('C5', q, 5), R(q), N('C4', e, 1), N('C4', e, 1)],
    V9: [N('C5', h, 5), N('A4', e, 3), N('F4', e, 2)],
    V10: [N('G4', h, 3), N('E4', e, 2), N('C4', e, 1)],
    V11: [N('F4', q, 2), N('G4', q, 3), N('A4', q, 4)],
    V12: [N('G4', h, 3), N('C4', e, 1), N('C4', e, 1)],
    V15: [N('F4', q, 4), N('E4', q, 3), N('D4', q, 2)],
    V16: [N('C4', h, 1), R(q)]
  },
  lh: {
    C: LULLABY_C,
    G7: LULLABY_G7,
    F: LULLABY_F,
    END: [DY('C3', 'G3', h), R(q)]
  },
  sections: [{
    id: 'vuggevise', title: 'Brahms’ vuggevise', tempo: 80, use: 'Når et svar tar altfor lang tid, eller noen sovner.',
    groups: [{ label: 'Brahms’ vuggevise', bars: [
      ['P', null], ['V1', 'C'], ['V2', 'C'], ['V3', 'G7'], ['V4', 'C'], ['V5', 'G7'], ['V6', 'G7'], ['V7', 'G7'], ['V8', 'C'],
      ['V9', 'F'], ['V10', 'C'], ['V11', 'F'], ['V12', 'C'], ['V9', 'F'], ['V10', 'C'], ['V15', 'G7'], ['V16', 'END']
    ] }]
  }]
});

export const opera: Song[] = [toreador, vuggevise];
