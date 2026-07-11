import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaToggleOn, FaToggleOff, FaPaperPlane, FaInfoCircle } from 'react-icons/fa';
import { panels, discord } from '../services/api';

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
      const response = await panels.getAll();
      const states = {};
      
      HARDCODED_PANELS.forEach(panel => {
        const foundPanel = response.data.find(p => p.type === panel.id);
        states[panel.id] = foundPanel?.enabled !== false;
      });
      
      setPanelStates(states);

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
      
      await panels.updatePanelState(panelId, newState);
      
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
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-title">
        <div>
          <div className="page-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '11px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>
            RealOps Portal / Bot Operations
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
          <strong style={{ color: '#10B981' }}>Panel Management Overview:</strong> Enable or disable ticket panels and deploy them to Discord channels. Disabled panels will be visible but unclickable.
        </div>
      </div>

      {/* Channel Selector */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2>Select Channel for Deployment</h2>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <input
            type="text"
            placeholder="Search channels..."
            value={channelSearch}
            onChange={(e) => setChannelSearch(e.target.value)}
            className="form-input"
          />
        </div>
        
        {channelSearch && (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-secondary)',
            borderRadius: '10px',
            maxHeight: '220px',
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
                    padding: '10px 14px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--border-secondary)',
                    transition: 'background var(--transition-fast)',
                    fontSize: '13px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ color: 'var(--text-tertiary)' }}>#</span> <strong style={{ marginLeft: '4px' }}>{channel.name}</strong>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Panels Grid */}
      <div className="grid grid-2" style={{ gap: '24px' }}>
        {HARDCODED_PANELS.map(panel => {
          const isEnabled = panelStates[panel.id];
          
          return (
            <div key={panel.id} className="card">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '14px'
              }}>
                <h3 style={{ margin: 0, color: isEnabled ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '18px', fontWeight: '700' }}>
                  {panel.name}
                </h3>
                <button
                  onClick={() => togglePanel(panel.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '28px',
                    color: isEnabled ? '#10B981' : 'var(--text-tertiary)',
                    transition: 'all var(--transition-fast)'
                  }}
                  title={isEnabled ? 'Click to disable' : 'Click to enable'}
                >
                  {isEnabled ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
                {panel.description}
              </p>

              <div style={{ 
                padding: '10px 14px', 
                background: isEnabled ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-tertiary)',
                border: `1px solid ${isEnabled ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-secondary)'}`,
                borderRadius: '8px',
                marginBottom: '16px',
                textAlign: 'center',
                fontWeight: '700',
                fontSize: '13px',
                color: isEnabled ? '#10B981' : 'var(--text-tertiary)'
              }}>
                {isEnabled ? '✓ ENABLED & ACTIVE' : '✗ CURRENTLY DISABLED'}
              </div>

              <button 
                className={isEnabled ? "btn" : "btn btn-secondary"}
                onClick={() => deployPanel(panel.id)}
                disabled={!selectedChannel || deploying || !isEnabled}
                style={{ 
                  width: '100%',
                  opacity: !isEnabled ? 0.6 : 1,
                  cursor: !isEnabled ? 'not-allowed' : 'pointer'
                }}
                title={!isEnabled ? 'Panel is disabled' : 'Deploy to selected channel'}
              >
                {deploying ? 'Deploying...' : (
                  <>
                    <FaPaperPlane /> 
                    {isEnabled ? 'Deploy to Channel' : 'Panel Disabled'}
                  </>
                )}
              </button>

              {!isEnabled && (
                <p style={{ 
                  fontSize: '12px', 
                  color: 'var(--danger)', 
                  marginTop: '12px',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  ⚠️ This panel is disabled. Users will not be able to create tickets.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!selectedChannel && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'var(--primary-subtle)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'var(--primary)',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          ℹ️ Select a destination channel above to enable live panel deployment
        </div>
      )}
    </div>
  );
}

export default PanelsManagement;
