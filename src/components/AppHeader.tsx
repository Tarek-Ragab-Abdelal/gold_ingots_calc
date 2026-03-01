import type { GoldProduct, Language, Theme } from '@/lib/types';
import type { LocalizationService } from '@/lib/localization';

interface Props {
  language: Language;
  theme: Theme;
  goldPrices: GoldProduct[];
  exchangeRate: number | null;
  showApiWarning: boolean;
  loc: LocalizationService;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  onRefreshExchangeRate: () => void;
}

export default function AppHeader({
  language,
  theme,
  goldPrices,
  exchangeRate,
  showApiWarning,
  loc,
  onToggleLanguage,
  onToggleTheme,
  onRefreshExchangeRate,
}: Readonly<Props>) {
  const ar = language === 'ar';

  const gold21 = goldPrices.find(p => p.name.toLowerCase().includes('21k'));
  const gold24 = goldPrices.find(p => p.name.toLowerCase().includes('24k'));

  return (
    <header className="app-header">
      {/* Title row */}
      <div className="title-row">
        <div className="title-left">
          <h1>{ar ? 'حاسبة الذهب BTC' : 'BTC Gold Calculator'}</h1>
          <p className="subtitle">
            {ar ? 'أسعار الذهب اللحظية — مصر (ج.م)' : 'Real-time gold prices — Egypt (EGP)'}
          </p>
        </div>

        <div className="title-actions">
          <button
            className="icon-btn"
            onClick={onToggleLanguage}
            title="Toggle Language"
            aria-label="Toggle language"
          >
            <i className="fas fa-language" />
          </button>
          <button
            className="icon-btn"
            onClick={onToggleTheme}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
          </button>
        </div>
      </div>

      {/* Price cards */}
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

      {/* API accuracy warning */}
      {showApiWarning && (
        <div className="api-warning" aria-live="assertive">
          <div className="warning-content">
            <i className="fas fa-exclamation-triangle" />
            <span>{loc.translate('Fallback API Warning')}</span>
          </div>
        </div>
      )}

      {/* Exchange rate row */}
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
    </header>
  );
}
