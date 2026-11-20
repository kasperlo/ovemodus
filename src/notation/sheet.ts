import abcjs from 'abcjs';
import type { Model, Step, StepStatus } from '../music/song';
import { timingClass } from '../practice/judge';
import { abcNote, toAbc } from './abc';
import { BASS_BOTTOM, TREBLE_BOTTOM, ghostMidi, ghostPitch, ledgerSteps, staffStep } from './staff';
import { SHARP, pc, sciName } from '../music/theory';

const SVG_NS = 'http://www.w3.org/2000/svg';

type Box = { x: number; y: number; w: number; h: number };

interface SheetNote {
  /** `<g class="abcjs-note">` som farges. */
  g: SVGGElement;
  /** Markøren dekker noten med fingertall og tonenavn, men ikke etiketter som «Del A». */
  box: Box | null;
  head: Box | null;
  lyric: Box | null;
}

interface Beam {
  el: SVGElement;
  /** Stegene bjelken binder sammen. */
  steps: number[];
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
  beams: [] as Beam[],
  map: new Map<unknown, number>(),
  cursor: null as SVGRectElement | null,
  overlay: null as SVGGElement | null,
  /** Avstand mellom to diatoniske trinn på notelinjene, i SVG-enheter. */
  halfSpace: 4,
  /** Nederste notelinje i nøkkelen til hånden man øver på (E4 i diskant, G2 i bass), i trinn over C4. */
  bottomLine: 2,
  /** Må tegnes på nytt neste gang arket er synlig. */
  dirty: true,
  perLine: 0,
  /** Antall noter i arket stemmer med antall steg. */
  ok: false
};

const FINGERING = /^[1-5](\s[1-5])*$/;

function bbox(e: Element): Box | null {
  try {
    const b = (e as SVGGraphicsElement).getBBox();
    return b.width || b.height ? { x: b.x, y: b.y, w: b.width, h: b.height } : null;
  } catch { return null; }
}

function union(boxes: (Box | null)[]): Box | null {
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  boxes.forEach(b => {
    if (!b) return;
    x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y);
    x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h);
  });
  return isFinite(x1) ? { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } : null;
}

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent?: Element): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  parent?.append(el);
  return el;
}

function noteFrom(elemset: SVGElement[]): SheetNote | null {
  const g = (elemset.find(e => e.classList.contains('abcjs-note')) ?? elemset[0]?.closest('.abcjs-note')) as SVGGElement | null;
  if (!g) return null;
  const parts = [...g.children].filter(c => !c.classList.contains('abc-label'));
  const heads = [...g.querySelectorAll('.abcjs-notehead')].map(bbox).filter((b): b is Box => !!b);
  // Akkorder: laveste notehode, det er det spøkelsesnoten måles fra
  const head = heads.sort((a, b) => b.y - a.y)[0] ?? null;
  const lyricEl = g.querySelector('.abcjs-lyric');
  return { g, box: union(parts.map(bbox)), head, lyric: lyricEl ? bbox(lyricEl) : null };
}

/** Kobler hver bjelke til notene den binder sammen, ut fra hvor notehalsene står. */
function findBeams(svg: SVGSVGElement): Beam[] {
  const stems = sheet.notes.map(n => {
    const s = n?.g.querySelector('.abcjs-stem');
    return s ? bbox(s) : null;
  });
  return [...svg.querySelectorAll<SVGElement>('.abcjs-beam-elem')].map(el => {
    const b = bbox(el);
    const steps: number[] = [];
    if (b) stems.forEach((s, i) => {
      if (!s) return;
      const xIn = s.x >= b.x - 1.5 && s.x <= b.x + b.w + 1.5;
      const yIn = s.y <= b.y + b.h + 2 && s.y + s.h >= b.y - 2;
      if (xIn && yIn) steps.push(i);
    });
    return { el, steps };
  }).filter(beam => beam.steps.length > 0);
}

export const sheetPerLine = (container: HTMLElement): number => container.clientWidth >= 900 ? 4 : 2;

// getBBox virker ikke på skjulte elementer, så arket tegnes bare når det er synlig.
export function renderSheet(container: HTMLElement, model: Model, otherChecked: boolean, onJump: (si: number) => void): void {
  sheet.notes = []; sheet.beams = []; sheet.map = new Map(); sheet.cursor = null; sheet.overlay = null; sheet.ok = false;
  if (container.hidden || !container.clientWidth) { sheet.dirty = true; return; }
  sheet.dirty = false;
  container.innerHTML = '';
  const perLine = sheet.perLine = sheetPerLine(container);
  const showOther = otherChecked && model.acc.length > 0;
  // Høyre hånd står alltid øverst i pianosystemet, så venstre hånd er system 2 når begge vises
  const staffIdx = model.hand === 'lh' && showOther ? 1 : 0;
  sheet.bottomLine = model.hand === 'lh' ? BASS_BOTTOM : TREBLE_BOTTOM;
  const tunes = abcjs.renderAbc(container, toAbc(model, perLine, showOther), {
    add_classes: true, responsive: 'resize', staffwidth: perLine === 4 ? 900 : 500,
    paddingtop: 6, paddingbottom: 6, paddingleft: 6, paddingright: 6,
    selectionColor: '#15161c',
    format: { vocalfont: 'Barlow 13 bold', annotationfont: 'Barlow 12 bold' },
    clickListener: abcelem => { const si = sheet.map.get(abcelem); if (si != null) onJump(si); }
  });
  const svg = container.querySelector('svg');
  if (!svg) return;
  // Fingertall og etiketter er begge annotasjoner i abcjs. Etikettene skal ikke farges eller dekkes av markøren.
  svg.querySelectorAll('.abcjs-annotation').forEach(a => {
    if (!FINGERING.test((a.textContent || '').trim())) a.classList.add('abc-label');
  });
  const staff = svg.querySelector('.abcjs-staff');
  const staffBox = staff ? bbox(staff) : null;
  if (staffBox) sheet.halfSpace = staffBox.h / 8;

  const list: VoiceElem[] = [];
  (tunes[0]?.lines || []).forEach(line => {
    const v = line.staff?.[staffIdx]?.voices?.[0] as VoiceElem[] | undefined;
    if (v) v.forEach(el => { if (el.el_type === 'note' && !el.rest) list.push(el); });
  });
  sheet.ok = list.length === model.steps.length;
  if (!sheet.ok) console.warn('Noteark: fant', list.length, 'noter, forventet', model.steps.length);
  list.forEach((el, i) => {
    if (i >= model.steps.length) return;
    const n = noteFrom((el.abselem?.elemset || []).filter((x): x is SVGElement => Boolean(x)));
    if (!n) return;
    sheet.map.set(el, i);
    sheet.notes[i] = n;
  });
  sheet.beams = findBeams(svg);

  const r = svgEl('rect', { class: 'abc-cursor', rx: 4, width: 0, height: 0 });
  svg.insertBefore(r, svg.firstChild);
  sheet.cursor = r;
  sheet.overlay = svgEl('g', { class: 'abc-overlay' }, svg);

  model.steps.forEach(st => {
    if (st.status) paintSheet(st.si, st.status, model.steps);
    if (st.offset != null) paintTiming(st.si, st.offset);
  });
}

