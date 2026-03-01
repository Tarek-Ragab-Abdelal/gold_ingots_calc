'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GoldApiService } from '@/lib/goldApi';
import { GoldCalculator } from '@/lib/calculator';
import { LocalizationService } from '@/lib/localization';
import { StorageManager } from '@/lib/storage';
import type {
  GoldProduct,
  CalculationResult,
  Language,
  Theme,
  ToastType,
  HistoryItem,
} from '@/lib/types';
import { CalculationError, ApiError } from '@/lib/types';

// ── toast helper ──────────────────────────────────────────────
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// ── singleton services (created once) ────────────────────────
const storage = new StorageManager();
const calculator = new GoldCalculator();

export default function GoldCalculatorApp() {
  // ── language / theme ──────────────────────────────────────
  const [language, setLanguage]   = useState<Language>('en');
  const [theme,    setTheme]      = useState<Theme>('light');

  // ── gold data ─────────────────────────────────────────────
  const [goldPrices,    setGoldPrices]    = useState<GoldProduct[]>([]);
  const [exchangeRate,  setExchangeRate]  = useState<number | null>(null);
  const [showApiWarning, setShowApiWarning] = useState(false);

  // ── loading ───────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  // ── calculator form ────────────────────────────────────────
  const [calcType,     setCalcType]    = useState<'goldToMoney' | 'moneyToGold'>('goldToMoney');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity,     setQuantity]    = useState('1');
  const [weightPerPiece, setWeightPerPiece] = useState('');
  const [moneyAmount,  setMoneyAmount] = useState('');
  const [preference,   setPreference]  = useState<'pieces' | 'grams'>('pieces');
  const [custom18kFee, setCustom18kFee] = useState('');

  // ── results ───────────────────────────────────────────────
  const [result, setResult] = useState<CalculationResult | null>(null);

  // ── history modal ─────────────────────────────────────────
  const [showHistory, setShowHistory] = useState(false);
  const [history,     setHistory]     = useState<HistoryItem[]>([]);

  // ── toasts ────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  // ── services (created once per language) ──────────────────
  const locRef = useRef(new LocalizationService(language));
  const apiRef = useRef<GoldApiService | null>(null);

  // initialise API service once (client-side only)
  useEffect(() => {
    const cfg = storage.getConfig();
    apiRef.current = new GoldApiService(cfg.apiKeys || {});
  }, []);

  // ── helpers ───────────────────────────────────────────────
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800);
  }, []);

  const loc = locRef.current;

  // ── init ──────────────────────────────────────────────────
  useEffect(() => {
    const cfg = storage.getConfig();
    setLanguage(cfg.language);
    setTheme(cfg.theme);
    locRef.current.setLanguage(cfg.language);
  }, []);

  // apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // apply language
  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    locRef.current.setLanguage(language);
  }, [language]);

  // fetch prices on mount
  useEffect(() => {
    fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => fetchPrices(), 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── fetch prices ──────────────────────────────────────────
  const fetchPrices = useCallback(async (isRefresh = false) => {
    if (!apiRef.current) return;
    setLoadingMsg(isRefresh ? loc.translate('Refreshing data...') : loc.translate('Loading prices...'));
    setLoading(true);
    try {
      const apiResult = await apiRef.current.fetchPricesWithSource();
      setGoldPrices(apiResult.products);
      setShowApiWarning(!apiResult.isAccurate);

      // update exchange rate
      const cached = apiRef.current.getCachedExchangeRate();
      if (cached && !cached.isExpired) {
        setExchangeRate(cached.rate);
      } else {
        const { usdToEgp } = await apiRef.current.getExchangeRates();
        setExchangeRate(usdToEgp);
      }

      showToast(loc.translate('Prices updated successfully'), 'success');
    } catch (err) {
      console.error(err);
      let msg = loc.translate('Error fetching prices');
      if (err instanceof ApiError && err.source === 'all_sources') {
        msg = loc.translate('Failed to fetch from all sources');
      }
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [loc, showToast]);

  // ── toggle theme ──────────────────────────────────────────
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    storage.setTheme(next);
  };

  // ── toggle language ───────────────────────────────────────
  const toggleLanguage = () => {
    const next: Language = language === 'en' ? 'ar' : 'en';
    setLanguage(next);
    storage.setLanguage(next);
    locRef.current.setLanguage(next);
  };

  // ── auto-fee label ────────────────────────────────────────
  const getAutoFeeLabel = (): string => {
    const karat = selectedProduct.includes('18k') ? '18k'
                : selectedProduct.includes('24k') ? '24k'
                : selectedProduct.includes('21k') ? '21k'
                : null;
    if (!karat) return '--';

    const qty = calcType === 'goldToMoney'
      ? parseFloat(quantity) || 1
      : parseFloat(moneyAmount) || 1;

    if (karat === '21k') {
      if (qty >= 8) return '75 EGP/gram';
      if (qty >= 4) return '80 EGP/gram';
      return '85 EGP/gram';
    }
    if (karat === '24k') {
      if (qty >= 100) return '71 EGP/gram';
      if (qty >= 50)  return '77 EGP/gram';
      if (qty >= 31.1)return '79 EGP/gram';
      if (qty >= 20)  return '80 EGP/gram';
      if (qty >= 10)  return '82 EGP/gram';
      if (qty >= 5)   return '85 EGP/gram';
      if (qty >= 2.5) return '110 EGP/gram';
      return '185 EGP/gram';
    }
    if (karat === '18k') {
      const cf = parseFloat(custom18kFee);
      if (cf > 0) return `${cf} EGP/gram`;
      return '2% of value (or enter custom fee below)';
    }
    return '--';
  };

  // ── calculate ─────────────────────────────────────────────
  const handleCalculate = () => {
    if (!selectedProduct) {
      showToast(loc.translate('Please select a product'), 'warning');
      return;
    }
    const karat = selectedProduct.includes('18k') ? '18k' as const
                : selectedProduct.includes('24k') ? '24k' as const
                : '21k' as const;

    const input = {
      productId:   selectedProduct,
      calcType,
      karat,
      rounding:    'none' as const,
      ...(calcType === 'goldToMoney'
        ? {
            quantity:     parseFloat(quantity) || 0,
            weightPerPiece: weightPerPiece ? parseFloat(weightPerPiece) : undefined,
          }
        : {
            moneyAmount:    parseFloat(moneyAmount) || 0,
            preferenceType: preference,
          }),
      ...(karat === '18k' && custom18kFee
        ? { custom18kFeePerGram: parseFloat(custom18kFee) }
        : {}),
    };

    const validation = calculator.validateInput(input as Parameters<typeof calculator.validateInput>[0]);
    if (!validation.valid) {
      showToast(loc.translate(validation.errors[0] ?? 'Validation error'), 'warning');
      return;
    }

    try {
      const res = calculator.calculate(input as Parameters<typeof calculator.calculate>[0], goldPrices);
      setResult(res);
    } catch (err) {
      const msg = err instanceof CalculationError
        ? loc.translate(err.message)
        : 'Calculation failed';
      showToast(msg, 'error');
    }
  };

  // ── save calculation ──────────────────────────────────────
  const handleSave = () => {
    if (!result) { showToast('No calculation to save', 'warning'); return; }
    storage.saveCalculation(result);
    showToast(loc.translate('Calculation saved'), 'success');
  };

  // ── show history ──────────────────────────────────────────
  const handleShowHistory = () => {
    setHistory(storage.getHistory());
    setShowHistory(true);
  };

  // ── copy result ───────────────────────────────────────────
  const handleCopyResult = () => {
    if (!result) return;
    const text = result.type === 'goldToMoney'
      ? `${result.product}: Buy ${loc.formatPrice(result.finalBuyValue)} / Sell ${loc.formatPrice(result.finalSellValue)}`
      : `${result.product}: ${result.buyGramsObtained.toFixed(3)} g for ${loc.formatPrice(result.moneyAmount)}`;
    navigator.clipboard?.writeText(text).then(
      () => showToast(loc.translate('Copied'), 'success'),
      () => showToast('Copy failed', 'error'),
    );
  };

  // ── share app ─────────────────────────────────────────────
  const handleShare = () => {
    const text = 'Check BTC Gold Calculator — quick gold conversions (EGP)';
    if (navigator.share) {
      navigator.share({ title: 'BTC Gold Calculator', text, url: location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${text} — ${location.href}`).then(
        () => showToast(loc.translate('Link copied'), 'success'),
        () => {},
      );
    }
  };

  // ── refresh exchange rate ──────────────────────────────────
  const handleRefreshExchangeRate = async () => {
    if (!apiRef.current) return;
    try {
      setLoading(true);
      const { usdToEgp } = await apiRef.current.refreshExchangeRates();
      setExchangeRate(usdToEgp);
      showToast(loc.translate('Exchange rate updated'), 'success');
    } catch {
      showToast(loc.translate('Failed to update exchange rate'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── render ────────────────────────────────────────────────
  const gold21 = goldPrices.find(p => p.name.toLowerCase().includes('21k'));
  const gold24 = goldPrices.find(p => p.name.toLowerCase().includes('24k'));
  const karat  = selectedProduct.includes('18k') ? '18k'
               : selectedProduct.includes('24k') ? '24k'
               : selectedProduct.includes('21k') ? '21k'
               : null;

  return (
    <div className="container">
      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="title-row">
          <div className="title-left">
            <h1>{language === 'ar' ? 'حاسبة الذهب BTC' : 'BTC Gold Calculator'}</h1>
            <p className="subtitle">
              {language === 'ar' ? 'أسعار الذهب اللحظية — مصر (ج.م)' : 'Real-time gold prices — Egypt (EGP)'}
            </p>
          </div>
          <div className="title-actions">
            <button className="icon-btn" onClick={toggleLanguage} title="Toggle Language" aria-label="Toggle language">
              <i className="fas fa-language" />
            </button>
            <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
            </button>
          </div>
        </div>

        {/* Market Overview */}
        <div className="market-overview compact" aria-label="Live gold prices" aria-live="polite">
          <div className="price-card" id="card21k">
            <div className="card-left">
              <div className="card-title">{language === 'ar' ? 'ذهب ٢١ قيراط' : '21K Gold'}</div>
              <div className="card-sub">{language === 'ar' ? 'ج.م / جرام' : 'EGP / gram'}</div>
            </div>
            <div className="card-right">
              <div className="price-buy">{gold21 ? loc.formatPrice(gold21.ask) : '--'}</div>
              <div className="price-sell">{gold21 ? loc.formatPrice(gold21.bid) : '--'}</div>
            </div>
          </div>
          <div className="price-card" id="card24k">
            <div className="card-left">
              <div className="card-title">{language === 'ar' ? 'ذهب ٢٤ قيراط' : '24K Gold'}</div>
              <div className="card-sub">{language === 'ar' ? 'ج.م / جرام' : 'EGP / gram'}</div>
            </div>
            <div className="card-right">
              <div className="price-buy">{gold24 ? loc.formatPrice(gold24.ask) : '--'}</div>
              <div className="price-sell">{gold24 ? loc.formatPrice(gold24.bid) : '--'}</div>
            </div>
          </div>
        </div>

        {/* API Warning */}
        {showApiWarning && (
          <div className="api-warning" aria-live="assertive">
            <div className="warning-content">
              <i className="fas fa-exclamation-triangle" />
              <span>{loc.translate('Fallback API Warning')}</span>
            </div>
          </div>
        )}

        {/* Exchange Rate */}
        {exchangeRate !== null && (
          <div className="exchange-rate-info" aria-live="polite">
            <div className="rate-content">
              <i className="fas fa-exchange-alt" />
              <span className="rate-text">
                <span>{language === 'ar' ? 'دولار/جنيه:' : 'USD/EGP:'}</span>
                <span className="rate-value">{exchangeRate.toFixed(2)}</span>
              </span>
              <button className="rate-refresh-btn" onClick={handleRefreshExchangeRate} title="Refresh exchange rate" aria-label="Refresh exchange rate">
                <i className="fas fa-sync-alt" />
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Loading */}
        {loading && (
          <div className="loading-overlay show" role="status" aria-label="Loading">
            <div className="spinner" />
            <p>{loadingMsg || (language === 'ar' ? 'جاري تحميل الأسعار…' : 'Loading prices…')}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="action-btn primary" onClick={() => fetchPrices(true)} disabled={loading}>
            <i className="fas fa-sync-alt" />
            <span>{language === 'ar' ? 'تحديث الأسعار' : 'Refresh Prices'}</span>
          </button>
          <button className="action-btn" onClick={handleShowHistory}>
            <i className="fas fa-history" />
            <span>{language === 'ar' ? 'التاريخ' : 'History'}</span>
          </button>
          <button className="action-btn" onClick={handleShare}>
            <i className="fas fa-share-alt" />
            <span>{language === 'ar' ? 'مشاركة' : 'Share'}</span>
          </button>
        </div>

        {/* Calculator Section */}
        <section className="calculator-section" aria-label="Gold calculator">
          <h2>{language === 'ar' ? 'حاسبة مدخرات الذهب' : 'Gold Savings Calculator'}</h2>

          <div className="calculator-grid">
            {/* Product Select */}
            <div className="input-group">
              <label htmlFor="selectedProduct">
                {language === 'ar' ? 'اختر المنتج' : 'Select Product'}
              </label>
              <select
                id="selectedProduct"
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
                aria-label="Select gold product"
              >
                <option value="">{language === 'ar' ? 'اختر منتج…' : 'Choose a product…'}</option>
                {goldPrices.map(p => (
                  <option key={p.id} value={String(p.id)}>
                    {p.formatted_name} — {loc.formatPrice(p.ask)}
                  </option>
                ))}
              </select>
            </div>

            {/* Calculation Type */}
            <div className="calc-type">
              <label>{language === 'ar' ? 'نوع العملية' : 'Calculation Type'}</label>
              <div className="radio-group" role="group" aria-label="Calculation type">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="calcType"
                    value="goldToMoney"
                    checked={calcType === 'goldToMoney'}
                    onChange={() => setCalcType('goldToMoney')}
                  />
                  <span>{language === 'ar' ? 'الذهب إلى نقود' : 'Gold → Money'}</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="calcType"
                    value="moneyToGold"
                    checked={calcType === 'moneyToGold'}
                    onChange={() => setCalcType('moneyToGold')}
                  />
                  <span>{language === 'ar' ? 'النقود إلى ذهب' : 'Money → Gold'}</span>
                </label>
              </div>
            </div>

            {/* Gold to Money inputs */}
            {calcType === 'goldToMoney' && (
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="quantity">
                    {language === 'ar' ? 'الكمية / القطع' : 'Quantity / Pieces'}
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    placeholder="1"
                    inputMode="numeric"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="weightPerPiece">
                    {language === 'ar' ? 'وزن القطعة (جرام)' : 'Weight per piece (g)'}
                  </label>
                  <input
                    type="number"
                    id="weightPerPiece"
                    min="0"
                    step="0.01"
                    value={weightPerPiece}
                    onChange={e => setWeightPerPiece(e.target.value)}
                    placeholder={language === 'ar' ? 'تلقائي للسبائك' : 'Auto for ingots'}
                  />
                </div>
              </div>
            )}

            {/* Money to Gold inputs */}
            {calcType === 'moneyToGold' && (
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="moneyAmount">
                    {language === 'ar' ? 'المبلغ (ج.م)' : 'Money Amount (EGP)'}
                  </label>
                  <input
                    type="number"
                    id="moneyAmount"
                    min="0"
                    step="0.01"
                    value={moneyAmount}
                    onChange={e => setMoneyAmount(e.target.value)}
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="minPieceSize">
                    {language === 'ar' ? 'تفضيل' : 'Preference'}
                  </label>
                  <select
                    id="minPieceSize"
                    value={preference}
                    onChange={e => setPreference(e.target.value as 'pieces' | 'grams')}
                  >
                    <option value="pieces">{language === 'ar' ? 'قطع كاملة (سبائك/عملات)' : 'Whole pieces (ingots / coins)'}</option>
                    <option value="grams">{language === 'ar' ? 'السماح بالجرامات' : 'Allow fractional grams'}</option>
                  </select>
                </div>
              </div>
            )}

            {/* 18K Custom Fee */}
            {karat === '18k' && (
              <div className="input-row" id="custom18kFeeRow">
                <div className="input-group">
                  <label htmlFor="custom18kFee">
                    {language === 'ar' ? 'رسوم ١٨ قيراط المخصصة (ج.م/جرام)' : '18K Custom Fee (EGP/gram)'}
                  </label>
                  <input
                    type="number"
                    id="custom18kFee"
                    min="0"
                    step="0.01"
                    value={custom18kFee}
                    onChange={e => setCustom18kFee(e.target.value)}
                    placeholder="Optional"
                    inputMode="decimal"
                  />
                  <small className="input-note">
                    {language === 'ar' ? 'اختياري — اتركه فارغاً لاستخدام 2% من القيمة' : 'Optional — leave blank to use 2% of value'}
                  </small>
                </div>
              </div>
            )}

            {/* Auto Fee */}
            <div className="input-group">
              <label>{language === 'ar' ? 'رسوم تلقائية' : 'Auto Fee'}</label>
              <div className="fee-display" id="autoFeeDisplay" aria-live="polite">
                <span className="fee-value">{getAutoFeeLabel()}</span>
                <small className="fee-note">
                  {language === 'ar' ? 'محسوب تلقائياً حسب نوع الذهب' : 'Automatically calculated per gold type'}
                </small>
              </div>
            </div>

            {/* Action buttons */}
            <div className="calc-actions">
              <button className="calculate-btn" onClick={handleCalculate}>
                <i className="fas fa-calculator" />
                <span>{language === 'ar' ? 'احسب' : 'Calculate'}</span>
              </button>
              <button className="calculate-btn secondary" onClick={handleSave}>
                <i className="fas fa-bookmark" />
                <span>{language === 'ar' ? 'حفظ' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div id="calculationResults" className="results-section show" aria-live="polite">
              <div className="result-card">
                <h3>{language === 'ar' ? 'نتائج الحساب' : 'Calculation Results'}</h3>
                <div className="result-details">
                  {result.type === 'goldToMoney' ? (
                    <>
                      <div className="result-row"><strong>{loc.translate('Product')}:</strong> {result.product}</div>
                      <div className="result-row"><strong>{loc.translate('Quantity')}:</strong> {loc.formatNumber(result.quantity, 2)} {loc.translate('pieces')}</div>
                      <div className="result-row small">{loc.translate('Weight total')}: {loc.formatNumber(result.totalWeightG, 2)} g</div>
                      <div className="result-section">
                        <h4 className="section-title">{loc.translate('Buy (You pay)')}</h4>
                        <div className="result-row"><strong>{loc.translate('Unit Price')}:</strong> {loc.formatPrice(result.buyPrice)}</div>
                        <div className="result-row"><strong>{loc.translate('Total Value')}:</strong> {loc.formatPrice(result.totalBuyValue)}</div>
                        <div className="result-row"><strong>{loc.translate('Fee')} ({result.feePercent}%):</strong> {loc.formatPrice(result.buyFeeAmount)}</div>
                        <div className="result-row total"><strong>{loc.translate('Final Cost')}:</strong> {loc.formatPrice(result.finalBuyValue)}</div>
                      </div>
                      <div className="result-section">
                        <h4 className="section-title">{loc.translate('Sell (You get)')}</h4>
                        <div className="result-row"><strong>{loc.translate('Unit Price')}:</strong> {loc.formatPrice(result.sellPrice)}</div>
                        <div className="result-row"><strong>{loc.translate('Total Value')}:</strong> {loc.formatPrice(result.totalSellValue)}</div>
                        <div className="result-row"><strong>{loc.translate('Fee')} ({result.feePercent}%):</strong> {loc.formatPrice(result.sellFeeAmount)}</div>
                        <div className="result-row total"><strong>{loc.translate('Final Amount')}:</strong> {loc.formatPrice(result.finalSellValue)}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="result-row"><strong>{loc.translate('Product')}:</strong> {result.product}</div>
                      <div className="result-row"><strong>{loc.translate('Money Amount')}:</strong> {loc.formatPrice(result.moneyAmount)}</div>
                      <div className="result-section">
                        <h4 className="section-title">{loc.translate('Buy (You pay)')}</h4>
                        <div className="result-row"><strong>{loc.translate('Unit Price')}:</strong> {loc.formatPrice(result.buyPrice)}</div>
                        <div className="result-row"><strong>{loc.translate('Fee')} ({result.feePercent}%):</strong> {loc.formatPrice(result.buyFeeAmount)}</div>
                        {result.buyWholePieces > 0 ? (
                          <>
                            <div className="result-row"><strong>{loc.translate('You Can Get')}:</strong> {loc.formatNumber(result.buyWholePieces, 0)} {loc.translate('pieces')}</div>
                            <div className="result-row small">{loc.translate('Weight total')}: {loc.formatNumber(result.buyGramsObtained, 2)} g</div>
                          </>
                        ) : (
                          <div className="result-row"><strong>{loc.translate('You Can Get')}:</strong> {loc.formatNumber(result.buyGramsObtained, 3)} g</div>
                        )}
                        <div className="result-row"><strong>{loc.translate('Remaining Amount')}:</strong> {loc.formatPrice(result.buyRemainder)}</div>
                      </div>
                      <div className="result-section">
                        <h4 className="section-title">{loc.translate('Sell (You get)')}</h4>
                        <div className="result-row"><strong>{loc.translate('Unit Price')}:</strong> {loc.formatPrice(result.sellPrice)}</div>
                        {result.sellWholePieces > 0 ? (
                          <>
                            <div className="result-row"><strong>{loc.translate('Gold Equivalent')}:</strong> {loc.formatNumber(result.sellWholePieces, 0)} {loc.translate('pieces')}</div>
                            <div className="result-row small">{loc.translate('Weight total')}: {loc.formatNumber(result.sellGramsObtained, 2)} g</div>
                          </>
                        ) : (
                          <div className="result-row"><strong>{loc.translate('Gold Equivalent')}:</strong> {loc.formatNumber(result.sellGramsObtained, 3)} g</div>
                        )}
                        <div className="result-row"><strong>{loc.translate('Remaining Amount')}:</strong> {loc.formatPrice(result.sellRemainder)}</div>
                      </div>
                      {result.breakdown && result.breakdown.length > 0 && (
                        <div className="result-section breakdown-section">
                          <h4 className="section-title">{loc.translate('Optimal Purchase')}</h4>
                          <div className="breakdown-table">
                            <table>
                              <thead>
                                <tr>
                                  <th>{loc.translate('Product')}</th>
                                  <th>{loc.translate('Quantity')}</th>
                                  <th>Weight</th>
                                  <th>Fee/g</th>
                                  <th>Cost</th>
                                </tr>
                              </thead>
                              <tbody>
                                {result.breakdown.map((item, i) => (
                                  <tr key={i}>
                                    <td>{item.productName}</td>
                                    <td>{loc.formatNumber(item.quantity, 0)}</td>
                                    <td>{loc.formatNumber(item.weight_grams, 2)}g</td>
                                    <td>{loc.formatPrice(item.fee_per_gram)}</td>
                                    <td>{loc.formatPrice(item.total_cost)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div className="breakdown-summary">
                              <div className="result-row">
                                <strong>Remaining Money:</strong>{' '}
                                {loc.formatPrice(result.breakdown[result.breakdown.length - 1]!.remaining_money)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="result-actions">
                  <button className="action-btn" onClick={handleCopyResult}>
                    <i className="fas fa-copy" />
                    <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="app-footer">
          <h3>{language === 'ar' ? 'ادعم المطور' : 'Support the Developer'}</h3>
          <div className="support-buttons">
            <a href="https://www.buymeacoffee.com/tarekragab" className="support-btn coffee" aria-label="Buy Me A Coffee">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" width={120} alt="Buy Me A Coffee" />
            </a>
            <a href="https://www.ko-fi.com/tarekragab" className="support-btn kofi" aria-label="Ko-fi">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://storage.ko-fi.com/cdn/kofi2.png?v=3" width={120} alt="Ko-fi" />
            </a>
          </div>
          <div className="footer-info">
            <p>{language === 'ar' ? '© 2025 حاسبة الذهب BTC. جميع الحقوق محفوظة.' : '© 2025 BTC Gold Calculator. All rights reserved.'}</p>
            <p className="disclaimer">
              {language === 'ar' ? 'الأسعار للمرجع فقط. يرجى التحقق من المصادر الرسمية.' : 'Prices are for reference only. Verify with official sources.'}
            </p>
          </div>
        </footer>
      </main>

      {/* Toast Notifications */}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
        ))}
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="modal show" role="dialog" aria-modal="true" aria-labelledby="historyModalTitle" onClick={e => { if (e.target === e.currentTarget) setShowHistory(false); }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 id="historyModalTitle">{language === 'ar' ? 'تاريخ العمليات الحسابية' : 'Calculation History'}</h2>
              <button className="modal-close" aria-label="Close" onClick={() => setShowHistory(false)}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="modal-body">
              <div className="history-list">
                {history.length === 0 ? (
                  <p>{loc.translate('No history yet')}</p>
                ) : (
                  history.map(h => (
                    <div key={h.id} className="history-item">
                      <div><strong>{h.product}</strong> — {new Date(h.timestamp).toLocaleString()}</div>
                      {h.type === 'goldToMoney' ? (
                        <>
                          <div>{loc.translate('Quantity')}: {loc.formatNumber(h.quantity ?? 0, 2)} {loc.translate('pieces')}</div>
                          <div>{loc.translate('Final Value')}: {loc.formatPrice(h.finalBuyValue ?? h.totalBuyValue ?? 0)}</div>
                        </>
                      ) : (
                        <>
                          <div>{loc.translate('Money Amount')}: {loc.formatPrice(h.moneyAmount ?? 0)}</div>
                          <div>{loc.translate('You Can Get')}: {h.buyWholePieces ? `${loc.formatNumber(h.buyWholePieces, 0)} ${loc.translate('pieces')}` : `${loc.formatNumber(h.buyGramsObtained ?? 0, 3)} g`}</div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
