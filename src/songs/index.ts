import type { Song } from '../music/song';
import { dovregubben } from './dovregubben';

export const songs: Song[] = [dovregubben];

/** Låten appen viser. Låtvelgeren kommer i steg 2 av planen. */
export const currentSong: Song = dovregubben;
