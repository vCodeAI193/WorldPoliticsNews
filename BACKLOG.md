# Feature Backlog – WorldPoliticsNews

Dieses Dokument listet alle zukünftigen Features geordnet nach Phase und Priorität.  
Abgehakte Features sind bereits implementiert. Offene Punkte sind noch offen.

---

## ✅ Abgeschlossene Phasen

### Phase 1 – Fundament (MVP) ✅ Abgeschlossen
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

### Phase 2 – Wachstum ✅ Abgeschlossen
- [x] Historischer Sentiment-Verlauf: Liniendiagramm über Zeit
- [x] Themen-Tags / Keywords: KI gibt bereits `keywords` zurück
- [x] Analyse auf Knopfdruck erzwingen: Button „Analyse jetzt aktualisieren"
- [x] Autovervollständigung in der Suche: Debounced Wikidata-Vorschläge
- [x] Länder-Filter: Suche auf ein Land einschränken
- [x] Deutschland-Rankings: Top 10 & Bottom 10 Politiker/Parteien
- [x] Vergleichsansicht: Zwei Politiker/Parteien nebeneinander
- [x] Methodologie-Seite: Transparenz über Algorithmus & Datenquellen
- [x] Dark Mode: Light/Dark Theme Toggle
- [x] Search History: Letzte 10 Suchen speichern
- [x] Recently Viewed: Zuletzt angesehene Entitäten
- [x] Keyboard Shortcuts: "/" und Cmd+K für Suchfokus
- [x] Comparison List: Max. 4 Entitäten für schnelle Vergleiche
- [x] E-Mail-Verifizierung bei Registrierung
- [x] Passwort-Reset per E-Mail
- [x] Benachrichtigungen: Neue Analysen & Sentiment-Änderungen
- [x] Newsletter-Abonnement: Wöchentliche/tägliche Zusammenfassungen
- [x] Vergleichs-Historie: Gespeicherte Vergleiche abrufen

### Phase 3 – Professionalisierung ✅ Abgeschlossen
- [x] SEO Meta Tags: Open Graph, Twitter Cards, Structured Data
- [x] Admin Panel: Moderation Dashboard & Content Management
- [x] API Dokumentation: OpenAPI 3.0 + Swagger UI
- [x] Error Tracking: Sentry Integration für Production
- [x] Security Headers: X-Content-Type-Options, CSP, etc.
- [x] Rate Limiting: Global, Auth, Analysis Limits
- [x] Input Validierung: Längen-Limits auf allen Endpunkten
- [x] IDOR-Schutz: Nutzer können nur eigene Items verwalten
- [x] Timing-Attack-Schutz: bcrypt Dummy-Hash beim Login

---

## 📋 Offene Features – Zukünftige Phasen

### Phase 4 – Skalierung (Backend Infrastructure)

#### 4a – Automatisierung & Background Jobs
- [ ] **Tägliche Auto-Analysen**: Cron-Job analysiert täglich Top-200-Politiker
  - Technologie: BullMQ oder pg-boss für Task Queue
  - Trigger: Nachts um 02:00 UTC
  - Cache invalidation nach Update
  
- [ ] **Sentiment-Alerts für Plus-User**: Webhook bei Schwellwert-Überschreitung (>0.3 oder <-0.3)
  - E-Mail + Push-Notification
  - Konfigurierbar pro Watchlist-Eintrag
  
- [ ] **Newsletter-Sender**: Cron-Job für wöchentliche/tägliche Digests
  - HTML-Template mit Top-Sentiment-Änderungen
  - Unsubscribe-Link + Preference Center

#### 4b – Öffentliche REST-API
- [ ] **API-Keys**: Developer Dashboard zur Key-Verwaltung
  - Rate-Limiting pro API-Key (z.B. 1000 req/tag für free tier)
  - Usage Analytics
  
- [ ] **Öffentliche Endpunkte**:
  - `GET /api/v1/public/entities/search` - Öffentliche Suche
  - `GET /api/v1/public/entities/:id/analysis` - Öffentliche Analyse (gekürzt)
  - `GET /api/v1/public/rankings/:country` - Öffentliche Rankings
  
- [ ] **Institutionelles Abo-Tier**: Höhere Rate-Limits, CSV-Export, SLA

#### 4c – Erweiterte Datenquellen
- [ ] **Multiple KI-Modelle**: Claude, GPT-4, Mixtral als Fallback
  - Model-Abstraction Layer
  - Kosten-Optimierung
  
- [ ] **Zusätzliche News-Quellen**: RSS-Feeds, Reddit, Twitter/X
  - Sentiment-Extraktion aus Social Media
  
