// UI Manager for DOM manipulation, themes, and visual updates
import { 
  Theme, 
  GoldProduct, 
  CalculationResult, 
  ToastType,
  UIManager 
} from './types.js';
import { LocalizationService } from './localization.js';

export class UIManagerService implements UIManager {
  private localization: LocalizationService;

  constructor(localization: LocalizationService) {
    this.localization = localization;
  }

  /**
   * Apply theme to the application
   */
  applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  /**
   * Apply language changes to the UI
   */
  applyLanguage(language: string): void {
    // This is handled by LocalizationService.applyToDOM()
    // Just trigger it here for consistency
    this.localization.applyToDOM();
  }

  /**
   * Show or hide loading indicator with optional custom message
   */
  showLoading(show: boolean, message?: string): void {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
      loader.classList.toggle('show', show);
      
      if (show && message) {
        const loadingText = loader.querySelector('p');
        if (loadingText) {
          loadingText.textContent = message;
        }
      }
    }
    
    // Add visual feedback to refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      const icon = refreshBtn.querySelector('i');
      if (show) {
        refreshBtn.style.opacity = '0.7';
        refreshBtn.style.pointerEvents = 'none';
        if (icon) {
          icon.style.animation = 'spin 1s linear infinite';
        }
      } else {
        refreshBtn.style.opacity = '';
        refreshBtn.style.pointerEvents = '';
        if (icon) {
          icon.style.animation = '';
        }
      }
    }
  }

  /**
   * Show toast notification
   */
  showToast(message: string, type: ToastType = 'info'): void {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = typeof message === 'string' ? message : JSON.stringify(message);
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  /**
   * Show modal dialog
   */
  showModal(modal: HTMLElement): void {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close modal dialog
   */
  closeModal(modal: HTMLElement): void {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  /**
   * Update market overview cards (21K and 24K prices)
   */
  updateMarketCards(products: GoldProduct[]): void {
    const gold21 = products.find(p => 
      p.name && p.name.toLowerCase().includes('21k')
    );
    const gold24 = products.find(p => 
      p.name && (p.name.toLowerCase().includes('24') || p.formatted_name.toLowerCase().includes('24k'))
    );

    const card21 = document.getElementById('card21k');
    const card24 = document.getElementById('card24k');

    if (gold21 && card21) {
      const buyEl = card21.querySelector('.price-buy');
      const sellEl = card21.querySelector('.price-sell');
      if (buyEl && sellEl) {
        buyEl.textContent = this.localization.formatPrice(Number(gold21.ask));
        sellEl.textContent = this.localization.formatPrice(Number(gold21.bid));
      }
    } else if (card21) {
      const buyEl = card21.querySelector('.price-buy');
      const sellEl = card21.querySelector('.price-sell');
      if (buyEl && sellEl) {
        buyEl.textContent = '--';
        sellEl.textContent = '--';
      }
    }

    if (gold24 && card24) {
      const buyEl = card24.querySelector('.price-buy');
      const sellEl = card24.querySelector('.price-sell');
      if (buyEl && sellEl) {
        buyEl.textContent = this.localization.formatPrice(Number(gold24.ask));
        sellEl.textContent = this.localization.formatPrice(Number(gold24.bid));
      }
    } else if (card24) {
      const buyEl = card24.querySelector('.price-buy');
      const sellEl = card24.querySelector('.price-sell');
      if (buyEl && sellEl) {
        buyEl.textContent = '--';
        sellEl.textContent = '--';
      }
    }
  }

  /**
   * Update last updated timestamp
   */
  updateLastUpdated(date: string, time: string): void {
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) {
      lastUpdated.textContent = (date && time) ? `${date} ${time}` : '';
    }
  }

  /**
   * Update product selection dropdown
   */
  updateProductSelect(products: GoldProduct[]): void {
    const select = document.getElementById('selectedProduct') as HTMLSelectElement;
    if (!select) return;

    const currentValue = select.value;
    
    // Keep the first placeholder option
    const firstOption = select.children[0];
    select.innerHTML = '';
    if (firstOption) {
      select.appendChild(firstOption);
    }

    // Add products with pricing information
    for (const product of products) {
      const option = document.createElement('option');
      option.value = String(product.id);
      option.textContent = `${product.formatted_name} — ${this.localization.formatPrice(Number(product.ask))}`;
      
      // Store product data for easy access
      option.dataset.ask = String(product.ask);
      option.dataset.bid = String(product.bid);
      option.dataset.formatted = product.formatted_name;
      option.dataset.weight = String(product.weight_grams || 1);
      
      select.appendChild(option);
    }

    // Restore selection if it still exists
    if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
      select.value = currentValue;
    }
  }

  /**
   * Toggle calculation type visibility
   */
  toggleCalculationType(): void {
    const goldToMoneyInputs = document.getElementById('goldToMoneyInputs');
    const moneyToGoldInputs = document.getElementById('moneyToGoldInputs');
    const selectedType = (document.querySelector('input[name="calcType"]:checked') as HTMLInputElement)?.value;

    if (!goldToMoneyInputs || !moneyToGoldInputs) return;

    if (selectedType === 'goldToMoney') {
      goldToMoneyInputs.style.display = 'grid';
      moneyToGoldInputs.style.display = 'none';
    } else {
      goldToMoneyInputs.style.display = 'none';
      moneyToGoldInputs.style.display = 'grid';
    }
  }

  /**
   * Display calculation results
   */
  displayResults(result: CalculationResult): void {
    const resultDetails = document.querySelector('.result-details');
    if (!resultDetails) return;

    let html = '';

    if (result.type === 'goldToMoney') {
      html = `
        <div class="result-row"><strong>${this.localization.translate('Product')}:</strong> ${result.product}</div>
        <div class="result-row"><strong>${this.localization.translate('Quantity')}:</strong> ${this.localization.formatNumber(result.quantity, 2)} ${this.localization.translate('pieces')}</div>
        <div class="result-row small">${this.localization.translate('Weight total')}: ${this.localization.formatNumber(result.totalWeightG, 2)} g</div>
        
        <div class="result-section">
          <h4 class="section-title">${this.localization.translate('Buy (You pay)')}</h4>
          <div class="result-row"><strong>${this.localization.translate('Unit Price')}:</strong> ${this.localization.formatPrice(result.buyPrice)}</div>
          <div class="result-row"><strong>${this.localization.translate('Total Value')}:</strong> ${this.localization.formatPrice(result.totalBuyValue)}</div>
          <div class="result-row"><strong>${this.localization.translate('Fee')} (${result.feePercent}%):</strong> ${this.localization.formatPrice(result.buyFeeAmount)}</div>
          <div class="result-row total"><strong>${this.localization.translate('Final Cost')}:</strong> ${this.localization.formatPrice(result.finalBuyValue)}</div>
        </div>
        
        <div class="result-section">
          <h4 class="section-title">${this.localization.translate('Sell (You get)')}</h4>
          <div class="result-row"><strong>${this.localization.translate('Unit Price')}:</strong> ${this.localization.formatPrice(result.sellPrice)}</div>
          <div class="result-row"><strong>${this.localization.translate('Total Value')}:</strong> ${this.localization.formatPrice(result.totalSellValue)}</div>
          <div class="result-row"><strong>${this.localization.translate('Fee')} (${result.feePercent}%):</strong> ${this.localization.formatPrice(result.sellFeeAmount)}</div>
          <div class="result-row total"><strong>${this.localization.translate('Final Amount')}:</strong> ${this.localization.formatPrice(result.finalSellValue)}</div>
        </div>
      `;
    } else {
      html = `
        <div class="result-row"><strong>${this.localization.translate('Product')}:</strong> ${result.product}</div>
        <div class="result-row"><strong>${this.localization.translate('Money Amount')}:</strong> ${this.localization.formatPrice(result.moneyAmount)}</div>
        
        <div class="result-section">
          <h4 class="section-title">${this.localization.translate('Buy (You pay)')}</h4>
          <div class="result-row"><strong>${this.localization.translate('Unit Price')}:</strong> ${this.localization.formatPrice(result.buyPrice)}</div>
          <div class="result-row"><strong>${this.localization.translate('Fee')} (${result.feePercent}%):</strong> ${this.localization.formatPrice(result.buyFeeAmount)}</div>
      `;

      if (result.buyWholePieces && result.buyWholePieces > 0) {
        html += `<div class="result-row"><strong>${this.localization.translate('You Can Get')}:</strong> ${this.localization.formatNumber(result.buyWholePieces, 0)} ${this.localization.translate('pieces')}</div>`;
        html += `<div class="result-row small">${this.localization.translate('Weight total')}: ${this.localization.formatNumber(result.buyGramsObtained, 2)} g</div>`;
      } else {
        html += `<div class="result-row"><strong>${this.localization.translate('You Can Get')}:</strong> ${this.localization.formatNumber(result.buyGramsObtained, 3)} g</div>`;
      }

      html += `<div class="result-row"><strong>${this.localization.translate('Remaining Amount')}:</strong> ${this.localization.formatPrice(result.buyRemainder)}</div>
        </div>
        
        <div class="result-section">
          <h4 class="section-title">${this.localization.translate('Sell (You get)')}</h4>
          <div class="result-row"><strong>${this.localization.translate('Unit Price')}:</strong> ${this.localization.formatPrice(result.sellPrice)}</div>
      `;

      if (result.sellWholePieces && result.sellWholePieces > 0) {
        html += `<div class="result-row"><strong>${this.localization.translate('Gold Equivalent')}:</strong> ${this.localization.formatNumber(result.sellWholePieces, 0)} ${this.localization.translate('pieces')}</div>`;
        html += `<div class="result-row small">${this.localization.translate('Weight total')}: ${this.localization.formatNumber(result.sellGramsObtained, 2)} g</div>`;
      } else {
        html += `<div class="result-row"><strong>${this.localization.translate('Gold Equivalent')}:</strong> ${this.localization.formatNumber(result.sellGramsObtained, 3)} g</div>`;
      }

      html += `<div class="result-row"><strong>${this.localization.translate('Remaining Amount')}:</strong> ${this.localization.formatPrice(result.sellRemainder)}</div>
        </div>
      `;
    }

    resultDetails.innerHTML = html;
    
    // Show results section
    const resultsSection = document.getElementById('calculationResults');
    if (resultsSection) {
      resultsSection.classList.add('show');
    }
  }

  /**
   * Clear results display
   */
  clearResults(): void {
    const resultDetails = document.querySelector('.result-details');
    if (resultDetails) {
      resultDetails.innerHTML = '';
    }
    
    const resultsSection = document.getElementById('calculationResults');
    if (resultsSection) {
      resultsSection.classList.remove('show');
    }
  }

  /**
   * Display calculation history in modal
   */
  displayHistory(history: any[]): void {
    const modal = document.getElementById('historyModal');
    const historyList = document.getElementById('historyList');
    if (!modal || !historyList) return;

    if (history.length === 0) {
      historyList.innerHTML = `<p>${this.localization.translate('No history yet')}</p>`;
    } else {
      historyList.innerHTML = history.map(h => {
        const when = new Date(h.timestamp).toLocaleString();
        if (h.type === 'goldToMoney') {
          return `<div class="history-item">
            <div><strong>${h.product}</strong> — ${when}</div>
            <div>${this.localization.translate('Quantity')}: ${this.localization.formatNumber(h.quantity, 2)} ${this.localization.translate('pieces')}</div>
            <div>${this.localization.translate('Final Value')}: ${this.localization.formatPrice(h.finalBuyValue || h.totalBuyValue)}</div>
          </div>`;
        } else {
          return `<div class="history-item">
            <div><strong>${h.product}</strong> — ${when}</div>
            <div>${this.localization.translate('Money Amount')}: ${this.localization.formatPrice(h.moneyAmount)}</div>
            <div>${this.localization.translate('You Can Get')}: ${h.buyWholePieces ? this.localization.formatNumber(h.buyWholePieces, 0) + ' ' + this.localization.translate('pieces') : this.localization.formatNumber(h.buyGramsObtained, 3) + ' g'}</div>
          </div>`;
        }
      }).join('');
    }

    this.showModal(modal);
  }

  /**
   * Update the automatic fee display based on selected product
   */
  updateAutoFeeDisplay(karat: string, quantity: number = 1): void {
    const feeDisplay = document.getElementById('autoFeeDisplay');
    const feeValue = feeDisplay?.querySelector('.fee-value');
    
    if (!feeValue) return;

    let feeText = '--';
    
    if (karat === '21k') {
      feeText = '60 EGP/gram';
    } else if (karat === '24k') {
      if (quantity >= 100) feeText = '85 EGP/gram';
      else if (quantity >= 50) feeText = '85 EGP/gram';
      else if (quantity >= 20) feeText = '85 EGP/gram';
      else if (quantity >= 10) feeText = '85 EGP/gram';
      else if (quantity >= 5) feeText = '85 EGP/gram';
      else if (quantity >= 2.5) feeText = '150 EGP/gram';
      else feeText = '185 EGP/gram';
    } else if (karat === '18k') {
      feeText = '2% of value';
    }
    
    feeValue.textContent = feeText;
  }

  /**
   * Get form values for calculation
   */
  getCalculationInputs(): {
    calcType: string;
    productId: string;
    karat: string;
    rounding: string;
    quantity?: number;
    moneyAmount?: number;
    preferenceType?: string;
    weightPerPiece?: number;
  } {
    const calcType = (document.querySelector('input[name="calcType"]:checked') as HTMLInputElement)?.value || 'goldToMoney';
    const productSelect = document.getElementById('selectedProduct') as HTMLSelectElement;
    const productId = productSelect?.value || '';
    
    // Extract karat from product ID (18k_gold, 21k_gold, 24k_gold)
    let karat = '21k'; // default
    if (productId.includes('18k')) karat = '18k';
    else if (productId.includes('24k')) karat = '24k';
    
    const roundingSelect = document.getElementById('rounding') as HTMLSelectElement;
    const rounding = roundingSelect?.value || 'none';

    const result: any = {
      calcType,
      productId,
      karat,
      rounding
    };

    if (calcType === 'goldToMoney') {
      const quantityInput = document.getElementById('quantity') as HTMLInputElement;
      result.quantity = Number.parseFloat(quantityInput?.value || '0') || 0;
      
      const weightInput = document.getElementById('weightPerPiece') as HTMLInputElement;
      const weightValue = Number.parseFloat(weightInput?.value || '0');
      if (weightValue > 0) {
        result.weightPerPiece = weightValue;
      }
    } else {
      const moneyInput = document.getElementById('moneyAmount') as HTMLInputElement;
      result.moneyAmount = Number.parseFloat(moneyInput?.value || '0') || 0;
      
      const prefSelect = document.getElementById('minPieceSize') as HTMLSelectElement;
      result.preferenceType = prefSelect?.value || 'pieces';
    }

    return result;
  }

  /**
   * Setup event listeners for modal controls
   */
  setupModalEventListeners(): void {
    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = (e.target as HTMLElement).closest('.modal') as HTMLElement;
        if (modal) this.closeModal(modal);
      });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal as HTMLElement);
        }
      });
    });
  }

  /**
   * Add CSS animations for toasts
   */
  addToastStyles(): void {
    if (!document.querySelector('#toast-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'toast-styles';
      styleEl.textContent = `
        @keyframes slideOut { 
          from { transform: translateX(0); opacity: 1 } 
          to { transform: translateX(100%); opacity: 0 } 
        }
      `;
      document.head.appendChild(styleEl);
    }
  }

  /**
   * Update exchange rate display
   */
  updateExchangeRateDisplay(rate: number, isVisible: boolean = true): void {
    const display = document.getElementById('exchangeRateDisplay');
    const rateValue = document.getElementById('exchangeRateValue');
    
    if (display && rateValue) {
      display.style.display = isVisible ? 'block' : 'none';
      rateValue.textContent = rate.toFixed(2);
    }
  }

  /**
   * Hide exchange rate display
   */
  hideExchangeRateDisplay(): void {
    const display = document.getElementById('exchangeRateDisplay');
    if (display) {
      display.style.display = 'none';
    }
  }

  /**
   * Initialize UI manager
   */
  init(): void {
    this.setupModalEventListeners();
    this.addToastStyles();
  }
}