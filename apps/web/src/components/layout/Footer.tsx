import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600 font-semibold">
            <span className="text-xl">🌍</span>
            <span>WorldPoliticsNews</span>
          </div>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/preise" className="hover:text-gray-900">Plus-Abo</Link>
            <a href="#" className="hover:text-gray-900">Datenschutz</a>
            <a href="#" className="hover:text-gray-900">Impressum</a>
            <a href="#" className="hover:text-gray-900">Kontakt</a>
          </nav>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} WorldPoliticsNews. KI-gestützte Politikanalyse.
          </p>
        </div>
      </div>
    </footer>
  );
}