- [ ] **Faktenchecking Integration**: CrossRef API für akademische Quellen
  - Zitationshäufigkeit als Vertrauensmetrik

---

### Phase 5 – Personalisierung & Engagement

#### 5a – Nutzer-Features
- [ ] **Profilbilder**: Gravatar-Integration oder S3-Upload
  - Avatar-Generierung mit initials
  
- [ ] **Personalisierte Homepage**: 
  - „Deine Watchlist" auf Startseite
  - Sentiment-Alerts für beobachtete Entitäten
  - Empfohlene neue Entitäten basierend auf History
  
- [ ] **Erweiterte Nutzer-Einstellungen**:
  - Lieblings-Länder (shortcut auf Rankings)
  - Notification Preferences (Email, Push, In-App)
  - Datenexport (GDPR: Alle Analysen als JSON/CSV)

#### 5b – Soziale Features (Opt-in)
- [ ] **Öffentliche Profile** (optional):
  - Geteilte Watchlist
  - Lieblings-Vergleiche
  - "Dieser Person folgen"
  
- [ ] **Nutzer-Kommentare** (mit Moderation):
  - Kommentare auf Analysen
  - Upvote/Downvote
  - Moderations-Flag für Admin
  
- [ ] **Expert-Mode**: Badge für häufige Nutzer
  - "Expert" Badge nach 50+ Analysen
  - Zusätzliche Statistiken & Insights

#### 5c – Lern- & Erklärmaterial
- [ ] **In-App Tutorials**: Onboarding-Flow für neue Nutzer
  - "Wie funktioniert der Sentiment-Score?"
  - "Warum ist Watchlist wichtig?"
  
- [ ] **Glossar**: Explain-Popup für Fachbegriffe
  - Hover-Tooltips für "Sentiment", "Tavily", etc.
  
- [ ] **Video-Guides**: YouTube-Integration oder ähnlich
  - "Einführung in WorldPoliticsNews"
  - "So interpretierst du Rankings"

---

### Phase 6 – Internationalisierung (i18n)

#### 6a – Mehrsprachige UI
- [ ] **Sprachen**: Deutsch (Standard), Englisch, Französisch, Spanisch
  - Web: `next-intl` mit URL-basiertem Routing (/de/, /en/, /fr/, /es/)
  - Mobile: `expo-localization` + `i18n-js`
  
- [ ] **Sprachauswahl in der Analyse**: 
  - Claude-Prompt anpassen für andere Sprachen
  - Nutzer kann Sprache pro Analyse überschreiben
  
- [ ] **Lokale Datumsformatierung**: 
  - Bereits vorbereitet mit `Intl.DateTimeFormat`
  - Nur noch pro Sprache konfigurieren

#### 6b – Lokalisierte Inhalte
- [ ] **Länder-spezifische Rankings**: Nicht nur Deutschland
  - Frankreich, Spanien, Großbritannien, USA, etc.
  - Lokale Newsquellen per Land
  
- [ ] **Nutzer-Sprache in Analyses**:
  - Französische Analyst bekommen Analyse auf Französisch
  - Tavily-Suche mit lokalen Newsquellen
  
- [ ] **RTL-Sprachen** (z.B. Arabisch, Hebräisch):
  - Tailwind RTL-Support
  - Mirror-Layouts

---

### Phase 7 – Plattform-Erweiterung & Einbettung

#### 7a – Embeddable Widget
- [ ] **Sentiment-Gauge Widget**:
  - `<iframe>` für externe Websites
  - Endpunkt: `GET /api/embed/politicians/:id`
  - Minimales CSS-Bundle (~10KB gzipped)
  - Konfigurierbare Farben/Größe
  
- [ ] **Ranking-Widget**: Top-5-Tabelle für Websiten

#### 7b – Open-Graph Previews
- [ ] **Dynamisch generierte OG-Images**:
  - `@vercel/og` oder `satori`
  - Zeigt Entity-Name + Sentiment-Score + Datum
  - Personalisiert pro Analisi für Social Sharing

#### 7c – Feed-Formate
- [ ] **RSS-Feed**: Neue Analysen abrufbar unter `/feed.xml`
  - Kategorie pro Länder-Region
  - Per-Entity RSS (z.B. `/feed/politicians/Q123.xml`)
  
- [ ] **GraphQL Endpoint** (optional): Für komplexere Abfragen
  - Alt zu REST-API
  - Nutzer können Custom-Queries schreiben

---

### Phase 8 – Qualität & Trust

