// Enhanced Gold Calculator App - Modular TypeScript Architecture
import { LocalizationService } from './localization.js';
import { GoldApiService } from './goldApi.js';
import { GoldCalculator } from './calculator.js';
import { UIManagerService } from './uiManager.js';
import { StorageManager } from './storage.js';
import { 
  GoldProduct, 
  CalculationResult, 
  CalculatorInput,
  CalculationError,
  ApiError
} from './types.js';

class GoldCalculatorApp {
  private localization: LocalizationService;
  private apiService: GoldApiService;
  private calculator: GoldCalculator;
  private uiManager: UIManagerService;
  private storage: StorageManager;
  
  private goldPrices: GoldProduct[] = [];
  private lastCalculation: CalculationResult | null = null;
  private refreshTimer: number | null = null;

  constructor() {
    // Initialize services
    this.storage = new StorageManager();
    
    // Load saved preferences
    const config = this.storage.getConfig();
    
    // Initialize localization with saved language
    this.localization = new LocalizationService(config.language);
    
    // Initialize API service with any saved API keys
    this.apiService = new GoldApiService(config.apiKeys || {});
    
    // Initialize calculator
    this.calculator = new GoldCalculator();
    
    // Initialize UI manager
    this.uiManager = new UIManagerService(this.localization);
    
    this.init();
  }

  async init(): Promise<void> {
    try {
      // Apply saved theme and language
      const config = this.storage.getConfig();
      this.uiManager.applyTheme(config.theme);
      this.localization.applyToDOM();
      
      // Setup UI components
      this.uiManager.init();
      this.bindEvents();
      
      // Load initial prices
      await this.fetchPrices();
      
      // Setup auto-refresh
      this.setupAutoRefresh(config.preferences.refreshInterval);
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.uiManager.showToast(
        this.localization.translate('Error fetching prices'), 
        'error'
      );
    }
  }

