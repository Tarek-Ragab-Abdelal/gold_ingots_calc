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
        title={ar ? 'جلب أحدث أسعار الذهب من المصادر المباشرة' : 'Fetch the latest live gold prices from market sources'}
      >
        <i className="fas fa-sync-alt" />
        <span>{ar ? 'تحديث الأسعار' : 'Refresh Prices'}</span>
      </button>

      <button
        className="action-btn"
        onClick={onShowHistory}
        aria-label="View history"
        title={ar ? 'عرض العمليات الحسابية المحفوظة مسبقاً' : 'View your previously saved calculations'}
      >
        <i className="fas fa-history" />
        <span>{ar ? 'التاريخ' : 'History'}</span>
      </button>

      <button
        className="action-btn"
        onClick={onShare}
        aria-label="Share app"
        title={ar ? 'مشاركة رابط التطبيق مع الآخرين' : 'Share the app link with others'}
      >
        <i className="fas fa-share-alt" />
        <span>{ar ? 'مشاركة' : 'Share'}</span>
      </button>
    </div>
  );
}
