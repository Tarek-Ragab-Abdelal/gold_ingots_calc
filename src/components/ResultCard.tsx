import type { CalculationResult } from '@/lib/types';
import type { LocalizationService } from '@/lib/localization';

interface Props {
  result: CalculationResult;
  language: string;
  loc: LocalizationService;
  onCopy: () => void;
}

export default function ResultCard({ result, language, loc, onCopy }: Readonly<Props>) {
  const ar = language === 'ar';

  return (
    <div id="calculationResults" className="results-section show" aria-live="polite">
      <div className="result-card">
        <h3>{ar ? 'نتائج الحساب' : 'Calculation Results'}</h3>

        <div className="result-details">
          {result.type === 'goldToMoney' ? (
            <>
              <div className="result-row">
                <strong>{loc.translate('Product')}:</strong> {result.product}
              </div>
              <div className="result-row">
                <strong>{loc.translate('Quantity')}:</strong>{' '}
                {loc.formatNumber(result.quantity, 2)} {loc.translate('pieces')}
              </div>
              <div className="result-row small">
                {loc.translate('Weight total')}: {loc.formatNumber(result.totalWeightG, 2)} g
              </div>

              <div className="result-section">
                <h4 className="section-title">{loc.translate('Buy (You pay)')}</h4>
                <div className="result-row">
                  <strong>{loc.translate('Unit Price')}:</strong> {loc.formatPrice(result.buyPrice)}
                </div>
                <div className="result-row">
                  <strong>{loc.translate('Total Value')}:</strong>{' '}
                  {loc.formatPrice(result.totalBuyValue)}
                </div>
                <div className="result-row">
                  <strong>{loc.translate('Fee')} ({result.feePercent}%):</strong>{' '}
                  {loc.formatPrice(result.buyFeeAmount)}
                </div>
                <div className="result-row total">
                  <strong>{loc.translate('Final Cost')}:</strong>{' '}
                  {loc.formatPrice(result.finalBuyValue)}
                </div>
              </div>

              <div className="result-section">
                <h4 className="section-title">{loc.translate('Sell (You get)')}</h4>
                <div className="result-row">
                  <strong>{loc.translate('Unit Price')}:</strong>{' '}
                  {loc.formatPrice(result.sellPrice)}
                </div>
                <div className="result-row">
                  <strong>{loc.translate('Total Value')}:</strong>{' '}
                  {loc.formatPrice(result.totalSellValue)}
                </div>
                <div className="result-row">
                  <strong>{loc.translate('Fee')} ({result.feePercent}%):</strong>{' '}
                  {loc.formatPrice(result.sellFeeAmount)}
                </div>
                <div className="result-row total">
                  <strong>{loc.translate('Final Amount')}:</strong>{' '}
                  {loc.formatPrice(result.finalSellValue)}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="result-row">
                <strong>{loc.translate('Product')}:</strong> {result.product}
              </div>
              <div className="result-row">
                <strong>{loc.translate('Money Amount')}:</strong>{' '}
                {loc.formatPrice(result.moneyAmount)}
              </div>

              <div className="result-section">
                <h4 className="section-title">{loc.translate('Buy (You pay)')}</h4>
                <div className="result-row">
                  <strong>{loc.translate('Unit Price')}:</strong>{' '}
                  {loc.formatPrice(result.buyPrice)}
                </div>
                <div className="result-row">
                  <strong>{loc.translate('Fee')} ({result.feePercent}%):</strong>{' '}
                  {loc.formatPrice(result.buyFeeAmount)}
                </div>
                {result.buyWholePieces > 0 ? (
                  <>
                    <div className="result-row">
                      <strong>{loc.translate('You Can Get')}:</strong>{' '}
                      {loc.formatNumber(result.buyWholePieces, 0)} {loc.translate('pieces')}
                    </div>
                    <div className="result-row small">
                      {loc.translate('Weight total')}:{' '}
                      {loc.formatNumber(result.buyGramsObtained, 2)} g
                    </div>
                  </>
                ) : (
                  <div className="result-row">
                    <strong>{loc.translate('You Can Get')}:</strong>{' '}
                    {loc.formatNumber(result.buyGramsObtained, 3)} g
                  </div>
                )}
                <div className="result-row">
                  <strong>{loc.translate('Remaining Amount')}:</strong>{' '}
                  {loc.formatPrice(result.buyRemainder)}
                </div>
              </div>

              <div className="result-section">
                <h4 className="section-title">{loc.translate('Sell (You get)')}</h4>
                <div className="result-row">
                  <strong>{loc.translate('Unit Price')}:</strong>{' '}
                  {loc.formatPrice(result.sellPrice)}
                </div>
                {result.sellWholePieces > 0 ? (
                  <>
                    <div className="result-row">
                      <strong>{loc.translate('Gold Equivalent')}:</strong>{' '}
                      {loc.formatNumber(result.sellWholePieces, 0)} {loc.translate('pieces')}
                    </div>
                    <div className="result-row small">
                      {loc.translate('Weight total')}:{' '}
                      {loc.formatNumber(result.sellGramsObtained, 2)} g
                    </div>
                  </>
                ) : (
                  <div className="result-row">
                    <strong>{loc.translate('Gold Equivalent')}:</strong>{' '}
                    {loc.formatNumber(result.sellGramsObtained, 3)} g
                  </div>
                )}
                <div className="result-row">
                  <strong>{loc.translate('Remaining Amount')}:</strong>{' '}
                  {loc.formatPrice(result.sellRemainder)}
                </div>
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
                        {loc.formatPrice(
                          result.breakdown[result.breakdown.length - 1]!.remaining_money,
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="result-actions">
          <button className="action-btn" onClick={onCopy} aria-label="Copy result">
            <i className="fas fa-copy" />
            <span>{ar ? 'نسخ' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
