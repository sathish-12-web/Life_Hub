export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const isIncome = transaction.type === 'INCOME';

  const formattedDate = transaction.occurredAt
    ? new Date(transaction.occurredAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: transaction.currency || 'USD',
  }).format(transaction.amount || 0);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all gap-3">
      <div className="flex items-start sm:items-center gap-3">
        {/* Type Icon Pill */}
        <div
          className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
            isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}
        >
          {isIncome ? '↓' : '↑'}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">{transaction.category}</span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isIncome
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {transaction.type}
            </span>
          </div>

          {transaction.note && (
            <p className="text-xs text-slate-500 mt-0.5 max-w-md line-clamp-1">{transaction.note}</p>
          )}

          <p className="text-[11px] text-slate-400 mt-1">{formattedDate}</p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
        <div className="text-left sm:text-right">
          <span
            className={`text-base font-bold ${
              isIncome ? 'text-emerald-600' : 'text-slate-900'
            }`}
          >
            {isIncome ? `+${formattedAmount}` : `-${formattedAmount}`}
          </span>
          <p className="text-[10px] text-slate-400">{transaction.currency || 'USD'}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(transaction)}
            className="p-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit Transaction"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(transaction.id)}
            className="p-1.5 text-xs font-medium text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Transaction"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
