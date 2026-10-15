# LES TERRES INTÉRIEURES

Expérience web autour de *Le Monde pour miroir*, récit de Julie Brosson. Six territoires artistiques, seize haltes dans l’ordre du récit, avec une sélection de citations et de passages vérifiés dans la V5. Aucun manuscrit intégral ni chapitre complet n’est inclus.

## Publication visée

**https://nogues.app/monde-pour-miroir/**

Le build est autonome : les sept décors WebP sont embarqués et les URLs respectent `/monde-pour-miroir/`. Aucune dépendance au serveur de prévisualisation, aucun compte, aucune API, aucun appel IA ni analytics au runtime. Le site reste non indexable par consigne (`noindex`); cela n’empêche pas sa consultation publique.

Ce dépôt est un export de publication vers le dépôt GitHub existant demandé. Il ne change pas le dépôt canonique du projet de travail géré dans Manus.

## Développer et tester

Node 22 et pnpm 10.18.0, versions des dépendances verrouillées.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm dev
```

Vite annonce l’URL de développement sous `/monde-pour-miroir/`. `dist/` contient les seuls fichiers à publier. Les tests unitaires contrôlent les seize haltes et la sélection. `tests/browser_acceptance.py` teste desktop, mobile, clavier et préférences; il nécessite Python, Playwright et Chromium. L’URL de test peut être définie par `SITE_URL`.

## GitHub Actions → hébergement OVHcloud

Le workflow `.github/workflows/deploy-ovh.yml` compile, contrôle les types et la sélection, puis publie par SFTP. Il reprend le protocole et les noms documentés par le [workflow public de nogues.app](https://github.com/nogseb/nogues.app/blob/main/.github/workflows/deploy-ovh.yml).

| Paramètre GitHub Actions de **ce dépôt** | Usage |
| --- | --- |
| Secret `OVH_SFTP_HOST` | Hôte SFTP de l’hébergement |
| Secret `OVH_SFTP_USER` | Utilisateur SFTP |
| Secret `OVH_SFTP_PASSWORD` | Mot de passe SFTP |
| Variable `OVH_TARGET_DIR` | Racine web; valeur par défaut `www`, selon le workflow existant du domaine |

La destination est toujours **`<racine web>/monde-pour-miroir`**; le répertoire est créé s’il n’existe pas. Les fichiers sont ajoutés/remplacés **sans suppression distante** : ni la page d’accueil ni les autres sous-répertoires ne sont synchronisés par ce workflow. Les trois secrets d’un autre dépôt ne sont pas automatiquement disponibles ici : ils doivent être configurés dans ce dépôt ou explicitement partagés par une organisation.

Si des secrets manquent, le déploiement échoue explicitement : une compilation réussie ne sera pas présentée comme une mise en ligne. Les changements de `main` déclenchent la chaîne; après configuration des accès, le bouton **Run workflow** permet de relancer la publication. Le workflow vérifie ensuite la page et les sept images à leur URL publique.

## Contenu et limites

Les six territoires sont des interprétations artistiques, pas une carte des destinations. Les décors générés ne sont pas des archives du voyage. La traversée guidée utilise des calques et des transitions 2,5D, pas un monde 3D libre. Le parcours est muet, accepte le clavier et propose lecture calme, mouvement réduit et trois tailles de texte. Les paragraphes P0562 et P0566 sont séparés par une ellipse déclarée.

Textes de Julie Brosson : attribution conservée; aucune licence de réutilisation du manuscrit n’est accordée par ce dépôt. L’autorisation de l’autrice reste à gérer pour toute réutilisation éditoriale plus large. Seuls les passages sélectionnés sont exposés; les sources complètes restent hors dépôt.
