import { describe, expect, it } from 'vitest';
import { CH, N, q, type Step } from '../music/song';
import { addChordTone, chordNeeds, hitWindow, isOrnament, matches, timingClass, timingText, wholeChord } from './judge';

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

describe('isOrnament', () => {
  const step = (o: Step['ornaments']): Step => ({ ...N('C5', q, 1), pos: 0, si: 0, ornaments: o });

  it('forslagsnotene til steget man venter på gir ikke bom', () => {
    expect(isOrnament(65, step({ grace: [65, 69] }), undefined, false)).toBe(true);
    expect(isOrnament(64, step({ grace: [65, 69] }), undefined, false)).toBe(false);
    expect(isOrnament(77, step({ grace: [65, 69] }), undefined, true)).toBe(true);
  });

  it('trillen på forrige steg: hovedtonen og tonen et halvt eller helt trinn over', () => {
    const prev = step({ trill: 77 });
    expect([77, 78, 79, 80, 76].map(m => isOrnament(m, step(undefined), prev, false))).toEqual([true, true, true, false, false]);
    expect(isOrnament(76, step(undefined), step(undefined), false)).toBe(false);
  });
});

describe('hele akkorden med MIDI', () => {
  const am = [69, 72, 76, 81]; // A4 C5 E5 A5

  it('gjelder bare MIDI, og bare når valget er på', () => {
    expect(wholeChord('midi', true)).toBe(true);
    expect(wholeChord('midi', false)).toBe(false);
    for (const src of ['mic', 'click', 'test']) expect(wholeChord(src, true)).toBe(false);
  });

  it('med alle oktaver teller hvert tonenavn én gang, ellers hver tone', () => {
    expect(chordNeeds(am, true)).toEqual([9, 0, 4]);
    expect(chordNeeds(am, false)).toEqual(am);
  });

  it('er ferdig først når alle tonene er spilt, i hvilken som helst rekkefølge og oktav', () => {
    let r = addChordTone(undefined, am, 76, true);
    expect(r.complete).toBe(false);
    r = addChordTone(r.played, am, 76, true);
    expect(r).toMatchObject({ complete: false, played: [4] });
    r = addChordTone(r.played, am, 57, true); // A3 i stedet for A4
    expect(r.complete).toBe(false);
    r = addChordTone(r.played, am, 72, true);
    expect(r.complete).toBe(true);
  });

  it('uten alle oktaver må både A4 og A5 spilles', () => {
    let r = addChordTone(undefined, am, 69, false);
    for (const m of [72, 76]) r = addChordTone(r.played, am, m, false);
    expect(r.complete).toBe(false);
    expect(addChordTone(r.played, am, 81, false).complete).toBe(true);
  });
});

