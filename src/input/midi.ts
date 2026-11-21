import { sciName } from '../music/theory';
import { emitInput } from '../practice/input';
import { spell, state } from '../state';
import { els } from '../ui/dom';
import { inRange, keyEls } from '../ui/keyboard';
import { setHint, setPill, setStatus } from '../ui/view';
import { keepAwake } from '../wakeLock';

let midiAccess: MIDIAccess | null = null;

export async function connectMidi(): Promise<void> {
  if (!navigator.requestMIDIAccess) {
    setPill(els.pillMidi, 'MIDI mangler', 'bad');
    setStatus('Nettleseren støtter ikke MIDI. Bruk Chrome eller Edge.', 'bad');
    return;
  }
  try {
    midiAccess = await navigator.requestMIDIAccess();
  } catch {
    setPill(els.pillMidi, 'MIDI blokkert', 'bad');
    setStatus('Fikk ikke tilgang til MIDI. Tillat MIDI i nettleseren og prøv igjen.', 'bad');
    return;
  }
  const access = midiAccess;
  const bind = () => {
    const names: string[] = [];
    access.inputs.forEach(inp => { inp.onmidimessage = onMidi; names.push(inp.name ?? ''); });
    keepAwake('midi', names.length > 0);
    if (names.length) {
      setPill(els.pillMidi, 'MIDI på', 'on');
      setStatus('MIDI koblet til: ' + names.join(', ') + '.', 'ok');
    } else {
      setPill(els.pillMidi, 'Ingen MIDI', 'warn');
      setStatus('Fant ingen MIDI-enheter. Sjekk USB-kabelen og at keyboardet er på, og trykk igjen.', 'warn');
    }
  };
  bind();
  access.onstatechange = bind;
}

function onMidi(e: MIDIMessageEvent): void {
  if (!e.data) return;
  const [st, d1, d2] = e.data;
  const cmd = st & 0xf0;
  const channel = (st & 0x0f) + 1;
  if (cmd === 0x90 && d2 > 0) {
    const split = state.model.split;
    // Kanal 3 er venstre hånd når Casio-keyboardet er splittet. Ellers skilles hendene på tonehøyde.
    const lowerPart = channel === 3;
    const otherHand = state.hand === 'rh' ? lowerPart || (split != null && d1 < split)
      : state.hand === 'lh' ? !lowerPart && split != null && d1 >= split : false;
    if (els.optLH.checked && otherHand) {
      setHint(`Ignorerte ${sciName(d1)} (${state.hand === 'rh' ? 'venstre' : 'høyre'} hånd).`, '');
      return;
    }
    const k = keyEls[inRange(d1)];
    if (k) k.classList.add('down');
    els.heard.textContent = 'Du trykket: ' + spell(d1);
    emitInput(d1, 'midi', e.timeStamp || performance.now(), { attack: true, channel });
  } else if (cmd === 0x80 || (cmd === 0x90 && d2 === 0)) {
    const k = keyEls[inRange(d1)];
    if (k) k.classList.remove('down');
  }
}
