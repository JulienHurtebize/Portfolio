# Portfolio professionnel — Julien Hurtebize

Site multi-pages structuré en **12 pages HTML statiques**, démarche réflexive sur les compétences du référentiel **RNCP35455** (BUT R&T parcours Cybersécurité).

## Structure

```
.
├── index.html         Accueil + menu visuel
├── parcours.html      Mon parcours (avec détail complet des matières S1 à S5)
├── referentiel.html   Le diplôme et son référentiel RNCP
├── matrice.html       Matrice de correspondance SAÉ ↔ blocs RNCP
├── c1.html            C1 — Administrer les réseaux
├── c2.html            C2 — Connecter les usagers
├── c3.html            C3 — Créer des outils et applications
├── c4.html            C4 — Administrer un SI sécurisé
├── c5.html            C5 — Surveiller un SI sécurisé
├── transverses.html   Compétences transverses (BC06–BC10)
├── avenir.html        Projet professionnel
├── annexes.html       Outils, certifications, remerciements
├── styles.css         Feuille de style commune
├── script.js          Interactions communes (palette, tabs, recherche, lightbox…)
└── images/            Captures et portrait
```

Chaque page est totalement autonome : on peut la partager directement par URL, l'envoyer en lien, ou l'imprimer en PDF individuellement.

## Test en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Déploiement sur GitHub Pages

1. Créer un dépôt public sur GitHub (par exemple `portfolio` ou `julienhurtebize.github.io`)
2. Pousser le contenu du dossier sur `main` :
   ```bash
   git init
   git add .
   git commit -m "Portfolio BUT3"
   git branch -M main
   git remote add origin https://github.com/<utilisateur>/<dépôt>.git
   git push -u origin main
   ```
3. Activer GitHub Pages : Settings → Pages → branche `main`, dossier `/ (root)`
4. Site disponible à `https://<utilisateur>.github.io/<dépôt>/` après quelques minutes

## Interactions

- **Navigation entre pages** : sidebar à gauche, boutons précédent/suivant en haut et en bas, mini-map cliquable
- **Recherche locale** : `/` ou clic sur le champ de recherche en haut, filtre les contenus de la page courante avec surlignage
- **Palette de commandes** : `Cmd+K` (Mac) ou `Ctrl+K` (Win/Linux), navigation rapide entre les 12 chapitres
- **Six questions en onglets** : sur chaque AC niveau 3, les six questions sont sur des onglets cliquables (et navigables aux flèches)
- **Filtres matières** : sur la page Parcours, filtres par semestre et par tranche de note pour cibler les matières
- **Lightbox** : clic sur une trace pour l'agrandir en plein écran
- **Raccourcis clavier** : `←` `→` pour passer de chapitre en chapitre
- **Mode jour/nuit** : toggle dans la sidebar, préférence sauvegardée

## Édition

Pour modifier le contenu d'un chapitre, éditer directement le fichier `.html` correspondant. La structure HTML repose sur quelques classes simples :

- `.ac-card` : carte d'Apprentissage Critique
- `.six-q` : conteneur des six questions (transformé en onglets par le JS)
- `.trace` : capture commentée
- `.exp-card` : expérience professionnelle
- `.menu-card` : carte du menu d'accueil

Pour ajouter une page, dupliquer un chapitre existant, modifier le `<title>`, le contenu de la `<section>`, et mettre à jour la sidebar dans toutes les pages.

## Crédits

Conception, rédaction et développement : **Julien Hurtebize**, BUT 3 R&T Cybersécurité, IUT de Béthune, promotion 2023–2026.

Référentiel : RNCP35455 — BUT Réseaux et Télécommunications, parcours Cybersécurité, niveau 6 (Bac +3), 180 ECTS.
