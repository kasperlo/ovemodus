import { emitInput } from './practice/input';
import { mic, run, state, type RunKind } from './state';
import type { Mode } from './storage';
import { sheet } from './notation/sheet';

interface Actions {
  setSection(id: string): void;
  setMode(mode: Mode): void;
  setTempo(bpm: number, quiet?: boolean): void;
  startRun(kind: RunKind): void;
  stopRun(quiet?: boolean): void;
}

/** Krok for Playwright-testene. Formen må være den samme som `OvemodusHook` i tests/e2e/helpers.ts. */
export function installTestHook(actions: Actions): void {
  const hook = {
    input: (m: number, src?: string) => emitInput(m, src || 'test', performance.now(), { attack: true }),
    ...actions,
    get state() {
      return {
        section: state.sec.id, mode: state.mode, cur: state.cur, steps: state.model.steps.length,
        hits: state.hits, misses: state.misses, extra: state.extra, finished: state.finished, runActive: run.active,
        result: state.result && { big: state.result.big, sub: state.result.sub, then: state.result.then },
        micOn: mic.on,
        run: { t0: run.t0, countIn: run.countIn, e8: run.e8, kind: run.kind },
        sheet: { ok: sheet.ok, count: sheet.notes.length, perLine: sheet.perLine, cursorW: sheet.cursor ? Number(sheet.cursor.getAttribute('width')) : -1 },
        notes: state.model.steps.map(s => ({ m: s.type === 'chord' ? s.midis[0] : s.midi, t: s.t, judged: s.judged || null }))
      };
    }
  };
  (window as unknown as { ovemodus: typeof hook }).ovemodus = hook;
}
