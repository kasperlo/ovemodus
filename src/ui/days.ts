import { els } from './dom';

const SVG_NS = 'http://www.w3.org/2000/svg';
/** Så mange av de siste dagene det er øvd, vises. */
const SHOWN = 14;
const W = 300, H = 92, LEFT = 30, RIGHT = 34, TOP = 12, BOTTOM = 20;

interface Point { day: string; tempo: number; x: number; y: number }
let points: Point[] = [];

/** `2026-11-23` → `23.11.` */
const shortDay = (day: string): string => {
  const [, m, d] = day.split('-');
  return `${Number(d)}.${Number(m)}.`;
};

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent: Element, text?: string): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  if (text != null) el.textContent = text;
  parent.append(el);
  return el;
}

/**
 * Liten linjegraf over beste tempo per dag (bare dager det er øvd). Y-aksen starter ikke på null, fordi
 * forskjellene er på 5 BPM. Grafen er skjult for skjermlesere, som får tabellen i stedet.
 */
export function renderDays(days: Record<string, number>): void {
  const list = Object.entries(days).sort(([a], [b]) => a.localeCompare(b)).slice(-SHOWN);
  const body = els.daysTable.tBodies[0];
  body.innerHTML = '';
  list.forEach(([day, tempo]) => {
    const tr = body.insertRow();
    tr.insertCell().textContent = shortDay(day);
    tr.insertCell().textContent = `${tempo} BPM`;
  });

  els.daysPlot.innerHTML = '';
  points = [];
  if (!list.length) return;
  const tempos = list.map(([, t]) => t);
  const lo = Math.min(...tempos), hi = Math.max(...tempos);
  const pad = Math.max(5, (hi - lo) * 0.15);
  const y = (t: number) => TOP + (hi + pad - t) / (hi - lo + 2 * pad) * (H - TOP - BOTTOM);
  const span = W - LEFT - RIGHT;
  points = list.map(([day, tempo], i) => ({ day, tempo, x: LEFT + (list.length === 1 ? span / 2 : i * span / (list.length - 1)), y: y(tempo) }));

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' }, els.daysPlot);
  const first = points[0], last = points[points.length - 1];
  [...new Set([lo, hi])].forEach(v => {
    svgEl('line', { class: 'grid', x1: LEFT, x2: W - RIGHT, y1: y(v), y2: y(v) }, svg);
    // Siste dag har tallet sitt ved punktet, så det står ikke to ganger på samme høyde
    if (v !== last.tempo) svgEl('text', { class: 'axis', x: LEFT - 6, y: y(v) + 4, 'text-anchor': 'end' }, svg, String(v));
  });
  svgEl('text', { class: 'axis', x: first.x, y: H - 4, 'text-anchor': points.length === 1 ? 'middle' : 'start' }, svg, shortDay(first.day));
  if (points.length > 1) svgEl('text', { class: 'axis', x: last.x, y: H - 4, 'text-anchor': 'end' }, svg, shortDay(last.day));
  svgEl('line', { class: 'cross', x1: 0, x2: 0, y1: TOP - 4, y2: H - BOTTOM, visibility: 'hidden' }, svg);
  if (points.length > 1) svgEl('polyline', { class: 'line', points: points.map(p => `${p.x},${p.y}`).join(' ') }, svg);
  points.forEach(p => svgEl('circle', { class: 'dot', cx: p.x, cy: p.y, r: 4 }, svg));
  svgEl('text', { class: 'val', x: last.x + 8, y: last.y + 4 }, svg, String(last.tempo));
  const tip = document.createElement('div');
  tip.className = 'days-tip';
  tip.hidden = true;
  els.daysPlot.append(tip);
}

/** Viser dagen og tempoet for punktet nærmest pekeren. */
function hover(e: PointerEvent): void {
  const svg = els.daysPlot.querySelector('svg'), tip = els.daysPlot.querySelector<HTMLElement>('.days-tip');
  const cross = svg?.querySelector('.cross');
  if (!svg || !tip || !cross || !points.length) return;
  const box = svg.getBoundingClientRect();
  const sx = (e.clientX - box.left) / box.width * W;
  const p = points.reduce((a, b) => Math.abs(b.x - sx) < Math.abs(a.x - sx) ? b : a);
  cross.setAttribute('x1', String(p.x));
  cross.setAttribute('x2', String(p.x));
  cross.setAttribute('visibility', 'visible');
  tip.textContent = `${shortDay(p.day)} · ${p.tempo} BPM`;
  tip.style.left = `${p.x / W * box.width}px`;
  tip.style.top = `${p.y / H * box.height - 8}px`;
  tip.hidden = false;
}

function unhover(e: PointerEvent): void {
  // En finger «forlater» grafen når den løftes. Da skal tallet bli stående til neste trykk.
  if (e.pointerType === 'touch') return;
  els.daysPlot.querySelector('svg .cross')?.setAttribute('visibility', 'hidden');
  const tip = els.daysPlot.querySelector<HTMLElement>('.days-tip');
  if (tip) tip.hidden = true;
}

els.daysPlot.addEventListener('pointermove', hover);
els.daysPlot.addEventListener('pointerdown', hover);
els.daysPlot.addEventListener('pointerleave', unhover);
