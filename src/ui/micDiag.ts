import { audioCtx } from '../audio/synth';
import { analyzeCalibration, toDb, type Calibration } from '../input/calibrate';
import { GATES, diag, setDiagMode, toggleMic } from '../input/mic';
import { sciName } from '../music/theory';
import { mic } from '../state';
import { save, store } from '../storage';
import { els } from './dom';

const SILENCE_MS = 2000, PLAY_MS = 8000;

let liveTimer: number | undefined;
let calTimer: number | undefined;
let lastCal: Calibration | null = null;
let settingsRows: [string, string, boolean][] = [];

// Nyere nettlesere kan oppgi ekkofjerning som tekst («all», «remote-only») i stedet for true/false.
const db = (x: number): string => `${toDb(x)} dB`.replace('-', '−');

const onOff = (v: boolean | string | undefined): string => v === undefined ? 'ikke oppgitt' : v === true ? 'på' : v === false ? 'av' : v;
const isOn = (v: boolean | string | undefined): boolean => v !== undefined && v !== false;

function readSettings(): [string, string, boolean][] {
  const track = mic.stream?.getAudioTracks()[0];
  if (!track) return [['Mikrofon', 'ikke på', true]];
  const s = track.getSettings() as MediaTrackSettings & { sampleRate?: number; channelCount?: number };
  return [
    ['Mikrofon', track.label || 'ukjent', false],
    // Appen ber om at disse er av. Står de på, behandler nettleseren lyden som tale og kan dempe pianotonene.
    ['Ekkofjerning', onOff(s.echoCancellation), isOn(s.echoCancellation)],
    ['Støydemping', onOff(s.noiseSuppression), isOn(s.noiseSuppression)],
    ['Automatisk volum', onOff(s.autoGainControl), isOn(s.autoGainControl)],
    ['Samplingsfrekvens', `${s.sampleRate ? s.sampleRate + ' Hz (mikrofon), ' : ''}${audioCtx().sampleRate} Hz (lydmotor)`, false],
    ['Følsomhet', `${els.optSens.selectedOptions[0]?.textContent ?? els.optSens.value} (grense ${db(diag.gate || GATES.middels)})`, false]
  ];
}

function renderSettings(): void {
  settingsRows = readSettings();
  els.diagSettings.innerHTML = '';
  settingsRows.forEach(([k, v, warn]) => {
    const dt = document.createElement('dt'); dt.textContent = k;
    const dd = document.createElement('dd'); dd.textContent = v + (warn ? ' – kan dempe pianotoner' : '');
    if (warn) dd.className = 'warn';
    els.diagSettings.append(dt, dd);
  });
}

function liveText(): string {
  if (!mic.on) return 'Mikrofonen er ikke på.';
  const p = diag.pitch;
  const heard = p ? `${sciName(p.midi)} (${Math.round(p.f)} Hz, ${p.cents > 0 ? '+' : ''}${p.cents} cent, sikkerhet ${p.conf.toFixed(2).replace('.', ',')})` : '–';
  return `Nivå ${db(diag.rms)} · grense ${db(diag.gate)} · hører ${heard}`;
}

function renderLive(): void {
  els.diagLive.textContent = liveText();
}

const presetName = (gate: number): string => {
  if (gate >= GATES.lav) return 'som «Lav»';
  if (gate >= GATES.middels) return 'mellom «Lav» og «Middels»';
  if (gate >= GATES.hoy) return 'mellom «Middels» og «Høy»';
  return 'lavere enn «Høy»';
};

export function ensureCalibratedOption(): void {
  const gate = store.settings.calGate;
  if (!gate) return;
  let opt = els.optSens.querySelector<HTMLOptionElement>('option[value="kalibrert"]');
  if (!opt) {
    opt = document.createElement('option');
    opt.value = 'kalibrert';
    els.optSens.append(opt);
  }
  opt.textContent = `Kalibrert (${db(gate)})`;
}

