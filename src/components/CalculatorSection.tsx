import type { GoldProduct, Language } from '@/lib/types';
import type { LocalizationService } from '@/lib/localization';

// ── helpers ───────────────────────────────────────────────────
function detectKarat(productId: string) {
  if (productId.includes('18k')) return '18k' as const;
  if (productId.includes('24k')) return '24k' as const;
  if (productId.includes('21k')) return '21k' as const;
  return null;
}

// ── sub-components ────────────────────────────────────────────
interface GoldToMoneyInputsProps {
  ar: boolean;
  quantity: string;
  weightPerPiece: string;
  onQuantityChange: (v: string) => void;
  onWeightPerPieceChange: (v: string) => void;
}

function GoldToMoneyInputs({
  ar, quantity, weightPerPiece, onQuantityChange, onWeightPerPieceChange,
}: Readonly<GoldToMoneyInputsProps>) {
  return (
    <div className="input-row">
      <div className="input-group">
        <label htmlFor="quantity">{ar ? 'الكمية / القطع' : 'Quantity / Pieces'}</label>
        <input
          type="number" id="quantity" min="1"
          value={quantity} onChange={e => onQuantityChange(e.target.value)}
          placeholder="1" inputMode="numeric"
        />
      </div>
      <div className="input-group">
        <label htmlFor="weightPerPiece">{ar ? 'وزن القطعة (جرام)' : 'Weight per piece (g)'}</label>
        <input
          type="number" id="weightPerPiece" min="0" step="0.01"
          value={weightPerPiece} onChange={e => onWeightPerPieceChange(e.target.value)}
          placeholder={ar ? 'تلقائي للسبائك' : 'Auto for ingots'}
        />
      </div>
    </div>
  );
}

interface MoneyToGoldInputsProps {
  ar: boolean;
  moneyAmount: string;
  preference: 'pieces' | 'grams';
  onMoneyAmountChange: (v: string) => void;
  onPreferenceChange: (v: 'pieces' | 'grams') => void;
}

function MoneyToGoldInputs({
  ar, moneyAmount, preference, onMoneyAmountChange, onPreferenceChange,
}: Readonly<MoneyToGoldInputsProps>) {
  return (
    <div className="input-row">
      <div className="input-group">
        <label htmlFor="moneyAmount">{ar ? 'المبلغ (ج.م)' : 'Money Amount (EGP)'}</label>
        <input
          type="number" id="moneyAmount" min="0" step="0.01"
          value={moneyAmount} onChange={e => onMoneyAmountChange(e.target.value)}
          placeholder="0.00" inputMode="decimal"
        />
      </div>
      <div className="input-group">
        <label htmlFor="preference">{ar ? 'تفضيل' : 'Preference'}</label>
        <select
          id="preference" value={preference}
          onChange={e => onPreferenceChange(e.target.value as 'pieces' | 'grams')}
        >
          <option value="pieces">{ar ? 'قطع كاملة (سبائك/عملات)' : 'Whole pieces (ingots / coins)'}</option>
          <option value="grams">{ar ? 'السماح بالجرامات' : 'Allow fractional grams'}</option>
        </select>
      </div>
    </div>
  );
}

interface Karat18kFeeProps {
  ar: boolean;
  custom18kFee: string;
  onCustom18kFeeChange: (v: string) => void;
}

