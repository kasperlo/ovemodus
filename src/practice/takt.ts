import { audio, audioCtx, click, masterBus, tone } from '../audio/synth';
import { pc } from '../music/theory';
import { avgOffsetMs, mic, run, spell, state, type RunKind } from '../state';
import { setTaktRecord, taktRecord } from '../storage';
import { els } from '../ui/dom';
import { flashKey } from '../ui/keyboard';
import { celebrate, markStep, markTiming, refresh, setHint } from '../ui/view';
import { keepAwake } from '../wakeLock';
import type { InputEvent } from './input';
import { RECORD_MIN_PCT, hitWindow, matches, timingText } from './judge';
import { TEMPO_MAX, TEMPO_MIN, resetProgress, setTempo } from './progress';

/** Når appen spiller venstre hånd gjennom høyttaleren, er mikrofontoner under dette venstre hånd. */
const MIC_LH_BELOW = 55;

/** Starter «Spill i takt» (innteller + metronom) eller demo (appen spiller selv). */
export function startRun(kind: RunKind): void {
  stopRun(true);
  const ac = audio();
  resetProgress();
  const M = state.model;
  const tempo = state.tempo, e8 = 30 / tempo;
  const countIn = kind === 'takt' ? 8 * e8 : 0;
  const lead = 0.3;
  const outLat = (ac.outputLatency || ac.baseLatency || 0);
  const at = ac.currentTime + lead;
  run.t0 = performance.now() + (lead + outLat) * 1000;
  keepAwake('run', true);
  Object.assign(run, { active: true, kind, e8, countIn, tempo, cursor: -1, lastCursor: -2, lastBeat: -1, offsets: [] });
  const bus = ac.createGain();
  bus.connect(masterBus());
  run.bus = bus;
  M.steps.forEach(s => {
    s.t = countIn + s.pos * e8;
    s.dur = s.d * e8;
    s.win = hitWindow(s.dur, e8);
    s.judged = null;
  });
  run.end = countIn + M.total * e8;
  if (kind === 'takt') {
    const beats = Math.round(run.end / (2 * e8));
    for (let b = 0; b < beats; b++) click(at + b * 2 * e8, b % 4 === 0, bus);
  } else {
    M.steps.forEach(s => (s.type === 'chord' ? s.midis : [s.midi])
      .forEach(m => tone(m, at + s.t!, s.dur! * (s.d >= 4 ? 0.85 : 0.55), 0.9, bus)));
  }
  if (els.optAcc.checked) {
    M.lh.forEach(ev => ev.midis.forEach(m => tone(m, at + countIn + ev.pos * e8, ev.d * e8 * 0.5, 0.55, bus)));
  }
  if (kind === 'takt' && mic.on && els.optAcc.checked) setHint('Tips: bruk hodetelefoner, så forveksler ikke mikrofonen venstre hånd med deg.', '');
  refresh();
}

export function stopRun(quiet?: boolean): void {
  if (!run.active) return;
  run.active = false;
  keepAwake('run', false);
  const bus = run.bus;
  try { bus!.gain.setTargetAtTime(0, audioCtx().currentTime, 0.02); } catch { /* ignorer */ }
  setTimeout(() => { try { bus!.disconnect(); } catch { /* ignorer */ } }, 250);
  if (!quiet) { resetProgress(); refresh(); }
}

/** Kalles hver animasjonsramme mens en runde pågår. */
export function runFrame(now: number): void {
  const tt = (now - run.t0) / 1000;
  const steps = state.model.steps;
  let changed = false;
  if (run.kind === 'takt') {
    for (const s of steps) {
      if (s.t! - s.win! > tt) break;
      if (!s.judged && tt > s.t! + s.win!) {
        s.judged = 'miss'; state.misses++;
        markStep(s.si, 'missed');
        changed = true;
      }
    }
    run.cursor = steps.findIndex(s => !s.judged);
    const beat = tt < run.countIn ? Math.floor(tt / (2 * run.e8)) : 99;
    if (beat !== run.lastBeat) { run.lastBeat = beat; changed = true; }
  } else {
    let c = -1;
    for (const s of steps) { if (tt >= s.t! - 0.005) c = s.si; else break; }
    run.cursor = c;
  }
  if (run.cursor !== run.lastCursor) { run.lastCursor = run.cursor; changed = true; }
  if (changed) refresh();
  if (tt > run.end + 0.4) finishRun();
}

export function judgeTakt(m: number, t: number, ev: InputEvent): void {
  if (ev.src === 'mic' && ev.phase === 'sustain') return;
  if (ev.src === 'mic' && els.optAcc.checked && m < MIC_LH_BELOW) return;
  const tt = (t - run.t0) / 1000;
  if (tt < run.countIn - 0.3) return;
  let best = null, bd = 1e9;
  for (const s of state.model.steps) {
    if (s.judged) continue;
    const dt = tt - s.t!;
    if (dt < -s.win!) break;
    if (Math.abs(dt) <= s.win! && matches(s, m, els.optOct.checked) && Math.abs(dt) < bd) { best = s; bd = Math.abs(dt); }
  }
  if (best) {
    best.judged = 'hit';
    state.hits++;
    state.lastAcc = m;
    best.offset = tt - best.t!;
    run.offsets.push(best.offset);
    markStep(best.si, 'hit');
    markTiming(best.si, best.offset);
    flashKey(m, 'hit');
  } else {
    if (ev.src === 'mic' && !ev.attack && state.lastAcc != null && pc(m) === pc(state.lastAcc)) return;
    state.extra++;
    flashKey(m, 'wrong');
    setHint(`Feil tone eller utenfor takt: ${spell(m)}`, 'bad');
  }
  refresh();
}

function finishRun(): void {
  const kind = run.kind;
  run.active = false;
  keepAwake('run', false);
  const bus = run.bus;
  setTimeout(() => { try { bus!.disconnect(); } catch { /* ignorer */ } }, 1500);
  if (kind === 'takt') {
    const steps = state.model.steps, n = steps.length;
    const hits = steps.filter(s => s.judged === 'hit').length;
    const pct = Math.round(100 * hits / n);
    const prev = taktRecord(state.sec.id);
    let badge: string | null = null;
    if (pct >= RECORD_MIN_PCT && (!prev || state.tempo > prev.tempo)) {
      setTaktRecord(state.sec.id, { tempo: state.tempo, pct });
      badge = prev ? 'Ny rekord!' : 'Rekord lagret';
    }
    const timing = run.offsets.length ? timingText(avgOffsetMs()) : 'Ingen treff denne gangen. Prøv et lavere tempo.';
    const faster = Math.min(TEMPO_MAX, state.tempo + 10), slower = Math.max(TEMPO_MIN, state.tempo - 10);
    const next: [string, () => void] = pct >= RECORD_MIN_PCT
      ? [`Litt raskere (${faster} BPM)`, () => { setTempo(faster, true); startRun('takt'); }]
      : [`Litt saktere (${slower} BPM)`, () => { setTempo(slower, true); startRun('takt'); }];
    state.result = {
      label: 'Runden er ferdig', big: pct + ' %', small: true,
      sub: `${hits} av ${n} toner i takt ved ${state.tempo} BPM`,
      then: timing, badge,
      actions: [['Én gang til', () => startRun('takt'), true], next]
    };
    if (pct >= RECORD_MIN_PCT) celebrate();
  } else {
    state.result = null;
    resetProgress();
  }
  refresh();
}
