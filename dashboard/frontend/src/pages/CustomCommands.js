import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTerminal, FaPlus, FaTrash, FaCog, FaUndo, FaImage, FaSave, FaEdit } from 'react-icons/fa';
import { customCommands } from '../services/api';
import EmbedEditor from '../components/EmbedEditor';
import OptionsEditor from '../components/OptionsEditor';

const EMPTY_FORM = {
  name: '',
  description: '',
  content: '',
  title: '',
  text: '',
  image: '',
  thumbnail: '',
  color: '',
  url: '',
  timestamp: '',
  authorName: '',
  authorIcon: '',
  authorUrl: '',
  footerText: '',
  footerIcon: '',
  fields: [],
  options: [],
  enabled: true
};

const commandLabelStyle = {
  color: 'var(--text-secondary)',
  fontSize: '13px',
  marginBottom: '6px',
  display: 'block',
  fontWeight: '600'
};

const commandInputStyle = {
  width: '100%',
  padding: '12px 14px',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-secondary)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box'
};

const commandPanelStyle = {
  background: 'var(--bg-tertiary)',
  borderRadius: '12px',
  padding: '18px',
  marginBottom: '18px',
  border: '1px solid var(--border-secondary)'
};

const makeEmptyForm = () => ({
  ...EMPTY_FORM,
  fields: [],
  options: []
});

const hasOverrides = (cmd) => cmd.overrides && Object.keys(cmd.overrides).length > 0;

const commandToForm = (command) => ({
  ...makeEmptyForm(),
  name: command.name || '',
  description: command.description || '',
  content: command.content || '',
  title: command.title || '',
  text: command.text || '',
  image: command.image || '',
  thumbnail: command.thumbnail || '',
  color: command.color || '',
  url: command.url || '',
  timestamp: command.timestamp || '',
  authorName: command.authorName || '',
  authorIcon: command.authorIcon || '',
  authorUrl: command.authorUrl || '',
  footerText: command.footerText || '',
  footerIcon: command.footerIcon || '',
  fields: Array.isArray(command.fields) ? command.fields : [],
  options: Array.isArray(command.options) ? command.options : [],
  enabled: command.enabled !== false
});

const builtInToForm = (command) => {
  const current = command.current || {};
  const overrides = command.overrides || {};

  return {
    ...makeEmptyForm(),
    name: command.name || '',
    description: command.description || '',
    content: overrides.content ?? current.content ?? '',
    title: overrides.title ?? current.title ?? '',
    text: overrides.description ?? current.description ?? current.embedDescription ?? '',
    image: overrides.image ?? current.image ?? '',
    thumbnail: overrides.thumbnail ?? current.thumbnail ?? '',
    color: overrides.color ?? current.color ?? '',
    url: overrides.url ?? current.url ?? '',
    timestamp: overrides.timestamp ?? current.timestamp ?? '',
    authorName: overrides.authorName ?? current.authorName ?? '',
    authorIcon: overrides.authorIcon ?? current.authorIcon ?? '',
    authorUrl: overrides.authorUrl ?? current.authorUrl ?? '',
    footerText: overrides.footerText ?? current.footerText ?? '',
    footerIcon: overrides.footerIcon ?? current.footerIcon ?? '',
    fields: Array.isArray(overrides.fields)
      ? overrides.fields
      : Array.isArray(current.fields)
        ? current.fields
        : [],
    options: [],
    enabled: true,
    sourceFile: command.file || ''
  };
};

const cleanFields = (fields = []) => fields
  .filter(field => field && field.name && field.name.trim() && field.value && field.value.trim())
  .map(field => ({
    name: field.name.trim(),
    value: field.value.trim(),
    inline: !!field.inline
  }));

