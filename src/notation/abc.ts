import type { Bar, Hand, Item, Meter, Model, Step } from '../music/song';
import { beamGroup, mergeTones } from '../music/song';
import { parsePitch } from '../music/theory';

export type Clef = 'treble' | 'bass';

export function abcNote(midi: number, name: string): { s: string; alt: number; key: string } {
  const letter = name[0];
  const alt = name.includes('♯') ? 1 : name.includes('♭') ? -1 : 0;
  const oct = Math.floor((midi - alt) / 12) - 1;
  let s = oct >= 5 ? letter.toLowerCase() : letter;
  if (oct >= 6) s += "'".repeat(oct - 5);
  if (oct <= 3) s += ','.repeat(4 - oct);
  return { s, alt, key: letter + oct };
}

/** Varighet i åttedeler til ABC med L:1/8, for eksempel 1,5 → «3/2» (punktert åttendedel) og 0,5 → «/». */
export function abcDur(d: number): string {
  if (d === 1) return '';
  if (Number.isInteger(d)) return String(d);
  for (const den of [2, 4]) {
    const num = d * den;
    if (Number.isInteger(num)) return num === 1 ? '/'.repeat(den / 2) : `${num}/${den}`;
  }
  throw new Error(`Varighet som ikke kan skrives i ABC: ${d}`);
}

/** Antall faste fortegn: positivt for ♯, negativt for ♭. */
const KEY_SIG: Record<string, number> = {
  C: 0, Am: 0, G: 1, Em: 1, D: 2, Bm: 2, A: 3, 'F#m': 3, E: 4, 'C#m': 4, B: 5, 'G#m': 5, 'F#': 6, 'D#m': 6, 'C#': 7, 'A#m': 7,
  F: -1, Dm: -1, Bb: -2, Gm: -2, Eb: -3, Cm: -3, Ab: -4, Fm: -4, Db: -5, Bbm: -5, Gb: -6, Ebm: -6, Cb: -7, Abm: -7
};

export const isKnownKey = (key: string): boolean => key in KEY_SIG;

/** Faste fortegn per tonenavn i en toneart, for eksempel `{ F: 1, C: 1 }` i D-dur. */
export function keyAccidentals(key: string): Record<string, number> {
  const n = KEY_SIG[key] ?? 0;
  const order = n >= 0 ? 'FCGDAEB' : 'BEADGCF';
  const out: Record<string, number> = {};
  for (let i = 0; i < Math.abs(n); i++) out[order[i]] = Math.sign(n);
  return out;
}

const pitchesIn = (bar: Bar): number[] => bar.items.flatMap(it => it.type === 'rest' ? [] : it.type === 'chord' ? it.midis : [it.midi]);

/**
 * Nøkkelen for hver takt i ett notesystem. Venstre hånd bytter til diskantnøkkel når takten i snitt ligger fra E4 og
 * opp, og tilbake under midtre C. Høyre hånd bytter til bassnøkkel under A3 og tilbake fra midtre C. Avstanden mellom
 * grensene hindrer at nøkkelen bytter for hver takt. Takter uten toner beholder nøkkelen. `upper` er den ekstra
 * stemmen i samme system, som teller med.
 */
export function staffClefs(bars: Bar[], home: Clef, upper?: Bar[] | null): Clef[] {
  let cur = home;
  return bars.map((b, i) => {
    const ms = [...pitchesIn(b), ...(upper?.[i] ? pitchesIn(upper[i]) : [])];
    if (!ms.length) return cur;
    const mean = ms.reduce((a, m) => a + m, 0) / ms.length;
    if (home === 'bass') cur = cur === 'bass' ? (mean >= 64 ? 'treble' : 'bass') : (mean < 60 ? 'bass' : 'treble');
    else cur = cur === 'treble' ? (mean < 57 ? 'bass' : 'treble') : (mean >= 60 ? 'treble' : 'bass');
    return cur;
  });
}

export const homeClef = (h: Hand): Clef => h === 'lh' ? 'bass' : 'treble';

/** Tonen et trinn over i tonearten, som en trille veksler med: et halvt eller helt trinn opp. */
export function trillUpper(m: number, key: string): number {
  const acc = keyAccidentals(key);
  const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((l, i) => ([0, 2, 4, 5, 7, 9, 11][i] + (acc[l] ?? 0) + 12) % 12);
  const at = scale.indexOf(((m % 12) + 12) % 12);
  if (at < 0) return m + 2;
  return m + ((scale[(at + 1) % 7] - (((m % 12) + 12) % 12) + 12) % 12 || 12);
}

