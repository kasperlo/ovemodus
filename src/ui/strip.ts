import type { Model } from '../music/song';
import { els } from './dom';

/** Bokstavbrikkene, indeksert som `model.steps`. */
export let chipEls: HTMLElement[] = [];

export function renderStrip(model: Model, onJump: (si: number) => void): void {
  els.strip.innerHTML = '';
  chipEls = [];
  let barsEl: HTMLElement | null = null;
  model.bars.forEach(bar => {
    if (bar.label) {
      const lab = document.createElement('div');
      lab.className = 'grp-label'; lab.textContent = bar.label;
      els.strip.append(lab);
      barsEl = document.createElement('div'); barsEl.className = 'bars';
      els.strip.append(barsEl);
    }
    const b = document.createElement('div');
    b.className = 'bar';
    bar.items.forEach(it => {
      const c = document.createElement('div');
      c.className = 'chip' + (it.type === 'rest' ? ' rest' : it.type === 'chord' ? ' chord' : '');
      c.style.flexGrow = String(it.d);
      if (it.type === 'rest') {
        c.innerHTML = '<span class="fg"></span><span class="nm">·</span>';
        c.title = 'Pause';
      } else {
        c.innerHTML = '<span class="fg"></span><span class="nm"></span>';
        c.querySelector('.fg')!.textContent = it.f;
        c.querySelector('.nm')!.textContent = it.name;
        c.title = it.type === 'chord' ? `${it.name}: ${it.sci}` : it.sci;
        c.addEventListener('click', () => onJump(it.si));
        chipEls[it.si] = c;
      }
      b.append(c);
    });
    barsEl!.append(b);
  });
}

export function scrollChip(i: number): void {
  const c = chipEls[i], box = els.strip;
  if (!c) return;
  const cr = c.getBoundingClientRect(), br = box.getBoundingClientRect();
  const top = cr.top - br.top + box.scrollTop, bottom = top + cr.height;
  if (top < box.scrollTop + 24 || bottom > box.scrollTop + box.clientHeight - 12) {
    box.scrollTop = Math.max(0, top - box.clientHeight / 3);
  }
}
