import { CATEGORY_LABEL, songs } from '../songs';
import { els } from './dom';

/** Nedtrekkslisten med låter, gruppert etter kategori. */
export function renderSongSelect(): void {
  els.selSong.innerHTML = '';
  (Object.keys(CATEGORY_LABEL) as (keyof typeof CATEGORY_LABEL)[]).forEach(cat => {
    const list = songs.filter(s => s.category === cat);
    if (!list.length) return;
    const group = document.createElement('optgroup');
    group.label = CATEGORY_LABEL[cat];
    list.forEach(s => {
      const o = document.createElement('option');
      o.value = s.id; o.textContent = s.title;
      group.append(o);
    });
    els.selSong.append(group);
  });
}
