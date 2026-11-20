// Mikrofon: støyport, anslag og stabile tonehendelser. Ikke endre uten å kjøre mikrofontestene (se CLAUDE.md).
import { audio, audioCtx } from '../audio/synth';
import { emitInput } from '../practice/input';
import { mic, run, spell, state } from '../state';
import { store } from '../storage';
import { els } from '../ui/dom';
import { setPill, setStatus, updateButtons } from '../ui/view';
import { keepAwake } from '../wakeLock';
import type { Frame } from './calibrate';
import { estimatePitch, type PitchEstimate } from './pitch';

export const GATES: Record<string, number> = { lav: 0.02, middels: 0.008, hoy: 0.0035 };
/** Trekkes fra tidspunktet i «Spill i takt». */
const MIC_LATENCY = 70;
const STABLE_FRAMES = 3;
const SUSTAIN_FRAMES = 9;
const ATTACK_RATIO = 1.4;
const ATTACK_HOLDOFF_MS = 140;

const det = {
  cand: null as number | null,
  count: 0,
  emitted: null as number | null,
  silent: 99,
  /** Glidende snitt av RMS, for å finne anslag. */
  slow: 0,
  attackT: -1e9,
  afterAttack: false,
  floor: 0.002,
  shown: null as string | null
};

const gateFor = (sens: string): number =>
  (sens === 'kalibrert' ? store.settings.calGate : GATES[sens]) || GATES.middels;

/**
 * Mikrofontesten leser målingene her. Mens den er åpen (`live` eller `sample`) går ingen toner til øvingen.
 * I `sample` lagres hver ramme til kalibreringen.
 */
export const diag = {
  mode: 'off' as 'off' | 'live' | 'sample',
  rms: 0,
  gate: 0,
  pitch: null as PitchEstimate | null,
  frames: [] as Frame[]
};

export function setDiagMode(mode: typeof diag.mode): void {
  diag.mode = mode;
  det.cand = null; det.count = 0; det.emitted = null;
}

function meter(rms: number, gate: number): void {
  const lv = (x: number) => Math.max(0, Math.min(1, (20 * Math.log10(x + 1e-9) + 60) / 60));
  els.meterFill.style.width = (lv(rms) * 100).toFixed(1) + '%';
  els.meterGate.style.left = (lv(gate) * 100).toFixed(1) + '%';
}

function showHeard(m: number | null, f?: number): void {
  const key = m == null ? null : m + '|' + Math.round(f || 0);
  if (key === det.shown) return;
  det.shown = key;
  els.heard.innerHTML = '';
  els.heard.append(document.createTextNode('Hører: '));
  const s = document.createElement('strong');
  s.textContent = m == null ? '–' : spell(m);
  els.heard.append(s);
  if (f) els.heard.append(document.createTextNode(` · ${Math.round(f)} Hz`));
}

/** Kalles hver animasjonsramme mens mikrofonen er på. */
export function micFrame(now: number): void {
  if (!mic.analyser) return;
  const buf = mic.buf;
  mic.analyser.getFloatTimeDomainData(buf);
  let ss = 0;
  for (let i = 0; i < buf.length; i++) ss += buf[i] * buf[i];
  const rms = Math.sqrt(ss / buf.length);
  // Støygulv: følger stillheten raskt nedover og kryper sakte oppover
  if (rms < det.floor) det.floor = det.floor * 0.8 + rms * 0.2;
  else det.floor = Math.min(det.floor * 1.0003, 0.006);
  det.floor = Math.max(det.floor, 0.0003);
  const gate = Math.max(det.floor * 3, gateFor(els.optSens.value));
  meter(rms, gate);
  diag.rms = rms; diag.gate = gate;
  if (diag.mode !== 'off') {
    const p = rms >= gate || diag.mode === 'sample' ? estimatePitch(buf, audioCtx().sampleRate) : null;
    diag.pitch = p;
    if (diag.mode === 'sample') diag.frames.push({ rms, pitched: !!p });
    return;
  }
  if (now < state.suppressMicUntil || (run.active && run.kind === 'demo')) {
    det.cand = null; det.count = 0; det.slow = det.slow * 0.85 + rms * 0.15;
    return;
  }
  if (rms < gate) {
    det.cand = null; det.count = 0; det.silent++;
    if (det.silent > 5) { det.emitted = null; showHeard(null); }
    det.slow = det.slow * 0.9 + rms * 0.1;
    return;
  }
  det.silent = 0;
  // Et anslag må også være et absolutt hopp, så støy ikke gir falske anslag. 0,001 er for mye når lyden er svak
  // (iPad-mikrofonen gir rundt −59 dB), så hoppet skaleres med grensen når den er lavere enn «Høy».
  // For «Lav», «Middels» og «Høy» blir det 0,001 som før.
  if (rms > det.slow * ATTACK_RATIO + Math.min(0.001, gate * 0.3) && now - det.attackT > ATTACK_HOLDOFF_MS) {
    det.attackT = now; det.afterAttack = true; det.cand = null; det.count = 0;
  }
  det.slow = det.slow * 0.85 + rms * 0.15;
  const p = estimatePitch(buf, audioCtx().sampleRate);
  if (!p) { det.cand = null; det.count = 0; return; }
  const m = p.midi;
  showHeard(m, p.f);
  if (m === det.cand) det.count++; else { det.cand = m; det.count = 1; }
  if (det.count === STABLE_FRAMES) {
    if (m !== det.emitted || det.afterAttack) {
      const attack = det.afterAttack || det.emitted === null;
      det.emitted = m; det.afterAttack = false;
      emitInput(m, 'mic', now - MIC_LATENCY, { attack, phase: 'stable' });
    }
  } else if (det.count === SUSTAIN_FRAMES && det.emitted === m) {
    emitInput(m, 'mic', now, { attack: false, phase: 'sustain' });
  }
}

export async function toggleMic(): Promise<void> {
  if (mic.on) {
    mic.stream?.getTracks().forEach(t => t.stop());
    mic.on = false;
    keepAwake('mic', false);
    setPill(els.pillMic, 'Mikrofon av');
    setStatus('Mikrofonen er slått av.');
    meter(0, gateFor(els.optSens.value));
    showHeard(null);
    updateButtons();
    return;
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setPill(els.pillMic, 'Mikrofon blokkert', 'bad');
    setStatus('Mikrofonen er ikke tilgjengelig her. Last ned filen og åpne den direkte i Chrome eller Edge.', 'bad');
    return;
  }
  try {
    const ctx = audio();
    // Nettleserens lydbehandling er laget for tale og ødelegger pianotoner
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser();
    an.fftSize = 2048;
    src.connect(an);
    Object.assign(mic, { on: true, stream, analyser: an, buf: new Float32Array(an.fftSize) });
    det.floor = 0.002; det.emitted = null;
    keepAwake('mic', true);
    setPill(els.pillMic, 'Mikrofon på', 'on');
    setStatus('Mikrofonen lytter. Spill høyre hånd.', 'ok');
  } catch (err) {
    const name = (err as { name?: string } | null)?.name || '';
    setPill(els.pillMic, 'Mikrofon blokkert', 'bad');
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      setStatus('Nettleseren ga ikke tilgang til mikrofonen. Klikk på mikrofonikonet i adressefeltet, velg «Tillat» og prøv igjen.', 'bad');
    } else if (name === 'NotFoundError') {
      setStatus('Fant ingen mikrofon. Sjekk at PC-en har en mikrofon som er slått på.', 'bad');
    } else {
      setStatus('Mikrofonen kunne ikke startes (' + (name || 'ukjent feil') + ').', 'bad');
    }
  }
  updateButtons();
}
