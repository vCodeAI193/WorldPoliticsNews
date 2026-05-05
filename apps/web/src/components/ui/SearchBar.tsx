'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  defaultValue?: string;
  placeholder?: string;
}

export function SearchBar({ defaultValue = '', placeholder = 'Politiker oder Partei suchen...' }: Props) {
  const [query, setQuery] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    startTransition(() => {
      router.push(`/suche?q=${encodeURIComponent(trimmed)}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
        minLength={2}
        aria-label="Suche"
      />
      <button
        type="submit"
        disabled={isPending || query.trim().length < 2}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shadow-sm"
      >
        {isPending ? '...' : 'Suchen'}
      </button>
    </form>
  );
}
