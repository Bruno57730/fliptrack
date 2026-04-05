# FlipTrack - Installation & Setup Guide

## Quick Start (15 minutes)

### Step 1: Prepare the Project

```bash
cd /sessions/vigilant-nifty-ritchie/fliptrack
npm install
```

### Step 2: Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to initialize

### Step 3: Configure Environment

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and add your Supabase credentials:
# From your Supabase project dashboard:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Set Up Database

1. In Supabase, go to **SQL Editor**
2. Click **New query**
3. Open the file `database-setup.sql` in this project
4. Copy the entire content
5. Paste it into the Supabase SQL editor
6. Click **Run**

This creates three tables with all necessary fields and security policies.

### Step 5: Set Up Storage

1. In Supabase, go to **Storage**
2. Click **Create new bucket**
3. Name it: `item-photos`
4. **Uncheck** "Private bucket"
5. Click **Create bucket**

You have the storage bucket set up!

### Step 6: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## First Use

### Create an Account

1. Click "Créer mon compte gratuit" on the landing page
2. Enter email, password, and display name
3. Click "Créer mon compte"
4. You'll be redirected to dashboard (initially empty)

### Add Your First Item

1. Go to **Articles** section
2. Click **➕ Ajouter un article**
3. Fill in the form:
   - **Titre**: Name of the item
   - **Catégorie**: Choose from list
   - **État**: Condition (À restaurer, Bon état, Comme neuf)
   - **Prix d'achat**: Purchase price
   - **Date d'achat**: Purchase date
   - **Source d'achat**: Where you bought it
   - **Photos**: Upload images
4. Click **Créer l'article**

### Mark Item as Sold

1. Go to **Articles** and click an item
2. Click **💰 Marquer comme vendu**
3. Fill in the sell form:
   - **Prix de vente**: Sale price
   - **Plateforme**: Where you sold it
   - **Frais plateforme**: Auto-calculated
   - **Frais de port**: Shipping cost
4. Watch the profit preview calculate
5. Click **Marquer comme vendu**

---

## Detailed Configuration

### Supabase Project Setup

#### Creating Tables (via SQL Editor)

The `database-setup.sql` file creates:

1. **profiles** table - User data
2. **items** table - Your articles/flips
3. **expenses** table - Expense tracking

All with proper:
- Foreign keys
- Indexes
- Row-Level Security (RLS)
- User isolation policies

#### Creating Storage Bucket

The `item-photos` bucket stores article photos.

It uses object storage with user-based path isolation.

### Environment Variables

Only TWO variables needed:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

Both are public (NEXT_PUBLIC_ prefix) - it's safe!

---

## File Structure

```
fliptrack/
├── app/                    # Next.js App Router
│   ├── layout.js          # Root layout
│   ├── globals.css        # Global styles
│   ├── page.js            # Landing page
│   ├── login/page.js      # Login
│   ├── signup/page.js     # Signup
│   ├── dashboard/         # Dashboard
│   ├── articles/          # Items management
│   ├── depenses/          # Expenses
│   └── profil/            # Profile
├── components/
│   └── Layout.js          # Shared navigation
├── lib/
│   └── supabase.js        # Supabase client
├── middleware.js          # Auth middleware
├── package.json
├── tailwind.config.js
└── .env.local            # Your credentials (create this)
```

---

## Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## Database Tables

### profiles
- `id` (UUID) - User ID
- `email` (TEXT) - Email address
- `display_name` (TEXT) - Username
- `plan` (TEXT) - 'free' or 'pro'
- `created_at` - Account creation date

### items
- `id` (UUID) - Item ID
- `user_id` (UUID) - Owner
- `title` (TEXT) - Item name
- `category` (TEXT) - meuble, decoration, vintage, etc.
- `condition` (TEXT) - État de l'article
- `status` (TEXT) - stock, restauration, liste, vendu, expedie
- `purchase_price` (DECIMAL) - Cost
- `purchase_date` (DATE) - Date bought
- `sale_price` (DECIMAL) - Selling price
- `sale_date` (DATE) - Date sold
- `sale_platform` (TEXT) - Where sold
- `platform_fees` (DECIMAL) - Commission paid
- `shipping_cost` (DECIMAL) - Shipping
- `net_profit` (DECIMAL) - Final profit
- `roi_percent` (DECIMAL) - Return on investment %
- `photos` (TEXT[]) - Photo URLs
- `notes` (TEXT) - Additional notes

### expenses
- `id` (UUID) - Expense ID
- `user_id` (UUID) - Owner
- `amount` (DECIMAL) - Cost
- `category` (TEXT) - carburant, materiaux, etc.
- `description` (TEXT) - Details
- `date` (DATE) - When spent
- `item_id` (UUID) - Linked item (optional)

---

## Platform Fees

Platform-specific fees are auto-calculated:

| Platform | Fee |
|----------|-----|
| LeBonCoin | 4.99% |
| Vinted | 0% |
| Selency | 15% |
| Facebook | 0% |
| Brocante | Manual |
| Autre | Manual |

---

## Calculations

### Net Profit Formula
```
Net Profit = Sale Price - (Purchase Price + Restoration Cost + Platform Fees + Shipping Cost)
```

### ROI Formula
```
ROI = (Net Profit / (Purchase Price + Restoration Cost)) × 100
```

---

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install
```

### "Missing Supabase environment variables"
- Check that `.env.local` exists
- Check that both URL and key are filled in
- Restart the dev server

### "Error: Users can only be created with a password"
- Supabase Auth requires password-based signup
- Passwordless auth can be added later

### Photos not uploading
- Check that `item-photos` bucket exists
- Check that it's marked as public
- Check browser console for errors

### Database errors
- Verify you ran the entire `database-setup.sql` script
- Check that RLS is enabled on tables
- Check that policies were created

### Routes not working
- Check middleware.js is in root
- Verify `.env.local` has correct values
- Check browser console for auth errors

---

## Deployment to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/fliptrack.git
git push -u origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click Deploy

### 3. Verify Deployment
- Check that your app loads
- Test signup/login
- Test creating an article
- Test uploading photos

---

## Next Steps

After setup, you can:

1. **Customize Colors** - Edit `tailwind.config.js`
2. **Add More Fields** - Modify database schema
3. **Enable Email Verification** - In Supabase Auth settings
4. **Set Up Payments** - Integrate Stripe for Pro plan
5. **Add Analytics** - Integrate Plausible or Mixpanel

---

## Support & Documentation

- **README.md** - Full documentation
- **SETUP.md** - Quick start guide
- **database-setup.sql** - Database schema
- **CHECKLIST.md** - Feature checklist
- **PROJECT_SUMMARY.txt** - Overview

---

## What's Included

✓ Complete Next.js 14 application
✓ Authentication with Supabase
✓ Full database schema
✓ Photo storage integration
✓ Responsive mobile design
✓ All pages and features
✓ Profit calculations
✓ French localization
✓ Production-ready code

---

## Pricing

The application includes:

**Free Plan**
- 20 articles max
- All features
- 0€/month

**Pro Plan**
- Unlimited articles
- All features
- 9.99€/month (Stripe integration needed)

---

## Security

✓ Row-Level Security enabled
✓ User data isolation
✓ No hardcoded secrets
✓ Environment variables for sensitive data
✓ Secure authentication
✓ Protected API routes

---

## Performance

✓ Optimized images
✓ Lazy loading
✓ Minimal JavaScript
✓ Database indexes
✓ Efficient queries
✓ Fast page loads

---

**You're all set! Start by running `npm run dev` and enjoy using FlipTrack!**
