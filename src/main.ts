import { audio, tone } from './audio/synth';
import { connectMidi } from './input/midi';
import { micFrame, toggleMic } from './input/mic';
import { sheet, sheetPerLine } from './notation/sheet';
import { emitInput } from './practice/input';
import { resetProgress, setTempo } from './practice/progress';
import { drawSheet, setHand, setMode, setSection, setView } from './practice/session';
import { runFrame, startRun, stopRun } from './practice/takt';
import { CATEGORY_LABEL, songs } from './songs';
import { SFX_KEYS, casioText } from './casio';
import { elapsed, mic, run, spell, state } from './state';
import { save, store, type Mode, type Sensitivity } from './storage';
import { installTestHook } from './testHook';
import { els } from './ui/dom';
import { initMicDiag } from './ui/micDiag';
import { fmtSec, refresh, setSetupOpen } from './ui/view';

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
function renderSongSelect(): void {
  els.selSong.innerHTML = '';
  (Object.keys(CATEGORY_LABEL) as (keyof typeof CATEGORY_LABEL)[]).forEach(cat => {
    const list = songs.filter(s => s.category === cat);
    if (!list.length) return;
    const group = document.createElement('optgroup');
    group.label = CATEGORY_LABEL[cat];
    list.forEach(s => {
      const o = document.createElement('option');
      o.value = s.id; o.textContent = s.title;
      group.append(o);
    });
    els.selSong.append(group);
  });
}
/** Tabellen over registreringer i «Oppsett for Casio CT-S400». */
function renderCasioTable(): void {
  const body = els.casioTable.tBodies[0];
  body.innerHTML = '';
  songs.filter(s => s.casio).sort((a, b) => a.casio!.reg[0] - b.casio!.reg[0] || a.casio!.reg[1] - b.casio!.reg[1]).forEach(s => {
    const c = s.casio!;
    const tr = body.insertRow();
    [`${c.reg[0]}-${c.reg[1]}`, s.title, casioText(c).replace(/^Registrering \d+-\d+: /, ''), c.tip ?? ''].forEach(text => {
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
  if (b) setHand(b.dataset.hand === 'lh' ? 'lh' : 'rh');
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
initMicDiag();
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
renderSongSelect();
renderCasioTable();
state.hand = store.settings.hand === 'lh' ? 'lh' : 'rh';
state.mode = store.settings.mode === 'takt' ? 'takt' : 'vent';
setSection(store.settings.section);
setView(store.settings.view);
// Arket tegnes på nytt når fontene har lastet, ellers blir notebredden og markøren feil
if (document.fonts && document.fonts.ready) void document.fonts.ready.then(() => { if (!els.sheet.hidden) { drawSheet(); refresh(); } });
requestAnimationFrame(frame);

installTestHook({ setSection, setMode, setTempo, startRun, stopRun });
