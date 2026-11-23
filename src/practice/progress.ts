import { partId, run, state } from '../state';
import { save, store } from '../storage';
import { els } from '../ui/dom';
import { clearMarks, refresh, setHint } from '../ui/view';
import { TEMPO_MAX, TEMPO_MIN } from './ladder';

export { TEMPO_MAX, TEMPO_MIN };

export function resetProgress(): void {
  state.cur = 0; state.hits = 0; state.misses = 0; state.extra = 0;
  state.tStart = null; state.tEnd = null; state.finished = false; state.lastAcc = null; state.result = null;
  run.offsets = [];
  state.partial = false;
  state.model.steps.forEach(s => {
    s.judged = null; s.stumbled = false; s.offset = undefined; s.got = undefined; s.played = undefined;
    Object.values(s.parts ?? {}).forEach(p => { if (p) { p.judged = null; p.offset = undefined; p.played = undefined; } });
  });
  clearMarks();
  els.strip.scrollTop = 0;
  els.sheet.scrollTop = 0;
  setHint('');
}

/** Setter tempoet. Det huskes per del, og for seg for hvert utsnitt av delen. */
export function setTempo(v: number, quiet?: boolean): void {
  v = Math.max(TEMPO_MIN, Math.min(TEMPO_MAX, Math.round(v / 5) * 5));
  state.tempo = v;
  els.tempo.value = String(v);
  els.tempoOut.textContent = `${v} BPM`;
  store.settings.tempo[partId()] = v;
  save();
  if (!quiet) refresh();
}
