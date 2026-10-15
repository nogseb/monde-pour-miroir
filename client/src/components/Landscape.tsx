import { worldImage } from '@/data/journey';
import { regions } from '@/data/regions';

export default function Landscape({ position, drift, reduced, paused, calm }: {
  position: number; drift: number; reduced: boolean; paused: boolean; calm: boolean;
}) {
  const images = [worldImage, ...regions.map(region => region.image)];
  const movement = reduced || paused || calm ? 0 : Math.sin(drift * 0.8) * 10;
  return <div className={`landscape ${calm ? 'landscape-calm' : ''} ${paused ? 'paused' : ''}`} aria-hidden="true">
    {images.map((image, index) => <div key={image} className={`landscape-layer landscape-${index}`}
      style={{ backgroundImage: `url("${image}")`, opacity: Math.max(0, 1 - Math.abs(position - index)), transform: `scale(1.035) translate3d(${movement}px, ${-movement * 0.35}px, 0)` }} />)}
    <div className="landscape-shade" />
    <div className="landscape-mist" style={{ opacity: position > 3.5 && position < 5 ? 0.32 : 0.12, transform: `translate3d(${-movement * 0.4}px,0,0)` }} />
    <div className="landscape-grain" />
  </div>;
}
