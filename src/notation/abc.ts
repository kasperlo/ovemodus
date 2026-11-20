import type { Bar, Meter, Model } from '../music/song';
import { beamGroup } from '../music/song';

export function abcNote(midi: number, name: string): { s: string; alt: number; key: string } {
  const letter = name[0];
  const alt = name.includes('♯') ? 1 : name.includes('♭') ? -1 : 0;
  const oct = Math.floor((midi - alt) / 12) - 1;
  let s = oct >= 5 ? letter.toLowerCase() : letter;
  if (oct >= 6) s += "'".repeat(oct - 5);
  if (oct <= 3) s += ','.repeat(4 - oct);
  return { s, alt, key: letter + oct };
}

/** Varighet i åttedeler til ABC med L:1/8. */
export const abcDur = (d: number): string => d === 1 ? '' : d === 0.5 ? '/' : String(d);

/** Antall faste fortegn: positivt for ♯, negativt for ♭. */
const KEY_SIG: Record<string, number> = {
  C: 0, Am: 0, G: 1, Em: 1, D: 2, Bm: 2, A: 3, 'F#m': 3, E: 4, 'C#m': 4,
  F: -1, Dm: -1, Bb: -2, Gm: -2, Eb: -3, Cm: -3, Ab: -4, Fm: -4, Db: -5, Bbm: -5
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

interface Voice {
  /** Fingersetting, tonenavn under og etiketter som «Del A». Bare for hånden man øver på. */
  annotate: boolean;
}

/**
 * Én takt i ABC. Fortegn regnes per tonenavn og nullstilles ved taktstrek, med tonearten som utgangspunkt,
 * så en tone får ♮ når den skal være uten fortegn som tonearten eller takten ellers ville gitt.
 */
function barAbc(bar: Bar, sig: Record<string, number>, meter: Meter, voice: Voice): { music: string; lyr: string } {
  const acc: Record<string, number> = { ...sig }, toks: string[] = [], lyr: string[] = [];
  const group = beamGroup(meter);
  const note = (midi: number, name: string): string => {
    const n = abcNote(midi, name);
    const letter = name[0];
    const cur = acc[letter] ?? 0;
    acc[letter] = n.alt;
    return (n.alt === cur ? '' : n.alt === 1 ? '^' : n.alt === -1 ? '_' : '=') + n.s;
  };
  let prevBeam = false;
  bar.items.forEach((it, idx) => {
    const p = it.pos - bar.start;
    const beam = it.type !== 'rest' && it.d < 2;
    let t = voice.annotate && idx === 0 && bar.label ? `"^${bar.label}"` : '';
    if (it.type === 'rest') {
      t += 'z' + abcDur(it.d);
    } else if (it.type === 'chord') {
      // abcjs stabler fingersettingen nedenfra, så fingeren til den dypeste tonen står nærmest akkorden
      if (voice.annotate) t += it.f.split(' ').map(f => `!${f}!`).join('');
      t += '[' + it.midis.map((m, i) => note(m, it.names[i])).join('') + ']' + abcDur(it.d);
      if (voice.annotate) lyr.push(it.short || it.name);
    } else {
      if (voice.annotate) t += `!${it.f}!`;
      t += note(it.midi, it.name) + abcDur(it.d);
      if (voice.annotate) lyr.push(it.name);
    }
    const joined = idx > 0 && beam && prevBeam && p % group !== 0;
    toks.push(idx === 0 || joined ? t : ' ' + t);
    prevBeam = beam;
  });
  return { music: toks.join(''), lyr: lyr.join(' ') };
}

/**
 * Lager ABC for notearket av samme data som dømmingen bruker. Hånden man øver på får fingersetting over
 * og tonenavn under. Den andre hånden vises bare når `showOther` er på, alltid som et vanlig pianosystem
 * (høyre hånd øverst).
 */
export function toAbc(model: Model, perLine: number, showOther: boolean): string {
  const { song, hand } = model;
  const sig = keyAccidentals(song.key);
  const out = ['X:1', `M:${song.meter.beats}/${song.meter.unit}`, 'L:1/8', `K:${song.key}` + (hand === 'lh' && !showOther ? ' clef=bass' : '')];
  if (showOther) out.push('%%score {RH LH}', 'V:RH clef=treble', 'V:LH clef=bass');
  for (let i = 0; i < model.bars.length; i += perLine) {
    const end = i + perLine >= model.bars.length ? ' |]' : ' |';
    const mine = model.bars.slice(i, i + perLine).map(b => barAbc(b, sig, song.meter, { annotate: true }));
    const music = mine.map(r => r.music).join(' | ') + end;
    const lyr = 'w: ' + mine.map(r => r.lyr).join(' | ');
    if (!showOther) { out.push(music, lyr); continue; }
    const theirs = model.other.slice(i, i + perLine).map(b => barAbc(b, sig, song.meter, { annotate: false }).music).join(' | ') + end;
    if (hand === 'rh') out.push('[V:RH] ' + music, lyr, '[V:LH] ' + theirs);
    else out.push('[V:RH] ' + theirs, '[V:LH] ' + music, lyr);
  }
  return out.join('\n');
}
