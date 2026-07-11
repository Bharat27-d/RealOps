import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaInfoCircle, FaSave, FaPaperPlane, FaEye } from 'react-icons/fa';
import { panels, discord } from '../services/api';

const PANEL_TYPES = [
  { id: 'support', name: 'Support Panel' },
  { id: 'hr', name: 'HR Panel' },
  { id: 'partnership', name: 'Partnership Panel' },
  { id: 'founder', name: 'Founder Panel' },
  { id: 'bookus', name: 'Book Us Panel' },
  { id: 'jointeam', name: 'Join Team Panel' },
  { id: 'bookslot', name: 'Book Slot Panel' }
];

function Panels() {
  const [selectedType, setSelectedType] = useState('support');
  const [panelData, setPanelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [channelSearch, setChannelSearch] = useState('');
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const channelDropdownRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedType) {
      loadPanel(selectedType);
    }
  }, [selectedType]);

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
    try {
      const channelsRes = await discord.getChannels();
      setChannels(channelsRes.data.filter(ch => ch.type === 0)); // Only text channels
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPanel = async (type) => {
    setLoading(true);
    try {
      const response = await panels.getByType(type);
      setPanelData(response.data);
    } catch (error) {
      console.error('Failed to load panel:', error);
      setPanelData(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleButton = async (buttonId, currentState) => {
    try {
      const isCurrentlyEnabled = currentState !== false;
      const newState = !isCurrentlyEnabled;
      
      await panels.toggleButton(buttonId, newState);
      toast.success(`Button ${newState ? 'enabled' : 'disabled'} successfully`);
      loadPanel(selectedType);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to toggle button');
    }
  };

  const savePanel = async () => {
    try {
      const response = await panels.save(panelData);
      toast.success(response.data.message || 'Panel updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save panel');
    }
  };

  const deployPanel = async () => {
    if (!selectedChannel) {
      toast.error('Please select a channel first');
      return;
    }

    setDeploying(true);
    try {
      const response = await panels.deploy(panelData.type, selectedChannel);
      toast.success(response.data.message || 'Panel deployed successfully!');
      setSelectedChannel('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to deploy panel');
    } finally {
      setDeploying(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Loading panel configurations...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-title">
        <div>
          <div className="page-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '11px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>
            RealOps Portal / Bot System
          </div>
          <h1>
            <FaInfoCircle /> Interactive Panel Management
          </h1>
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
          <strong style={{ color: '#10B981' }}>Direct Configuration Sync:</strong> Changes modified and saved in this editor are directly written to the bot panel definitions (<code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>bot/panels/*.js</code>) and take immediate effect.
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h2>Panel Editor & Configuration</h2>
          </div>

          <div className="form-group">
            <label className="form-label">Select Panel Type</label>
            <select className="form-select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              {PANEL_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          {panelData && (
            <>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input 
                  className="form-input"
                  type="text"
                  value={panelData.title}
                  onChange={(e) => setPanelData({...panelData, title: e.target.value})}
                  placeholder="Panel Title"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description Markdown</label>
                <textarea 
                  className="form-textarea"
                  value={panelData.description}
                  onChange={(e) => setPanelData({...panelData, description: e.target.value})}
                  placeholder="Panel description markdown content..."
                  rows={5}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Embed Accent Color</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="color"
                    value={panelData.color || '#6366F1'}
                    onChange={(e) => setPanelData({...panelData, color: e.target.value})}
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
                    value={panelData.color || '#6366F1'}
                    onChange={(e) => setPanelData({...panelData, color: e.target.value})}
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
                  value={panelData.thumbnail || ''}
                  onChange={(e) => setPanelData({...panelData, thumbnail: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Banner Image URL</label>
                <input 
                  className="form-input"
                  type="text"
                  value={panelData.image || ''}
                  onChange={(e) => setPanelData({...panelData, image: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-2" style={{ gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Footer Text</label>
                  <input 
                    className="form-input"
                    type="text"
                    value={panelData.footer?.text || ''}
                    onChange={(e) => setPanelData({...panelData, footer: {...panelData.footer, text: e.target.value}})}
                    placeholder="Footer text"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Footer Icon URL</label>
                  <input 
                    className="form-input"
                    type="text"
                    value={panelData.footer?.iconURL || ''}
                    onChange={(e) => setPanelData({...panelData, footer: {...panelData.footer, iconURL: e.target.value}})}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {panelData.buttons && panelData.buttons.length > 0 && (
                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label className="form-label">Interactive Buttons</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {panelData.buttons.map((btn, index) => (
                      <div key={index} style={{ 
                        padding: '12px 16px', 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-secondary)',
                        borderRadius: '10px', 
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '18px' }}>{btn.emoji}</span>
                        <span style={{ color: 'var(--text-primary)', flex: 1, fontWeight: '600', fontSize: '14px' }}>{btn.label}</span>
                        <button
                          onClick={() => toggleButton(btn.customId, btn.enabled)}
                          className={btn.enabled !== false ? 'badge badge-success' : 'badge badge-danger'}
                          style={{
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            padding: '6px 12px',
                            fontWeight: '600'
                          }}
                        >
                          {btn.enabled !== false ? 'Active' : 'Disabled'}
                        </button>
                        <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                          {btn.style}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn" onClick={savePanel} style={{ width: '100%', marginTop: '24px' }}>
                <FaSave /> Save Changes to Panel Configuration
              </button>

              <div style={{ 
                marginTop: '14px', 
                padding: '12px 16px', 
                background: 'var(--bg-tertiary)', 
                border: '1px solid var(--border-secondary)',
                borderRadius: '8px', 
                fontSize: '13px', 
                color: 'var(--text-secondary)' 
              }}>
                💾 Persists changes directly to <code style={{ 
                  color: 'var(--primary)',
                  fontWeight: '600'
                }}>
                  bot/panels/{panelData.type}panel.js
                </code>
              </div>

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
                  Deploy Live to Discord
                </h3>
                
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Destination Channel</label>
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
                        {channels.filter(ch => ch.name.toLowerCase().includes(channelSearch.toLowerCase())).length === 0 && (
                          <div style={{ padding: '14px', color: 'var(--text-tertiary)', textAlign: 'center', fontSize: '13px' }}>
                            No channels found
                          </div>
                        )}
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
                  {deploying ? 'Deploying to Discord...' : <><FaPaperPlane /> Send Panel to Channel</>}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Live Discord Embed Preview</h2>
          </div>
          {panelData ? (
            <div style={{ 
              borderLeft: `4px solid ${panelData.color || 'var(--primary)'}`,
              background: 'var(--bg-tertiary)',
              borderTop: '1px solid var(--border-secondary)',
              borderRight: '1px solid var(--border-secondary)',
              borderBottom: '1px solid var(--border-secondary)',
              padding: '20px',
              borderRadius: '12px' 
            }}>
              {panelData.title && <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)', fontSize: '17px', fontWeight: '700' }}>{panelData.title}</h3>}
              {panelData.description && <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '14px' }}>{panelData.description}</p>}
              
              {panelData.image && (
                <img src={panelData.image} alt="" style={{ width: '100%', borderRadius: '10px', marginTop: '14px', border: '1px solid var(--border-secondary)' }} />
              )}

              {panelData.thumbnail && (
                <img src={panelData.thumbnail} alt="" style={{ width: '80px', float: 'right', borderRadius: '8px', border: '1px solid var(--border-secondary)', marginLeft: '12px' }} />
              )}

              {panelData.footer?.text && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-secondary)', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  {panelData.footer.iconURL && <img src={panelData.footer.iconURL} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />}
                  <span>{panelData.footer.text}</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <FaEye style={{ fontSize: '48px', color: 'var(--text-tertiary)', opacity: 0.4, marginBottom: '16px' }} />
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '500' }}>Select a panel type to preview</p>
            </div>
          )}

          <div style={{ 
            marginTop: '24px', 
            padding: '20px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-secondary)',
            borderRadius: '12px'
          }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)', fontSize: '15px', fontWeight: '700' }}>Available Panel Types</h4>
            <ul style={{ marginTop: '10px', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {PANEL_TYPES.map(type => (
                <li 
                  key={type.id} 
                  onClick={() => setSelectedType(type.id)}
                  style={{ 
                    color: selectedType === type.id ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: selectedType === type.id ? '600' : '400',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: selectedType === type.id ? 'var(--primary-subtle)' : 'transparent',
                    borderLeft: selectedType === type.id ? '3px solid var(--primary)' : '3px solid transparent',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedType !== type.id) e.currentTarget.style.background = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedType !== type.id) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {type.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Panels;
