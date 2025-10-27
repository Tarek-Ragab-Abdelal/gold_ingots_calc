// Storage service for localStorage operations and history management
import { 
  HistoryItem, 
  CalculationResult, 
  AppConfig, 
  StorageService, 
  Language, 
  Theme,
  RoundingType 
} from './types.js';

export class StorageManager implements StorageService {
  private readonly maxHistoryItems: number;
  private readonly storageKeys = {
    history: 'calculationHistory',
    language: 'language',
    theme: 'theme',
    config: 'goldCalculatorConfig'
  };

  constructor(maxHistoryItems: number = 50) {
    this.maxHistoryItems = maxHistoryItems;
  }

  /**
   * Get calculation history from localStorage
   */
  getHistory(): HistoryItem[] {
    try {
      const historyJson = localStorage.getItem(this.storageKeys.history);
      if (!historyJson) return [];

      const history = JSON.parse(historyJson) as HistoryItem[];
      
      // Validate and clean history items
      return history
        .filter(item => this.isValidHistoryItem(item))
        .slice(0, this.maxHistoryItems)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
    } catch (error) {
      console.warn('Failed to load calculation history:', error);
      return [];
    }
  }

  /**
   * Save calculation to history
   */
  saveCalculation(calculation: CalculationResult): void {
    try {
      const currentHistory = this.getHistory();
      
      const historyItem: HistoryItem = {
        ...this.convertCalculationToHistoryItem(calculation),
        id: Date.now(),
        timestamp: new Date().toISOString()
      };

      // Add to beginning of array and limit size
      const updatedHistory = [historyItem, ...currentHistory]
        .slice(0, this.maxHistoryItems);

      localStorage.setItem(
        this.storageKeys.history, 
        JSON.stringify(updatedHistory)
      );
      
    } catch (error) {
      console.error('Failed to save calculation:', error);
    }
  }