interface Voice {
  /** Fingersetting og tonenavn under. For hånden man øver på (begge når man øver begge). */
  annotate: boolean;
  /** Etiketter som «Del A». Bare på én stemme, så de ikke står to ganger. */
  label: boolean;
  /**
   * Vis fingersetting bare når den endrer seg (og i starten av linjen). Brukes for venstre hånd når man øver
   * begge hender, der samme kvint med 5 og 1 ellers står over hver eneste note mellom systemene.
   */
  sparse?: { prev: string };
  /** Den ekstra stemmen i en hånd (`Model.uppers`). Pausene i den vises ikke, så de ikke står oppå hovedstemmen. */
  upper?: boolean;
}

/** Fingre og navn ved en tone der begge stemmene i hånden slår an samtidig. */
interface Shown {
  f: string;
  label: string;
  chord: boolean;
}

const isNote = (it: Item): it is Step => it.type !== 'rest';

/**
 * Toner som slås an samtidig i begge stemmene i en takt. Fingrene og navnet for alle tonene står ved hovedstemmen,
 * som for en akkord, så de ikke står oppå hverandre. Den ekstra stemmen får ingen der (`null`).
 */
function sharedAt(main: Bar, upper: Bar): { main: Map<number, Shown>; upper: Map<number, null> } {
  const out = { main: new Map<number, Shown>(), upper: new Map<number, null>() };
  const above = new Map(upper.items.filter(isNote).map(it => [it.pos, it]));
  main.items.filter(isNote).forEach(it => {
    const o = above.get(it.pos);
    if (!o) return;
    const all = mergeTones([it, o]);
    out.main.set(it.pos, { f: all.f, label: all.type === 'chord' ? all.short || all.name : all.name, chord: all.type === 'chord' });
    out.upper.set(it.pos, null);
  });
  return out;
}

function showFingers(voice: Voice, f: string): boolean {
  if (!voice.annotate || !f) return false;
  if (!voice.sparse) return true;
  const changed = voice.sparse.prev !== f;
  voice.sparse.prev = f;
  return changed;
}

/**
 * Én takt i ABC. Fortegn regnes per tonenavn og nullstilles ved taktstrek, med tonearten som utgangspunkt,
 * så en tone får ♮ når den skal være uten fortegn som tonearten eller takten ellers ville gitt.
 * `shared` gir fingre og navn ved toner som slås an samtidig med den andre stemmen i hånden (se `sharedAt`).
 */
function barAbc(bar: Bar, sig: Record<string, number>, meter: Meter, voice: Voice, shared?: Map<number, Shown | null>): { music: string; lyr: string } {
  const acc: Record<string, number> = { ...sig }, toks: string[] = [];
  // Ett ord per note under arket, `null` for pauser. Akkordnavn står bare når akkorden endrer seg i takten, når navnet
  // er langt («G+B+E») eller akkordene er korte. Fjerdedelskvintene i Dovregubben («A+E») står som før. `*` er en
  // note uten tekst i ABC.
  const words: (string | null)[] = [];
  let prevChord = '';
  // Den ekstra stemmen: en tone som gjentar forrige tone med samme finger, står uten navn og finger, som gjentatte
  // akkorder. Sekstendelen etter en punktert åttendedel står så tett etter triolen under at navnene ellers flyter sammen.
  let prevNote: { midi: number; f: string } | null = null;
  const group = beamGroup(meter);
  // Forslagsnoter (`keep`) endrer ikke fortegnene for resten av takten, så hovednotene etter får sitt eget fortegn
  const note = (midi: number, name: string, keep = false): string => {
    const n = abcNote(midi, name);
    const letter = name[0];
    const cur = acc[letter] ?? 0;
    if (!keep) acc[letter] = n.alt;
    return (n.alt === cur ? '' : n.alt === 1 ? '^' : n.alt === -1 ? '_' : '=') + n.s;
  };
  let prevBeam = false, prevD = 0;
  bar.items.forEach((it, idx) => {
    const p = it.pos - bar.start;
    const triplet = it.triplet;
    // En triol skrives med varighetene som står i noten, og triolmerket foran første tone
    const d = triplet ? triplet.written : it.d;
    const beam = it.type !== 'rest' && d < 2;
    let t = (triplet?.first ? '(3' : '') + (voice.label && idx === 0 && bar.label ? `"^${bar.label}"` : '');
    if (it.type === 'rest') {
      t += (voice.upper ? 'x' : 'z') + abcDur(d);
      words.push(null);
    } else {
      const repeat = !!voice.upper && it.type === 'note' && prevNote?.midi === it.midi && prevNote.f === it.f;
      prevNote = it.type === 'note' ? { midi: it.midi, f: it.f } : null;
      const shown = shared?.has(it.pos) ? shared.get(it.pos) : repeat ? null : undefined;
      const f = shown === undefined ? it.f : shown?.f ?? '';
      // abcjs stabler fingersettingen nedenfra, så fingeren til den dypeste tonen står nærmest akkorden
      if (showFingers(voice, f)) t += f.split(' ').map(x => `!${x}!`).join('');
      if (it.type === 'chord') {
        t += '[' + it.midis.map((m, i) => note(m, it.names[i])).join('') + ']' + abcDur(d);
      } else {
        if (it.fermata) t += '!fermata!';
        if (it.trill) t += '!trill!';
        if (it.grace) t += '{' + it.grace.map(g => { const p = parsePitch(g); return note(p.midi, p.name, true); }).join('') + '}';
        t += note(it.midi, it.name) + abcDur(d);
      }
      const chord = shown === undefined ? it.type === 'chord' : !!shown?.chord;
      const label = shown === undefined ? (it.type === 'chord' ? it.short || it.name : it.name) : shown?.label ?? '*';
      words.push(chord && label === prevChord && (label.length > 3 || it.d < 2) ? '*' : label);
      prevChord = chord ? label : '';
    }
    // Trioler og 32-deler bjelkes per åttendedel, ellers blir bjelkene for lange til å lese
    const split = !!triplet?.first || (Number.isInteger(p) && (it.d < 0.5 || prevD < 0.5));
    const joined = idx > 0 && beam && prevBeam && p % group !== 0 && !split;
    toks.push(idx === 0 || joined ? t : ' ' + t);
    prevBeam = beam;
    prevD = it.d;
  });
  // abcjs 6.4.4 lar en pause bruke opp en `*` som står for tur, og da havner navnene etter under feil note. En pause
  // rett foran en note uten tekst får derfor sin egen `*`. Andre pauser hopper abcjs over.
  for (let i = words.length - 2; i >= 0; i--) if (words[i] === null && words[i + 1] === '*') words[i] = '*';
  const lyr = voice.annotate ? words.filter((w): w is string => w !== null) : [];
  return { music: toks.join(''), lyr: lyr.join(' ') };
}

