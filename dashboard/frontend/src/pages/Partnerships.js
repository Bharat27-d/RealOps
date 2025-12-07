import React, { useState, useEffect } from 'react';
import { partnerships, discord } from '../services/api';
import { toast } from 'react-toastify';
import { FaHandshake, FaPlus, FaPaperPlane, FaBullhorn } from 'react-icons/fa';
import ConfirmDialog from '../components/ConfirmDialog';

function Partnerships() {
  const [partnershipList, setPartnershipList] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartnership, setSelectedPartnership] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, partnershipId: null });

  const [termsData, setTermsData] = useState({
    method: 'dm',
    channelId: '',
    includeEmbed: true
  });

  const [showQuickAnnounce, setShowQuickAnnounce] = useState(false);
  const [quickAnnounceData, setQuickAnnounceData] = useState({
    partnerName: '',
    partnerLink: '',
    announcementChannelId: '1291127154188222544',
    roleToTag: '1291120505763401759'
  });

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchPartnerships();
    fetchChannels();
    fetchRoles();
  }, []);

  const fetchPartnerships = async () => {
    try {
      const response = await partnerships.getAll();
      setPartnershipList(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load partnerships');
      setLoading(false);
    }
  };
  const fetchChannels = async () => {
    try {
      const response = await discord.getChannels();
      setChannels(response.data);
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await discord.getRoles();
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };



  const handleStatusUpdate = async (id, newStatus, notes = '') => {
    try {
      await partnerships.updateStatus(id, newStatus, notes);
      toast.success(`Partnership status updated to ${newStatus}`);
      fetchPartnerships();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSendTerms = async (id) => {
    try {
      await partnerships.sendTerms(id, termsData);
      toast.success(termsData.method === 'dm' ? 'Terms sent via DM' : 'Terms posted to channel');
      setSelectedPartnership(null);
    } catch (error) {
      toast.error('Failed to send terms');
    }
  };

  const handleAnnounce = async (id) => {
    const channelId = window.prompt('Enter Channel ID for announcement:');
    if (channelId) {
      try {
        await partnerships.announce(id, channelId);
        toast.success('Partnership announced successfully!');
      } catch (error) {
        toast.error('Failed to announce partnership');
      }
    }
  };

  const handleQuickAnnounce = async () => {
    if (!quickAnnounceData.partnerName || !quickAnnounceData.partnerLink || !quickAnnounceData.announcementChannelId) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const embedData = {
        title: 'Partnership Announcement',
        description: `We are excited to announce that we have a new Partnership with [${quickAnnounceData.partnerName}](${quickAnnounceData.partnerLink})🎉🎉🎉`,
        color: '#FF0000',
        thumbnail: 'https://cdn.discordapp.com/attachments/1291127061434716282/1321518479803801651/image.png?ex=677094d8&is=676f4358&hm=8cd9c1e4f5e5e91d0c6b23b5e9f4d9e8e8f8e8f8e8f8e8f8e8f8e8f8e8f8&',
        image: 'https://i.postimg.cc/rwWZ5RZh/new-partnership.png',
        timestamp: true
      };

      const content = quickAnnounceData.roleToTag ? `<@&${quickAnnounceData.roleToTag}>` : '';

      const result = await partnerships.announceQuick(quickAnnounceData.announcementChannelId, embedData, content);
      
      // Create partnership record
      await partnerships.create({
        name: `Partnership with ${quickAnnounceData.partnerName}`,
        serverName: quickAnnounceData.partnerName,
        serverInvite: quickAnnounceData.partnerLink,
        type: 'cross-promotion',
        status: 'active',
        announcedAt: new Date().toISOString(),
        announcementChannelId: quickAnnounceData.announcementChannelId,
        announcementMessageId: result.messageId
      });
      
      toast.success('Partnership announced successfully!');
      setShowQuickAnnounce(false);
      setQuickAnnounceData({
        partnerName: '',
        partnerLink: '',
        announcementChannelId: '1291127154188222544',
        roleToTag: '1291120505763401759'
      });
      fetchPartnerships();
    } catch (error) {
      toast.error('Failed to announce partnership: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({ isOpen: true, partnershipId: id });
  };

  const confirmDelete = async () => {
    try {
      await partnerships.delete(confirmDialog.partnershipId);
      toast.success('Partnership deleted');
      setConfirmDialog({ isOpen: false, partnershipId: null });
      fetchPartnerships();
    } catch (error) {
      toast.error('Failed to delete partnership');
      setConfirmDialog({ isOpen: false, partnershipId: null });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      active: '#28a745',
      inactive: '#6c757d',
      rejected: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  return (
    <div className="page-container">
      <div className="page-title" style={{ marginBottom: '30px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px' }}>
          <FaHandshake style={{ color: '#FFD700' }} /> Partnership Management
        </h1>
        <button className="btn" onClick={() => setShowQuickAnnounce(true)} style={{ padding: '12px 24px', fontSize: '15px', fontWeight: '600' }}>
          <FaBullhorn style={{ marginRight: '8px' }} /> Announce Partnership
        </button>
      </div>

      {showQuickAnnounce && (
        <div className="modal-overlay" onClick={() => setShowQuickAnnounce(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1200px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ padding: '25px 30px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '22px' }}>
                <FaBullhorn style={{ color: '#FFD700' }} /> Quick Partnership Announcement
              </h3>
              <button className="modal-close" onClick={() => setShowQuickAnnounce(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              {/* Left Column - Form Fields */}
              <div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block', color: '#FFD700' }}>Partner Name *</label>
                <input
                  type="text"
                  value={quickAnnounceData.partnerName}
                  onChange={(e) => setQuickAnnounceData({ ...quickAnnounceData, partnerName: e.target.value })}
                  placeholder="Enter partner name (e.g., Liminal Logistics)"
                  className="form-input"
                  style={{ fontSize: '14px', padding: '12px 16px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block', color: '#FFD700' }}>Partner Link/Invite *</label>
                <input
                  type="text"
                  value={quickAnnounceData.partnerLink}
                  onChange={(e) => setQuickAnnounceData({ ...quickAnnounceData, partnerLink: e.target.value })}
                  placeholder="https://discord.gg/... or any URL"
                  className="form-input"
                  style={{ fontSize: '14px', padding: '12px 16px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block', color: '#FFD700' }}>Announcement Channel *</label>
                <select
                  value={quickAnnounceData.announcementChannelId}
                  onChange={(e) => setQuickAnnounceData({ ...quickAnnounceData, announcementChannelId: e.target.value })}
                  className="form-select"
                  style={{ fontSize: '14px', padding: '12px 16px' }}
                >
                  <option value="">Select Channel</option>
                  {channels.map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block', color: '#FFD700' }}>Tag Role (Optional)</label>
                <select
                  value={quickAnnounceData.roleToTag}
                  onChange={(e) => setQuickAnnounceData({ ...quickAnnounceData, roleToTag: e.target.value })}
                  className="form-select"
                  style={{ fontSize: '14px', padding: '12px 16px' }}
                >
                  <option value="">No role tag</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '30px', gridColumn: '1 / -1' }}>
                <button className="btn" style={{ flex: 1, padding: '14px 24px', fontSize: '15px', fontWeight: '600' }} onClick={handleQuickAnnounce}>
                  <FaBullhorn style={{ marginRight: '8px' }} /> Send Announcement
                </button>
                <button className="btn-secondary" style={{ flex: 1, padding: '14px 24px', fontSize: '15px', fontWeight: '600' }} onClick={() => setShowQuickAnnounce(false)}>
                  Cancel
                </button>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                background: '#1a1a1a', 
                border: '2px solid #FFD700', 
                borderRadius: '8px', 
                padding: '20px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <h4 style={{ margin: '0 0 20px 0', color: '#FFD700', fontSize: '16px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  📋 Live Preview
                </h4>
                <div style={{ 
                  background: '#0a0a0a', 
                  padding: '24px', 
                  borderRadius: '8px', 
                  borderLeft: '4px solid #FFD700',
                  flex: 1
                }}>
                  <p style={{ color: '#FFD700', margin: '0 0 18px 0', fontSize: '15px', fontWeight: '700' }}>
                    Partnership Announcement
                  </p>
                  <p style={{ color: '#ccc', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                    We are excited to announce that we have a new Partnership with{' '}
                    <span style={{ color: '#FFD700', fontWeight: '700', fontSize: '15px' }}>
                      {quickAnnounceData.partnerName || '[Partner Name]'}
                    </span>
                    {' '}🎉🎉🎉
                  </p>
                  {quickAnnounceData.partnerLink && (
                    <p style={{ color: '#888', margin: '12px 0 0 0', fontSize: '13px', fontFamily: 'monospace' }}>
                      🔗 {quickAnnounceData.partnerLink}
                    </p>
                  )}
                  <img 
                    src="https://i.postimg.cc/rwWZ5RZh/new-partnership.png" 
                    alt="Partnership" 
                    style={{ 
                      width: '100%', 
                      marginTop: '18px', 
                      borderRadius: '8px', 
                      border: '2px solid #333',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
          </div>
          </div>
        </div>
      )}

      <div className="partnerships-list" style={{ marginTop: '20px' }}>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : partnershipList.length === 0 ? (
          <div className="card" style={{ 
            textAlign: 'center', 
            padding: '80px 40px',
            background: '#1a1a1a',
            border: '2px dashed #333',
            borderRadius: '12px'
          }}>
            <FaHandshake size={100} style={{ color: '#FFD700', marginBottom: '24px', opacity: 0.5 }} />
            <p style={{ fontSize: '20px', color: '#888', margin: '0 0 8px 0', fontWeight: '600' }}>
              No partnerships yet
            </p>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              Click "Announce Partnership" to create your first partnership announcement
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
          {partnershipList.map((partnership) => (
            <div key={partnership.id} className="card" style={{ 
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FFD700';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#333';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                paddingBottom: '18px',
                marginBottom: '18px',
                borderBottom: '2px solid #333'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 12px 0', color: '#FFD700', fontSize: '22px', fontWeight: '700' }}>
                    {partnership.name}
                  </h3>
                  <span className="badge-info" style={{ fontSize: '13px', padding: '6px 14px', fontWeight: '600' }}>
                    {partnership.serverName}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn" onClick={() => handleAnnounce(partnership.id)} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '600' }}>
                    <FaBullhorn style={{ marginRight: '6px' }} /> Announce
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(partnership.id)} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '600' }}>
                    Delete
                  </button>
                </div>
              </div>

              <div>
                {partnership.serverInvite && (
                  <div style={{ 
                    marginBottom: '14px',
                    padding: '12px',
                    background: '#0a0a0a',
                    borderRadius: '6px',
                    borderLeft: '3px solid #FFD700'
                  }}>
                    <strong style={{ color: '#FFD700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                      🔗 Partnership Invite
                    </strong>
                    <a href={partnership.serverInvite} target="_blank" rel="noopener noreferrer" style={{ 
                      color: '#FFA500', 
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all'
                    }}>
                      {partnership.serverInvite}
                    </a>
                  </div>
                )}
                {partnership.createdAt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#FFD700', fontSize: '13px', fontWeight: '600' }}>📅</span>
                    <span style={{ color: '#888', fontSize: '14px' }}>
                      Created {new Date(partnership.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
              </div>

              {selectedPartnership === partnership.id && (
                <div className="terms-sender">
                  <h4>Send Partnership Terms</h4>
                  <div className="form-group">
                    <label>Method</label>
                    <select
                      value={termsData.method}
                      onChange={(e) => setTermsData({ ...termsData, method: e.target.value })}
                    >
                      <option value="dm">Direct Message</option>
                      <option value="channel">Channel Post</option>
                    </select>
                  </div>
                  {termsData.method === 'channel' && (
                    <div className="form-group">
                      <label>Channel</label>
                      <select
                        value={termsData.channelId}
                        onChange={(e) => setTermsData({ ...termsData, channelId: e.target.value })}
                      >
                        <option value="">Select Channel</option>
                        {channels.map(ch => (
                          <option key={ch.id} value={ch.id}>{ch.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={termsData.includeEmbed}
                        onChange={(e) => setTermsData({ ...termsData, includeEmbed: e.target.checked })}
                      />
                      Include formatted embed
                    </label>
                  </div>
                  <button className="btn btn-primary" onClick={() => handleSendTerms(partnership.id)}>
                    Send Terms Now
                  </button>
                  <button className="btn btn-secondary" onClick={() => setSelectedPartnership(null)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Partnership"
        message="Are you sure you want to delete this partnership? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, partnershipId: null })}
      />
    </div>
  );
}

export default Partnerships;