const buildBuiltInPayload = (data) => {
  const payload = {};
  const fieldMap = {
    content: (data.content || '').trim(),
    image: (data.image || '').trim(),
    thumbnail: (data.thumbnail || '').trim(),
    color: (data.color || '').trim(),
    title: (data.title || '').trim(),
    description: (data.text || '').trim(),
    footerText: (data.footerText || '').trim(),
    footerIcon: (data.footerIcon || '').trim(),
    authorName: (data.authorName || '').trim(),
    authorIcon: (data.authorIcon || '').trim(),
    authorUrl: (data.authorUrl || '').trim(),
    url: (data.url || '').trim(),
    timestamp: (data.timestamp || '').trim()
  };

  for (const [key, value] of Object.entries(fieldMap)) {
    if (value) payload[key] = value;
  }

  const validFields = cleanFields(data.fields);
  if (validFields.length > 0) payload.fields = validFields;

  return payload;
};

const embedCharCount = (data) => {
  const fieldCount = (data.fields || []).reduce((total, field) => (
    total + (field.name || '').length + (field.value || '').length
  ), 0);

  return [
    data.content,
    data.title,
    data.text,
    data.footerText,
    data.authorName
  ].reduce((total, value) => total + (value || '').length, fieldCount);
};

function CommandBuilderPreview({ data, type }) {
  const options = Array.isArray(data.options) ? data.options.filter(opt => opt.name) : [];
  const optionText = options.length
    ? options.map(opt => `${opt.required ? '<' : '['}${opt.name}${opt.required ? '>' : ']'}`).join(' ')
    : '';
  const hasResponse = !!(data.content || data.title || data.text || data.image || data.thumbnail || data.authorName || data.footerText || (data.fields || []).length);

  return (
    <div className="custom-command-preview" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)', borderRadius: '12px', padding: '16px' }}>
      <div>
        <div className="custom-command-preview-label" style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          {type === 'built-in' ? 'Built-in command' : type === 'custom' ? 'Custom command' : 'New custom command'}
        </div>
        <div className="custom-command-preview-command" style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '700', marginTop: '4px' }}>
          /{data.name || 'command-name'}{optionText && <span style={{ color: 'var(--text-tertiary)', fontWeight: '400', fontSize: '15px' }}> {optionText}</span>}
        </div>
        <div className="custom-command-preview-description" style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          {data.description || 'Add the slash-command description users will see in Discord.'}
        </div>
      </div>
      <div className="custom-command-preview-stats" style={{ display: 'flex', gap: '12px', marginTop: '12px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
        <span>{options.length} options</span>
        <span>•</span>
        <span>{(data.fields || []).length} fields</span>
        <span>•</span>
        <span className={data.enabled !== false ? 'badge badge-success' : 'badge badge-danger'}>{data.enabled !== false ? 'Enabled' : 'Disabled'}</span>
        <span>•</span>
        <span style={{ color: hasResponse ? '#10B981' : 'var(--text-tertiary)' }}>{hasResponse ? 'Response ready' : 'No response yet'}</span>
      </div>
    </div>
  );
}

