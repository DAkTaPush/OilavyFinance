import { useState, useEffect } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import ReviewModal from '../components/ReviewModal';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

const MenuCard = ({ icon, title, sub, onClick, href }) => {
  const inner = (
    <>
      <div className="menu-icon">{icon}</div>
      <div className="menu-text">
        <div className="menu-title">{title}</div>
        {sub && <div className="menu-sub">{sub}</div>}
      </div>
      <span className="menu-arrow">›</span>
    </>
  );

  if (href) {
    return (
      <a className="menu-card" href={href} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <button className="menu-card" onClick={onClick}>
      {inner}
    </button>
  );
};

const CardVisual = ({ card, onActivate, onDelete, lang }) => {
  const curLabel = card.currency === 'sum' ? t(lang, 'sum_label') : t(lang, 'rub_label');
  const masked = (() => {
    const clean = (card.cardNumber || '').replace(/\D/g, '');
    return clean.length >= 4 ? `**** **** **** ${clean.slice(-4)}` : card.cardNumber;
  })();

  return (
    <div style={{
      background: card.isActive
        ? 'linear-gradient(135deg, var(--primary) 0%, #6a00c9 100%)'
        : 'var(--bg-card)',
      borderRadius: 16,
      padding: '18px 20px',
      marginBottom: 10,
      position: 'relative',
      border: card.isActive ? '2px solid var(--primary)' : '2px solid transparent',
    }}>
      {card.isActive && (
        <div style={{ position: 'absolute', top: 10, right: 14, fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>
          ✅ {t(lang, 'card_active')}
        </div>
      )}
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginBottom: 10, fontWeight: 700 }}>
        💳 {masked}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 4 }}>
        {card.holderName}
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>
        {Number(card.balance).toLocaleString()} {curLabel}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        {!card.isActive && (
          <button
            onClick={() => onActivate(card._id)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 10, border: 'none',
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {t(lang, 'activate_card')}
          </button>
        )}
        <button
          onClick={() => onDelete(card._id)}
          style={{
            padding: '8px 16px', borderRadius: 10, border: 'none',
            background: 'rgba(255,80,80,0.25)', color: '#ff6b6b',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {t(lang, 'delete_card')}
        </button>
      </div>
    </div>
  );
};

const AddCardForm = ({ lang, onSaved, onCancel }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [balance, setBalance]       = useState('');
  const [currency, setCurrency]     = useState('sum');
  const [saving, setSaving]         = useState(false);

  const handleSave = async () => {
    if (!cardNumber.trim() || !holderName.trim() || balance === '') return;
    try {
      setSaving(true);
      const { data } = await api.post('/api/cards', {
        cardNumber: cardNumber.trim(),
        holderName: holderName.trim(),
        balance: Number(balance.replace(/\s/g, '')),
        currency,
      });
      onSaved(data.cards || []);
    } catch (err) {
      console.error('[ADD CARD]', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.5, marginBottom: 12, color: 'var(--white)' }}>
        💳 {t(lang, 'add_card')}
      </div>
      <input className="input" placeholder={t(lang, 'card_number')} value={cardNumber}
        onChange={e => setCardNumber(e.target.value)} style={{ marginBottom: 8 }} />
      <input className="input" placeholder={t(lang, 'card_holder')} value={holderName}
        onChange={e => setHolderName(e.target.value)} style={{ marginBottom: 8 }} />
      <input className="input" type="number" placeholder={t(lang, 'card_balance')} value={balance}
        onChange={e => setBalance(e.target.value)} style={{ marginBottom: 8 }} />
      <div className="tab-switcher" style={{ marginBottom: 12 }}>
        <button className={`tab${currency === 'sum' ? ' active' : ''}`} onClick={() => setCurrency('sum')}>🇺🇿 {t(lang, 'sum_label')}</button>
        <button className={`tab${currency === 'rub' ? ' active' : ''}`} onClick={() => setCurrency('rub')}>🇷🇺 {t(lang, 'rub_label')}</button>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
          {saving ? t(lang, 'card_saving') : t(lang, 'card_save')}
        </button>
        <button onClick={onCancel} style={{
          padding: '12px 16px', borderRadius: 12, border: 'none',
          background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700,
        }}>✕</button>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user, updateUser, lang, changeLang } = useAuth();
  const [profile, setProfile]       = useState(null);
  const [stats, setStats]           = useState({ transactions: 0, days: 0 });
  const [cards, setCards]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showCards, setShowCards]       = useState(false);
  const [showAddCard, setShowAddCard]   = useState(false);
  const [showReview, setShowReview]     = useState(false);
  const [hasReview, setHasReview]       = useState(() => localStorage.getItem('hasReview') === '1');
  const [langSaving, setLangSaving] = useState(false);
  const [toast, setToast]           = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [profileRes, cardsRes] = await Promise.all([
          api.get('/api/user/profile'),
          api.get('/api/cards'),
        ]);
        setProfile(profileRes.data.user);
        setStats(profileRes.data.stats || { transactions: 0, days: 0 });
        setCards(cardsRes.data.cards || []);
      } catch (err) {
        console.error('[PROFILE]', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleActivateCard = async (id) => {
    try {
      const { data } = await api.patch(`/api/cards/${id}/activate`);
      setCards(data.cards || []);
      showToast('✅');
    } catch (err) { console.error(err); }
  };

  const handleDeleteCard = async (id) => {
    try {
      const { data } = await api.delete(`/api/cards/${id}`);
      setCards(data.cards || []);
      showToast('🗑');
    } catch (err) { console.error(err); }
  };

  const handleLanguageChange = async (newLang) => {
    try {
      setLangSaving(true);
      await api.patch('/api/user/profile', { language: newLang });
      setProfile((p) => ({ ...p, language: newLang }));
      updateUser({ language: newLang });
      changeLang(newLang);
    } catch (err) {
      console.error('[PROFILE LANG]', err);
    } finally {
      setLangSaving(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  if (loading) return <><div className="page-header">👤 {t(lang, 'nav_profile')}</div><Loader /></>;

  const displayName  = profile?.firstName || user?.firstName || 'Пользователь';
  const avatarLetter = displayName[0]?.toUpperCase() || 'U';
  const photoUrl     = window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || null;

  return (
    <div>
      <div className="page-header">👤 {t(lang, 'nav_profile')}</div>

      <div style={{ padding: '0 14px' }}>
        {/* Аватар + имя */}
        <div style={{ textAlign: 'center', marginBottom: 20, paddingTop: 6 }}>
          <div style={{
            width: 90, height: 90, borderRadius: '50%',
            background: 'var(--bg-card)',
            border: '3px solid var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            overflow: 'hidden',
          }}>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: 38, fontWeight: 900, color: 'var(--white)' }}>
                {avatarLetter}
              </span>
            )}
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            {displayName}
          </div>
          {profile?.username && (
            <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>
              @{profile.username}
            </div>
          )}
        </div>

        {/* Метрики */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: '16px 10px' }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--white)' }}>
              {stats.transactions}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>
              {t(lang, 'transactions_count')}
            </div>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: '16px 10px' }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--white)' }}>
              {stats.days}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>
              {t(lang, 'days_count')}
            </div>
          </div>
        </div>

        {/* Карты */}
        <MenuCard
          icon="💳"
          title={t(lang, 'my_cards')}
          sub={cards.length ? `${cards.length}/5` : t(lang, 'no_cards')}
          onClick={() => { setShowCards(!showCards); setShowAddCard(false); }}
        />

        {showCards && (
          <div style={{ marginBottom: 8 }}>
            {cards.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '14px 0', fontSize: 13 }}>
                {t(lang, 'no_cards')}
              </div>
            )}
            {cards.map(card => (
              <CardVisual
                key={card._id}
                card={card}
                lang={lang}
                onActivate={handleActivateCard}
                onDelete={handleDeleteCard}
              />
            ))}
            {!showAddCard && cards.length < 5 && (
              <button
                onClick={() => setShowAddCard(true)}
                style={{
                  width: '100%', padding: '12px', borderRadius: 12, border: '2px dashed var(--primary)',
                  background: 'transparent', color: 'var(--primary)', fontWeight: 800, fontSize: 14,
                  cursor: 'pointer', marginBottom: 8,
                }}
              >
                {t(lang, 'add_card')}
              </button>
            )}
            {showAddCard && (
              <AddCardForm
                lang={lang}
                onSaved={(newCards) => { setCards(newCards); setShowAddCard(false); }}
                onCancel={() => setShowAddCard(false)}
              />
            )}
          </div>
        )}

        {/* Настройки */}
        <MenuCard
          icon="⚙️"
          title={t(lang, 'settings')}
          sub={t(lang, 'settings_sub')}
          onClick={() => setShowSettings(!showSettings)}
        />

        {showSettings && (
          <div className="card" style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {t(lang, 'lang_label')}
            </div>
            <div className="tab-switcher">
              <button className={`tab${lang === 'ru' ? ' active' : ''}`} onClick={() => handleLanguageChange('ru')} disabled={langSaving}>
                🇷🇺 Русский
              </button>
              <button className={`tab${lang === 'uz' ? ' active' : ''}`} onClick={() => handleLanguageChange('uz')} disabled={langSaving}>
                🇺🇿 O'zbek
              </button>
            </div>
          </div>
        )}

        <MenuCard
          icon="💬"
          title={t(lang, 'support')}
          sub={t(lang, 'support_sub')}
          href="https://t.me/OilavyFinanceBot"
        />

        <MenuCard
          icon="📝"
          title={hasReview ? (lang === 'uz' ? 'FIKRNI OZGARTIRISH' : 'ИЗМЕНИТЬ ОТЗЫВ И ОЦЕНКУ') : t(lang, 'leave_review')}
          onClick={() => setShowReview(true)}
        />

        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '20px 0 8px', fontWeight: 600, letterSpacing: 0.5 }}>
          OilavyFinance v1.0.0
        </div>
      </div>

      {showReview && (
        <ReviewModal
          lang={lang}
          onClose={() => setShowReview(false)}
          onSubmitted={() => setHasReview(true)}
        />
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--primary)', color: '#fff', padding: '10px 22px',
          borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 700,
          boxShadow: '0 4px 20px rgba(140,0,255,0.5)', zIndex: 300,
          animation: 'fadeIn 0.2s ease', whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
};

export default Profile;
