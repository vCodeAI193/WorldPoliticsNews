import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata(
  'Nutzungsbedingungen - WorldPoliticsNews',
  'Lies die Nutzungsbedingungen für WorldPoliticsNews und erfahre, wie die Plattform funktioniert.',
  { url: '/nutzungsbedingungen' }
);

export default function NutzungsbedingungenPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Nutzungsbedingungen</h1>
      <p className="text-gray-500 text-sm mb-8">Stand: Juni 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Leistungsbeschreibung</h2>
        <p className="text-gray-700 leading-relaxed">
          WorldPoliticsNews bietet eine KI-gestützte Plattform zur Analyse der medialen
          Berichterstattung über Politiker und politische Parteien weltweit. Die Analysen
          werden automatisch aus öffentlich zugänglichen Nachrichtenquellen erstellt und
          stellen keine redaktionelle Meinungsäußerung dar.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">2. Kostenloser Tarif</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Zugang zu allen KI-Analysen</li>
          <li>Beobachtungsliste mit maximal 5 Einträgen</li>
          <li>Werbeanzeigen durch Google AdSense</li>
          <li>Analyse-Cache: 60 Minuten</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">3. WorldPoliticsNews Plus</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Werbefreies Erlebnis</li>
          <li>Unbegrenzte Beobachtungsliste</li>
          <li>Schnellere Aktualisierungen (30-Minuten-Cache)</li>
          <li>Monatlich kündbar über das Stripe-Kundenportal</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Haftungsausschluss</h2>
        <p className="text-gray-700 leading-relaxed">
          Die bereitgestellten Analysen basieren auf automatischer KI-Verarbeitung von
          Nachrichteninhalten und können Fehler enthalten. Sie ersetzen keine professionelle
          politische Beratung. Der Betreiber übernimmt keine Haftung für die Richtigkeit,
          Vollständigkeit oder Aktualität der Inhalte.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Nutzerpflichten</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Kein Missbrauch der API durch automatisierte Massenanfragen</li>
          <li>Weitergabe von Zugangsdaten ist untersagt</li>
          <li>Inhalte dürfen nicht für Desinformationszwecke genutzt werden</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">6. Kündigung</h2>
        <p className="text-gray-700 leading-relaxed">
          Sie können Ihr Konto jederzeit in den Kontoeinstellungen löschen. Das Plus-Abonnement
          läuft bis zum Ende des bezahlten Zeitraums weiter und kann über das Stripe-Kundenportal
          verwaltet werden.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">7. Anzuwendendes Recht</h2>
        <p className="text-gray-700 leading-relaxed">
          Es gilt deutsches Recht. Gerichtsstand ist der Sitz des Betreibers.
        </p>
      </section>
    </div>
  );
}
