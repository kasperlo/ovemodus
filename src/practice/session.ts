import { casioText } from '../casio';
import { build, type Hand, type PracticeHand, type Section } from '../music/song';
import { sciName } from '../music/theory';
import { renderSheet, sheet } from '../notation/sheet';
import { findSection } from '../songs';
import { mic, partId, run, state } from '../state';
import { save, store, type Mode, type View } from '../storage';
import { els, segButtons } from '../ui/dom';
import { KB_RANGE, keyboardRange, renderKeyboard } from '../ui/keyboard';
import { renderStrip } from '../ui/strip';
import { micListeningText, refresh, renderRange, renderSegments, setHint, setStatus } from '../ui/view';
import { resetProgress, setTempo } from './progress';
import { normalizeRange, rangeText, sliceSection, type BarRange } from './range';
import { cancelNextRound, stopRun } from './takt';

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

/** Delen man øver på: hele delen, eller bare taktene i utsnittet. */
const practiceSection = (): Section => state.range ? sliceSection(state.sec, state.range) : state.sec;

/** Bygger modellen på nytt for valgt del, utsnitt og hånd, og tegner alt som avhenger av den. */
function load(): void {
  stopRun(true);
  let note = '';
  let sec = practiceSection();
  state.model = build(state.song, sec, state.hand);
  // Et utsnitt med bare pauser kan ikke øves. Da øves hele delen.
  if (state.range && !build(state.song, sec, 'both').steps.length) {
    note = `${rangeText(state.sec, state.range)} har ingen toner. Du øver på hele delen.`;
    state.range = null;
    delete store.settings.ranges[state.sec.id];
    save();
    sec = state.sec;
    state.model = build(state.song, sec, state.hand);
  }
  // Importerte noter, og noen utsnitt, kan mangle én hånd. Da øves den andre.
  if (!state.model.steps.length && state.hand !== 'both') {
    const other: Hand = state.hand === 'rh' ? 'lh' : 'rh';
    const alt = build(state.song, sec, other);
    if (alt.steps.length) {
      state.hand = other;
      state.model = alt;
      note = `${state.range ? 'Disse taktene' : 'Denne delen'} har bare ${other === 'rh' ? 'høyre' : 'venstre'} hånd.`;
    }
  }
  const hasLh = build(state.song, sec, 'lh').steps.length > 0;
  els.segHand.querySelectorAll<HTMLButtonElement>('button[data-hand="lh"], button[data-hand="both"]').forEach(b => { b.disabled = !hasLh; });
  if (state.hand === 'both' && !hasLh) { state.hand = 'rh'; state.model = build(state.song, sec, 'rh'); }
  // Tastaturet følger hele delen, så det ikke hopper når man bytter utsnitt
  const all = state.range ? build(state.song, state.sec, state.hand).steps : state.model.steps;
  renderKeyboard(state.hand === 'both'
    ? keyboardRange(all, KB_RANGE.both, 48)
    : keyboardRange(all, KB_RANGE[state.hand]));
  renderStrip(state.model, jumpTo);
  handTexts();
  renderRange();
  sheet.dirty = true;
  drawSheet();
  resetProgress();
  if (note) setHint(note, '');
  refresh();
}

/** Tempoet som sist ble brukt for delen og utsnittet. Et nytt utsnitt starter i tempoet til hele delen. */
const savedTempo = (): number => store.settings.tempo[partId()] || store.settings.tempo[state.sec.id] || state.sec.tempo;

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
  const r = store.settings.ranges[sec.id];
  state.range = normalizeRange(sec, r ? { from: r[0], to: r[1] } : null);
  if (r && !state.range) delete store.settings.ranges[sec.id]; // delen har færre takter enn da utsnittet ble valgt
  setTempo(savedTempo(), true);
  save();
  load();
}

/** Øv på noen av taktene i delen, eller hele delen (`null`). */
export function setRange(r: BarRange | null): void {
  state.range = normalizeRange(state.sec, r);
  if (state.range) store.settings.ranges[state.sec.id] = [state.range.from, state.range.to];
  else delete store.settings.ranges[state.sec.id];
  setTempo(savedTempo(), true);
  save();
  load();
}

/** Gjenta: delen eller utsnittet starter på nytt av seg selv når det er ferdig. */
export function setLoop(on: boolean): void {
  store.settings.loop = on;
  els.optLoop.checked = on;
  save();
  // En runde som pågår, spilles ferdig. Står neste runde og venter, startes den ikke.
  if (!on) cancelNextRound();
  refresh();
}

/** Måltempoet for tempotrappen i denne delen. */
export function setTarget(bpm: number): void {
  store.settings.target[state.sec.id] = bpm;
  save();
  refresh();
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
