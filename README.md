# FlipTrack - CRM et Suivi de Profit pour Flippers

FlipTrack est une application Next.js conçue pour les brocanteurs et flippers français qui souhaitent tracker précisément leurs profits article par article.

## Tech Stack

- **Frontend**: Next.js 14 avec App Router
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Database + Storage)
- **Déploiement**: Vercel recommandé

## Fonctionnalités

### Pages principales

1. **Landing Page** (`/`) - Marketing avec tarification
2. **Authentification** (`/login`, `/signup`) - Supabase Auth
3. **Dashboard** (`/dashboard`) - Vue d'ensemble des flips
4. **Articles** (`/articles`) - Liste et gestion des articles
5. **Ajouter Article** (`/articles/nouveau`) - Formulaire avec photos
6. **Détail Article** (`/articles/[id]`) - Voir/modifier/vendre
7. **Dépenses** (`/depenses`) - Suivi des frais
8. **Profil** (`/profil`) - Paramètres utilisateur

### Fonctionnalités clés

- Gestion complète des articles (achat, restauration, vente)
- Upload de photos vers Supabase Storage
- Calcul automatique des frais de plateforme
- Calcul du profit net et ROI
- Suivi des dépenses par catégorie
- Alertes pour les articles en stock > 30 jours
- Interface mobile-first responsive
- Authentification sécurisée avec Supabase

## Installation

### 1. Cloner le repository

```bash
cd fliptrack
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

#### Créer les tables dans Supabase

Exécute ce SQL dans l'éditeur SQL de Supabase:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE,
  display_name TEXT,
  plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  condition TEXT,
  status TEXT DEFAULT 'stock',
  purchase_price DECIMAL(10, 2),
  purchase_date DATE,
  purchase_source TEXT,
  restoration_cost DECIMAL(10, 2),
  sale_price DECIMAL(10, 2),
  sale_date DATE,
  sale_platform TEXT,
  platform_fees DECIMAL(10, 2),
  shipping_cost DECIMAL(10, 2),
  net_profit DECIMAL(10, 2),
  roi_percent DECIMAL(5, 2),
  photos TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT,
  description TEXT,
  date DATE,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for items
CREATE POLICY "Users can view their own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for expenses
CREATE POLICY "Users can view their own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);
```

#### Créer un bucket Storage

1. Aller à Storage dans Supabase
2. Créer un nouveau bucket: `item-photos`
3. Mettre en public
4. Ajouter les RLS policies:

```sql
CREATE POLICY "Users can upload their own photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'item-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'item-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'item-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);
```

### 4. Variables d'environnement

Copier `.env.local.example` en `.env.local`:

```bash
cp .env.local.example .env.local
```

Remplir avec tes clés Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Lancer l'application

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

## Structure du projet

```
fliptrack/
├── app/
│   ├── layout.js              # Layout racine
│   ├── globals.css            # Styles globaux
│   ├── page.js                # Landing page
│   ├── login/page.js          # Page de connexion
│   ├── signup/page.js         # Page d'inscription
│   ├── dashboard/page.js      # Tableau de bord
│   ├── articles/
│   │   ├── page.js            # Liste des articles
│   │   ├── nouveau/page.js    # Ajouter article
│   │   └── [id]/page.js       # Détail article
│   ├── depenses/page.js       # Gestion dépenses
│   └── profil/page.js         # Profil utilisateur
├── components/
│   └── Layout.js              # Layout avec navigation
├── lib/
│   └── supabase.js            # Client Supabase
├── middleware.js              # Auth middleware
├── package.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Catégories et Statuts

### Catégories d'articles
- Meuble
- Décoration
- Vintage
- Luminaire
- Vaisselle
- Textile
- Autre

### États des articles
- À restaurer
- Bon état
- Comme neuf

### Statuts des articles
- En stock
- Restauration
- À vendre
- Vendu
- Expédié

### Plateformes de vente
- LeBonCoin (4.99%)
- Vinted (0%)
- Selency (15%)
- Facebook (0%)
- Brocante (manuel)
- Autre

### Catégories de dépenses
- Carburant
- Matériaux
- Emplacement
- Emballage
- Expédition
- Autre

## Déploiement

### Vercel (recommandé)

1. Push ton code vers GitHub
2. Connecte ton repo à Vercel
3. Ajoute les variables d'environnement
4. Deploy!

```bash
npm run build
npm start
```

## Notes importantes

- Row-Level Security (RLS) est activé dans Supabase
- Chaque utilisateur ne voit que ses propres données
- Les photos sont stockées dans Supabase Storage
- L'authentification utilise Supabase Auth
- Les calculs de profit et ROI sont automatiques

## Calculs

### Net Profit
```
Net Profit = Sale Price - (Purchase Price + Restoration Cost + Platform Fees + Shipping Cost)
```

### ROI
```
ROI (%) = (Net Profit / Total Investment) × 100
Total Investment = Purchase Price + Restoration Cost
```

### Platform Fees
- LeBonCoin: 4.99% du prix de vente
- Vinted: 0%
- Selency: 15% du prix de vente
- Facebook: 0%
- Autre: À définir manuellement

## Support et aide

Pour toute question ou bug report, crée une issue dans le repository.

---

**FlipTrack** - Suivi de profit simple pour les brocanteurs et flippers français.
