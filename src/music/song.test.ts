import { describe, expect, it } from 'vitest';
import { findSection } from '../songs';
import { dovregubben } from '../songs/dovregubben';
import { CH, N, R, T3, barLength, beamGroup, build, clickLength, countInBars, e, ed, h, mergeTones, q, s16, type PracticeHand, type Song } from './song';
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
    expect(m.steps[0].parts?.rh).toMatchObject({ midis: [69], f: '1' });
    expect(m.steps[0].parts?.lh).toMatchObject({ midis: [45, 52], f: '5 1' });
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

describe('trioler', () => {
  const song: Song = {
    id: 't', title: 'T', by: '', category: 'mine', key: 'C', meter: { beats: 2, unit: 4 },
    bars: { a: [...T3(N('C5', s16, 1), N('D5', s16, 2), N('E5', s16, 3)), ...T3(N('F5', s16, 4), N('E5', s16, 3), N('D5', s16, 2)), N('C5', q, 1)] },
    lh: { a: [N('C3', e, 5), N('G3', e, 1), N('C3', q, 5)] },
    sections: [{ id: 't1', title: 'T', tempo: 60, groups: [{ label: 'T', bars: [['a', 'a'], ['a', 'a']] }] }]
  };

  it('tre toner på plassen til to, med skrevet varighet', () => {
    const [a, b, c] = T3(N('C5', s16, 1), N('D5', s16, 2), N('E5', s16, 3));
    expect([a.d * 3, b.d * 3, c.d * 3]).toEqual([1, 1, 1]);
    expect([a.triplet, b.triplet]).toEqual([{ written: s16, first: true }, { written: s16, first: false }]);
    expect(() => T3(N('C5', s16, 1))).toThrow();
  });

  it('plassene blir eksakte, så hendene slår an sammen etter en triol', () => {
    const m = build(song, song.sections[0], 'both');
    expect(m.steps.map(s => s.pos * 3)).toEqual([0, 1, 2, 3, 4, 5, 6, 12, 13, 14, 15, 16, 17, 18]);
    expect(m.steps.filter(s => s.parts?.rh && s.parts?.lh).map(s => s.pos)).toEqual([0, 1, 2, 4, 5, 6]);
    expect(m.total).toBe(8);
  });

  it('en triol kan begynne med en pause', () => {
    const [r, a] = T3(R(e), N('B#3', e, 4), N('D#4', e, 5));
    expect(r).toMatchObject({ type: 'rest', triplet: { written: e, first: true } });
    expect(r.d * 3).toBeCloseTo(2, 9);
    expect(a.triplet).toEqual({ written: e, first: false });
  });

  it('pause etter triol fyller takten nøyaktig', () => {
    const bar = [...T3(N('C5', s16, 1), N('D5', s16, 2), N('E5', s16, 3)), R(e), R(q)];
    expect(bar.reduce((sum, ev) => sum + ev.d, 0)).toBeCloseTo(4, 9);
  });
});

describe('forsiringer', () => {
  const song: Song = {
    id: 'o', title: 'O', by: '', category: 'mine', key: 'C', meter: { beats: 2, unit: 4 },
    bars: { a: [N('C5', q, 2, { grace: ['F4', 'A4'] }), N('F5', e, 4, { trill: true }), N('E5', e, 3)] },
    lh: { a: [N('C3', q, 5), R(q)] },
    sections: [{ id: 'o1', title: 'O', tempo: 60, groups: [{ label: 'O', bars: [['a', 'a']] }] }]
  };

  it('forslagsnoter og triller følger tonen, og stegene får MIDI-tallene', () => {
    expect(N('C5', q, 2, { grace: ['F4', 'A4'] }).grace).toEqual(['F4', 'A4']);
    expect(() => N('C5', q, 2, { grace: ['H4'] })).toThrow();
    const m = build(song, song.sections[0], 'rh');
    expect(m.steps.map(s => s.ornaments)).toEqual([{ grace: [65, 69] }, { trill: 77 }, undefined]);
  });

  it('med begge hender følger forsiringene steget', () => {
    const m = build(song, song.sections[0], 'both');
    expect(m.steps[0].ornaments).toEqual({ grace: [65, 69] });
    expect(m.steps[1].ornaments).toEqual({ trill: 77 });
  });
});

