import { audio, tone } from './audio/synth';
import { connectMidi } from './input/midi';
import { micFrame, toggleMic } from './input/mic';
import { sheet, sheetPerLine } from './notation/sheet';
import { emitInput } from './practice/input';
import { resetProgress, setTempo } from './practice/progress';
import { drawSheet, setMode, setSection, setView } from './practice/session';
import { runFrame, startRun, stopRun } from './practice/takt';
import { currentSong } from './songs';
import { elapsed, mic, run, spell, state } from './state';
import { save, store, type Mode, type Sensitivity } from './storage';
import { installTestHook } from './testHook';
import { els } from './ui/dom';
import { renderKeyboard } from './ui/keyboard';
import { fmtSec, refresh, renderSegments } from './ui/view';

/* ---------- Skjermtastatur ---------- */
function pressKey(k: HTMLElement): void {
  const ac = audio();
  const m = Number(k.dataset.m);
  tone(m, ac.currentTime, 0.35, 0.9);
  els.heard.textContent = 'Du trykket: ' + spell(m);
  emitInput(m, 'click', performance.now(), { attack: true });
}
const keyOf = (e: Event): HTMLElement | null => (e.target as Element).closest<HTMLElement>('.key');
els.kbd.addEventListener('pointerdown', e => {
  const k = keyOf(e);
  if (!k) return;
  e.preventDefault();
  k.classList.add('down');
  pressKey(k);
});
const pointerKeys = new Set<HTMLElement>();
els.kbd.addEventListener('pointerdown', e => {
  const k = keyOf(e);
  if (k) pointerKeys.add(k);
}, true);
(['pointerup', 'pointercancel'] as const).forEach(t => window.addEventListener(t, () => {
  pointerKeys.forEach(k => k.classList.remove('down'));
  pointerKeys.clear();
}));
els.kbd.addEventListener('click', e => {
  const k = keyOf(e);
  if (k && e.detail === 0) pressKey(k); // tastatur (Enter/mellomrom)
});

/* ---------- Kontroller ---------- */
els.segMode.addEventListener('click', e => {
  const b = (e.target as Element).closest<HTMLElement>('button[data-mode]');
  if (b) setMode(b.dataset.mode as Mode);
});
els.btnMic.addEventListener('click', toggleMic);
els.segView.addEventListener('click', e => {
  const b = (e.target as Element).closest<HTMLElement>('button[data-view]');
  if (b) setView(b.dataset.view!);
});
els.optLHStaff.checked = !!store.settings.lhStaff;
els.optLHStaff.addEventListener('change', () => {
  store.settings.lhStaff = els.optLHStaff.checked; save();
  drawSheet(); refresh();
});
let resizeT: number | undefined;
window.addEventListener('resize', () => {
  clearTimeout(resizeT);
  resizeT = window.setTimeout(() => {
    if (!els.sheet.hidden && (sheet.dirty || sheetPerLine(els.sheet) !== sheet.perLine)) { drawSheet(); refresh(); }
  }, 250);
});
els.btnMidi.addEventListener('click', connectMidi);
els.btnGo.addEventListener('click', () => {
  if (run.active && run.kind === 'takt') stopRun(false); else startRun('takt');
});
els.btnDemo.addEventListener('click', () => {
  if (run.active && run.kind === 'demo') stopRun(false); else startRun('demo');
});
els.btnReset.addEventListener('click', () => { stopRun(true); resetProgress(); refresh(); });
els.tempo.addEventListener('input', () => setTempo(Number(els.tempo.value)));
([['optOct', 'oct'], ['optLH', 'lh'], ['optAcc', 'acc']] as const).forEach(([id, key]) => {
  els[id].checked = store.settings[key] !== false;
  els[id].addEventListener('change', () => { store.settings[key] = els[id].checked; save(); });
});
els.optSens.value = store.settings.sens || 'middels';
els.optSens.addEventListener('change', () => { store.settings.sens = els.optSens.value as Sensitivity; save(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && run.active) stopRun(false); });

/* ---------- Løkke ---------- */
let lastStatT = 0;
function frame(now: number): void {
  if (mic.on) micFrame(now);
  if (run.active) runFrame(now);
  if (state.mode === 'vent' && state.tStart != null && !state.finished && now - lastStatT > 100) {
    lastStatT = now;
    els.v3.textContent = fmtSec(elapsed());
  }
  requestAnimationFrame(frame);
}

/* ---------- Start ---------- */
renderSegments(currentSong.sections, setSection);
renderKeyboard();
state.mode = store.settings.mode === 'takt' ? 'takt' : 'vent';
setSection(store.settings.section);
setView(store.settings.view);
// Arket tegnes på nytt når fontene har lastet, ellers blir notebredden og markøren feil
if (document.fonts && document.fonts.ready) void document.fonts.ready.then(() => { if (!els.sheet.hidden) { drawSheet(); refresh(); } });
requestAnimationFrame(frame);

installTestHook({ setSection, setMode, setTempo, startRun, stopRun });
