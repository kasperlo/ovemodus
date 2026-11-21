// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { build } from '../music/song';
import { toAbc } from '../notation/abc';
import { toSong } from './library';
import { ImportError, parseMusicXml, pitchName } from './musicxml';

const pitched = (step: string, alter: number, oct: number, dur: number, opts: { staff?: number; voice?: string; chord?: boolean; finger?: string; tie?: 'start' | 'stop' } = {}) => `
  <note>${opts.chord ? '<chord/>' : ''}<pitch><step>${step}</step>${alter ? `<alter>${alter}</alter>` : ''}<octave>${oct}</octave></pitch>
    <duration>${dur}</duration>${opts.tie ? `<tie type="${opts.tie}"/>` : ''}<voice>${opts.voice ?? '1'}</voice><staff>${opts.staff ?? 1}</staff>
    ${opts.finger ? `<notations><technical><fingering>${opts.finger}</fingering></technical></notations>` : ''}</note>`;
const rest = (dur: number, staff = 1, voice = '1') => `<note><rest/><duration>${dur}</duration><voice>${voice}</voice><staff>${staff}</staff></note>`;
const backup = (dur: number) => `<backup><duration>${dur}</duration></backup>`;

const score = (parts: string, title = 'Testlåt') => `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0"><work><work-title>${title}</work-title></work>
  <part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>${parts}</score-partwise>`;

// divisions = 2: en fjerdedel er 2, en åttendedel 1
const ATTR = (fifths = -1, beats = 4, type = 4, staves = 2) =>
  `<attributes><divisions>2</divisions><key><fifths>${fifths}</fifths></key><time><beats>${beats}</beats><beat-type>${type}</beat-type></time><staves>${staves}</staves></attributes>`;

const PIANO = score(`<part id="P1">
  <measure number="0" implicit="yes">${ATTR()}
    <direction><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>96</per-minute></metronome></direction-type></direction>
    ${pitched('C', 0, 5, 2, { finger: '3' })}${backup(2)}${rest(2, 2, '5')}
  </measure>
  <measure number="1">
    ${pitched('F', 0, 4, 4, { finger: '1' })}${pitched('A', 0, 4, 4, { chord: true, finger: '3' })}${pitched('C', 0, 5, 4, { chord: true, finger: '5' })}
    <note><grace/><pitch><step>D</step><octave>5</octave></pitch><voice>1</voice><staff>1</staff></note>
    ${pitched('B', -1, 4, 2)}${pitched('E', 0, 5, 2, { tie: 'start' })}
    ${backup(8)}${pitched('G', 0, 4, 8, { voice: '2' })}
    ${backup(8)}${pitched('F', 0, 2, 8, { staff: 2, voice: '5' })}
  </measure>
  <measure number="2">
    ${pitched('E', 0, 5, 2, { tie: 'stop' })}${pitched('D', 0, 5, 2)}${pitched('C', 0, 5, 4)}
    ${backup(8)}${pitched('C', 0, 3, 4, { staff: 2, voice: '5' })}${pitched('G', 0, 2, 4, { staff: 2, voice: '5' })}${pitched('C', 0, 3, 4, { staff: 2, voice: '5', chord: true })}
  </measure>
</part>`);

describe('pitchName', () => {
  it('lager tonenavn i appens format, også for dobbelte fortegn', () => {
    expect(pitchName('D', 1, 5)).toBe('D#5');
    expect(pitchName('B', -1, 4)).toBe('Bb4');
    expect(pitchName('F', 2, 4)).toBe('G4');
    expect(pitchName('B', 1, 3)).toBe('B#3');
  });
});

describe('parseMusicXml', () => {
  const s = parseMusicXml(PIANO, 'test.musicxml', 'mine-test');

  it('leser tittel, toneart, taktart og tempo', () => {
    expect(s).toMatchObject({ title: 'Testlåt', key: 'F', meter: { beats: 4, unit: 4 }, tempo: 95, fileName: 'test.musicxml' });
  });

  it('opptakt fylles med pauser foran, så første takt blir hel', () => {
    expect(s.rh[0]).toEqual([{ t: 'r', d: 6 }, { t: 'n', p: 'C5', d: 2, f: '3' }]);
    expect(s.lh[0]).toEqual([{ t: 'r', d: 6 }, { t: 'r', d: 2 }]);
  });

  it('akkorder med fingersetting, pyntenoter hoppes over, og andre stemmer ignoreres', () => {
    expect(s.rh[1]).toEqual([
      { t: 'c', p: ['F4', 'A4', 'C5'], d: 4, f: '1 3 5' },
      { t: 'n', p: 'Bb4', d: 2, f: '' },
      { t: 'n', p: 'E5', d: 2, f: '' }
    ]);
    expect(s.lh[1]).toEqual([{ t: 'n', p: 'F2', d: 8, f: '' }]);
  });

  it('en bundet fortsettelse blir pause, så hvert steg er et nytt anslag', () => {
    expect(s.rh[2]).toEqual([{ t: 'r', d: 2 }, { t: 'n', p: 'D5', d: 2, f: '' }, { t: 'n', p: 'C5', d: 4, f: '' }]);
    expect(s.lh[2]).toEqual([{ t: 'n', p: 'C3', d: 4, f: '' }, { t: 'c', p: ['G2', 'C3'], d: 4, f: '' }]);
  });

  it('blir en låt appen kan øve på, med noteark uten tomme fingertall', () => {
    const song = toSong(s);
    expect(song.category).toBe('mine');
    expect(song.sections.map(x => x.title)).toEqual(['Hele']);
    const m = build(song, song.sections[0], 'rh');
    expect(m.steps.map(x => x.type === 'chord' ? x.name : x.name)).toEqual(['C', 'F+A+C', 'B♭', 'E', 'D', 'C']);
    expect(m.split).toBe(60);
    const abc = toAbc(m, 4, true);
    expect(abc).toContain('K:F');
    expect(abc).not.toMatch(/(^|\s)!!/m); // ingen tomme fingertall foran noter uten fingersetting
    expect(abc).toContain('!1!!3!!5![FAc]4');
    expect(build(song, song.sections[0], 'lh').steps).toHaveLength(3);
  });

  it('lange stykker deles i deler på 16 takter', () => {
    const many = { ...s, rh: Array.from({ length: 40 }, () => s.rh[1]), lh: [] };
    expect(toSong(many).sections.map(x => x.title)).toEqual(['Hele', 'Takt 1–16', 'Takt 17–32', 'Takt 33–40']);
  });
});

