import type { Progress, Round } from '../storage';
import { RECORD_MIN_PCT } from './judge';

export const TEMPO_MIN = 50, TEMPO_MAX = 220;

/** Tempotrappen flytter tempoet så mye per runde, samme steg som tempovelgeren. */
export const LADDER_STEP = 5;
/** Under så mange prosent treff går tempoet ned. Fra RECORD_MIN_PCT (90) og opp går det opp. */
export const LADDER_DOWN_PCT = 70;

/** `up` og `down`: tempoet endres. `goal`: målet er nådd og holdes. `stay`: samme tempo igjen. */
export type LadderMove = 'up' | 'goal' | 'stay' | 'down';

/**
 * Tempoet i neste runde av løkken i «Spill i takt». Det går ikke over målet, men står man allerede over målet,
 * trekkes det heller ikke ned etter en god runde.
 */
export function nextTempo(tempo: number, pct: number, target: number): { tempo: number; move: LadderMove } {
  if (pct >= RECORD_MIN_PCT) {
    if (tempo >= target) return { tempo, move: 'goal' };
    return { tempo: Math.min(target, tempo + LADDER_STEP, TEMPO_MAX), move: 'up' };
  }
  if (pct < LADDER_DOWN_PCT && tempo - LADDER_STEP >= TEMPO_MIN) return { tempo: tempo - LADDER_STEP, move: 'down' };
  return { tempo, move: 'stay' };
}

export function ladderText(next: { tempo: number; move: LadderMove }, target: number): string {
  switch (next.move) {
    case 'up': return next.tempo >= target ? `Målet er nådd! Neste runde i ${next.tempo} BPM.` : `Bra! Tempoet går opp til ${next.tempo} BPM.`;
    case 'goal': return `Du holder måltempoet, ${next.tempo} BPM.`;
    case 'stay': return `Samme tempo en gang til: ${next.tempo} BPM.`;
    case 'down': return `Litt saktere: ${next.tempo} BPM.`;
  }
}

/** Datoen i lokal tid, for eksempel `2026-11-23`. */
export function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Så mange runder og dager lagres per del, utsnitt, hånd og modus. */
export const ROUNDS_KEPT = 12, DAYS_KEPT = 60;

/** Legger til en runde. En runde i takt med minst 90 % treff kan bli dagens beste tempo. */
export function addRound(p: Progress | undefined, r: Round, day: string): Progress {
  const rounds = [...(p?.rounds ?? []), r].slice(-ROUNDS_KEPT);
  const days = { ...p?.days };
  if (r.tempo != null && r.pct != null && r.pct >= RECORD_MIN_PCT) days[day] = Math.max(days[day] ?? 0, r.tempo);
  Object.keys(days).sort().slice(0, -DAYS_KEPT).forEach(k => { delete days[k]; });
  return { rounds, days };
}
