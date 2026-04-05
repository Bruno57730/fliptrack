# Guide de configuration rapide FlipTrack

## 1. Installation locale (5 min)

```bash
# Naviguer au dossier
cd fliptrack

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

## 2. Configuration Supabase (10 min)

### Étape 1: Créer un projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Copier la clé d'API et l'URL du projet

### Étape 2: Configurer les variables d'environnement

```bash
# Copier le fichier example
cp .env.local.example .env.local

# Éditer .env.local avec tes clés Supabase:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Étape 3: Créer les tables

1. Aller dans Supabase → SQL Editor
2. Copier-coller le SQL complet du fichier `README.md`
3. Exécuter le SQL

### Étape 4: Créer le bucket Storage

1. Aller à Storage dans Supabase
2. Créer un bucket nommé: `item-photos`
3. Le mettre en public
4. Copier les RLS policies du README.md

## 3. Tester l'app (5 min)

### Pages à tester

1. **Page d'accueil** - `/`
   - Voir le landing page marketing

2. **Inscription** - `/signup`
   - Créer un nouveau compte
   - Vérifier que le profil est créé dans Supabase

3. **Connexion** - `/login`
   - Se connecter avec les identifiants créés

4. **Dashboard** - `/dashboard`
   - Voir la page de vue d'ensemble

5. **Articles** - `/articles`
   - Voir la liste (vide au départ)

6. **Ajouter article** - `/articles/nouveau`
   - Remplir le formulaire
   - Ajouter des photos
   - Créer l'article

7. **Voir article** - `/articles/[id]`
   - Voir les détails
   - Modifier l'article
   - Marquer comme vendu avec calcul du profit

8. **Dépenses** - `/depenses`
   - Ajouter une dépense
   - Voir les statistiques

9. **Profil** - `/profil`
   - Modifier le nom d'affichage
   - Voir les informations du compte
   - Se déconnecter

## 4. Fichiers clés

### Configuration
- `.env.local` - Variables d'environnement (à créer)
- `next.config.js` - Config Next.js
- `tailwind.config.js` - Config Tailwind CSS

### Code applicatif
- `app/` - Pages et layouts
- `components/Layout.js` - Composant de navigation
- `lib/supabase.js` - Client Supabase

### Styles
- `app/globals.css` - Styles globaux

## 5. Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install
```

### "Missing Supabase environment variables"
- Vérifier que `.env.local` existe
- Vérifier que les clés ne sont pas vides

### Les photos ne s'upload pas
- Vérifier que le bucket `item-photos` existe
- Vérifier les RLS policies du bucket
- Vérifier les permissions dans Supabase

### Erreur d'authentification
- Vérifier que les clés Supabase sont correctes
- Vérifier que la table `profiles` existe
- Vérifier que RLS est activé sur les tables

## 6. Déploiement

### Sur Vercel (recommandé)

```bash
# 1. Push vers GitHub
git push

# 2. Connecter le repo à Vercel
# https://vercel.com/new

# 3. Ajouter les env vars dans Vercel
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Deploy!
```

### Build local
```bash
npm run build
npm start
```

## 7. Structure des catégories

### Catégories d'articles
```
meuble | decoration | vintage | luminaire | vaisselle | textile | autre
```

### États des articles
```
a_restaurer | bon_etat | comme_neuf
```

### Statuts des articles
```
stock | restauration | liste | vendu | expedie
```

### Catégories de dépenses
```
carburant | materiaux | emplacement | emballage | expedition | autre
```

## 8. Tarification

- **Gratuit**: 0€/mois, 20 articles max
- **Pro**: 9,99€/mois, articles illimités

Plan limiteur à implémenter dans `app/articles/nouveau/page.js`:
```javascript
if (profile?.plan === 'free' && items.length >= 20) {
  // Afficher message: "Limite atteinte, passe à Pro"
}
```

## 9. Fonctionnalités avancées à ajouter

- [ ] Intégration Stripe pour les paiements Pro
- [ ] Graphiques et analytics avancées
- [ ] Export des données en CSV/PDF
- [ ] Intégration avec LeBonCoin API
- [ ] Notifications email
- [ ] Backup automatique des données
- [ ] Mode sombre
- [ ] Internationalisation (EN, ES, etc.)

## 10. Commandes utiles

```bash
# Développement
npm run dev

# Build
npm run build

# Production
npm start

# Linting
npm run lint
```

---

**Besoin d'aide?** Consulte `README.md` pour plus de détails.
