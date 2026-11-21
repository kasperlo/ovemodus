import type { Section, Song, SongCategory } from '../music/song';
import { dovregubben } from './dovregubben';
import { gameshow } from './gameshow';
import { classical } from './klassisk';

/** Innebygde låter først, så låter importert på denne enheten (`addSong`). */
export const songs: Song[] = [dovregubben, ...gameshow, ...classical];

export function addSong(song: Song): void {
  songs.push(song);
}

export function removeSong(id: string): void {
  const i = songs.findIndex(s => s.id === id);
  if (i >= 0) songs.splice(i, 1);
}

export const CATEGORY_LABEL: Record<SongCategory, string> = {
  'låt': 'Låter',
  egne: 'Gameshow – egne lyder',
  klassisk: 'Gameshow – klassisk',
  mine: 'Mine noter (bare på denne enheten)'
};

/** Finner delen med denne id-en i alle låtene. Id-ene er unike på tvers av låter. */
export function findSection(id: string): { song: Song; sec: Section } {
  for (const song of songs) {
    const sec = song.sections.find(s => s.id === id);
    if (sec) return { song, sec };
  }
  return { song: songs[0], sec: songs[0].sections[0] };
}
