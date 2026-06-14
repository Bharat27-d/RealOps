import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTerminal, FaPlus, FaTrash, FaCog, FaUndo, FaImage, FaSave, FaEdit } from 'react-icons/fa';
import { customCommands } from '../services/api';
import EmbedEditor from '../components/EmbedEditor';
import OptionsEditor from '../components/OptionsEditor';

const EMPTY_FORM = {
  name: '',
  description: '',
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
  color: '#b9bbbe',
  fontSize: '12px',
  marginBottom: '6px',
  display: 'block',
  fontWeight: '600'
};

const commandInputStyle = {
  width: '100%',
  padding: '12px 14px',
  background: '#0f1115',
  border: '1px solid #40444b',
  borderRadius: '6px',
  color: '#dcddde',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box'
};

const commandPanelStyle = {
  background: '#202225',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
  border: '1px solid #2d2f34'
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

  // Only include fields that have actual content
  for (const [key, value] of Object.entries(fieldMap)) {
    if (value) payload[key] = value;
  }

  // Only include fields array if there are valid entries
  const validFields = cleanFields(data.fields);
  if (validFields.length > 0) payload.fields = validFields;

  return payload;
};

const embedCharCount = (data) => {
  const fieldCount = (data.fields || []).reduce((total, field) => (
    total + (field.name || '').length + (field.value || '').length
  ), 0);

  return [
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
  const hasResponse = !!(data.title || data.text || data.image || data.thumbnail || data.authorName || data.footerText || (data.fields || []).length);

  return (
    <div className="custom-command-preview">
      <div>
        <div className="custom-command-preview-label">
          {type === 'built-in' ? 'Built-in command' : type === 'custom' ? 'Custom command' : 'New custom command'}
        </div>
        <div className="custom-command-preview-command">
          /{data.name || 'command-name'}{optionText && <span> {optionText}</span>}
        </div>
        <div className="custom-command-preview-description">
          {data.description || 'Add the slash-command description users will see in Discord.'}
        </div>
      </div>
      <div className="custom-command-preview-stats">
        <span>{options.length} options</span>
        <span>{(data.fields || []).length} fields</span>
        <span className={data.enabled !== false ? 'is-enabled' : 'is-disabled'}>{data.enabled !== false ? 'Enabled' : 'Disabled'}</span>
        <span>{hasResponse ? 'Response ready' : 'No response yet'}</span>
      </div>
    </div>
  );
}

function CommandResponsePreview({ data }) {
  const color = data.color || '#00b894';
  const fields = (data.fields || []).filter(field => field.name?.trim() && field.value?.trim());
  const hasAuthor = data.authorName && data.authorName.trim();
  const hasFooter = data.footerText && data.footerText.trim();
  const hasContent = !!(data.title || data.text || data.image || data.thumbnail || hasAuthor || hasFooter || fields.length);

  if (!hasContent) {
    return (
      <div className="command-empty-preview">
        <FaImage />
        <strong>No response content yet</strong>
        <span>Add a title, description, field, image, or footer in the editor.</span>
      </div>
    );
  }

  return (
    <div className="command-discord-preview" style={{ borderLeftColor: color }}>
      <div className="command-discord-preview-main">
        {hasAuthor && (
          <div className="command-preview-author">
            {data.authorIcon && <img src={data.authorIcon} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} />}
            <strong>{data.authorName}</strong>
          </div>
        )}
        {data.title && (
          <div className={data.url ? 'command-preview-title is-link' : 'command-preview-title'}>
            {data.title}
          </div>
        )}
        {data.text && <div className="command-preview-text">{data.text}</div>}
        {fields.length > 0 && (
          <div className="command-preview-fields">
            {fields.map((field, index) => (
              <div key={`${field.name}-${index}`} style={{ gridColumn: field.inline ? 'span 1' : 'span 3' }}>
                <strong>{field.name}</strong>
                <span>{field.value}</span>
              </div>
            ))}
          </div>
        )}
        {data.image && <img className="command-preview-image" src={data.image} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} />}
        {(hasFooter || data.timestamp) && (
          <div className="command-preview-footer">
            {data.footerIcon && hasFooter && <img src={data.footerIcon} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} />}
            {hasFooter && <span>{data.footerText}</span>}
            {hasFooter && data.timestamp && <span>•</span>}
            {data.timestamp && <span>{data.timestamp === 'auto' ? 'Today at 12:00 PM' : data.timestamp}</span>}
          </div>
        )}
      </div>
      {data.thumbnail && (
        <img className="command-preview-thumbnail" src={data.thumbnail} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} />
      )}
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
    <div className="page-container">
      <div className="page-title command-builder-title">
        <div className="command-builder-title-left">
          <button className="btn btn-primary" onClick={handleNewCommand}>
            <FaPlus /> Create New Command
          </button>
          <h1><FaTerminal /> Commands Builder</h1>
        </div>
        <div className="command-builder-title-stats">
          <span>{builtInCommands.length} built-in</span>
          <span>{commands.length} custom</span>
          <span>{builtInCommands.filter(hasOverrides).length} customized</span>
        </div>
      </div>

      <div className="card command-builder-picker">
        <div>
          <label style={commandLabelStyle}>Select Command To Edit</label>
          <select
            className="command-builder-select"
            value={selectedKey}
            onChange={(event) => handleSelectCommand(event.target.value)}
          >
            <option value="new">New custom command</option>
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

      <div className="grid grid-2 command-builder-grid">
        <div className="card command-builder-editor-card">
          <div className="command-builder-card-header">
            <h2><FaEdit /> Command Editor</h2>
            <span className={`command-builder-type ${builderType}`}>
              {isBuiltIn ? 'Built-in override' : isExistingCustom ? 'Editing custom' : 'New custom'}
            </span>
          </div>

          <div style={commandPanelStyle}>
            <div className="custom-command-section-heading"><FaCog /> Command Settings</div>
            <div className="command-settings-grid">
              <div>
                <label style={commandLabelStyle}>Command Name *</label>
                <div style={{ position: 'relative' }}>
                  <span className="command-input-prefix">/</span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => updateForm({ name: event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                    disabled={isBuiltIn || isExistingCustom}
                    placeholder="rules"
                    style={{ ...commandInputStyle, paddingLeft: '30px', fontFamily: 'monospace' }}
                  />
                </div>
                <small style={{ color: '#72767d' }}>
                  {isBuiltIn ? 'Built-in command names come from the bot code.' : isExistingCustom ? 'Existing command names cannot be renamed.' : 'Use lowercase letters, numbers, dashes, and underscores.'}
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
                <small style={{ color: '#72767d' }}>{(formData.description || '').length}/100 characters</small>
              </div>
            </div>

            {isBuiltIn && (
              <div className="command-builder-alert">
                Built-in slash command details are read from <strong>{formData.sourceFile || selectedBuiltIn?.file}</strong>. This builder edits the response content override only.
              </div>
            )}

            {!isBuiltIn && (
              <label className="custom-command-enabled-toggle">
                <input
                  type="checkbox"
                  checked={formData.enabled !== false}
                  onChange={(event) => updateForm({ enabled: event.target.checked })}
                />
                <span>
                  <strong>{formData.enabled !== false ? 'Enabled' : 'Disabled'}</strong>
                  <small>{formData.enabled !== false ? 'Users can run this command.' : 'Saved but hidden from use.'}</small>
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

          <div className="custom-command-section-heading response-heading">
            <FaImage /> Response Embed Builder
          </div>
          <EmbedEditor data={formData} onChange={(data) => setFormData(data)} showPreview={false} />

          <div className="command-builder-actions">
            <button className="btn btn-primary" type="button" onClick={handleSave} disabled={saving}>
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
          <div className="card command-builder-preview-card">
            <h2>Live Preview</h2>
            <CommandBuilderPreview data={formData} type={builderType} />
            <CommandResponsePreview data={formData} />
            <div className="command-builder-count">
              Character Count: <strong className={count > 6000 ? 'danger' : ''}>{count} / 6000</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomCommands;
