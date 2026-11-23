import { pc } from '../music/theory';
import { elapsed, partId, spell, state } from '../state';
import { progressOf, setProgress, setWaitRecord, store, waitRecord } from '../storage';
import { els } from '../ui/dom';
import { flashKey } from '../ui/keyboard';
import { clearGhost, showGhost } from '../notation/sheet';
import { celebrate, fmtSec, markStep, refresh, renderStats, setHint, shakeStep } from '../ui/view';
import type { InputEvent } from './input';
import type { Hand, Step } from '../music/song';
import { addChordTone, handOf, isOrnament, matches, matchesPart, wholeChord } from './judge';
import { addRound, dayKey } from './ladder';
import { resetProgress } from './progress';
import { setMode } from './session';

/** «Vent på meg»: står stille til riktig tone kommer. */
export function judgeWait(m: number, ev: InputEvent): void {
  if (state.finished) return;
  const step = state.model.steps[state.cur];
  const mic = ev.src === 'mic';
  // Mikrofonen hører fortsatt forrige tone: ikke regn den som ny
  if (mic && !ev.attack && state.lastAcc != null && pc(m) === pc(state.lastAcc)) return;
  if (step.parts) { judgeWaitBoth(step, m, ev); return; }
  if (matches(step, m, els.optOct.checked)) {
    if (state.tStart == null) state.tStart = performance.now();
    if (step.type === 'chord' && wholeChord(ev.src, els.optChordAll.checked)) {
      const r = addChordTone(step.played, step.midis, m, els.optOct.checked);
      step.played = r.played;
      if (!r.complete) { flashKey(m, 'hit'); clearGhost(); refresh(); return; }
    }
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
  if (isOrnament(m, step, state.model.steps[state.cur - 1], els.optOct.checked)) return;
  state.misses++;
  step.stumbled = true;
  flashKey(m, 'wrong');
  shakeStep(step.si);
  showGhost(step, m, els.optOct.checked);
  setHint(`Du spilte ${spell(m)}. Neste er ${step.name}.`, 'bad');
  renderStats();
}

/** Begge hender: steget er ferdig når hver hånd har spilt sin del. Tonen tilordnes en hånd før den dømmes. */
function judgeWaitBoth(step: Step, m: number, ev: InputEvent): void {
  const parts = step.parts!;
  const anyOct = els.optOct.checked;
  const free = (['rh', 'lh'] as Hand[]).filter(h => parts[h] && !step.got?.[h]);
  const hand = handOf(m, state.model.split, ev.channel) ?? free.find(h => matchesPart(parts[h]!, m, anyOct)) ?? null;
  const part = hand ? parts[hand] : undefined;
  if (hand && part && matchesPart(part, m, anyOct)) {
    if (step.got?.[hand]) return; // samme hånd igjen: ikke bom, men heller ikke noe nytt
    if (state.tStart == null) state.tStart = performance.now();
    // Mikrofonen melder venstre hånd bare som anslag, så tonen som kan klinge videre uten nytt anslag er høyre hånds
    if (hand === 'rh') state.lastAcc = m;
    flashKey(m, 'hit');
    clearGhost();
    if (part.type === 'chord' && wholeChord(ev.src, els.optChordAll.checked)) {
      const r = addChordTone(part.played, part.midis, m, anyOct);
      part.played = r.played;
      if (!r.complete) { refresh(); return; }
    }
    step.got = { ...step.got, [hand]: true };
    if ((['rh', 'lh'] as Hand[]).every(h => !parts[h] || step.got?.[h])) {
      state.hits++;
      markStep(step.si, step.stumbled ? 'stumbled' : 'done');
      state.cur++;
      if (state.cur >= state.model.steps.length) finishWait();
    }
    refresh();
    return;
  }
  if (ev.src === 'mic' && ev.phase !== 'sustain') return;
  if (isOrnament(m, step, state.model.steps[state.cur - 1], anyOct)) return;
  state.misses++;
  step.stumbled = true;
  flashKey(m, 'wrong');
  shakeStep(step.si);
  showGhost(step, m, anyOct, hand ?? undefined);
  setHint(`Du spilte ${spell(m)}. Neste er ${step.name}.`, 'bad');
  renderStats();
}

function finishWait(): void {
  state.finished = true;
  state.tEnd = performance.now();
  const secs = elapsed();
  const part = partId();
  const prev = waitRecord(part, state.hand);
  let badge: string | null = null;
  if (!state.partial && (!prev || secs < prev.time)) {
    setWaitRecord(part, state.hand, { time: secs, misses: state.misses });
    badge = prev ? 'Ny rekord!' : null;
  }
  // En runde som startet midt i, kan ikke sammenlignes med de andre
  if (!state.partial) setProgress(part, state.hand, 'vent', addRound(progressOf(part, state.hand, 'vent'), { at: Date.now(), time: secs, misses: state.misses }, dayKey(new Date())));
  if (store.settings.loop) { again(secs, badge); return; }
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

/**
 * Løkke: begynner på nytt med en gang, så neste tone teller. Tiden og bommene står i hintet og i løkkekortet.
 * Siste tone huskes, fordi mikrofonen kan høre den klinge ut og ellers tro at første tone er spilt.
 */
function again(secs: number, badge: string | null): void {
  const last = state.lastAcc, misses = state.misses;
  resetProgress();
  state.lastAcc = last;
  setHint(`${badge ? badge + ' ' : ''}${fmtSec(secs)}, ${misses} bom. Fra start igjen.`, 'ok');
  celebrate();
}