describe('parseMusicXml: én stemme og flere stemmer', () => {
  it('melodi alene: venstre hånd blir tom', () => {
    const xml = score(`<part id="P1"><measure number="1">${ATTR(0, 3, 4, 1)}${pitched('G', 0, 4, 2)}${pitched('A', 0, 4, 2)}${pitched('B', 0, 4, 2)}</measure></part>`);
    const s = parseMusicXml(xml, 'melodi.xml', 'mine-m');
    expect(s.lh).toEqual([]);
    expect(s.meter).toEqual({ beats: 3, unit: 4 });
    expect(s.rh[0].map(e => e.t === 'n' && e.p)).toEqual(['G4', 'A4', 'B4']);
  });

  it('sang og piano: pianoet brukes', () => {
    const voice = `<part id="P0"><measure number="1">${ATTR(0, 4, 4, 1)}${pitched('E', 0, 5, 8)}</measure></part>`;
    const piano = `<part id="P1"><measure number="1">${ATTR(0, 4, 4, 2)}${pitched('C', 0, 5, 8)}${backup(8)}${pitched('C', 0, 3, 8, { staff: 2, voice: '5' })}</measure></part>`;
    const s = parseMusicXml(score(voice + piano), 'sang.xml', 'mine-s');
    expect(s.rh[0]).toEqual([{ t: 'n', p: 'C5', d: 8, f: '' }]);
    expect(s.lh[0]).toEqual([{ t: 'n', p: 'C3', d: 8, f: '' }]);
  });

  it('moll-toneart', () => {
    const xml = score(`<part id="P1"><measure number="1"><attributes><divisions>1</divisions><key><fifths>-3</fifths><mode>minor</mode></key><time><beats>4</beats><beat-type>4</beat-type></time></attributes>${pitched('C', 0, 5, 4)}</measure></part>`);
    expect(parseMusicXml(xml, 'm.xml', 'mine-x').key).toBe('Cm');
  });
});

describe('parseMusicXml: det som ikke støttes, gir en tydelig melding', () => {
  const expectError = (xml: string, msg: RegExp) => {
    expect(() => parseMusicXml(xml, 'f.xml', 'mine-e')).toThrow(ImportError);
    expect(() => parseMusicXml(xml, 'f.xml', 'mine-e')).toThrow(msg);
  };

  it('trioler', () => {
    const trip = (step: string) => `<note><pitch><step>${step}</step><octave>5</octave></pitch><duration>2</duration><time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification><voice>1</voice><staff>1</staff></note>`;
    const xml = score(`<part id="P1"><measure number="7"><attributes><divisions>3</divisions><time><beats>2</beats><beat-type>4</beat-type></time></attributes>${trip('C')}${trip('D')}${trip('E')}${pitched('F', 0, 5, 3)}</measure></part>`);
    expectError(xml, /Takt 7 har trioler/);
  });

  it('taktartskifte', () => {
    const xml = score(`<part id="P1"><measure number="1">${ATTR(0, 4, 4, 1)}${pitched('C', 0, 5, 8)}</measure>
      <measure number="2"><attributes><time><beats>3</beats><beat-type>4</beat-type></time></attributes>${pitched('C', 0, 5, 6)}</measure></part>`);
    expectError(xml, /Taktarten skifter i takt 2/);
  });

  it('noe som ikke er MusicXML', () => {
    expectError('<html><body>hei</body></html>', /ikke MusicXML/);
    expectError('ikke xml i det hele tatt', /kunne ikke leses/);
  });

  it('ingen toner', () => {
    expectError(score(`<part id="P1"><measure number="1">${ATTR(0, 4, 4, 1)}${rest(8)}</measure></part>`), /Fant ingen toner/);
  });
});

