import { casioText } from '../casio';
import { build, type Hand, type PracticeHand } from '../music/song';
import { sciName } from '../music/theory';
import { renderSheet, sheet } from '../notation/sheet';
import { findSection } from '../songs';
import { mic, run, state } from '../state';
import { save, store, type Mode, type View } from '../storage';
import { els, segButtons } from '../ui/dom';
import { KB_RANGE, keyboardRange, renderKeyboard } from '../ui/keyboard';
import { renderStrip } from '../ui/strip';
import { micListeningText, refresh, renderSegments, setHint, setStatus } from '../ui/view';
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
  const both = state.hand === 'both';
  const t = HAND_TEXT[state.hand === 'lh' ? 'lh' : 'rh'];
  els.subText.textContent = `Spill ${both ? 'med begge hender' : t.name}. Siden lytter, viser neste tangent og går videre når du treffer riktig.`;
  const split = state.model.split;
  const at = split === 60 ? 'midtre C' : split != null ? sciName(split) : '';
  els.optLHText.textContent = both ? 'MIDI: begge hender spilles, ingen toner ignoreres'
    : split == null ? 'MIDI: hendene overlapper i denne låten, så ingen toner ignoreres'
    : state.hand === 'rh' ? `MIDI: ignorer venstre hånd (under ${at})` : `MIDI: ignorer høyre hånd (fra ${at} og opp)`;
  els.optLH.disabled = both || split == null;
  els.optAccText.textContent = both ? 'Spill den andre hånden for meg (ikke i bruk med begge hender)' : `Spill ${t.other} for meg`;
  els.optAcc.disabled = both;
  els.optLHStaffText.textContent = both ? 'Viser begge hender' : `Vis ${t.other}`;
  els.optLHStaff.disabled = both;
  els.optLHStaff.checked = both || !!store.settings.lhStaff;
  segButtons(els.segHand).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.hand === state.hand)));
  if (mic.on) setStatus(micListeningText(), 'ok');
}

/** Bygger modellen på nytt for valgt del og hånd, og tegner alt som avhenger av den. */
function load(): void {
  stopRun(true);
  state.model = build(state.song, state.sec, state.hand);
  // Importerte noter kan mangle én hånd. Da øves den andre.
  if (!state.model.steps.length && state.hand !== 'both') {
    const other: Hand = state.hand === 'rh' ? 'lh' : 'rh';
    const alt = build(state.song, state.sec, other);
    if (alt.steps.length) {
      state.hand = other;
      state.model = alt;
      setHint(`Denne delen har bare ${other === 'rh' ? 'høyre' : 'venstre'} hånd.`, '');
    }
  }
  const hasLh = build(state.song, state.sec, 'lh').steps.length > 0;
  els.segHand.querySelectorAll<HTMLButtonElement>('button[data-hand="lh"], button[data-hand="both"]').forEach(b => { b.disabled = !hasLh; });
  if (state.hand === 'both' && !hasLh) { state.hand = 'rh'; state.model = build(state.song, state.sec, 'rh'); }
  renderKeyboard(state.hand === 'both'
    ? keyboardRange(state.model.steps, KB_RANGE.both, 48)
    : keyboardRange(state.model.steps, KB_RANGE[state.hand]));
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
  els.btnDeleteSong.hidden = song.category !== 'mine';
  els.secCasio.textContent = song.casio ? `Casio CT-S400 – ${casioText(song.casio)}.${song.casio.tip ? ' ' + song.casio.tip : ''}` : '';
  store.settings.section = sec.id;
  setTempo(store.settings.tempo[sec.id] || sec.tempo, true);
  save();
  load();
}

export function setHand(hand: PracticeHand): void {
  state.hand = hand === 'lh' || hand === 'both' ? hand : 'rh';
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
