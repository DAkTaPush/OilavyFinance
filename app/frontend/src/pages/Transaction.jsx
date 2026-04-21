import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import TransactionCard from '../components/TransactionCard';
import Loader from '../components/Loader';
import AddTransactionModal from '../components/AddTransactionModal';
import { formatAmount } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

const FILTER_KEYS = ['all', 'expense', 'income', 'transfer'];

const Transaction = ({ onAddTransaction }) => {
  const location = useLocation();
  const { ready, lang } = useAuth();
  const [filter, setFilter]             = useState('all');
  const [search, setSearch]             = useState('');
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals]             = useState({ expenses: 0, incomes: 0 });
  const [activeCard, setActiveCard]     = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [modalType, setModalType]       = useState('expense');

  // Открываем модалку если пришли с Главной
  useEffect(() => {
    if (location.state?.openModal) {
      setModalType(location.state.type || 'expense');
      setShowModal(true);
    }
  }, [location.state]);

  const fetchTransactions = useCallback(async () => {
    if (!ready) return;
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (filter !== 'all') params.type = filter;
      if (search)           params.search = search;

      const [listRes, expRes, incRes, cardsRes] = await Promise.all([
        api.get('/api/transactions', { params }),
        api.get('/api/transactions', { params: { type: 'expense', limit: 500 } }),
        api.get('/api/transactions', { params: { type: 'income',  limit: 500 } }),
        api.get('/api/cards'),
      ]);

      setTransactions(listRes.data.transactions || []);
      setTotals({
        expenses: (expRes.data.transactions || []).reduce((s, t) => s + t.amount, 0),
        incomes:  (incRes.data.transactions || []).reduce((s, t) => s + t.amount, 0),
      });
      const cards = cardsRes.data.cards || [];
      setActiveCard(cards.find(c => c.isActive) || cards[0] || null);
    } catch (err) {
      console.error('[TRANSACTION]', err);
    } finally {
      setLoading(false);
    }
  }, [filter, search, ready]);

  useEffect(() => {
    const timer = setTimeout(fetchTransactions, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchTransactions, search]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error('[DELETE]', err);
    }
  };

  const openModal = (type = 'expense') => {
    if (onAddTransaction) {
      onAddTransaction(type);
    } else {
      setModalType(type);
      setShowModal(true);
    }
  };

  return (
    <div>
      <div className="page-header">💳 {t(lang, 'nav_transaction')}</div>

      <div style={{ padding: '0 14px' }}>
        {/* Баланс активной карты */}
        {activeCard && (
          <div className="card" style={{ textAlign: 'center', padding: '16px 10px', marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 800, letterSpacing: 0.5 }}>
              {t(lang, 'balance')}
            </div>
            <div style={{
              color: activeCard.balance >= 0 ? 'var(--income)' : 'var(--expense)',
              fontWeight: 900, fontSize: 22,
            }}>
              {formatAmount(activeCard.balance)} {activeCard.currency === 'sum' ? t(lang, 'sum_label') : t(lang, 'rub_label')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              💳 **** {(activeCard.cardNumber || '').replace(/\D/g, '').slice(-4)}
            </div>
          </div>
        )}

        {/* Итоговые карточки */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: '14px 10px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 800, letterSpacing: 0.5 }}>
              {t(lang, 'expenses')}
            </div>
            <div style={{ color: 'var(--expense)', fontWeight: 900, fontSize: 16 }}>
              -{formatAmount(totals.expenses)}
            </div>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: '14px 10px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 800, letterSpacing: 0.5 }}>
              {t(lang, 'incomes')}
            </div>
            <div style={{ color: 'var(--income)', fontWeight: 900, fontSize: 16 }}>
              +{formatAmount(totals.incomes)}
            </div>
          </div>
        </div>

        {/* Поиск */}
        <input
          className="input"
          placeholder={`🔍 ${t(lang, 'search')}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 10 }}
        />

        {/* Фильтры */}
        <div className="tab-switcher" style={{ marginBottom: 14 }}>
          {FILTER_KEYS.map((key) => (
            <button
              key={key}
              className={`tab${filter === key ? ' active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {t(lang, key === 'all' ? 'filter_all' : key === 'expense' ? 'filter_expenses' : key === 'income' ? 'filter_incomes' : 'filter_transfers')}
            </button>
          ))}
        </div>

        {/* Список */}
        {loading ? (
          <Loader />
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div style={{ fontWeight: 700 }}>{t(lang, 'not_found')}</div>
          </div>
        ) : (
          <>
            {transactions.map((tx) => (
              <TransactionCard key={tx._id} transaction={tx} onDelete={handleDelete} />
            ))}
            <div style={{ textAlign: 'center', padding: '14px 0 80px', color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
              {t(lang, 'found')}: {transactions.length}
            </div>
          </>
        )}
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => openModal('expense')}>+</button>

      {showModal && (
        <AddTransactionModal
          initialType={modalType}
          onClose={() => setShowModal(false)}
          onSaved={fetchTransactions}
        />
      )}
    </div>
  );
};

export default Transaction;
