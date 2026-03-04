'use client';

import { useGoldCalculator } from '@/hooks/useGoldCalculator';
import AppHeader from './AppHeader';
import QuickActions from './QuickActions';
import CalculatorSection from './CalculatorSection';
import ResultCard from './ResultCard';
import PriceCards from './PriceCards';
import HistoryModal from './HistoryModal';
import AppFooter from './AppFooter';

export default function GoldCalculatorApp() {
  const s = useGoldCalculator();

  return (
    <div className="app-layout">
      {/* ── Header / desktop navbar ── */}
      <AppHeader
        language={s.language}
        theme={s.theme}
        goldPrices={s.goldPrices}
        exchangeRate={s.exchangeRate}
        showApiWarning={s.showApiWarning}
        isFetchingFresh={s.isFetchingFresh}
        loc={s.loc}
        onToggleLanguage={s.toggleLanguage}
        onToggleTheme={s.toggleTheme}
        onRefreshExchangeRate={s.refreshExchangeRate}
      />

      {/* ── Main content ── */}
      <div className="container">
        <main>
          {/* Full-screen loading only when there are no cached prices to show */}
          {s.shouldShowFullScreenLoader && (
            <div className="loading-overlay show" role="status" aria-label="Loading">
              <div className="spinner" />
              <p>
                {s.loadingMsg ||
                  (s.language === 'ar' ? 'جاري تحميل الأسعار…' : 'Loading prices…')}
              </p>
            </div>
          )}

          {/* Desktop-only price banner (hidden on mobile via CSS) */}
          <div className="desktop-prices">
            <PriceCards
              language={s.language}
              goldPrices={s.goldPrices}
              exchangeRate={s.exchangeRate}
              showApiWarning={s.showApiWarning}
              isFetchingFresh={s.isFetchingFresh}
              loc={s.loc}
              onRefreshExchangeRate={s.refreshExchangeRate}
            />
          </div>

          <QuickActions
            language={s.language}
            loading={s.loading}
            onRefresh={() => s.fetchPrices(true)}
            onShowHistory={s.openHistory}
            onShare={s.share}
          />

          <CalculatorSection
            language={s.language}
            goldPrices={s.goldPrices}
            loc={s.loc}
            calcType={s.calcType}
            selectedProduct={s.selectedProduct}
            quantity={s.quantity}
            weightPerPiece={s.weightPerPiece}
            moneyAmount={s.moneyAmount}
            preference={s.preference}
            custom18kFee={s.custom18kFee}
            autoFeeLabel={s.autoFeeLabel}
            onCalcTypeChange={s.setCalcType}
            onSelectedProductChange={s.setSelectedProduct}
            onQuantityChange={s.setQuantity}
            onWeightPerPieceChange={s.setWeightPerPiece}
            onMoneyAmountChange={s.setMoneyAmount}
            onPreferenceChange={s.setPreference}
            onCustom18kFeeChange={s.setCustom18kFee}
            onCalculate={s.calculate}
            onSave={s.saveResult}
          />

          {s.result && (
            <ResultCard
              result={s.result}
              language={s.language}
              loc={s.loc}
              onCopy={s.copyResult}
            />
          )}

          <AppFooter language={s.language} />
        </main>
      </div>

      {/* ── Toast notifications ── */}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {s.toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
        ))}
      </div>

      {/* ── History modal ── */}
      <HistoryModal
        show={s.showHistory}
        history={s.history}
        language={s.language}
        loc={s.loc}
        onClose={() => s.setShowHistory(false)}
      />
    </div>
  );
}