  /**
   * Clear calculation history
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(this.storageKeys.history);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }

  /**
   * Get application configuration
   */
  getConfig(): AppConfig {
    try {
      const configJson = localStorage.getItem(this.storageKeys.config);
      let config: Partial<AppConfig> = {};
      
      if (configJson) {
        config = JSON.parse(configJson);
      }

      // Merge with defaults
      return {
        language: this.getLanguage(),
        theme: this.getTheme(),
        apiKeys: config.apiKeys || {},
        preferences: {
          defaultRounding: (config.preferences?.defaultRounding as RoundingType) || 'none',
          maxHistoryItems: config.preferences?.maxHistoryItems || this.maxHistoryItems,
          refreshInterval: config.preferences?.refreshInterval || 300000 // 5 minutes
        }
      };
      
    } catch (error) {
      console.warn('Failed to load config:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Update application configuration
   */
  updateConfig(config: Partial<AppConfig>): void {
    try {
      const currentConfig = this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };

      // Save individual items for backward compatibility
      if (config.language) {
        this.setLanguage(config.language);
      }
      if (config.theme) {
        this.setTheme(config.theme);
      }

      localStorage.setItem(
        this.storageKeys.config, 
        JSON.stringify(updatedConfig)
      );
      
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  }

  /**
   * Get user language preference
   */
  getLanguage(): Language {
    try {
      const saved = localStorage.getItem(this.storageKeys.language) as Language;
      if (saved === 'en' || saved === 'ar') {
        return saved;
      }
      
      // Detect from browser locale
      const browserLang = navigator.language.toLowerCase();
      return browserLang.startsWith('ar') ? 'ar' : 'en';
      
    } catch {
      return 'en';
    }
  }

  /**
   * Set user language preference
   */
  setLanguage(language: Language): void {
    try {
      localStorage.setItem(this.storageKeys.language, language);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  }

  /**
   * Get user theme preference
   */
  getTheme(): Theme {
    try {
      const saved = localStorage.getItem(this.storageKeys.theme) as Theme;
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
      
      // Detect from system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      
    } catch {
      return 'light';
    }
  }

  /**
   * Set user theme preference
   */
  setTheme(theme: Theme): void {
    try {
      localStorage.setItem(this.storageKeys.theme, theme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  /**
   * Store API keys securely (basic local storage)
   */
  setApiKey(service: string, key: string): void {
    try {
      const config = this.getConfig();
      if (!config.apiKeys) {
        config.apiKeys = {};
      }
      config.apiKeys[service] = key;
      this.updateConfig(config);
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  }

  /**
   * Get API key for a service
   */
  getApiKey(service: string): string | undefined {
    try {
      const config = this.getConfig();
      return config.apiKeys?.[service];
    } catch {
      return undefined;
    }
  }

  /**
   * Export data for backup/migration
   */
  exportData(): { history: HistoryItem[]; config: AppConfig } {
    return {
      history: this.getHistory(),
      config: this.getConfig()
    };
  }

  /**
   * Import data from backup
   */
  importData(data: { history?: HistoryItem[]; config?: Partial<AppConfig> }): { success: boolean; error?: string } {
    try {
      if (data.history && Array.isArray(data.history)) {
        // Validate history items
        const validHistory = data.history
          .filter(item => this.isValidHistoryItem(item))
          .slice(0, this.maxHistoryItems);
          
        localStorage.setItem(
          this.storageKeys.history, 
          JSON.stringify(validHistory)
        );
      }

      if (data.config) {
        this.updateConfig(data.config);
      }

      return { success: true };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Import failed'
      };
    }
  }

  /**
   * Clear all stored data
   */
  clearAll(): void {
    try {
      const keysToRemove = Object.values(this.storageKeys);
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      let used = 0;
      
      // Calculate approximate usage for our keys
      for (const key of Object.values(this.storageKeys)) {
        const item = localStorage.getItem(key);
        if (item) {
          used += item.length * 2; // Rough estimate: 2 bytes per character
        }
      }

      // Estimate total localStorage capacity (usually ~5-10MB)
      const estimated_capacity = 5 * 1024 * 1024; // 5MB
      
      return {
        used,
        available: estimated_capacity - used,
        percentage: (used / estimated_capacity) * 100
      };
      
    } catch {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Remove old history items based on age
   */
  cleanupOldHistory(maxAgeInDays: number = 30): number {
    try {
      const history = this.getHistory();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);

      const filteredHistory = history.filter(item => 
        new Date(item.timestamp) > cutoffDate
      );

      if (filteredHistory.length !== history.length) {
        localStorage.setItem(
          this.storageKeys.history, 
          JSON.stringify(filteredHistory)
        );
        return history.length - filteredHistory.length; // Number of removed items
      }

      return 0;
      
    } catch (error) {
      console.error('Failed to cleanup old history:', error);
      return 0;
    }
  }

  /**
   * Convert CalculationResult to HistoryItem format
   */
  private convertCalculationToHistoryItem(calculation: CalculationResult): Omit<HistoryItem, 'id' | 'timestamp'> {
    const base = {
      type: calculation.type,
      product: calculation.product,
      buyPrice: calculation.buyPrice,
      sellPrice: calculation.sellPrice,
      feePercent: calculation.feePercent
    };

    if (calculation.type === 'goldToMoney') {
      return {
        ...base,
        quantity: calculation.quantity,
        totalBuyValue: calculation.totalBuyValue,
        totalSellValue: calculation.totalSellValue,
        finalBuyValue: calculation.finalBuyValue,
        finalSellValue: calculation.finalSellValue,
        totalWeightG: calculation.totalWeightG
      };
    } else {
      return {
        ...base,
        moneyAmount: calculation.moneyAmount,
        buyWholePieces: calculation.buyWholePieces,
        buyGramsObtained: calculation.buyGramsObtained,
        sellWholePieces: calculation.sellWholePieces,
        sellGramsObtained: calculation.sellGramsObtained
      };
    }
  }

  /**
   * Validate history item structure
   */
  private isValidHistoryItem(item: any): item is HistoryItem {
    return item &&
      typeof item.id === 'number' &&
      typeof item.timestamp === 'string' &&
      (item.type === 'goldToMoney' || item.type === 'moneyToGold') &&
      typeof item.product === 'string' &&
      typeof item.buyPrice === 'number' &&
      typeof item.sellPrice === 'number' &&
      typeof item.feePercent === 'number';
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): AppConfig {
    return {
      language: 'en',
      theme: 'light',
      apiKeys: {},
      preferences: {
        defaultRounding: 'none',
        maxHistoryItems: this.maxHistoryItems,
        refreshInterval: 300000
      }
    };
  }
}