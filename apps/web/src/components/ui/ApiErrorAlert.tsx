'use client';

interface Props {
  error: any;
}

const ERROR_MESSAGES: Record<string, string> = {
  'ANALYSIS_QUOTA_EXCEEDED': 'API-Quota überschritten. Bitte in 1 Stunde erneut versuchen.',
  'ANALYSIS_SOURCE_UNAVAILABLE': 'Nachrichtenquellen nicht erreichbar. Später versuchen.',
  'ANALYSIS_AI_ERROR': 'KI-Analyse fehlgeschlagen. Später versuchen.',
  'NETWORK_ERROR': 'Internetverbindung fehlt.',
};

export function ApiErrorAlert({ error }: Props) {
  const message = ERROR_MESSAGES[error?.code] || error?.message || 'Unbekannter Fehler';

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
      <p className="font-semibold mb-1">Fehler</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}
