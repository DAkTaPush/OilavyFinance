import { getCategoryInfo, formatAmount, formatDate } from '../utils/format';

const TYPE_COLOR = {
  expense:  'var(--expense)',
  income:   'var(--income)',
  transfer: 'var(--transfer)',
};

const TYPE_SIGN = {
  expense:  '-',
  income:   '+',
  transfer: '↔',
};

const TransactionCard = ({ transaction, onDelete }) => {
  const { type, amount, category, description, date, _id } = transaction;
  const { emoji } = getCategoryInfo(category);
  const color = TYPE_COLOR[type] || TYPE_COLOR.expense;
  const sign  = TYPE_SIGN[type]  || '';

  return (
    <div className="transaction-card">
      <div
        className="category-icon"
        style={{ background: color, opacity: 0.9 }}
      >
        {emoji}
      </div>

      <div className="info">
        <div className="category-name">{category}</div>
        <div className="meta">
          {description ? `${description} · ` : ''}
          {formatDate(date)}
        </div>
      </div>

      <div className={`amount ${type}`}>
        {sign}{formatAmount(amount)}
      </div>

      {onDelete && (
        <button
          onClick={() => onDelete(_id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            marginLeft: 4, fontSize: 15, color: 'var(--text-muted)',
            padding: '0 2px',
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default TransactionCard;
