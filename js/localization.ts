// Localization service for the Gold Calculator App
import { Language, LocalizationData } from './types.js';

export class LocalizationService {
  private currentLanguage: Language;
  private numberFormatter: Intl.NumberFormat | null = null;

  private readonly translations: LocalizationData = {
    en: {
      "5 Gram Ingot": "5 Gram Ingot",
      "10 Gram Ingot": "10 Gram Ingot",
      "20 Gram Ingot": "20 Gram Ingot",
      "Gold Ounce": "Gold Ounce",
      "50 Gram Ingot": "50 Gram Ingot",
      "100 Gram Ingot": "100 Gram Ingot",
      "Gold Pound": "Gold Pound",
      "21K/ Gold": "21K Gold",
      "24K/ Gold": "24K Gold",
      "Loading prices...": "Loading prices...",
      "Fetching latest prices...": "Fetching latest prices...",
      "Please wait...": "Please wait...",
      "Refreshing data...": "Refreshing data...",
      "USD/EGP:": "USD/EGP:",
      "Exchange rate updated": "Exchange rate updated",
      "Failed to update exchange rate": "Failed to update exchange rate",
      "Prices updated successfully": "Prices updated successfully",
      "Error fetching prices": "Error fetching prices",
      "Failed to fetch from all sources": "Failed to fetch from all sources",
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
      "Copied": "Copied",
      "BTC Gold Calculator": "BTC Gold Calculator",
      "Quick gold value & conversion — Egypt (EGP)": "Quick gold value & conversion — Egypt (EGP)",
      "18K Gold": "18K Gold",
      "21K Gold": "21K Gold",
      "24K Gold": "24K Gold",
      "EGP / g": "EGP / g",
      "Price Warning": "Price Warning",
      "Prices may not be accurate": "Prices may not be accurate",
      "Using fallback price source": "Using fallback price source",
      "Fallback API Warning": "⚠️ Using backup price source - prices may not be current",
      "Auto Fee": "Auto Fee",
      "Fee automatically calculated": "Fee automatically calculated based on gold type",
      "Product Breakdown": "Product Breakdown",
      "Optimal Purchase": "Optimal Purchase Breakdown",
      "Gold Pound (8g)": "Gold Pound (8g)",
      "Half Pound (4g)": "Half Pound (4g)", 
      "Quarter Pound (2g)": "Quarter Pound (2g)",
      "Refresh Prices": "Refresh Prices",
      "History": "History",
      "Share": "Share",
      "Gold Savings Calculator": "Gold Savings Calculator",
      "Select Product": "Select Product",
      "Choose a product...": "Choose a product...",
      "Calculation Type": "Calculation Type",
      "Quantity / Pieces": "Quantity / Pieces",
      "Weight per piece (g)": "Weight per piece (g)",
      "Auto for ingots": "Auto for ingots",
      "Money Amount (EGP)": "Money Amount (EGP)",
      "Prefer whole pieces? (min size)": "Prefer whole pieces?",
      "Whole pieces (e.g., ingots/coins)": "Whole pieces",
      "Allow grams (fractional)": "Allow grams",
      "Fee (%)": "Fee (%)",
      "Rounding": "Rounding",
      "No rounding": "No rounding",
      "2 decimals": "2 decimals",
      "Round to whole": "Round to whole",
      "Calculate": "Calculate",
      "Save": "Save",
      "Calculation Results": "Calculation Results",
      "Copy": "Copy",
      "Enter quantity": "Enter quantity",
      "Enter amount": "Enter amount"
    },
    ar: {
      "5 Gram Ingot": "سبيكة ٥ جرام",
      "10 Gram Ingot": "سبيكة ١٠ جرام",
      "20 Gram Ingot": "سبيكة ٢٠ جرام",
      "Gold Ounce": "أونصة الذهب",
      "50 Gram Ingot": "سبيكة ٥٠ جرام",
      "100 Gram Ingot": "سبيكة ١٠٠ جرام",
      "Gold Pound": "الجنيه الذهب",
      "21K/ Gold": "ذهب عيار ٢١",
      "24K/ Gold": "ذهب عيار ٢٤",
      "Loading prices...": "جاري تحميل الأسعار...",
      "Fetching latest prices...": "جاري جلب أحدث الأسعار...",
      "Please wait...": "يرجى الانتظار...",
      "Refreshing data...": "جاري تحديث البيانات...",
      "USD/EGP:": "دولار/جنيه:",
      "Exchange rate updated": "تم تحديث سعر الصرف",
      "Failed to update exchange rate": "فشل في تحديث سعر الصرف",
      "Prices updated successfully": "تم تحديث الأسعار بنجاح",
      "Error fetching prices": "خطأ في تحميل الأسعار",
      "Failed to fetch from all sources": "فشل في تحميل الأسعار من جميع المصادر",
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
      "Copied": "تم النسخ",
      "BTC Gold Calculator": "حاسبة الذهب BTC",
      "Quick gold value & conversion — Egypt (EGP)": "حاسب الذهب السريع — مصر (ج.م)",
      "18K Gold": "ذهب ١٨ قيراط",
      "21K Gold": "ذهب ٢١ قيراط",
      "24K Gold": "ذهب ٢٤ قيراط",
      "EGP / g": "ج.م / جرام",
      "Price Warning": "تحذير السعر",
      "Prices may not be accurate": "الأسعار قد لا تكون دقيقة",
      "Using fallback price source": "استخدام مصدر أسعار احتياطي",
      "Fallback API Warning": "⚠️ استخدام مصدر أسعار احتياطي - الأسعار قد لا تكون محدثة",
      "Auto Fee": "رسوم تلقائية",
      "Fee automatically calculated": "الرسوم محسوبة تلقائياً حسب نوع الذهب",
      "Product Breakdown": "تفصيل المنتجات",
      "Optimal Purchase": "تفصيل الشراء الأمثل",
      "Gold Pound (8g)": "جنيه ذهب (٨ جرام)",
      "Half Pound (4g)": "نصف جنيه (٤ جرام)",
      "Quarter Pound (2g)": "ربع جنيه (٢ جرام)",
      "Refresh Prices": "تحديث الأسعار",
      "History": "التاريخ",
      "Share": "مشاركة",
      "Gold Savings Calculator": "حاسبة مدخرات الذهب",
      "Select Product": "اختر المنتج",
      "Choose a product...": "اختر منتج...",
      "Calculation Type": "نوع العملية",
      "Quantity / Pieces": "الكمية / القطع",
      "Weight per piece (g)": "وزن القطعة (جرام)",
      "Auto for ingots": "تلقائي للسبائك",
      "Money Amount (EGP)": "المبلغ (ج.م)",
      "Prefer whole pieces? (min size)": "تفضيل قطع كاملة؟",
      "Whole pieces (e.g., ingots/coins)": "قطع كاملة (سبائك/عملات)",
      "Allow grams (fractional)": "السماح بالجرامات",
      "Fee (%)": "رسوم (%)",
      "Rounding": "التقريب",
      "No rounding": "لا تقريب",
      "2 decimals": "2 أرقام عشرية",
      "Round to whole": "تقريب للأقرب",
      "Calculate": "احسب",
      "Save": "حفظ",
      "Calculation Results": "نتائج الحساب",
      "Copy": "نسخ",
      "Enter quantity": "أدخل الكمية",
      "Enter amount": "أدخل المبلغ"
    }
  };

