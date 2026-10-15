import { asset } from './assets';
export const regions = [
  { title: 'La faille', range: '1–2', start: 1, end: 2, image: asset('faille.webp'), tone: 'slate', description: 'L’effondrement et le seuil du départ.' },
  { title: 'Le désert du souffle', range: '3–5', start: 3, end: 5, image: asset('desert.webp'), tone: 'ochre', description: 'Un espace s’ouvre, sans effacer les tensions.' },
  { title: 'Les îles des liens', range: '6–9', start: 6, end: 9, image: asset('iles.webp'), tone: 'teal', description: 'Composer, s’arrêter, recevoir de l’aide.' },
  { title: 'La plaine des brumes', range: '10–11', start: 10, end: 11, image: asset('brumes.webp'), tone: 'mist', description: 'La beauté demeure. Ses contours se dérobent.' },
  { title: 'La forêt des miroirs', range: '12–13', start: 12, end: 13, image: asset('miroirs.webp'), tone: 'mirror', description: 'Désirs, projections, schémas reconnus.' },
  { title: 'Les crêtes et l’horizon', range: '14–16', start: 14, end: 16, image: asset('horizon.webp'), tone: 'horizon', description: 'Tenir autrement, puis revenir.' },
];

export function regionFor(chapter: number) {
  return regions.findIndex(region => chapter >= region.start && chapter <= region.end);
}
