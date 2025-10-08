// Enhanced Gold Calculator App - Refactored for mobile and richer calc features
class GoldCalculatorApp {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'en';
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.goldPrices = [];
    this.calculationHistory = JSON.parse(localStorage.getItem('calculationHistory') || '[]');

    this.translations = {
      en: {
        "5 Gram Ingot": "5 Gram Ingot",
        "10 Gram Ingot": "10 Gram Ingot",
        "20 Gram Ingot": "20 Gram Ingot",
        "Gold Ounce": "Gold Ounce",
        "50 Gram Ingot": "50 Gram Ingot",
        "100 Gram Ingot": "100 Gram Ingot",
        "Gold Pound": "Gold Pound",
        "21K Gold": "21K Gold",
        "24K/ Gold": "24K Gold",
        "Loading prices...": "Loading prices...",
        "Prices updated successfully": "Prices updated successfully",
        "Error fetching prices": "Error fetching prices",
        "Calculation saved": "Calculation saved",
        "Please select a product": "Please select a product",
        "Please enter a valid quantity": "Please enter a valid quantity",
        "Please enter a valid amount": "Please enter a valid amount",
        "pieces": "pieces",
        "Product": "Product",
        "Quantity": "Quantity",
        "Unit Price": "Unit Price",
        "Total Value": "Total Value",
        "Money Amount": "Money Amount",
        "You Can Get": "You Can Get",
        "Remaining Amount": "Remaining Amount",
        "Gold to Money": "Gold to Money",
        "Money to Gold": "Money to Gold",
        "Buy (You pay)": "Buy (You pay)",
        "Sell (You get)": "Sell (You get)",
        "Weight total": "Weight total",
        "Fee": "Fee",
        "Final Cost": "Final Cost",
        "Final Amount": "Final Amount",
        "Gold Equivalent": "Gold Equivalent",
        "No history yet": "No history yet",
        "Final Value": "Final Value",
        "Link copied": "Link copied",
        "Calculation copied": "Calculation copied",
        "Copied": "Copied"
      },
      ar: {
        "5 Gram Ingot": "سبيكة ٥ جرام",
        "10 Gram Ingot": "سبيكة ١٠ جرام",
        "20 Gram Ingot": "سبيكة ٢٠ جرام",
        "Gold Ounce": "أونصة الذهب",
        "50 Gram Ingot": "سبيكة ٥٠ جرام",
        "100 Gram Ingot": "سبيكة ١٠٠ جرام",
        "Gold Pound": "الجنيه الذهب",
        "21K Gold": "ذهب عيار ٢١",
        "24K/ Gold": "ذهب عيار ٢٤",
        "Loading prices...": "جاري تحميل الأسعار...",
        "Prices updated successfully": "تم تحديث الأسعار بنجاح",
        "Error fetching prices": "خطأ في تحميل الأسعار",
        "Calculation saved": "تم حفظ العملية الحسابية",
        "Please select a product": "يرجى اختيار منتج",
        "Please enter a valid quantity": "يرجى إدخال كمية صحيحة",
        "Please enter a valid amount": "يرجى إدخال مبلغ صحيح",
        "pieces": "قطعة",
        "Product": "المنتج",
        "Quantity": "الكمية",
        "Unit Price": "سعر الوحدة",
        "Total Value": "القيمة الإجمالية",
        "Money Amount": "المبلغ المالي",
        "You Can Get": "يمكنك الحصول على",
        "Remaining Amount": "المبلغ المتبقي",
        "Gold to Money": "الذهب إلى نقود",
        "Money to Gold": "النقود إلى ذهب",
        "Buy (You pay)": "سعر الشراء (أنت تدفع)",
        "Sell (You get)": "سعر البيع (تحصل عليه)",
        "Weight total": "إجمالي الوزن",
        "Fee": "رسوم",
        "Final Cost": "التكلفة النهائية",
        "Final Amount": "المبلغ النهائي",
        "Gold Equivalent": "المعادل الذهبي",
        "No history yet": "لا توجد عمليات بعد",
        "Final Value": "القيمة النهائية",
        "Link copied": "تم نسخ الرابط",
        "Calculation copied": "تم نسخ الحساب",
        "Copied": "تم النسخ"
      }
    };