  constructor(initialLanguage: Language = 'en') {
    this.currentLanguage = initialLanguage;
    this.updateNumberFormatter();
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language;
    this.updateNumberFormatter();
  }

  toggleLanguage(): Language {
    this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
    this.updateNumberFormatter();
    return this.currentLanguage;
  }

  translate(key: string): string {
    const translations = this.translations[this.currentLanguage];
    return translations[key] || key;
  }

  formatPrice(price: number): string {
    if (Number.isNaN(price)) return '--';
    return this.numberFormatter 
      ? this.numberFormatter.format(price) 
      : `${price.toFixed(2)} EGP`;
  }

  formatNumber(num: number, digits: number = 2): string {
    if (Number.isNaN(num)) return '--';
    const formatted = Number(num).toFixed(digits);
    return this.currentLanguage === 'ar' 
      ? this.toArabicNumerals(formatted) 
      : formatted;
  }

  isRTL(): boolean {
    return this.currentLanguage === 'ar';
  }

  applyToDOM(): void {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('lang', this.currentLanguage);
    htmlElement.setAttribute('dir', this.isRTL() ? 'rtl' : 'ltr');

    // Update all translatable elements
    const elements = document.querySelectorAll('[data-en]');
    for (const element of elements) {
      const htmlEl = element as HTMLElement;
      const en = htmlEl.dataset.en;
      const ar = htmlEl.dataset.ar;
      
      if (this.currentLanguage === 'ar' && ar) {
        htmlEl.textContent = ar;
      } else if (en) {
        htmlEl.textContent = en;
      }
    }

    // Update placeholders
    this.updatePlaceholders();
  }

  private updateNumberFormatter(): void {
    const locale = this.currentLanguage === 'ar' ? 'ar-EG' : 'en-EG';
    this.numberFormatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
    });
  }

  private updatePlaceholders(): void {
    const placeholders = [
      { id: 'quantity', en: 'Enter quantity', ar: 'أدخل الكمية' },
      { id: 'moneyAmount', en: 'Enter amount', ar: 'أدخل المبلغ' },
      { id: 'feePercent', en: '0.00', ar: '0.00' },
      { id: 'weightPerPiece', en: 'Auto for ingots', ar: 'تلقائي للسبائك' }
    ];

    for (const p of placeholders) {
      const el = document.getElementById(p.id) as HTMLInputElement;
      if (el) {
        el.placeholder = this.currentLanguage === 'ar' ? p.ar : p.en;
      }
    }
  }

  private toArabicNumerals(num: string): string {
    if (this.currentLanguage !== 'ar') return num;
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.replaceAll(/\d/g, (d: string) => arabicNumerals[Number.parseInt(d, 10)]);
  }

  // Get all available translations for a specific key (useful for debugging)
  getAllTranslations(key: string): { [lang in Language]: string } {
    return {
      en: this.translations.en[key] || key,
      ar: this.translations.ar[key] || key
    };
  }

  // Add new translation at runtime
  addTranslation(key: string, translations: Partial<{ [lang in Language]: string }>): void {
    if (translations.en) {
      this.translations.en[key] = translations.en;
    }
    if (translations.ar) {
      this.translations.ar[key] = translations.ar;
    }
  }

  // Get direction for CSS
  getDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }
}