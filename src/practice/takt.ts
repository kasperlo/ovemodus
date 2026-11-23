import { audio, audioCtx, click, masterBus, tone } from '../audio/synth';
import { clickLength, countInBars, type Hand, type PracticeHand, type Step } from '../music/song';
import { pc } from '../music/theory';
import { trillUpper } from '../notation/abc';
import { avgOffsetMs, mic, partId, run, spell, state, targetTempo, type RunKind } from '../state';
import { progressOf, setProgress, setTaktRecord, store, taktRecord } from '../storage';
import { els } from '../ui/dom';
import { flashKey } from '../ui/keyboard';
import { celebrate, markStep, markTiming, refresh, setHint } from '../ui/view';
import { keepAwake } from '../wakeLock';
import type { InputEvent } from './input';
import { RECORD_MIN_PCT, handOf, hitWindow, matches, matchesPart, timingText } from './judge';
import { addRound, dayKey, ladderText, nextTempo } from './ladder';
import { TEMPO_MAX, TEMPO_MIN, resetProgress, setTempo } from './progress';

/** Pause mellom rundene i løkken, så man rekker å se resultatet før neste inntelling. */
export const LOOP_PAUSE_MS = 1000;
let nextRound: number | undefined;

/**
 * Når appen spiller den andre hånden gjennom høyttaleren, hører mikrofonen den også.
 * Øver man høyre hånd, er toner mer enn en kvart under skillet appens venstre hånd (under MIDI 55 når skillet er midtre C).
 * Øver man venstre, er toner fra skillet og opp appens høyre hånd.
 */
const isAccompaniment = (m: number, hand: PracticeHand, split: number | null): boolean =>
  hand !== 'both' && split != null && (hand === 'rh' ? m < split - 5 : m >= split);

const handsOf = (s: Step): Hand[] => (['rh', 'lh'] as Hand[]).filter(h => s.parts?.[h]);

/** Begge hender: steget får farge når begge delene er dømt, treff bare hvis begge traff. */
function settle(s: Step): void {
  const hs = handsOf(s);
  if (hs.some(h => !s.parts![h]!.judged)) return;
  const allHit = hs.every(h => s.parts![h]!.judged === 'hit');
  s.judged = allHit ? 'hit' : 'miss';
  markStep(s.si, allHit ? 'hit' : 'missed');
}

/**
 * Avspilling av forsiringer: forslagsnotene rett før tonen, og trillen som veksling mellom tonen over og hovedtonen,
 * til slutt på hovedtonen. Gir hovedtonen i trillen tilbake, så den ikke spilles to ganger.
 */
function playOrnaments(s: Step, at: number, e8: number, key: string, bus: GainNode): number | undefined {
  const o = s.ornaments;
  if (!o) return undefined;
  const g = Math.min(0.07, e8 / 4);
  o.grace?.forEach((m, i, all) => tone(m, at + s.t! - (all.length - i) * g, g * 1.2, 0.7, bus));
  if (o.trill == null) return undefined;
  const up = trillUpper(o.trill, key), len = Math.min(0.09, Math.max(0.05, e8 / 4));
  const n = Math.max(2, 2 * Math.floor(s.dur! * 0.85 / len / 2));
  for (let i = 0; i < n; i++) tone(i % 2 ? o.trill : up, at + s.t! + i * len, len * 1.1, 0.8, bus);
  return o.trill;
}

/** Starter «Spill i takt» (innteller + metronom) eller demo (appen spiller selv). */
export function startRun(kind: RunKind): void {
  const continues = kind === 'takt' && run.pending;
  stopRun(true);
  run.round = continues ? run.round + 1 : 1;
  const ac = audio();
  resetProgress();
  const M = state.model;
  const tempo = state.tempo, e8 = 30 / tempo;
  const meter = M.song.meter;
  const clickLen = clickLength(meter);
  const countIn = kind === 'takt' ? countInBars(meter) * M.barLen * e8 : 0;
  const lead = 0.3;
  const outLat = (ac.outputLatency || ac.baseLatency || 0);
  const at = ac.currentTime + lead;
  run.t0 = performance.now() + (lead + outLat) * 1000;
  keepAwake('run', true);
  Object.assign(run, { active: true, kind, e8, countIn, clickLen, countInClicks: Math.round(countIn / (clickLen * e8)), tempo, cursor: -1, lastCursor: -2, lastBeat: -1, offsets: [] });
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
    const clicks = Math.round(run.end / (clickLen * e8));
    const perBar = Math.round(M.barLen / clickLen);
    for (let b = 0; b < clicks; b++) click(at + b * clickLen * e8, b % perBar === 0, bus);
  } else {
    M.steps.forEach(s => {
      const trilled = playOrnaments(s, at, e8, M.song.key, bus);
      (s.type === 'chord' ? s.midis : [s.midi]).forEach(m => {
        if (m !== trilled) tone(m, at + s.t!, s.dur! * (s.d >= 4 ? 0.85 : 0.55), 0.9, bus);
      });
    });
  }
  if (els.optAcc.checked) {
    M.acc.forEach(ev => ev.midis.forEach(m => tone(m, at + countIn + ev.pos * e8, ev.d * e8 * 0.5, 0.55, bus)));
  }
  if (kind === 'takt' && mic.on && els.optAcc.checked) setHint('Tips: bruk hodetelefoner, så forveksler ikke mikrofonen venstre hånd med deg.', '');
  refresh();
}

/**
 * Avlyser neste runde i løkken hvis den står og venter. Resultatet av forrige runde blir stående,
 * med en knapp for å starte igjen i stedet for «Stopp».
 */
