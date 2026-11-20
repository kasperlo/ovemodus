import { SHARP, isBlack, octOf, pc, sciName } from '../music/theory';
import type { Step } from '../music/song';
import { els } from './dom';

/** Tangentene skjermtastaturet viser: to oktaver fra C4 for høyre hånd, fra C2 for venstre. */
export const KB_RANGE = { rh: [60, 84], lh: [36, 60] } as const;
let lo = 60, hi = 84;
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

export function setTargets(step: Step | null | undefined, next: Step | null | undefined, demo: boolean): void {
  Object.values(keyEls).forEach(k => {
    k.classList.remove('target', 'then', 'demo');
    k.querySelector('.bub')!.textContent = '';
  });
  if (!step) return;
  const mids = step.type === 'chord' ? step.midis : [step.midi];
  const fingers = step.type === 'chord' ? step.f.split(' ') : [step.f];
  mids.forEach((m, i) => {
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
