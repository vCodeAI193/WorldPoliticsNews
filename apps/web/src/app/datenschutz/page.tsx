import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata(
  'Datenschutzerklärung - WorldPoliticsNews',
  'Informationen zum Datenschutz und zur Verarbeitung deiner Daten bei WorldPoliticsNews.',
  { url: '/datenschutz' }
);

export default function DatenschutzPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Datenschutzerklärung</h1>
      <p className="text-gray-500 text-sm mb-8">Stand: Juni 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Verantwortlicher</h2>
        <p className="text-gray-700 leading-relaxed">
          Verantwortlich für die Datenverarbeitung auf dieser Website ist der Betreiber von
          WorldPoliticsNews. Bei Fragen zum Datenschutz wenden Sie sich an:{' '}
          <a href="mailto:datenschutz@worldpoliticsnews.de" className="text-blue-600 hover:underline">
            datenschutz@worldpoliticsnews.de
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">2. Erhobene Daten</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Wir erheben folgende personenbezogene Daten:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li><strong>E-Mail-Adresse:</strong> Bei der Registrierung, zur Kontoführung</li>
          <li><strong>Passwort:</strong> Gespeichert als bcrypt-Hash (niemals im Klartext)</li>
          <li><strong>Beobachtungsliste:</strong> Von Ihnen gewählte Politiker und Parteien</li>
          <li><strong>Zahlungsdaten:</strong> Werden von Stripe verarbeitet; wir speichern nur die Stripe-Kunden-ID</li>
          <li><strong>Server-Logs:</strong> IP-Adresse, Zeitstempel, aufgerufene URLs (7 Tage Aufbewahrung)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">3. Zweck der Datenverarbeitung</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Bereitstellung des Dienstes und Kontoführung (Art. 6 Abs. 1 lit. b DSGVO)</li>
          <li>Abwicklung von Zahlungen (Art. 6 Abs. 1 lit. b DSGVO)</li>
          <li>Sicherheit und Missbrauchsprävention (Art. 6 Abs. 1 lit. f DSGVO)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Drittanbieter</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>
            <strong>Stripe</strong> – Zahlungsabwicklung.{' '}
            <a href="https://stripe.com/de/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Datenschutz Stripe</a>
          </li>
          <li>
            <strong>Google AdSense</strong> – Werbung (nur für Free-Nutzer). Cookies werden gesetzt.{' '}
            <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Datenschutz Google</a>
          </li>
          <li>
            <strong>Wikidata</strong> – Suche nach Politikern/Parteien. Keine persönlichen Daten übermittelt.
          </li>
          <li>
            <strong>Anthropic Claude API</strong> – KI-Analyse der Nachrichtenartikel. Keine Nutzeridentifikatoren werden übermittelt.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Ihre Rechte</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
          Datenübertragbarkeit und Widerspruch. Ihr Konto und alle zugehörigen Daten können Sie
          jederzeit in den Kontoeinstellungen löschen.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Beschwerden können Sie bei der zuständigen Datenschutzaufsichtsbehörde einreichen.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies</h2>
        <p className="text-gray-700 leading-relaxed">
          Wir setzen technisch notwendige Cookies für die Authentifizierung (JSON Web Tokens
          im LocalStorage). Plus-Nutzer ohne Werbung erhalten keine Tracking-Cookies.
          Free-Nutzer erhalten Werbe-Cookies durch Google AdSense.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">7. Kontakt</h2>
        <p className="text-gray-700">
          <a href="mailto:datenschutz@worldpoliticsnews.de" className="text-blue-600 hover:underline">
            datenschutz@worldpoliticsnews.de
          </a>
        </p>
      </section>
    </div>
  );
}
