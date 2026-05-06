import type { ArticleSnippet } from '@wpn/shared-types';
import { toSentimentLabel } from '@wpn/shared-types';
import { SentimentBadge } from './SentimentBadge';

interface Props {
  article: ArticleSnippet;
  index: number;
}

export function ArticleCard({ article, index }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
            <span className="text-xs text-blue-600 font-medium truncate">{article.source}</span>
            <span className="text-xs text-gray-400">{article.date}</span>
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-gray-900 hover:text-blue-700 line-clamp-2 block"
          >
            {article.title}
          </a>
          <p className="text-sm text-gray-600 mt-1 line-clamp-3">{article.snippet}</p>
        </div>
        <div className="shrink-0">
          <SentimentBadge label={toSentimentLabel(article.sentiment)} />
        </div>
      </div>
    </div>
  );
}
