import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaToggleOn, FaToggleOff, FaPaperPlane, FaInfoCircle } from 'react-icons/fa';
import { panels, discord } from '../services/api';

// Hardcoded panel list
const HARDCODED_PANELS = [
  { id: 'support', name: 'Support Panel', description: 'General support and enquiries' },
  { id: 'bookus', name: 'Book Us Panel', description: 'Event booking requests' },
  { id: 'partnership', name: 'Partnership Panel', description: 'Partnership applications' },
  { id: 'jointeam', name: 'Join Team Panel', description: 'Staff recruitment applications' },
  { id: 'hr', name: 'HR Panel', description: 'HR complaints and reports' },
  { id: 'founder', name: 'Founder Panel', description: 'Contact management/founders' }
];

function PanelsManagement() {
  const [panelStates, setPanelStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [channelSearch, setChannelSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch panel states from backend
      const response = await panels.getAll();
      const states = {};
      
      // Initialize all hardcoded panels
      HARDCODED_PANELS.forEach(panel => {
        const foundPanel = response.data.find(p => p.type === panel.id);
        states[panel.id] = foundPanel?.enabled !== false; // Default to enabled if not found
      });
      
      setPanelStates(states);

      // Fetch channels
      const channelsRes = await discord.getChannels();
      setChannels(channelsRes.data.filter(ch => ch.type === 0));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load panel data');
    } finally {
      setLoading(false);
    }
  };

  const togglePanel = async (panelId) => {
    try {
      const newState = !panelStates[panelId];
      
      // Update backend
      await panels.updatePanelState(panelId, newState);
      
      // Update local state
      setPanelStates(prev => ({
        ...prev,
        [panelId]: newState
      }));
      
      toast.success(`Panel ${newState ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      console.error('Failed to toggle panel:', error);
      toast.error('Failed to update panel state');
    }
  };

  const deployPanel = async (panelId) => {
    if (!selectedChannel) {
      toast.error('Please select a channel first');
      return;
    }

    if (!panelStates[panelId]) {
      toast.error('This panel is currently disabled');
      return;
    }

    setDeploying(true);
    try {
      await panels.deploy(panelId, selectedChannel);
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
          <strong>Panel Management:</strong> Enable/disable ticket panels and deploy them to Discord channels. Disabled panels will be visible but unclickable.
        </div>
      </div>

      {/* Channel Selector */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Select Channel for Deployment</h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="Search channels..."
            value={channelSearch}
            onChange={(e) => setChannelSearch(e.target.value)}
            style={{
              background: '#2C2F33',
              border: '1px solid #40444b',
              color: '#dcddde',
              padding: '10px',
              borderRadius: '6px',
              width: '100%'
            }}
          />
        </div>
        
        {channelSearch && (
          <div style={{
            background: '#2C2F33',
            border: '1px solid #40444b',
            borderRadius: '6px',
            maxHeight: '200px',
            overflowY: 'auto',
            marginTop: '10px'
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
                  }}
                  style={{
                    padding: '12px 15px',
                    cursor: 'pointer',
                    color: '#dcddde',
                    borderBottom: '1px solid #40444b',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#40444b'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ color: '#72767d' }}>#</span> {channel.name}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Panels Grid */}
      <div className="grid grid-2">
        {HARDCODED_PANELS.map(panel => {
          const isEnabled = panelStates[panel.id];
          
          return (
            <div key={panel.id} className="card">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <h3 style={{ margin: 0, color: isEnabled ? '#FFD700' : '#666' }}>
                  {panel.name}
                </h3>
                <button
                  onClick={() => togglePanel(panel.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '32px',
                    color: isEnabled ? '#27ae60' : '#666',
                    transition: 'all 0.3s'
                  }}
                  title={isEnabled ? 'Click to disable' : 'Click to enable'}
                >
                  {isEnabled ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>

              <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px' }}>
                {panel.description}
              </p>

              <div style={{ 
                padding: '12px', 
                background: isEnabled ? 'rgba(39, 174, 96, 0.1)' : 'rgba(102, 102, 102, 0.1)',
                border: `1px solid ${isEnabled ? 'rgba(39, 174, 96, 0.3)' : 'rgba(102, 102, 102, 0.3)'}`,
                borderRadius: '8px',
                marginBottom: '15px',
                textAlign: 'center',
                fontWeight: '600',
                color: isEnabled ? '#27ae60' : '#666'
              }}>
                {isEnabled ? '✓ ENABLED' : '✗ DISABLED'}
              </div>

              <button 
                className="btn" 
                onClick={() => deployPanel(panel.id)}
                disabled={!selectedChannel || deploying || !isEnabled}
                style={{ 
                  width: '100%',
                  opacity: !isEnabled ? 0.5 : 1,
                  cursor: !isEnabled ? 'not-allowed' : 'pointer',
                  background: !isEnabled ? '#666' : 'linear-gradient(135deg, #FFD700, #FFA500)'
                }}
                title={!isEnabled ? 'Panel is disabled' : 'Deploy to selected channel'}
              >
                {deploying ? 'Deploying...' : (
                  <>
                    <FaPaperPlane style={{ marginRight: '8px' }} /> 
                    {isEnabled ? 'Deploy to Channel' : 'Panel Disabled'}
                  </>
                )}
              </button>

              {!isEnabled && (
                <p style={{ 
                  fontSize: '12px', 
                  color: '#e74c3c', 
                  marginTop: '10px',
                  textAlign: 'center'
                }}>
                  ⚠️ This panel is disabled. Users cannot create tickets.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!selectedChannel && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#FFD700'
        }}>
          ℹ️ Select a channel above to enable panel deployment
        </div>
      )}
    </div>
  );
}

export default PanelsManagement;
