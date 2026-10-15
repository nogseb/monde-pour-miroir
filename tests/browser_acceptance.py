import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
URL = os.environ.get('SITE_URL', 'http://127.0.0.1:3010/monde-pour-miroir/')
DATA = json.loads((ROOT / 'client/src/data/selection.json').read_text())
RESULTS = []
SHOTS = ROOT / 'tests/screenshots'
SHOTS.mkdir(exist_ok=True)

def record(name):
    RESULTS.append({'test': name, 'result': 'PASS'})
    print('PASS:', name, flush=True)
    (ROOT / 'tests/browser-results.json').write_text(json.dumps(RESULTS, ensure_ascii=False, indent=2) + '\n')

def loaded(page):
    page.goto(URL, wait_until='networkidle', timeout=60000)
    expect(page.locator('h1')).to_be_visible()

def chapter(page, number):
    expect(page.locator('.journey-app')).to_have_attribute('data-active-chapter', str(number))

def close(page):
    page.get_by_role('button', name='Fermer le panneau').click()
    expect(page.locator('dialog')).not_to_be_visible()

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium')
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    loaded(page)
    page.screenshot(path=str(SHOTS / 'desktop-depart.png'))
    expect(page.locator('.journey-app')).to_have_attribute('data-motion', 'reduced')
    record('Préférence système prefers-reduced-motion appliquée dès le chargement')
    page.get_by_role('button', name='Commencer la traversée').click()
    chapter(page, 1)
    assert page.evaluate('document.activeElement.id') == 'title-halte-01'
    record('Entrer dans la traversée et transférer le focus à la halte')
    for index in range(16):
        scene = page.locator(f'#halte-{index+1:02}')
        scene.locator('.reading-point').click()
        expect(page.locator('dialog')).to_be_visible()
        expect(page.locator('.reader-meta')).to_contain_text(DATA[index]['chapterTitle'])
        assert page.evaluate('document.activeElement.id') == 'dialog-title'
        source_text = page.locator('.source-passage').text_content()
        for passage in DATA[index]['passages']:
            assert passage['text'] in source_text
            assert passage['reference'] in source_text
        if index == 5:
            expect(page.locator('.ellipse')).to_contain_text('passages non consécutifs')
        page.keyboard.press('Escape')
        expect(page.locator('dialog')).not_to_be_visible()
        assert page.locator('.reading-point:focus').count() == 1
        if index < 15:
            scene.locator('[data-next]').click()
            chapter(page, index + 2)
    record('Parcours successif des seize haltes et des six régions jusqu’au retour, extraits exacts, Escape et restauration du focus')
    page.screenshot(path=str(SHOTS / 'desktop-retour.png'))
    page.locator('#halte-16 [data-next]').click()
    chapter(page, 0)
    page.get_by_role('button', name='Commencer la traversée').click()
    chapter(page, 1)
    record('Revoir le départ depuis la fin du chapitre 16')
    page.get_by_role('button', name='Vue d’ensemble', exact=True).click()
    assert page.locator('.territory').count() == 6
    assert page.locator('.chapter-links button').count() == 16
    page.locator('.chapter-links button').nth(2).click()
    chapter(page, 3)
    page.screenshot(path=str(SHOTS / 'desktop-desert.png'))
    page.locator('#halte-03 .scene-actions .text-button').click()
    chapter(page, 2)
    record('Vue d’ensemble fonctionnelle : six régions, seize accès et retour à la halte précédente')
    page.get_by_role('button', name='La sélection', exact=True).click()
    assert page.locator('.library-list > button').count() == 16
    page.locator('[data-read-index="5"]').click()
    page.get_by_role('button', name='Augmenter la taille du texte').click()
    expect(page.locator('.text-tools')).to_contain_text('Grand')
    page.get_by_role('button', name='Augmenter la taille du texte').click()
    expect(page.locator('.text-tools')).to_contain_text('Très grand')
    expect(page.get_by_role('button', name='Augmenter la taille du texte')).to_be_disabled()
    size = page.locator('.source-passage').evaluate('(e) => getComputedStyle(e).fontSize')
    assert float(size.replace('px','')) > 24
    page.get_by_role('button', name='Extrait suivant', exact=True).click()
    expect(page.locator('.reader-meta')).to_contain_text('De retour à la maison')
    page.get_by_role('button', name='Extrait précédent', exact=True).click()
    expect(page.locator('.reader-meta')).to_contain_text('La route à deux')
    page.screenshot(path=str(SHOTS / 'desktop-lecteur.png'))
    page.get_by_role('button', name='Revenir à cette halte').click()
    chapter(page, 6)
    record('Bibliothèque, lecteur suivant/précédent, taille de texte et retour à la halte lue')
    page.get_by_role('button', name='Réglages de lecture').click()
    page.get_by_label('Lecture calme', exact=False).check()
    close(page)
    expect(page.locator('.journey-app')).to_have_class('journey-app calm-mode reduced-motion')
    assert page.locator('.landscape').evaluate('(e) => getComputedStyle(e).display') == 'none'
    page.reload(wait_until='networkidle')
    assert page.locator('.calm-mode').count() == 1
    record('Lecture calme sans paysage animé et persistance locale des préférences')
    page.get_by_role('button', name='Réglages de lecture').click()
    page.get_by_label('Lecture calme', exact=False).uncheck()
    close(page)
    page.get_by_role('button', name='À propos et confidentialité du prototype').click()
    expect(page.locator('.privacy-note')).to_contain_text('La page est publique')
    expect(page.locator('.route-note')).to_contain_text('14 destinations')
    close(page)
    record('Périmètre, sources, confidentialité et distinction destinations/territoires explicités')
    assert not errors, errors
    record('Aucune erreur JavaScript à l’exécution desktop')

    mobile = browser.new_context(viewport={'width':390, 'height':844}, is_mobile=True, has_touch=True, device_scale_factor=1, reduced_motion='reduce')
    phone = mobile.new_page()
    loaded(phone)
    phone.screenshot(path=str(SHOTS / 'mobile-depart.png'))
    assert phone.evaluate('document.documentElement.scrollWidth <= innerWidth')
    phone.get_by_role('button', name='Commencer la traversée').click()
    chapter(phone, 1)
    phone.get_by_role('button', name='Vue d’ensemble', exact=True).click()
    phone.locator('.chapter-links button').nth(5).click()
    chapter(phone, 6)
    phone.locator('#halte-06 .reading-point').click()
    expect(phone.locator('.ellipse')).to_contain_text('Ellipse')
    phone.screenshot(path=str(SHOTS / 'mobile-lecteur.png'))
    assert phone.evaluate('document.querySelector("dialog").scrollWidth <= innerWidth')
    phone.get_by_role('button', name='Revenir à cette halte').click()
    chapter(phone, 6)
    phone.locator('#halte-06 [data-next]').click()
    chapter(phone, 7)
    phone.get_by_role('button', name='Vue d’ensemble', exact=True).click()
    phone.locator('.chapter-links button').nth(15).click()
    chapter(phone, 16)
    phone.screenshot(path=str(SHOTS / 'mobile-retour.png'))
    phone.locator('#halte-16 [data-next]').click()
    chapter(phone, 0)
    phone.get_by_role('button', name='Commencer la traversée').click()
    chapter(phone, 1)
    record('Mobile 390×844 : interface sans débordement, panneaux, extrait et ellipse, navigation et retour ch16')
    phone.get_by_role('button', name='Réglages de lecture').click()
    phone.get_by_label('Lecture calme', exact=False).check()
    close(phone)
    phone.locator('#halte-01 [data-next]').click()
    chapter(phone, 2)
    record('Mobile : mode lecture calme et navigation conservée')

    keyboard = browser.new_context(viewport={'width':1280,'height':800}, reduced_motion='reduce')
    keys = keyboard.new_page()
    loaded(keys)
    keys.keyboard.press('Tab')
    assert keys.evaluate('document.activeElement.className') == 'skip-link'
    keys.keyboard.press('Enter')
    keys.get_by_role('button', name='La sélection', exact=True).focus()
    keys.keyboard.press('Enter')
    expect(keys.locator('dialog')).to_be_visible()
    for _ in range(35):
        keys.keyboard.press('Tab')
        assert keys.evaluate('document.querySelector("dialog").contains(document.activeElement)')
    keys.keyboard.press('Escape')
    assert keys.get_by_role('button', name='La sélection', exact=True).evaluate('(e) => e === document.activeElement')
    record('Clavier : lien d’évitement, Enter, focus contenu dans le panneau, Escape et restitution')

    normal = browser.new_context(viewport={'width':1440,'height':1000}, reduced_motion='no-preference')
    motion = normal.new_page()
    loaded(motion)
    expect(motion.locator('.journey-app')).to_have_attribute('data-motion', 'full')
    motion.get_by_role('button', name='Commencer la traversée').click()
    motion.wait_for_function('Math.abs(window.scrollY - document.querySelector("#halte-01").offsetTop) < 3')
    chapter(motion, 1)
    motion.get_by_role('button', name='Réglages de lecture').click()
    motion.get_by_label('Mouvement réduit', exact=False).check()
    close(motion)
    expect(motion.locator('.journey-app')).to_have_attribute('data-motion', 'reduced')
    motion.locator('#halte-01 [data-next]').click()
    chapter(motion, 2)
    record('Mode normal : déplacement doux réel; commande de mouvement réduit opérationnelle')
    browser.close()

(ROOT / 'tests/browser-results.json').write_text(json.dumps(RESULTS, ensure_ascii=False, indent=2) + '\n')
print(f'{len(RESULTS)} groupes de contrôles validés.', flush=True)
