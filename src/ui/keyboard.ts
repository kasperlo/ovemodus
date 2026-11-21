import { SHARP, isBlack, octOf, pc, sciName } from '../music/theory';
import type { Step } from '../music/song';
import { els } from './dom';

/** Tangentene skjermtastaturet viser: to oktaver fra C4 for høyre hånd, fra C2 for venstre. */
export const KB_RANGE = { rh: [60, 84], lh: [36, 60], both: [36, 84] } as const;
let lo = 60, hi = 84;

/**
 * Tangentene som vises: standardområdet for hånden når alle tonene får plass der (gjelder de innebygde låtene),
 * ellers to oktaver fra C under den dypeste tonen, utvidet til tre om det trengs.
 */
export function keyboardRange(steps: Step[], fallback: readonly [number, number], maxSpan = 36): [number, number] {
  const ms = steps.flatMap(s => s.type === 'chord' ? s.midis : [s.midi]);
  if (!ms.length) return [fallback[0], fallback[1]];
  const min = Math.min(...ms), max = Math.max(...ms);
  if (min >= fallback[0] && max <= fallback[1]) return [fallback[0], fallback[1]];
  const from = Math.floor(min / 12) * 12;
  return [from, Math.min(from + maxSpan, Math.max(from + 24, Math.ceil(max / 12) * 12))];
}
export let keyEls: Record<number, HTMLButtonElement> = {};
const flashTimers = new WeakMap<HTMLElement, number>();

export function renderKeyboard(range: readonly [number, number] = KB_RANGE.rh): void {
  [lo, hi] = range;
  keyEls = {};
  els.kbd.innerHTML = '';
  let whites = 0;
  for (let m = lo; m <= hi; m++) if (!isBlack(m)) whites++;
  const W = 100 / whites;
  let wi = 0;
  for (let m = lo; m <= hi; m++) {
    const k = document.createElement('button');
    k.type = 'button';
    k.className = 'key ' + (isBlack(m) ? 'black' : 'white');
    k.dataset.m = String(m);
    k.setAttribute('aria-label', sciName(m));
    if (isBlack(m)) {
      k.style.left = `calc(${wi * W}% - ${W * 0.31}%)`;
      k.style.width = `${W * 0.62}%`;
      k.innerHTML = '<span class="bub" aria-hidden="true"></span>';
    } else {
      k.style.left = `${wi * W}%`;
      k.style.width = `${W}%`;
      const letter = SHARP[pc(m)];
      k.innerHTML = `<span class="bub" aria-hidden="true"></span><span class="lbl">${letter}${pc(m) === 0 ? `<small>${octOf(m)}</small>` : ''}</span>`;
      wi++;
    }
    keyEls[m] = k;
    els.kbd.append(k);
  }
}

/** Flytter tonen inn i oktavene skjermtastaturet viser. */
export const inRange = (m: number): number => { while (m < lo) m += 12; while (m > hi) m -= 12; return m; };

export function flashKey(m: number, kind: 'hit' | 'wrong'): void {
  const k = keyEls[inRange(m)];
  if (!k) return;
  k.classList.remove('hit', 'wrong');
  void k.offsetWidth; // start animasjonen på nytt
  k.classList.add(kind);
  clearTimeout(flashTimers.get(k));
  flashTimers.set(k, window.setTimeout(() => k.classList.remove(kind), 320));
}

/** Fingrene til tonene i `midis`, i samme rekkefølge. Med begge hender settes delene sammen. */
function fingerList(step: Step): string[] {
  if (step.parts) {
    return (['lh', 'rh'] as const).flatMap(h => {
      const p = step.parts![h];
      return p ? (p.f ? p.f.split(' ') : p.midis.map(() => '')) : [];
    });
  }
  return step.type === 'chord' ? step.f.split(' ') : [step.f];
}

/** Gull på tangentene til neste steg, med fingre. `done` er tonene til en hånd som allerede har spilt sin del. */
export function setTargets(step: Step | null | undefined, next: Step | null | undefined, demo: boolean, done: Set<number> = new Set()): void {
  Object.values(keyEls).forEach(k => {
    k.classList.remove('target', 'then', 'demo');
    k.querySelector('.bub')!.textContent = '';
  });
  if (!step) return;
  const mids = step.type === 'chord' ? step.midis : [step.midi];
  const fingers = fingerList(step);
  mids.forEach((m, i) => {
    if (done.has(m)) return;
    const k = keyEls[m] ?? keyEls[inRange(m)];
    if (!k) return;
    k.classList.add(demo ? 'demo' : 'target');
    k.querySelector('.bub')!.textContent = fingers[i] || '';
  });
  if (next && !demo) {
    (next.type === 'chord' ? next.midis : [next.midi]).forEach(m => {
      const k = keyEls[m] ?? keyEls[inRange(m)];
      if (k && !k.classList.contains('target')) k.classList.add('then');
    });
  }
}
