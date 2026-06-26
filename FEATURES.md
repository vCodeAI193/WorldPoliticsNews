# Feature-Backlog – WorldPoliticsNews

Dieses Dokument listet geplante Features geordnet nach Phase und Priorität.  
Abgehakte Features sind bereits implementiert. Offene Punkte sind noch offen.

---

## Phase 1 – Fundament (MVP) ✅ Abgeschlossen

- [x] Globale Suche: Politiker & Parteien via Wikidata
- [x] KI-Analyse: Sentiment-Score + Zusammenfassung via Claude API
- [x] Artikel-Quellen in der Analyse anzeigen (Tavily)
- [x] Beobachtungsliste (max. 5 Einträge für Free, unbegrenzt für Plus)
- [x] JWT-Auth: Register / Login / Refresh / Logout
- [x] Passwort ändern (Web + Mobile)
- [x] Account löschen (Web + Mobile)
- [x] Freemium-Modell: Free (mit Werbung) vs. Plus (3,99 €/Monat)
- [x] Stripe Checkout (Web) + RevenueCat (Mobile)
- [x] Trending-Sektion auf der Startseite
- [x] Sentiment-Verlauf: Gauge-Anzeige (-1 bis +1)
- [x] Share-Funktion auf Detailseiten (Mobile)
- [x] Custom 404-, Error- und Loading-Seiten (Web)
- [x] SEO: robots.txt + sitemap.xml (Web)
- [x] Security-Headers (X-Content-Type-Options, Referrer-Policy, …)
- [x] Input-Validierung & Längen-Limits auf allen Endpunkten
- [x] IDOR-Schutz auf der Watchlist (Nutzer können nur eigene Items löschen)
- [x] Timing-Attack-Schutz beim Login (bcrypt Dummy-Hash)
- [x] SPARQL-Injection-Schutz in der Wikidata-Integration
- [x] Sicherheitstests (watchlist.test.ts, users.test.ts)

---

## Phase 2 – Wachstum

### 2a – Analyse-Tiefe

- [ ] **Historischer Sentiment-Verlauf**: Liniendiagramm über Zeit (z. B. letzte 30 Tage)
  - Backend: Analyse-Einträge mit Zeitstempel bereits in DB – nur Abruf-Endpunkt fehlt
  - Web/Mobile: Recharts (Web) / Victory Native (Mobile) als Chart-Library
- [ ] **Vergleichsansicht**: Zwei Politiker/Parteien nebeneinander vergleichen
  - URL-Schema: `/vergleich?a=Q11930&b=Q76`
  - Mobile: eigener Tab oder Share-Sheet-Flow
- [ ] **Themen-Tags / Keywords**: KI gibt bereits `keywords` zurück – diese als klickbare Filter anzeigen
- [ ] **Quellen-Filterung**: Nutzer kann Quellen-Typen ein-/ausblenden (z. B. nur Qualitätspresse)
- [ ] **Analyse auf Knopfdruck erzwingen**: Button „Analyse jetzt aktualisieren" (ignoriert Cache)

### 2b – Personalisierung

- [ ] **Push-Benachrichtigungen (Mobile)**: Signifikante Sentiment-Änderung bei beobachteten Entitäten
  - Expo Notifications + Backend-Worker (Cron-Job alle 6 h)
- [ ] **E-Mail-Benachrichtigungen**: Wöchentliche Zusammenfassung für Beobachtungsliste
  - Benötigt: SMTP-Integration (z. B. Resend oder SendGrid)
- [ ] **E-Mail-Verifizierung bei Registrierung**
  - Benötigt: SMTP + Verifikationstoken in DB
- [ ] **Passwort-Reset per E-Mail** (Forgot-Password-Flow)
  - Benötigt: SMTP + Reset-Token (zeitlich begrenzt, 1 h)
- [ ] **Profilbild / Avatar**: Gravatar-Fallback oder Upload via S3

### 2c – Internationalisierung

- [ ] **Mehrsprachige UI**: Deutsch (Standard), Englisch, Französisch, Spanisch
  - Web: `next-intl`; Mobile: `i18n-js` oder `expo-localization`
- [ ] **Sprachauswahl in der Analyse**: Nutzer kann Sprache der Zusammenfassung wählen
  - AI-Prompt anpassen, Sprach-Parameter an `/analysis`-Endpunkt übergeben
- [ ] **Lokale Datumsformatierung** (bereits vorbereitet durch `Intl.DateTimeFormat`)

### 2d – Content-Entdeckung