export function cancelNextRound(): boolean {
  if (!run.pending) return false;
  clearTimeout(nextRound);
  nextRound = undefined;
  run.pending = false;
  keepAwake('run', false);
  if (state.result) state.result.actions = [[store.settings.loop ? 'Start løkken igjen' : 'Én gang til', () => startRun('takt'), true]];
  return true;
}

export function stopRun(quiet?: boolean): void {
  const waited = cancelNextRound();
  if (!run.active) {
    if (waited && !quiet) refresh();
    return;
  }
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
      if (s.judged || tt <= s.t! + s.win!) continue;
      if (s.parts) {
        handsOf(s).forEach(h => { const p = s.parts![h]!; if (!p.judged) { p.judged = 'miss'; state.misses++; } });
        settle(s);
      } else {
        s.judged = 'miss'; state.misses++;
        markStep(s.si, 'missed');
      }
      changed = true;
    }
    run.cursor = steps.findIndex(s => !s.judged);
    const beat = tt < run.countIn ? Math.floor(tt / (run.clickLen * run.e8)) : 99;
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
  if (ev.src === 'mic' && els.optAcc.checked && isAccompaniment(m, state.hand, state.model.split)) return;
  const tt = (t - run.t0) / 1000;
  if (tt < run.countIn - 0.3) return;
  if (state.model.hand === 'both') { judgeTaktBoth(m, tt, ev); return; }
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

/** Begge hender: tonen tilordnes en hånd og dømmes mot den hånden sin del av nærmeste steg. */
function judgeTaktBoth(m: number, tt: number, ev: InputEvent): void {
  const anyOct = els.optOct.checked;
  const hand = handOf(m, state.model.split, ev.channel);
  let best: { s: Step; h: Hand } | null = null, bd = 1e9;
  for (const s of state.model.steps) {
    if (s.judged) continue;
    const dt = tt - s.t!;
    if (dt < -s.win!) break;
    if (Math.abs(dt) > s.win!) continue;
    for (const h of handsOf(s)) {
      const p = s.parts![h]!;
      if (p.judged || (hand && hand !== h) || !matchesPart(p, m, anyOct)) continue;
      if (Math.abs(dt) < bd) { best = { s, h }; bd = Math.abs(dt); }
    }
  }
  if (best) {
    const p = best.s.parts![best.h]!;
    p.judged = 'hit';
    p.offset = tt - best.s.t!;
    state.hits++;
    // Som i «Vent på meg»: bare høyre hånds tone kan klinge videre uten nytt anslag i mikrofonen
    if (best.h === 'rh') state.lastAcc = m;
    run.offsets.push(p.offset);
    markTiming(best.s.si, p.offset, best.h);
    flashKey(m, 'hit');
    settle(best.s);
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
  const bus = run.bus;
  setTimeout(() => { try { bus!.disconnect(); } catch { /* ignorer */ } }, 1500);
  if (kind !== 'takt') {
    keepAwake('run', false);
    state.result = null;
    resetProgress();
    refresh();
    return;
  }
  // Med begge hender teller hver hånd sin del som én tone
  const units = state.model.steps.flatMap(s => s.parts ? handsOf(s).map(h => s.parts![h]!.judged) : [s.judged]);
  const n = units.length, hits = units.filter(j => j === 'hit').length;
  const pct = Math.round(100 * hits / n);
  const part = partId(), tempo = state.tempo;
  const prev = taktRecord(part, state.hand);
  let badge: string | null = null;
  if (pct >= RECORD_MIN_PCT && (!prev || tempo > prev.tempo)) {
    setTaktRecord(part, state.hand, { tempo, pct });
    badge = prev ? 'Ny rekord!' : 'Rekord lagret';
  }
  setProgress(part, state.hand, 'takt', addRound(progressOf(part, state.hand, 'takt'), { at: Date.now(), tempo, pct }, dayKey(new Date())));
  const timing = run.offsets.length ? timingText(avgOffsetMs()) : 'Ingen treff denne gangen. Prøv et lavere tempo.';
  if (store.settings.loop) {
    // Kortet holder samme høyde som under runden (uten merke og knapper), så tastaturet ikke hopper hver runde
    const target = targetTempo();
    const next = nextTempo(tempo, pct, target);
    const label = `Runde ${run.round}${badge ? ' · ' + badge.replace('!', '').toLowerCase() : ''}`;
    state.result = { label, big: pct + ' %', small: true, sub: `${hits} av ${n} i takt ved ${tempo} BPM`, then: `${ladderText(next, target)} ${timing}`, badge: null, actions: [] };
    setTempo(next.tempo, true);
    run.pending = true;
    nextRound = window.setTimeout(() => { nextRound = undefined; if (run.pending) startRun('takt'); }, LOOP_PAUSE_MS);
  } else {
    keepAwake('run', false);
    const faster = Math.min(TEMPO_MAX, tempo + 10), slower = Math.max(TEMPO_MIN, tempo - 10);
    const next: [string, () => void] = pct >= RECORD_MIN_PCT
      ? [`Litt raskere (${faster} BPM)`, () => { setTempo(faster, true); startRun('takt'); }]
      : [`Litt saktere (${slower} BPM)`, () => { setTempo(slower, true); startRun('takt'); }];
    const sub = `${hits} av ${n} toner i takt ved ${tempo} BPM`;
    state.result = { label: 'Runden er ferdig', big: pct + ' %', small: true, sub, then: timing, badge, actions: [['Én gang til', () => startRun('takt'), true], next] };
  }
  if (pct >= RECORD_MIN_PCT) celebrate();
  refresh();
}