function CommandResponsePreview({ data }) {
  const color = data.color || 'var(--primary)';
  const fields = (data.fields || []).filter(field => field.name?.trim() && field.value?.trim());
  const hasAuthor = data.authorName && data.authorName.trim();
  const hasFooter = data.footerText && data.footerText.trim();
  const hasContent = !!(data.content || data.title || data.text || data.image || data.thumbnail || hasAuthor || hasFooter || fields.length);

  if (!hasContent) {
    return (
      <div className="command-empty-preview" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        <FaImage size={36} style={{ opacity: 0.3, marginBottom: '10px' }} />
        <strong style={{ display: 'block', color: 'var(--text-secondary)' }}>No response content yet</strong>
        <span style={{ fontSize: '13px' }}>Add a title, description, field, image, or footer in the editor.</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      {data.content && <div className="command-preview-content" style={{ color: 'var(--text-primary)', fontSize: '15px', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>{data.content}</div>}
      <div className="command-discord-preview" style={{ borderLeft: `4px solid ${color}`, background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-secondary)', borderRight: '1px solid var(--border-secondary)', borderBottom: '1px solid var(--border-secondary)', padding: '16px', borderRadius: '10px', marginTop: data.content ? 0 : undefined }}>
        <div className="command-discord-preview-main">
          {hasAuthor && (
          <div className="command-preview-author" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            {data.authorIcon && <img src={data.authorIcon} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%' }} onError={e => { e.currentTarget.style.display = 'none'; }} />}
            <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{data.authorName}</strong>
          </div>
        )}
        {data.title && (
          <div className={data.url ? 'command-preview-title is-link' : 'command-preview-title'} style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
            {data.title}
          </div>
        )}
        {data.text && <div className="command-preview-text" style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{data.text}</div>}
        {fields.length > 0 && (
          <div className="command-preview-fields" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '14px' }}>
            {fields.map((field, index) => (
              <div key={`${field.name}-${index}`} style={{ gridColumn: field.inline ? 'span 1' : 'span 3' }}>
                <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '13px', marginBottom: '2px' }}>{field.name}</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{field.value}</span>
              </div>
            ))}
          </div>
        )}
        {data.image && <img className="command-preview-image" src={data.image} alt="" style={{ width: '100%', borderRadius: '8px', marginTop: '14px' }} onError={e => { e.currentTarget.style.display = 'none'; }} />}
        {(hasFooter || data.timestamp) && (
          <div className="command-preview-footer" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-secondary)', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {data.footerIcon && hasFooter && <img src={data.footerIcon} alt="" style={{ width: '18px', height: '18px', borderRadius: '50%' }} onError={e => { e.currentTarget.style.display = 'none'; }} />}
            {hasFooter && <span>{data.footerText}</span>}
            {hasFooter && data.timestamp && <span>•</span>}
            {data.timestamp && <span>{data.timestamp === 'auto' ? 'Today at 12:00 PM' : data.timestamp}</span>}
          </div>
        )}
      </div>
      {data.thumbnail && (
        <img className="command-preview-thumbnail" src={data.thumbnail} alt="" style={{ width: '70px', borderRadius: '6px', marginLeft: '12px' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
      )}
      </div>
    </div>
  );
}

function CustomCommands() {
  const [commands, setCommands] = useState([]);
  const [builtInCommands, setBuiltInCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedKey, setSelectedKey] = useState('new');
  const [builderType, setBuilderType] = useState('new');
  const [selectedCustom, setSelectedCustom] = useState(null);
  const [selectedBuiltIn, setSelectedBuiltIn] = useState(null);
  const [formData, setFormData] = useState(makeEmptyForm());

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [customRes, builtInRes] = await Promise.all([
        customCommands.getAll(),
        customCommands.getBuiltIn()
      ]);
      const customData = customRes.data || [];
      const builtInData = builtInRes.data || [];

      setCommands(customData);
      setBuiltInCommands(builtInData);
      return { custom: customData, builtIn: builtInData };
    } catch (error) {
      toast.error('Failed to load commands');
      console.error(error);
      return { custom: [], builtIn: [] };
    } finally {
      setLoading(false);
    }
  };

  const handleNewCommand = () => {
    setSelectedKey('new');
    setBuilderType('new');
    setSelectedCustom(null);
    setSelectedBuiltIn(null);
    setFormData(makeEmptyForm());
  };

  const loadCustomCommand = (command) => {
    setSelectedKey(`custom:${command.id}`);
    setBuilderType('custom');
    setSelectedCustom(command);
    setSelectedBuiltIn(null);
    setFormData(commandToForm(command));
  };

  const loadBuiltInCommand = (command) => {
    setSelectedKey(`built-in:${command.name}`);
    setBuilderType('built-in');
    setSelectedBuiltIn(command);
    setSelectedCustom(null);
    setFormData(builtInToForm(command));
  };

  const handleSelectCommand = (value) => {
    if (value === 'new') {
      handleNewCommand();
      return;
    }

    if (value.startsWith('custom:')) {
      const id = value.replace('custom:', '');
      const command = commands.find(cmd => cmd.id === id);
      if (command) loadCustomCommand(command);
      return;
    }

    if (value.startsWith('built-in:')) {
      const name = value.replace('built-in:', '');
      const command = builtInCommands.find(cmd => cmd.name === name);
      if (command) loadBuiltInCommand(command);
    }
  };

  const validateCustomCommand = () => {
    const cleanName = formData.name.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanName) {
      toast.error('Command name is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Command description is required');
      return false;
    }

    const customNameExists = commands.some(cmd => cmd.name === cleanName && cmd.id !== selectedCustom?.id);
    const builtInNameExists = builtInCommands.some(cmd => cmd.name === cleanName);
    if (builderType === 'new' && (customNameExists || builtInNameExists)) {
      toast.error(`/${cleanName} already exists`);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      if (builderType === 'built-in') {
        if (!selectedBuiltIn) return;
        await customCommands.updateBuiltIn(selectedBuiltIn.name, buildBuiltInPayload(formData));
        toast.success(`/${selectedBuiltIn.name} updated! Changes apply instantly.`);
        const next = await fetchAll();
        const updated = next.builtIn.find(cmd => cmd.name === selectedBuiltIn.name);
        if (updated) loadBuiltInCommand(updated);
        return;
      }

      if (!validateCustomCommand()) return;
      const payload = {
        ...formData,
        name: formData.name.toLowerCase().replace(/[^a-z0-9_-]/g, '')
      };
      delete payload.sourceFile;

      if (builderType === 'custom' && selectedCustom) {
        const res = await customCommands.update(selectedCustom.id, payload);
        toast.success(`Command /${selectedCustom.name} updated!`);
        const updated = { ...selectedCustom, ...res.data };
        setSelectedCustom(updated);
        setFormData(commandToForm(updated));
        await fetchAll();
      } else {
        const res = await customCommands.create(payload);
        toast.success(`Command /${res.data.name} created!`);
        await fetchAll();
        loadCustomCommand(res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save command');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedCustom) return;
    if (!window.confirm(`Delete /${selectedCustom.name}? This cannot be undone.`)) return;

    try {
      await customCommands.delete(selectedCustom.id);
      toast.success(`/${selectedCustom.name} deleted`);
      await fetchAll();
      handleNewCommand();
    } catch (error) {
      toast.error('Failed to delete command');
    }
  };

  const handleResetSelected = async () => {
    if (!selectedBuiltIn) return;
    if (!window.confirm(`Reset /${selectedBuiltIn.name} to original defaults? All custom content will be removed.`)) return;

    try {
      await customCommands.resetBuiltIn(selectedBuiltIn.name);
      toast.success(`/${selectedBuiltIn.name} reset to defaults`);
      const next = await fetchAll();
      const updated = next.builtIn.find(cmd => cmd.name === selectedBuiltIn.name);
      if (updated) loadBuiltInCommand(updated);
    } catch (error) {
      toast.error('Failed to reset command');
    }
  };

  const updateForm = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const isBuiltIn = builderType === 'built-in';
  const isExistingCustom = builderType === 'custom';
  const count = embedCharCount(formData);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-title command-builder-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="command-builder-title-left">
          <div className="page-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '11px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>
            RealOps Portal / Automation
          </div>
          <h1><FaTerminal /> Slash Commands Builder</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="command-builder-title-stats" style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span className="badge badge-primary">{builtInCommands.length} built-in</span>
            <span className="badge badge-info">{commands.length} custom</span>
          </div>
          <button className="btn" onClick={handleNewCommand}>
            <FaPlus /> Create New Command
          </button>
        </div>
      </div>

      <div className="card command-builder-picker" style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={commandLabelStyle}>Select Command To Edit</label>
          <select
            className="form-select"
            value={selectedKey}
            onChange={(event) => handleSelectCommand(event.target.value)}
          >
            <option value="new">+ New custom command</option>
            <optgroup label="Built-in commands">
              {builtInCommands.map(command => (
                <option key={command.id} value={`built-in:${command.name}`}>
                  /{command.name} - {command.description}
                </option>
              ))}
            </optgroup>
            <optgroup label="Custom commands">
              {commands.map(command => (
                <option key={command.id} value={`custom:${command.id}`}>
                  /{command.name} - {command.description}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <CommandBuilderPreview data={formData} type={builderType} />
      </div>

      <div className="grid grid-2" style={{ gap: '24px' }}>
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2><FaEdit /> Command Editor</h2>
            <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
              {isBuiltIn ? 'Built-in Override' : isExistingCustom ? 'Editing Custom' : 'New Custom'}
            </span>
          </div>

          <div style={commandPanelStyle}>
            <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCog style={{ color: 'var(--primary)' }} /> Command Settings
            </div>
            <div className="grid grid-2" style={{ gap: '16px', marginBottom: '12px' }}>
              <div>
                <label style={commandLabelStyle}>Command Name *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-tertiary)', fontWeight: '700' }}>/</span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => updateForm({ name: event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                    disabled={isBuiltIn || isExistingCustom}
                    placeholder="rules"
                    style={{ ...commandInputStyle, paddingLeft: '28px', fontFamily: 'monospace' }}
                  />
                </div>
                <small style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  {isBuiltIn ? 'Built-in command names come from code.' : isExistingCustom ? 'Existing command names cannot be renamed.' : 'Use lowercase letters, numbers, and dashes.'}
                </small>
              </div>

              <div>
                <label style={commandLabelStyle}>Slash Command Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(event) => updateForm({ description: event.target.value })}
                  disabled={isBuiltIn}
                  maxLength={100}
                  placeholder="Displays the server rules..."
                  style={commandInputStyle}
                />
                <small style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{(formData.description || '').length}/100 characters</small>
              </div>
            </div>

            {isBuiltIn && (
              <div style={{ padding: '10px 14px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-primary)', marginTop: '12px' }}>
                Built-in slash command details are read from <code style={{ color: 'var(--primary)' }}>{formData.sourceFile || selectedBuiltIn?.file}</code>. This builder edits the response content override.
              </div>
            )}

            {!isBuiltIn && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.enabled !== false}
                  onChange={(event) => updateForm({ enabled: event.target.checked })}
                  style={{ width: 'auto', accentColor: 'var(--primary)' }}
                />
                <span>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '14px' }}>{formData.enabled !== false ? 'Command Enabled' : 'Command Disabled'}</strong>
                  <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{formData.enabled !== false ? 'Users in Discord can trigger this command.' : 'Saved but hidden from Discord menu.'}</small>
                </span>
              </label>
            )}
          </div>

          {!isBuiltIn && (
            <OptionsEditor
              options={formData.options || []}
              onChange={(options) => updateForm({ options })}
            />
          )}

          <div style={{ fontWeight: '700', color: 'var(--text-primary)', margin: '20px 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaImage style={{ color: 'var(--primary)' }} /> Response Embed Builder
          </div>
          <EmbedEditor data={formData} onChange={(data) => setFormData(data)} showPreview={false} />

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button className="btn" type="button" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
              <FaSave /> {saving ? 'Saving...' : isBuiltIn ? 'Save Overrides' : isExistingCustom ? 'Save Command' : 'Create Command'}
            </button>
            {isBuiltIn && hasOverrides(selectedBuiltIn || {}) && (
              <button className="btn btn-secondary" type="button" onClick={handleResetSelected}>
                <FaUndo /> Reset Overrides
              </button>
            )}
            {isExistingCustom && (
              <button className="btn btn-danger" type="button" onClick={handleDeleteSelected}>
                <FaTrash /> Delete Command
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-header">
              <h2>Live Discord Response Preview</h2>
            </div>
            <CommandBuilderPreview data={formData} type={builderType} />
            <div style={{ marginTop: '16px' }}>
              <CommandResponsePreview data={formData} />
            </div>
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-secondary)', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>Total Embed Characters:</span>
              <strong style={{ color: count > 6000 ? 'var(--danger)' : 'var(--text-primary)' }}>{count} / 6000</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomCommands;
