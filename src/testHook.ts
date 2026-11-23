import { emitInput } from './practice/input';
import type { BarRange } from './practice/range';
import { mic, partId, run, state, targetTempo, type RunKind } from './state';
import { progressOf, store, type Mode } from './storage';
import { sheet } from './notation/sheet';

interface Actions {
  setSection(id: string): void;
  setMode(mode: Mode): void;
  setTempo(bpm: number, quiet?: boolean): void;
  startRun(kind: RunKind): void;
  stopRun(quiet?: boolean): void;
  setRange(r: BarRange | null): void;
  setLoop(on: boolean): void;
  setTarget(bpm: number): void;
}

/** Krok for Playwright-testene. Formen må være den samme som `OvemodusHook` i tests/e2e/helpers.ts. */
export function installTestHook({ setRange, ...actions }: Actions): void {
  const hook = {
    input: (m: number, src?: string) => emitInput(m, src || 'test', performance.now(), { attack: true }),
    ...actions,
    /** Takt `first` til `last` i delen, tellt fra 1. Uten argumenter: hele delen. */
    setRange: (first?: number, last?: number) => setRange(first == null ? null : { from: first - 1, to: (last ?? first) - 1 }),
    get state() {
      return {
        section: state.sec.id, mode: state.mode, cur: state.cur, steps: state.model.steps.length,
        hits: state.hits, misses: state.misses, extra: state.extra, finished: state.finished, runActive: run.active,
        result: state.result && { big: state.result.big, sub: state.result.sub, then: state.result.then },
        micOn: mic.on,
        run: { t0: run.t0, countIn: run.countIn, e8: run.e8, kind: run.kind },
        sheet: { ok: sheet.ok, count: sheet.notes.length, perLine: sheet.perLine, cursorW: sheet.cursor ? Number(sheet.cursor.getAttribute('width')) : -1 },
        notes: state.model.steps.map(s => ({
          m: s.type === 'chord' ? s.midis[0] : s.midi, t: s.t, judged: s.judged || null,
          // Begge hender: én tone fra hver hånd sin del, så testene kan spille begge
          ...(s.parts ? { rh: s.parts.rh?.midis[0], lh: s.parts.lh?.midis[0] } : {})
        })),
        tempo: state.tempo,
        range: state.range && { first: state.range.from + 1, last: state.range.to + 1 },
        loop: {
          on: store.settings.loop, pending: run.pending, round: run.round, target: targetTempo(),
          rounds: progressOf(partId(), state.hand, state.mode)?.rounds ?? []
        }
      };
    }
  };
  (window as unknown as { ovemodus: typeof hook }).ovemodus = hook;
}