/** Plassen en takt trenger under notene: én per tone, mer for lange akkordnavn som står (se `barAbc`). */
function barWidth(bar: Bar | undefined): number {
  let prev = '', n = 0;
  (bar?.items ?? []).forEach(it => {
    if (it.type === 'rest') return;
    const label = it.type === 'chord' ? it.short || it.name : '';
    n += label && !(label === prev && (label.length > 3 || it.d < 2)) ? Math.max(1, label.length / 3) : 1;
    prev = label;
  });
  return n;
}

/**
 * Taktene på hver linje som [fra, til). Høyst `perLine` takter, og færre når taktene er tette (i snitt mer enn ti
 * toner per takt, eller mange lange akkordnavn), ellers flyter tonenavnene under 32-deler og akkorder sammen.
 */
export function lineRanges(model: Model, perLine: number): [number, number][] {
  const width = (h: Hand, i: number): number => barWidth(model.staffs[h][i]) + barWidth(model.uppers[h]?.[i]);
  const notes = (i: number): number => Math.max(width('rh', i), width('lh', i));
  const budget = perLine * 10;
  const out: [number, number][] = [];
  let start = 0, sum = 0;
  for (let i = 0; i < model.bars.length; i++) {
    const n = notes(i);
    if (i > start && (i - start >= perLine || sum + n > budget)) { out.push([start, i]); start = i; sum = 0; }
    sum += n;
  }
  if (model.bars.length) out.push([start, model.bars.length]);
  return out;
}

const VOICE_NAME: Record<Hand, string> = { rh: 'RH', lh: 'LH' };

/**
 * Lager ABC for notearket av samme data som dømmingen bruker. Hånden man øver på får fingersetting over
 * og tonenavn under. Den andre hånden vises når `showOther` er på, og alltid når man øver begge hender,
 * som et vanlig pianosystem (høyre hånd øverst). En hånd med to stemmer (`Model.uppers`) får begge i samme system:
 * hovedstemmen med halsene ned (`RH`) og den ekstra stemmen med halsene opp (`RH2`).
 */
