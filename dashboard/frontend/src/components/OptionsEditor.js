import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

const OPTION_TYPES = [
  { value: 'string', label: 'Text', icon: '📝' },
  { value: 'user', label: 'User', icon: '👤' },
  { value: 'role', label: 'Role', icon: '🎭' },
  { value: 'channel', label: 'Channel', icon: '#️⃣' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'boolean', label: 'True/False', icon: '✅' },
];

const OPTION_PLACEHOLDER = ['$', '{optionName}'].join('');
const OPTION_MENTION_PLACEHOLDER = ['$', '{optionName.mention}'].join('');

const inputStyle = {
  width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)',
  borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
};
const sectionStyle = {
  background: 'var(--bg-tertiary)', borderRadius: '12px', padding: '18px',
  marginBottom: '16px', border: '1px solid var(--border-secondary)'
};

function OptionsEditor({ options = [], onChange }) {
  const setOpt = (i, key, val) => {
    const o = [...options];
    o[i] = { ...o[i], [key]: val };
    onChange(o);
  };
  const add = () => onChange([...options, { name: '', description: '', type: 'string', required: false }]);
  const remove = (i) => onChange(options.filter((_, idx) => idx !== i));

  return (
    <div style={sectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ color: 'var(--primary)', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚡ Command Options ({options.length})
        </span>
        {options.length < 25 && (
          <button type="button" onClick={add} className="badge badge-primary" style={{
            cursor: 'pointer', fontSize: '12px', border: 'none', padding: '6px 12px',
            display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600'
          }}><FaPlus /> Add Option</button>
        )}
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '0 0 14px 0', lineHeight: '1.6' }}>
        Add input options that users fill in when running the command. Use <code style={{ color: 'var(--primary)', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-secondary)' }}>{OPTION_PLACEHOLDER}</code> in your embed to insert their value.
        For user/role/channel, use <code style={{ color: 'var(--primary)', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-secondary)' }}>{OPTION_MENTION_PLACEHOLDER}</code> to tag them directly.
      </p>

      {options.length === 0 && (
        <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', textAlign: 'center', padding: '16px', margin: 0, background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--border-secondary)' }}>
          No options configured — command runs without arguments. Add a User or Role option if needed.
        </p>
      )}

      {options.map((opt, i) => (
        <div key={i} style={{
          background: 'var(--bg-secondary)', borderRadius: '10px', padding: '14px',
          marginBottom: '10px', border: '1px solid var(--border-secondary)'
        }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Type */}
            <select value={opt.type || 'string'} onChange={e => setOpt(i, 'type', e.target.value)}
              style={{ ...inputStyle, width: '150px', cursor: 'pointer', flex: '0 0 150px' }}>
              {OPTION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
            {/* Name */}
            <input style={{ ...inputStyle, flex: '1 1 220px', minWidth: '180px', fontFamily: 'monospace' }}
              value={opt.name || ''} placeholder="option-name"
              onChange={e => setOpt(i, 'name', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} />
            {/* Required toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '500' }}>
              <input type="checkbox" checked={!!opt.required} onChange={e => setOpt(i, 'required', e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
              Required
            </label>
            {/* Delete */}
            <button type="button" onClick={() => remove(i)} className="badge badge-danger" style={{
              cursor: 'pointer', padding: '6px 10px', fontSize: '12px', border: 'none'
            }}><FaTrash /></button>
          </div>
          {/* Description */}
          <input style={inputStyle} value={opt.description || ''} placeholder="Describe what this option is used for..."
            onChange={e => setOpt(i, 'description', e.target.value)} />
          {/* Usage hint */}
          {opt.name && (
            <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
              Usage syntax: <code style={{ color: 'var(--primary)', fontWeight: '600' }}>{`\${${opt.name}}`}</code>
              {['user', 'role', 'channel'].includes(opt.type) && (
                <> or <code style={{ color: 'var(--primary)', fontWeight: '600' }}>{`\${${opt.name}.mention}`}</code> for Discord mention formatting</>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default OptionsEditor;
