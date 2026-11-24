import abcjs from 'abcjs';
import { describe, expect, it } from 'vitest';
import { N, R, T3, build, e, ed, h, q, s16, type PracticeHand, type Song } from '../music/song';
import { findSection } from '../songs';
import { abcDur, abcNote, keyAccidentals, lineRanges, staffClefs, toAbc, trillUpper } from './abc';

const model = (id: string, hand: PracticeHand = 'rh') => { const { song, sec } = findSection(id); return build(song, sec, hand); };

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

describe('abcDur', () => {
  it('skriver varigheter i åttedeler som ABC-lengder', () => {
    expect([1, 0.5, 0.25, 0.75, 1.5, 2, 3, 2.5, 3.5, 6].map(abcDur)).toEqual(['', '/', '//', '3/4', '3/2', '2', '3', '5/2', '7/2', '6']);
  });
});

describe('trillUpper', () => {
  it('tonen et trinn over i tonearten', () => {
    expect(trillUpper(77, 'C')).toBe(79); // F5 → G5
    expect(trillUpper(71, 'C')).toBe(72); // B4 → C5
    expect(trillUpper(76, 'G')).toBe(78); // E5 → F♯5 i G-dur
    expect(trillUpper(73, 'C')).toBe(75); // C♯5 er ikke i skalaen: et helt trinn opp
  });
});

describe('keyAccidentals', () => {
  it('gir faste fortegn i riktig rekkefølge', () => {
    expect(keyAccidentals('Am')).toEqual({});
    expect(keyAccidentals('D')).toEqual({ F: 1, C: 1 });
    expect(keyAccidentals('Cm')).toEqual({ B: -1, E: -1, A: -1 });
  });
});

