import { describe, expect, it } from 'vitest';
import { scenes, territories, destinations } from './journey';
import { regions, regionFor } from './regions';

describe('Traversée littéraire complète', () => {
  it('contient exactement seize haltes ordonnées et six régions accessibles', () => {
    expect(scenes.map(scene => scene.chapter)).toEqual(Array.from({ length: 16 }, (_, index) => index + 1));
    expect(regions).toHaveLength(6);
    expect(territories.every(territory => Number.isInteger(territory.scene))).toBe(true);
    expect(scenes.map(scene => scene.region)).toEqual([0,0,1,1,1,2,2,2,2,3,3,4,4,5,5,5]);
  });
  it('inclut chaque citation exactement dans son extrait avec métadonnées', () => {
    for (const scene of scenes) {
      expect(scene.passages.map(passage => passage.text).join('\n\n')).toContain(scene.quote);
      expect(scene.chapterTitle.length).toBeGreaterThan(3);
      expect(scene.place.length).toBeGreaterThan(3);
      expect(scene.passages.every(passage => /^P\d{4}(?:–P\d{4})?$/.test(passage.reference))).toBe(true);
      expect(scene.region).toBe(regionFor(scene.chapter));
      expect(scene.context.length).toBeGreaterThan(15);
    }
  });
  it('signale le rapprochement de paragraphes non consécutifs', () => {
    expect(scenes[5].passages.map(passage => passage.reference)).toEqual(['P0562', 'P0566']);
    expect(scenes[5].note).toContain('ne se suivent pas directement');
  });
  it('atteint le retour sans annoncer une guérison définitive', () => {
    expect(scenes[15].chapterTitle).toBe('Tout commençait là');
    expect(scenes[15].place).toBe('France');
    expect(scenes[15].passages[0].reference).toBe('P1780');
    expect(scenes[15].quote).toBe('Les peurs reviennent. Les doutes aussi. Mais on ne les habite plus de la même manière.');
  });
  it('distingue les quatorze destinations principales des territoires et des escales', () => {
    expect(destinations).toHaveLength(14);
    expect(destinations).toContain('Hong Kong');
    expect(destinations).toContain('Inde');
    expect(destinations).not.toContain('Abu Dhabi');
    expect(destinations).not.toContain('Los Angeles');
  });
  it('ne contient qu’une sélection réduite, jamais un chapitre complet', () => {
    for (const scene of scenes) {
      const words = scene.passages.map(passage => passage.text).join(' ').split(/\s+/).length;
      expect(words).toBeLessThan(180);
    }
  });
});
