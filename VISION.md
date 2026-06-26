# Vision – WorldPoliticsNews

## Kernidee

WorldPoliticsNews automatisiert die Analyse globaler Nachrichtenberichterstattung über Politiker und Parteien. Nutzer erhalten in Sekunden eine KI-gestützte, quellenbasierte Einschätzung zu jeder politischen Person oder Organisation weltweit – ohne selbst stundenlang Artikel lesen zu müssen.

---

## Langfristige Vision

**Die Referenzplattform für evidenzbasierte Medienbewertung politischer Akteure werden.**

Wir stellen uns eine Welt vor, in der jeder Bürger – unabhängig von Zeit, Sprachkenntnissen oder Medienzugang – sofort verstehen kann, wie Medien weltweit über einen Politiker berichten. Nicht als Meinung, sondern als strukturierte, nachvollziehbare Analyse mit Quellenangaben.

---

## Zielgruppe

| Segment | Bedürfnis |
|---------|-----------|
| Informierte Bürger | Schneller Überblick ohne Medienblasen |
| Journalisten & Redaktionen | Recherche-Ausgangspunkt für internationale Politiker |
| Politikwissenschaftler | Medienbild-Vergleiche über Zeit und Länder hinweg |
| Unternehmen & NGOs | Due-Diligence zu politischen Entscheidungsträgern |

---

## Produktprinzipien

1. **Quellenbasiert** – Jede Aussage ist auf konkrete Artikel zurückführbar.
2. **Global** – Kein Politiker ist zu unbekannt, kein Land zu weit entfernt.
3. **Verständlich** – Komplexe Medienanalyse in einer Zahl und einem Absatz.
4. **Zugänglich** – Kostenlos nutzbar; Plus-Abo nur für Komfort, nicht für Grundfunktionen.
5. **Datensparsamkeit** – Nur was für die Analyse nötig ist, wird gespeichert.

---

## Entwicklungsphasen

### Phase 1 – Fundament (heute)
- Politiker- und Parteisuche via Wikidata (global)
- KI-Analyse mit Sentiment-Score und Zusammenfassung
- Beobachtungsliste, Web + Mobile App
- Freemium-Modell (Werbung / Plus-Abo)

### Phase 2 – Wachstum
- Historische Verlaufsgrafiken (Sentiment über Zeit)
- Vergleichsfunktion: zwei Politiker nebeneinander
- Mehrsprachige Ausgabe (DE, EN, FR, ES)
- Push-Benachrichtigungen bei signifikanten Sentiment-Änderungen
- Export (PDF-Report)

### Phase 3 – Skalierung
- API-Zugang für Institutionen und Entwickler
- Institutionelles Abo-Tier (Medien, Think Tanks)
- Automatische tägliche Analysen für Top-100-Politiker
- Einbettbare Widgets für Drittseiten

---

## Erfolgskriterien (12 Monate)

- 10.000 monatlich aktive Nutzer (MAU)
- 500 Plus-Abonnenten
- 2.000+ analysierte Entitäten in der Datenbank
- Analyse-Latenz < 30 Sekunden (P95)
- App-Bewertung ≥ 4,3 Sterne (iOS & Android)

---

## Abgrenzung – Was wir nicht sind

- Kein Faktencheck-Dienst (wir bewerten Medientenor, nicht Wahrheit)
- Kein Nachrichtenportal (wir aggregieren, publizieren keine eigenen Artikel)
- Keine politische Meinung (der Sentiment-Score spiegelt die Medien, nicht uns)
- Kein KI-Propagandawerkzeug (Quellen sind transparent, Methodik ist dokumentiert)

---

## Technische Vision

- **Monorepo** mit geteilten Typen: eine Quelle der Wahrheit für Web und Mobile
- **Zweistufiger Cache** (In-Memory + PostgreSQL): schnelle Antworten ohne API-Overload
- **Modulare KI-Pipeline**: Tavily → Claude → strukturiertes JSON – austauschbar pro Schicht
- **Stripe + RevenueCat**: native Zahlungserfahrung auf jeder Plattform

---

*Zuletzt aktualisiert: Juni 2025*
