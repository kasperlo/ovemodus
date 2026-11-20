import { build } from '../music/song';
import { renderSheet, sheet } from '../notation/sheet';
import { currentSong } from '../songs';
import { run, state } from '../state';
import { save, store, type Mode, type View } from '../storage';
import { els, segButtons } from '../ui/dom';
import { renderStrip } from '../ui/strip';
import { refresh, setHint } from '../ui/view';
import { resetProgress, setTempo } from './progress';
import { stopRun } from './takt';

export function drawSheet(): void {
  renderSheet(els.sheet, state.model, els.optLHStaff.checked, jumpTo);
}

export function setSection(id: string): void {
  stopRun(true);
  state.sec = currentSong.sections.find(s => s.id === id) || currentSong.sections[0];
  state.model = build(currentSong, state.sec);
  store.settings.section = state.sec.id;
  setTempo(store.settings.tempo[state.sec.id] || state.sec.tempo, true);
  renderStrip(state.model, jumpTo);
  sheet.dirty = true;
  drawSheet();
  resetProgress();
  save();
  refresh();
}

export function setMode(mode: Mode): void {
  stopRun(true);
  state.mode = mode;
  store.settings.mode = mode;
  save();
  resetProgress();
  refresh();
}

export function setView(v: string): void {
  const view: View = v === 'bokstaver' ? 'bokstaver' : 'noter';
  store.settings.view = view; save();
  segButtons(els.segView).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
  els.sheet.hidden = view !== 'noter';
  els.strip.hidden = view !== 'bokstaver';
  els.optLHStaffLabel.hidden = view !== 'noter';
  if (view === 'noter' && sheet.dirty) drawSheet();
  refresh();
}

/** Start «Vent på meg» fra en bestemt tone. Tiden lagres da ikke som rekord. */
export function jumpTo(si: number): void {
  if (run.active || state.mode !== 'vent') {
    setHint('Å starte fra en bestemt note virker i «Vent på meg».', '');
    return;
  }
  resetProgress();
  state.cur = si;
  state.partial = si > 0;
  refresh();
  if (si > 0) setHint(`Starter fra tone ${si + 1}: ${state.model.steps[si].name}. Tiden lagres ikke som rekord.`, 'ok');
}
