import { pc } from '../music/theory';
import { elapsed, spell, state } from '../state';
import { setWaitRecord, waitRecord } from '../storage';
import { els } from '../ui/dom';
import { flashKey } from '../ui/keyboard';
import { clearGhost, showGhost } from '../notation/sheet';
import { celebrate, fmtSec, markStep, refresh, renderStats, setHint, shakeStep } from '../ui/view';
import type { InputEvent } from './input';
import { matches } from './judge';
import { resetProgress } from './progress';
import { setMode } from './session';

/** «Vent på meg»: står stille til riktig tone kommer. */
export function judgeWait(m: number, ev: InputEvent): void {
  if (state.finished) return;
  const step = state.model.steps[state.cur];
  const mic = ev.src === 'mic';
  // Mikrofonen hører fortsatt forrige tone: ikke regn den som ny
  if (mic && !ev.attack && state.lastAcc != null && pc(m) === pc(state.lastAcc)) return;
  if (matches(step, m, els.optOct.checked)) {
    if (state.tStart == null) state.tStart = performance.now();
    state.hits++;
    state.lastAcc = m;
    clearGhost();
    markStep(step.si, step.stumbled ? 'stumbled' : 'done');
    flashKey(m, 'hit');
    state.cur++;
    if (state.cur >= state.model.steps.length) finishWait();
    refresh();
    return;
  }
  if (mic && ev.phase !== 'sustain') return; // vent til tonen er stabil før vi kaller det bom
  state.misses++;
  step.stumbled = true;
  flashKey(m, 'wrong');
  shakeStep(step.si);
  showGhost(step, m, els.optOct.checked);
  setHint(`Du spilte ${spell(m)}. Neste er ${step.name}.`, 'bad');
  renderStats();
}

function finishWait(): void {
  state.finished = true;
  state.tEnd = performance.now();
  const secs = elapsed();
  const prev = waitRecord(state.sec.id, state.hand);
  let badge: string | null = null;
  if (!state.partial && (!prev || secs < prev.time)) {
    setWaitRecord(state.sec.id, state.hand, { time: secs, misses: state.misses });
    badge = prev ? 'Ny rekord!' : null;
  }
  const n = state.model.steps.length;
  state.result = {
    label: 'Ferdig!', big: fmtSec(secs), small: true,
    sub: `${state.partial ? state.hits + ' av ' + n : n} toner · ${state.misses} bom`,
    then: state.misses === 0 ? 'Feilfritt. Prøv den i takt.' : 'Oransje noter viser hvor du bommet. Ta en runde til, og se om de forsvinner.',
    badge,
    actions: [['Én gang til', () => { resetProgress(); refresh(); }, true], ['Prøv i takt', () => setMode('takt')]]
  };
  celebrate();
}
