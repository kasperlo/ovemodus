import { CH, DY, N, R, e, h, q, type Song } from '../music/song';
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

export const orkester: Song[] = [nachtmusik];
