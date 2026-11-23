import { clickLength, countInBars, type Hand, type Section, type Step, type StepStatus } from '../music/song';
import { pc } from '../music/theory';
import { clearOverlay, sheet, paintSheet, paintTiming, sheetCursor } from '../notation/sheet';
import { RECORD_MIN_PCT, timingClass } from '../practice/judge';
import { LADDER_DOWN_PCT } from '../practice/ladder';
import { barCount, barNumber, rangeText } from '../practice/range';
import { avgOffsetMs, currentIndex, elapsed, mic, partId, run, state, targetTempo, type ClueAction } from '../state';
import { progressOf, store, taktRecord, waitRecord, type Round } from '../storage';
import { renderDays } from './days';
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

export function markTiming(si: number, offsetS: number, hand?: Hand): void {
  const kind = timingClass(offsetS);
  if (kind) chipEls[si]?.classList.add(kind);
  paintTiming(si, offsetS, hand);
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
  const cur = showKeys ? steps[ci] : null;
  const anyOct = els.optOct.checked;
  const playedOf = (midis: number[], played?: number[]): number[] => played ? midis.filter(m => played.includes(anyOct ? pc(m) : m)) : [];
  const done = new Set([
    ...(['rh', 'lh'] as const).flatMap(h => {
      const p = cur?.parts?.[h];
      return !p ? [] : cur?.got?.[h] ? p.midis : playedOf(p.midis, p.played);
    }),
    ...(cur?.type === 'chord' && !cur.parts ? playedOf(cur.midis, cur.played) : [])
  ]);
  setTargets(cur, showKeys ? steps[ci + 1] : null, run.active && run.kind === 'demo', done);
  renderClue(ci);
  renderStats();
  renderLoop();
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

const fingerText = (s: Step): string => s.f ? ` · ${s.type === 'chord' ? 'fingre' : 'finger'} ${s.f}` : '';

function stepSub(s: Step): string {
  if (!s.parts) return s.sci + fingerText(s);
  // Begge hender: én linje per hånd, med hake når hånden har spilt sin del
  return (['rh', 'lh'] as const).filter(h => s.parts![h]).map(h => {
    const p = s.parts![h]!;
    return `${h === 'rh' ? 'Høyre' : 'Venstre'}: ${p.sci}${p.f ? ` (${p.f})` : ''}${s.got?.[h] ? ' ✓' : ''}`;
  }).join(' · ');
}

/** Stort navn i «neste tone»-kortet: med begge hender er det melodien i høyre hånd som vises stort. */
const bigName = (s: Step): string => s.parts ? (s.parts.rh ?? s.parts.lh)!.name : s.name;
const clueLabel = (s: Step): string => s.parts ? 'Neste, begge hender' : s.type === 'chord' ? 'Neste akkord' : 'Neste tone';

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
      const round = store.settings.loop ? ` · runde ${run.round}` : '';
      setClue('Gjør deg klar', beat < 0 ? '…' : String(Math.max(1, run.countInClicks - beat)), `${run.tempo} BPM${round}`, 'Første tone: ' + steps[0].name);
      return;
    }
    const s = steps[ci];
    if (!s) { setClue(run.kind === 'demo' ? 'Hør etter' : 'Spill nå', '…', '', ''); return; }
    const nx = steps[ci + 1];
    setClue(run.kind === 'demo' ? 'Hør etter' : 'Spill nå', bigName(s), stepSub(s), nx ? 'deretter ' + nx.name : 'siste tone', { small: s.type === 'chord' && !s.parts });
    return;
  }
  if (state.mode === 'takt') {
    const sub = store.settings.loop ? `Trykk «Start i takt». Du får ${countInText()} før hver runde.` : `Trykk «Start i takt». Du får ${countInText()} før første tone.`;
    setClue('Spill i takt', `${state.tempo} BPM`, sub, 'Første tone: ' + steps[0].name + fingerText(steps[0]), { small: true });
    return;
  }
  const s = steps[state.cur];
  if (!s) return;
  const nx = steps[state.cur + 1];
  setClue(clueLabel(s), bigName(s), stepSub(s), nx ? 'deretter ' + nx.name : 'siste tone!', { small: s.type === 'chord' && !s.parts });
}

const NUMBER_WORDS: Record<number, string> = { 2: 'to', 3: 'tre', 4: 'fire', 5: 'fem', 6: 'seks', 8: 'åtte' };

function countInText(): string {
  const meter = state.song.meter;
  const n = Math.round(countInBars(meter) * state.model.barLen / clickLength(meter));
  return `${NUMBER_WORDS[n] ?? n} klikk`;
}

