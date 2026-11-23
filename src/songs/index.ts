import type { Section, Song, SongCategory } from '../music/song';
import { dovregubben } from './dovregubben';
import { gameshow } from './gameshow';
import { kanon } from './kanon';
import { classical } from './klassisk';
import { furElise, klaver } from './klaver';
import { marsjer } from './marsjer';
import { menuett } from './menuett';
import { opera } from './opera';
import { orkester } from './orkester';
import { preludiumC } from './preludiumC';
import { preludiumE } from './preludiumE';

const byTitle = (a: Song, b: Song): number => a.title.localeCompare(b.title, 'nb');

/**
 * Innebygde låter først, så låter importert på denne enheten (`addSong`). Klaverstykkene står etter vanskegrad,
 * de klassiske gameshow-lydene alfabetisk.
 */
export const songs: Song[] = [dovregubben, menuett, kanon, preludiumC, furElise, preludiumE, ...gameshow, ...[...classical, ...klaver, ...marsjer, ...opera, ...orkester].sort(byTitle)];

export function addSong(song: Song): void {
  songs.push(song);
}

export function removeSong(id: string): void {
  const i = songs.findIndex(s => s.id === id);
  if (i >= 0) songs.splice(i, 1);
}

export const CATEGORY_LABEL: Record<SongCategory, string> = {
  'låt': 'Låter',
  stykke: 'Klaverstykker (lettest først)',
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
