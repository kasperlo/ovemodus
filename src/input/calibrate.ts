/** Én analyseramme fra mikrofonen under kalibreringen. */
export interface Frame {
  rms: number;
  /** Tonegjenkjenningen fant en sikker tone i rammen. */
  pitched: boolean;
}

export interface Calibration {
  /** Median RMS mens det var stille. */
  noise: number;
  /** 25. persentil av RMS i rammer med sikker tone: et typisk svakt, men tydelig anslag. */
  note: number;
  /** Andel av rammene med lyd der tonen ble gjenkjent. */
  pitchedShare: number;
  /** Anbefalt grense for hva som regnes som lyd. */
  gate: number;
  /** Råd til brukeren, tomt når alt ser bra ut. */
  advice: string[];
}

export const GATE_MIN = 0.0008, GATE_MAX = 0.03;

function quantile(xs: number[], q: number): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
}

/**
 * Grensen legges over støygulvet (×3, som i mic.ts) og godt under svake toner (×0,4),
 * så utklangen av en tone fortsatt høres. micdiag.spec.ts sjekker at grensen fra
 * opptaket av del A gjenkjenner alle tonene.
 */
export function analyzeCalibration(silence: number[], playing: Frame[]): Calibration {
  const noise = quantile(silence, 0.5);
  const sound = playing.filter(f => f.rms > Math.max(noise * 2, GATE_MIN));
  const pitched = sound.filter(f => f.pitched);
  const note = quantile(pitched.map(f => f.rms), 0.25);
  const pitchedShare = sound.length ? pitched.length / sound.length : 0;
  const gate = Math.min(GATE_MAX, Math.max(GATE_MIN, noise * 3, note * 0.4));
  const advice: string[] = [];
  // En ekte mikrofon gir alltid litt støy. Bare nuller betyr at nettleseren ikke sender lyd i det hele tatt.
  if ([...silence, ...playing.map(f => f.rms)].every(x => x === 0)) {
    advice.push('Mikrofonen gir ingen lyd i det hele tatt (−120 dB er helt stille). Slå mikrofonen av og på igjen, eller last siden på nytt. Har du byttet app, kan iPaden ha stengt lyden til nettleseren.');
  } else if (!pitched.length) {
    advice.push('Fant ingen toner. Spill litt kraftigere, skru opp volumet på keyboardet eller flytt iPaden nærmere høyttalerne.');
  } else {
    if (note < 0.004) advice.push('Tonene er svake når de når mikrofonen. «Bruk denne følsomheten» tar høyde for det. Blir toner fortsatt borte, flytt iPaden nærmere høyttalerne.');
    if (noise * 3 > note * 0.5) advice.push('Bakgrunnsstøyen er nesten like sterk som tonene. Finn et roligere sted eller skru opp keyboardet.');
    if (pitchedShare < 0.5) advice.push('Mange toner var vanskelige å kjenne igjen. Bruk en ren pianolyd uten klang eller chorus.');
  }
  return { noise, note, pitchedShare, gate, advice };
}

export const toDb = (x: number): number => Math.round(20 * Math.log10(Math.max(x, 1e-6)));
