import { describe, expect, it } from 'vitest';
import { findSection } from '../songs';
import { dovregubben } from '../songs/dovregubben';
import { barLength, beamGroup, build, clickLength, countInBars, type PracticeHand } from './song';
import { parsePitch, sciName } from './theory';

const model = (id: string, hand: PracticeHand = 'rh') => { const { song, sec } = findSection(id); return build(song, sec, hand); };

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

describe('taktart', () => {
  it('taktlengde, metronomslag, bjelker og inntelling', () => {
    expect([barLength({ beats: 4, unit: 4 }), clickLength({ beats: 4, unit: 4 }), beamGroup({ beats: 4, unit: 4 }), countInBars({ beats: 4, unit: 4 })]).toEqual([8, 2, 4, 1]);
    expect([barLength({ beats: 2, unit: 4 }), clickLength({ beats: 2, unit: 4 }), beamGroup({ beats: 2, unit: 4 }), countInBars({ beats: 2, unit: 4 })]).toEqual([4, 2, 2, 2]);
    expect([barLength({ beats: 3, unit: 4 }), beamGroup({ beats: 3, unit: 4 }), countInBars({ beats: 3, unit: 4 })]).toEqual([6, 2, 2]);
    expect([barLength({ beats: 3, unit: 8 }), clickLength({ beats: 3, unit: 8 }), beamGroup({ beats: 3, unit: 8 }), countInBars({ beats: 3, unit: 8 })]).toEqual([3, 3, 3, 4]);
    expect([barLength({ beats: 6, unit: 8 }), clickLength({ beats: 6, unit: 8 }), countInBars({ beats: 6, unit: 8 })]).toEqual([6, 3, 2]);
  });
});

describe('build', () => {
  it.each([['delA', 26], ['delB', 24], ['hele', 103], ['riktig', 5], ['feil', 4]])('%s har %i steg', (id, n) => {
    expect(model(id).steps).toHaveLength(n);
  });

  it('nummererer stegene fortløpende og hopper over pauser', () => {
    const m = model('hele');
    expect(m.steps.map(s => s.si)).toEqual(m.steps.map((_, i) => i));
    expect(m.items.filter(it => it.type === 'rest')).toHaveLength(2);
  });

  it('setter etikett bare på første takt i hver gruppe', () => {
    const labels = model('hele').bars.map(b => b.label).filter(Boolean);
    expect(labels).toEqual(['Del A', 'Del A, andre gang', 'Del B', 'Del A igjen', 'Sluttakkord']);
  });

  it('høyre hånd: venstre hånd blir akkompagnement i riktig takt', () => {
    const m = model('delA');
    expect(m.acc).toHaveLength(16);
    expect(m.acc[4]).toEqual({ pos: 8, d: 2, midis: [45, 52] });
  });

  it('venstre hånd: kvintene blir stegene, med fingersetting, og høyre hånd blir akkompagnement', () => {
    const m = model('delA', 'lh');
    expect(m.hand).toBe('lh');
    expect(m.steps).toHaveLength(16);
    expect(m.steps[0]).toMatchObject({ type: 'chord', midis: [45, 52], f: '5 1', name: 'A+E', pos: 0 });
    expect(m.acc).toHaveLength(26);
    expect(m.bars.map(b => b.label)).toEqual(['Del A', null, null, null]);
  });

  it('begge hender: ett steg per anslag, med en del for hver hånd som slår an', () => {
    const m = model('delA', 'both');
    expect(m.hand).toBe('both');
    // 26 toner i høyre hånd, og én kvint i venstre (siste slag i takt 4) der høyre hånd holder en lang tone
    expect(m.steps).toHaveLength(27);
    expect(m.steps[0]).toMatchObject({ pos: 0, midis: [45, 52, 69], name: 'A / A+E' });
    expect(m.steps[0].parts?.rh).toMatchObject({ midis: [69], f: '1', idx: 0 });
    expect(m.steps[0].parts?.lh).toMatchObject({ midis: [45, 52], f: '5 1', idx: 0 });
    expect(m.steps[1].parts?.lh).toBeUndefined();
    const lhOnly = m.steps.filter(s => s.parts?.lh && !s.parts.rh);
    expect(lhOnly.map(s => s.pos)).toEqual([30]);
    expect(m.acc).toEqual([]);
    expect(m.bars).toHaveLength(4);
    expect(m.staffs.rh).toHaveLength(4);
    expect(m.staffs.lh).toHaveLength(4);
  });

  it('lager nye stegobjekter for hver build, så status fra en runde ikke lekker', () => {
    const a = model('delA'), b = model('delA');
    a.steps[0].status = 'done';
    expect(b.steps[0].status).toBeUndefined();
  });

  it('Dovregubben ligger i a-moll og 4/4', () => {
    expect(dovregubben.key).toBe('Am');
    expect(dovregubben.meter).toEqual({ beats: 4, unit: 4 });
  });
});
