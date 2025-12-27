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
      setSelectedChannel(''); // Reset channel selection
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
    <div className="page-container">
      <div className="page-title">
        <h1><FaInfoCircle /> Panel Management</h1>
      </div>

      <div style={{ 
        padding: '18px 24px', 
        background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)', 
        border: '1px solid rgba(39, 174, 96, 0.3)', 
        borderRadius: '12px', 
        marginBottom: '25px',
        color: '#ffffff',
        boxShadow: '0 4px 12px rgba(39, 174, 96, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <FaInfoCircle size={20} />
        <div>
          <strong>Direct File Editing:</strong> Changes you make here will be written directly to the bot panel files (bot/panels/*.js) and are permanent.
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Panel Editor</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Panel Type</label>
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
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea"
                  value={panelData.description}
                  onChange={(e) => setPanelData({...panelData, description: e.target.value})}
                  placeholder="Panel description..."
                  rows={5}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="color"
                    value={panelData.color}
                    onChange={(e) => setPanelData({...panelData, color: e.target.value})}
                    style={{ 
                      width: '60px', 
                      height: '45px',
                      border: '2px solid #2a2a2a',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  />
                  <input 
                    className="form-input"
                    type="text"
                    value={panelData.color}
                    onChange={(e) => setPanelData({...panelData, color: e.target.value})}
                    placeholder="#00b894"
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
                <label className="form-label">Image URL</label>
                <input 
                  className="form-input"
                  type="text"
                  value={panelData.image || ''}
                  onChange={(e) => setPanelData({...panelData, image: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Footer Text</label>
                  <input 
                    type="text"
                    value={panelData.footer?.text || ''}
                    onChange={(e) => setPanelData({...panelData, footer: {...panelData.footer, text: e.target.value}})}
                    placeholder="Footer text"
                  />
                </div>
                <div className="form-group">
                  <label>Footer Icon URL</label>
                  <input 
                    type="text"
                    value={panelData.footer?.iconURL || ''}
                    onChange={(e) => setPanelData({...panelData, footer: {...panelData.footer, iconURL: e.target.value}})}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {panelData.buttons && panelData.buttons.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Panel Buttons</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {panelData.buttons.map((btn, index) => (
                      <div key={index} style={{ 
                        padding: '14px', 
                        background: '#1a1a1a', 
                        border: '1px solid #2a2a2a',
                        borderRadius: '8px', 
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '18px' }}>{btn.emoji}</span>
                        <span style={{ color: '#FFD700', flex: 1, fontWeight: '500' }}>{btn.label}</span>
                        <span className="badge" style={{ 
                          padding: '4px 10px', 
                          fontSize: '12px'
                        }}>
                          {btn.style}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn" onClick={savePanel} style={{ width: '100%', marginTop: '20px' }}>
                <FaSave style={{ marginRight: '8px' }} /> Save Changes to File
              </button>

              <div style={{ 
                marginTop: '15px', 
                padding: '14px', 
                background: 'rgba(255, 215, 0, 0.05)', 
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '8px', 
                fontSize: '14px', 
                color: '#FFD700' 
              }}>
                💾 Saves directly to <code style={{ 
                  background: '#0a0a0a', 
                  padding: '3px 8px', 
                  borderRadius: '4px',
                  color: '#FFA500',
                  border: '1px solid #2a2a2a'
                }}>
                  bot/panels/{panelData.type}panel.js
                </code>
              </div>

              {/* Deploy to Discord Section */}
              <div style={{ 
                marginTop: '25px', 
                padding: '20px', 
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '12px' 
              }}>
                <h3 style={{ 
                  marginBottom: '15px', 
                  color: '#FFD700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <FaPaperPlane />
                  Deploy to Discord
                </h3>
                
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label">Select Channel</label>
                  <div ref={channelDropdownRef} style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search channels..."
                      value={channelSearch}
                      onChange={(e) => {
                        setChannelSearch(e.target.value);
                        setShowChannelDropdown(true);
                      }}
                      onFocus={() => setShowChannelDropdown(true)}
                      style={{
                        background: '#2C2F33',
                        border: '1px solid #40444b',
                        color: '#dcddde',
                        padding: '10px',
                        borderRadius: '6px'
                      }}
                    />
                    
                    {showChannelDropdown && channelSearch && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '5px',
                        background: '#2C2F33',
                        border: '1px solid #40444b',
                        borderRadius: '6px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
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
                                padding: '12px 15px',
                                cursor: 'pointer',
                                color: '#dcddde',
                                borderBottom: '1px solid #40444b',
                                transition: 'background 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#40444b'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <span style={{ color: '#72767d' }}>#</span>
                              <span>{channel.name}</span>
                            </div>
                          ))}
                        {channels.filter(ch => ch.name.toLowerCase().includes(channelSearch.toLowerCase())).length === 0 && (
                          <div style={{ padding: '12px', color: '#72767d', textAlign: 'center' }}>
                            No channels found
                          </div>
                        )}
                        {channels.filter(ch => ch.name.toLowerCase().includes(channelSearch.toLowerCase())).length > 10 && (
                          <div style={{ padding: '8px 12px', color: '#72767d', fontSize: '12px', textAlign: 'center', background: '#23272A' }}>
                            Showing 10 of {channels.filter(ch => ch.name.toLowerCase().includes(channelSearch.toLowerCase())).length} results. Keep typing to refine...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  className="btn" 
                  onClick={deployPanel}
                  disabled={!selectedChannel || deploying}
                  style={{ width: '100%' }}
                >
                  {deploying ? 'Deploying...' : <><FaPaperPlane style={{ marginRight: '8px' }} /> Send Panel to Channel</>}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Live Preview</h3>
          </div>
          {panelData ? (
            <div style={{ 
              borderLeft: `4px solid ${panelData.color}`,
              background: '#1a1a1a',
              padding: '18px',
              borderRadius: '8px' 
            }}>
              {panelData.title && <h3 style={{ marginBottom: '12px', color: '#FFD700', fontSize: '18px' }}>{panelData.title}</h3>}
              {panelData.description && <p style={{ color: '#ccc', marginBottom: '12px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{panelData.description}</p>}
              
              {panelData.image && (
                <img src={panelData.image} alt="" style={{ width: '100%', borderRadius: '8px', marginTop: '15px', border: '1px solid #2a2a2a' }} />
              )}

              {panelData.thumbnail && (
                <img src={panelData.thumbnail} alt="" style={{ width: '80px', float: 'right', borderRadius: '8px', border: '1px solid #2a2a2a' }} />
              )}

              {panelData.footer?.text && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', fontSize: '12px', color: '#888' }}>
                  {panelData.footer.iconURL && <img src={panelData.footer.iconURL} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />}
                  <span>{panelData.footer.text}</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <FaEye style={{ fontSize: '48px', color: '#FFD700', marginBottom: '16px' }} />
              <p>Select a panel type to see preview</p>
            </div>
          )}

          <div style={{ 
            marginTop: '24px', 
            padding: '20px',
            background: 'rgba(255, 215, 0, 0.05)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            borderRadius: '8px'
          }}>
            <h4 style={{ marginBottom: '12px', color: '#FFD700' }}>Available Panel Types</h4>
            <ul style={{ marginTop: '10px', paddingLeft: '20px', lineHeight: '2', listStyle: 'none' }}>
              {PANEL_TYPES.map(type => (
                <li key={type.id} style={{ 
                  color: selectedType === type.id ? '#FFD700' : '#ccc',
                  fontWeight: selectedType === type.id ? '600' : 'normal',
                  paddingLeft: '12px',
                  borderLeft: selectedType === type.id ? '3px solid #FFD700' : '3px solid transparent',
                  transition: 'all 0.3s ease'
                }}>
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