function Karat18kFee({ ar, custom18kFee, onCustom18kFeeChange }: Readonly<Karat18kFeeProps>) {
  return (
    <div className="input-row" id="custom18kFeeRow">
      <div className="input-group">
        <label htmlFor="custom18kFee">
          {ar ? 'رسوم ١٨ قيراط المخصصة (ج.م/جرام)' : '18K Custom Fee (EGP/gram)'}
        </label>
        <input
          type="number" id="custom18kFee" min="0" step="0.01"
          value={custom18kFee} onChange={e => onCustom18kFeeChange(e.target.value)}
          placeholder="Optional" inputMode="decimal"
        />
        <small className="input-note">
          {ar ? 'اختياري — اتركه فارغاً لاستخدام 2% من القيمة' : 'Optional — leave blank to use 2% of value'}
        </small>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────
interface Props {
  language: Language;
  goldPrices: GoldProduct[];
  loc: LocalizationService;
  calcType: 'goldToMoney' | 'moneyToGold';
  selectedProduct: string;
  quantity: string;
  weightPerPiece: string;
  moneyAmount: string;
  preference: 'pieces' | 'grams';
  custom18kFee: string;
  autoFeeLabel: string;
  onCalcTypeChange: (v: 'goldToMoney' | 'moneyToGold') => void;
  onSelectedProductChange: (v: string) => void;
  onQuantityChange: (v: string) => void;
  onWeightPerPieceChange: (v: string) => void;
  onMoneyAmountChange: (v: string) => void;
  onPreferenceChange: (v: 'pieces' | 'grams') => void;
  onCustom18kFeeChange: (v: string) => void;
  onCalculate: () => void;
  onSave: () => void;
}

export default function CalculatorSection({
  language, goldPrices, loc,
  calcType, selectedProduct, quantity, weightPerPiece,
  moneyAmount, preference, custom18kFee, autoFeeLabel,
  onCalcTypeChange, onSelectedProductChange, onQuantityChange,
  onWeightPerPieceChange, onMoneyAmountChange, onPreferenceChange,
  onCustom18kFeeChange, onCalculate, onSave,
}: Readonly<Props>) {
  const ar    = language === 'ar';
  const karat = detectKarat(selectedProduct);

  return (
    <section className="calculator-section" aria-label="Gold calculator">
      <h2>{ar ? 'حاسبة مدخرات الذهب' : 'Gold Savings Calculator'}</h2>

      <div className="calculator-grid">
        {/* Product select */}
        <div className="input-group">
          <label htmlFor="selectedProduct">{ar ? 'اختر المنتج' : 'Select Product'}</label>
          <select
            id="selectedProduct" value={selectedProduct}
            onChange={e => onSelectedProductChange(e.target.value)}
            aria-label="Select gold product"
          >
            <option value="">{ar ? 'اختر منتج…' : 'Choose a product…'}</option>
            {goldPrices.map(p => (
              <option key={p.id} value={String(p.id)}>
                {p.formatted_name} — {loc.formatPrice(p.ask)}
              </option>
            ))}
          </select>
        </div>

        {/* Calculation type toggle */}
        <fieldset className="calc-type">
          <legend className="sr-only">{ar ? 'نوع العملية' : 'Calculation Type'}</legend>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio" name="calcType" value="goldToMoney"
                checked={calcType === 'goldToMoney'}
                onChange={() => onCalcTypeChange('goldToMoney')}
              />
              <i className="fas fa-coins" aria-hidden="true" />
              <span>{ar ? 'ذهب ← نقود' : 'Gold → Cash'}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio" name="calcType" value="moneyToGold"
                checked={calcType === 'moneyToGold'}
                onChange={() => onCalcTypeChange('moneyToGold')}
              />
              <i className="fas fa-money-bill-wave" aria-hidden="true" />
              <span>{ar ? 'نقود ← ذهب' : 'Cash → Gold'}</span>
            </label>
          </div>
        </fieldset>

        {/* Conditional inputs */}
        {calcType === 'goldToMoney' && (
          <GoldToMoneyInputs
            ar={ar} quantity={quantity} weightPerPiece={weightPerPiece}
            onQuantityChange={onQuantityChange}
            onWeightPerPieceChange={onWeightPerPieceChange}
          />
        )}
        {calcType === 'moneyToGold' && (
          <MoneyToGoldInputs
            ar={ar} moneyAmount={moneyAmount} preference={preference}
            onMoneyAmountChange={onMoneyAmountChange}
            onPreferenceChange={onPreferenceChange}
          />
        )}
        {karat === '18k' && (
          <Karat18kFee
            ar={ar} custom18kFee={custom18kFee}
            onCustom18kFeeChange={onCustom18kFeeChange}
          />
        )}

        {/* Auto fee */}
        <div className="input-group">
          <label>
            {ar ? 'رسوم تلقائية' : 'Auto Fee'}
            <span
              className="help-icon"
              title={ar ? 'الرسوم محسوبة تلقائياً بناءً على عيار الذهب المختار. يمكنك تخصيص رسوم عيار ١٨ يدوياً.' : 'Fee is auto-calculated based on gold karat. You can override the 18K fee manually.'}
              aria-label={ar ? 'معلومات عن الرسوم التلقائية' : 'Info about auto fee'}
            >
              <i className="fas fa-info-circle" aria-hidden="true" />
            </span>
          </label>
          <div className="fee-display" id="autoFeeDisplay" aria-live="polite">
            <span className="fee-value">{autoFeeLabel}</span>
            <small className="fee-note">
              {ar ? 'محسوب تلقائياً حسب نوع الذهب' : 'Automatically calculated per gold type'}
            </small>
          </div>
        </div>

        {/* Actions */}
        <div className="calc-actions">
          <button
            className="calculate-btn"
            onClick={onCalculate}
            title={ar ? 'احسب قيمة الذهب بناءً على المدخلات' : 'Calculate gold value based on your inputs'}
          >
            <i className="fas fa-calculator" />
            <span>{ar ? 'احسب' : 'Calculate'}</span>
          </button>
          <button
            className="calculate-btn secondary"
            onClick={onSave}
            title={ar ? 'احفظ نتيجة الحساب الحالي في السجل' : 'Save the current calculation result to history'}
          >
            <i className="fas fa-bookmark" />
            <span>{ar ? 'حفظ' : 'Save'}</span>
          </button>
        </div>
      </div>

    </section>
  );
}
