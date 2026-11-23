import { describe, expect, it } from 'vitest';
import { DAYS_KEPT, ROUNDS_KEPT, TEMPO_MAX, TEMPO_MIN, addRound, dayKey, ladderText, nextTempo } from './ladder';

describe('tempotrappen', () => {
  it('går opp 5 BPM fra 90 % treff, men ikke forbi målet', () => {
    expect(nextTempo(100, 90, 120)).toEqual({ tempo: 105, move: 'up' });
    expect(nextTempo(115, 100, 120)).toEqual({ tempo: 120, move: 'up' });
    expect(nextTempo(120, 100, 120)).toEqual({ tempo: 120, move: 'goal' });
    expect(nextTempo(TEMPO_MAX, 100, 300)).toEqual({ tempo: TEMPO_MAX, move: 'up' });
  });

  it('står over målet: blir stående etter en god runde', () => {
    expect(nextTempo(130, 95, 120)).toEqual({ tempo: 130, move: 'goal' });
  });

  it('samme tempo fra 70 til 89 %, ned 5 under 70 %, men ikke under minste tempo', () => {
    expect(nextTempo(100, 89, 120)).toEqual({ tempo: 100, move: 'stay' });
    expect(nextTempo(100, 70, 120)).toEqual({ tempo: 100, move: 'stay' });
    expect(nextTempo(100, 69, 120)).toEqual({ tempo: 95, move: 'down' });
    expect(nextTempo(130, 40, 120)).toEqual({ tempo: 125, move: 'down' });
    expect(nextTempo(TEMPO_MIN, 0, 120)).toEqual({ tempo: TEMPO_MIN, move: 'stay' });
  });

  it('forteller hva som skjer med tempoet', () => {
    expect(ladderText({ tempo: 105, move: 'up' }, 120)).toBe('Bra! Tempoet går opp til 105 BPM.');
    expect(ladderText({ tempo: 120, move: 'up' }, 120)).toBe('Målet er nådd! Neste runde i 120 BPM.');
    expect(ladderText({ tempo: 120, move: 'goal' }, 120)).toBe('Du holder måltempoet, 120 BPM.');
    expect(ladderText({ tempo: 100, move: 'stay' }, 120)).toBe('Samme tempo en gang til: 100 BPM.');
    expect(ladderText({ tempo: 95, move: 'down' }, 120)).toBe('Litt saktere: 95 BPM.');
  });
});

describe('runder og beste tempo per dag', () => {
  it('dagen er i lokal tid', () => {
    expect(dayKey(new Date(2026, 10, 3, 23, 59))).toBe('2026-11-03');
    expect(dayKey(new Date(2027, 0, 1, 0, 1))).toBe('2027-01-01');
  });

  it('dagens beste tempo teller bare runder med minst 90 % treff', () => {
    let p = addRound(undefined, { at: 1, tempo: 100, pct: 95 }, '2026-11-23');
    p = addRound(p, { at: 2, tempo: 110, pct: 80 }, '2026-11-23');
    p = addRound(p, { at: 3, tempo: 105, pct: 90 }, '2026-11-23');
    p = addRound(p, { at: 4, tempo: 100, pct: 100 }, '2026-11-23');
    p = addRound(p, { at: 5, tempo: 110, pct: 92 }, '2026-11-24');
    expect(p.days).toEqual({ '2026-11-23': 105, '2026-11-24': 110 });
    expect(p.rounds.map(r => r.at)).toEqual([1, 2, 3, 4, 5]);
  });

  it('runder i «Vent på meg» lagres, men gir ikke noe tempo', () => {
    const p = addRound(undefined, { at: 1, time: 12.3, misses: 1 }, '2026-11-23');
    expect(p).toEqual({ rounds: [{ at: 1, time: 12.3, misses: 1 }], days: {} });
  });

  it('beholder bare de siste rundene og dagene', () => {
    let p = addRound(undefined, { at: 0, tempo: 100, pct: 100 }, '2026-01-01');
    for (let i = 1; i < 100; i++) {
      const d = new Date(2026, 0, 1 + i);
      p = addRound(p, { at: i, tempo: 100 + (i % 5), pct: 100 }, dayKey(d));
    }
    expect(p.rounds).toHaveLength(ROUNDS_KEPT);
    expect(p.rounds[ROUNDS_KEPT - 1].at).toBe(99);
    expect(Object.keys(p.days)).toHaveLength(DAYS_KEPT);
    expect(Object.keys(p.days).sort().at(-1)).toBe(dayKey(new Date(2026, 0, 100)));
  });
});
