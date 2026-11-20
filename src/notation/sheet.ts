import abcjs from 'abcjs';
import type { Model, StepStatus } from '../music/song';
import { toAbc } from './abc';

interface SheetNote {
  els: SVGElement[];
  box: { x: number; y: number; w: number; h: number } | null;
}

/** Det abcjs gir oss per element i en stemme. Typene til abcjs dekker ikke `rest` og `elemset` presist. */
interface VoiceElem {
  el_type: string;
  rest?: unknown;
  abselem?: { elemset?: (SVGElement | null)[] };
}

export const sheet = {
  /** Noteelementene i SVG-en, indeksert som `model.steps`. */
  notes: [] as SheetNote[],
  map: new Map<unknown, number>(),
  cursor: null as SVGRectElement | null,
  /** Må tegnes på nytt neste gang arket er synlig. */
  dirty: true,
  perLine: 0,
  /** Antall noter i arket stemmer med antall steg. */
  ok: false
};

function unionBox(elems: SVGElement[]): SheetNote['box'] {
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  elems.forEach(e => {
    try {
      const b = (e as SVGGraphicsElement).getBBox();
      if (!b.width && !b.height) return;
      x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y);
      x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + b.height);
    } catch { /* ignorer */ }
  });
  return isFinite(x1) ? { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } : null;
}

export const sheetPerLine = (container: HTMLElement): number => container.clientWidth >= 900 ? 4 : 2;

// getBBox virker ikke på skjulte elementer, så arket tegnes bare når det er synlig.
export function renderSheet(container: HTMLElement, model: Model, lhChecked: boolean, onJump: (si: number) => void): void {
  sheet.notes = []; sheet.map = new Map(); sheet.cursor = null; sheet.ok = false;
  if (container.hidden || !container.clientWidth) { sheet.dirty = true; return; }
  sheet.dirty = false;
  container.innerHTML = '';
  const perLine = sheet.perLine = sheetPerLine(container);
  const showLH = lhChecked && model.lh.length > 0;
  const tunes = abcjs.renderAbc(container, toAbc(model, perLine, showLH), {
    add_classes: true, responsive: 'resize', staffwidth: perLine === 4 ? 900 : 500,
    paddingtop: 6, paddingbottom: 6, paddingleft: 6, paddingright: 6,
    selectionColor: '#15161c',
    format: { vocalfont: 'Barlow 13 bold', annotationfont: 'Barlow 12 bold' },
    clickListener: abcelem => { const si = sheet.map.get(abcelem); if (si != null) onJump(si); }
  });
  const list: VoiceElem[] = [];
  (tunes[0]?.lines || []).forEach(line => {
    const v = line.staff?.[0]?.voices?.[0] as VoiceElem[] | undefined;
    if (v) v.forEach(el => { if (el.el_type === 'note' && !el.rest) list.push(el); });
  });
  sheet.ok = list.length === model.steps.length;
  if (!sheet.ok) console.warn('Noteark: fant', list.length, 'noter, forventet', model.steps.length);
  list.forEach((el, i) => {
    if (i >= model.steps.length) return;
    const elems = (el.abselem?.elemset || []).filter((x): x is SVGElement => Boolean(x));
    sheet.map.set(el, i);
    sheet.notes[i] = { els: elems, box: unionBox(elems) };
  });
  const svg = container.querySelector('svg');
  if (svg) {
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    r.setAttribute('class', 'abc-cursor'); r.setAttribute('rx', '4');
    r.setAttribute('width', '0'); r.setAttribute('height', '0');
    svg.insertBefore(r, svg.firstChild);
    sheet.cursor = r;
  }
  model.steps.forEach(st => { if (st.status) paintSheet(st.si, st.status); });
}

export function paintSheet(si: number, status: StepStatus | null): void {
  const n = sheet.notes[si];
  if (!n) return;
  n.els.forEach(e => {
    e.classList.remove('n-done', 'n-missed');
    if (status) e.classList.add(status === 'missed' ? 'n-missed' : 'n-done');
  });
}

export function sheetCursor(ci: number, container: HTMLElement): void {
  const r = sheet.cursor;
  if (!r) return;
  const n = ci >= 0 ? sheet.notes[ci] : null;
  if (!n || !n.box) { r.setAttribute('width', '0'); r.setAttribute('height', '0'); return; }
  const pad = 3;
  r.setAttribute('x', String(n.box.x - pad)); r.setAttribute('y', String(n.box.y - pad));
  r.setAttribute('width', String(n.box.w + 2 * pad)); r.setAttribute('height', String(n.box.h + 2 * pad));
  if (container.hidden) return;
  const rb = r.getBoundingClientRect(), cb = container.getBoundingClientRect();
  if (rb.top < cb.top + 6 || rb.bottom > cb.bottom - 6) {
    container.scrollTop = Math.max(0, container.scrollTop + (rb.top - cb.top) - container.clientHeight / 3);
  }
}
