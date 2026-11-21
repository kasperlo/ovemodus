// Forslag til lyder på Kaspers keyboard, Casio Casiotone CT-S400.
// Nummer og navn er som i tonelisten i brukerveiledningen (CTS400-E-2B, s. EN-181–193).

export interface CasioSetup {
  /** Registreringsplass: bank 1–8 og område 1–4. Keyboardet har 32, så bare de viktigste lydene får en. */
  reg?: [bank: number, area: number];
  /** Hovedlyden (UPPER1). */
  tone: number;
  /** Lyd lagt oppå hovedlyden (LAYER, UPPER2). */
  layer?: number;
  /** Lyden under splittpunktet (SPLIT, LOWER), standard F♯3. */
  lower?: number;
  /** Kort tips på norsk. */
  tip?: string;
}

/** De lydene appen foreslår. Tall i hakeparentes er oktavforskyvningen keyboardet legger på selv. */
export const CT_S400_TONES: Record<number, { name: string; octave?: number }> = {
  1: { name: 'STAGE PIANO' },
  11: { name: 'HONKY-TONK' },
  49: { name: 'CELESTA', octave: 1 },
  50: { name: 'GLOCKENSPIEL', octave: 1 },
  52: { name: 'TUBULAR BELL' },
  75: { name: 'PIPE ORGAN 1' },
  183: { name: 'STEREO STRINGS' },
  192: { name: 'PIZZICATO STRINGS' },
  195: { name: 'ORCHESTRA HIT' },
  202: { name: 'HARP' },
  205: { name: 'STEREO BRASS' },
  211: { name: 'BIG BAND BRASS' },
  213: { name: 'BRASS SFZ' },
  224: { name: 'TRUMPET 1' },
  228: { name: 'TROMBONE', octave: -1 },
  230: { name: 'FRENCH HORN' },
  241: { name: 'SOLO BASSOON', octave: -1 },
  253: { name: 'SOLO FLUTE 1' },
  340: { name: 'FANTASY' },
  363: { name: 'CHOIR AAHS' },
  534: { name: 'GM BOWED GLASS' },
  592: { name: 'ORCHESTRA SET' },
  598: { name: 'CHINESE SET' },
  599: { name: 'SFX SET 1' }
};

export function toneLabel(no: number): string {
  const t = CT_S400_TONES[no];
  if (!t) return String(no).padStart(3, '0');
  const oct = t.octave ? ` (${t.octave > 0 ? 'en oktav opp' : 'en oktav ned'})` : '';
  return `${String(no).padStart(3, '0')} ${t.name}${oct}`;
}

/** Lydene, for eksempel «224 TRUMPET 1 · lag: 183 STEREO STRINGS». */
export function casioSounds(c: CasioSetup): string {
  const parts = [toneLabel(c.tone)];
  if (c.layer) parts.push(`lag: ${toneLabel(c.layer)}`);
  if (c.lower) parts.push(`split: ${toneLabel(c.lower)} i venstre hånd`);
  return parts.join(' · ');
}

export function casioText(c: CasioSetup): string {
  return c.reg ? `Registrering ${c.reg[0]}-${c.reg[1]}: ${casioSounds(c)}` : `Lyd: ${casioSounds(c)}`;
}

/** Nyttige lydeffekter i 599 SFX SET 1 (og gong i 598 CHINESE SET), med tangenten de ligger på. */
export const SFX_KEYS: [key: string, what: string][] = [
  ['C5', 'buzzer'], ['E5', 'klokketikk'], ['F♯3', 'applaus'], ['G♯3', 'hjerteslag'], ['B3', 'latter'],
  ['C♯5', 'mynt'], ['B♭5', 'bjeller'], ['B5', 'dørklokke'], ['D6', 'fyrverkeri'], ['C4', 'slag']
];
