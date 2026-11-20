import { describe, expect, it } from 'vitest';
import { build } from '../music/song';
import { dovregubben } from '../songs/dovregubben';
import { abcNote, toAbc } from './abc';

const model = (id: string) => build(dovregubben, dovregubben.sections.find(s => s.id === id)!);

describe('abcNote', () => {
  it('skriver oktaver med store/små bokstaver, komma og apostrof', () => {
    expect(abcNote(60, 'C').s).toBe('C');
    expect(abcNote(72, 'C').s).toBe('c');
    expect(abcNote(84, 'C').s).toBe("c'");
    expect(abcNote(48, 'C').s).toBe('C,');
    expect(abcNote(33, 'A').s).toBe('A,,,');
  });

  it('regner oktaven fra tonen uten fortegn, så B♯/C♭-grenser blir riktige', () => {
    expect(abcNote(70, 'B♭')).toEqual({ s: 'B', alt: -1, key: 'B4' });
    expect(abcNote(75, 'D♯')).toEqual({ s: 'd', alt: 1, key: 'D5' });
  });
});

describe('toAbc', () => {
  it('del A, to takter per linje', () => {
    expect(toAbc(model('delA'), 2, false)).toBe([
      'X:1', 'M:4/4', 'L:1/8', 'K:Am',
      '"^Del A"!1!A!2!B!3!c!4!d !5!e!3!c !5!e2 | !4!^d!2!B !4!d2 !4!=d!2!_B !4!d2 |',
      'w: A B C D E C E | D♯ B D♯ D B♭ D',
      '!1!A!2!B!3!c!1!d !2!e!1!c!2!e!5!a | !4!g!2!e!1!c!2!e !4!g4 |]',
      'w: A B C D E C E A | G E C E G',
    ].join('\n'));
  });

  it('fortegn gjelder ut takten og nullstilles med ♮', () => {
    const abc = toAbc(model('delA'), 4, false);
    expect(abc).toContain('!4!^d!2!B !4!d2 !4!=d!2!_B');
  });

  it('akkorder og pauser', () => {
    const abc = toAbc(model('hele'), 4, false);
    expect(abc).toContain('"^Sluttakkord"[Acea]2 z2 z4 |]');
    expect(toAbc(model('riktig'), 4, false)).toContain('[CEGc]6');
  });

  it('har like mange tonenavn under arket som steg', () => {
    for (const id of ['delA', 'delB', 'hele', 'riktig', 'feil']) {
      const m = model(id);
      const words = toAbc(m, 4, false).split('\n').filter(l => l.startsWith('w: '))
        .flatMap(l => l.slice(3).split(/\s+/)).filter(w => w && w !== '|');
      expect(words, id).toHaveLength(m.steps.length);
    }
  });

  it('venstre hånd som egen stemme i bassnøkkel', () => {
    const abc = toAbc(model('delA'), 4, true);
    expect(abc).toContain('%%score {RH LH}');
    expect(abc).toContain('V:LH clef=bass');
    expect(abc).toContain('[V:LH] [A,,E,]2 [A,,E,]2 [A,,E,]2 [A,,E,]2 |');
  });

  it('fyller ut venstre hånd med pauser', () => {
    const abc = toAbc(model('riktig'), 4, true);
    expect(abc).toContain('[V:LH] z2 [C,,C,]6 |]');
  });
});
