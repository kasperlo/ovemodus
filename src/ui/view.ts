import { clickLength, countInBars, type Section, type Step, type StepStatus } from '../music/song';
import { clearOverlay, sheet, paintSheet, paintTiming, sheetCursor } from '../notation/sheet';
import { timingClass } from '../practice/judge';
import { avgOffsetMs, currentIndex, elapsed, mic, run, state, type ClueAction } from '../state';
import { taktRecord, waitRecord } from '../storage';
import { els, segButtons } from './dom';
import { setTargets } from './keyboard';
import { chipEls, scrollChip } from './strip';

export const fmtSec = (s: number): string => s.toFixed(1).replace('.', ',') + ' s';

export function renderSegments(sections: Section[], onSelect: (id: string) => void): void {
  els.segSection.innerHTML = '';
  sections.forEach(sec => {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.sec = sec.id; b.textContent = sec.title;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => onSelect(sec.id));
    els.segSection.append(b);
  });
  els.segSection.hidden = sections.length < 2;
}

export function markStep(si: number, status: StepStatus): void {
  const st = state.model.steps[si];
  if (st) st.status = status;
  const c = chipEls[si];
  if (c) { c.classList.remove('shake'); c.classList.add(status); }
  paintSheet(si, status, state.model.steps);
}

export function markTiming(si: number, offsetS: number): void {
  const kind = timingClass(offsetS);
  if (kind) chipEls[si]?.classList.add(kind);
  paintTiming(si, offsetS);
}

export function clearMarks(): void {
  state.model.steps.forEach(st => { st.status = null; });
  chipEls.forEach(c => c.classList.remove('done', 'hit', 'stumbled', 'missed', 'current', 'shake', 'early', 'late'));
  sheet.notes.forEach((_n, i) => paintSheet(i, null, state.model.steps));
  clearOverlay();
}

export function shakeStep(si: number): void {
  const c = chipEls[si];
  if (c) {
    c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
    setTimeout(() => c.classList.remove('shake'), 340);
  }
  const r = sheet.cursor;
  if (r) { r.classList.add('bad'); setTimeout(() => r.classList.remove('bad'), 340); }
}

function setCurrentMark(ci: number): void {
  chipEls.forEach((c, i) => c.classList.toggle('current', i === ci));
  if (ci >= 0 && !els.strip.hidden) scrollChip(ci);
  sheetCursor(ci, els.sheet);
}

export function refresh(): void {
  const steps = state.model.steps;
  const ci = currentIndex();
  setCurrentMark(ci);
  const showKeys = ci >= 0 && !(state.mode === 'takt' && !run.active);
  setTargets(showKeys ? steps[ci] : null, showKeys ? steps[ci + 1] : null, run.active && run.kind === 'demo');
  renderClue(ci);
  renderStats();
  updateButtons();
}

interface ClueOpts {
  small?: boolean;
  badge?: string | null;
  actions?: ClueAction[];
}

function setClue(label: string, big: string, sub: string, then: string, opts: ClueOpts = {}): void {
  els.clueLabel.textContent = label;
  els.clueBig.textContent = big;
  els.clueBig.classList.toggle('small', !!opts.small);
  els.clueSub.textContent = sub || '';
  els.clueThen.textContent = then || '';
  els.clueActions.innerHTML = '';
  if (opts.badge) {
    const b = document.createElement('span');
    b.className = 'badge'; b.textContent = opts.badge;
    els.clueLabel.textContent = '';
    els.clueLabel.append(b, document.createElement('br'), document.createTextNode(label));
  }
  (opts.actions || []).forEach(([text, fn, primary]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn' + (primary ? ' primary' : '');
    b.textContent = text; b.addEventListener('click', fn);
    els.clueActions.append(b);
  });
}

function stepSub(s: Step): string {
  if (s.type === 'chord') return `${s.sci} · fingre ${s.f}`;
  return `${s.sci} · finger ${s.f}`;
}