function recText(): string {
  const id = partId();
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

/** Valgene for takter i oppsettet. Alternativene lages på nytt bare når delen er en annen. */
export function renderRange(): void {
  const sec = state.sec, n = barCount(sec), key = `${sec.id}|${n}`;
  if (els.rangeFrom.dataset.part !== key) {
    const opts = Array.from({ length: n }, (_, i) => `<option value="${i}">${barNumber(sec, i)}</option>`).join('');
    els.rangeFrom.innerHTML = opts;
    els.rangeTo.innerHTML = opts;
    els.rangeFrom.dataset.part = key;
  }
  els.rangeFrom.value = String(state.range ? state.range.from : 0);
  els.rangeTo.value = String(state.range ? state.range.to : n - 1);
  els.rangeRow.hidden = n < 2;
  els.btnWholePart.hidden = !state.range;
}

/** Tekst og farge for én runde i løkkekortet. */
function roundChip(r: Round, takt: boolean): { big: string; small: string; kind: string; text: string } {
  if (takt) {
    const pct = r.pct ?? 0;
    return { big: `${pct} %`, small: `${r.tempo}`, kind: pct >= RECORD_MIN_PCT ? 'good' : pct >= LADDER_DOWN_PCT ? 'meh' : 'weak', text: `${pct} % treff ved ${r.tempo} BPM` };
  }
  const misses = r.misses ?? 0;
  return { big: fmtSec(r.time ?? 0), small: `${misses} bom`, kind: misses === 0 ? 'good' : 'meh', text: `${fmtSec(r.time ?? 0)} og ${misses} bom` };
}

const handName = (): string => state.hand === 'lh' ? 'venstre hånd' : state.hand === 'both' ? 'begge hender' : '';

let loopSig = '';

/** Løkkekortet (siste runder og tempoet), valgene for løkken og grafen over beste tempo per dag. */
function renderLoop(): void {
  const on = store.settings.loop, takt = state.mode === 'takt';
  const p = progressOf(partId(), state.hand, state.mode);
  const sig = JSON.stringify([on, takt, partId(), state.hand, state.tempo, targetTempo(), p?.rounds.slice(-5), takt && p?.days]);
  if (sig === loopSig) return;
  loopSig = sig;
  els.optLoop.checked = on;
  els.targetRow.hidden = els.loopHelp.hidden = !(on && takt);
  els.optTarget.value = String(targetTempo());
  els.loopCard.hidden = !on;
  els.loopTitle.textContent = `Løkke · ${state.range ? rangeText(state.sec, state.range) : 'hele delen'}`;
  els.loopTempo.textContent = takt ? `${state.tempo} BPM · mål ${targetTempo()}` : '';
  els.loopRounds.innerHTML = '';
  const rounds = p?.rounds.slice(-5) ?? [];
  if (!rounds.length) {
    const li = document.createElement('li');
    li.className = 'none';
    li.textContent = 'Rundene dine vises her.';
    els.loopRounds.append(li);
  }
  rounds.forEach(r => {
    const c = roundChip(r, takt);
    const li = document.createElement('li');
    li.className = c.kind;
    li.innerHTML = '<b aria-hidden="true"></b><span aria-hidden="true"></span><span class="visually-hidden"></span>';
    li.children[0].textContent = c.big;
    li.children[1].textContent = c.small;
    li.children[2].textContent = c.text;
    els.loopRounds.append(li);
  });
  const days = takt ? p?.days ?? {} : {};
  els.days.hidden = !Object.keys(days).length;
  els.daysWhat.textContent = [state.range ? rangeText(state.sec, state.range) : '', handName()].filter(Boolean).map(t => '· ' + t).join(' ');
  if (!els.days.hidden) renderDays(days);
}

export function updateButtons(): void {
  const going = (run.active && run.kind === 'takt') || run.pending;
  els.btnGo.hidden = state.mode !== 'takt';
  els.btnGo.textContent = going ? 'Stopp' : 'Start i takt';
  // Løkkekortet har egen start og stopp, så oppsettet kan være skjult på iPad
  els.btnLoopGo.hidden = state.mode !== 'takt';
  els.btnLoopGo.textContent = going ? 'Stopp' : 'Start';
  els.btnDemo.textContent = run.active && run.kind === 'demo' ? 'Stopp avspillingen' : 'Hør hvordan det går';
  segButtons(els.segSection).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sec === state.sec.id)));
  segButtons(els.segMode).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode)));
  els.btnMic.textContent = mic.on ? 'Slå av mikrofon' : 'Bruk mikrofon';
  els.setupSum.textContent = [
    state.sec.title, state.range ? rangeText(state.sec, state.range) : '', state.hand === 'lh' ? 'Venstre hånd' : state.hand === 'both' ? 'Begge hender' : '',
    state.mode === 'vent' ? 'Vent på meg' : 'Spill i takt', store.settings.loop ? 'Gjenta' : '', `${state.tempo} BPM`
  ].filter(Boolean).join(' · ');
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

/** Statusteksten når mikrofonen er på, avhengig av hånd. */
export function micListeningText(): string {
  return state.hand === 'both'
    ? 'Mikrofonen lytter etter begge hender. Noen toner i høyre hånd kan ikke skilles fra bassen (A4 over A2), og de godtas når venstre hånd er riktig.'
    : `Mikrofonen lytter. Spill ${state.hand === 'lh' ? 'venstre' : 'høyre'} hånd.`;
}

export function setPill(el: HTMLElement, text: string, kind: Tone = ''): void {
  el.textContent = text;
  el.className = 'pill' + (kind ? ' ' + kind : '');
}
