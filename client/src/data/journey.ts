import { asset } from './assets';
import selection from './selection.json';
import { regions, regionFor } from './regions';

export type Passage = { reference: string; text: string };
export type Scene = {
  id: string; title: string; chapter: number; chapterTitle: string;
  place: string; shortPlace: string; quote: string; passages: Passage[];
  context: string; note?: string; image: string; region: number;
};
export const worldImage = asset('paysage.webp');
export const scenes: Scene[] = selection.map(item => {
  const region = regionFor(item.chapter);
  return { ...item, id: `halte-${String(item.chapter).padStart(2, '0')}`,
    title: item.chapter === 6 ? 'La halte du renoncement' : item.chapterTitle,
    shortPlace: item.place, image: regions[region].image, region };
});
export const territories = regions.map(region => ({
  ...region, chapters: `Chapitres ${region.range}`, scene: region.start - 1,
  detail: region.description,
}));
export const destinations = ['Colombie', 'Pérou', 'Bolivie', 'Chili', 'Guatemala', 'Hong Kong', 'Thaïlande', 'Cambodge', 'Laos', 'Philippines', 'Vietnam', 'Népal', 'Inde', 'Sri Lanka'];
