// Importerte låter lagres bare i nettleseren på denne enheten (localStorage). De publiseres aldri.

import { CH, N, R, type BarEvent, type SectionGroup, type Song } from '../music/song';
import type { StoredEvent, StoredSong } from './musicxml';

const KEY = 'ovemodus-mine-noter-v1';
/** Lange stykker deles i deler på så mange takter, så man kan øve på en del om gangen. */
const CHUNK = 16;

export function loadStored(): StoredSong[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Lagrer listen. Gir false hvis nettleseren ikke har plass. */
export function saveStored(list: StoredSong[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

const name = (p: string) => p.replace(/\d+$/, '').replace('#', '♯').replace(/(?<=[A-G])b/, '♭');

function event(x: StoredEvent): BarEvent {
  if (x.t === 'r') return R(x.d);
  if (x.t === 'n') return N(x.p, x.d, x.f);
  const n = x.p.map(name).join('+');
  return CH(x.p, x.d, x.f, n, n);
}

export function toSong(s: StoredSong): Song {
  const bars: Record<string, BarEvent[]> = {}, lh: Record<string, BarEvent[]> = {};
  s.rh.forEach((b, i) => { bars[`r${i}`] = b.map(event); });
  s.lh.forEach((b, i) => { lh[`l${i}`] = b.map(event); });
  const pairs = s.rh.map((_, i): [string, string | null] => [`r${i}`, s.lh.length ? `l${i}` : null]);
  const group = (from: number, to: number, label: string): SectionGroup => ({ label, bars: pairs.slice(from, to) });
  const sections = [{ id: `${s.id}-hele`, title: 'Hele', tempo: s.tempo, groups: [group(0, pairs.length, s.title)] }];
  if (pairs.length > CHUNK) {
    for (let i = 0; i < pairs.length; i += CHUNK) {
      const to = Math.min(pairs.length, i + CHUNK);
      sections.push({ id: `${s.id}-t${i + 1}`, title: `Takt ${i + 1}–${to}`, tempo: s.tempo, groups: [group(i, to, `Takt ${i + 1}`)] });
    }
  }
  return {
    id: s.id, title: s.title, by: `Importert fra ${s.fileName}. Lagret bare på denne enheten.`,
    category: 'mine', key: s.key, meter: s.meter, bars, lh, sections
  };
}
