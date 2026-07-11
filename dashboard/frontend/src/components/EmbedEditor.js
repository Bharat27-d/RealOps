import React, { useState } from 'react';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const PLACEHOLDER_HINT = ['$', '{placeholders}'].join('');

/* ─── Collapsible Section Container ─── */
function Section({ title, icon, color = 'var(--primary)', defaultOpen = false, badge, rightAction, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: 'var(--bg-tertiary)', borderRadius: '12px', marginBottom: '12px',
      border: `1px solid ${open ? 'var(--border-focus)' : 'var(--border-secondary)'}`,
      transition: 'all var(--transition-fast)'
    }}>
      <div onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', cursor: 'pointer', userSelect: 'none',
        borderRadius: open ? '12px 12px 0 0' : '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color, fontSize: '12px', transition: 'transform var(--transition-fast)' }}>
            {open ? <FaChevronDown /> : <FaChevronRight />}
          </span>
          <span style={{ fontSize: '16px' }}>{icon}</span>
          <span style={{ color, fontSize: '14px', fontWeight: '700' }}>{title}</span>
          {badge !== undefined && (
            <span style={{
              background: 'var(--primary-subtle)', color: 'var(--primary)', fontSize: '11px', padding: '2px 8px',
              borderRadius: '12px', fontWeight: '700'
            }}>{badge}</span>
          )}
        </div>
        {rightAction && <div onClick={e => e.stopPropagation()}>{rightAction}</div>}
      </div>
      {open && (
        <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid var(--border-secondary)', paddingTop: '16px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Styles ─── */
const labelStyle = { color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px', display: 'block', fontWeight: '600' };
const inputStyle = {
  width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)',
  borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
};
const rowStyle = { display: 'flex', gap: '12px', marginBottom: '12px' };
const smallBtnStyle = (color = 'var(--primary)') => ({
  padding: '6px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)',
  borderRadius: '6px', color, cursor: 'pointer', fontSize: '12px', fontWeight: '600',
  display: 'flex', alignItems: 'center', gap: '6px', transition: 'all var(--transition-fast)'
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

  const colorVal = data.color || '#6366F1';
  const hasContent = !!(data.content || data.title || data.text || data.image || data.authorName || data.footerText || fields.length);

  return (
    <div>
      {/* Message Content */}
      <Section title="Message Content (Ping Users)" icon="💬" color="var(--primary)" defaultOpen={!!data.content}>
        <textarea style={{ ...inputStyle, minHeight: '64px', resize: 'vertical', fontFamily: 'monospace', lineHeight: '1.6' }}
          value={data.content || ''} onChange={e => set('content', e.target.value)}
          placeholder={`Outside text for mentions and pings (e.g. \${user.mention})...`} rows={2} />
      </Section>

      {/* Basic — Title + URL + Color */}
      <Section title="Basic Header & Color" icon="📝" color="var(--primary)" defaultOpen={true}>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Embed Title</label>
          <input style={inputStyle} value={data.title || ''} onChange={e => set('title', e.target.value)} placeholder="Enter embed title" />
        </div>
        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Title URL</label>
            <input style={inputStyle} value={data.url || ''} onChange={e => set('url', e.target.value)} placeholder="https://example.com" />
          </div>
          <div style={{ width: '180px' }}>
            <label style={labelStyle}>Accent Color</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input style={{ ...inputStyle, flex: 1 }} value={data.color || ''} onChange={e => set('color', e.target.value)} placeholder="#6366F1" />
              <input type="color" value={colorVal} onChange={e => set('color', e.target.value)}
                style={{ width: '38px', height: '38px', border: '1px solid var(--border-secondary)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', padding: '2px' }} />
            </div>
          </div>
        </div>
      </Section>

      {/* Description */}
      <Section title="Description Markdown" icon="📄" color="#10B981" defaultOpen={!!data.text}>
        <textarea style={{ ...inputStyle, minHeight: '150px', resize: 'vertical', fontFamily: 'monospace', lineHeight: '1.6' }}
          value={data.text || ''} onChange={e => set('text', e.target.value)}
          placeholder={`Embed description text... Supports Discord markdown syntax and ${PLACEHOLDER_HINT}.`} rows={7} />
      </Section>

      {/* Author */}
      <Section title="Author Attribution" icon="👤" color="#F59E0B" defaultOpen={!!data.authorName}>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Author Name</label>
          <input style={inputStyle} value={data.authorName || ''} onChange={e => set('authorName', e.target.value)} placeholder="Author name" />
        </div>
        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Author Icon URL</label>
            <input style={inputStyle} value={data.authorIcon || ''} onChange={e => set('authorIcon', e.target.value)} placeholder="https://..." />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Author URL Link</label>
            <input style={inputStyle} value={data.authorUrl || ''} onChange={e => set('authorUrl', e.target.value)} placeholder="https://..." />
          </div>
        </div>
      </Section>

      {/* Images */}
      <Section title="Media & Thumbnails" icon="🖼️" color="#EF4444" defaultOpen={!!(data.image || data.thumbnail)}>
        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Main Banner Image URL</label>
            <input style={inputStyle} value={data.image || ''} onChange={e => set('image', e.target.value)} placeholder="https://..." />
            {data.image && (
              <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-secondary)' }}>
                <img src={data.image} alt="" style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', display: 'block' }}
                  onError={e => e.target.style.display = 'none'} />
              </div>
            )}
          </div>
          <div style={{ width: '200px' }}>
            <label style={labelStyle}>Thumbnail Icon URL</label>
            <input style={inputStyle} value={data.thumbnail || ''} onChange={e => set('thumbnail', e.target.value)} placeholder="https://..." />
            {data.thumbnail && (
              <div style={{ marginTop: '10px' }}>
                <img src={data.thumbnail} alt="" style={{ width: '68px', height: '68px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-secondary)' }}
                  onError={e => e.target.style.display = 'none'} />
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Fields */}
      <Section title="Embed Fields" icon="📋" color="#8B5CF6" defaultOpen={fields.length > 0}
        badge={fields.length > 0 ? fields.length : undefined}
        rightAction={fields.length < 25 ? (
          <button type="button" onClick={addField} className="badge badge-success" style={{ cursor: 'pointer', border: 'none', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaPlus /> Add Field</button>
        ) : null}
      >
        {fields.length === 0 && (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', textAlign: 'center', padding: '12px 0', margin: 0 }}>No fields configured. Click "Add Field" above to insert structured key-value columns.</p>
        )}
        {fields.map((field, i) => (
          <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '14px', marginBottom: '10px', border: '1px solid var(--border-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#8B5CF6', fontSize: '13px', fontWeight: '700' }}>Structured Field {i + 1}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" onClick={() => moveField(i, -1)} style={smallBtnStyle('var(--primary)')} disabled={i === 0}><FaArrowUp /></button>
                <button type="button" onClick={() => moveField(i, 1)} style={smallBtnStyle('var(--primary)')} disabled={i === fields.length - 1}><FaArrowDown /></button>
                <button type="button" onClick={() => removeField(i)} className="badge badge-danger" style={{ border: 'none', cursor: 'pointer', padding: '6px 10px' }}><FaTrash /></button>
              </div>
            </div>
            <div style={rowStyle}>
              <div style={{ flex: 1 }}>
                <input style={inputStyle} value={field.name || ''} onChange={e => setField(i, 'name', e.target.value)} placeholder="Field heading / title" />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                <input type="checkbox" checked={!!field.inline} onChange={e => setField(i, 'inline', e.target.checked)} style={{ accentColor: 'var(--primary)' }} /> Inline Column
              </label>
            </div>
            <textarea style={{ ...inputStyle, minHeight: '74px', resize: 'vertical', fontSize: '13px' }}
              value={field.value || ''} onChange={e => setField(i, 'value', e.target.value)} placeholder="Field body markdown value..." rows={2} />
          </div>
        ))}
      </Section>

      {/* Footer + Timestamp */}
      <Section title="Footer & Timestamp" icon="🦶" color="#10B981" defaultOpen={!!(data.footerText || data.timestamp)}>
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
          <label style={labelStyle}>Timestamp Option</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input style={{ ...inputStyle, flex: 1 }} value={data.timestamp || ''} onChange={e => set('timestamp', e.target.value)} placeholder="auto / ISO date string / leave blank" />
            <button type="button" onClick={() => set('timestamp', 'auto')} className="badge badge-success" style={{ border: 'none', cursor: 'pointer', padding: '8px 14px' }}>Auto</button>
            <button type="button" onClick={() => set('timestamp', new Date().toISOString())} className="badge badge-primary" style={{ border: 'none', cursor: 'pointer', padding: '8px 14px' }}>Now</button>
            {data.timestamp && <button type="button" onClick={() => set('timestamp', '')} className="badge badge-danger" style={{ border: 'none', cursor: 'pointer', padding: '8px 14px' }}>Clear</button>}
          </div>
        </div>
      </Section>

      {showPreview && (
        <Section title="Live Embed Preview" icon="👁️" color="var(--text-primary)" defaultOpen={hasContent}>
          <div style={{ borderLeft: `4px solid ${colorVal}`, borderRadius: '0 8px 8px 0', background: 'var(--bg-secondary)', padding: '16px' }}>
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
    <div style={{ maxWidth: '640px' }}>
      {data.content && <div style={{ color: 'var(--text-primary)', fontSize: '14px', marginBottom: '10px', whiteSpace: 'pre-wrap' }}>{data.content}</div>}
      <div style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '14px 18px', borderLeft: `4px solid ${color}`, borderTop: '1px solid var(--border-secondary)', borderRight: '1px solid var(--border-secondary)', borderBottom: '1px solid var(--border-secondary)' }}>
      {hasAuthor && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          {data.authorIcon && <img src={data.authorIcon} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />}
          <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: '700' }}>{data.authorName}</span>
        </div>
      )}
      {data.title && <div style={{ color: data.url ? 'var(--primary)' : 'var(--text-primary)', fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>{data.title}</div>}
      {data.text && <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '10px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{data.text.substring(0, 300)}{data.text.length > 300 ? '...' : ''}</div>}
      {previewFields.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
          {previewFields.map((f, i) => (
            <div key={i} style={{ gridColumn: f.inline ? 'span 1' : 'span 3' }}>
              <div style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: '700', marginBottom: '2px' }}>{f.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', whiteSpace: 'pre-wrap' }}>{f.value.substring(0, 200)}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          {data.image && <img src={data.image} alt="" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} onError={e => e.target.style.display = 'none'} />}
        </div>
        {data.thumbnail && <img src={data.thumbnail} alt="" style={{ width: '64px', height: '64px', borderRadius: '6px', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />}
      </div>
      {(hasFooter || data.timestamp) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-secondary)' }}>
          {data.footerIcon && hasFooter && <img src={data.footerIcon} alt="" style={{ width: '18px', height: '18px', borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />}
          {hasFooter && <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{data.footerText}</span>}
          {hasFooter && data.timestamp && <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>•</span>}
          {data.timestamp && <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{data.timestamp === 'auto' ? 'Today at 12:00 PM' : new Date(data.timestamp).toLocaleString()}</span>}
        </div>
      )}
      {!data.content && !data.title && !data.text && previewFields.length === 0 && !data.image && !hasAuthor && (
        <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>Empty embed — add content above</p>
      )}
      </div>
    </div>
  );
}

export default EmbedEditor;
