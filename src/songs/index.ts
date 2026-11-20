import type { Section, Song, SongCategory } from '../music/song';
import { dovregubben } from './dovregubben';
import { gameshow } from './gameshow';

export const songs: Song[] = [dovregubben, ...gameshow];

export const CATEGORY_LABEL: Record<SongCategory, string> = {
  'låt': 'Låter',
  egne: 'Gameshow – egne lyder',
  klassisk: 'Gameshow – klassisk'
};

/** Finner delen med denne id-en i alle låtene. Id-ene er unike på tvers av låter. */
export function findSection(id: string): { song: Song; sec: Section } {
  for (const song of songs) {
    const sec = song.sections.find(s => s.id === id);
    if (sec) return { song, sec };
  }
  return { song: songs[0], sec: songs[0].sections[0] };
}
