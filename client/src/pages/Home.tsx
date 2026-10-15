import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, Compass, Info, SlidersHorizontal } from 'lucide-react';
import Landscape from '@/components/Landscape';
import JourneyDialog, { type Panel, type Preferences } from '@/components/JourneyDialog';
import { scenes } from '@/data/journey';
import { regions } from '@/data/regions';

function loadPreferences(): Preferences {
  const systemReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    const saved = JSON.parse(localStorage.getItem('terres-preferences-v1') || '{}');
    return { reduced: systemReduced || saved.reduced === true, calm: saved.calm === true,
      textSize: [0, 1, 2].includes(saved.textSize) ? saved.textSize : 0 };
  } catch { return { reduced: systemReduced, calm: false, textSize: 0 }; }
}

export default function Home() {
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);
  const [panel, setPanel] = useState<Panel>(null);
  const [readerIndex, setReaderIndex] = useState(0);
  const [active, setActive] = useState(-1);
  const [visual, setVisual] = useState({ position: 0, drift: 0 });
  const stops = useRef<(HTMLElement | null)[]>([]);
  const hero = useRef<HTMLElement>(null);
  const pendingFocus = useRef<number | null>(null);
  const reduced = preferences.reduced || preferences.calm;

  useEffect(() => {
    try { localStorage.setItem('terres-preferences-v1', JSON.stringify(preferences)); } catch { /* Private browsing can block storage. */ }
  }, [preferences]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { if (media.matches) setPreferences(value => ({ ...value, reduced: true })); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (panel) return;
      const y = window.scrollY;
      const points = [hero.current, ...stops.current].filter((item): item is HTMLElement => !!item);
      let index = 0;
      while (index + 1 < points.length && points[index + 1].offsetTop <= y + window.innerHeight * 0.22) index++;
      setActive(index - 1);
      let visualIndex = 0;
      while (visualIndex + 1 < points.length && points[visualIndex + 1].offsetTop <= y) visualIndex++;
      const currentY = points[visualIndex]?.offsetTop || 0;
      const nextY = points[visualIndex + 1]?.offsetTop || currentY + window.innerHeight;
      const fraction = Math.min(1, Math.max(0, (y - currentY) / (nextY - currentY)));
      const from = visualIndex === 0 ? 0 : scenes[visualIndex - 1].region + 1;
      const to = visualIndex + 1 >= points.length ? from : scenes[visualIndex].region + 1;
      setVisual({ position: reduced ? (index === 0 ? 0 : scenes[index - 1].region + 1) : from + (to - from) * fraction,
        drift: visualIndex + fraction });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [panel, reduced]);

  const travel = useCallback((index: number) => {
    const target = index < 0 ? hero.current : stops.current[index];
    if (!target) return;
    target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    const heading = target.querySelector<HTMLElement>('h1, h2');
    heading?.focus({ preventScroll: true });
    setActive(index);
  }, [reduced]);
  const close = useCallback(() => setPanel(null), []);
  const travelFromPanel = (index: number) => { pendingFocus.current = index; setPanel(null); };
  useEffect(() => {
    if (!panel && pendingFocus.current !== null) {
      const index = pendingFocus.current;
      pendingFocus.current = null;
      const frame = requestAnimationFrame(() => travel(index));
      return () => cancelAnimationFrame(frame);
    }
  }, [panel, travel]);
  const read = (index: number) => { setReaderIndex(index); setPanel('reader'); };
  const activeRegion = active < 0 ? -1 : scenes[active].region;

  return <div className={`journey-app ${preferences.calm ? 'calm-mode' : ''} ${reduced ? 'reduced-motion' : ''}`} data-active-chapter={active + 1} data-motion={reduced ? 'reduced' : 'full'}>
    <a className="skip-link" href="#halte-01">Aller à la première halte</a>
    <Landscape position={visual.position} drift={visual.drift} reduced={reduced} paused={!!panel} calm={preferences.calm} />
    <header className="site-header">
      <button className="wordmark" onClick={() => travel(-1)} aria-label="Les terres intérieures — revenir au départ"><svg width="25" height="30" viewBox="0 0 25 30" fill="none" aria-hidden="true"><path d="M3 27C23 25 6 20 15 15S7 7 20 3" stroke="currentColor" strokeWidth="1.1" /><circle cx="20" cy="3" r="2" fill="currentColor" /></svg><span>LES TERRES<br />INTÉRIEURES</span></button>
      <nav aria-label="Navigation principale"><button onClick={() => setPanel('overview')} aria-label="Vue d’ensemble"><Compass size={17} /><span>Vue d’ensemble</span></button><button onClick={() => setPanel('library')} aria-label="La sélection"><BookOpen size={17} /><span>La sélection</span></button><button onClick={() => setPanel('settings')} aria-label="Réglages de lecture"><SlidersHorizontal size={18} /><span className="settings-label">À votre rythme</span></button></nav>
    </header>
    <main>
      <section className="hero-pane" ref={hero} id="depart" aria-labelledby="hero-title">
        <div className="hero-copy"><p className="eyebrow hero-credit">LE MONDE POUR MIROIR · JULIE BROSSON</p><h1 id="hero-title" tabIndex={-1}>Les terres<br /><em>intérieures.</em></h1><p className="hero-tagline">Le paysage change. Le récit avance.</p><div className="hero-intro"><span className="fine-line" /><p>Un récit à traverser.<br />Un paysage imaginaire où faire halte.</p></div></div>
        <div className="hero-bottom"><div className="hero-caption"><span className="eyebrow">UNE GÉOGRAPHIE INTÉRIEURE</span><p>Six territoires. Seize haltes.<br />Du départ au retour, à votre rythme.</p></div><div className="hero-entry"><button className="solid-button" onClick={() => travel(0)}>Commencer la traversée <ArrowRight size={19} /></button><button className="scroll-hint" onClick={() => travel(0)}><ArrowDown size={14} /> ou défiler librement</button></div></div>
        <blockquote className="opening-quote"><p>« Les peurs reviennent. Les doutes aussi.<br />Mais on ne les habite plus de la même manière. »</p><cite>Julie Brosson · Chapitre 16 · V5 P1780</cite></blockquote>
      </section>
      {scenes.map((scene, index) => <section key={scene.id} id={scene.id} ref={element => { stops.current[index] = element; }} className={`scene-pane scene-region-${scene.region}`} data-tone={regions[scene.region].tone} aria-labelledby={`title-${scene.id}`}>
        <div className="scene-top"><span className="eyebrow">TERRITOIRE {scene.region + 1} / 6 · {regions[scene.region].title}</span><h2 id={`title-${scene.id}`} tabIndex={-1}>{scene.chapter === 6 ? 'La halte du renoncement' : regions[scene.region].title}</h2><p>CHAPITRE {scene.chapter} · <span>{scene.chapterTitle}</span></p><span className="documentary-place">{scene.place}</span></div>
        <div className="scene-reading"><blockquote className="scene-quote"><p>« {scene.quote} »</p><cite>Julie Brosson · {scene.passages.map(p => p.reference).join(' / ')}</cite></blockquote><button className="reading-point" onClick={() => read(index)} aria-label={`Ouvrir le passage du chapitre ${scene.chapter} : ${scene.chapterTitle}`}><span className="point-halo"><span /></span><span>Faire une halte <BookOpen size={14} /></span></button></div>
        <nav className="scene-actions" aria-label={`Navigation depuis le chapitre ${scene.chapter}`}><button className="text-button" onClick={() => travel(index - 1)}><ArrowLeft size={16} /><span>{index === 0 ? 'Le départ' : 'Halte précédente'}</span></button><span className="step-number">{String(index + 1).padStart(2, '0')} <span>/ 16</span></span><button className="outline-button" data-next={index} onClick={() => travel(index === scenes.length - 1 ? -1 : index + 1)}>{index === scenes.length - 1 ? 'Revoir le départ' : 'Poursuivre'} <ArrowRight size={17} /></button></nav>
        {index === scenes.length - 1 && <p className="return-note">Le voyage s’achève. Le paysage n’est pas définitivement réparé.</p>}
      </section>)}
    </main>
    <footer className="journey-footer"><button className="prototype-note" onClick={() => setPanel('about')} aria-label="À propos et confidentialité du prototype"><Info size={14} /><span>Prototype de travail</span></button><nav className="region-track" aria-label="Aller à un territoire">{regions.map((region, index) => <button key={region.title} onClick={() => travel(region.start - 1)} aria-current={activeRegion === index ? 'step' : undefined} aria-label={`Territoire ${index + 1} : ${region.title}`} title={region.title}><span className="track-dot" /><span className="track-label">{index === activeRegion ? region.title : `0${index + 1}`}</span></button>)}</nav><span className="current-position" aria-live="polite">{active < 0 ? 'Avant le départ' : `Chapitre ${active + 1} sur 16`}</span></footer>
    <JourneyDialog panel={panel} readerIndex={readerIndex} preferences={preferences} onClose={close} onPanel={setPanel} onRead={read} onTravel={travelFromPanel} onPreferences={setPreferences} />
  </div>;
}
