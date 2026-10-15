import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Eye, Minus, Plus, X } from 'lucide-react';
import { destinations, scenes, territories, worldImage } from '@/data/journey';

export type Panel = 'reader' | 'library' | 'overview' | 'settings' | 'about' | null;
export type Preferences = { reduced: boolean; calm: boolean; textSize: number };
type Props = {
  panel: Panel; readerIndex: number; preferences: Preferences;
  onClose: () => void; onPanel: (panel: Panel) => void;
  onRead: (index: number) => void; onTravel: (index: number) => void;
  onPreferences: (value: Preferences) => void;
};

export default function JourneyDialog(props: Props) {
  const { panel, readerIndex, preferences, onClose, onPanel, onRead, onTravel, onPreferences } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scene = scenes[readerIndex];
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (panel && !dialog.open) dialog.showModal();
    if (!panel && dialog.open) dialog.close();
    document.body.style.overflow = panel ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [panel]);
  useEffect(() => {
    if (panel) {
      if (dialogRef.current) dialogRef.current.scrollTop = 0;
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [panel, readerIndex]);
  const change = (patch: Partial<Preferences>) => onPreferences({ ...preferences, ...patch });
  const title = panel === 'reader' ? scene.title : panel === 'library' ? 'Les haltes de lecture' : panel === 'overview' ? 'Un seul monde, six territoires' : panel === 'settings' ? 'À votre rythme' : 'Une géographie du récit';

  return <dialog ref={dialogRef} className={`journey-dialog panel-${panel || 'closed'}`} aria-labelledby="dialog-title"
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'));
      const index = items.indexOf(document.activeElement as HTMLElement);
      if (index === -1 || (event.shiftKey && index === 0) || (!event.shiftKey && index === items.length - 1)) {
        event.preventDefault();
        (event.shiftKey ? items[items.length - 1] : items[0])?.focus();
      }
    }}
    onCancel={onClose} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="dialog-inner">
      <header className="dialog-header"><span className="eyebrow">LES TERRES INTÉRIEURES / {panel === 'reader' ? 'UNE HALTE' : 'PROTOTYPE DE TRAVAIL'}</span><button className="icon-button" aria-label="Fermer le panneau" onClick={onClose}><X size={22} /></button></header>
      <div className="dialog-content">
        <h2 id="dialog-title" ref={headingRef} tabIndex={-1}>{title}</h2>
        {panel === 'reader' && <>
          <div className="reader-meta"><span>CHAPITRE {scene.chapter} · {scene.chapterTitle}</span><span>{scene.place}</span></div>
          <p className="reader-context"><span>CONTEXTE ÉDITORIAL</span>{scene.context}</p>
          <div className="reader-tools"><span><Eye size={15} /> Lecture immobile</span><div className="text-tools" aria-label="Taille du texte">
            <button aria-label="Réduire la taille du texte" disabled={preferences.textSize <= 0} onClick={() => change({ textSize: preferences.textSize - 1 })}><Minus size={16} /></button>
            <span aria-live="polite">Aa · {['Standard', 'Grand', 'Très grand'][preferences.textSize]}</span>
            <button aria-label="Augmenter la taille du texte" disabled={preferences.textSize >= 2} onClick={() => change({ textSize: preferences.textSize + 1 })}><Plus size={16} /></button>
          </div></div>
          <article className="source-passage" style={{ fontSize: `${1.18 + preferences.textSize * 0.18}rem` }} aria-label="Extrait exact de Julie Brosson">
            {scene.passages.map((passage, index) => <div key={passage.reference}>
              {index > 0 && <div className="ellipse"><span aria-hidden="true">···</span><p>Ellipse — passages non consécutifs</p></div>}
              <span className="paragraph-reference">V5 · {passage.reference}</span><p>{passage.text}</p>
            </div>)}
          </article>
          <footer className="reader-source"><p>Julie Brosson · <em>Le Monde pour miroir</em> · V5</p><p>{scene.note || 'Sélection d’un passage bref, et non chapitre complet.'}</p><p>Extrait vérifié contre la V5. Les noms des territoires sont une interprétation artistique, pas des titres de l’autrice.</p></footer>
          <div className="dialog-actions"><button className="text-button" onClick={() => onPanel('library')}><BookOpen size={17} /> Toute la sélection</button><button className="solid-button" onClick={() => onTravel(readerIndex)}>Revenir à cette halte <ArrowRight size={18} /></button></div>
          <nav className="reader-navigation" aria-label="Autres extraits"><button disabled={readerIndex === 0} onClick={() => onRead(readerIndex - 1)}><ArrowLeft size={16} /> Extrait précédent</button><span>{readerIndex + 1} / {scenes.length}</span><button disabled={readerIndex === scenes.length - 1} onClick={() => onRead(readerIndex + 1)}>Extrait suivant <ArrowRight size={16} /></button></nav>
        </>}
        {panel === 'library' && <>
          <p className="dialog-intro">Seize chapitres, seize endroits où s’arrêter. Une sélection exacte de <em>Le Monde pour miroir</em>, de Julie Brosson, du départ au retour.</p>
          <div className="library-list">{scenes.map((item, index) => <button key={item.id} onClick={() => onRead(index)} data-read-index={index}><span className="list-number">{String(index + 1).padStart(2, '0')}</span><div><span className="eyebrow">CHAPITRE {item.chapter} · {item.passages.map(p => p.reference).join(' / ')}</span><h3>{item.chapterTitle}</h3><p>« {item.quote} »</p><span className="list-place">{item.place}</span></div><ArrowRight size={20} /></button>)}</div>
          <p className="small-note">Aucun chapitre complet ni manuscrit intégral n’est disponible. À la halte du chapitre 6, l’ellipse entre P0562 et P0566 est signalée.</p>
        </>}
        {panel === 'overview' && <>
          <p className="dialog-intro">Six territoires artistiques, tous traversables. Ce paysage n’est pas une carte du voyage : les destinations réelles restent des repères secondaires.</p>
          <div className="overview-art"><img src={worldImage} alt="Paysage imaginaire continu : faille ardoise, désert ocre, îles, brume et montagnes" /><span>LE PAYSAGE DU RÉCIT</span></div>
          <div className="territory-list">{territories.map((item, index) => <section key={item.title} className="territory"><div className="territory-heading"><span className="list-number">0{index + 1}</span><div><span className="eyebrow">{item.chapters}</span><h3>{item.title}</h3><p>{item.detail}</p></div><button className="outline-button" onClick={() => onTravel(item.scene)}>Entrer <ArrowRight size={17} /></button></div><div className="chapter-links">{scenes.filter(stop => stop.region === index).map(stop => <button key={stop.id} onClick={() => onTravel(stop.chapter - 1)}> {String(stop.chapter).padStart(2, '0')} <span>{stop.chapterTitle}</span> <ArrowRight size={14} /></button>)}</div></section>)}</div>
          <p className="small-note">Une région peut contenir plusieurs haltes. Tous les chapitres sont accessibles; la démonstration ne donne que des extraits. Aucune progression émotionnelle n’est mesurée.</p>
        </>}
        {panel === 'settings' && <>
          <p className="dialog-intro">Le paysage peut bouger. La lecture, jamais. Ces réglages ne concernent que cet appareil.</p>
          <div className="settings-list">
            <label className="setting"><div><h3>Mouvement réduit</h3><p>Supprime les déplacements de caméra et le défilement animé.</p></div><input type="checkbox" checked={preferences.reduced} onChange={event => change({ reduced: event.target.checked })} /><span className="toggle-mark" aria-hidden="true">{preferences.reduced && <Check size={16} />}</span></label>
            <label className="setting"><div><h3>Lecture calme</h3><p>Fond uni, sans paysage animé. Les seize haltes et la navigation restent accessibles.</p></div><input type="checkbox" checked={preferences.calm} onChange={event => change({ calm: event.target.checked })} /><span className="toggle-mark" aria-hidden="true">{preferences.calm && <Check size={16} />}</span></label>
            <div className="setting"><div><h3>Taille du texte des passages</h3><p>Le même réglage s’applique à toutes les haltes.</p></div><select aria-label="Taille du texte des passages" value={preferences.textSize} onChange={event => change({ textSize: Number(event.target.value) })}><option value="0">Standard</option><option value="1">Grand</option><option value="2">Très grand</option></select></div>
          </div><p className="small-note">La préférence de mouvement réduit de votre système est respectée. L’expérience est entièrement muette, sans piste sonore ni démarrage automatique.</p><button className="solid-button" onClick={onClose}>Revenir à la traversée <ArrowRight size={18} /></button>
        </>}
        {panel === 'about' && <>
          <div className="about-copy"><p>« LES TERRES INTÉRIEURES » accompagne <em>Le Monde pour miroir</em>, récit autobiographique de Julie Brosson : un tour du monde après un burnout.</p><p>La topographie est imaginaire. Les citations sont exactes, vérifiées dans la V5. Le lecteur accompagne Julie : il ne joue pas sa vie et ne reçoit aucun diagnostic.</p><p>Six territoires, seize haltes, du départ au retour. Le parcours ne dessine pas une guérison linéaire. Les fissures, les retours et les limites restent présents.</p></div>
          <div className="privacy-note"><h3>Une sélection, pas le manuscrit</h3><p>Cette démonstration contient seulement une sélection réduite. Aucun chapitre complet ni manuscrit intégral n’est intégré. La page est publique et n’est pas protégée par un compte : chacun peut consulter ces extraits.</p><p>L’accord de Julie reste nécessaire pour toute réutilisation ou diffusion éditoriale plus large. Les décors sont des interprétations artistiques générées, pas des photographies ou archives du voyage.</p></div>
          <div className="route-note"><h3>Le voyage réel, en repère</h3><p>14 destinations principales : 13 pays et Hong Kong.</p><p>{destinations.join(' → ')}</p><p>France avant le départ et au retour. Los Angeles et Abu Dhabi : escales. L’Inde, malgré son appellation d’escale, comporte un séjour et une excursion à Agra. Les voyages antérieurs ne sont pas ajoutés à ce parcours.</p></div>
          <footer className="reader-source"><h3>Sources et périmètre</h3><p>V5 de Julie Brosson, récupérée depuis la tâche éditoriale autorisée, avec les seize chapitres repérés. Titres, citations et passages contrôlés contre leur source. Cahier de concept « LES TERRES INTÉRIEURES » et deux maquettes de la même tâche.</p><p>Les fichiers complets restent dans le dossier de travail privé, hors projet web. La sélection conserve la ponctuation de la V5, y compris ses éventuelles particularités typographiques.</p></footer>
        </>}
      </div>
    </div>
  </dialog>;
}
