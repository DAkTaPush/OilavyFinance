import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import api from '../api/axios';
import Loader from '../components/Loader';
import TransactionCard from '../components/TransactionCard';
import { formatAmount, getCategoryInfo } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

const MONTH_NAMES_RU = [
  'ЯНВАРЬ','ФЕВРАЛЬ','МАРТ','АПРЕЛЬ','МАЙ','ИЮНЬ',
  'ИЮЛЬ','АВГУСТ','СЕНТЯБРЬ','ОКТЯБРЬ','НОЯБРЬ','ДЕКАБРЬ',
];
const MONTH_NAMES_UZ = [
  'YANVAR','FEVRAL','MART','APREL','MAY','IYUN',
  'IYUL','AVGUST','SENTABR','OKTABR','NOYABR','DEKABR',
];
const WEEKDAYS_RU = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const WEEKDAYS_UZ = ['Du','Se','Ch','Pa','Ju','Sh','Ya'];

// ── Модал дня ────────────────────────────────────────────────────────────────
const DayModal = ({ day, month, year, onClose, lang }) => {
  const [txs, setTxs]         = useState([]);
  const [loading, setLoading] = useState(true);

  const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const monthNames = lang === 'uz' ? MONTH_NAMES_UZ : MONTH_NAMES_RU;
  const label   = `${day} ${monthNames[month - 1]} ${year}`;

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/transactions', {
          params: { month, year, limit: 200 },
        });
        const all = data.transactions || [];
        setTxs(all.filter((t) => t.date?.slice(0, 10) === dateStr));
      } catch {
        setTxs([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [dateStr, month, year]);

  const total = txs.reduce((s, t) => s + (t.type === 'expense' ? -t.amount : t.amount), 0);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxHeight: '75vh' }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{label}</div>
            {!loading && txs.length > 0 && (
              <div style={{ fontSize: 12, color: total >= 0 ? 'var(--income)' : 'var(--expense)', marginTop: 2, fontWeight: 700 }}>
                {total >= 0 ? '+' : ''}{formatAmount(Math.abs(total))}
              </div>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <Loader />
        ) : txs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div style={{ fontWeight: 600 }}>{t(lang, 'no_tx_day')}</div>
          </div>
        ) : (
          <div style={{ overflowY: 'auto' }}>
            {txs.map((tx) => (
              <TransactionCard key={tx._id} transaction={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Основная страница ────────────────────────────────────────────────────────
const Analytics = () => {
  const now = dayjs();
  const { ready, lang } = useAuth();
  const monthNames = lang === 'uz' ? MONTH_NAMES_UZ : MONTH_NAMES_RU;
  const weekdays   = lang === 'uz' ? WEEKDAYS_UZ : WEEKDAYS_RU;
  const [month, setMonth]         = useState(now.month() + 1);
  const [year, setYear]           = useState(now.year());
  const [activeTab, setActiveTab] = useState('expense');
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [dayModal, setDayModal]   = useState(null); // number | null

  useEffect(() => {
    if (!ready) return;
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const { data: res } = await api.get('/api/analytics', {
          params: { month, year, type: activeTab },
        });
        setData(res);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [month, year, activeTab, ready]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const daysInMonth  = dayjs(`${year}-${month}-01`).daysInMonth();
  const firstDay     = dayjs(`${year}-${month}-01`).day();
  const startOffset  = (firstDay + 6) % 7;
  const daysWithTx   = new Set((data?.byDay || []).map((d) => parseInt(d.date.split('-')[2])));
  const maxDayAmount = Math.max(...(data?.byDay || []).map((d) => d.amount), 1);
  const tabColor     = activeTab === 'expense' ? 'var(--expense)' : activeTab === 'income' ? 'var(--income)' : 'var(--transfer)';
  const tabBg        = activeTab === 'expense' ? 'rgba(255,63,127,0.35)' : activeTab === 'income' ? 'rgba(0,230,118,0.35)' : 'rgba(255,196,0,0.35)';

  return (
    <div>
      <div className="page-header">📊 {t(lang, 'nav_analytics')}</div>

      <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 18, letterSpacing: 1, marginBottom: 14 }}>
        {monthNames[month - 1]}, {year} {t(lang, 'year_label')}
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Переключатель */}
        <div className="tab-switcher" style={{ marginBottom: 14 }}>
          <button className={`tab${activeTab === 'expense'  ? ' active' : ''}`} onClick={() => setActiveTab('expense')}>{t(lang, 'expenses')}</button>
          <button className={`tab${activeTab === 'income'   ? ' active' : ''}`} onClick={() => setActiveTab('income')}>{t(lang, 'incomes')}</button>
          <button className={`tab${activeTab === 'transfer' ? ' active' : ''}`} onClick={() => setActiveTab('transfer')}>{t(lang, 'transfer')}</button>
        </div>

        {/* Навигация месяца */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'var(--white)', fontSize: 22, cursor: 'pointer', padding: '0 8px' }}>‹</button>
          <span style={{ fontWeight: 800, letterSpacing: 1 }}>{monthNames[month - 1]}</span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'var(--white)', fontSize: 22, cursor: 'pointer', padding: '0 8px' }}>›</button>
        </div>

        {loading ? <Loader /> : (
          <>
            {/* Итог */}
            {data?.total > 0 && (
              <div className="card" style={{ textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>
                  {activeTab === 'expense' ? t(lang, 'total_expenses') : activeTab === 'income' ? t(lang, 'total_incomes') : t(lang, 'transfer')}
                </div>
                <div className="amount-large" style={{ color: tabColor }}>
                  {formatAmount(data.total)}
                </div>
              </div>
            )}

            {/* Календарь */}
            <div className="card" style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: 0.5 }}>
                {t(lang, 'calendar')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
                {weekdays.map((d) => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {Array.from({ length: startOffset }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day     = i + 1;
                  const hasTx   = daysWithTx.has(day);
                  const isToday = day === now.date() && month === now.month() + 1 && year === now.year();
                  return (
                    <div
                      key={day}
                      onClick={() => setDayModal(day)}
                      style={{
                        textAlign: 'center',
                        padding: '6px 2px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: hasTx ? 700 : 400,
                        cursor: 'pointer',
                        background: isToday
                          ? 'var(--primary)'
                          : hasTx ? tabBg : 'transparent',
                        color: hasTx || isToday ? 'var(--white)' : 'var(--text-muted)',
                        transition: 'background 0.15s, transform 0.1s',
                      }}
                      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.88)'}
                      onMouseUp={(e)   => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {day}
                      {hasTx && <div style={{ width: 4, height: 4, borderRadius: '50%', background: tabColor, margin: '1px auto 0' }} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* По категориям */}
            {data?.byCategory?.length > 0 && (
              <div className="card" style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: 0.5 }}>{t(lang, 'by_category')}</div>
                {data.byCategory.map(({ category, amount, percent }) => {
                  const { emoji, color } = getCategoryInfo(category);
                  return (
                    <div key={category} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13 }}>{emoji} {category}</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>
                          {formatAmount(amount)} <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({percent}%)</span>
                        </span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 4 }}>
                        <div style={{ height: '100%', width: `${percent}%`, background: color, borderRadius: 4, transition: 'width 0.4s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Динамика */}
            <div className="card" style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: 0.5 }}>
                {t(lang, 'dynamics')} {activeTab === 'expense' ? t(lang, 'expenses') : activeTab === 'income' ? t(lang, 'incomes') : t(lang, 'transfer')} {t(lang, 'by_users')}
              </div>
              {data?.byDay?.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
                  {data.byDay.map(({ date, amount }) => {
                    const barH = Math.round((amount / maxDayAmount) * 70);
                    const day  = parseInt(date.split('-')[2]);
                    return (
                      <div key={date} onClick={() => setDayModal(day)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
                        <div style={{ width: '100%', height: Math.max(barH, 2), background: tabColor, borderRadius: '3px 3px 0 0', opacity: 0.85 }} />
                        <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>{day}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>{t(lang, 'no_data')}</div>
              )}
            </div>

            {!data?.total && (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <div style={{ fontWeight: 600 }}>{t(lang, 'no_data')}</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Модал дня */}
      {dayModal && (
        <DayModal
          day={dayModal}
          month={month}
          year={year}
          lang={lang}
          onClose={() => setDayModal(null)}
        />
      )}
    </div>
  );
};

export default Analytics;
