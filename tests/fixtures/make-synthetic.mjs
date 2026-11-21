// Lager kunstige pianoopptak til mikrofontestene, uten lydfont eller FluidSynth.
// Tonene har inharmoniske overtoner og avtar som et piano. Bruk: node tests/fixtures/make-synthetic.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 48000;
const dir = path.dirname(fileURLToPath(import.meta.url));

const midiHz = m => 440 * 2 ** ((m - 69) / 12);

/** Én pianoaktig tone som begynner ved `t0` og slippes ved `t1` (sekunder). */
function addNote(buf, midi, t0, t1, vel, B = 0.0004) {
  const f0 = midiHz(midi);
  const start = Math.round(t0 * SR), stop = Math.round(t1 * SR), end = Math.min(buf.length, stop + Math.round(0.4 * SR));
  for (let n = 1; n <= 12; n++) {
    const fn = n * f0 * Math.sqrt(1 + B * n * n);
    if (fn > SR / 2) break;
    const amp = vel * 0.3 / n ** 0.8, tau = 1.6 / (1 + 0.35 * n), ph = n * 1.3;
    for (let i = start; i < end; i++) {
      const t = (i - start) / SR;
      const attack = Math.min(1, t / 0.003);
      const release = i < stop ? 1 : Math.exp(-(i - stop) / SR / 0.06);
      // Piano faller raskt rett etter anslaget og klinger så lenge ut (to-trinns utklingning)
      const env = 0.65 * Math.exp(-t / 0.15) + 0.35 * Math.exp(-t / tau);
      buf[i] += amp * attack * release * env * Math.sin(2 * Math.PI * fn * t + ph);
    }
  }
}

function writeWav(file, samples, gainDb) {
  const g = 10 ** (gainDb / 20);
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((x, i) => data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(x * g * 32767))), i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(path.join(dir, file), Buffer.concat([h, data]));
}

/**
 * Hjerteslaget i «Spenning» med venstre hånd (A2 A2 på første slag i fire takter, 104 BPM), legato:
 * den andre A2-en slås an mens den første fortsatt klinger, så appen må høre anslaget for å telle den.
 */
function heartbeat(gainDb, file) {
  const e8 = 30 / 104, bar = 8 * e8, lead = 1.5;
  const total = lead + 4 * bar + 3;
  const buf = new Float64Array(Math.round(total * SR));
  for (let b = 0; b < 4; b++) {
    const t = lead + b * bar;
    addNote(buf, 45, t, t + e8, 0.9);
    addNote(buf, 45, t + e8, t + 2 * e8, 0.9);
  }
  writeWav(file, buf, gainDb);
}

/**
 * Del A av «I Dovregubbens hall» med begge hender, 100 BPM: høyre hånd staccato, venstre hånd A2 + E3 på hvert slag.
 * Timing og styrke varierer litt, som når man spiller selv (fast frø, så filen blir lik hver gang). Venstre hånd
 * kommer skiftevis samtidig, 45 ms etter, 30 ms før og 20 ms etter høyre hånd, så begge rekkefølgene testes.
 */
function dovregubbenBoth(gainDb, file) {
  const e8 = 30 / 100, lead = 1.5;
  const rh = [
    [69, 1], [71, 1], [72, 1], [74, 1], [76, 1], [72, 1], [76, 2],
    [75, 1], [71, 1], [75, 2], [74, 1], [70, 1], [74, 2],
    [69, 1], [71, 1], [72, 1], [74, 1], [76, 1], [72, 1], [76, 1], [81, 1],
    [79, 1], [76, 1], [72, 1], [76, 1], [79, 4]
  ];
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const buf = new Float64Array(Math.round((lead + 32 * e8 + 3) * SR));
  let pos = 0;
  for (const [m, d] of rh) {
    const t = lead + pos * e8 + (rnd() - 0.5) * 0.016;
    addNote(buf, m, t, t + d * e8 * 0.7, 0.8 + 0.2 * rnd());
    pos += d;
  }
  // Basstrenger er mindre inharmoniske enn diskanten
  for (let b = 0; b < 16; b++) {
    const t = lead + b * 2 * e8 + [0, 0.045, -0.03, 0.02][b % 4] + (rnd() - 0.5) * 0.016, v = 0.55 + 0.15 * rnd();
    addNote(buf, 45, t, t + 2 * e8 * 0.9, v, 0.0002);
    addNote(buf, 52, t, t + 2 * e8 * 0.9, v, 0.0002);
  }
  writeWav(file, buf, gainDb);
}

// Nivåene matcher pianoopptakene: topp rundt −21 dB, og 17 dB lavere for iPad-mikrofonen.
heartbeat(-18, 'spenning-lh-legato.wav');
heartbeat(-35, 'spenning-lh-legato-svak.wav');
dovregubbenBoth(-18, 'del-a-begge-hender.wav');
dovregubbenBoth(-35, 'del-a-begge-hender-svak.wav');
console.log('Laget spenning-lh-legato(-svak).wav og del-a-begge-hender(-svak).wav');
