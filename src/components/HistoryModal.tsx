import type { HistoryItem, Language } from '@/lib/types';
import type { LocalizationService } from '@/lib/localization';

interface Props {
  show: boolean;
  history: HistoryItem[];
  language: Language;
  loc: LocalizationService;
  onClose: () => void;
}

export default function HistoryModal({
  show,
  history,
  language,
  loc,
  onClose,
}: Readonly<Props>) {
  if (!show) return null;

  const ar = language === 'ar';

  return (
    <div
      className="modal show"
      role="dialog"
      aria-modal="true"
      aria-labelledby="historyModalTitle"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="historyModalTitle">
            {ar ? 'تاريخ العمليات الحسابية' : 'Calculation History'}
          </h2>
          <button className="modal-close" aria-label="Close" onClick={onClose}>
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
                  <div>
                    <strong>{h.product}</strong> — {new Date(h.timestamp).toLocaleString()}
                  </div>
                  {h.type === 'goldToMoney' ? (
                    <>
                      <div>
                        {loc.translate('Quantity')}: {loc.formatNumber(h.quantity ?? 0, 2)}{' '}
                        {loc.translate('pieces')}
                      </div>
                      <div>
                        {loc.translate('Final Value')}:{' '}
                        {loc.formatPrice(h.finalBuyValue ?? h.totalBuyValue ?? 0)}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        {loc.translate('Money Amount')}: {loc.formatPrice(h.moneyAmount ?? 0)}
                      </div>
                      <div>
                        {loc.translate('You Can Get')}:{' '}
                        {h.buyWholePieces
                          ? `${loc.formatNumber(h.buyWholePieces, 0)} ${loc.translate('pieces')}`
                          : `${loc.formatNumber(h.buyGramsObtained ?? 0, 3)} g`}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
