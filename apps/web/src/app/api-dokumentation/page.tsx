import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata(
  'API Dokumentation - WorldPoliticsNews',
  'Vollständige API-Dokumentation für Entwickler. Alle Endpunkte, Parameter und Authentifizierung.',
  { url: '/api-dokumentation' }
);

export default function ApiDocPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">API Dokumentation</h1>
        <p className="text-gray-600 text-lg">
          Integriere WorldPoliticsNews in deine Anwendung mit unserer REST-API.
        </p>
      </div>

      {/* Authentication */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Authentifizierung</h2>
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <p className="text-gray-700 mb-4">
            Die API verwendet JWT (JSON Web Tokens) für die Authentifizierung. Registriere oder melde dich an, um ein Token zu erhalten.
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`curl -X POST https://api.worldpoliticsnews.com/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"password"}'

// Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": { "id": "...", "email": "..." }
  }
}`}
          </pre>
        </div>
      </section>

      {/* Core Endpoints */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Kern-Endpunkte</h2>

        {/* Search */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Suche – Politiker & Parteien</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <code className="text-blue-900 font-mono text-sm">GET /api/politicians/search?q=query&country=DE</code>
          </div>
          <p className="text-gray-600 mt-3">Suche nach Politikern und Parteien. Unterstützt Länderfilter.</p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm mt-3">
{`// Request
GET /api/politicians/search?q=Scholz&country=DE

// Response
{
  "success": true,
  "data": {
    "entities": [
      {
        "entityId": "Q2853868",
        "name": "Olaf Scholz",
        "type": "person",
        "image": "https://..."
      }
    ],
    "total": 1
  }
}`}
          </pre>
        </div>

        {/* Analysis */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Analyse – Sentiment & Summary</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <code className="text-blue-900 font-mono text-sm">
              GET /api/politicians/:id/analysis?name=Name&country=DE&force=false
            </code>
          </div>
          <p className="text-gray-600 mt-3">
            Rufe KI-Analyse für einen Politiker oder eine Partei ab. Mit `force=true` wird der Cache ignoriert.
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm mt-3">
{`// Request
GET /api/politicians/Q2853868/analysis?name=Olaf%20Scholz&country=DE

// Response
{
  "success": true,
  "data": {
    "entityId": "Q2853868",
    "entityName": "Olaf Scholz",
    "sentiment": 0.15,
    "sentimentLabel": "leicht_positiv",
    "summary": "Scholz wird in der Berichterstattung...",
    "keywords": ["Wirtschaft", "Inflation", "Ukraine"],
    "articles": [
      {
        "title": "Scholz kritisiert...",
        "url": "https://...",
        "source": "spiegel.de",
        "date": "2025-01-15",
        "sentiment": 0.2
      }
    ],
    "generatedAt": "2025-01-15T10:30:00Z",
    "expiresAt": "2025-01-20T10:30:00Z",
    "cached": false
  }
}`}
          </pre>
        </div>

        {/* Rankings */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Rankings – Beste & Schlechteste</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <code className="text-blue-900 font-mono text-sm">
              GET /api/politicians/rankings/:country?limit=20
            </code>
          </div>
          <p className="text-gray-600 mt-3">
            Erhalte Top & Flop Politiker/Parteien eines Landes, sortiert nach Sentiment.
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm mt-3">
{`// Request
GET /api/politicians/rankings/DE?limit=10

// Response
{
  "success": true,
  "data": [
    {
      "entityId": "Q2853868",
      "entityName": "Olaf Scholz",
      "sentiment": 0.45,
      "sentimentLabel": "positiv",
      "generatedAt": "2025-01-15T10:30:00Z"
    }
  ]
}`}
          </pre>
        </div>

        {/* Watchlist */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Beobachtungsliste – Persönliche Verfolgung</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <code className="text-blue-900 font-mono text-sm">
              POST /api/watchlist (mit Authorization Header)
            </code>
          </div>
          <p className="text-gray-600 mt-3">Erfordert Authentifizierung. Füge Politiker/Parteien zu deiner persönlichen Beobachtungsliste hinzu.</p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm mt-3">
{`// Request
POST /api/watchlist
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "entityId": "Q2853868",
  "entityName": "Olaf Scholz",
  "entityType": "politician",
  "entityCountry": "DE"
}

// Response
{
  "success": true,
  "data": { "id": "...", "createdAt": "2025-01-15T10:30:00Z" }
}`}
          </pre>
        </div>

        {/* History */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Sentiment-Verlauf – Trend über Zeit</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <code className="text-blue-900 font-mono text-sm">
              GET /api/politicians/:id/history?days=30
            </code>
          </div>
          <p className="text-gray-600 mt-3">Rufe historische Sentiment-Daten für Trendanalyse ab.</p>
        </div>
      </section>

      {/* Rate Limiting */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Rate Limiting</h2>
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <ul className="space-y-3 text-gray-700">
            <li><strong>Global:</strong> 200 requests pro 15 Minuten</li>
            <li><strong>Auth (Login):</strong> 10 attempts pro 15 Minuten</li>
            <li><strong>Analyse:</strong> 20 requests pro 60 Minuten</li>
            <li><strong>Free User:</strong> Begrenzte Watchlist (max. 5 Einträge)</li>
            <li><strong>Plus User:</strong> Erweiterte Limits, unbegrenzte Watchlist</li>
          </ul>
        </div>
      </section>

      {/* Error Handling */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Fehlerbehandlung</h2>
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// 400 Bad Request
{
  "success": false,
  "error": "Suchbegriff muss 2–200 Zeichen lang sein"
}

// 401 Unauthorized
{
  "success": false,
  "error": "Authentifizierung erforderlich"
}

// 429 Too Many Requests
{
  "success": false,
  "error": "Zu viele Anfragen. Bitte in einer Stunde erneut versuchen.",
  "code": "ANALYSIS_QUOTA_EXCEEDED"
}

// 500 Server Error
{
  "success": false,
  "error": "Analyse konnte nicht erstellt werden. Bitte später versuchen.",
  "code": "ANALYSIS_ERROR"
}`}
          </pre>
        </div>
      </section>

      {/* Swagger UI Link */}
      <section className="mb-12 bg-green-50 rounded-lg p-6 border border-green-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">🔧 Interaktive API-Dokumentation</h2>
        <p className="text-gray-700 mb-4">
          Teste alle Endpunkte direkt mit der Swagger UI:
        </p>
        <a
          href="https://api.worldpoliticsnews.com/api/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Swagger UI öffnen →
        </a>
      </section>

      {/* Support */}
      <section className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">❓ Fragen oder Probleme?</h2>
        <p className="text-gray-700">
          Kontaktiere uns unter{' '}
          <a href="mailto:support@worldpoliticsnews.com" className="text-blue-600 hover:underline">
            support@worldpoliticsnews.com
          </a>{' '}
          oder erstelle ein Issue auf{' '}
          <a href="https://github.com/vcodeai193/worldpoliticsnews" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            GitHub
          </a>
          .
        </p>
      </section>
    </div>
  );
}