- [ ] **Autovervollständigung in der Suche**: Debounced Wikidata-Vorschläge im Suchfeld
  - Web: Dropdown unter Suchfeld; Mobile: FlatList über Tastatur
- [ ] **Ähnliche Politiker / Parteien**: KI-Vorschläge basierend auf Partei/Land
- [ ] **Länder-Filter**: Suche auf ein Land einschränken (Wikidata `country`-Property)
- [ ] **Top-Listen**: „Top 10 meistgesuchte Politiker diese Woche" (aus Trending-Daten)

---

## Phase 3 – Skalierung

### 3a – API & Plattform

- [ ] **Öffentliche REST-API**: Entwickler können Analyse-Daten per API-Key abrufen
  - Rate-Limiting per API-Key; Developer-Dashboard zur Key-Verwaltung
- [ ] **Institutionelles Abo-Tier**: Höhere Rate-Limits, CSV-Export, SLA
- [ ] **Webhook-Abonnements**: Externe Systeme erhalten Callbacks bei neuen Analysen
- [ ] **GraphQL-Endpunkt** (optional): Für komplexere Abfragen durch API-Kunden

### 3b – Automatisierung

- [ ] **Tägliche Auto-Analysen**: Cron-Job analysiert täglich Top-200-Politiker automatisch
  - Benötigt: Hintergrund-Worker (z. B. BullMQ oder pg-boss)
- [ ] **Sentiment-Alerts für API-Kunden**: Webhook-Trigger bei Schwellwert-Überschreitung
- [ ] **Batch-Import**: Admins können Listen von Entitäten per CSV hochladen

### 3c – Einbettung & Reichweite

- [ ] **Embeddable Widget**: `<iframe>`-fähige Sentiment-Gauge für Drittseiten
  - Endpunkt: `GET /api/embed/:wikidataId`; eigenes CSS-Minimal-Bundle
- [ ] **Open-Graph-Vorschaubilder**: Dynamisch generierte OG-Images pro Politician/Partei
  - `@vercel/og` oder `satori` + Next.js Route Handler
- [ ] **RSS-Feed**: Neue Analysen als RSS abrufbar (`/feed.xml`)

### 3d – Qualität & Trust

- [ ] **Quellen-Bewertung**: Nutzer können Quellenartikel mit Daumen hoch/runter bewerten
- [ ] **Transparenz-Seite**: Methodikdokumentation (wie funktioniert der Score?)
- [ ] **Moderation-Dashboard**: Admin-UI zum Sperren/Freigeben von Entitäten
- [ ] **Audit-Log**: Alle Analysen protokolliert mit Modell-Version, Datum, Quellen-URLs

---

## Technische Schulden & Infrastruktur

- [ ] **End-to-End-Tests (Playwright)**: Kritische User-Journeys: Suche → Analyse → Watchlist
- [ ] **CI/CD-Pipeline**: GitHub Actions für `npm test` + Lint auf jedem PR
- [ ] **Docker Compose**: Lokale Entwicklung ohne manuelle PostgreSQL-Installation
- [ ] **Datenbankmigrationen versionieren**: Sicherstellen, dass `prisma migrate deploy` im Deploy-Prozess läuft
- [ ] **Rate-Limiting auf Auth-Endpunkten**: Brute-Force-Schutz auf `/api/auth/login` (z. B. `express-rate-limit`)
- [ ] **HTTP Security Headers ausbauen**: Content-Security-Policy (CSP) mit Nonce für Inline-Scripts
- [ ] **Structured Logging**: JSON-Logs mit Pino statt `console.log`
- [ ] **Health-Check ausbauen**: `/api/health` soll DB-Ping + Cache-Status zurückgeben
- [ ] **RevenueCat-Webhook-Endpunkt** im Backend: Abo-Status automatisch synchronisieren
- [ ] **Abhängigkeiten aktuell halten**: Dependabot oder Renovate Bot einrichten

---

## Verworfene Ideen (mit Begründung)

| Idee | Warum nicht |
|------|-------------|
| Echtzeit-Newsstream | Zu teuer (Dauerpoll); RSS-Feed in Phase 3 als Alternative |
| Nutzer-Kommentare | Moderationsaufwand übersteigt MVP-Scope |
| Eigene KI-Modelle trainieren | Claude API ist qualitativ überlegen; kein ROI |
| Dark-Mode | Nice-to-have – Tailwind-Unterstützung vorhanden, aber kein User-Request bisher |
| Soziale Funktionen (Folgen, Feed) | Widerspricht dem Fokus auf Analyse statt Community |

---

*Zuletzt aktualisiert: Juni 2025*
