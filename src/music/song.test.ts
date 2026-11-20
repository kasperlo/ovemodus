import { describe, expect, it } from 'vitest';
import { dovregubben } from '../songs/dovregubben';
import { build } from './song';
import { parsePitch, sciName } from './theory';

const section = (id: string) => dovregubben.sections.find(s => s.id === id)!;

describe('parsePitch', () => {
  it('leser tonenavn og beholder stavemåten', () => {
    expect(parsePitch('A4')).toEqual({ midi: 69, name: 'A', sci: 'A4' });
    expect(parsePitch('D#5')).toEqual({ midi: 75, name: 'D♯', sci: 'D♯5' });
    expect(parsePitch('Bb4')).toEqual({ midi: 70, name: 'B♭', sci: 'B♭4' });
    expect(sciName(70)).toBe('A♯4');
  });

  it('avviser ugyldige navn', () => {
    expect(() => parsePitch('H4')).toThrow();
  });
});

describe('build', () => {
  it.each([['delA', 26], ['delB', 24], ['hele', 103], ['riktig', 5], ['feil', 4]])('%s har %i steg', (id, n) => {
    expect(build(dovregubben, section(id)).steps).toHaveLength(n);
  });

  it('nummererer stegene fortløpende og hopper over pauser', () => {
    const m = build(dovregubben, section('hele'));
    expect(m.steps.map(s => s.si)).toEqual(m.steps.map((_, i) => i));
    expect(m.items.filter(it => it.type === 'rest')).toHaveLength(2);
  });

  it('hver takt fyller 4/4 og posisjonene henger sammen', () => {
    for (const sec of dovregubben.sections) {
      const m = build(dovregubben, sec);
      expect(m.total, sec.id).toBe(m.bars.length * 8);
      m.bars.forEach((bar, i) => {
        expect(bar.start, `${sec.id} takt ${i + 1}`).toBe(i * 8);
        expect(bar.items.reduce((sum, it) => sum + it.d, 0), `${sec.id} takt ${i + 1}`).toBe(8);
      });
    }
  });

  it('setter etikett bare på første takt i hver gruppe', () => {
    const labels = build(dovregubben, section('hele')).bars.map(b => b.label).filter(Boolean);
    expect(labels).toEqual(['Del A', 'Del A, andre gang', 'Del B', 'Del A igjen', 'Sluttakkord']);
  });

  it('plasserer venstre hånd i riktig takt', () => {
    const m = build(dovregubben, section('delA'));
    expect(m.lh).toHaveLength(16);
    expect(m.lh[4]).toEqual({ pos: 8, d: 2, midis: [45, 52] });
    expect(build(dovregubben, section('feil')).lh).toEqual([]);
  });

  it('lager nye stegobjekter for hver build, så status fra en runde ikke lekker', () => {
    const a = build(dovregubben, section('delA')), b = build(dovregubben, section('delA'));
    a.steps[0].status = 'done';
    expect(b.steps[0].status).toBeUndefined();
  });
});