const STATUS_CLASS: Record<StepStatus, string> = { done: 'n-done', hit: 'n-done', stumbled: 'n-stumbled', missed: 'n-missed' };
const ALL_CLASSES = ['n-done', 'n-stumbled', 'n-missed'];

export function paintSheet(si: number, status: StepStatus | null, steps: Step[]): void {
  const n = sheet.notes[si];
  if (!n) return;
  n.g.classList.remove(...ALL_CLASSES);
  if (status) n.g.classList.add(STATUS_CLASS[status]);
  sheet.beams.forEach(beam => {
    if (!beam.steps.includes(si)) return;
    const played = beam.steps.every(i => steps[i]?.status && steps[i].status !== 'missed');
    beam.el.classList.toggle('n-done', played);
  });
}

/**
 * Lite merke rett under tonenavnet: ◂ for tidlig, ▸ for sent. Ingenting når tonen var i takt.
 * Under, ikke ved siden av, fordi tonenavnene står for tett til at merker får plass mellom dem.
 */
export function paintTiming(si: number, offsetS: number | null): void {
  const n = sheet.notes[si];
  if (!n || !sheet.overlay) return;
  sheet.overlay.querySelector(`.abc-timing[data-si="${si}"]`)?.remove();
  const kind = offsetS == null ? null : timingClass(offsetS);
  if (!kind || !n.lyric) return;
  const s = sheet.halfSpace;
  const cx = n.lyric.x + n.lyric.w / 2, cy = n.lyric.y + n.lyric.h + 0.4 * s;
  const dir = kind === 'early' ? -1 : 1;
  const pts = [[cx + dir * 1.4 * s, cy], [cx - dir * 0.6 * s, cy - 0.8 * s], [cx - dir * 0.6 * s, cy + 0.8 * s]];
  const g = svgEl('g', { class: `abc-timing ${kind}`, 'data-si': si }, sheet.overlay);
  svgEl('polygon', { points: pts.map(p => p.join(',')).join(' ') }, g);
  const ms = Math.round(Math.abs(offsetS!) * 1000);
  svgEl('title', {}, g).textContent = `${ms} ms for ${kind === 'early' ? 'tidlig' : 'sent'}`;
}

/** Blek rød note ved siden av den man skulle spille, på plassen til tonen som faktisk ble spilt. */
export function showGhost(step: Step, played: number, anyOctave: boolean): void {
  clearGhost();
  const n = sheet.notes[step.si];
  if (!n?.head || !sheet.overlay) return;
  const targetMidi = step.type === 'chord' ? step.midis[0] : step.midi;
  const targetName = step.type === 'chord' ? SHARP[pc(targetMidi)] : step.name;
  const t = abcNote(targetMidi, targetName);
  const targetStep = staffStep(t.key[0], Number(t.key.slice(1)));
  const shown = ghostMidi(played, targetMidi, anyOctave);
  const g = ghostPitch(shown);
  const s = sheet.halfSpace;
  const headY = n.head.y + n.head.h / 2;
  const yOf = (st: number) => headY + (targetStep - st) * s;
  const cx = n.head.x + n.head.w / 2 + 3.5 * s, cy = yOf(g.step);
  const el = svgEl('g', { class: 'abc-ghost' }, sheet.overlay);
  svgEl('title', {}, el).textContent = `Du spilte ${sciName(played)}`;
  ledgerSteps(g.step, sheet.bottomLine).forEach(st => svgEl('line', { x1: cx - 2 * s, x2: cx + 2 * s, y1: yOf(st), y2: yOf(st) }, el));
  svgEl('ellipse', { cx, cy, rx: 1.3 * s, ry: 0.95 * s, transform: `rotate(-20 ${cx} ${cy})` }, el);
  if (g.sharp) svgEl('text', { x: cx - 2.4 * s, y: cy + 1.1 * s, 'font-size': 3 * s, 'text-anchor': 'middle' }, el).textContent = '♯';
}

export function clearGhost(): void {
  sheet.overlay?.querySelector('.abc-ghost')?.remove();
}

export function clearOverlay(): void {
  if (sheet.overlay) sheet.overlay.innerHTML = '';
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
