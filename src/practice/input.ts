import { run, state } from '../state';
import { judgeTakt } from './takt';
import { judgeWait } from './wait';

export type InputSource = 'mic' | 'midi' | 'click' | 'test' | (string & {});

export interface InputEvent {
  src: InputSource;
  /** Nytt anslag. Uten anslag kan mikrofonen bare høre forrige tone klinge ut. */
  attack: boolean;
  /** Mikrofonen melder `stable` etter 3 like rammer og `sustain` etter 9. */
  phase: 'stable' | 'sustain';
  /** MIDI-kanal 1–16. Casio CT-S400 sender venstre hånd på kanal 3 når keyboardet er splittet. */
  channel?: number;
}

/** Ekko-sperre: mikrofonen ignoreres så lenge etter en tone fra MIDI eller skjermtastaturet. */
const MIC_SUPPRESS_MS = 450;

/** Felles inngang for mikrofon, MIDI, skjermtastatur og testkroken. `t` er performance.now()-tid for anslaget. */
export function emitInput(m: number, src: InputSource, t: number, ev?: Partial<Omit<InputEvent, 'src'>>): void {
  const e: InputEvent = { attack: true, phase: 'stable', ...ev, src };
  if (src !== 'mic') state.suppressMicUntil = performance.now() + MIC_SUPPRESS_MS;
  if (run.active && run.kind === 'demo') return;
  if (state.mode === 'takt') {
    if (run.active && run.kind === 'takt') judgeTakt(m, t, e);
    return;
  }
  judgeWait(m, e);
}
