import { useEffect } from 'react';

export const useTelegram = () => {
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  return {
    tg,
    user: tg?.initDataUnsafe?.user || null,
    initData: tg?.initData || '',
    isReady: Boolean(tg),
  };
};
