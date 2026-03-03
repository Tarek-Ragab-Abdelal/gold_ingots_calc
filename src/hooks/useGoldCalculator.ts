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

// ── types ────────────────────────────────────────────────────
export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// ── singleton services (module-level, created once) ───────────
const storage = new StorageManager();
const calculator = new GoldCalculator();

// ── hook ──────────────────────────────────────────────────────
export function useGoldCalculator() {
  // language / theme
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme]       = useState<Theme>('light');

  // gold data
  const [goldPrices,     setGoldPrices]     = useState<GoldProduct[]>([]);
  const [exchangeRate,   setExchangeRate]   = useState<number | null>(null);
  const [showApiWarning, setShowApiWarning] = useState(false);

  // loading
  const [loading,          setLoading]          = useState(false);
  const [loadingMsg,       setLoadingMsg]       = useState('');
  const [isFetchingFresh,  setIsFetchingFresh]  = useState(false);

  // form
  const [calcType,        setCalcType]        = useState<'goldToMoney' | 'moneyToGold'>('goldToMoney');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity,        setQuantity]        = useState('1');
  const [weightPerPiece,  setWeightPerPiece]  = useState('');
  const [moneyAmount,     setMoneyAmount]     = useState('');
  const [preference,      setPreference]      = useState<'pieces' | 'grams'>('pieces');
  const [custom18kFee,    setCustom18kFee]    = useState('');

  // result
  const [result, setResult] = useState<CalculationResult | null>(null);

  // history
  const [showHistory, setShowHistory] = useState(false);
  const [history,     setHistory]     = useState<HistoryItem[]>([]);

  // toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  // services
  const locRef = useRef(new LocalizationService(language));
  const apiRef = useRef<GoldApiService | null>(null);

  const loc = locRef.current;

  // ── helpers ────────────────────────────────────────────────
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800);
  }, []);

  // ── init ──────────────────────────────────────────────────
  useEffect(() => {
    const cfg = storage.getConfig();
    apiRef.current = new GoldApiService(cfg.apiKeys || {});
    setLanguage(cfg.language);
    setTheme(cfg.theme);
    locRef.current.setLanguage(cfg.language);

    // Immediately populate with last-known prices so the UI is usable
    // while fresh prices are being fetched in the background.
    const stored = apiRef.current.getStoredPrices();
    if (stored && stored.products.length > 0) {
      setGoldPrices(stored.products);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    locRef.current.setLanguage(language);
  }, [language]);

  // ── data fetching ─────────────────────────────────────────
  const fetchPrices = useCallback(async (isRefresh = false) => {
    if (!apiRef.current) return;

    // Use the API ref to check for cached data without adding goldPrices to deps
    const hasCached = (apiRef.current.getStoredPrices()?.products.length ?? 0) > 0
                   || apiRef.current.getCachedPrices().length > 0;

    if (hasCached) {
      // Background refresh: don't block the UI with the full-screen overlay
      setIsFetchingFresh(true);
    } else {
      setLoadingMsg(isRefresh ? loc.translate('Refreshing data...') : loc.translate('Loading prices...'));
      setLoading(true);
    }

    try {
      const apiResult = await apiRef.current.fetchPricesWithSource();
      setGoldPrices(apiResult.products);
      setShowApiWarning(!apiResult.isAccurate);

      const cached = apiRef.current.getCachedExchangeRate();
      if (cached && !cached.isExpired) {
        setExchangeRate(cached.rate);
      } else {
        const { usdToEgp } = await apiRef.current.getExchangeRates();
        setExchangeRate(usdToEgp);
      }
      if (isRefresh) showToast(loc.translate('Prices updated successfully'), 'success');
    } catch (err) {
      console.error(err);
      let msg = loc.translate('Error fetching prices');
      if (err instanceof ApiError && err.source === 'all_sources') {
        msg = loc.translate('Failed to fetch from all sources');
      }
      showToast(msg, 'error');
    } finally {
      setLoading(false);
      setIsFetchingFresh(false);
    }
  }, [loc, showToast]);

  useEffect(() => {
    fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => fetchPrices(), 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── handlers ──────────────────────────────────────────────
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    storage.setTheme(next);
  };

  const toggleLanguage = () => {
    const next: Language = language === 'en' ? 'ar' : 'en';
    setLanguage(next);
    storage.setLanguage(next);
    locRef.current.setLanguage(next);
  };

  const refreshExchangeRate = async () => {
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

  const calculate = () => {
    if (!selectedProduct) {
      showToast(loc.translate('Please select a product'), 'warning');
      return;
    }
    const karat = selectedProduct.includes('18k') ? '18k' as const
                : selectedProduct.includes('24k') ? '24k' as const
                : '21k' as const;

    const input = {
      productId: selectedProduct,
      calcType,
      karat,
      rounding: 'none' as const,
      ...(calcType === 'goldToMoney'
        ? { quantity: parseFloat(quantity) || 0,
            weightPerPiece: weightPerPiece ? parseFloat(weightPerPiece) : undefined }
        : { moneyAmount: parseFloat(moneyAmount) || 0,
            preferenceType: preference }),
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
      setResult(calculator.calculate(input as Parameters<typeof calculator.calculate>[0], goldPrices));
    } catch (err) {
      const msg = err instanceof CalculationError ? loc.translate(err.message) : 'Calculation failed';
      showToast(msg, 'error');
    }
  };

  const saveResult = () => {
    if (!result) { showToast('No calculation to save', 'warning'); return; }
    storage.saveCalculation(result);
    showToast(loc.translate('Calculation saved'), 'success');
  };

  const openHistory = () => {
    setHistory(storage.getHistory());
    setShowHistory(true);
  };

  const copyResult = () => {
    if (!result) return;
    const text = result.type === 'goldToMoney'
      ? `${result.product}: Buy ${loc.formatPrice(result.finalBuyValue)} / Sell ${loc.formatPrice(result.finalSellValue)}`
      : `${result.product}: ${result.buyGramsObtained.toFixed(3)} g for ${loc.formatPrice(result.moneyAmount)}`;
    navigator.clipboard?.writeText(text).then(
      () => showToast(loc.translate('Copied'), 'success'),
      () => showToast('Copy failed', 'error'),
    );
  };

  const share = () => {
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

  // ── derived: auto-fee label ────────────────────────────────
  const autoFeeLabel = (): string => {
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
      if (qty >= 100)  return '71 EGP/gram';
      if (qty >= 50)   return '77 EGP/gram';
      if (qty >= 31.1) return '79 EGP/gram';
      if (qty >= 20)   return '80 EGP/gram';
      if (qty >= 10)   return '82 EGP/gram';
      if (qty >= 5)    return '85 EGP/gram';
      if (qty >= 2.5)  return '110 EGP/gram';
      return '185 EGP/gram';
    }
    if (karat === '18k') {
      const cf = parseFloat(custom18kFee);
      return cf > 0 ? `${cf} EGP/gram` : '2% of value (or enter custom fee below)';
    }
    return '--';
  };

  return {
    // ui state
    language, theme, toasts, loading, loadingMsg, isFetchingFresh,
    // Centralised flag: show blocking overlay only when there are no prices at all
    shouldShowFullScreenLoader: loading && goldPrices.length === 0,
    // gold data
    goldPrices, exchangeRate, showApiWarning,
    // form state
    calcType, selectedProduct, quantity, weightPerPiece,
    moneyAmount, preference, custom18kFee, result,
    // history
    showHistory, history,
    // localization
    loc,
    // derived
    autoFeeLabel: autoFeeLabel(),
    // setters (passed directly to components)
    setCalcType, setSelectedProduct, setQuantity,
    setWeightPerPiece, setMoneyAmount, setPreference,
    setCustom18kFee, setShowHistory,
    // actions
    fetchPrices, toggleTheme, toggleLanguage,
    refreshExchangeRate, calculate, saveResult,
    openHistory, copyResult, share,
  };
}
