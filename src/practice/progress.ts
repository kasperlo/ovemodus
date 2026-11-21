import { run, state } from '../state';
import { save, store } from '../storage';
import { els } from '../ui/dom';
import { clearMarks, refresh, setHint } from '../ui/view';

export function resetProgress(): void {
  state.cur = 0; state.hits = 0; state.misses = 0; state.extra = 0;
  state.tStart = null; state.tEnd = null; state.finished = false; state.lastAcc = null; state.result = null;
  run.offsets = [];
  state.partial = false;
  state.model.steps.forEach(s => {
    s.judged = null; s.stumbled = false; s.offset = undefined; s.got = undefined;
    Object.values(s.parts ?? {}).forEach(p => { if (p) { p.judged = null; p.offset = undefined; } });
  });
  clearMarks();
  els.strip.scrollTop = 0;
  els.sheet.scrollTop = 0;
  setHint('');
}

export const TEMPO_MIN = 50, TEMPO_MAX = 220;

export function setTempo(v: number, quiet?: boolean): void {
  v = Math.max(TEMPO_MIN, Math.min(TEMPO_MAX, Math.round(v / 5) * 5));
  state.tempo = v;
  els.tempo.value = String(v);
  els.tempoOut.textContent = `${v} BPM`;
  store.settings.tempo[state.sec.id] = v;
  save();
  if (!quiet) refresh();
}
