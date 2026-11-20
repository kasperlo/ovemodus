/** Hvorfor skjermen skal holdes våken. Skjermen kan låse seg når ingen av dem gjelder. */
export type AwakeReason = 'mic' | 'midi' | 'run';

const reasons = new Set<AwakeReason>();
let sentinel: WakeLockSentinel | null = null;
// Kallene køes, så to raske endringer ikke ber om to låser samtidig.
let queue: Promise<void> = Promise.resolve();

async function sync(): Promise<void> {
  const want = reasons.size > 0 && document.visibilityState === 'visible';
  if (want && !sentinel && 'wakeLock' in navigator) {
    try {
      const s = await navigator.wakeLock.request('screen');
      sentinel = s;
      s.addEventListener('release', () => { if (sentinel === s) sentinel = null; });
    } catch { /* ikke støttet eller avslått, for eksempel med strømsparing på */ }
  } else if (!want && sentinel) {
    const s = sentinel;
    sentinel = null;
    await s.release().catch(() => {});
  }
}

export function keepAwake(reason: AwakeReason, on: boolean): void {
  if (on) reasons.add(reason); else reasons.delete(reason);
  queue = queue.then(sync);
}

// Nettleseren slipper låsen når fanen skjules, så den må bes om igjen når man kommer tilbake.
document.addEventListener('visibilitychange', () => { queue = queue.then(sync); });