describe('toAbc', () => {
  it('del A, to takter per linje', () => {
    expect(toAbc(model('delA'), 2, false)).toBe([
      'X:1', 'M:4/4', 'L:1/8', 'K:Am', '%%barnumbers 0',
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
    expect(abc).toContain('"^Sluttakkord"!1!!2!!3!!5![Acea]2 z2 z4 |]');
    expect(toAbc(model('riktig'), 4, false)).toContain('!1!!2!!3!!5![CEGc]6');
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

  it('venstre hånd alene: bassnøkkel, fingersetting og tonenavn på kvintene', () => {
    const abc = toAbc(model('delA', 'lh'), 2, false).split('\n');
    expect(abc[3]).toBe('K:Am clef=bass');
    expect(abc[5]).toBe('"^Del A"!5!!1![A,,E,]2 !5!!1![A,,E,]2 !5!!1![A,,E,]2 !5!!1![A,,E,]2 | !5!!1![A,,E,]2 !5!!1![A,,E,]2 !5!!1![A,,E,]2 !5!!1![A,,E,]2 |');
    expect(abc[6]).toBe('w: A+E A+E A+E A+E | A+E A+E A+E A+E');
  });

  it('venstre hånd med høyre hånd vist: høyre øverst uten fingre, tonenavn under venstre', () => {
    const abc = toAbc(model('riktig', 'lh'), 4, true).split('\n');
    expect(abc.slice(5, 8)).toEqual(['%%score {RH LH}', 'V:RH clef=treble', 'V:LH clef=bass']);
    expect(abc[8]).toBe('[V:RH] C/E/G/c/ [CEGc]6 |]');
    expect(abc[9]).toBe('[V:LH] "^Riktig svar – fanfare"z2 !5!!1![C,,C,]6 |]');
    expect(abc[10]).toBe('w: C+C');
  });

  it('begge hender: begge systemer med fingre og tonenavn, etiketten bare øverst', () => {
    const abc = toAbc(model('riktig', 'both'), 4, false).split('\n');
    expect(abc.slice(5, 8)).toEqual(['%%score {RH LH}', 'V:RH clef=treble', 'V:LH clef=bass']);
    expect(abc[8]).toBe('[V:RH] "^Riktig svar – fanfare"!1!C/!2!E/!3!G/!5!c/ !1!!2!!3!!5![CEGc]6 |]');
    expect(abc[9]).toBe('w: C E G C C');
    expect(abc[10]).toBe('[V:LH] z2 !5!!1![C,,C,]6 |]');
    expect(abc[11]).toBe('w: C+C');
  });

  it('begge hender: venstre hånds fingre vises bare når de endrer seg, og i starten av linjen', () => {
    const lines = toAbc(model('delA', 'both'), 2, false).split('\n').filter(l => l.startsWith('[V:LH]'));
    expect(lines[0]).toBe('[V:LH] !5!!1![A,,E,]2 [A,,E,]2 [A,,E,]2 [A,,E,]2 | [A,,E,]2 [A,,E,]2 [A,,E,]2 [A,,E,]2 |');
    expect(lines[1].startsWith('[V:LH] !5!!1![A,,E,]2 [A,,E,]2')).toBe(true);
  });

  it('taktnummer først på hver linje, og fra riktig takt når delen begynner midt i stykket', () => {
    expect(toAbc(model('delA'), 2, false).split('\n')).toContain('%%barnumbers 0');
    expect(toAbc(model('delA'), 2, false)).not.toContain('%%setbarnb');
    const { song, sec } = findSection('hele');
    const abc = toAbc(build(song, { ...sec, firstBar: 5 }), 2, false).split('\n');
    expect(abc.slice(4, 7)).toEqual(['%%barnumbers 0', '%%sep 0 0 0', '%%setbarnb 5']);
  });

  it('toneart og taktart fra låten, og fortegn ut fra tonearten', () => {
    const abc = toAbc(model('intro'), 4, false);
    expect(abc).toContain('M:4/4');
    expect(abc).toContain('K:F');
  });

  it('trioler: triolmerke foran første tone, varighetene som i noten, og bjelke per triol', () => {
    const abc = toAbc(model('elise-arpeggio'), 2, false);
    expect(abc).toContain('(3!1!A,/!2!C/!3!E/ (3!1!A/!2!c/!5!e/ (3!4!d/!3!c/!2!B/');
  });

  it('triller og forslagsnoter vises i notearket', () => {
    // Mozart takt 4: trille på F5. Takt 22–23: forslagsnoter foran C5, E5 og A5, og trille med forslag på A5 i takt 25.
    expect(toAbc(model('mozart-1'), 2, false)).toContain('!trill!f');
    const abc = toAbc(model('mozart-4'), 2, false);
    expect(abc).toContain('{B}c2');
    expect(abc).toContain('{^d}e2');
    expect(abc).toContain('!trill!{b}a8');
    // Fortegnet i forslaget gjelder ikke resten av takten: G♯ etter forslaget får sitt eget ♯
    expect(abc).toMatch(/\{\^g\}a3 !\d!b\/\/!\d!a\/\/!\d!\^g\/\//);
  });

  it('pause i en triol skrives inne i triolen', () => {
    // Måneskinnssonaten, takt 29: triolen på første slag begynner med en pause
    expect(toAbc(model('maane-5'), 2, false)).toMatch(/\(3z !\d!\^B,!\d!D /);
  });

  it('32-deler: bjelke per åttendedel, og punktert sekstendedel', () => {
    const abc = toAbc(model('elise-32'), 2, false);
    expect(abc).toContain('!1!c//!5!g//!1!G//!5!g// !1!A//!5!g//!2!B//!5!g// !1!c//!5!g//!2!d//!5!g//');
    expect(toAbc(model('elise-fdur'), 2, false)).toContain('!2!{FA}c2 !5!f3/4!4!e//');
  });

  it('venstre hånd bytter til diskantnøkkel i overgangen, og nøkkelen skrives igjen i starten av en ny linje', () => {
    const m = model('elise-mellomspill', 'both');
    expect(staffClefs(m.staffs.lh, 'bass')).toEqual(['bass', 'bass', 'bass', 'bass', 'bass', 'treble', 'treble', 'treble']);
    const lh = toAbc(m, 2, false).split('\n').filter(l => l.startsWith('[V:LH'));
    expect(lh[2]).toContain('| [K:clef=treble] ');
    expect(lh[3].startsWith('[V:LH clef=treble] ')).toBe(true);
  });

  it('nøkkelen settes på stemmen ved linjestart og gjelder til neste bytte, også for høyre hånd', () => {
    // Bach, takt 32–35: takt 33 ligger i bassnøkkel i høyre hånd, takt 34 tilbake i diskant
    const lines = toAbc(model('preludium-5', 'both'), 2, false).split('\n').filter(l => l.startsWith('[V:RH'));
    expect(lines.map(l => l.slice(0, l.indexOf(']') + 1))).toEqual(['[V:RH]', '[V:RH clef=bass]', '[V:RH clef=treble]']);
  });

  it('med ett system varer nøkkelen over linjeskift, og byttes bare ved taktstreken der den endrer seg', () => {
    const mine = toAbc(model('elise-mellomspill', 'lh'), 2, false);
    expect(mine.match(/\[K:clef=\w+\]/g)).toEqual(['[K:clef=treble]']);
    const changes = toAbc(model('elise-hele', 'lh'), 2, false).match(/\[K:clef=\w+\]/g) ?? [];
    expect(changes.length).toBeGreaterThan(4);
    changes.forEach((c, i) => expect(c).toBe(i % 2 ? '[K:clef=bass]' : '[K:clef=treble]'));
  });

  it('høyre hånd og vanlige låter blir i sin nøkkel', () => {
    expect(new Set(staffClefs(model('elise-hele').bars, 'treble'))).toEqual(new Set(['treble']));
    expect(toAbc(model('hele', 'both'), 4, false)).not.toContain('[K:clef=');
  });

  it('lange akkordnavn står bare når akkorden endrer seg i takten, korte som før', () => {
    const w = toAbc(model('chopin-1', 'lh'), 2, false).split('\n').filter(l => l.startsWith('w: '));
    expect(w[0]).toBe('w:  | G+B+E * * * * * * *');
    expect(toAbc(model('delA', 'lh'), 2, false)).toContain('w: A+E A+E A+E A+E | A+E A+E A+E A+E');
  });

  it('tette takter får færre takter per linje, vanlige takter som før', () => {
    expect(lineRanges(model('delA'), 2)).toEqual([[0, 2], [2, 4]]);
    // Takt 1 har 32-deler (12 toner): alene på linjen med to takter, to sammen med fire
    const m = model('elise-32');
    expect(lineRanges(m, 2).slice(0, 3)).toEqual([[0, 1], [1, 2], [2, 3]]);
    expect(lineRanges(m, 4)[0]).toEqual([0, 3]);
  });
});

describe('to stemmer i én hånd', () => {
  // Melodi over trioler, som i Måneskinn: punktert åttendedel og sekstendel mot triolene på andre slag
  const songWith = (sixteenth: string): Song => ({
    id: 'v', title: 'V', by: '', category: 'mine', key: 'C', meter: { beats: 2, unit: 4 },
    bars: { a: [...T3(N('G3', e, 1), N('C4', e, 2), N('E4', e, 3)), ...T3(N('G3', e, 1), N('C4', e, 2), N('E4', e, 3))] },
    lh: { a: [N('C3', h, 5)] },
    upper: { rh: { a: [R(q), N('G4', ed, 5), N(sixteenth, s16, 5)] } },
    sections: [{ id: 'v1', title: 'V', tempo: 60, groups: [{ label: 'V', bars: [['a', 'a']] }] }]
  });
  const abcOf = (hand: PracticeHand, other = false, sixteenth = 'A4') => {
    const song = songWith(sixteenth);
    return toAbc(build(song, song.sections[0], hand), 4, other);
  };

  it('den ekstra stemmen står i samme system med halsene opp, uten synlige pauser', () => {
    const abc = abcOf('rh').split('\n');
    expect(abc.slice(5, 8)).toEqual(['%%score (RH RH2)', 'V:RH clef=treble stem=down', 'V:RH2 clef=treble stem=up']);
    expect(abc[8]).toBe('[V:RH] (3"^V"!1!G,!2!C!3!E (3!1!!5!G,!2!C!3!E |]');
    expect(abc[10]).toBe('[V:RH2] x2 G3/2!5!A/ |]');
  });

  it('fingre og navn ved felles anslag står ved hovedstemmen, og den ekstra stemmen har navn der den slår an alene', () => {
    const abc = abcOf('rh').split('\n');
    expect(abc[9]).toBe('w: G C E G+G C E');
    expect(abc[11]).toBe('w: * * A');
  });

  it('en gjentatt tone i den ekstra stemmen står uten navn og finger, som gjentatte akkorder', () => {
    const abc = abcOf('rh', false, 'G4').split('\n');
    expect(abc[10]).toBe('[V:RH2] x2 G3/2G/ |]');
    expect(abc).toHaveLength(11);
  });

  it('abcjs setter navnet under riktig note, også når en pause står foran en note uten navn', () => {
    const notes = (abc: string, staff: number, voice: number) => abcjs.parseOnly(abc)[0].lines
      .flatMap(l => (l.staff?.[staff]?.voices?.[voice] ?? []) as { el_type: string; rest?: unknown; lyric?: { syllable: string }[] }[])
      .filter(el => el.el_type === 'note' && !el.rest).map(el => (el.lyric ?? []).map(l => l.syllable).join(''));
    expect(notes(abcOf('rh'), 0, 1)).toEqual(['', 'A']);
    // «Tiden er ute»: akkord, pause, samme akkord uten navn, pause, akkord
    expect(notes(toAbc(model('tidute'), 4, false), 0, 0)).toEqual(['B+F', '', 'B+F']);
  });

  it('begge hender: høyre hånds to stemmer i øverste system, venstre hånd under', () => {
    const abc = abcOf('both').split('\n');
    expect(abc.slice(5, 9)).toEqual(['%%score {(RH RH2) LH}', 'V:RH clef=treble stem=down', 'V:RH2 clef=treble stem=up', 'V:LH clef=bass']);
    expect(abc.filter(l => l.startsWith('[V:'))).toHaveLength(3);
  });

  it('venstre hånd med høyre hånd vist: begge stemmene i høyre hånd, uten fingre og navn', () => {
    const abc = abcOf('lh', true).split('\n');
    expect(abc).toContain('[V:RH] (3G,CE (3G,CE |]');
    expect(abc).toContain('[V:RH2] x2 G3/2A/ |]');
    expect(abc.filter(l => l.startsWith('w: '))).toEqual(['w: C']);
  });
});
