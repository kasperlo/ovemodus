import { ImportError, parseMusicXml, type StoredSong } from '../importer/musicxml';
import { loadStored, saveStored, toSong } from '../importer/library';
import { isZip, unzipMusicXml } from '../importer/zip';
import { setSection } from '../practice/session';
import { addSong, removeSong, songs } from '../songs';
import { state } from '../state';
import { els } from './dom';
import { renderSongSelect } from './songSelect';

let stored: StoredSong[] = [];

function status(text: string, kind: '' | 'ok' | 'bad' = ''): void {
  els.importStatus.textContent = text;
  els.importStatus.className = 'status' + (kind ? ' ' + kind : '');
}

/** Legger låtene som er importert på denne enheten inn i låtlisten. Kalles før låtvalget tegnes. */
export function loadImported(): void {
  stored = loadStored();
  stored.forEach(s => {
    try { addSong(toSong(s)); } catch { /* en ødelagt lagret låt skal ikke stoppe appen */ }
  });
}

async function readFile(file: File): Promise<string> {
  const lower = file.name.toLowerCase();
  if (/\.(mid|midi)$/.test(lower)) throw new ImportError('MIDI kan ikke leses direkte. Åpne filen i MuseScore og eksporter som MusicXML.');
  if (lower.endsWith('.pdf')) throw new ImportError('PDF kan ikke leses direkte. Åpne den i MuseScore (Fil → Importer PDF) og eksporter som MusicXML.');
  const buf = await file.arrayBuffer();
  return isZip(buf) ? unzipMusicXml(buf) : new TextDecoder().decode(buf);
}

async function importFile(file: File): Promise<void> {
  status(`Leser ${file.name} …`);
  try {
    const id = `mine-${Date.now().toString(36)}`;
    const parsed = parseMusicXml(await readFile(file), file.name, id);
    if (!saveStored([...stored, parsed])) throw new ImportError('Det er ikke plass til flere noter på denne enheten. Slett noen du ikke trenger.');
    stored.push(parsed);
    const song = toSong(parsed);
    addSong(song);
    renderSongSelect();
    setSection(song.sections[0].id);
    const notes = (bars: StoredSong['rh']) => bars.flat().filter(e => e.t !== 'r').length;
    const n = (x: number, one: string, many: string) => `${x} ${x === 1 ? one : many}`;
    status(`«${parsed.title}» er importert: ${n(parsed.rh.length, 'takt', 'takter')}, ${n(notes(parsed.rh), 'tone', 'toner')} i høyre hånd og ${notes(parsed.lh)} i venstre.`, 'ok');
  } catch (err) {
    status(err instanceof ImportError ? err.message : `Filen kunne ikke importeres (${(err as Error)?.message ?? 'ukjent feil'}).`, 'bad');
  }
}

function deleteCurrent(): void {
  const song = state.song;
  if (song.category !== 'mine') return;
  if (!confirm(`Slette «${song.title}» fra denne enheten? Det kan ikke angres, men du kan importere filen på nytt.`)) return;
  stored = stored.filter(s => s.id !== song.id);
  saveStored(stored);
  removeSong(song.id);
  renderSongSelect();
  setSection(songs[0].sections[0].id);
  status(`«${song.title}» er slettet fra denne enheten.`);
}

export function initImport(): void {
  els.fileImport.addEventListener('change', () => {
    const file = els.fileImport.files?.[0];
    els.fileImport.value = '';
    if (file) void importFile(file);
  });
  els.btnDeleteSong.addEventListener('click', deleteCurrent);
}
