'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Entity } from '@wpn/shared-types';

interface Props {
  defaultValue?: string;
  defaultCountry?: string;
  placeholder?: string;
}

export function SearchBar({
  defaultValue = '',
  defaultCountry = '',
  placeholder = 'Politiker oder Partei suchen...',
}: Props) {
  const [query, setQuery] = useState(defaultValue);
  const [country, setCountry] = useState(defaultCountry);
  const [suggestions, setSuggestions] = useState<Entity[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const countryParam = country ? `&country=${encodeURIComponent(country)}` : '';
        const [polRes, partyRes] = await Promise.allSettled([
          fetch(`${BASE}/api/politicians/search?q=${encodeURIComponent(trimmed)}${countryParam}`),
          fetch(`${BASE}/api/parties/search?q=${encodeURIComponent(trimmed)}${countryParam}`),
        ]);

        const politicians =
          polRes.status === 'fulfilled' && polRes.value.ok
            ? ((await polRes.value.json()).data?.entities ?? []).slice(0, 3)
            : [];
        const parties =
          partyRes.status === 'fulfilled' && partyRes.value.ok
            ? ((await partyRes.value.json()).data?.entities ?? []).slice(0, 2)
            : [];

        setSuggestions([...politicians, ...parties]);
        setShowSuggestions(true);
      } catch {
        /* ignore */
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, country, BASE]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setShowSuggestions(false);
    const countryParam = country ? `&country=${encodeURIComponent(country)}` : '';
    startTransition(() => {
      router.push(`/suche?q=${encodeURIComponent(trimmed)}${countryParam}`);
    });
  }

  function handleSuggestionClick(entity: Entity) {
    setShowSuggestions(false);
    const path = entity.type === 'politician' ? 'politiker' : 'partei';
    startTransition(() => {
      router.push(`/${path}/${entity.id}?name=${encodeURIComponent(entity.name)}`);
    });
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-2 w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          minLength={2}
          aria-label="Suche"
          autoComplete="off"
        />
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))}
          placeholder="Land"
          maxLength={2}
          className="w-20 px-3 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-center text-sm"
          title="Optionaler Länderfilter (z.B. DE, US, FR)"
          aria-label="Länderfilter (2-Buchstaben ISO-Code)"
        />
        <button
          type="submit"
          disabled={isPending || query.trim().length < 2}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          {isPending ? '...' : 'Suchen'}
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-20 z-50 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden">
          {suggestions.map((entity) => (
            <li key={entity.id}>
              <button
                type="button"
                onClick={() => handleSuggestionClick(entity)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
              >
                <span className="text-lg">{entity.type === 'politician' ? '👤' : '🏛️'}</span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{entity.name}</p>
                  {entity.description && (
                    <p className="text-xs text-gray-500 truncate">{entity.description}</p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
