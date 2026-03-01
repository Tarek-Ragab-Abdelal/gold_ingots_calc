import type { Language } from '@/lib/types';

interface Props {
  language: Language;
  loading: boolean;
  onRefresh: () => void;
  onShowHistory: () => void;
  onShare: () => void;
}

export default function QuickActions({
  language,
  loading,
  onRefresh,
  onShowHistory,
  onShare,
}: Readonly<Props>) {
  const ar = language === 'ar';

  return (
    <div className="quick-actions">
      <button
        className="action-btn primary"
        onClick={onRefresh}
        disabled={loading}
        aria-label="Refresh gold prices"
      >
        <i className="fas fa-sync-alt" />
        <span>{ar ? 'تحديث الأسعار' : 'Refresh Prices'}</span>
      </button>

      <button className="action-btn" onClick={onShowHistory} aria-label="View history">
        <i className="fas fa-history" />
        <span>{ar ? 'التاريخ' : 'History'}</span>
      </button>

      <button className="action-btn" onClick={onShare} aria-label="Share app">
        <i className="fas fa-share-alt" />
        <span>{ar ? 'مشاركة' : 'Share'}</span>
      </button>
    </div>
  );
}
