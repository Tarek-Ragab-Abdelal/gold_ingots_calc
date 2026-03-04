import type { GoldProduct, Language } from '@/lib/types';
import type { LocalizationService } from '@/lib/localization';

interface Props {
  language: Language;
  goldPrices: GoldProduct[];
  exchangeRate: number | null;
  showApiWarning: boolean;
  isFetchingFresh: boolean;
  loc: LocalizationService;
  onRefreshExchangeRate: () => void;
}

export default function PriceCards({
  language,
  goldPrices,
  exchangeRate,
  showApiWarning,
  isFetchingFresh,
  loc,
  onRefreshExchangeRate,
}: Readonly<Props>) {
  const ar = language === 'ar';

  const gold21 = goldPrices.find(p => p.name.toLowerCase().includes('21k'));
  const gold24 = goldPrices.find(p => p.name.toLowerCase().includes('24k'));

  return (
    <>
      <div className="market-overview compact" aria-label="Live gold prices" aria-live="polite">
        <div className="price-card" id="card21k">
          <div className="card-left">
            <div className="card-title">{ar ? 'ذهب ٢١ قيراط' : '21K Gold'}</div>
            <div className="card-sub">{ar ? 'ج.م / جرام' : 'EGP / gram'}</div>
          </div>
          <div className="card-right">
            <div className="price-buy">{gold21 ? loc.formatPrice(gold21.ask) : '--'}</div>
            <div className="price-sell">
              {ar ? 'بيع: ' : 'Sell: '}
              {gold21 ? loc.formatPrice(gold21.bid) : '--'}
            </div>
          </div>
        </div>

        <div className="price-card" id="card24k">
          <div className="card-left">
            <div className="card-title">{ar ? 'ذهب ٢٤ قيراط' : '24K Gold'}</div>
            <div className="card-sub">{ar ? 'ج.م / جرام' : 'EGP / gram'}</div>
          </div>
          <div className="card-right">
            <div className="price-buy">{gold24 ? loc.formatPrice(gold24.ask) : '--'}</div>
            <div className="price-sell">
              {ar ? 'بيع: ' : 'Sell: '}
              {gold24 ? loc.formatPrice(gold24.bid) : '--'}
            </div>
          </div>
        </div>
      </div>

      {isFetchingFresh && (
        <div className="prices-refreshing" aria-live="polite">
          <i className="fas fa-sync-alt fa-spin" aria-hidden="true" />
          <span>{ar ? 'جاري تحديث الأسعار…' : 'Updating prices…'}</span>
        </div>
      )}

      {showApiWarning && (
        <div className="api-warning" aria-live="assertive">
          <div className="warning-content">
            <i className="fas fa-exclamation-triangle" />
            <span>{loc.translate('Fallback API Warning')}</span>
          </div>
        </div>
      )}

      {exchangeRate !== null && (
        <div className="exchange-rate-info" aria-live="polite">
          <div className="rate-content">
            <i className="fas fa-exchange-alt" />
            <span className="rate-text">
              <span>{ar ? 'دولار/جنيه:' : 'USD/EGP:'}</span>
              <span className="rate-value">{exchangeRate.toFixed(2)}</span>
            </span>
            <button
              className="rate-refresh-btn"
              onClick={onRefreshExchangeRate}
              title="Refresh exchange rate"
              aria-label="Refresh exchange rate"
            >
              <i className="fas fa-sync-alt" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