    this.init();
  }

  init() {
    this.applyTheme();
    this.applyLanguage();
    this.bindEvents();
    this.fetchPrices();
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
      themeIcon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  applyLanguage() {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('lang', this.currentLanguage);
    htmlElement.setAttribute('dir', this.currentLanguage === 'ar' ? 'rtl' : 'ltr');

    // Update all translatable elements
    document.querySelectorAll('[data-en]').forEach(element => {
      const en = element.getAttribute('data-en');
      const ar = element.getAttribute('data-ar');
      if (this.currentLanguage === 'ar' && ar) element.textContent = ar;
      else if (en) element.textContent = en;
    });

    // Update placeholders for known elements
    const placeholders = [
      {id:'quantity', en:'Enter quantity', ar:'أدخل الكمية'},
      {id:'moneyAmount', en:'Enter amount', ar:'أدخل المبلغ'},
      {id:'feePercent', en:'0.00', ar:'0.00'}
    ];
    placeholders.forEach(p => {
      const el = document.getElementById(p.id);
      if (!el) return;
      el.placeholder = this.currentLanguage === 'ar' ? p.ar : p.en;
    });

    // number formatter
    this.numberFormatter = new Intl.NumberFormat(this.currentLanguage === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
    });
  }

  translate(key) {
    return (this.translations[this.currentLanguage] && this.translations[this.currentLanguage][key]) || key;
  }

  // Utility to parse grams from product name:
  parseProductWeight(product) {
    const name = (product.formatted_name || '').toLowerCase();
    // e.g. "5 Gram Ingot"
    const gramMatch = name.match(/^(\d+(?:\.\d+)?)\s*gram/);
    if (gramMatch) return parseFloat(gramMatch[1]);
    if (name.includes('pound')) return 8; // Egyptian gold pound ~ 8 g
    if (name.includes('ounce') || name.includes('oz')) return 31.1034768;
    // default: 1 (for per-gram products like 21K/24K)
    return 1;
  }

  // Event binding
  bindEvents() {
    document.getElementById('themeToggle')?.addEventListener('click', () => {
      this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', this.currentTheme);
      this.applyTheme();
    });

    document.getElementById('languageToggle')?.addEventListener('click', () => {
      this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
      localStorage.setItem('language', this.currentLanguage);
      this.applyLanguage();
      this.renderMarketCards();
      this.updateSelectOptions();
    });

    document.getElementById('refreshBtn')?.addEventListener('click', () => this.fetchPrices());
    document.getElementById('calculateBtn')?.addEventListener('click', () => this.calculatePrice());
    document.getElementById('saveCalcBtn')?.addEventListener('click', () => this.saveCalculation());
    document.getElementById('historyBtn')?.addEventListener('click', () => this.showHistory());
    document.getElementById('shareBtn')?.addEventListener('click', () => this.shareApp());
    document.getElementById('shareResultBtn')?.addEventListener('click', () => this.shareCalculation());
    document.getElementById('copyResultBtn')?.addEventListener('click', () => this.copyResult());

    document.querySelectorAll('input[name="calcType"]').forEach(radio => {
      radio.addEventListener('change', () => this.toggleCalculationType());
    });

    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) this.closeModal(modal);
      });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal(modal);
      });
    });
  }

  async fetchPrices() {
    try {
      this.showLoading(true);

      // original API used in previous script
      const response = await fetch("https://bulliontradingcenter.com/wp-admin/admin-ajax.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "action=btc_get_stock_ajax",
      });

      if (!response.ok) throw new Error('Failed fetching');

      const data = await response.json();

      if (data?.success && data?.data?.obj?.table) {
        this.goldPrices = data.data.obj.table;
        this.updatedDate = data.data.obj.updated_date;
        this.updatedTime = data.data.obj.updated_time;
        this.updateSelectOptions();
        this.renderMarketCards();
        this.showToast(this.translate('Prices updated successfully'), 'success');
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      console.error(err);
      this.showToast(this.translate('Error fetching prices'), 'error');
    } finally {
      this.showLoading(false);
    }
  }

  // Render the compact top market cards: prioritize 21K and 24K
  renderMarketCards() {
    const gold21 = this.goldPrices.find(p => p.name && p.name.toLowerCase().includes('21k'));
    const gold24 = this.goldPrices.find(p => p.name && p.name.toLowerCase().includes('24'));

    const card21 = document.getElementById('card21k');
    const card24 = document.getElementById('card24k');
    const lastUpdated = document.getElementById('lastUpdated');

    if (gold21 && card21) {
      const buyEl = card21.querySelector('.price-buy');
      const sellEl = card21.querySelector('.price-sell');
      buyEl.textContent = this.formatPrice(gold21.ask);
      sellEl.textContent = this.formatPrice(gold21.bid);
    } else if (card21) {
      card21.querySelector('.price-buy').textContent = '--';
      card21.querySelector('.price-sell').textContent = '--';
    }

    if (gold24 && card24) {
      card24.querySelector('.price-buy').textContent = this.formatPrice(gold24.ask);
      card24.querySelector('.price-sell').textContent = this.formatPrice(gold24.bid);
    } else if (card24) {
      card24.querySelector('.price-buy').textContent = '--';
      card24.querySelector('.price-sell').textContent = '--';
    }

    if (lastUpdated) {
      lastUpdated.textContent = (this.updatedDate && this.updatedTime) ? `${this.updatedDate} ${this.updatedTime}` : '';
    }
  }

  updateSelectOptions() {
    const select = document.getElementById('selectedProduct');
    if (!select) return;

    const preserve = select.value;
    select.innerHTML = select.children[0].outerHTML; // keep first placeholder

    // Add products with helpful data attributes (ask/bid/weight/type)
    this.goldPrices.forEach(product => {
      const opt = document.createElement('option');
      opt.value = product.id;
      opt.textContent = `${product.formatted_name} — ${this.formatPrice(product.ask)}`;
      opt.dataset.ask = product.ask;
      opt.dataset.bid = product.bid;
      opt.dataset.formatted = product.formatted_name;
      opt.dataset.weight = this.parseProductWeight(product); // grams per piece or 1 for per-gram
      select.appendChild(opt);
    });

    if (preserve && select.querySelector(`option[value="${preserve}"]`)) {
      select.value = preserve;
    }
  }

  toggleCalculationType() {
    const goldToMoneyInputs = document.getElementById('goldToMoneyInputs');
    const moneyToGoldInputs = document.getElementById('moneyToGoldInputs');
    const selectedType = document.querySelector('input[name="calcType"]:checked').value;

    if (selectedType === 'goldToMoney') {
      goldToMoneyInputs.style.display = 'grid';
      moneyToGoldInputs.style.display = 'none';
    } else {
      goldToMoneyInputs.style.display = 'none';
      moneyToGoldInputs.style.display = 'grid';
    }
  }

  calculatePrice() {
    const calcType = document.querySelector('input[name="calcType"]:checked').value;
    const productId = document.getElementById('selectedProduct').value;
    const feePercent = parseFloat(document.getElementById('feePercent').value) || 0;
    const rounding = document.getElementById('rounding').value;

    if (!productId) {
      this.showToast(this.translate('Please select a product'), 'warning');
      return;
    }

    const prod = this.goldPrices.find(p => p.id.toString() === productId || p.id === Number(productId));
    if (!prod) {
      this.showToast(this.translate('Please select a product'), 'warning');
      return;
    }

    const buyPrice = parseFloat(prod.ask);  // What you pay when buying
    const sellPrice = parseFloat(prod.bid); // What you get when selling
    const weightPerPiece = this.parseProductWeight(prod); // grams per piece for ingots/coins (or 1 for per-gram)
    const isPerGramProduct = (prod.formatted_name && /21k|24k/i.test(prod.formatted_name) && !/^(\d+)\s+gram/i.test(prod.formatted_name));

    if (calcType === 'goldToMoney') {
      let quantity = parseFloat(document.getElementById('quantity').value) || 0;
      if (quantity <= 0) {
        this.showToast(this.translate('Please enter a valid quantity'), 'warning');
        return;
      }

      // If per-gram product allow decimal quantities (grams). For ingots/coins quantity = pieces * weight
      let totalBuyValue = 0;
      let totalSellValue = 0;
      let totalWeightG = 0;

      if (isPerGramProduct) {
        // quantity interpreted as grams
        totalWeightG = quantity;
        totalBuyValue = quantity * buyPrice;
        totalSellValue = quantity * sellPrice;
      } else {
        // pieces: try to take weightPerPiece if provided by user override else parsed weight
        const weightInput = parseFloat(document.getElementById('weightPerPiece').value);
        const pieceWeight = (weightInput && weightInput > 0) ? weightInput : weightPerPiece;
        totalWeightG = quantity * pieceWeight;
        totalBuyValue = quantity * buyPrice;
        totalSellValue = quantity * sellPrice;
      }

      // Calculate fees for both scenarios
      const buyFeeAmount = totalBuyValue * (feePercent / 100);
      const sellFeeAmount = totalSellValue * (feePercent / 100);
      const finalBuyValue = this.applyRounding(totalBuyValue + buyFeeAmount, rounding); // Add fee when buying
      const finalSellValue = this.applyRounding(totalSellValue - sellFeeAmount, rounding); // Subtract fee when selling

      const result = {
        type: 'goldToMoney',
        product: prod.formatted_name,
        buyPrice,
        sellPrice,
        quantity,
        totalBuyValue,
        totalSellValue,
        feePercent,
        buyFeeAmount,
        sellFeeAmount,
        finalBuyValue,
        finalSellValue,
        totalWeightG
      };

      this.displaySavingsResult(result);

    } else {
      // moneyToGold
      let moneyAmount = parseFloat(document.getElementById('moneyAmount').value);
      if (!moneyAmount || moneyAmount <= 0) {
        this.showToast(this.translate('Please enter a valid amount'), 'warning');
        return;
      }

      const prefer = document.getElementById('minPieceSize').value; // 'pieces' or 'grams'
      
      // Calculate for buying scenario (you pay ask price)
      const buyFeeAmount = moneyAmount * (feePercent / 100);
      const usableMoneyBuy = moneyAmount - buyFeeAmount;
      
      // Calculate for selling scenario (you get bid price)
      const sellFeeAmount = moneyAmount * (feePercent / 100);
      const usableMoneySell = moneyAmount + sellFeeAmount; // You need more to get the same gold when selling

      let buyWholePieces = 0;
      let buyRemainder = usableMoneyBuy;
      let buyGramsObtained = 0;
      
      let sellWholePieces = 0;
      let sellRemainder = usableMoneySell;
      let sellGramsObtained = 0;

      // Calculate for buying (at ask price)
      if (isPerGramProduct || prefer === 'grams') {
        buyGramsObtained = usableMoneyBuy / buyPrice;
        buyGramsObtained = this.applyRounding(buyGramsObtained, rounding);
        buyRemainder = usableMoneyBuy - (buyGramsObtained * buyPrice);
      } else {
        buyWholePieces = Math.floor(usableMoneyBuy / buyPrice);
        buyRemainder = usableMoneyBuy - (buyWholePieces * buyPrice);
        buyGramsObtained = buyWholePieces * weightPerPiece;
      }

      // Calculate for selling (at bid price)
      if (isPerGramProduct || prefer === 'grams') {
        sellGramsObtained = moneyAmount / sellPrice;
        sellGramsObtained = this.applyRounding(sellGramsObtained, rounding);
        sellRemainder = moneyAmount - (sellGramsObtained * sellPrice);
      } else {
        sellWholePieces = Math.floor(moneyAmount / sellPrice);
        sellRemainder = moneyAmount - (sellWholePieces * sellPrice);
        sellGramsObtained = sellWholePieces * weightPerPiece;
      }

      const result = {
        type: 'moneyToGold',
        product: prod.formatted_name,
        buyPrice,
        sellPrice,
        moneyAmount,
        feePercent,
        buyFeeAmount,
        sellFeeAmount,
        usableMoneyBuy,
        buyWholePieces,
        buyGramsObtained,
        buyRemainder: this.applyRounding(buyRemainder, rounding),
        sellWholePieces,
        sellGramsObtained,
        sellRemainder: this.applyRounding(sellRemainder, rounding),
        rounding
      };

      this.displaySavingsResult(result);
    }
  }

  applyRounding(value, rounding) {
    if (rounding === 'none') return parseFloat(value);
    const floatVal = parseFloat(value);
    if (isNaN(floatVal)) return value;
    if (rounding === '1') return Math.round(floatVal);
    const step = parseFloat(rounding);
    if (!isNaN(step) && step > 0) {
      return Math.round((floatVal + Number.EPSILON) / step) * step;
    }
    return floatVal;
  }

  formatPrice(price) {
    if (isNaN(price)) return '--';
    return this.numberFormatter ? this.numberFormatter.format(price) : `${price.toFixed(2)} EGP`;
  }

  formatNumber(num, digits = 2) {
    if (isNaN(num)) return '--';
    return (this.currentLanguage === 'ar') ? this.toArabicNumerals(num.toFixed(digits)) : Number(num).toFixed(digits);
  }

  // display results (friendly mobile layout)
  displaySavingsResult(result) {
    const resultDetails = document.querySelector('.result-details');
    if (!resultDetails) return;

    let html = '';

    if (result.type === 'goldToMoney') {
      html = `
        <div class="result-row"><strong>${this.translate('Product')}:</strong> ${result.product}</div>
        <div class="result-row"><strong>${this.translate('Quantity')}:</strong> ${this.formatNumber(result.quantity, 2)} ${this.translate('pieces')}</div>
        <div class="result-row small">${this.translate('Weight total')}: ${this.formatNumber(result.totalWeightG, 2)} g</div>
        
        <div class="result-section">
          <h4 class="section-title">${this.translate('Buy (You pay)')}</h4>
          <div class="result-row"><strong>${this.translate('Unit Price')}:</strong> ${this.formatPrice(result.buyPrice)}</div>
          <div class="result-row"><strong>${this.translate('Total Value')}:</strong> ${this.formatPrice(result.totalBuyValue)}</div>
          <div class="result-row"><strong>${this.translate('Fee')} (${result.feePercent}%):</strong> ${this.formatPrice(result.buyFeeAmount)}</div>
          <div class="result-row total"><strong>${this.translate('Final Cost')}:</strong> ${this.formatPrice(result.finalBuyValue)}</div>
        </div>
        
        <div class="result-section">
          <h4 class="section-title">${this.translate('Sell (You get)')}</h4>
          <div class="result-row"><strong>${this.translate('Unit Price')}:</strong> ${this.formatPrice(result.sellPrice)}</div>
          <div class="result-row"><strong>${this.translate('Total Value')}:</strong> ${this.formatPrice(result.totalSellValue)}</div>
          <div class="result-row"><strong>${this.translate('Fee')} (${result.feePercent}%):</strong> ${this.formatPrice(result.sellFeeAmount)}</div>
          <div class="result-row total"><strong>${this.translate('Final Amount')}:</strong> ${this.formatPrice(result.finalSellValue)}</div>
        </div>
      `;
    } else {
      html = `
        <div class="result-row"><strong>${this.translate('Product')}:</strong> ${result.product}</div>
        <div class="result-row"><strong>${this.translate('Money Amount')}:</strong> ${this.formatPrice(result.moneyAmount)}</div>
        
        <div class="result-section">
          <h4 class="section-title">${this.translate('Buy (You pay)')}</h4>
          <div class="result-row"><strong>${this.translate('Unit Price')}:</strong> ${this.formatPrice(result.buyPrice)}</div>
          <div class="result-row"><strong>${this.translate('Fee')} (${result.feePercent}%):</strong> ${this.formatPrice(result.buyFeeAmount)}</div>
      `;

      if (result.buyWholePieces && result.buyWholePieces > 0) {
        html += `<div class="result-row"><strong>${this.translate('You Can Get')}:</strong> ${this.formatNumber(result.buyWholePieces, 0)} ${this.translate('pieces')}</div>`;
        html += `<div class="result-row small">${this.translate('Weight total')}: ${this.formatNumber(result.buyGramsObtained, 2)} g</div>`;
      } else {
        html += `<div class="result-row"><strong>${this.translate('You Can Get')}:</strong> ${this.formatNumber(result.buyGramsObtained, 3)} g</div>`;
      }

      html += `<div class="result-row"><strong>${this.translate('Remaining Amount')}:</strong> ${this.formatPrice(result.buyRemainder)}</div>
        </div>
        
        <div class="result-section">
          <h4 class="section-title">${this.translate('Sell (You get)')}</h4>
          <div class="result-row"><strong>${this.translate('Unit Price')}:</strong> ${this.formatPrice(result.sellPrice)}</div>
      `;

      if (result.sellWholePieces && result.sellWholePieces > 0) {
        html += `<div class="result-row"><strong>${this.translate('Gold Equivalent')}:</strong> ${this.formatNumber(result.sellWholePieces, 0)} ${this.translate('pieces')}</div>`;
        html += `<div class="result-row small">${this.translate('Weight total')}: ${this.formatNumber(result.sellGramsObtained, 2)} g</div>`;
      } else {
        html += `<div class="result-row"><strong>${this.translate('Gold Equivalent')}:</strong> ${this.formatNumber(result.sellGramsObtained, 3)} g</div>`;
      }

      html += `<div class="result-row"><strong>${this.translate('Remaining Amount')}:</strong> ${this.formatPrice(result.sellRemainder)}</div>
        </div>
      `;
    }

    resultDetails.innerHTML = html;
    document.getElementById('calculationResults').classList.add('show');

    // store last result
    this.lastCalculation = result;
  }

  saveCalculation() {
    if (!this.lastCalculation) return;
    const item = {
      ...this.lastCalculation,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    this.calculationHistory.unshift(item);
    // keep 50
    this.calculationHistory = this.calculationHistory.slice(0, 50);
    localStorage.setItem('calculationHistory', JSON.stringify(this.calculationHistory));
    this.showToast(this.translate('Calculation saved'), 'success');
  }

  showHistory() {
    const modal = document.getElementById('historyModal');
    const historyList = document.getElementById('historyList');
    if (!modal || !historyList) return;

    if (this.calculationHistory.length === 0) {
      historyList.innerHTML = `<p>${this.translate('No history yet')}</p>`;
    } else {
      historyList.innerHTML = this.calculationHistory.map(h => {
        const when = new Date(h.timestamp).toLocaleString();
        if (h.type === 'goldToMoney') {
          return `<div class="history-item"><div><strong>${h.product}</strong> — ${when}</div>
            <div>${this.translate('Quantity')}: ${this.formatNumber(h.quantity,2)} ${this.translate('pieces')}</div>
            <div>${this.translate('Final Value')}: ${this.formatPrice(h.finalValue || h.totalValue)}</div></div>`;
        } else {
          return `<div class="history-item"><div><strong>${h.product}</strong> — ${when}</div>
            <div>${this.translate('Money Amount')}: ${this.formatPrice(h.moneyAmount)}</div>
            <div>${this.translate('You Can Get')}: ${h.wholePieces ? this.formatNumber(h.wholePieces,0) + ' ' + this.translate('pieces') : this.formatNumber(h.gramsObtained,3) + ' g'}</div></div>`;
        }
      }).join('');
    }

    this.showModal(modal);
  }

  showModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  closeModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  shareApp() {
    const text = 'Check BTC Gold Calculator — quick gold conversions (EGP)';
    if (navigator.share) {
      navigator.share({ title: 'BTC Gold Calculator', text, url: location.href });
    } else {
      navigator.clipboard.writeText(`${text} — ${location.href}`);
      this.showToast(this.translate('Link copied'), 'success');
    }
  }

  shareCalculation() {
    if (!this.lastCalculation) return;
    const text = `Calc — ${this.lastCalculation.product}: ${this.lastCalculation.type === 'goldToMoney' ? this.formatPrice(this.lastCalculation.finalValue || this.lastCalculation.totalValue) : (this.lastCalculation.wholePieces ? this.lastCalculation.wholePieces + ' ' + this.translate('pieces') : this.lastCalculation.gramsObtained + ' g')}`;
    if (navigator.share) {
      navigator.share({ title: 'BTC Gold Calculation', text, url: location.href });
    } else {
      navigator.clipboard.writeText(text);
      this.showToast(this.translate('Calculation copied'), 'success');
    }
  }

  copyResult() {
    if (!this.lastCalculation) return;
    const el = document.querySelector('.result-details');
    if (!el) return;
    const text = el.textContent.trim();
    navigator.clipboard.writeText(text);
    this.showToast(this.translate('Copied'), 'success');
  }

  showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) loader.classList.toggle('show', show);
  }

  showToast(message, type = 'info') {
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

  // Arabic numerals helpers (kept from original)
  toArabicNumerals(num) {
    if (this.currentLanguage !== 'ar') return num.toString();
    const arabicNumerals = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return num.toString().replace(/[0-9]/g, d => arabicNumerals[d]);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.goldApp = new GoldCalculatorApp();

  // Register service worker if available (improves PWA/mobile)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(()=>{/*ignore*/});
  }
});

// Add small CSS animation for toasts (keeps same behaviour)
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes slideOut { from { transform: translateX(0); opacity: 1 } to { transform: translateX(100%); opacity: 0 } }
`;
document.head.appendChild(styleEl);