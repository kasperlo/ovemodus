import { describe, expect, it } from 'vitest';
import { STORE_VERSION, defaultStore, parseStore, partKey } from './storage';

// Slik så lagringen ut før utsnitt og løkke (versjon 1)
const v1 = {
  settings: {
    section: 'delB', hand: 'lh', mode: 'takt', oct: false, lh: true, acc: false, sens: 'kalibrert', calGate: 0.0009,
    tempo: { delA: 110, delB: 95 }, view: 'bokstaver', lhStaff: true, setupOpen: false
  },
  rec: { 'delA|vent': { time: 12.5, misses: 0 }, 'delB|lh|takt': { tempo: 95, pct: 92 } }
};

describe('lagring', () => {
  it('data fra versjon 1 beholder innstillinger og rekorder, og får standardverdier for det nye', () => {
    const st = parseStore(JSON.parse(JSON.stringify(v1)));
    expect(st.v).toBe(STORE_VERSION);
    expect(st.settings).toMatchObject(v1.settings);
    expect(st.settings).toMatchObject({ ranges: {}, loop: false, target: {} });
    expect(st.rec).toEqual(v1.rec);
    expect(st.progress).toEqual({});
  });

  it('tomt, ødelagt eller feil type gir standardverdiene', () => {
    for (const raw of [null, undefined, 'tekst', 42, [], [1, 2]]) expect(parseStore(raw)).toEqual(defaultStore());
  });

  it('felter med feil form får standardverdien, resten beholdes', () => {
    const st = parseStore({
      settings: {
        section: 'delA', tempo: { delA: 100, delB: 'fort' }, loop: 'ja', target: [120],
        ranges: { delA: [1, 2], hele: [3], delB: [-1, 2], x: 'a' }
      },
      rec: 'ødelagt',
      progress: {
        'delA|t2-3|takt': { rounds: [{ at: 1, tempo: 100, pct: 95 }, null, { tempo: 5 }], days: { '2026-11-23': 100, feil: 'x' } },
        'delA|vent': 'ødelagt'
      }
    });
    expect(st.settings.tempo).toEqual({ delA: 100 });
    expect(st.settings.loop).toBe(false);
    expect(st.settings.target).toEqual({});
    expect(st.settings.ranges).toEqual({ delA: [1, 2] });
    expect(st.rec).toEqual({});
    expect(st.progress).toEqual({ 'delA|t2-3|takt': { rounds: [{ at: 1, tempo: 100, pct: 95 }], days: { '2026-11-23': 100 } } });
  });

  it('lagrer og leser utsnitt, løkke og fremgang uendret', () => {
    const st = defaultStore();
    st.settings.ranges.delA = [1, 2];
    st.settings.loop = true;
    st.settings.target.delA = 120;
    st.progress['delA|t2-3|takt'] = { rounds: [{ at: 5, tempo: 105, pct: 91 }], days: { '2026-11-23': 105 } };
    expect(parseStore(JSON.parse(JSON.stringify(st)))).toEqual(st);
  });

  it('ukjente felter beholdes, så en eldre versjon av appen ikke sletter data fra en nyere', () => {
    expect(parseStore({ ...v1, framtid: { a: 1 } })).toHaveProperty('framtid', { a: 1 });
  });

  it('hele delen har samme nøkkel som før, et utsnitt får sin egen', () => {
    expect(partKey('delA', '')).toBe('delA');
    expect(partKey('delA', 't5-8')).toBe('delA|t5-8');
  });
});
