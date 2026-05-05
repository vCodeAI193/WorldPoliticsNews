# 🌍 WorldPoliticsNews

KI-gestützte Plattform zur automatischen Analyse von Kritiken und Bewertungen zu Politikern und Parteien weltweit.

## Features

- **Globale Suche** – Jeder Politiker und jede Partei weltweit via Wikidata
- **KI-Analyse** – Claude AI durchsucht automatisch Nachrichtenquellen und erstellt eine ausgewogene Bewertung mit Sentiment-Score
- **Beobachtungsliste** – Politiker und Parteien im Auge behalten
- **Werbefinanziert + Plus-Abo** – Kostenlos mit Werbung oder werbefrei mit Plus (3,99 €/Monat)
- **Web + iOS + Android** – Next.js Webseite und React Native App

## Tech-Stack

| Schicht | Technologie |
|---|---|
| Backend | Node.js · Express · TypeScript · Prisma |
| Datenbank | PostgreSQL |
| Web | Next.js 15 · Tailwind CSS 4 |
| Mobile | React Native · Expo SDK 52 |
| KI | Claude API (claude-sonnet-4-6) |
| Nachrichtensuche | Tavily Search API |
| Zahlungen | Stripe (Web) · RevenueCat (Mobile) |
| Werbung | Google AdSense (Web) · Google AdMob (Mobile) |

## Schnellstart

```bash
# 1. Repository klonen und Dependencies installieren
git clone https://github.com/vcodeai193/worldpoliticsnews.git
cd worldpoliticsnews
npm install

# 2. Umgebungsvariablen einrichten
cp backend/.env.example backend/.env
cp apps/web/.env.local.example apps/web/.env.local
# → API-Keys eintragen (siehe SETUP.md)

# 3. Datenbank anlegen
createdb worldpoliticsnews
npm run db:migrate

# 4. Entwicklungsserver starten
npm run dev:backend   # API auf Port 3001
npm run dev:web       # Web auf Port 3000
```

Vollständige Anleitung: **[SETUP.md](./SETUP.md)**

## Projektstruktur

```
WorldPoliticsNews/
├── backend/                  # Express API + Prisma ORM
│   ├── src/
│   │   ├── routes/           # API-Endpunkte
│   │   ├── services/         # KI-Analyse, Wikidata, Stripe
│   │   └── middleware/       # Auth, Subscription-Guard
│   └── prisma/schema.prisma  # Datenbankschema
├── apps/
│   ├── web/                  # Next.js 15 Webseite
│   └── mobile/               # Expo React Native App
└── packages/
    └── shared-types/         # Geteilte TypeScript-Interfaces
```

## API

```
GET  /api/health
POST /api/auth/register | /login | /refresh | /logout
GET  /api/politicians/search?q=Friedrich+Merz
GET  /api/politicians/:wikidataId/analysis?name=Friedrich+Merz
GET  /api/parties/search?q=CDU
GET  /api/parties/:wikidataId/analysis?name=CDU
GET  /api/watchlist
POST /api/watchlist
DELETE /api/watchlist/:id
POST /api/subscriptions/create-checkout
POST /api/webhooks/stripe
```

## Analyse-Flow

```
Nutzer wählt Politiker
       ↓
Tavily Search API (3 parallele Abfragen: DE + EN + Typ)
       ↓
Bis zu 12 Artikel (Reuters, BBC, Spiegel, FAZ, Zeit, ...)
       ↓
Claude API → JSON: summary, sentiment (-1..+1), keywords, articleSentiments[]
       ↓
Ergebnis in DB gespeichert (TTL: 60min Free / 30min Plus)
       ↓
Frontend zeigt Sentiment-Gauge + Zusammenfassung + Artikel
```

## Monetarisierung

| | Kostenlos | Plus (3,99 €/Monat) |
|---|---|---|
| Werbung | ✅ Ja | ❌ Nein |
| Beobachtungsliste | Max. 5 Einträge | Unbegrenzt |
| Analyse-Cache | 60 Minuten | 30 Minuten |
| Zahlung Web | — | Stripe Checkout |
| Zahlung App | — | Apple IAP / Google Play (RevenueCat) |

## Lizenz

Copyright © 2025 WorldPoliticsNews. Alle Rechte vorbehalten.  
Siehe [LICENSE](./LICENSE) für Details.
