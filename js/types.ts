// TypeScript interfaces and types for the Gold Calculator App

export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';
export type CalculationType = 'goldToMoney' | 'moneyToGold';
export type PreferenceType = 'pieces' | 'grams';
export type RoundingType = 'none' | '0.01' | '1';
export type ToastType = 'info' | 'success' | 'warning' | 'error';
export type GoldKarat = '18k' | '21k' | '24k';
export type ApiSource = 'btc' | 'metals-api' | 'gold-api' | 'fallback';

// Gold product interface with karat-based structure
export interface GoldProduct {
  id: string;
  name: string;
  formatted_name: string;
  karat: GoldKarat;
  ask: number; // Buy price (what you pay)
  bid: number; // Sell price (what you get)
  weight_grams?: number;
}

// 21k Gold product configurations
export interface Gold21kProduct {
  name: string;
  weight_grams: number;
  fee_per_gram: number;
}

// 24k Gold product configurations
export interface Gold24kProduct {
  weight_grams: number;
  fee_per_gram: number;
}

// API response interfaces
export interface BTCApiResponse {
  success: boolean;
  data: {
    obj: {
      table: GoldProduct[];
      updated_date: string;
      updated_time: string;
    };
  };
}

// API fetch result with source tracking
export interface ApiResult {
  products: GoldProduct[];
  source: ApiSource;
  lastUpdated: { date: string; time: string };
  isAccurate: boolean;
}

// Fallback API interfaces
export interface MetalsApiResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: {
    XAU: number; // Gold price per ounce
    [key: string]: number;
  };
}

export interface GoldApiIOResponse {
  price: number;
  currency: string;
  unit: string;
  timestamp: number;
}

// Calculation result interfaces
export interface GoldToMoneyResult {
  type: 'goldToMoney';
  product: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  totalBuyValue: number;
  totalSellValue: number;
  feePercent: number;
  buyFeeAmount: number;
  sellFeeAmount: number;
  finalBuyValue: number;
  finalSellValue: number;
  totalWeightG: number;
}

export interface MoneyToGoldResult {
  type: 'moneyToGold';
  product: string;
  buyPrice: number;
  sellPrice: number;
  moneyAmount: number;
  feePercent: number;
  buyFeeAmount: number;
  sellFeeAmount: number;
  usableMoneyBuy: number;
  buyWholePieces: number;
  buyGramsObtained: number;
  buyRemainder: number;
  sellWholePieces: number;
  sellGramsObtained: number;
  sellRemainder: number;
  rounding: RoundingType;
  breakdown?: ProductBreakdown[];
}

// Product breakdown for optimal money-to-gold conversion
export interface ProductBreakdown {
  productName: string;
  weight_grams: number;
  quantity: number;
  fee_per_gram: number;
  total_cost: number;
  remaining_money: number;
}

export type CalculationResult = GoldToMoneyResult | MoneyToGoldResult;

// History item interface
export interface HistoryItem {
  id: number;
  timestamp: string;
  type: CalculationType;
  product: string;
  buyPrice: number;
  sellPrice: number;
  feePercent: number;
  // Additional fields based on calculation type
  quantity?: number;
  moneyAmount?: number;
  totalBuyValue?: number;
  totalSellValue?: number;
  finalBuyValue?: number;
  finalSellValue?: number;
  totalWeightG?: number;
  buyWholePieces?: number;
  buyGramsObtained?: number;
  sellWholePieces?: number;
  sellGramsObtained?: number;
}

// Translation interface
export interface Translations {
  [key: string]: string;
}

export interface LocalizationData {
  en: Translations;
  ar: Translations;
}

// App configuration interface
export interface AppConfig {
  language: Language;
  theme: Theme;
  apiKeys?: {
    [key: string]: string;
  };
  preferences: {
    defaultRounding: RoundingType;
    maxHistoryItems: number;
    refreshInterval: number;
  };
}

// API service interface
export interface ApiService {
  fetchPrices(): Promise<GoldProduct[]>;
  getLastUpdated(): { date: string; time: string } | null;
}

// Calculator input interface
export interface CalculatorInput {
  productId: string;
  calcType: CalculationType;
  karat: GoldKarat;
  rounding: RoundingType;
  quantity?: number;
  moneyAmount?: number;
  preferenceType?: PreferenceType;
  weightPerPiece?: number;
  feePercent?: number; // Optional - will be auto-calculated if not provided
}

// Storage service interface
export interface StorageService {
  getHistory(): HistoryItem[];
  saveCalculation(calculation: CalculationResult): void;
  clearHistory(): void;
  getConfig(): AppConfig;
  updateConfig(config: Partial<AppConfig>): void;
}

// UI Manager interface
export interface UIManager {
  applyTheme(theme: Theme): void;
  applyLanguage(language: Language): void;
  showLoading(show: boolean): void;
  showToast(message: string, type?: ToastType): void;
  showModal(modal: HTMLElement): void;
  closeModal(modal: HTMLElement): void;
  updateMarketCards(products: GoldProduct[]): void;
  updateProductSelect(products: GoldProduct[]): void;
  displayResults(result: CalculationResult): void;
}

// Event handlers interface
export interface EventHandlers {
  onThemeToggle: () => void;
  onLanguageToggle: () => void;
  onRefreshPrices: () => void;
  onCalculate: () => void;
  onSaveCalculation: () => void;
  onShowHistory: () => void;
  onShare: () => void;
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public source: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class CalculationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'CalculationError';
  }
}

// Predefined gold product configurations
export const GOLD_PRODUCTS_CONFIG = {
  '21k': [
    { name: 'Gold Pound', weight_grams: 8, fee_per_gram: 60 },
    { name: 'Half Pound', weight_grams: 4, fee_per_gram: 60 },
    { name: 'Quarter Pound', weight_grams: 2, fee_per_gram: 60 }
  ] as Gold21kProduct[],
  '24k': [
    { weight_grams: 1, fee_per_gram: 185 },
    { weight_grams: 2.5, fee_per_gram: 150 },
    { weight_grams: 5, fee_per_gram: 85 },
    { weight_grams: 10, fee_per_gram: 85 },
    { weight_grams: 20, fee_per_gram: 85 },
    { weight_grams: 50, fee_per_gram: 85 },
    { weight_grams: 100, fee_per_gram: 85 }
  ] as Gold24kProduct[]
} as const;