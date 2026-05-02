import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTerminal, FaPlus, FaEdit, FaTrash, FaTimes, FaCog, FaUndo, FaImage, FaSave } from 'react-icons/fa';
import { customCommands } from '../services/api';
import EmbedEditor from '../components/EmbedEditor';
import OptionsEditor from '../components/OptionsEditor';

// Default empty embed form
const EMPTY_FORM = {
  name: '', description: '', title: '', text: '', image: '', thumbnail: '',
  color: '', url: '', timestamp: '',
  authorName: '', authorIcon: '', authorUrl: '',
  footerText: '', footerIcon: '',
  fields: [], options: [], enabled: true
};

function CustomCommands() {
  const [commands, setCommands] = useState([]);
  const [builtInCommands, setBuiltInCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBuiltInModalOpen, setIsBuiltInModalOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState(null);
  const [editingBuiltIn, setEditingBuiltIn] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Form state for custom commands
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  // Override form state for built-in commands
  const [overrideData, setOverrideData] = useState({
    image: '', thumbnail: '', color: '', title: '', description: '',
    footerText: '', footerIcon: '', authorName: '', authorIcon: '', authorUrl: '',
    url: '', timestamp: '', fields: []
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [customRes, builtInRes] = await Promise.all([
        customCommands.getAll(),
        customCommands.getBuiltIn()
      ]);
      setCommands(customRes.data);
      setBuiltInCommands(builtInRes.data);
    } catch (error) {
      toast.error('Failed to load commands');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Custom Command Handlers ---
  const handleOpenModal = (command = null) => {
    if (command) {
      setEditingCommand(command);
      setFormData({
        name: command.name || '', description: command.description || '',
        title: command.title || '', text: command.text || '',
        image: command.image || '', thumbnail: command.thumbnail || '',
        color: command.color || '', url: command.url || '',
        timestamp: command.timestamp || '',
        authorName: command.authorName || '', authorIcon: command.authorIcon || '',
        authorUrl: command.authorUrl || '',
        footerText: command.footerText || '', footerIcon: command.footerIcon || '',
        fields: Array.isArray(command.fields) ? command.fields : [],
        options: Array.isArray(command.options) ? command.options : [],
        enabled: command.enabled !== false
      });
    } else {
      setEditingCommand(null);
      setFormData({ ...EMPTY_FORM });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingCommand(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Command name is required'); return; }
    setSaving(true);
    try {
      if (editingCommand) {
        await customCommands.update(editingCommand.id, formData);
        toast.success(`Command /${formData.name} updated!`);
      } else {
        await customCommands.create(formData);
        toast.success(`Command /${formData.name} created!`);
      }
      handleCloseModal();
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save command');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete /${name}? This cannot be undone.`)) {
      try {
        await customCommands.delete(id);
        toast.success(`Command /${name} deleted!`);
        fetchAll();
      } catch (error) { toast.error('Failed to delete command'); }
    }
  };

  const handleToggle = async (command) => {
    try {
      await customCommands.update(command.id, { ...command, enabled: !command.enabled });
      fetchAll();
      toast.success(`/${command.name} ${!command.enabled ? 'enabled' : 'disabled'}`);
    } catch (error) { toast.error('Failed to toggle command'); }
  };

  // --- Built-in Command Override Handlers ---
  const handleOpenBuiltInModal = (cmd) => {
    setEditingBuiltIn(cmd);
    const current = cmd.current || {};
    const overrides = cmd.overrides || {};
    setOverrideData({
      image: overrides.image || current.image || '',
      thumbnail: overrides.thumbnail || current.thumbnail || '',
      color: overrides.color || current.color || '',
      title: overrides.title || current.title || '',
      description: overrides.description || current.embedDescription || '',
      footerText: overrides.footerText || current.footerText || '',
      footerIcon: overrides.footerIcon || current.footerIcon || '',
      authorName: overrides.authorName || '', authorIcon: overrides.authorIcon || '',
      authorUrl: overrides.authorUrl || '', url: overrides.url || '',
      timestamp: overrides.timestamp || '',
      fields: Array.isArray(overrides.fields) ? overrides.fields : []
    });
    setIsBuiltInModalOpen(true);
  };

  const handleCloseBuiltInModal = () => { setIsBuiltInModalOpen(false); setEditingBuiltIn(null); };

  const handleSaveOverride = async (e) => {
    e.preventDefault();
    if (!editingBuiltIn) return;
    setSaving(true);
    try {
      const cleanData = {};
      Object.entries(overrideData).forEach(([key, value]) => {
        if (key === 'fields') {
          if (Array.isArray(value) && value.length > 0) cleanData.fields = value;
        } else if (value && typeof value === 'string' && value.trim()) {
          cleanData[key] = value.trim();
        }
      });
      await customCommands.updateBuiltIn(editingBuiltIn.name, cleanData);
      toast.success(`/${editingBuiltIn.name} updated! Changes apply instantly.`);
      handleCloseBuiltInModal();
      fetchAll();
    } catch (error) {
      toast.error('Failed to save overrides');
    } finally { setSaving(false); }
  };

  const handleResetOverride = async (commandName) => {
    if (window.confirm(`Reset /${commandName} to original defaults? All custom images/text will be removed.`)) {
      try {
        await customCommands.resetBuiltIn(commandName);
        toast.success(`/${commandName} reset to defaults!`);
        fetchAll();
      } catch (error) { toast.error('Failed to reset command'); }
    }
  };

  // Filter
  const getFiltered = () => {
    if (activeTab === 'custom') return { custom: commands, builtIn: [] };
    if (activeTab === 'builtin') return { custom: [], builtIn: builtInCommands };
    return { custom: commands, builtIn: builtInCommands };
  };
  const { custom: filteredCustom, builtIn: filteredBuiltIn } = getFiltered();
  const totalCount = commands.length + builtInCommands.length;

  const hasOverrides = (cmd) => cmd.overrides && Object.keys(cmd.overrides).length > 0;
  const hasEditableContent = (cmd) => cmd.defaults && Object.keys(cmd.defaults).length > 0;

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-title">
        <h1><FaTerminal /> Commands Manager</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FaPlus /> New Command
        </button>
      </div>

      <div className="card">
        <p style={{ color: '#dcddde', marginBottom: '20px' }}>
          Manage all your bot's slash commands. Edit images, banners, and text for built-in commands, or create new custom commands — all changes sync to the bot instantly.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Commands', value: totalCount, color: '#FFD700' },
            { label: 'Built-in', value: builtInCommands.length, color: '#43b581' },
            { label: 'Custom', value: commands.length, color: '#7289da' },
            { label: 'Customized', value: builtInCommands.filter(hasOverrides).length, color: '#faa61a' }
          ].map(s => (
            <div key={s.label} style={{
              background: '#202225', padding: '12px 20px', borderRadius: '8px',
              border: '1px solid #40444b', flex: '1', minWidth: '100px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#72767d' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['all', 'builtin', 'custom'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 16px', borderRadius: '6px',
              border: activeTab === tab ? '1px solid #FFD700' : '1px solid #40444b',
              background: activeTab === tab ? 'rgba(255, 215, 0, 0.15)' : '#2C2F33',
              color: activeTab === tab ? '#FFD700' : '#dcddde',
              cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === tab ? '600' : '400'
            }}>
              {tab === 'all' ? `All (${totalCount})` : tab === 'builtin' ? `Built-in (${builtInCommands.length})` : `Custom (${commands.length})`}
            </button>
          ))}
        </div>

        {/* Built-in Commands */}
        {filteredBuiltIn.length > 0 && (
          <>
            <h3 style={{ color: '#43b581', marginBottom: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCog /> Built-in Commands
              <span style={{ fontSize: '11px', color: '#72767d', fontWeight: 'normal' }}>— Click edit to update images, banners, and text</span>
            </h3>
            <div className="table-responsive" style={{ marginBottom: '25px' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Command</th>
                    <th>Description</th>
                    <th>Preview</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBuiltIn.map((cmd) => (
                    <tr key={cmd.id}>
                      <td>
                        <span style={{
                          background: '#202225', padding: '4px 8px', borderRadius: '4px',
                          fontFamily: 'monospace', color: '#43b581', border: '1px solid #2d6e4e', fontSize: '13px'
                        }}>/{cmd.name}</span>
                      </td>
                      <td><span style={{ color: '#dcddde', fontSize: '13px' }}>{cmd.description}</span></td>
                      <td>
                        {(cmd.current?.image || cmd.current?.thumbnail) ? (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {cmd.current.image && (
                              <div style={{
                                width: '50px', height: '35px',
                                background: `url(${cmd.current.image}) center/cover`,
                                borderRadius: '4px', border: '1px solid #40444b'
                              }} title={cmd.current.image} />
                            )}
                            {cmd.current.thumbnail && (
                              <div style={{
                                width: '24px', height: '24px',
                                background: `url(${cmd.current.thumbnail}) center/cover`,
                                borderRadius: '50%', border: '1px solid #40444b'
                              }} title="Thumbnail" />
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#72767d', fontSize: '12px' }}>No media</span>
                        )}
                      </td>
                      <td>
                        {hasOverrides(cmd) ? (
                          <span style={{ color: '#faa61a', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaEdit style={{ fontSize: '10px' }} /> Customized
                          </span>
                        ) : (
                          <span style={{ color: '#43b581', fontSize: '12px' }}>Default</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {hasEditableContent(cmd) && (
                            <button className="btn-icon" onClick={() => handleOpenBuiltInModal(cmd)} title="Edit images & content">
                              <FaEdit />
                            </button>
                          )}
                          {hasOverrides(cmd) && (
                            <button className="btn-icon danger" onClick={() => handleResetOverride(cmd.name)} title="Reset to defaults">
                              <FaUndo />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Custom Commands */}
        {activeTab !== 'builtin' && (
          <>
            <h3 style={{ color: '#7289da', marginBottom: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaTerminal /> Custom Commands
              <span style={{ fontSize: '11px', color: '#72767d', fontWeight: 'normal' }}>— Created from the dashboard</span>
            </h3>
            {filteredCustom.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#2C2F33', borderRadius: '8px' }}>
                <FaTerminal style={{ fontSize: '48px', color: '#72767d', marginBottom: '15px' }} />
                <h3 style={{ color: '#dcddde', marginBottom: '10px' }}>No custom commands yet</h3>
                <p style={{ color: '#72767d', marginBottom: '20px' }}>Create your first custom slash command to get started.</p>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>Create Command</button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead><tr><th>Command</th><th>Description</th><th>Status</th><th>Preview</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredCustom.map((cmd) => (
                      <tr key={cmd.id}>
                        <td>
                          <span style={{
                            background: '#202225', padding: '4px 8px', borderRadius: '4px',
                            fontFamily: 'monospace', color: '#FFD700', border: '1px solid #40444b'
                          }}>/{cmd.name}</span>
                        </td>
                        <td><span style={{ color: '#dcddde' }}>{cmd.description}</span></td>
                        <td>
                          <div onClick={() => handleToggle(cmd)} style={{
                            width: '40px', height: '20px',
                            background: cmd.enabled !== false ? '#43b581' : '#f04747',
                            borderRadius: '10px', position: 'relative', cursor: 'pointer'
                          }}>
                            <div style={{
                              width: '16px', height: '16px', background: '#fff', borderRadius: '50%',
                              position: 'absolute', top: '2px',
                              left: cmd.enabled !== false ? '22px' : '2px', transition: 'left 0.3s ease'
                            }} />
                          </div>
                        </td>
                        <td>
                          {cmd.image ? (
                            <div style={{ width: '40px', height: '30px', background: `url(${cmd.image}) center/cover`, borderRadius: '4px' }} />
                          ) : <span style={{ color: '#72767d', fontSize: '12px' }}>Text Only</span>}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-icon" onClick={() => handleOpenModal(cmd)} title="Edit"><FaEdit /></button>
                            <button className="btn-icon danger" onClick={() => handleDelete(cmd.id, cmd.name)} title="Delete"><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== BUILT-IN COMMAND EDIT MODAL ===== */}
      {isBuiltInModalOpen && editingBuiltIn && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '750px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2><FaImage style={{ marginRight: '8px' }} /> Edit /{editingBuiltIn.name}</h2>
              <button className="btn-icon" onClick={handleCloseBuiltInModal}><FaTimes /></button>
            </div>
            <form onSubmit={handleSaveOverride}>
              <div className="modal-body">
                <p style={{ color: '#faa61a', fontSize: '13px', marginBottom: '15px', background: 'rgba(250,166,26,0.1)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(250,166,26,0.3)' }}>
                  ⚡ Changes are applied instantly — the bot picks up new values in real-time without restart.
                </p>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label>Source File</label>
                  <input type="text" value={editingBuiltIn.file} disabled style={{ color: '#72767d', fontFamily: 'monospace' }} />
                </div>
                <EmbedEditor
                  data={{
                    title: overrideData.title, text: overrideData.description,
                    color: overrideData.color, url: overrideData.url,
                    image: overrideData.image, thumbnail: overrideData.thumbnail,
                    authorName: overrideData.authorName, authorIcon: overrideData.authorIcon,
                    authorUrl: overrideData.authorUrl,
                    footerText: overrideData.footerText, footerIcon: overrideData.footerIcon,
                    timestamp: overrideData.timestamp,
                    fields: overrideData.fields || []
                  }}
                  onChange={(d) => setOverrideData({
                    ...overrideData, title: d.title, description: d.text,
                    color: d.color, url: d.url, image: d.image, thumbnail: d.thumbnail,
                    authorName: d.authorName, authorIcon: d.authorIcon, authorUrl: d.authorUrl,
                    footerText: d.footerText, footerIcon: d.footerIcon,
                    timestamp: d.timestamp, fields: d.fields
                  })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={handleCloseBuiltInModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <FaSave style={{ marginRight: '6px' }} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== CUSTOM COMMAND CREATE/EDIT MODAL ===== */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '750px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>{editingCommand ? 'Edit Command' : 'Create Command'}</h2>
              <button className="btn-icon" onClick={handleCloseModal}><FaTimes /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {/* Command meta */}
                <div style={{ background: '#202225', borderRadius: '8px', padding: '15px', marginBottom: '15px', border: '1px solid #2d2f34' }}>
                  <div style={{ color: '#FFD700', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>⚙️ Command Settings</div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ color: '#b9bbbe', fontSize: '13px', marginBottom: '4px', display: 'block' }}>Command Name *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '10px', color: '#ffeb3b', fontWeight: 'bold' }}>/</span>
                      <input type="text" value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')})}
                        placeholder="rules" style={{ paddingLeft: '25px', fontFamily: 'monospace', width: '100%', padding: '8px 12px 8px 25px', background: '#2C2F33', border: '1px solid #40444b', borderRadius: '6px', color: '#dcddde', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                        required disabled={!!editingCommand}
                      />
                    </div>
                    <small style={{ color: '#72767d' }}>Only lowercase letters, numbers, dashes, and underscores.</small>
                  </div>
                  <div>
                    <label style={{ color: '#b9bbbe', fontSize: '13px', marginBottom: '4px', display: 'block' }}>Description *</label>
                    <input type="text" value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Displays the server rules..." maxLength={100} required
                      style={{ width: '100%', padding: '8px 12px', background: '#2C2F33', border: '1px solid #40444b', borderRadius: '6px', color: '#dcddde', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Command Options (user/role/channel inputs) */}
                <OptionsEditor
                  options={formData.options || []}
                  onChange={(opts) => setFormData({ ...formData, options: opts })}
                />

                {/* Full Embed Editor */}
                <EmbedEditor data={formData} onChange={(d) => setFormData({ ...formData, ...d })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editingCommand ? 'Save Changes' : 'Create Command')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomCommands;
