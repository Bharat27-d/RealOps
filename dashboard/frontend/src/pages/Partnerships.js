import React, { useState, useEffect } from 'react';
import { partnerships, discord } from '../services/api';
import { toast } from 'react-toastify';
import { FaHandshake, FaBullhorn } from 'react-icons/fa';
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
        color: '#6366F1',
        thumbnail: 'https://cdn.discordapp.com/attachments/1291127061434716282/1321518479803801651/image.png?ex=677094d8&is=676f4358&hm=8cd9c1e4f5e5e91d0c6b23b5e9f4d9e8e8f8e8f8e8f8e8f8e8f8e8f8e8f8&',
        image: 'https://i.postimg.cc/rwWZ5RZh/new-partnership.png',
        timestamp: true
      };

      const content = quickAnnounceData.roleToTag ? `<@&${quickAnnounceData.roleToTag}>` : '';

      const result = await partnerships.announceQuick(quickAnnounceData.announcementChannelId, embedData, content);
      
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

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-title">
        <div>
          <div className="page-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '11px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>
            RealOps Portal / Management
          </div>
          <h1>
            <FaHandshake /> Community Partnerships
          </h1>
        </div>
        <button className="btn" onClick={() => setShowQuickAnnounce(true)} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '600' }}>
          <FaBullhorn /> Announce Partnership
        </button>
      </div>

      {showQuickAnnounce && (
        <div className="modal-overlay" onClick={() => setShowQuickAnnounce(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1050px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>
                <FaBullhorn /> Quick Partnership Announcement
              </h3>
              <button className="modal-close" onClick={() => setShowQuickAnnounce(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid grid-2" style={{ gap: '32px' }}>
                {/* Left Column - Form Fields */}
                <div>
                  <div className="form-group">
                    <label className="form-label">Partner Name *</label>
                    <input
                      type="text"
                      value={quickAnnounceData.partnerName}
                      onChange={(e) => setQuickAnnounceData({ ...quickAnnounceData, partnerName: e.target.value })}
                      placeholder="Enter partner name (e.g., Liminal Logistics)"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Partner Invite Link *</label>
                    <input
                      type="text"
                      value={quickAnnounceData.partnerLink}
                      onChange={(e) => setQuickAnnounceData({ ...quickAnnounceData, partnerLink: e.target.value })}
                      placeholder="https://discord.gg/... or any URL"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Announcement Destination Channel *</label>
                    <select
                      value={quickAnnounceData.announcementChannelId}
                      onChange={(e) => setQuickAnnounceData({ ...quickAnnounceData, announcementChannelId: e.target.value })}
                      className="form-select"
                    >
                      <option value="">Select Channel</option>
                      {channels.map(ch => (
                        <option key={ch.id} value={ch.id}># {ch.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tag Alert Role (Optional)</label>
                    <select
                      value={quickAnnounceData.roleToTag}
                      onChange={(e) => setQuickAnnounceData({ ...quickAnnounceData, roleToTag: e.target.value })}
                      className="form-select"
                    >
                      <option value="">No role tag</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>@ {role.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                    <button className="btn" style={{ flex: 1 }} onClick={handleQuickAnnounce}>
                      <FaBullhorn /> Broadcast Announcement
                    </button>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowQuickAnnounce(false)}>
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Right Column - Preview */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ 
                    background: 'var(--bg-tertiary)', 
                    border: '1px solid var(--border-secondary)', 
                    borderRadius: '14px', 
                    padding: '20px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      📋 Live Discord Embed Preview
                    </h4>
                    <div style={{ 
                      background: 'var(--bg-secondary)', 
                      padding: '20px', 
                      borderRadius: '12px', 
                      borderLeft: '4px solid var(--primary)',
                      borderTop: '1px solid var(--border-secondary)',
                      borderRight: '1px solid var(--border-secondary)',
                      borderBottom: '1px solid var(--border-secondary)',
                      flex: 1
                    }}>
                      <p style={{ color: 'var(--text-primary)', margin: '0 0 14px 0', fontSize: '15px', fontWeight: '700' }}>
                        Partnership Announcement
                      </p>
                      <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                        We are excited to announce that we have a new Partnership with{' '}
                        <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '15px' }}>
                          {quickAnnounceData.partnerName || '[Partner Name]'}
                        </span>
                        {' '}🎉🎉🎉
                      </p>
                      {quickAnnounceData.partnerLink && (
                        <p style={{ color: 'var(--text-tertiary)', margin: '12px 0 0 0', fontSize: '13px', fontFamily: 'monospace' }}>
                          🔗 {quickAnnounceData.partnerLink}
                        </p>
                      )}
                      <img 
                        src="https://i.postimg.cc/rwWZ5RZh/new-partnership.png" 
                        alt="Partnership" 
                        style={{ 
                          width: '100%', 
                          marginTop: '16px', 
                          borderRadius: '10px', 
                          border: '1px solid var(--border-secondary)'
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

      <div style={{ marginTop: '20px' }}>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : partnershipList.length === 0 ? (
          <div className="card" style={{ 
            textAlign: 'center', 
            padding: '70px 40px',
            color: 'var(--text-tertiary)'
          }}>
            <FaHandshake size={56} style={{ marginBottom: '18px', opacity: 0.3 }} />
            <p style={{ fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 6px 0', fontWeight: '600' }}>
              No Community Partnerships Yet
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
              Click "Announce Partnership" to register and broadcast your first partnership
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px' }}>
            {partnershipList.map((partnership) => (
              <div key={partnership.id} className="card" style={{ 
                transition: 'all var(--transition-fast)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    paddingBottom: '16px',
                    marginBottom: '16px',
                    borderBottom: '1px solid var(--border-secondary)'
                  }}>
                    <div>
                      <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)', fontSize: '18px', fontWeight: '700' }}>
                        {partnership.name}
                      </h3>
                      <span className="badge badge-primary" style={{ fontSize: '12px' }}>
                        {partnership.serverName || 'Partner'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleAnnounce(partnership.id)}>
                        <FaBullhorn /> Announce
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDelete(partnership.id)}>
                        Delete
                      </button>
                    </div>
                  </div>

                  {partnership.serverInvite && (
                    <div style={{ 
                      marginBottom: '14px',
                      padding: '12px 14px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '10px',
                      borderLeft: '3px solid var(--primary)'
                    }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '12px', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Invite URL
                      </strong>
                      <a href={partnership.serverInvite} target="_blank" rel="noopener noreferrer" style={{ 
                        color: 'var(--primary)', 
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all'
                      }}>
                        {partnership.serverInvite}
                      </a>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-secondary)', marginTop: '12px' }}>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    Created: {partnership.createdAt ? new Date(partnership.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                  <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setSelectedPartnership(selectedPartnership === partnership.id ? null : partnership.id)}>
                    {selectedPartnership === partnership.id ? 'Hide Terms' : 'Send Terms'}
                  </button>
                </div>

                {selectedPartnership === partnership.id && (
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '16px', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: '12px',
                    border: '1px solid var(--border-secondary)'
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-primary)' }}>Dispatch Terms Agreement</h4>
                    <div className="form-group">
                      <label className="form-label">Delivery Method</label>
                      <select
                        className="form-select"
                        value={termsData.method}
                        onChange={(e) => setTermsData({ ...termsData, method: e.target.value })}
                      >
                        <option value="dm">Direct Message (DM)</option>
                        <option value="channel">Post to Channel</option>
                      </select>
                    </div>
                    {termsData.method === 'channel' && (
                      <div className="form-group">
                        <label className="form-label">Channel</label>
                        <select
                          className="form-select"
                          value={termsData.channelId}
                          onChange={(e) => setTermsData({ ...termsData, channelId: e.target.value })}
                        >
                          <option value="">Select Channel</option>
                          {channels.map(ch => (
                            <option key={ch.id} value={ch.id}># {ch.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                      <button className="btn" style={{ flex: 1, padding: '8px' }} onClick={() => handleSendTerms(partnership.id)}>
                        Send Now
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '8px 14px' }} onClick={() => setSelectedPartnership(null)}>
                        Cancel
                      </button>
                    </div>
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
        message="Are you sure you want to delete this partnership record? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, partnershipId: null })}
      />
    </div>
  );
}

export default Partnerships;