#### 8a – Quellen-Bewertung
- [ ] **Nutzer-Bewertungen auf Artikeln**:
  - Daumen hoch/runter pro Artikel in Analyse
  - Speichern im Backend (`ArticleRating` Modell)
  
- [ ] **Quellen-Scoring**:
  - Automatische Gewichtung basierend auf Nutzer-Feedback
  - Niedrig-bewertete Quellen in Zukunft deprioritisieren

#### 8b – Transparenz & Audit
- [ ] **Audit-Log**: Alle Analysen protokollieren
  - Model-Version (Claude-Sonnet-4-6)
  - Datum der Analyse
  - Quellen-URLs (für Reproduktion)
  - Nutzer-Feedbacks
  
- [ ] **Versioniertes Sentiment**: History zeigt auch, welche Claude-Version verwendet wurde
  - Ermöglicht Versionsvergleiche
  
- [ ] **Methodologie-Update-Log**: Wenn Algorithmus sich ändert
  - Was hat sich geändert?
  - Warum?
  - Welche Analysen sind invalidiert?

#### 8c – Content-Moderation
- [ ] **Moderation-Dashboard** (Admin):
  - Flag-System für problematische Analysen
  - Manual Review Queue
  - Publish/Reject/Edit Workflow
  
- [ ] **Auto-Moderation**: Flagge verdächtige Patterns
  - Outlier-Sentiment (z.B. -0.99, +0.99)
  - Wiederholte Analysen mit extrem unterschiedlichen Scores
  
- [ ] **User-Reporting**: "Diese Analyse ist falsch" Button
  - Sammelt Reports im Backend
  - Admin kann eingreifen

---

### Phase 9 – Performance & Observability

#### 9a – Analytics
- [ ] **Google Analytics 4 Integration**:
  - Track: Top searches, analyzed entities, feature usage
  - Funnel: Search → Analysis → Watchlist
  
- [ ] **Custom Dashboards**:
  - Admin-Dashboard mit Echtzeit-Metriken
  - User Growth, Retention, Churn
  - Most-Analyzed Entities

#### 9b – Performance-Optimierung
- [ ] **CDN für Static Assets**: CloudFlare oder Fastly
  - Global cache für OG-Images, CSS, JS
  
- [ ] **Database Query Optimization**:
  - Identify Slow Queries (query logs)
  - Add Indexes where needed
  - Connection pooling (PgBouncer)
  
- [ ] **Redis Caching Layer**: Für häufig abgerufene Rankings
  - Cache expiry: 6 Stunden
  - Cache warming: Pre-populate on update

#### 9c – Monitoring & Alerting
- [ ] **Uptime Monitoring**: UptimeRobot oder ähnlich
  - Health checks alle 5 Minuten
  - Slack alerts bei Downtime
  
- [ ] **Performance Monitoring**:
  - Page load times, API response times
  - CloudWatch oder Datadog
  
- [ ] **Automated Incident Response**:
  - Auto-rollback bei failed deployments
  - PagerDuty für On-Call Rotation

---

### Phase 10 – Community & Growth

#### 10a – Gamification (Optional)
- [ ] **Achievement Badges**:
  - "Sentinel" - 100+ entities analyzed
  - "Trend Spotter" - Correct sentiment prediction
  - "Civic Defender" - Flagged misinformation
  
- [ ] **Leaderboards** (Opt-in):
  - Most Active Analysts
  - Best Sentiment Predictions
  - Top Watchlist Curators

#### 10b – Nutzer-Generierte Inhalte
- [ ] **Curated Collections**:
  - "My Political Watchlist" – shareable
  - "2025 Election Tracker"
  - "Scandals & Controversies" – community collection
  
- [ ] **Analysis Templates**: 
  - User kann „Report-Template" erstellen
  - z.B. "Quarterly Political Sentiment Report"

#### 10c – Marketing & Partnerships
- [ ] **Email Marketing**: Brevo/Mailchimp Integration
  - Nurture campaigns für Free → Plus conversion
  - Feature announcements
  
- [ ] **Affiliate Program**: Earn commission bei Referrals
  - Plus-Subscription Affiliate Links
  - Tracking via Stripe
  
- [ ] **Press Kit**: News outlets können data/quotes verwenden
  - RSS feed of notable analyses
  - API access for journalists

---

### Phase 11 – Enterprise Features (B2B)

#### 11a – Institutional Tiers
- [ ] **Enterprise Plan**:
  - Unlimited API calls
  - Custom integrations
  - Dedicated support channel
  - White-label Option
  