describe('to stemmer i én hånd', () => {
  // Melodi over trioler, som i Måneskinn: punktert åttendedel og sekstendel mot trioler på samme slag
  const song: Song = {
    id: 'v', title: 'V', by: '', category: 'mine', key: 'C', meter: { beats: 2, unit: 4 },
    bars: { a: [...T3(N('G3', e, 1), N('C4', e, 2), N('E4', e, 3)), ...T3(N('G3', e, 1), N('C4', e, 2), N('E4', e, 3))] },
    lh: { a: [N('C3', h, 5)] },
    upper: { rh: { a: [R(q), N('G4', ed, 5), N('G4', s16, 5)] } },
    sections: [{ id: 'v1', title: 'V', tempo: 60, groups: [{ label: 'V', bars: [['a', 'a']] }] }]
  };

  it('stemmene slås sammen etter plassen: felles anslag blir én akkord, sekstendelen kommer etter tredje triolnote', () => {
    const m = build(song, song.sections[0], 'rh');
    expect(m.steps.map(s => s.pos * 6)).toEqual([0, 4, 8, 12, 16, 20, 21]);
    expect(m.steps[3]).toMatchObject({ type: 'chord', midis: [55, 67], f: '1 5', name: 'G+G' });
    expect(m.steps[5]).toMatchObject({ type: 'note', midi: 64, f: '3' });
    expect(m.steps[6]).toMatchObject({ type: 'note', midi: 67, f: '5', d: s16 });
    expect(m.steps.map(s => s.si)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(m.bars[0].items).toEqual(m.items);
  });

  it('varigheten til et steg er den korteste tonen i steget, som når stemmene er skrevet som akkord', () => {
    const m = build(song, song.sections[0], 'rh');
    expect(m.steps[3].d * 3).toBeCloseTo(2, 9);
    expect(m.steps[5].d * 3).toBeCloseTo(2, 9);
  });

  it('notearket får hver stemme for seg, og bare hånden med to stemmer har den ekstra', () => {
    const m = build(song, song.sections[0], 'rh');
    expect(m.staffs.rh[0].items.filter(it => it.type !== 'rest')).toHaveLength(6);
    expect(m.uppers.rh?.[0].items.map(it => it.type)).toEqual(['rest', 'note', 'note']);
    expect(m.uppers.lh).toBeNull();
  });

  it('venstre hånd: begge stemmene i høyre hånd blir akkompagnement med sin egen varighet', () => {
    const m = build(song, song.sections[0], 'lh');
    expect(m.steps).toHaveLength(1);
    expect(m.acc).toHaveLength(8);
    expect(m.acc).toContainEqual({ pos: 2, d: ed, midis: [67] });
  });

  it('begge hender: hver hånd sin del, med stemmene i høyre hånd slått sammen', () => {
    const m = build(song, song.sections[0], 'both');
    expect(m.steps).toHaveLength(7);
    expect(m.steps[0].parts?.lh).toMatchObject({ midis: [48] });
    expect(m.steps[3].parts?.rh).toMatchObject({ midis: [55, 67], f: '1 5' });
    expect(m.steps[6]).toMatchObject({ pos: 3.5, midis: [67] });
  });

  it('samme tone i begge stemmene teller én gang, og akkorder får tonene nedenfra', () => {
    const g = N('G3', e, 1);
    expect(mergeTones([g, N('G3', q, 1)])).toBe(g);
    expect(mergeTones([CH(['C4', 'E4'], e, '1 3', 'C+E'), N('A3', q, 1)])).toMatchObject({ midis: [57, 60, 64], names: ['A', 'C', 'E'], f: '1 1 3', name: 'A+C+E' });
  });
});