function renderResult(c: Calibration): void {
  els.diagResult.innerHTML = '';
  const p = document.createElement('p');
  p.textContent = c.note
    ? `Stille: ${db(c.noise)}. Svake toner: ${db(c.note)}. Gjenkjent: ${Math.round(c.pitchedShare * 100)} % av lyden. ` +
      `Anbefalt grense: ${db(c.gate)}, ${presetName(c.gate)}.`
    : `Stille: ${db(c.noise)}.`;
  els.diagResult.append(p);
  if (c.advice.length) {
    const ul = document.createElement('ul');
    c.advice.forEach(a => { const li = document.createElement('li'); li.textContent = a; ul.append(li); });
    els.diagResult.append(ul);
  }
  if (!c.note) return;
  const row = document.createElement('div'); row.className = 'row';
  const use = document.createElement('button');
  use.type = 'button'; use.className = 'btn primary'; use.id = 'btnUseCal';
  use.textContent = 'Bruk denne følsomheten';
  use.addEventListener('click', () => {
    store.settings.calGate = c.gate;
    store.settings.sens = 'kalibrert';
    save();
    ensureCalibratedOption();
    els.optSens.value = 'kalibrert';
    use.disabled = true;
    use.textContent = 'Følsomheten er satt til «Kalibrert»';
    renderSettings();
  });
  row.append(use);
  els.diagResult.append(row);
}

function countdown(text: string, ms: number, done: () => void): void {
  const end = performance.now() + ms;
  const tick = () => {
    const left = Math.ceil((end - performance.now()) / 1000);
    if (left <= 0) { done(); return; }
    els.diagStep.textContent = `${text} ${left} …`;
    calTimer = window.setTimeout(tick, 200);
  };
  tick();
}

let micStarting: Promise<void> | null = null;

async function startCalibration(): Promise<void> {
  els.btnCal.disabled = true;
  await micStarting;
  if (!mic.on) {
    els.diagStep.textContent = 'Mikrofonen er ikke på. Se meldingen under mikrofonknappen.';
    els.btnCal.disabled = false;
    return;
  }
  els.diagResult.innerHTML = '';
  diag.frames = [];
  setDiagMode('sample');
  countdown('Vær helt stille.', SILENCE_MS, () => {
    const silence = diag.frames.map(f => f.rms);
    diag.frames = [];
    countdown('Spill noen toner som vanlig, for eksempel begynnelsen av del A.', PLAY_MS, () => {
      const playing = diag.frames;
      setDiagMode('live');
      lastCal = analyzeCalibration(silence, playing);
      els.diagStep.textContent = 'Ferdig.';
      els.btnCal.disabled = false;
      els.btnCal.textContent = 'Kalibrer på nytt';
      renderResult(lastCal);
    });
  });
}

function report(): string {
  const lines = [
    `Øvemodus – mikrofontest ${new Date().toLocaleString('nb-NO')}`,
    `Nettleser: ${navigator.userAgent}`,
    ...settingsRows.map(([k, v]) => `${k}: ${v}`),
    `Akkurat nå: ${liveText()}`
  ];
  if (lastCal) {
    lines.push(
      `Kalibrering: stille ${db(lastCal.noise)}, svake toner ${db(lastCal.note)}, gjenkjent ${Math.round(lastCal.pitchedShare * 100)} %, anbefalt grense ${db(lastCal.gate)} (${lastCal.gate.toFixed(4)})`,
      ...lastCal.advice.map(a => `Råd: ${a}`)
    );
  }
  return lines.join('\n');
}

async function copyReport(): Promise<void> {
  try {
    await navigator.clipboard.writeText(report());
    els.diagCopied.textContent = 'Kopiert';
  } catch {
    els.diagCopied.textContent = 'Kunne ikke kopiere';
  }
  setTimeout(() => { els.diagCopied.textContent = ''; }, 2500);
}

async function openMicDiag(): Promise<void> {
  els.diag.showModal();
  setDiagMode('live');
  if (!mic.on) {
    micStarting = toggleMic();
    await micStarting;
    micStarting = null;
  }
  renderSettings();
  renderLive();
  liveTimer = window.setInterval(renderLive, 150);
}

function onClose(): void {
  clearInterval(liveTimer);
  clearTimeout(calTimer);
  setDiagMode('off');
  els.btnCal.disabled = false;
  if (els.diagStep.textContent?.endsWith('…')) els.diagStep.textContent = 'Kalibreringen ble avbrutt.';
}

export function initMicDiag(): void {
  ensureCalibratedOption();
  els.btnDiag.addEventListener('click', () => { void openMicDiag(); });
  els.btnCal.addEventListener('click', () => { void startCalibration(); });
  els.btnCopy.addEventListener('click', () => { void copyReport(); });
  els.diag.addEventListener('close', onClose);
}

