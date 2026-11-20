import { describe, expect, it } from 'vitest';
import { barLength, type BarEvent } from '../music/song';
import { isKnownKey } from '../notation/abc';
import { songs } from '.';

// Validering av alle låtene, så feil i notene oppdages før de havner i appen.

const pitches = (ev: BarEvent): number[] => ev.type === 'rest' ? [] : ev.type === 'chord' ? ev.midis : [ev.midi];
const fingers = (ev: BarEvent): number[] => ev.type === 'rest' ? [] : ev.f.split(' ').map(Number);

describe.each(songs.map(s => [s.id, s] as const))('%s', (_id, song) => {
  const len = barLength(song.meter);
  const used = new Set<string>(), usedLh = new Set<string>();
  song.sections.forEach(sec => sec.groups.forEach(g => g.bars.forEach(([rh, lh]) => { used.add(rh); if (lh) usedLh.add(lh); })));

  it('har kjent toneart og taktart', () => {
    expect(isKnownKey(song.key), song.key).toBe(true);
    expect([2, 3, 4, 6, 9, 12]).toContain(song.meter.beats);
    expect([2, 4, 8]).toContain(song.meter.unit);
  });

  it('alle takter som brukes, finnes og fyller taktarten', () => {
    used.forEach(k => {
      expect(song.bars[k], `høyre ${k}`).toBeDefined();
      expect(song.bars[k].reduce((s, ev) => s + ev.d, 0), `høyre ${k}`).toBe(len);
    });
    usedLh.forEach(k => {
      expect(song.lh[k], `venstre ${k}`).toBeDefined();
      expect(song.lh[k].reduce((s, ev) => s + ev.d, 0), `venstre ${k}`).toBe(len);
    });
  });

  it('fingre er 1–5, én per tone, og følger tonehøyden', () => {
    const check = (events: BarEvent[], hand: 'rh' | 'lh', key: string) => events.forEach(ev => {
      if (ev.type === 'rest') return;
      const f = fingers(ev), p = pitches(ev);
      expect(f.length, `${hand} ${key}`).toBe(p.length);
      f.forEach(x => expect(x, `${hand} ${key}`).toBeGreaterThanOrEqual(1));
      f.forEach(x => expect(x, `${hand} ${key}`).toBeLessThanOrEqual(5));
      // Høyre hånd: høyere tone, høyere finger. Venstre hånd: høyere tone, lavere finger.
      for (let i = 1; i < f.length; i++) {
        expect(p[i] > p[i - 1], `${hand} ${key}: toner nedenfra`).toBe(true);
        expect(hand === 'rh' ? f[i] > f[i - 1] : f[i] < f[i - 1], `${hand} ${key}: fingre ${ev.type === 'chord' ? ev.f : ''}`).toBe(true);
      }
    });
    used.forEach(k => check(song.bars[k], 'rh', k));
    usedLh.forEach(k => check(song.lh[k], 'lh', k));
  });

  it('høyre hånd fra midtre C og opp, venstre under (MIDI skiller hendene der)', () => {
    used.forEach(k => song.bars[k].flatMap(pitches).forEach(m => expect(m, `høyre ${k}`).toBeGreaterThanOrEqual(60)));
    usedLh.forEach(k => song.lh[k].flatMap(pitches).forEach(m => expect(m, `venstre ${k}`).toBeLessThan(60)));
  });

  it('hver del har toner i begge hender', () => {
    song.sections.forEach(sec => {
      const rh = sec.groups.flatMap(g => g.bars.flatMap(([k]) => song.bars[k].flatMap(pitches)));
      const lh = sec.groups.flatMap(g => g.bars.flatMap(([, k]) => k ? song.lh[k].flatMap(pitches) : []));
      expect(rh.length, sec.id).toBeGreaterThan(0);
      expect(lh.length, sec.id).toBeGreaterThan(0);
    });
  });
});

it('id-ene til delene er unike på tvers av låter', () => {
  const ids = songs.flatMap(s => s.sections.map(sec => sec.id));
  expect(new Set(ids).size).toBe(ids.length);
});
