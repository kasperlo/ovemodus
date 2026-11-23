import type { Section, SectionGroup } from '../music/song';

/** Et utsnitt av takter i en del, fra og med `from` til og med `to`. Tellt fra 0 innenfor delen. */
export interface BarRange {
  from: number;
  to: number;
}

export const barCount = (sec: Section): number => sec.groups.reduce((n, g) => n + g.bars.length, 0);

/** Taktnummeret som vises for takt `i` (tellt fra 0) i delen. */
export const barNumber = (sec: Section, i: number): number => (sec.firstBar ?? 1) + i;

/** Et gyldig utsnitt av delen, eller `null` når det dekker hele delen eller ikke passer i den. */
export function normalizeRange(sec: Section, r: BarRange | null | undefined): BarRange | null {
  if (!r) return null;
  const n = barCount(sec);
  const from = Math.min(r.from, r.to), to = Math.max(r.from, r.to);
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to >= n) return null;
  return from === 0 && to === n - 1 ? null : { from, to };
}

/** «Takt 5–8», eller «Takt 5» for én takt. */
export function rangeText(sec: Section, r: BarRange): string {
  const a = barNumber(sec, r.from), b = barNumber(sec, r.to);
  return a === b ? `Takt ${a}` : `Takt ${a}–${b}`;
}

/**
 * Delen med bare taktene i utsnittet. Hver gruppe beholder etiketten sin, og `firstBar` gir taktnummeret til
 * første takt, så notearket viser de samme taktnumrene som når hele delen vises.
 */
export function sliceSection(sec: Section, r: BarRange): Section {
  const groups: SectionGroup[] = [];
  let i = 0;
  for (const g of sec.groups) {
    const bars = g.bars.filter((_, bi) => i + bi >= r.from && i + bi <= r.to);
    // Bokstavvisningen starter en ny rad med takter ved hver etikett, så første gruppe må ha en
    if (bars.length) groups.push({ label: g.label || (groups.length ? '' : rangeText(sec, r)), bars });
    i += g.bars.length;
  }
  return { ...sec, groups, firstBar: barNumber(sec, r.from) };
}

/** Utsnittet i lagringsnøklene: `t5-8`, tellt fra 1 innenfor delen. Tom for hele delen. */
export const rangeKey = (r: BarRange | null): string => r ? `t${r.from + 1}-${r.to + 1}` : '';
