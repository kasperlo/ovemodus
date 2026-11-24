import abcjs from 'abcjs';
import { describe, expect, it } from 'vitest';
import { barLength, build, type BarEvent, type Hand, type PracticeHand } from '../music/song';
import { isKnownKey, toAbc } from '../notation/abc';
import { songs } from '.';
import { CT_S400_TONES } from '../casio';

// Validering av alle låtene, så feil i notene oppdages før de havner i appen.

/**
 * Hele klaverstykker der hendene krysser midtre C som i originalen (venstre hånd over, eller høyre hånd under).
 * Der overlapper hendene, så MIDI skiller dem på hva som skal spilles i stedet for på tonehøyde.
 */
const HANDS_CROSS = new Set(['menuett-g', 'kanon-d', 'preludium-c', 'fur-elise', 'preludium-e', 'sonata-facile', 'maaneskinn']);

const pitches = (ev: BarEvent): number[] => ev.type === 'rest' ? [] : ev.type === 'chord' ? ev.midis : [ev.midi];
const fingers = (ev: BarEvent): number[] => ev.type === 'rest' ? [] : ev.f.split(' ').map(Number);

describe.each(songs.map(s => [s.id, s] as const))('%s', (_id, song) => {
  const len = barLength(song.meter);
  const used = new Set<string>(), usedLh = new Set<string>();
  song.sections.forEach(sec => sec.groups.forEach(g => g.bars.forEach(([rh, lh]) => { used.add(rh); if (lh) usedLh.add(lh); })));
  /** Alle takter som brukes, stemme for stemme: hovedstemmen og den ekstra stemmen (`upper`) i hver hånd. */
  const voices: { where: string; hand: Hand; events: BarEvent[] }[] = [
    ...[...used].map(k => ({ where: `høyre ${k}`, hand: 'rh' as Hand, events: song.bars[k] ?? [] })),
    ...[...usedLh].map(k => ({ where: `venstre ${k}`, hand: 'lh' as Hand, events: song.lh[k] ?? [] })),
    ...[...used].flatMap(k => song.upper?.rh?.[k] ? [{ where: `høyre ${k} øverst`, hand: 'rh' as Hand, events: song.upper.rh[k] }] : []),
    ...[...usedLh].flatMap(k => song.upper?.lh?.[k] ? [{ where: `venstre ${k} øverst`, hand: 'lh' as Hand, events: song.upper.lh[k] }] : [])
  ];
  const pitchesIn = (hand: Hand): number[] => voices.filter(v => v.hand === hand).flatMap(v => v.events.flatMap(pitches));

  it('standardtempo kan stilles inn med glidebryteren (50–220, steg på 5)', () => {
    song.sections.forEach(sec => { expect(sec.tempo % 5, sec.id).toBe(0); expect(sec.tempo).toBeGreaterThanOrEqual(50); expect(sec.tempo).toBeLessThanOrEqual(220); });
  });

  it('har kjent toneart og taktart', () => {
    expect(isKnownKey(song.key), song.key).toBe(true);
    expect([2, 3, 4, 6, 9, 12]).toContain(song.meter.beats);
    expect([2, 4, 8]).toContain(song.meter.unit);
  });

  it('alle takter som brukes, finnes og fyller taktarten', () => {
    // Trioler gir tredjedeler, så summen sammenlignes med litt slingringsmonn
    used.forEach(k => expect(song.bars[k], `høyre ${k}`).toBeDefined());
    usedLh.forEach(k => expect(song.lh[k], `venstre ${k}`).toBeDefined());
    voices.forEach(v => expect(v.events.reduce((s, ev) => s + ev.d, 0), v.where).toBeCloseTo(len, 9));
  });

  it('trioler kommer i hele grupper på tre og starter på en hel åttendedel', () => {
    const check = (events: BarEvent[], where: string) => {
      let pos = 0;
      events.forEach((ev, i) => {
        if (ev.triplet?.first) {
          const group = events.slice(i, i + 3);
          expect(group.every(g => g.triplet && g.triplet.written === ev.triplet!.written), where).toBe(true);
          expect(group.filter(g => g.triplet?.first), where).toHaveLength(1);
          expect(Math.abs(pos * 4 - Math.round(pos * 4)), `${where}: triolen starter midt i en 32-del`).toBeLessThan(1e-9);
        }
        pos += ev.d;
      });
      const n = events.filter(ev => ev.triplet).length;
      expect(n % 3, where).toBe(0);
    };
    voices.forEach(v => check(v.events, v.where));
  });

  it('fingre er 1–5, én per tone, og følger tonehøyden', () => {
    const check = (events: BarEvent[], hand: Hand, key: string) => events.forEach(ev => {
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
    voices.forEach(v => check(v.events, v.hand, v.where));
  });

  it.skipIf(HANDS_CROSS.has(song.id))('høyre hånd fra midtre C og opp, venstre under (MIDI skiller hendene der)', () => {
    pitchesIn('rh').forEach(m => expect(m, 'høyre').toBeGreaterThanOrEqual(60));
    pitchesIn('lh').forEach(m => expect(m, 'venstre').toBeLessThan(60));
  });

  it('notearket får én note per tone i hver stemme, del og hånd (samme kobling som sheet.ok)', () => {
    const notesIn = (abc: string, staff: number, voice: number): number => {
      const tune = abcjs.parseOnly(abc)[0];
      expect(tune.warnings ?? [], abc.slice(0, 300)).toEqual([]);
      return tune.lines.reduce((n, line) => n + (line.staff?.[staff]?.voices?.[voice] ?? [])
        .filter(el => el.el_type === 'note' && !(el as { rest?: unknown }).rest).length, 0);
    };
    const count = (bars: { items: { type: string }[] }[] | null) => (bars ?? []).reduce((n, b) => n + b.items.filter(it => it.type !== 'rest').length, 0);
    const check = (abc: string, m: ReturnType<typeof build>, h: Hand, staff: number, where: string) => {
      expect(notesIn(abc, staff, 0), where).toBe(count(m.staffs[h]));
      expect(notesIn(abc, staff, 1), `${where}, stemme 2`).toBe(count(m.uppers[h]));
    };
    song.sections.forEach(sec => {
      (['rh', 'lh', 'both'] as PracticeHand[]).forEach(hand => {
        const m = build(song, sec, hand);
        const where = `${sec.id} ${hand}`;
        if (hand === 'both') {
          const abc = toAbc(m, 4, true);
          check(abc, m, 'rh', 0, where);
          check(abc, m, 'lh', 1, where);
        } else {
          if (!m.uppers[hand]) expect(count(m.staffs[hand]), where).toBe(m.steps.length);
          check(toAbc(m, 4, false), m, hand, 0, where);
          check(toAbc(m, 2, true), m, hand, hand === 'lh' ? 1 : 0, `${where} + andre hånd`);
        }
      });
    });
  });

  it.skipIf(!song.upper)('ekstra stemme: til takter som finnes, ikke samme tone som hovedstemmen samtidig, og fingrene på plass', () => {
    (['rh', 'lh'] as Hand[]).forEach(h => Object.keys(song.upper?.[h] ?? {}).forEach(k => {
      expect((h === 'rh' ? song.bars : song.lh)[k], `${h} ${k}`).toBeDefined();
    }));
    const tones = (it: { type: string; midi?: number; midis?: number[]; f?: string }) =>
      it.type === 'rest' ? [] : (it.type === 'chord' ? it.midis! : [it.midi!]).map((m, i) => ({ m, f: Number(it.f!.split(' ')[i]) }));
    song.sections.forEach(sec => (['rh', 'lh'] as Hand[]).forEach(h => {
      const m = build(song, sec, h);
      const uppers = m.uppers[h];
      if (!uppers) return;
      m.staffs[h].forEach((bar, i) => bar.items.forEach(it => {
        const where = `${sec.id} ${h} takt ${i + 1} plass ${it.pos - bar.start}`;
        uppers[i].items.forEach(u => {
          if (u.type === 'rest' || u.pos > it.pos || it.pos >= u.pos + u.d) return;
          tones(u).forEach(o => tones(it).forEach(t => {
            // Samme tone som slås an samtidig, står bare i hovedstemmen
            if (u.pos === it.pos) expect(t.m, `${where}: samme tone i begge stemmene`).not.toBe(o.m);
            // Under en tone den ekstra stemmen holder, brukes fingrene på den andre siden, eller samme finger på samme tangent
            if (t.m === o.m) expect(t.f, `${where}: samme tangent`).toBe(o.f);
            else if (t.m < o.m) expect(h === 'rh' ? t.f < o.f : t.f > o.f, `${where}: finger ${t.f} under ${o.f}`).toBe(true);
          }));
        });
      }));
      // Toner som slås an samtidig i begge stemmene: fingrene følger tonehøyden, som i en akkord
      m.steps.forEach(s => {
        const f = tones(s);
        for (let j = 1; j < f.length; j++) expect(h === 'rh' ? f[j].f > f[j - 1].f : f[j].f < f[j - 1].f, `${sec.id} ${h} ${s.sci}: fingre ${s.f}`).toBe(true);
      });
    }));
  });

  it('alle toner finnes på Casio CT-S400 (C2–C7, eller C1–C6 med oktav −1 i Casio-oppsettet)', () => {
    const shift = 12 * (song.casio?.octave ?? 0), lo = 36 + shift, hi = 96 + shift;
    voices.forEach(v => v.events.flatMap(pitches).forEach(m => { expect(m, v.where).toBeGreaterThanOrEqual(lo); expect(m, v.where).toBeLessThanOrEqual(hi); }));
  });

  it('Casio-forslaget bruker kjente lyder, og split passer med splittpunktet F♯3', () => {
    const c = song.casio;
    if (!c) return;
    [c.tone, c.layer, c.lower].filter((n): n is number => n != null).forEach(n => expect(CT_S400_TONES[n], `lyd ${n}`).toBeDefined());
    if (c.reg) {
      expect(c.reg[0]).toBeGreaterThanOrEqual(1); expect(c.reg[0]).toBeLessThanOrEqual(8);
      expect(c.reg[1]).toBeGreaterThanOrEqual(1); expect(c.reg[1]).toBeLessThanOrEqual(4);
    }
    if (!c.lower) return;
    pitchesIn('lh').forEach(m => expect(m, 'venstre under F♯3').toBeLessThan(54));
    pitchesIn('rh').forEach(m => expect(m, 'høyre fra F♯3').toBeGreaterThanOrEqual(54));
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

it('ingen låter deler registreringsplass på keyboardet', () => {
  const regs = songs.flatMap(s => s.casio?.reg ? [s.casio.reg.join('-')] : []);
  expect(new Set(regs).size).toBe(regs.length);
});

it('id-ene til delene er unike på tvers av låter', () => {
  const ids = songs.flatMap(s => s.sections.map(sec => sec.id));
  expect(new Set(ids).size).toBe(ids.length);
});
