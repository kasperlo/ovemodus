import { describe, expect, it } from 'vitest';
import { GATE_MAX, GATE_MIN, analyzeCalibration, toDb, type Frame } from './calibrate';

const frames = (rms: number, n: number, pitched = true): Frame[] => Array.from({ length: n }, () => ({ rms, pitched }));
const quiet = (rms: number, n = 60) => Array.from({ length: n }, () => rms);

describe('analyzeCalibration', () => {
  it('god lyd: grensen havner godt under tonene og over støyen, ingen råd', () => {
    const c = analyzeCalibration(quiet(0.0005), [...frames(0.03, 200), ...frames(0.0004, 100, false)]);
    expect(c.noise).toBeCloseTo(0.0005);
    expect(c.note).toBeCloseTo(0.03);
    expect(c.gate).toBeCloseTo(0.012);
    expect(c.pitchedShare).toBe(1);
    expect(c.advice).toEqual([]);
  });

  it('svake toner: lav grense og råd om å skru opp eller flytte nærmere', () => {
    const c = analyzeCalibration(quiet(0.0002), frames(0.0025, 200));
    expect(c.gate).toBeCloseTo(0.001);
    expect(c.gate).toBeLessThan(0.0035); // lavere enn «Høy»
    expect(c.advice.join(' ')).toMatch(/svake/);
  });

  it('mye støy: grensen følger støyen, og det gis råd om det', () => {
    const c = analyzeCalibration(quiet(0.004), frames(0.015, 200));
    expect(c.gate).toBeCloseTo(0.012);
    expect(c.advice.join(' ')).toMatch(/Bakgrunnsstøyen/);
  });

  it('få gjenkjente toner: råd om ren pianolyd', () => {
    const c = analyzeCalibration(quiet(0.0005), [...frames(0.03, 40), ...frames(0.03, 160, false)]);
    expect(c.pitchedShare).toBeCloseTo(0.2);
    expect(c.advice.join(' ')).toMatch(/ren pianolyd/);
  });

  it('ingen toner i det hele tatt', () => {
    const c = analyzeCalibration(quiet(0.0005), frames(0.0005, 200, false));
    expect(c.note).toBe(0);
    expect(c.advice).toHaveLength(1);
    expect(c.advice[0]).toMatch(/Fant ingen toner/);
  });

  it('bare nuller: mikrofonen gir ingen lyd, og rådet sier hva man gjør', () => {
    for (const c of [analyzeCalibration(quiet(0), frames(0, 200, false)), analyzeCalibration([], [])]) {
      expect(c.advice).toHaveLength(1);
      expect(c.advice[0]).toMatch(/ingen lyd i det hele tatt/);
    }
  });

  it('holder grensen innenfor fornuftige verdier', () => {
    expect(analyzeCalibration(quiet(0), frames(0.0001, 10)).gate).toBe(GATE_MIN);
    expect(analyzeCalibration(quiet(0.05), frames(0.5, 10)).gate).toBe(GATE_MAX);
  });
});

describe('toDb', () => {
  it('regner RMS om til dBFS', () => {
    expect(toDb(1)).toBe(0);
    expect(toDb(0.01)).toBe(-40);
    expect(toDb(0)).toBe(-120);
  });
});
