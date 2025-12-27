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

  // New panel form state
  const [newPanel, setNewPanel] = useState({
    name: '',
    title: '',
    description: '',
    color: '#5865F2',
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
      setChannels(channelsRes.data.filter(ch => ch.type === 0)); // Only text channels
      
      // Select first panel by default
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
        color: '#5865F2',
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
      // Update built-in panel
      try {
        await panels.save(panelData);
        toast.success('Panel updated successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to update panel');
      }
    } else {
      // Update custom panel
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
          <strong>Panel Management:</strong> Create custom ticket panels for special events (e.g., anniversary slot booking), enable/disable panels, and deploy them to Discord channels.
        </div>
      </div>

      <div className="grid grid-3" style={{ gridTemplateColumns: '280px 1fr 1fr' }}>
        {/* Panel List Sidebar */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Panels</h3>
            <button 
              className="btn btn-sm" 
              onClick={() => setShowNewPanelForm(!showNewPanelForm)}
              style={{ 
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#000',
                padding: '6px 12px'
              }}
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
                  padding: '12px',
                  margin: '8px 0',
                  background: selectedPanel?.id === panel.id || selectedPanel?.type === panel.type ? '#2a2a2a' : '#1a1a1a',
                  border: `1px solid ${selectedPanel?.id === panel.id || selectedPanel?.type === panel.type ? '#FFD700' : '#333'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FFD700'}
                onMouseLeave={(e) => {
                  if (selectedPanel?.id !== panel.id && selectedPanel?.type !== panel.type) {
                    e.currentTarget.style.borderColor = '#333';
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '600', color: panel.enabled !== false ? '#FFD700' : '#666' }}>
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
                        color: panel.enabled !== false ? '#27ae60' : '#666',
                        fontSize: '16px'
                      }}
                    >
                      {panel.enabled !== false ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#888' }}>
                  {panel.isBuiltIn ? 'Built-in' : 'Custom'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Editor */}
        <div className="card">
          <div className="card-header">
            <h3>
              {showNewPanelForm ? 'Create New Panel' : 'Panel Editor'}
            </h3>
          </div>

          {showNewPanelForm ? (
            // New Panel Form
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
                    value={newPanel.color}
                    onChange={(e) => setNewPanel({...newPanel, color: e.target.value})}
                    placeholder="#5865F2"
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
                className="btn btn-outline" 
                onClick={() => setShowNewPanelForm(false)} 
                style={{ width: '100%', marginTop: '10px' }}
              >
                Cancel
              </button>
            </>
          ) : selectedPanel ? (
            // Edit Existing Panel
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
                    value={selectedPanel.color}
                    onChange={(e) => setSelectedPanel({...selectedPanel, color: e.target.value})}
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
                    value={selectedPanel.color}
                    onChange={(e) => setSelectedPanel({...selectedPanel, color: e.target.value})}
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
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <FaEye style={{ fontSize: '48px', color: '#FFD700', marginBottom: '16px' }} />
              <p>Select a panel or create a new one</p>
            </div>
          )}
        </div>

        {/* Live Preview */}
        <div className="card">
          <div className="card-header">
            <h3>Live Preview</h3>
          </div>
          {(selectedPanel || showNewPanelForm) ? (
            <div style={{ 
              borderLeft: `4px solid ${showNewPanelForm ? newPanel.color : selectedPanel.color}`,
              background: '#1a1a1a',
              padding: '18px',
              borderRadius: '8px' 
            }}>
              {(showNewPanelForm ? newPanel.title : selectedPanel?.title) && (
                <h3 style={{ marginBottom: '12px', color: '#FFD700', fontSize: '18px' }}>
                  {showNewPanelForm ? newPanel.title : selectedPanel.title}
                </h3>
              )}
              {(showNewPanelForm ? newPanel.description : selectedPanel?.description) && (
                <p style={{ color: '#ccc', marginBottom: '12px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {showNewPanelForm ? newPanel.description : selectedPanel.description}
                </p>
              )}
              
              {(showNewPanelForm ? newPanel.image : selectedPanel?.image) && (
                <img 
                  src={showNewPanelForm ? newPanel.image : selectedPanel.image} 
                  alt="" 
                  style={{ width: '100%', borderRadius: '8px', marginTop: '15px', border: '1px solid #2a2a2a' }} 
                />
              )}

              {(showNewPanelForm ? newPanel.thumbnail : selectedPanel?.thumbnail) && (
                <img 
                  src={showNewPanelForm ? newPanel.thumbnail : selectedPanel.thumbnail} 
                  alt="" 
                  style={{ width: '80px', float: 'right', borderRadius: '8px', border: '1px solid #2a2a2a' }} 
                />
              )}

              {(showNewPanelForm ? newPanel.footer?.text : selectedPanel?.footer?.text) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', fontSize: '12px', color: '#888' }}>
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
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <FaEye style={{ fontSize: '48px', color: '#FFD700', marginBottom: '16px' }} />
              <p>Preview will appear here</p>
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