export function toAbc(model: Model, perLine: number, showOther: boolean): string {
  const { song, hand } = model;
  const sig = keyAccidentals(song.key);
  const two = hand === 'both' || showOther;
  const clefs = { rh: staffClefs(model.staffs.rh, 'treble', model.uppers.rh), lh: staffClefs(model.staffs.lh, 'bass', model.uppers.lh) };
  const mine: Hand = hand === 'lh' ? 'lh' : 'rh';
  const hands: Hand[] = two ? ['rh', 'lh'] : [mine];
  // Stemmer (V:) trengs med to notesystemer, og når hånden har to stemmer i samme system
  const voiced = two || !!model.uppers[mine];
  const out = ['X:1', `M:${song.meter.beats}/${song.meter.unit}`, 'L:1/8', `K:${song.key}` + (!voiced && clefs[mine][0] === 'bass' ? ' clef=bass' : '')];
  // Taktnummer først på hver linje, så man ser hvilke takter man velger når man øver på et utsnitt
  out.push('%%barnumbers 0');
  // abcjs 6.4.4 krasjer på %%setbarnb før første notelinje. En usynlig skillelinje (%%sep 0 0 0) først unngår det.
  if (model.firstBar !== 1) out.push('%%sep 0 0 0', `%%setbarnb ${model.firstBar}`);
  if (voiced) {
    const staff = (h: Hand): string => model.uppers[h] ? `(${VOICE_NAME[h]} ${VOICE_NAME[h]}2)` : VOICE_NAME[h];
    out.push(`%%score ${two ? `{${hands.map(staff).join(' ')}}` : staff(mine)}`);
    hands.forEach(h => {
      if (!model.uppers[h]) out.push(`V:${VOICE_NAME[h]} clef=${clefs[h][0]}`);
      else out.push(`V:${VOICE_NAME[h]} clef=${clefs[h][0]} stem=down`, `V:${VOICE_NAME[h]}2 clef=${clefs[h][0]} stem=up`);
    });
  }
  const voice = (h: Hand): Voice => ({ annotate: hand === h || hand === 'both', label: (hand === 'lh') === (h === 'lh') });
  // Nøkkelbytter i abcjs 6.4.4: med to systemer starter hver linje med stemmens nøkkel, og `[K:clef=…]` først på en
  // linje virker ikke for øverste stemme. Nøkkelen på stemmen (`[V:RH clef=…]`) settes derfor ved linjestart, og den
  // varer til den settes på nytt. Med ett system varer `[K:clef=…]` over linjeskift. To stemmer i samme system får
  // de samme nøkkelbyttene.
  const voiceClef: Record<string, Clef> = {};
  for (const [i, to] of lineRanges(model, perLine)) {
    const end = to >= model.bars.length ? ' |]' : ' |';
    const withClef = (h: Hand, r: { music: string; lyr: string }, k: number, j: number) => {
      const change = k > 0 && clefs[h][k] !== clefs[h][k - 1] && !(voiced && j === 0);
      return change ? { ...r, music: `[K:clef=${clefs[h][k]}] ${r.music}` } : r;
    };
    const line = (h: Hand) => {
      const v = { ...voice(h), sparse: hand === 'both' && h === 'lh' ? { prev: '' } : undefined };
      const up = model.uppers[h];
      const shared = model.staffs[h].slice(i, to).map((b, j) => up ? sharedAt(b, up[i + j]) : null);
      const main = model.staffs[h].slice(i, to).map((b, j) => withClef(h, barAbc(b, sig, song.meter, v, shared[j]?.main), i + j, j));
      const u: Voice = { annotate: v.annotate, label: false, upper: true };
      const upper = up?.slice(i, to).map((b, j) => withClef(h, barAbc(b, sig, song.meter, u, shared[j]?.upper), i + j, j));
      return { main, upper };
    };
    const music = (bars: { music: string }[]) => bars.map(r => r.music).join(' | ') + end;
    const lyr = (bars: { lyr: string }[]) => 'w: ' + bars.map(r => r.lyr).join(' | ');
    if (!voiced) {
      const bars = line(mine).main;
      out.push(music(bars), lyr(bars));
      continue;
    }
    const field = (h: Hand, name: string): string => {
      if (clefs[h][i] === (voiceClef[name] ?? clefs[h][0])) return `[V:${name}] `;
      voiceClef[name] = clefs[h][i];
      return `[V:${name} clef=${clefs[h][i]}] `;
    };
    hands.forEach(h => {
      const { main, upper } = line(h);
      const annotate = voice(h).annotate;
      out.push(field(h, VOICE_NAME[h]) + music(main));
      if (annotate) out.push(lyr(main));
      if (!upper) return;
      out.push(field(h, `${VOICE_NAME[h]}2`) + music(upper));
      // Bare toner som den ekstra stemmen slår an alene, har navn under
      if (annotate && upper.some(r => /[^*\s]/.test(r.lyr))) out.push(lyr(upper));
    });
  }
  return out.join('\n');
}
