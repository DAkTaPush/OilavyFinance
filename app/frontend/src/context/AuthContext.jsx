import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import api, { setTokenGetter } from '../api/axios';

const AuthContext = createContext(null);

const MOCK_INIT_DATA = 'user=%7B%22id%22%3A123456%2C%22first_name%22%3A%22Test%22%7D';

export const AuthProvider = ({ children }) => {
  const [token, setToken]   = useState(null);
  const [user, setUser]     = useState(null);
  const [ready, setReady]   = useState(false);
  const [lang, setLang]     = useState(() => localStorage.getItem('lang') || 'ru');
  const tokenRef            = useRef(null);

  // Wire axios so every request gets the latest token
  useEffect(() => {
    setTokenGetter(() => tokenRef.current);
  }, []);

  const login = useCallback(async (initData) => {
    const { data } = await api.post('/api/auth', { initData });
    tokenRef.current = data.token;
    setToken(data.token);
    setUser(data.user);
    if (data.user?.language) {
      setLang(data.user.language);
      localStorage.setItem('lang', data.user.language);
    }
    return data;
  }, []);

  const changeLang = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    setUser((prev) => prev ? { ...prev, language: newLang } : prev);
  }, []);

  const logout = useCallback(() => {
    tokenRef.current = null;
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  // Auto-login on mount
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
    const initData = tg?.initData || MOCK_INIT_DATA;
    login(initData)
      .catch((e) => console.warn('[AUTH]', e.message))
      .finally(() => setReady(true));
  }, [login]);

  return (
    <AuthContext.Provider value={{ token, user, ready, lang, login, logout, updateUser, changeLang }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider');
  return ctx;
};

export default AuthContext;
