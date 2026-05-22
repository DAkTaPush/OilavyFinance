import { useState } from 'react';
import dayjs from 'dayjs';
import api from '../api/axios';
import { EXPENSE_TREE, INCOME_TREE, TRANSFER_TREE } from '../utils/format';
import CustomSelect from './CustomSelect';

const TYPE_LABELS  = { expense: 'Расход', income: 'Доход', transfer: 'Перевод' };
const TREE_BY_TYPE = { expense: EXPENSE_TREE, income: INCOME_TREE, transfer: TRANSFER_TREE };

const defaultParent = (type) => Object.keys(TREE_BY_TYPE[type])[0];
const defaultSub    = (type, parent) => TREE_BY_TYPE[type][parent]?.subs[0] || '';
const buildCategory = (parent, sub) => (sub ? `${parent} / ${sub}` : parent);

const initForm = (type = 'expense') => {
  const parent = defaultParent(type);
  return { type, amount: '', parent, sub: defaultSub(type, parent), description: '', date: dayjs().format('YYYY-MM-DD') };
};

const AddTransactionModal = ({ initialType = 'expense', onClose, onSaved }) => {
  const [form, setForm]     = useState(initForm(initialType));
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const tree    = TREE_BY_TYPE[form.type];
  const parents = Object.keys(tree);
  const subs    = tree[form.parent]?.subs || [];

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleTypeChange = (type) => setForm(initForm(type));
  const handleParentChange = (parent) => {
    setForm((p) => ({
      ...p,
      parent,
      sub: TREE_BY_TYPE[p.type][parent]?.subs[0] || '',
      description: parent === 'Своё' ? p.description : '',
    }));
  };

  const handleSave = async () => {
    if (!form.amount || Number(form.amount) <= 0) { setError('Введите сумму'); return; }
    if (form.parent === 'Своё' && !form.description.trim()) { setError('Введите название транзакции'); return; }
    try {
      setError('');
      setSaving(true);
      await api.post('/api/transactions', {
        type: form.type, amount: Number(form.amount),
        category: buildCategory(form.parent, form.sub),
        description: form.description, date: form.date,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      animation: 'slideInRight 0.22s cubic-bezier(0.32,0.72,0,1)',
    }}>
      {/* Шапка */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #6600cc 100%)',
        padding: '20px 16px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: 'none',
            color: '#fff', fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ✕
        </button>
        <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.5 }}>
          Добавить транзакцию
        </span>
      </div>

      {/* Тело */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        {/* Тип */}
        <div className="tab-switcher" style={{ marginBottom: 20 }}>
          {['expense', 'income', 'transfer'].map((t) => (
            <button key={t} className={`tab${form.type === t ? ' active' : ''}`} onClick={() => handleTypeChange(t)}>
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Сумма */}
        <div style={{ marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Сумма</div>
        <input
          className="input"
          type="number" inputMode="decimal"
          placeholder="0"
          value={form.amount}
          onChange={(e) => set('amount', e.target.value)}
          autoFocus
          style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, textAlign: 'left' }}
        />

        {/* Категория */}
        <div style={{ marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Категория</div>
        <div style={{ marginBottom: subs.length ? 10 : 16 }}>
          <CustomSelect
            options={parents.map((p) => ({ value: p, label: `${tree[p].emoji} ${p}` }))}
            value={form.parent}
            onChange={handleParentChange}
          />
        </div>
        {subs.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <CustomSelect
              options={subs.map((s) => ({ value: s, label: s }))}
              value={form.sub}
              onChange={(v) => set('sub', v)}
            />
          </div>
        )}

        {/* Название транзакции — только для категории "Своё" */}
        {form.parent === 'Своё' && (
          <>
            <div style={{ marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Название транзакции</div>
            <input
              className="input"
              placeholder="Например: коммуналка"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              style={{ marginBottom: 16 }}
              autoFocus
            />
          </>
        )}

        {/* Дата */}
        <div style={{ marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Дата</div>
        <input className="input" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} style={{ marginBottom: 24 }} />

        {error && (
          <div style={{ color: 'var(--expense)', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</div>
        )}
      </div>

      {/* Кнопка */}
      <div style={{ padding: '12px 16px 28px', flexShrink: 0 }}>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ fontSize: 16 }}>
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
};

export default AddTransactionModal;