function renderClue(ci: number): void {
  const steps = state.model.steps;
  if (state.result && !run.active) {
    const r = state.result;
    setClue(r.label, r.big, r.sub, r.then, { badge: r.badge, actions: r.actions, small: r.small });
    return;
  }
  if (run.active) {
    const tt = (performance.now() - run.t0) / 1000;
    if (run.kind === 'takt' && tt < run.countIn) {
      const beat = Math.floor(tt / (run.clickLen * run.e8));
      setClue('Gjør deg klar', beat < 0 ? '…' : String(Math.max(1, run.countInClicks - beat)), `${run.tempo} BPM`, 'Første tone: ' + steps[0].name);
      return;
    }
    const s = steps[ci];
    if (!s) { setClue(run.kind === 'demo' ? 'Hør etter' : 'Spill nå', '…', '', ''); return; }
    const nx = steps[ci + 1];
    setClue(run.kind === 'demo' ? 'Hør etter' : 'Spill nå', s.name, stepSub(s), nx ? 'deretter ' + nx.name : 'siste tone', { small: s.type === 'chord' });
    return;
  }
  if (state.mode === 'takt') {
    setClue('Spill i takt', `${state.tempo} BPM`, `Trykk «Start i takt». Du får ${countInText()} før første tone.`, 'Første tone: ' + steps[0].name + ' · finger ' + steps[0].f, { small: true });
    return;
  }
  const s = steps[state.cur];
  if (!s) return;
  const nx = steps[state.cur + 1];
  setClue(s.type === 'chord' ? 'Neste akkord' : 'Neste tone', s.name, stepSub(s), nx ? 'deretter ' + nx.name : 'siste tone!', { small: s.type === 'chord' });
}

const NUMBER_WORDS: Record<number, string> = { 2: 'to', 3: 'tre', 4: 'fire', 5: 'fem', 6: 'seks', 8: 'åtte' };

function countInText(): string {
  const meter = state.song.meter;
  const n = Math.round(countInBars(meter) * state.model.barLen / clickLength(meter));
  return `${NUMBER_WORDS[n] ?? n} klikk`;
}

function recText(): string {
  const id = state.sec.id;
  if (state.mode === 'vent') {
    const r = waitRecord(id, state.hand);
    return r ? fmtSec(r.time) : '–';
  }
  const r = taktRecord(id, state.hand);
  return r ? `${r.tempo} BPM` : '–';
}

export function renderStats(): void {
  const n = state.model.steps.length;
  if (state.mode === 'vent') {
    els.k1.textContent = 'Tone'; els.k2.textContent = 'Bom'; els.k3.textContent = 'Tid'; els.k4.textContent = 'Rekord';
    els.v1.textContent = `${state.cur}/${n}`;
    els.v2.textContent = String(state.misses);
    els.v3.textContent = fmtSec(elapsed());
    els.progFill.style.width = (100 * state.cur / n) + '%';
  } else {
    els.k1.textContent = 'Treff'; els.k2.textContent = 'Bom'; els.k3.textContent = 'Timing'; els.k4.textContent = 'Rekord';
    els.v1.textContent = `${state.hits}/${n}`;
    els.v2.textContent = String(state.misses + state.extra);
    els.v3.textContent = run.offsets.length ? `${avgOffsetMs() > 0 ? '+' : ''}${Math.round(avgOffsetMs())} ms` : '–';
    const judged = state.model.steps.filter(s => s.judged).length;
    els.progFill.style.width = (100 * judged / n) + '%';
  }
  els.v4.textContent = recText();
}

let hintTimer: number | undefined;
export function setHint(text: string, kind = ''): void {
  els.hint.textContent = text || '';
  els.hint.className = 'hint' + (kind ? ' ' + kind : '');
  clearTimeout(hintTimer);
  if (text) hintTimer = window.setTimeout(() => { els.hint.textContent = ''; els.hint.className = 'hint'; }, 2600);
}

export function updateButtons(): void {
  els.btnGo.hidden = state.mode !== 'takt';
  els.btnGo.textContent = run.active && run.kind === 'takt' ? 'Stopp' : 'Start i takt';
  els.btnDemo.textContent = run.active && run.kind === 'demo' ? 'Stopp avspillingen' : 'Hør hvordan det går';
  segButtons(els.segSection).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sec === state.sec.id)));
  segButtons(els.segMode).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode)));
  els.btnMic.textContent = mic.on ? 'Slå av mikrofon' : 'Bruk mikrofon';
  els.setupSum.textContent = [state.sec.title, state.hand === 'lh' ? 'Venstre hånd' : '', state.mode === 'vent' ? 'Vent på meg' : 'Spill i takt', `${state.tempo} BPM`]
    .filter(Boolean).join(' · ');
}

export function setSetupOpen(open: boolean): void {
  els.panel.classList.toggle('collapsed', !open);
  els.btnSetup.setAttribute('aria-expanded', String(open));
}

export function celebrate(): void {
  els.clue.classList.remove('win'); void els.clue.offsetWidth; els.clue.classList.add('win');
}

type Tone = '' | 'ok' | 'warn' | 'bad' | 'on';

export function setStatus(text: string, kind: Tone = ''): void {
  els.inputStatus.textContent = text;
  els.inputStatus.className = 'status' + (kind ? ' ' + kind : '');
}

export function setPill(el: HTMLElement, text: string, kind: Tone = ''): void {
  el.textContent = text;
  el.className = 'pill' + (kind ? ' ' + kind : '');
}
