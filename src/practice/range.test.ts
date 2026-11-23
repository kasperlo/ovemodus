import { describe, expect, it } from 'vitest';
import { build, type Section } from '../music/song';
import { findSection } from '../songs';
import { barCount, barNumber, normalizeRange, rangeKey, rangeText, sliceSection } from './range';

const hele = findSection('hele');
const delA = findSection('delA');

describe('utsnitt av en del', () => {
  it('teller taktene i alle gruppene', () => {
    expect(barCount(delA.sec)).toBe(4);
    expect(barCount(hele.sec)).toBe(17);
  });

  it('hele delen og ugyldige utsnitt blir null, og fra og til byttes om når de står feil vei', () => {
    expect(normalizeRange(delA.sec, null)).toBeNull();
    expect(normalizeRange(delA.sec, { from: 0, to: 3 })).toBeNull();
    expect(normalizeRange(delA.sec, { from: 2, to: 4 })).toBeNull();
    expect(normalizeRange(delA.sec, { from: -1, to: 2 })).toBeNull();
    expect(normalizeRange(delA.sec, { from: 0.5, to: 2 })).toBeNull();
    expect(normalizeRange(delA.sec, { from: 2, to: 1 })).toEqual({ from: 1, to: 2 });
    expect(normalizeRange(delA.sec, { from: 3, to: 3 })).toEqual({ from: 3, to: 3 });
  });

  it('tar med taktene i utsnittet på tvers av grupper, og beholder etikettene', () => {
    const sec = sliceSection(hele.sec, { from: 3, to: 5 });
    expect(sec.groups.map(g => g.label)).toEqual(['Del A', 'Del A, andre gang']);
    expect(sec.groups.map(g => g.bars.map(b => b[0]))).toEqual([['A4'], ['A1', 'A2']]);
    expect(sec.firstBar).toBe(4);
    expect(sec.id).toBe('hele');
  });

  it('modellen av et utsnitt starter på null og har bare tonene i taktene', () => {
    const whole = build(hele.song, hele.sec);
    const part = build(hele.song, sliceSection(hele.sec, { from: 3, to: 5 }));
    const inRange = whole.steps.filter(s => s.pos >= 3 * whole.barLen && s.pos < 6 * whole.barLen);
    expect(part.steps.map(s => s.sci)).toEqual(inRange.map(s => s.sci));
    expect(part.steps[0].pos).toBe(0);
    expect(part.steps.map(s => s.si)).toEqual(inRange.map((_, i) => i));
    expect(part.total).toBe(3 * whole.barLen);
    expect(part.firstBar).toBe(4);
    expect(build(hele.song, sliceSection(hele.sec, { from: 3, to: 5 }), 'both').steps.length).toBeGreaterThan(0);
  });

  it('første gruppe får en etikett også når delen ikke har noen, fordi bokstavvisningen trenger den', () => {
    const sec: Section = { ...delA.sec, groups: [{ label: '', bars: delA.sec.groups[0].bars }] };
    expect(sliceSection(sec, { from: 1, to: 2 }).groups[0].label).toBe('Takt 2–3');
  });

  it('taktnumrene følger firstBar, men nøkkelen telles innenfor delen', () => {
    const sec: Section = { ...delA.sec, firstBar: 17 };
    expect(barNumber(sec, 0)).toBe(17);
    expect(rangeText(sec, { from: 1, to: 2 })).toBe('Takt 18–19');
    expect(rangeText(sec, { from: 2, to: 2 })).toBe('Takt 19');
    expect(sliceSection(sec, { from: 1, to: 2 }).firstBar).toBe(18);
    expect(rangeKey({ from: 1, to: 2 })).toBe('t2-3');
    expect(rangeKey(null)).toBe('');
  });
});
