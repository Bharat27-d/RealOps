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
  width: '100%', padding: '9px 11px', background: '#2C2F33', border: '1px solid #40444b',
  borderRadius: '6px', color: '#dcddde', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
};
const sectionStyle = {
  background: '#202225', borderRadius: '8px', padding: '16px',
  marginBottom: '15px', border: '1px solid #2d2f34'
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
        <span style={{ color: '#e67e22', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚡ Command Options ({options.length})
        </span>
        {options.length < 25 && (
          <button type="button" onClick={add} style={{
            padding: '4px 10px', background: 'rgba(67,181,129,0.15)', border: '1px solid rgba(67,181,129,0.4)',
            borderRadius: '4px', color: '#43b581', cursor: 'pointer', fontSize: '12px',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}><FaPlus /> Add Option</button>
        )}
      </div>

      <p style={{ color: '#72767d', fontSize: '11px', margin: '0 0 10px 0', lineHeight: '1.5' }}>
        Add input options that users fill in when running the command. Use <code style={{ color: '#e67e22', background: '#2C2F33', padding: '1px 4px', borderRadius: '3px' }}>{OPTION_PLACEHOLDER}</code> in your embed to insert their value.
        For user/role/channel, use <code style={{ color: '#e67e22', background: '#2C2F33', padding: '1px 4px', borderRadius: '3px' }}>{OPTION_MENTION_PLACEHOLDER}</code> to tag them.
      </p>

      {options.length === 0 && (
        <p style={{ color: '#72767d', fontSize: '12px', textAlign: 'center', padding: '8px', margin: 0 }}>
          No options — command runs without inputs. Add a User option to tag someone.
        </p>
      )}

      {options.map((opt, i) => (
        <div key={i} style={{
          background: '#2C2F33', borderRadius: '6px', padding: '10px',
          marginBottom: '8px', border: '1px solid #40444b'
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b9bbbe', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={!!opt.required} onChange={e => setOpt(i, 'required', e.target.checked)} />
              Required
            </label>
            {/* Delete */}
            <button type="button" onClick={() => remove(i)} style={{
              background: 'rgba(240,71,71,0.15)', border: '1px solid rgba(240,71,71,0.4)',
              borderRadius: '4px', color: '#f04747', cursor: 'pointer', padding: '4px 6px', fontSize: '12px'
            }}><FaTrash /></button>
          </div>
          {/* Description */}
          <input style={inputStyle} value={opt.description || ''} placeholder="What this option is for..."
            onChange={e => setOpt(i, 'description', e.target.value)} />
          {/* Usage hint */}
          {opt.name && (
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#72767d' }}>
              Use: <code style={{ color: '#e67e22' }}>${`\${${opt.name}}`}</code>
              {['user', 'role', 'channel'].includes(opt.type) && (
                <> or <code style={{ color: '#e67e22' }}>${`\${${opt.name}.mention}`}</code> to tag</>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default OptionsEditor;
