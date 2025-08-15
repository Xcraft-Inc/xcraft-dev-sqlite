# 📘 xcraft-dev-sqlite

## Aperçu

Le module `xcraft-dev-sqlite` est un utilitaire de développement spécialisé dans la reconstruction du module `better-sqlite3` pour les applications Electron. Il automatise le processus de compilation native nécessaire pour assurer la compatibilité entre SQLite et l'environnement Electron, en gérant les différences d'ABI (Application Binary Interface) entre Node.js et Electron.

## Sommaire

- [Structure du module](#structure-du-module)
- [Fonctionnement global](#fonctionnement-global)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Interactions avec d'autres modules](#interactions-avec-dautres-modules)
- [Détails des sources](#détails-des-sources)

## Structure du module

Le module est organisé autour d'un script exécutable principal qui :

- Détecte automatiquement la version d'Electron utilisée dans le projet
- Gère la mise en cache des binaires compilés
- Orchestre la recompilation de `better-sqlite3` avec les bonnes variables d'environnement

## Fonctionnement global

Le processus de reconstruction suit cette séquence :

1. **Détection de version** : Analyse du `package.json` pour extraire la version d'Electron
2. **Vérification du cache** : Contrôle de l'existence des binaires déjà compilés
3. **Sauvegarde** : Conservation du binaire Node.js original si nécessaire
4. **Recompilation** : Lancement de `npm rebuild` avec les variables d'environnement Electron
5. **Mise en cache** : Stockage du binaire Electron compilé pour éviter les recompilations futures

Le système de cache utilise des noms de fichiers distincts :

- `node_better_sqlite3.node` : Version compilée pour Node.js
- `electron_better_sqlite3.node` : Version compilée pour Electron

## Exemples d'utilisation

### Utilisation en ligne de commande

```bash
# Reconstruction automatique dans le répertoire courant
npx xcraft-dev-sqlite .

# Reconstruction dans un répertoire spécifique
npx xcraft-dev-sqlite /path/to/electron/project

# Utilisation via le binaire installé globalement
xcraft-dev-sqlite /path/to/project
```

### Intégration dans un script npm

```json
{
  "scripts": {
    "postinstall": "xcraft-dev-sqlite .",
    "electron:rebuild": "xcraft-dev-sqlite ."
  }
}
```

### Utilisation programmatique

```javascript
const {spawnSync} = require('child_process');
const path = require('path');

// Lancement de la reconstruction
spawnSync('xcraft-dev-sqlite', [path.resolve('.')], {
  stdio: 'inherit',
  shell: true,
});
```

## Interactions avec d'autres modules

Le module interagit principalement avec :

- **better-sqlite3** : Module SQLite natif qui nécessite une recompilation
- **electron** : Runtime cible pour la compilation
- **[xcraft-core-fs]** : Utilitaires de système de fichiers Xcraft
- **npm** : Gestionnaire de paquets utilisé pour la recompilation

## Détails des sources

### `bin/sqlite.js`

Script exécutable principal qui orchestre la reconstruction de `better-sqlite3` pour Electron. Il implémente une logique de cache intelligente pour éviter les recompilations inutiles.

#### Fonctions principales

- **`rebuild(bundlePath)`** — Fonction principale qui gère tout le processus de reconstruction. Elle détecte la version d'Electron, vérifie le cache, et lance la recompilation si nécessaire.

- **`main(args)`** — Point d'entrée qui extrait le chemin du projet depuis les arguments de ligne de commande et lance la reconstruction.

#### Mécanisme de cache

Le script utilise un répertoire `.cache/better-sqlite3/` dans `node_modules` pour stocker les binaires compilés :

```
node_modules/
└── .cache/
    └── better-sqlite3/
        ├── node_better_sqlite3.node      # Version Node.js
        └── electron_better_sqlite3.node  # Version Electron
```

#### Variables d'environnement de compilation

Lors de la recompilation, le script configure automatiquement :

| Variable                       | Description                             | Exemple                          |
| ------------------------------ | --------------------------------------- | -------------------------------- |
| `npm_config_target`            | Version d'Electron cible                | `13.1.7`                         |
| `npm_config_arch`              | Architecture du processeur              | `x64`                            |
| `npm_config_target_arch`       | Architecture cible                      | `x64`                            |
| `npm_config_runtime`           | Runtime de compilation                  | `electron`                       |
| `npm_config_disturl`           | URL des headers Electron                | `https://electronjs.org/headers` |
| `npm_config_build_from_source` | Force la compilation depuis les sources | `true`                           |
| `CFLAGS`                       | Flags de compilation C                  | `-Wno-error`                     |
| `CXXFLAGS`                     | Flags de compilation C++                | `-Wno-error`                     |

#### Gestion des erreurs

Le script inclut une gestion robuste des cas particuliers :

- Absence de dépendance Electron dans le projet
- Binaires déjà compilés et mis en cache
- Échecs de compilation (flags `-Wno-error` pour ignorer les warnings)

---

[xcraft-core-fs]: https://github.com/Xcraft-Inc/xcraft-core-fs

_Documentation mise à jour pour refléter l'état actuel du module._