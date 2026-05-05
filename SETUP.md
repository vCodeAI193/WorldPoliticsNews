# WorldPoliticsNews – Setup-Anleitung

## Voraussetzungen

- Node.js >= 22
- PostgreSQL >= 14
- npm >= 10

## 1. Dependencies installieren

```bash
npm install
```

## 2. Umgebungsvariablen einrichten

### Backend
```bash
cp backend/.env.example backend/.env
# Werte eintragen (siehe Abschnitt "Externe Dienste")
```

### Web
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

## 3. Datenbank anlegen

```bash
# PostgreSQL-Datenbank erstellen
createdb worldpoliticsnews

# Prisma-Schema migrieren + Client generieren
npm run db:migrate
```

## 4. Entwicklungsserver starten

```bash
# Terminal 1 – Backend API (Port 3001)
npm run dev:backend

# Terminal 2 – Web-App (Port 3000)
npm run dev:web

# Terminal 3 – Mobile App
cd apps/mobile
npx expo start
```

---

## Externe Dienste einrichten

### Pflicht (App funktioniert nicht ohne diese)

| Dienst | Variable | Link |
|---|---|---|
| PostgreSQL | `DATABASE_URL` | Lokal oder [Supabase](https://supabase.com) |
| Anthropic Claude | `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| Tavily Search | `TAVILY_API_KEY` | [tavily.com](https://tavily.com) – kostenloser Tier verfügbar |

### Für Monetarisierung (optional für Entwicklung)

| Dienst | Variablen | Link |
|---|---|---|
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PLUS_PRICE_ID` | [stripe.com](https://stripe.com) |
| RevenueCat | In `apps/mobile/app.json` → `extra` | [revenuecat.com](https://revenuecat.com) |
| Google AdSense | `NEXT_PUBLIC_ADSENSE_ID` | [adsense.google.com](https://adsense.google.com) |
| Google AdMob | In `apps/mobile/app.json` → `plugins` | [admob.google.com](https://admob.google.com) |

---

## Stripe Webhooks lokal testen

```bash
# Stripe CLI installieren, dann:
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

Den angezeigten `whsec_...`-Wert als `STRIPE_WEBHOOK_SECRET` eintragen.

## Stripe Produkt & Preis anlegen

```bash
# Im Stripe Dashboard: Produkt "WorldPoliticsNews Plus" anlegen
# Monatspreis: 3,99 €
# Die Price-ID (price_...) als STRIPE_PLUS_PRICE_ID eintragen
```

---

## Mobile App Assets

Expo benötigt für Produktions-Builds folgende Dateien:
- `apps/mobile/assets/icon.png` – 1024×1024 px
- `apps/mobile/assets/splash.png` – 1284×2778 px
- `apps/mobile/assets/adaptive-icon.png` – 1024×1024 px (Android)

Für lokale Entwicklung (`expo start`) sind Platzhalter-PNGs ausreichend.

## Produktions-Deployment

### Backend
```bash
npm run build:backend
node backend/dist/index.js
```

### Web
```bash
npm run build:web
# Deployment auf Vercel, Netlify oder eigenem Server
```

### Mobile (via EAS)
```bash
npm install -g eas-cli
cd apps/mobile
eas build --platform all
eas submit --platform all
```

---

## API-Endpunkte

| Methode | Pfad | Beschreibung |
|---|---|---|
| GET | `/api/health` | Health-Check |
| POST | `/api/auth/register` | Registrierung |
| POST | `/api/auth/login` | Anmeldung |
| POST | `/api/auth/refresh` | Token erneuern |
| POST | `/api/auth/logout` | Abmelden |
| GET | `/api/users/me` | Aktueller Benutzer |
| GET | `/api/politicians/search?q=` | Politiker suchen |
| GET | `/api/politicians/:id/analysis?name=` | KI-Analyse |
| GET | `/api/parties/search?q=` | Parteien suchen |
| GET | `/api/parties/:id/analysis?name=` | KI-Analyse |
| GET | `/api/watchlist` | Beobachtungsliste abrufen |
| POST | `/api/watchlist` | Eintrag hinzufügen |
| DELETE | `/api/watchlist/:id` | Eintrag entfernen |
| POST | `/api/subscriptions/create-checkout` | Stripe Checkout |
| POST | `/api/subscriptions/portal` | Stripe Kundenportal |
| POST | `/api/webhooks/stripe` | Stripe Webhook |