  /**
   * Setup event listeners for the application
   */
  private bindEvents(): void {
    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Language toggle
    document.getElementById('languageToggle')?.addEventListener('click', () => {
      this.toggleLanguage();
    });

    // Price refresh
    document.getElementById('refreshBtn')?.addEventListener('click', () => {
      this.fetchPrices(true);
    });

    // Exchange rate refresh
    document.getElementById('refreshExchangeRate')?.addEventListener('click', () => {
      this.refreshExchangeRate();
    });

    // Calculator actions
    document.getElementById('calculateBtn')?.addEventListener('click', () => {
      this.calculatePrice();
    });

    document.getElementById('saveCalcBtn')?.addEventListener('click', () => {
      this.saveCalculation();
    });

    // History and sharing
    document.getElementById('historyBtn')?.addEventListener('click', () => {
      this.showHistory();
    });

    document.getElementById('shareBtn')?.addEventListener('click', () => {
      this.shareApp();
    });

    document.getElementById('shareResultBtn')?.addEventListener('click', () => {
      this.shareCalculation();
    });

    document.getElementById('copyResultBtn')?.addEventListener('click', () => {
      this.copyResult();
    });

    // Calculation type toggle
    document.querySelectorAll('input[name="calcType"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.uiManager.toggleCalculationType();
        this.updateAutoFeeDisplay();
      });
    });

    // Product selection change - update fee display
    document.getElementById('selectedProduct')?.addEventListener('change', () => {
      this.updateAutoFeeDisplay();
    });

    // Quantity change - update fee display
    document.getElementById('quantity')?.addEventListener('input', () => {
      this.updateAutoFeeDisplay();
    });

    document.getElementById('moneyAmount')?.addEventListener('input', () => {
      this.updateAutoFeeDisplay();
    });

    // Custom 18k fee change - update fee display
    document.getElementById('custom18kFee')?.addEventListener('input', () => {
      this.updateAutoFeeDisplay();
    });
  }

  /**
   * Refresh exchange rate manually
   */
  private async refreshExchangeRate(): Promise<void> {
    try {
      this.uiManager.showLoading(true, this.localization.translate('Fetching latest prices...'));
      
      const { usdToEgp } = await this.apiService.refreshExchangeRates();
      this.uiManager.updateExchangeRateDisplay(usdToEgp, true);
      
      this.uiManager.showToast(
        this.localization.translate('Exchange rate updated'),
        'success'
      );
    } catch (error) {
      console.error('Failed to refresh exchange rate:', error);
      this.uiManager.showToast(
        this.localization.translate('Failed to update exchange rate'),
        'error'
      );
    } finally {
      this.uiManager.showLoading(false);
    }
  }

  /**
   * Update exchange rate display after prices are fetched
   */
  private async updateExchangeRateDisplay(): Promise<void> {
    try {
      // Get cached exchange rate info
      const cachedRate = this.apiService.getCachedExchangeRate();
      if (cachedRate && !cachedRate.isExpired) {
        this.uiManager.updateExchangeRateDisplay(cachedRate.rate, true);
      } else {
        // If no cached rate or expired, fetch new one
        const { usdToEgp } = await this.apiService.getExchangeRates();
        this.uiManager.updateExchangeRateDisplay(usdToEgp, true);
      }
    } catch (error) {
      console.warn('Failed to update exchange rate display:', error);
      this.uiManager.hideExchangeRateDisplay();
    }
  }

  /**
   * Fetch gold prices from API with fallback support and show warnings
   */
  private async fetchPrices(isRefresh: boolean = false): Promise<void> {
    try {
      const loadingMessage = isRefresh 
        ? this.localization.translate('Refreshing data...')
        : this.localization.translate('Loading prices...');
      
      this.uiManager.showLoading(true, loadingMessage);
      
      // Use new API method with source tracking
      const apiResult = await this.apiService.fetchPricesWithSource();
      this.goldPrices = apiResult.products;
      
      // Show fallback warning if not using primary API
      this.showFallbackWarning(apiResult.isAccurate, apiResult.source);
      
      // Update UI with new prices
      this.uiManager.updateMarketCards(this.goldPrices);
      this.uiManager.updateProductSelect(this.goldPrices);
      
      // Update last updated timestamp
      if (apiResult.lastUpdated) {
        this.uiManager.updateLastUpdated(apiResult.lastUpdated.date, apiResult.lastUpdated.time);
      }
      
      this.uiManager.showToast(
        this.localization.translate('Prices updated successfully'),
        'success'
      );

      // Update exchange rate display
      await this.updateExchangeRateDisplay();
      
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      
      let errorMessage = this.localization.translate('Error fetching prices');
      if (error instanceof ApiError) {
        if (error.source === 'all_sources') {
          errorMessage = this.localization.translate('Failed to fetch from all sources');
        }
      }
      
      this.uiManager.showToast(errorMessage, 'error');
    } finally {
      this.uiManager.showLoading(false);
    }
  }

  /**
   * Update the auto fee display based on current selections
   */
  private updateAutoFeeDisplay(): void {
    const inputs = this.uiManager.getCalculationInputs();
    const quantity = inputs.quantity || inputs.moneyAmount || 1;
    this.uiManager.updateAutoFeeDisplay(inputs.karat, quantity);
  }

  /**
   * Show warning when using fallback API sources
   */
  private showFallbackWarning(isAccurate: boolean, source: string): void {
    const warningElement = document.getElementById('apiWarning');
    if (!warningElement) return;

    if (!isAccurate) {
      warningElement.style.display = 'block';
      warningElement.setAttribute('aria-live', 'assertive');
      
      // Update warning text based on source
      const warningText = warningElement.querySelector('span');
      if (warningText) {
        let message = this.localization.translate('Fallback API Warning');
        if (source !== 'btc') {
          message += ` (${source})`;
        }
        warningText.textContent = message;
      }
    } else {
      warningElement.style.display = 'none';
    }
  }

  /**
   * Calculate prices based on user input
   */
  private calculatePrice(): void {
    try {
      // Get input values from UI
      const inputs = this.uiManager.getCalculationInputs();
      
      // Validate inputs
      const validation = this.calculator.validateInput(inputs as CalculatorInput);
      if (!validation.valid) {
        this.uiManager.showToast(validation.errors[0], 'warning');
        return;
      }
      
      // Perform calculation
      const result = this.calculator.calculate(inputs as CalculatorInput, this.goldPrices);
      
      // Display results
      this.uiManager.displayResults(result);
      this.lastCalculation = result;
      
    } catch (error) {
      console.error('Calculation error:', error);
      
      let errorMessage = 'Calculation failed';
      if (error instanceof CalculationError) {
        errorMessage = this.localization.translate(error.message);
      }
      
      this.uiManager.showToast(errorMessage, 'error');
    }
  }

  /**
   * Save current calculation to history
   */
  private saveCalculation(): void {
    if (!this.lastCalculation) {
      this.uiManager.showToast('No calculation to save', 'warning');
      return;
    }
    
    try {
      this.storage.saveCalculation(this.lastCalculation);
      this.uiManager.showToast(
        this.localization.translate('Calculation saved'),
        'success'
      );
    } catch (error) {
      console.error('Failed to save calculation:', error);
      this.uiManager.showToast('Failed to save calculation', 'error');
    }
  }

  /**
   * Show calculation history
   */
  private showHistory(): void {
    try {
      const history = this.storage.getHistory();
      this.uiManager.displayHistory(history);
    } catch (error) {
      console.error('Failed to load history:', error);
      this.uiManager.showToast('Failed to load history', 'error');
    }
  }

  /**
   * Toggle application theme
   */
  private toggleTheme(): void {
    const config = this.storage.getConfig();
    const newTheme = config.theme === 'light' ? 'dark' : 'light';
    
    this.storage.setTheme(newTheme);
    this.uiManager.applyTheme(newTheme);
  }

  /**
   * Toggle application language
   */
  private toggleLanguage(): void {
    const newLanguage = this.localization.toggleLanguage();
    this.storage.setLanguage(newLanguage);
    
    // Update UI elements and market cards
    this.localization.applyToDOM();
    this.uiManager.updateMarketCards(this.goldPrices);
    this.uiManager.updateProductSelect(this.goldPrices);
  }

  /**
   * Share application
   */
  private shareApp(): void {
    const text = 'Check BTC Gold Calculator — quick gold conversions (EGP)';
    
    if (navigator.share) {
      navigator.share({ 
        title: 'BTC Gold Calculator', 
        text, 
        url: location.href 
      }).catch(() => {
        // Fallback to clipboard
        this.copyToClipboard(`${text} — ${location.href}`);
      });
    } else {
      this.copyToClipboard(`${text} — ${location.href}`);
    }
  }

  /**
   * Share current calculation
   */
  private shareCalculation(): void {
    if (!this.lastCalculation) return;
    
    const calc = this.lastCalculation;
    let text = `Gold Calculation — ${calc.product}: `;
    
    if (calc.type === 'goldToMoney') {
      text += this.localization.formatPrice(calc.finalBuyValue);
    } else {
      if (calc.buyWholePieces > 0) {
        text += `${calc.buyWholePieces} ${this.localization.translate('pieces')}`;
      } else {
        text += `${calc.buyGramsObtained.toFixed(3)} g`;
      }
    }
    
    if (navigator.share) {
      navigator.share({ 
        title: 'BTC Gold Calculation', 
        text, 
        url: location.href 
      }).catch(() => {
        this.copyToClipboard(text);
      });
    } else {
      this.copyToClipboard(text);
    }
  }

  /**
   * Copy current result to clipboard
   */
  private copyResult(): void {
    const resultElement = document.querySelector('.result-details');
    if (!resultElement) return;
    
    const text = resultElement.textContent?.trim() || '';
    this.copyToClipboard(text);
  }

  /**
   * Copy text to clipboard with fallback
   */
  private copyToClipboard(text: string): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.uiManager.showToast(
          this.localization.translate('Copied'),
          'success'
        );
      }).catch(() => {
        this.fallbackCopyToClipboard(text);
      });
    } else {
      this.fallbackCopyToClipboard(text);
    }
  }

  /**
   * Fallback clipboard copy method
   */
  private fallbackCopyToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.uiManager.showToast(
        this.localization.translate('Copied'),
        'success'
      );
    } catch (error) {
      this.uiManager.showToast('Copy failed', 'error');
    }
    
    document.body.removeChild(textArea);
  }

  /**
   * Setup auto-refresh timer
   */
  private setupAutoRefresh(intervalMs: number): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    if (intervalMs > 0) {
      this.refreshTimer = window.setInterval(() => {
        this.fetchPrices();
      }, intervalMs);
    }
  }

  /**
   * Cleanup method for app shutdown
   */
  public cleanup(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  (window as any).goldApp = new GoldCalculatorApp();

  // Register service worker if available (improves PWA/mobile)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignore service worker registration errors
    });
  }
});

// Add CSS animation for toasts (maintains same behavior as original)
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes slideOut { 
    from { transform: translateX(0); opacity: 1 } 
    to { transform: translateX(100%); opacity: 0 } 
  }
`;
document.head.appendChild(styleEl);