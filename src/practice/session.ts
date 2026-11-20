import { casioText } from '../casio';
import { build, type Hand } from '../music/song';
import { renderSheet, sheet } from '../notation/sheet';
import { findSection } from '../songs';
import { run, state } from '../state';
import { save, store, type Mode, type View } from '../storage';
import { els, segButtons } from '../ui/dom';
import { KB_RANGE, renderKeyboard } from '../ui/keyboard';
import { renderStrip } from '../ui/strip';
import { refresh, renderSegments, setHint } from '../ui/view';
import { resetProgress, setTempo } from './progress';
import { stopRun } from './takt';

export function drawSheet(): void {
  renderSheet(els.sheet, state.model, els.optLHStaff.checked, jumpTo);
}

const HAND_TEXT: Record<Hand, { name: string; other: string }> = {
  rh: { name: 'høyre hånd', other: 'venstre hånd' },
  lh: { name: 'venstre hånd', other: 'høyre hånd' }
};

/** Tekster som avhenger av hvilken hånd man øver på. */
function handTexts(): void {
  const t = HAND_TEXT[state.hand];
  els.subText.textContent = `Spill ${t.name}. Siden lytter, viser neste tangent og går videre når du treffer riktig.`;
  els.optLHText.textContent = state.hand === 'rh' ? 'MIDI: ignorer venstre hånd (under midtre C)' : 'MIDI: ignorer høyre hånd (fra midtre C og opp)';
  els.optAccText.textContent = `Spill ${t.other} for meg`;
  els.optLHStaffText.textContent = `Vis ${t.other}`;
  segButtons(els.segHand).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.hand === state.hand)));
}

/** Bygger modellen på nytt for valgt del og hånd, og tegner alt som avhenger av den. */
function load(): void {
  stopRun(true);
  state.model = build(state.song, state.sec, state.hand);
  renderKeyboard(KB_RANGE[state.hand]);
  renderStrip(state.model, jumpTo);
  handTexts();
  sheet.dirty = true;
  drawSheet();
  resetProgress();
  refresh();
}

export function setSection(id: string): void {
  const { song, sec } = findSection(id);
  state.song = song;
  state.sec = sec;
  renderSegments(song.sections, setSection);
  els.selSong.value = song.id;
  els.songTitle.textContent = song.title;
  els.secUse.textContent = [sec.use, song.by !== 'Egen' ? song.by : ''].filter(Boolean).join(' ');
  els.secCasio.textContent = song.casio ? `Casio CT-S400 – ${casioText(song.casio)}.${song.casio.tip ? ' ' + song.casio.tip : ''}` : '';
  store.settings.section = sec.id;
  setTempo(store.settings.tempo[sec.id] || sec.tempo, true);
  save();
  load();
}

export function setHand(hand: Hand): void {
  state.hand = hand === 'lh' ? 'lh' : 'rh';
  store.settings.hand = state.hand;
  save();
  load();
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
