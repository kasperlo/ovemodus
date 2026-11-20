import { describe, expect, it } from 'vitest';
import { ghostMidi, ghostPitch, ledgerSteps, staffStep } from './staff';

describe('staffStep', () => {
  it('teller diatoniske trinn fra midtre C, som abcjs-pN', () => {
    expect(staffStep('C', 4)).toBe(0);
    expect(staffStep('A', 4)).toBe(5);
    expect(staffStep('F', 5)).toBe(10);
    expect(staffStep('B', 3)).toBe(-1);
  });
});

describe('ghostPitch', () => {
  it('staver svarte tangenter med ♯', () => {
    expect(ghostPitch(61)).toEqual({ step: 0, sharp: true });
    expect(ghostPitch(77)).toEqual({ step: 10, sharp: false });
  });
});

describe('ghostMidi', () => {
  it('viser feil tone i oktaven nærmest den man skulle spille når alle oktaver godtas', () => {
    expect(ghostMidi(53, 69, true)).toBe(65); // F3 mot A4 vises som F4
    expect(ghostMidi(83, 72, true)).toBe(71); // B5 mot C5 vises som B4
    expect(ghostMidi(78, 72, true)).toBe(78); // F♯5 mot C5: tritonus opp
  });

  it('viser tonen som spilt når oktaven teller', () => {
    expect(ghostMidi(57, 69, false)).toBe(57);
  });
});

describe('ledgerSteps', () => {
  it('ingen hjelpelinjer inne i systemet', () => {
    expect(ledgerSteps(1)).toEqual([]);
    expect(ledgerSteps(11)).toEqual([]);
  });

  it('hjelpelinjer under og over', () => {
    expect(ledgerSteps(0)).toEqual([0]);
    expect(ledgerSteps(-3)).toEqual([0, -2]);
    expect(ledgerSteps(14)).toEqual([12, 14]);
  });
});
