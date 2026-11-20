import { registerSW } from 'virtual:pwa-register';
import { els } from './dom';

const CHECK_EVERY_MS = 30 * 60 * 1000;

/**
 * Ser etter ny versjon når appen åpnes og når den hentes fram igjen. iPad holder en installert app i minnet,
 * så uten sjekken ved «visibilitychange» ble nye versjoner først vist etter at appen var lukket helt to ganger.
 * Den nye versjonen tas i bruk når brukeren trykker «Oppdater», aldri midt i en øvingsøkt.
 */
export function initUpdates(): void {
  if (!('serviceWorker' in navigator)) return;
  const update = registerSW({
    onNeedRefresh() { els.updateBar.hidden = false; },
    onRegisteredSW(_url, reg) {
      if (!reg) return;
      const check = () => { reg.update().catch(() => { /* uten nett: prøv igjen senere */ }); };
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
      setInterval(check, CHECK_EVERY_MS);
    }
  });
  els.btnUpdate.addEventListener('click', () => { void update(true); });
}
