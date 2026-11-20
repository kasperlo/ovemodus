import { SHARP, pc } from '../music/theory';
import type { Bar, LhEvent, Model } from '../music/song';

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

function rhBarAbc(bar: Bar): { music: string; lyr: string } {
  const acc: Record<string, number> = {}, toks: string[] = [], lyr: string[] = [];
  let prevBeam = false;
  bar.items.forEach((it, idx) => {
    const p = it.pos - bar.start;
    const beam = it.type !== 'rest' && it.d < 2;
    let t = idx === 0 && bar.label ? `"^${bar.label}"` : '';
    if (it.type === 'rest') {
      t += 'z' + abcDur(it.d);
    } else if (it.type === 'chord') {
      t += '[' + it.midis.map(m => abcNote(m, SHARP[pc(m)]).s).join('') + ']' + abcDur(it.d);
      lyr.push(it.short || it.name);
    } else {
      const n = abcNote(it.midi, it.name);
      const cur = acc[n.key] || 0;
      acc[n.key] = n.alt;
      t += `!${it.f}!` + (n.alt === cur ? '' : n.alt === 1 ? '^' : n.alt === -1 ? '_' : '=') + n.s + abcDur(it.d);
      lyr.push(it.name);
    }
    const joined = idx > 0 && beam && prevBeam && p % 4 !== 0;
    toks.push(idx === 0 || joined ? t : ' ' + t);
    prevBeam = beam;
  });
  return { music: toks.join(''), lyr: lyr.join(' ') };
}

function lhBarAbc(bar: Bar, lh: LhEvent[]): string {
  const evs = lh.filter(ev => ev.pos >= bar.start && ev.pos < bar.start + 8).sort((a, b) => a.pos - b.pos);
  let pos = bar.start;
  const toks: string[] = [];
  evs.forEach(ev => {
    if (ev.pos > pos) toks.push('z' + abcDur(ev.pos - pos));
    toks.push('[' + ev.midis.map(m => abcNote(m, SHARP[pc(m)]).s).join('') + ']' + abcDur(ev.d));
    pos = ev.pos + ev.d;
  });
  if (pos < bar.start + 8) toks.push('z' + abcDur(bar.start + 8 - pos));
  return toks.join(' ');
}

/** Lager ABC for notearket av samme data som dømmingen bruker. Fingersetting over, tonenavn under. */
export function toAbc(model: Model, perLine: number, showLH: boolean): string {
  const out = ['X:1', 'M:4/4', 'L:1/8', 'K:Am'];
  if (showLH) out.push('%%score {RH LH}', 'V:RH clef=treble', 'V:LH clef=bass');
  for (let i = 0; i < model.bars.length; i += perLine) {
    const group = model.bars.slice(i, i + perLine);
    const end = i + perLine >= model.bars.length ? ' |]' : ' |';
    const rh = group.map(rhBarAbc);
    const music = rh.map(r => r.music).join(' | ') + end;
    const lyr = 'w: ' + rh.map(r => r.lyr).join(' | ');
    if (showLH) out.push('[V:RH] ' + music, lyr, '[V:LH] ' + group.map(b => lhBarAbc(b, model.lh)).join(' | ') + end);
    else out.push(music, lyr);
  }
  return out.join('\n');
}