- [ ] **Educational License**: Für Universitäten
  - Free access für Forschung
  - Data export without limits
  - Academic API docs

#### 11b – Custom Integrations
- [ ] **Zapier/Make Integration**: 
  - Trigger: New analysis, Sentiment change
  - Action: Send to Slack, create Jira issue, update CRM
  
- [ ] **Webhooks for Customers**:
  - Custom callbacks bei neuen Analysen
  - Batch export (Nightly JSON dump)

#### 11c – Data Export & Analysis
- [ ] **Advanced Exports**:
  - CSV, JSON, Excel formats
  - Custom date ranges
  - Filter by country, sentiment range
  
- [ ] **Embedded Analytics**:
  - Timeline charts exportierbar
  - Sentiment data in customer dashboards

---

## 🔧 Technische Schulden & Infrastruktur

### High Priority
- [ ] **End-to-End Tests (Playwright)**: Kritische User-Journeys
  - Search → Analysis → Watchlist → Comparison
  - Auth flows (register, login, reset password)
  
- [ ] **Load Testing**: Simulate 10k concurrent users
  - k6 or Apache JMeter
  - Identify bottlenecks (DB, API, Cache)
  
- [ ] **Database Migration Strategy**:
  - Sicherstellen, dass `prisma migrate deploy` vor jedem Deploy läuft
  - Zero-downtime migrations für große Tables
  
- [ ] **Security Audit**: Professional penetration test
  - SQL injection, XSS, CSRF vulnerabilities
  - Dependency scanning (Snyk)

### Medium Priority
- [ ] **Dependency Updates**: Renovate Bot setup
  - Auto-update minor/patch versions
  - Weekly digest PRs
  
- [ ] **Logging Aggregation**: ELK Stack oder CloudWatch
  - Centralized logging from all services
  - Searchable log interface
  
- [ ] **Database Backups**: Automated daily backups
  - Test restore process monthly
  - Geo-replicated backup copy
  
- [ ] **Documentation**: Architecture decision records (ADRs)
  - Why we chose Tavily over other sources
  - Why Prisma instead of TypeORM

### Low Priority
- [ ] **Refactoring**: Code cleanup
  - Extract shared validation logic
  - Consolidate error handling
  
- [ ] **Legacy Code Migration**: Upgrade to latest frameworks
  - Next.js 16 if released
  - Prisma 6 when stable

---

## 🎯 Priorisierungs-Matrix

| Feature | Business Impact | Technische Komplexität | Priorität |
|---------|-----------------|-------------------------|-----------|
| Auto-Analysen (Cron) | 🔴 Hoch | 🟡 Mittel | **🔥 P0** |
| Sentiment-Alerts | 🔴 Hoch | 🟢 Niedrig | **🔥 P0** |
| Newsletter-Sender | 🟡 Mittel | 🟢 Niedrig | **⭐ P1** |
| Public API | 🔴 Hoch | 🔴 Hoch | **⭐ P1** |
| i18n (Englisch) | 🟡 Mittel | 🟡 Mittel | **⭐ P1** |
| E2E Tests | 🔴 Hoch | 🟡 Mittel | **⭐ P1** |
| Admin Moderation | 🔴 Hoch | 🟢 Niedrig | **⭐ P1** |
| Embeddable Widget | 🟡 Mittel | 🔴 Hoch | **💡 P2** |
| Gamification | 🟡 Mittel | 🟡 Mittel | **💡 P2** |
| Social Features | 🟢 Niedrig | 🔴 Hoch | **💡 P2** |

---

## 📅 Vorgeschlagenes Roadmap (12 Monate)

| Quartal | Phase | Fokus |
|---------|-------|-------|
| **Q1 2026** | Phase 4a | Auto-Analysen + Newsletter + Sentiment-Alerts |
| **Q2 2026** | Phase 4b + 5a | Public API + User Profiles + Personalisierung |
| **Q3 2026** | Phase 6 | i18n + Multiple Länder + English Support |
| **Q4 2026** | Phase 7 + 8 | Embeddable Widget + Content Moderation + Trust |
| **2027** | Phase 9-11 | Performance + Enterprise Features + Growth |

---

## 🔄 Prozess

1. **Planning**: Feature aus Backlog wählen → Acceptance Criteria definieren
2. **Development**: Auf Branch `feature/XXX` entwickeln → Tests schreiben
3. **Review**: Code Review + Security Check
4. **Testing**: Manual + Automated E2E Tests
5. **Deployment**: Merge → Deploy → Monitor
6. **Release Notes**: Dokumentieren & kommunizieren

---

*Zuletzt aktualisiert: Juni 2026*
