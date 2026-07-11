import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaInfoCircle, FaSave, FaPaperPlane, FaEye, FaPlus, FaTrash, FaToggleOn, FaToggleOff, FaEdit } from 'react-icons/fa';
import { panels, discord } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

function PanelsNew() {
  const [allPanels, setAllPanels] = useState([]);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [channelSearch, setChannelSearch] = useState('');
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [showNewPanelForm, setShowNewPanelForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const channelDropdownRef = useRef(null);

  const [newPanel, setNewPanel] = useState({
    name: '',
    title: '',
    description: '',
    color: '#6366F1',
    thumbnail: '',
    image: '',
    footer: {
      text: 'The Real Ops Group',
      iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
    },
    buttons: [],
    enabled: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (channelDropdownRef.current && !channelDropdownRef.current.contains(event.target)) {
        setShowChannelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [panelsRes, channelsRes] = await Promise.all([
        panels.getAll(),
        discord.getChannels()
      ]);
      
      setAllPanels(panelsRes.data);
      setChannels(channelsRes.data.filter(ch => ch.type === 0));
      
      if (panelsRes.data.length > 0 && !selectedPanel) {
        setSelectedPanel(panelsRes.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load panels');
    } finally {
      setLoading(false);
    }
  };

  const togglePanelEnabled = async (panel) => {
    if (panel.isBuiltIn) {
      toast.error('Cannot disable built-in panels');
      return;
    }

    try {
      await panels.updateCustom(panel.id, { enabled: !panel.enabled });
      toast.success(`Panel ${panel.enabled ? 'disabled' : 'enabled'} successfully!`);
      fetchData();
    } catch (error) {
      toast.error('Failed to toggle panel status');
    }
  };

  const deletePanel = async (panel) => {
    if (panel.isBuiltIn) {
      toast.error('Cannot delete built-in panels');
      return;
    }

    try {
      await panels.deleteCustom(panel.id);
      toast.success('Panel deleted successfully!');
      setConfirmDelete(null);
      if (selectedPanel?.id === panel.id) {
        setSelectedPanel(allPanels[0] || null);
      }
      fetchData();
    } catch (error) {
      toast.error('Failed to delete panel');
    }
  };

  const createNewPanel = async () => {
    if (!newPanel.name || !newPanel.title || !newPanel.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await panels.createCustom(newPanel);
      toast.success('Custom panel created successfully!');
      setShowNewPanelForm(false);
      setNewPanel({
        name: '',
        title: '',
        description: '',
        color: '#6366F1',
        thumbnail: '',
        image: '',
        footer: {
          text: 'The Real Ops Group',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        },
        buttons: [],
        enabled: true
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create panel');
    }
  };

  const updatePanel = async (panelData) => {
    if (panelData.isBuiltIn) {
      try {
        await panels.save(panelData);
        toast.success('Panel updated successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to update panel');
      }
    } else {
      try {
        await panels.updateCustom(panelData.id, panelData);
        toast.success('Panel updated successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to update panel');
      }
    }
  };

  const deployPanel = async () => {
    if (!selectedChannel) {
      toast.error('Please select a channel first');
      return;
    }

    if (!selectedPanel) {
      toast.error('No panel selected');
      return;
    }

    setDeploying(true);
    try {
      const deployType = selectedPanel.type || selectedPanel.name.toLowerCase().replace(/\s+/g, '_');
      const customPanelId = selectedPanel.isBuiltIn ? null : selectedPanel.id;
      
      await panels.deploy(deployType, selectedChannel, customPanelId);
      toast.success('Panel deployed successfully!');
      setSelectedChannel('');
      setChannelSearch('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to deploy panel');
    } finally {
      setDeploying(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-title">
        <div>
          <div className="page-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '11px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>
            RealOps Portal / Bot System
          </div>
          <h1><FaInfoCircle /> Panel Management</h1>
        </div>
      </div>

      <div style={{ 
        padding: '16px 20px', 
        background: 'rgba(16, 185, 129, 0.12)', 
        border: '1px solid rgba(16, 185, 129, 0.3)', 
        borderRadius: '12px', 
        marginBottom: '24px',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px'
      }}>
        <FaInfoCircle size={20} style={{ color: '#10B981', flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#10B981' }}>Panel Management:</strong> Create custom ticket panels for special events (e.g., anniversary slot booking), enable/disable panels, and deploy them to Discord channels.
        </div>
      </div>

      <div className="grid grid-3" style={{ gridTemplateColumns: '280px 1fr 1fr', gap: '24px' }}>
        {/* Panel List Sidebar */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Panels</h2>
            <button 
              className="btn btn-sm" 
              onClick={() => setShowNewPanelForm(!showNewPanelForm)}
              style={{ padding: '6px 12px' }}
            >
              <FaPlus />
            </button>
          </div>
          
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {allPanels.map(panel => (
              <div 
                key={panel.id || panel.type}
                onClick={() => setSelectedPanel(panel)}
                style={{
                  padding: '12px 14px',
                  margin: '8px 0',
                  background: selectedPanel?.id === panel.id || selectedPanel?.type === panel.type ? 'var(--primary-subtle)' : 'var(--bg-tertiary)',
                  border: `1px solid ${selectedPanel?.id === panel.id || selectedPanel?.type === panel.type ? 'var(--primary)' : 'var(--border-secondary)'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '600', color: panel.enabled !== false ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '14px' }}>
                    {panel.name || panel.type}
                  </span>
                  {!panel.isBuiltIn && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePanelEnabled(panel);
                      }}
                      style={{ 
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: panel.enabled !== false ? '#10B981' : 'var(--text-tertiary)',
                        fontSize: '18px'
                      }}
                    >
                      {panel.enabled !== false ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '500' }}>
                  {panel.isBuiltIn ? 'Built-in' : 'Custom'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Editor */}
        <div className="card">
          <div className="card-header">
            <h2>
              {showNewPanelForm ? 'Create New Panel' : 'Panel Editor'}
            </h2>
          </div>

          {showNewPanelForm ? (
            <>
              <div className="form-group">
                <label className="form-label">Panel Name *</label>
                <input 
                  className="form-input"
                  type="text"
                  value={newPanel.name}
                  onChange={(e) => setNewPanel({...newPanel, name: e.target.value})}
                  placeholder="e.g., Anniversary Slot Booking"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Title *</label>
                <input 
                  className="form-input"
                  type="text"
                  value={newPanel.title}
                  onChange={(e) => setNewPanel({...newPanel, title: e.target.value})}
                  placeholder="Panel Title"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea 
                  className="form-textarea"
                  value={newPanel.description}
                  onChange={(e) => setNewPanel({...newPanel, description: e.target.value})}
                  placeholder="Panel description..."
                  rows={5}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="color"
                    value={newPanel.color}
                    onChange={(e) => setNewPanel({...newPanel, color: e.target.value})}
                    style={{ 
                      width: '54px', 
                      height: '42px',
                      border: '1px solid var(--border-secondary)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: 'transparent',
                      padding: '2px'
                    }}
                  />
                  <input 
                    className="form-input"
                    type="text"
                    value={newPanel.color}
                    onChange={(e) => setNewPanel({...newPanel, color: e.target.value})}
                    placeholder="#6366F1"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input 
                  className="form-input"
                  type="text"
                  value={newPanel.image}
                  onChange={(e) => setNewPanel({...newPanel, image: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <button className="btn" onClick={createNewPanel} style={{ width: '100%', marginTop: '20px' }}>
                <FaSave style={{ marginRight: '8px' }} /> Create Panel
              </button>
              
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowNewPanelForm(false)} 
                style={{ width: '100%', marginTop: '10px' }}
              >
                Cancel
              </button>
            </>
          ) : selectedPanel ? (
            <>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input 
                  className="form-input"
                  type="text"
                  value={selectedPanel.title}
                  onChange={(e) => setSelectedPanel({...selectedPanel, title: e.target.value})}
                  placeholder="Panel Title"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea"
                  value={selectedPanel.description}
                  onChange={(e) => setSelectedPanel({...selectedPanel, description: e.target.value})}
                  placeholder="Panel description..."
                  rows={5}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="color"
                    value={selectedPanel.color || '#6366F1'}
                    onChange={(e) => setSelectedPanel({...selectedPanel, color: e.target.value})}
                    style={{ 
                      width: '54px', 
                      height: '42px',
                      border: '1px solid var(--border-secondary)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: 'transparent',
                      padding: '2px'
                    }}
                  />
                  <input 
                    className="form-input"
                    type="text"
                    value={selectedPanel.color || '#6366F1'}
                    onChange={(e) => setSelectedPanel({...selectedPanel, color: e.target.value})}
                    placeholder="#6366F1"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Thumbnail URL</label>
                <input 
                  className="form-input"
                  type="text"
                  value={selectedPanel.thumbnail || ''}
                  onChange={(e) => setSelectedPanel({...selectedPanel, thumbnail: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input 
                  className="form-input"
                  type="text"
                  value={selectedPanel.image || ''}
                  onChange={(e) => setSelectedPanel({...selectedPanel, image: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <button className="btn" onClick={() => updatePanel(selectedPanel)} style={{ width: '100%', marginTop: '20px' }}>
                <FaSave style={{ marginRight: '8px' }} /> Save Changes
              </button>

              {!selectedPanel.isBuiltIn && (
                <button 
                  className="btn btn-danger" 
                  onClick={() => setConfirmDelete(selectedPanel)}
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  <FaTrash style={{ marginRight: '8px' }} /> Delete Panel
                </button>
              )}

              {/* Deploy to Discord Section */}
              <div style={{ 
                marginTop: '28px', 
                padding: '20px', 
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-secondary)',
                borderRadius: '14px' 
              }}>
                <h3 style={{ 
                  marginBottom: '16px', 
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '16px',
                  fontWeight: '700'
                }}>
                  <FaPaperPlane style={{ color: 'var(--primary)' }} />
                  Deploy to Discord
                </h3>
                
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Select Channel</label>
                  <div ref={channelDropdownRef} style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search channels..."
                      value={channelSearch}
                      onChange={(e) => {
                        setChannelSearch(e.target.value);
                        setShowChannelDropdown(true);
                      }}
                      onFocus={() => setShowChannelDropdown(true)}
                    />
                    
                    {showChannelDropdown && channelSearch && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '6px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-secondary)',
                        borderRadius: '10px',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        boxShadow: 'var(--shadow-lg)'
                      }}>
                        {channels
                          .filter(ch => ch.name.toLowerCase().includes(channelSearch.toLowerCase()))
                          .slice(0, 10)
                          .map(channel => (
                            <div
                              key={channel.id}
                              onClick={() => {
                                setSelectedChannel(channel.id);
                                setChannelSearch(`# ${channel.name}`);
                                setShowChannelDropdown(false);
                              }}
                              style={{
                                padding: '10px 14px',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                                borderBottom: '1px solid var(--border-secondary)',
                                transition: 'background var(--transition-fast)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '13px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <span style={{ color: 'var(--text-tertiary)' }}>#</span>
                              <span style={{ fontWeight: '500' }}>{channel.name}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  className="btn btn-secondary" 
                  onClick={deployPanel}
                  disabled={!selectedChannel || deploying}
                  style={{ width: '100%' }}
                >
                  {deploying ? 'Deploying...' : <><FaPaperPlane style={{ marginRight: '8px' }} /> Send Panel to Channel</>}
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <FaEye style={{ fontSize: '48px', opacity: 0.3, marginBottom: '16px' }} />
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Select a panel or create a new one</p>
            </div>
          )}
        </div>

        {/* Live Preview */}
        <div className="card">
          <div className="card-header">
            <h2>Live Preview</h2>
          </div>
          {(selectedPanel || showNewPanelForm) ? (
            <div style={{ 
              borderLeft: `4px solid ${showNewPanelForm ? newPanel.color : (selectedPanel.color || 'var(--primary)')}`,
              background: 'var(--bg-tertiary)',
              borderTop: '1px solid var(--border-secondary)',
              borderRight: '1px solid var(--border-secondary)',
              borderBottom: '1px solid var(--border-secondary)',
              padding: '20px',
              borderRadius: '12px' 
            }}>
              {(showNewPanelForm ? newPanel.title : selectedPanel?.title) && (
                <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)', fontSize: '17px', fontWeight: '700' }}>
                  {showNewPanelForm ? newPanel.title : selectedPanel.title}
                </h3>
              )}
              {(showNewPanelForm ? newPanel.description : selectedPanel?.description) && (
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '14px' }}>
                  {showNewPanelForm ? newPanel.description : selectedPanel.description}
                </p>
              )}
              
              {(showNewPanelForm ? newPanel.image : selectedPanel?.image) && (
                <img 
                  src={showNewPanelForm ? newPanel.image : selectedPanel.image} 
                  alt="" 
                  style={{ width: '100%', borderRadius: '10px', marginTop: '14px', border: '1px solid var(--border-secondary)' }} 
                />
              )}

              {(showNewPanelForm ? newPanel.thumbnail : selectedPanel?.thumbnail) && (
                <img 
                  src={showNewPanelForm ? newPanel.thumbnail : selectedPanel.thumbnail} 
                  alt="" 
                  style={{ width: '80px', float: 'right', borderRadius: '8px', border: '1px solid var(--border-secondary)', marginLeft: '12px' }} 
                />
              )}

              {(showNewPanelForm ? newPanel.footer?.text : selectedPanel?.footer?.text) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-secondary)', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  {(showNewPanelForm ? newPanel.footer?.iconURL : selectedPanel?.footer?.iconURL) && (
                    <img 
                      src={showNewPanelForm ? newPanel.footer.iconURL : selectedPanel.footer.iconURL} 
                      alt="" 
                      style={{ width: '20px', height: '20px', borderRadius: '50%' }} 
                    />
                  )}
                  <span>{showNewPanelForm ? newPanel.footer.text : selectedPanel.footer.text}</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <FaEye style={{ fontSize: '48px', opacity: 0.3, marginBottom: '16px' }} />
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Preview will appear here</p>
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Panel"
          message={`Are you sure you want to delete "${confirmDelete.name || confirmDelete.title}"?`}
          onConfirm={() => deletePanel(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

export default PanelsNew;
