import { describe, expect, it } from 'vitest';
import { CH, N, q } from '../music/song';
import { hitWindow, matches, timingClass, timingText } from './judge';

describe('matches', () => {
  const a4 = N('A4', q, 1);
  const am = CH(['A4', 'C5', 'E5', 'A5'], q, '1 2 3 5', 'A-moll', 'Am');

  it('godtar riktig tone i alle oktaver når valget er på', () => {
    expect(matches(a4, 69, true)).toBe(true);
    expect(matches(a4, 57, true)).toBe(true);
    expect(matches(a4, 70, true)).toBe(false);
  });

  it('krever riktig oktav når valget er av', () => {
    expect(matches(a4, 69, false)).toBe(true);
    expect(matches(a4, 57, false)).toBe(false);
  });

  it('godtar én av akkordtonene', () => {
    expect(matches(am, 72, false)).toBe(true);
    expect(matches(am, 60, false)).toBe(false);
    expect(matches(am, 60, true)).toBe(true);
    expect(matches(am, 62, true)).toBe(false);
  });
});

describe('hitWindow', () => {
  it('er halve varigheten, maks en kvartnote, mellom 90 og 200 ms', () => {
    const e8 = 30 / 100; // 100 BPM
    expect(hitWindow(e8, e8)).toBeCloseTo(0.15);
    expect(hitWindow(4 * e8, e8)).toBeCloseTo(0.2);
    expect(hitWindow(0.5 * (30 / 220), 30 / 220)).toBeCloseTo(0.09);
  });
});

describe('timingClass', () => {
  it('merker toner som er mer enn 30 ms for tidlig eller sent', () => {
    expect(timingClass(0.029)).toBeNull();
    expect(timingClass(-0.029)).toBeNull();
    expect(timingClass(0.031)).toBe('late');
    expect(timingClass(-0.05)).toBe('early');
  });
});

describe('timingText', () => {
  it('beskriver snittavviket', () => {
    expect(timingText(-29)).toBe('Timingen sitter.');
    expect(timingText(61.4)).toBe('I snitt 61 ms for sent.');
    expect(timingText(-45)).toBe('I snitt 45 ms for tidlig.');
  });
});
