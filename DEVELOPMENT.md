# Guide de Développement Local

## Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Visual Studio Code

## Installation

1. **Cloner le projet** (si pas déjà fait)
```bash
git clone <votre-repo-url>
cd <nom-du-projet>
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
# Copier le fichier d'exemple
cp .env.example .env.local

# Éditer .env.local avec vos vraies valeurs Supabase
```

4. **Démarrer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:8080`

## Extensions VS Code Recommandées

Les extensions recommandées sont définies dans `.vscode/extensions.json`. VS Code vous proposera de les installer automatiquement.

## Scripts Disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build pour la production
- `npm run build:dev` - Build en mode développement
- `npm run lint` - Vérification du code avec ESLint
- `npm run preview` - Prévisualise le build de production

## Configuration VS Code

Le fichier `.vscode/settings.json` configure automatiquement:
- Formatage automatique avec Prettier
- Auto-fix ESLint au save
- Support complet de TypeScript
- IntelliSense pour Tailwind CSS