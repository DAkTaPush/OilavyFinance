import { useState } from 'react';
import { t } from '../i18n';

const STAR_COLORS = {
  1: { hover: '#a23c3c', checked: '#ef4444' },
  2: { hover: '#99542d', checked: '#e06c2b' },
  3: { hover: '#9f7e18', checked: '#eab308' },
  4: { hover: '#22885e', checked: '#19c37d' },
  5: { hover: '#7951ac', checked: '#ab68ff' },
};

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
    <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/>
  </svg>
);

const MAX_WORDS = 100;

const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;

const ReviewModal = ({ lang = 'ru', onClose, onSubmitted }) => {
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText]       = useState('');
  const [sent, setSent]       = useState(false);

  const wordCount = text.trim() ? countWords(text) : 0;
  const wordsLeft = MAX_WORDS - wordCount;

  const handleText = (e) => {
    const val = e.target.value;
    if (countWords(val) <= MAX_WORDS) setText(val);
  };

  const handleSubmit = () => {
    if (!rating) return;
    setSent(true);
    localStorage.setItem('hasReview', '1');
    onSubmitted?.();
    setTimeout(onClose, 1800);
  };

  const active = hovered || rating;

  const starColor = (n) => {
    if (active >= n) {
      return hovered
        ? STAR_COLORS[hovered]?.hover || '#ff9e0b'
        : STAR_COLORS[rating]?.checked || '#ffa723';
    }
    return '#555';
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            {lang === 'uz' ? 'Fikr va baho' : 'Отзыв и оценка'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              {lang === 'uz' ? 'Rahmat!' : 'Спасибо!'}
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 13 }}>
              {lang === 'uz' ? 'Fikringiz qabul qilindi' : 'Ваш отзыв принят'}
            </div>
          </div>
        ) : (
          <>
            {/* Звёзды */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, fontWeight: 600 }}>
                {lang === 'uz' ? 'Baholang:' : 'Ваша оценка:'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexDirection: 'row-reverse' }}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 4, fontSize: 38,
                      transition: 'transform 0.15s',
                      transform: active >= n ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    <span style={{
                      display: 'block',
                      width: 38, height: 38,
                      fill: starColor(n),
                      transition: 'fill 0.25s ease',
                      color: starColor(n),
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"
                        style={{ fill: starColor(n), width: 38, height: 38, transition: 'fill 0.25s ease' }}>
                        <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/>
                      </svg>
                    </span>
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: STAR_COLORS[rating]?.checked }}>
                  {['', '😞 Плохо', '😐 Нормально', '🙂 Хорошо', '😊 Отлично', '🤩 Супер!'][rating]}
                </div>
              )}
            </div>

            {/* Текст отзыва */}
            <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {lang === 'uz' ? 'Izoh (ixtiyoriy)' : 'Напишите отзыв (необязательно)'}
            </div>
            <textarea
              className="input"
              rows={4}
              placeholder={lang === 'uz' ? 'Fikringizni yozing...' : 'Ваши впечатления...'}
              value={text}
              onChange={handleText}
              style={{ resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, marginBottom: 6 }}
            />
            <div style={{ fontSize: 11, color: wordsLeft < 10 ? 'var(--expense)' : 'var(--text-muted)', textAlign: 'right', marginBottom: 20 }}>
              {lang === 'uz' ? `Qoldi: ${wordsLeft} so'z` : `Осталось: ${wordsLeft} слов`}
            </div>

            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!rating}
              style={{ opacity: rating ? 1 : 0.45 }}
            >
              {lang === 'uz' ? 'Yuborish' : 'Отправить'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
