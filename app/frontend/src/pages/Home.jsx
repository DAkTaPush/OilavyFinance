import { useState, useEffect, useCallback, useRef } from 'react';
import dayjs from 'dayjs';
import api from '../api/axios';
import TransactionCard from '../components/TransactionCard';
import Loader from '../components/Loader';
import { formatAmount } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

const PERIODS = ['today', 'week', 'month'];

const filterByPeriod = (txs, period) => {
  const today   = dayjs().format('YYYY-MM-DD');
  const weekAgo = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
  return txs.filter((tx) => {
    const d = tx.date?.slice(0, 10);
    if (period === 'today') return d === today;
    if (period === 'week')  return d >= weekAgo && d <= today;
    return true;
  });
};

const Home = ({ onAddTransaction }) => {
  const { ready, lang } = useAuth();
  const [activeTab, setActiveTab] = useState('expense');
  const [period, setPeriod]       = useState('today');
  const [showMenu, setShowMenu]   = useState(false);
  const [allTxs, setAllTxs]      = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [loading, setLoading]     = useState(true);
  const menuRef                   = useRef(null);

  const fetchData = useCallback(async () => {
    if (!ready) return;
    try {
      setLoading(true);
      const today = dayjs();
      const [txRes, cardsRes] = await Promise.all([
        api.get('/api/transactions', { params: { month: today.month() + 1, year: today.year(), limit: 500 } }),
        api.get('/api/cards'),
      ]);
      setAllTxs(txRes.data.transactions || []);
      const cards = cardsRes.data.cards || [];
      setActiveCard(cards.find(c => c.isActive) || cards[0] || null);
    } catch (err) {
      console.error('[HOME]', err);
    } finally {
      setLoading(false);
    }
  }, [ready]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/transactions/${id}`);
      setAllTxs((prev) => prev.filter((tx) => tx._id !== id));
      const { data } = await api.get('/api/cards');
      const cards = data.cards || [];
      setActiveCard(cards.find(c => c.isActive) || cards[0] || null);
    } catch (err) {
      console.error('[HOME DELETE]', err);
    }
  };

  const periodTxs = filterByPeriod(allTxs, period);
  const lastTxs   = periodTxs.filter((tx) => tx.type === activeTab).slice(0, 5);

  return (
    <div>
      <div className="page-header">🏠 {t(lang, 'nav_home')}</div>

      <div style={{ padding: '0 14px' }}>

        {/* ── Баланс ── */}
        <div className="card" style={{ textAlign: 'center', padding: '16px 10px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 800, letterSpacing: 0.5 }}>
            {t(lang, 'balance')}
          </div>
          {activeCard ? (
            <>
              <div style={{
                color: activeCard.balance >= 0 ? 'var(--income)' : 'var(--expense)',
                fontWeight: 900, fontSize: 26,
              }}>
                {new Intl.NumberFormat('ru-RU').format(activeCard.balance ?? 0)} {activeCard.currency === 'sum' ? t(lang, 'sum_label') : t(lang, 'rub_label')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                💳 **** {(activeCard.cardNumber || '').replace(/\D/g, '').slice(-4)}
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: 16 }}>
              {t(lang, 'no_cards')}
            </div>
          )}
        </div>

        {/* Переключатель расходы/доходы/переводы */}
        <div className="tab-switcher" style={{ marginBottom: 14 }}>
          <button className={`tab${activeTab === 'expense' ? ' active' : ''}`} onClick={() => setActiveTab('expense')}>
            {t(lang, 'expenses')}
          </button>
          <button className={`tab${activeTab === 'income' ? ' active' : ''}`} onClick={() => setActiveTab('income')}>
            {t(lang, 'incomes')}
          </button>
          <button className={`tab${activeTab === 'transfer' ? ' active' : ''}`} onClick={() => setActiveTab('transfer')}>
            {t(lang, 'transfer')}
          </button>
        </div>

        {/* Селектор периода */}
        <div ref={menuRef} style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
          <button
            onClick={() => setShowMenu((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-card-dark)',
              border: 'none', borderRadius: 12,
              padding: '8px 14px', cursor: 'pointer',
              color: 'var(--white)',
            }}
          >
            <span style={{ fontSize: 18 }}>📅</span>
            <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: 1 }}>
              {t(lang, `period_${period}`).toUpperCase()}
            </span>
            <span style={{ fontSize: 13, opacity: 0.7 }}>{showMenu ? '▲' : '▼'}</span>
          </button>

          {showMenu && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300,
              background: '#2a0060',
              border: '1.5px solid rgba(140,0,255,0.5)',
              borderRadius: 16,
              boxShadow: '0 10px 30px rgba(0,0,0,0.55)',
              overflow: 'hidden', minWidth: 180,
            }}>
              {PERIODS.map((p, i) => (
                <button
                  key={p}
                  onClick={() => { setPeriod(p); setShowMenu(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    width: '100%', padding: '14px 18px',
                    background: period === p ? 'rgba(140,0,255,0.4)' : 'transparent',
                    borderTop: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
                    color: 'var(--white)', textAlign: 'left',
                    fontWeight: 800, fontSize: 14,
                    cursor: 'pointer', letterSpacing: 0.5,
                  }}
                >
                  <span style={{ fontSize: 18 }}>
                    {p === 'today' ? '📆' : p === 'week' ? '📅' : '🗓️'}
                  </span>
                  {t(lang, `period_${p}`)}
                  {period === p && <span style={{ marginLeft: 'auto', color: 'var(--primary-light)' }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Кнопки действий ── */}
        <div className="section-label">{t(lang, 'add_actions')}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 36, marginBottom: 24 }}>
          {[
            { type: 'expense',  icon: '↓', cls: 'expense',  key: 'expense'  },
            { type: 'income',   icon: '↑', cls: 'income',   key: 'income'   },
            { type: 'transfer', icon: '👥', cls: 'transfer', key: 'transfer' },
          ].map(({ type, icon, cls, key }) => (
            <div key={type} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <button className={`btn-action ${cls}`} onClick={() => onAddTransaction?.(type)}>
                <span style={{ fontSize: type === 'transfer' ? 22 : 28, fontWeight: 900, lineHeight: 1 }}>
                  {icon}
                </span>
              </button>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                {t(lang, key)}
              </span>
            </div>
          ))}
        </div>

        {/* ── Последние транзакции ── */}
        <div className="section-label">
          {activeTab === 'expense' ? t(lang, 'last_expenses') : activeTab === 'income' ? t(lang, 'last_incomes') : t(lang, 'family_transfers')}
        </div>

        {loading ? <Loader /> : lastTxs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💸</div>
            <div style={{ fontWeight: 700 }}>{t(lang, 'no_transactions')}</div>
            <div className="text-sm">{t(lang, 'tap_to_add')}</div>
          </div>
        ) : (
          lastTxs.map((tx) => (
            <TransactionCard key={tx._id} transaction={tx} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
