import { audio, tone } from './audio/synth';
import { connectMidi } from './input/midi';
import { micFrame, toggleMic } from './input/mic';
import { sheet, sheetPerLine } from './notation/sheet';
import { emitInput } from './practice/input';
import { resetProgress, setTempo } from './practice/progress';
import { drawSheet, setHand, setLoop, setMode, setRange, setSection, setTarget, setView } from './practice/session';
import { TEMPO_MAX, TEMPO_MIN } from './practice/ladder';
import { runFrame, startRun, stopRun } from './practice/takt';
import { songs } from './songs';
import { SFX_KEYS, casioSounds } from './casio';
import { elapsed, mic, run, spell, state } from './state';
import { save, store, type Mode, type Sensitivity } from './storage';
import { installTestHook } from './testHook';
import { els } from './ui/dom';
import { initImport, loadImported } from './ui/importer';
import { initMicDiag } from './ui/micDiag';
import { renderSongSelect } from './ui/songSelect';
import { initUpdates } from './ui/update';
import { fmtSec, refresh, setSetupOpen, setStatus } from './ui/view';

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
/** Tabellen over registreringer i «Oppsett for Casio CT-S400». */
function renderCasioTable(): void {
  const body = els.casioTable.tBodies[0];
  body.innerHTML = '';
  const slot = (reg?: [number, number]): number => reg ? reg[0] * 10 + reg[1] : 100;
  songs.filter(s => s.casio).sort((a, b) => slot(a.casio!.reg) - slot(b.casio!.reg)).forEach(s => {
    const c = s.casio!;
    const tr = body.insertRow();
    [c.reg ? `${c.reg[0]}-${c.reg[1]}` : '–', s.title, casioSounds(c), c.tip ?? ''].forEach(text => {
      tr.insertCell().textContent = text;
    });
  });
  els.sfxKeys.textContent = SFX_KEYS.map(([k, what]) => `${k} ${what}`).join(', ');
}

els.selSong.addEventListener('change', () => {
  const song = songs.find(s => s.id === els.selSong.value);
  if (song) setSection(song.sections[0].id);
});
els.segHand.addEventListener('click', e => {
  const b = (e.target as Element).closest<HTMLElement>('button[data-hand]');
  if (b) setHand(b.dataset.hand === 'lh' || b.dataset.hand === 'both' ? b.dataset.hand : 'rh');
});

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
setSetupOpen(store.settings.setupOpen !== false);
els.btnSetup.addEventListener('click', () => {
  store.settings.setupOpen = els.btnSetup.getAttribute('aria-expanded') !== 'true';
  save();
  setSetupOpen(store.settings.setupOpen);
});
els.rangeFrom.addEventListener('change', () => {
  const from = Number(els.rangeFrom.value);
  setRange({ from, to: Math.max(from, Number(els.rangeTo.value)) });
});
els.rangeTo.addEventListener('change', () => {
  const to = Number(els.rangeTo.value);
  setRange({ from: Math.min(to, Number(els.rangeFrom.value)), to });
});
els.btnWholePart.addEventListener('click', () => {
  setRange(null);
  els.rangeFrom.focus(); // knappen skjules, så fokus må et sted
});
els.optLoop.addEventListener('change', () => setLoop(els.optLoop.checked));
for (let t = TEMPO_MIN; t <= TEMPO_MAX; t += 5) els.optTarget.add(new Option(`${t} BPM`, String(t)));
els.optTarget.addEventListener('change', () => setTarget(Number(els.optTarget.value)));
[els.btnGo, els.btnLoopGo].forEach(b => b.addEventListener('click', () => {
  if ((run.active && run.kind === 'takt') || run.pending) stopRun(false); else startRun('takt');
}));
els.btnDemo.addEventListener('click', () => {
  if (run.active && run.kind === 'demo') stopRun(false); else startRun('demo');
});
els.btnReset.addEventListener('click', () => { stopRun(true); resetProgress(); refresh(); });
els.tempo.addEventListener('input', () => setTempo(Number(els.tempo.value)));
([['optOct', 'oct'], ['optLH', 'lh'], ['optAcc', 'acc'], ['optChordAll', 'chordAll']] as const).forEach(([id, key]) => {
  els[id].checked = store.settings[key] !== false;
  els[id].addEventListener('change', () => { store.settings[key] = els[id].checked; save(); });
});
initMicDiag();
els.optSens.value = store.settings.sens || 'middels';
els.optSens.addEventListener('change', () => { store.settings.sens = els.optSens.value as Sensitivity; save(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && (run.active || run.pending)) stopRun(false); });

/* ---------- Løkke ---------- */
let lastStatT = 0;
let lastError = '';
function frame(now: number): void {
  requestAnimationFrame(frame);
  try {
    if (mic.on) micFrame(now);
    if (run.active) runFrame(now);
    if (state.mode === 'vent' && state.tStart != null && !state.finished && now - lastStatT > 100) {
      lastStatT = now;
      els.v3.textContent = fmtSec(elapsed());
    }
  } catch (err) {
    // En feil i én ramme skal ikke stoppe mikrofonen og takten for godt. Meldingen vises én gang, så den kan meldes inn.
    const msg = err instanceof Error ? err.message : String(err);
    if (msg !== lastError) {
      lastError = msg;
      console.error(err);
      setStatus(`Noe gikk galt i appen: ${msg}`, 'bad');
    }
  }
}

// iPaden avbryter lydmotoren når man bytter app, og den våkner ikke alltid av seg selv. Et trykk vekker den.
const wakeAudio = (): void => { if (mic.on || run.active) audio(); };
document.addEventListener('pointerdown', wakeAudio, true);
document.addEventListener('keydown', wakeAudio, true);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') wakeAudio(); });

/* ---------- Start ---------- */
loadImported();
renderSongSelect();
renderCasioTable();
initImport();
state.hand = store.settings.hand === 'lh' || store.settings.hand === 'both' ? store.settings.hand : 'rh';
state.mode = store.settings.mode === 'takt' ? 'takt' : 'vent';
setSection(store.settings.section);
setView(store.settings.view);
// Arket tegnes på nytt når fontene har lastet, ellers blir notebredden og markøren feil
if (document.fonts && document.fonts.ready) void document.fonts.ready.then(() => { if (!els.sheet.hidden) { drawSheet(); refresh(); } });
requestAnimationFrame(frame);

installTestHook({ setSection, setMode, setTempo, startRun, stopRun, setRange, setLoop, setTarget });
initUpdates();
