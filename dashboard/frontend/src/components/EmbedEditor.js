import React, { useState } from 'react';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const PLACEHOLDER_HINT = ['$', '{placeholders}'].join('');

/* ─── Collapsible Section Container ─── */
function Section({ title, icon, color = '#FFD700', defaultOpen = false, badge, rightAction, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: '#202225', borderRadius: '8px', marginBottom: '10px',
      border: `1px solid ${open ? color + '44' : '#2d2f34'}`,
      transition: 'border-color 0.2s ease'
    }}>
      <div onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', cursor: 'pointer', userSelect: 'none',
        borderRadius: open ? '8px 8px 0 0' : '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color, fontSize: '12px', transition: 'transform 0.2s' }}>
            {open ? <FaChevronDown /> : <FaChevronRight />}
          </span>
          <span style={{ fontSize: '16px' }}>{icon}</span>
          <span style={{ color, fontSize: '13px', fontWeight: '600' }}>{title}</span>
          {badge !== undefined && (
            <span style={{
              background: `${color}22`, color, fontSize: '11px', padding: '1px 7px',
              borderRadius: '10px', fontWeight: '600'
            }}>{badge}</span>
          )}
        </div>
        {rightAction && <div onClick={e => e.stopPropagation()}>{rightAction}</div>}
      </div>
      {open && (
        <div style={{ padding: '0 14px 14px 14px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Styles ─── */
const labelStyle = { color: '#b9bbbe', fontSize: '12px', marginBottom: '4px', display: 'block' };
const inputStyle = {
  width: '100%', padding: '10px 12px', background: '#2C2F33', border: '1px solid #40444b',
  borderRadius: '6px', color: '#dcddde', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
};
const rowStyle = { display: 'flex', gap: '10px', marginBottom: '10px' };
const smallBtnStyle = (color = '#7289da') => ({
  padding: '4px 10px', background: `${color}22`, border: `1px solid ${color}55`,
  borderRadius: '4px', color, cursor: 'pointer', fontSize: '12px',
  display: 'flex', alignItems: 'center', gap: '4px'
});

/* ─── Main Editor ─── */
function EmbedEditor({ data, onChange, showPreview = true }) {
  const set = (key, val) => onChange({ ...data, [key]: val });
  const fields = data.fields || [];

  const setField = (idx, key, val) => {
    const f = [...fields];
    f[idx] = { ...f[idx], [key]: val };
    set('fields', f);
  };
  const addField = () => set('fields', [...fields, { name: '', value: '', inline: false }]);
  const removeField = (i) => set('fields', fields.filter((_, idx) => idx !== i));
  const moveField = (i, dir) => {
    const f = [...fields]; const j = i + dir;
    if (j < 0 || j >= f.length) return;
    [f[i], f[j]] = [f[j], f[i]];
    set('fields', f);
  };

  const colorVal = data.color || '#00b894';
  const hasContent = !!(data.title || data.text || data.image || data.authorName || data.footerText || fields.length);

  return (
    <div>
      {/* Basic — Title + URL + Color */}
      <Section title="Basic" icon="📝" color="#7289da" defaultOpen={true}>
        <div style={{ marginBottom: '10px' }}>
          <label style={labelStyle}>Embed Title</label>
          <input style={inputStyle} value={data.title || ''} onChange={e => set('title', e.target.value)} placeholder="Enter embed title" />
        </div>
        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Title URL</label>
            <input style={inputStyle} value={data.url || ''} onChange={e => set('url', e.target.value)} placeholder="https://example.com" />
          </div>
          <div style={{ width: '160px' }}>
            <label style={labelStyle}>Color</label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input style={{ ...inputStyle, flex: 1 }} value={data.color || ''} onChange={e => set('color', e.target.value)} placeholder="#00b894" />
              <input type="color" value={colorVal} onChange={e => set('color', e.target.value)}
                style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
            </div>
          </div>
        </div>
      </Section>

      {/* Description */}
      <Section title="Description" icon="📄" color="#43b581" defaultOpen={!!data.text}>
        <textarea style={{ ...inputStyle, minHeight: '140px', resize: 'vertical', fontFamily: 'monospace', lineHeight: '1.5' }}
          value={data.text || ''} onChange={e => set('text', e.target.value)}
          placeholder={`Embed description text... Supports Discord markdown and ${PLACEHOLDER_HINT}.`} rows={7} />
      </Section>

      {/* Author */}
      <Section title="Author" icon="👤" color="#faa61a" defaultOpen={!!data.authorName}>
        <div style={{ marginBottom: '10px' }}>
          <label style={labelStyle}>Author Name</label>
          <input style={inputStyle} value={data.authorName || ''} onChange={e => set('authorName', e.target.value)} placeholder="Author name" />
        </div>
        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Author Icon URL</label>
            <input style={inputStyle} value={data.authorIcon || ''} onChange={e => set('authorIcon', e.target.value)} placeholder="https://..." />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Author URL</label>
            <input style={inputStyle} value={data.authorUrl || ''} onChange={e => set('authorUrl', e.target.value)} placeholder="https://..." />
          </div>
        </div>
      </Section>

      {/* Images */}
      <Section title="Images" icon="🖼️" color="#e91e63" defaultOpen={!!(data.image || data.thumbnail)}>
        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Main Image URL</label>
            <input style={inputStyle} value={data.image || ''} onChange={e => set('image', e.target.value)} placeholder="https://..." />
            {data.image && (
              <div style={{ marginTop: '8px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #40444b' }}>
                <img src={data.image} alt="" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', display: 'block' }}
                  onError={e => e.target.style.display = 'none'} />
              </div>
            )}
          </div>
          <div style={{ width: '180px' }}>
            <label style={labelStyle}>Thumbnail URL</label>
            <input style={inputStyle} value={data.thumbnail || ''} onChange={e => set('thumbnail', e.target.value)} placeholder="https://..." />
            {data.thumbnail && (
              <div style={{ marginTop: '8px' }}>
                <img src={data.thumbnail} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #40444b' }}
                  onError={e => e.target.style.display = 'none'} />
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Fields */}
      <Section title="Fields" icon="📋" color="#9b59b6" defaultOpen={fields.length > 0}
        badge={fields.length > 0 ? fields.length : undefined}
        rightAction={fields.length < 25 ? (
          <button type="button" onClick={addField} style={smallBtnStyle('#43b581')}><FaPlus /> Add</button>
        ) : null}
      >
        {fields.length === 0 && (
          <p style={{ color: '#72767d', fontSize: '12px', textAlign: 'center', padding: '6px 0', margin: 0 }}>No fields. Click "Add" to create one.</p>
        )}
        {fields.map((field, i) => (
          <div key={i} style={{ background: '#2C2F33', borderRadius: '6px', padding: '10px', marginBottom: '8px', border: '1px solid #40444b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#9b59b6', fontSize: '12px', fontWeight: '600' }}>Field {i + 1}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button type="button" onClick={() => moveField(i, -1)} style={smallBtnStyle('#7289da')} disabled={i === 0}><FaArrowUp /></button>
                <button type="button" onClick={() => moveField(i, 1)} style={smallBtnStyle('#7289da')} disabled={i === fields.length - 1}><FaArrowDown /></button>
                <button type="button" onClick={() => removeField(i)} style={smallBtnStyle('#f04747')}><FaTrash /></button>
              </div>
            </div>
            <div style={rowStyle}>
              <div style={{ flex: 1 }}>
                <input style={inputStyle} value={field.name || ''} onChange={e => setField(i, 'name', e.target.value)} placeholder="Field name" />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b9bbbe', fontSize: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!field.inline} onChange={e => setField(i, 'inline', e.target.checked)} /> Inline
              </label>
            </div>
            <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', fontSize: '12px' }}
              value={field.value || ''} onChange={e => setField(i, 'value', e.target.value)} placeholder="Field value" rows={2} />
          </div>
        ))}
      </Section>

      {/* Footer + Timestamp */}
      <Section title="Footer & Timestamp" icon="🦶" color="#1abc9c" defaultOpen={!!(data.footerText || data.timestamp)}>
        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Footer Text</label>
            <input style={inputStyle} value={data.footerText || ''} onChange={e => set('footerText', e.target.value)} placeholder="Footer text" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Footer Icon URL</label>
            <input style={inputStyle} value={data.footerIcon || ''} onChange={e => set('footerIcon', e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Timestamp</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input style={{ ...inputStyle, flex: 1 }} value={data.timestamp || ''} onChange={e => set('timestamp', e.target.value)} placeholder="auto / ISO date / leave empty" />
            <button type="button" onClick={() => set('timestamp', 'auto')} style={smallBtnStyle('#1abc9c')}>Auto</button>
            <button type="button" onClick={() => set('timestamp', new Date().toISOString())} style={smallBtnStyle('#faa61a')}>Now</button>
            {data.timestamp && <button type="button" onClick={() => set('timestamp', '')} style={smallBtnStyle('#f04747')}>Clear</button>}
          </div>
        </div>
      </Section>

      {showPreview && (
        <Section title="Live Preview" icon="👁️" color="#dcddde" defaultOpen={hasContent}>
          <div style={{ borderLeft: `4px solid ${colorVal}`, borderRadius: '0 4px 4px 0' }}>
            <EmbedPreview data={data} color={colorVal} />
          </div>
        </Section>
      )}
    </div>
  );
}

/* ─── Discord-style Preview ─── */
function EmbedPreview({ data, color }) {
  const hasAuthor = data.authorName && data.authorName.trim();
  const hasFooter = data.footerText && data.footerText.trim();
  const previewFields = (data.fields || []).filter(f => f.name?.trim() && f.value?.trim());

  return (
    <div style={{ background: '#2f3136', borderRadius: '4px', padding: '12px 16px', borderLeft: `4px solid ${color}`, maxWidth: '640px' }}>
      {hasAuthor && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          {data.authorIcon && <img src={data.authorIcon} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />}
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>{data.authorName}</span>
        </div>
      )}
      {data.title && <div style={{ color: data.url ? '#00aff4' : '#fff', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>{data.title}</div>}
      {data.text && <div style={{ color: '#dcddde', fontSize: '13px', marginBottom: '8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{data.text.substring(0, 300)}{data.text.length > 300 ? '...' : ''}</div>}
      {previewFields.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
          {previewFields.map((f, i) => (
            <div key={i} style={{ gridColumn: f.inline ? 'span 1' : 'span 3' }}>
              <div style={{ color: '#fff', fontSize: '12px', fontWeight: '600', marginBottom: '2px' }}>{f.name}</div>
              <div style={{ color: '#dcddde', fontSize: '12px', whiteSpace: 'pre-wrap' }}>{f.value.substring(0, 200)}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          {data.image && <img src={data.image} alt="" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} onError={e => e.target.style.display = 'none'} />}
        </div>
        {data.thumbnail && <img src={data.thumbnail} alt="" style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />}
      </div>
      {(hasFooter || data.timestamp) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
          {data.footerIcon && hasFooter && <img src={data.footerIcon} alt="" style={{ width: '16px', height: '16px', borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />}
          {hasFooter && <span style={{ color: '#72767d', fontSize: '11px' }}>{data.footerText}</span>}
          {hasFooter && data.timestamp && <span style={{ color: '#72767d', fontSize: '11px' }}>•</span>}
          {data.timestamp && <span style={{ color: '#72767d', fontSize: '11px' }}>{data.timestamp === 'auto' ? 'Today at 12:00 PM' : new Date(data.timestamp).toLocaleString()}</span>}
        </div>
      )}
      {!data.title && !data.text && previewFields.length === 0 && !data.image && !hasAuthor && (
        <p style={{ color: '#72767d', fontSize: '12px', fontStyle: 'italic', margin: 0 }}>Empty embed — add content above</p>
      )}
    </div>
  );
}

export default EmbedEditor;
