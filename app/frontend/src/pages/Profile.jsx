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

const Profile = () => {
  const { user, updateUser, lang, changeLang } = useAuth();
  const [profile, setProfile]       = useState(null);
  const [stats, setStats]           = useState({ transactions: 0, days: 0 });
  const [loading, setLoading]       = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showReview, setShowReview]     = useState(false);
  const [hasReview, setHasReview]       = useState(() => localStorage.getItem('hasReview') === '1');
  const [langSaving, setLangSaving] = useState(false);
  const [toast, setToast]           = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/user/profile');
        setProfile(data.user);
        setStats(data.stats || { transactions: 0, days: 0 });
      } catch (err) {
        console.error('[PROFILE]', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
          }}>
            <svg width="46" height="46" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
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
