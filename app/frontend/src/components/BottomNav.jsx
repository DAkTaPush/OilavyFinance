import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

const icons = {
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  ),
  transaction: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.5 13l.02-.01L8.01 12H17c.75 0 1.41-.41 1.75-1.03l3.86-7.01L21 3h-.01l-1.27 2H5.21l-.94-2H1v2h2l3.6 7.59L5.25 15c-.16.28-.25.61-.25.95C5 17.1 5.9 18 7 18h13v-2H7.42c-.14 0-.25-.11-.25-.25z"/>
    </svg>
  ),
  analytics: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  ),
  profile: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
    </svg>
  ),
};

const BottomNav = () => {
  const { lang } = useAuth();

  const tabs = [
    { path: '/',            icon: icons.home,        key: 'nav_home'        },
    { path: '/transaction', icon: icons.transaction,  key: 'nav_transaction'  },
    { path: '/analytics',   icon: icons.analytics,   key: 'nav_analytics'    },
    { path: '/profile',     icon: icons.profile,     key: 'nav_profile'      },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(({ path, icon, key }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{icon}</span>
          <span>{t(lang, key)}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
