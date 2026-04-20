import { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ options, value, onChange, placeholder }) => {
  const [open, setOpen]   = useState(false);
  const ref               = useRef(null);
  const selected          = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: 0 }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          width: '100%',
          background: 'rgba(140,0,255,0.18)',
          border: `1px solid ${open ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 12,
          padding: '13px 16px',
          color: selected ? 'var(--white)' : 'var(--text-muted)',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          textAlign: 'left',
          transition: 'border-color 0.15s',
        }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <span style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
          flexShrink: 0,
        }}>▼</span>
      </button>

      {/* Dropdown list */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: '#2d0466',
          border: '1px solid var(--border)',
          borderRadius: 12,
          zIndex: 500,
          maxHeight: 240,
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.15s ease',
        }}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                width: '100%',
                background: opt.value === value ? 'rgba(140,0,255,0.4)' : 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(140,0,255,0.15)',
                padding: '12px 16px',
                color: opt.value === value ? 'var(--white)' : 'rgba(255,255,255,0.85)',
                fontSize: 14,
                fontWeight: opt.value === value ? 700 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { if (opt.value !== value) e.currentTarget.style.background = 'rgba(140,0,255,0.2)'; }}
              onMouseLeave={(e) => { if (opt.value !== value) e.currentTarget.style.background = 'transparent'; }}
            >
              {opt.value === value && <span style={{ color: 'var(--primary-light)', fontSize: 12 }}>✓</span>}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
