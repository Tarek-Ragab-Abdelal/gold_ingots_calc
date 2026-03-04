import type { GoldProduct, Language, Theme } from '@/lib/types';
import type { LocalizationService } from '@/lib/localization';
import PriceCards from './PriceCards';

interface Props {
  language: Language;
  theme: Theme;
  goldPrices: GoldProduct[];
  exchangeRate: number | null;
  showApiWarning: boolean;
  isFetchingFresh: boolean;
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
  isFetchingFresh,
  loc,
  onToggleLanguage,
  onToggleTheme,
  onRefreshExchangeRate,
}: Readonly<Props>) {
  const ar = language === 'ar';

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

      {/* Price cards — hidden on desktop (shown in right panel instead) */}
      <div className="header-prices">
        <PriceCards
          language={language}
          goldPrices={goldPrices}
          exchangeRate={exchangeRate}
          showApiWarning={showApiWarning}
          isFetchingFresh={isFetchingFresh}
          loc={loc}
          onRefreshExchangeRate={onRefreshExchangeRate}
        />
      </div>
    </header>
  );
}
