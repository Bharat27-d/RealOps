import React, { useState, useEffect } from 'react';
import { partnerships, discord } from '../services/api';
import { toast } from 'react-toastify';
import { FaHandshake, FaBullhorn, FaPlus } from 'react-icons/fa';
import ConfirmDialog from '../components/ConfirmDialog';

function Partnerships() {
  const [partnershipList, setPartnershipList] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartnership, setSelectedPartnership] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, partnershipId: null });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ id: null, logo: '' });

  const [termsData, setTermsData] = useState({
    method: 'dm',
    channelId: '',
    includeEmbed: true
  });

  // Add Partnership modal state
  const [showAddPartnership, setShowAddPartnership] = useState(false);
  const [addPartnershipData, setAddPartnershipData] = useState({
    partnerName: '',
    partnerLink: '',
    logo: '',
  });

  // Announce modal state (separate from add)
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [announceTarget, setAnnounceTarget] = useState(null); // partnership object to announce
  const [announceData, setAnnounceData] = useState({
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

  // Add partnership without announcing
  const handleAddPartnership = async () => {
    if (!addPartnershipData.partnerName || !addPartnershipData.partnerLink) {
      toast.error('Please fill in Partner Name and Invite Link');
      return;
    }

    try {
      await partnerships.create({
        name: `Partnership with ${addPartnershipData.partnerName}`,
        serverName: addPartnershipData.partnerName,
        serverInvite: addPartnershipData.partnerLink,
        logo: addPartnershipData.logo || null,
        type: 'cross-promotion',
        status: 'active',
      });

      toast.success('Partnership added successfully!');
      setShowAddPartnership(false);
      setAddPartnershipData({
        partnerName: '',
        partnerLink: '',
        logo: '',
      });
      fetchPartnerships();
    } catch (error) {
      toast.error('Failed to add partnership: ' + (error.response?.data?.error || error.message));
    }
  };

  // Open announce modal for a specific partnership
  const handleOpenAnnounce = (partnership) => {
    setAnnounceTarget(partnership);
    setAnnounceData({
      announcementChannelId: '1291127154188222544',
      roleToTag: '1291120505763401759'
    });
    setShowAnnounceModal(true);
  };

  // Send the announcement for a partnership
  const handleAnnounce = async () => {
    if (!announceData.announcementChannelId) {
      toast.error('Please select an announcement channel');
      return;
    }

    try {
      const embedData = {
        title: 'Partnership Announcement',
        description: `We are excited to announce that we have a new Partnership with [${announceTarget.serverName || announceTarget.name}](${announceTarget.serverInvite})🎉🎉🎉`,
        color: '#6366F1',
        thumbnail: 'https://cdn.discordapp.com/attachments/1291127061434716282/1321518479803801651/image.png?ex=677094d8&is=676f4358&hm=8cd9c1e4f5e5e91d0c6b23b5e9f4d9e8e8f8e8f8e8f8e8f8e8f8e8f8e8f8&',
        image: 'https://i.postimg.cc/rwWZ5RZh/new-partnership.png',
        timestamp: true
      };

      const content = announceData.roleToTag ? `<@&${announceData.roleToTag}>` : '';

      const result = await partnerships.announceQuick(announceData.announcementChannelId, embedData, content);

      // Update the partnership record with announcement info
      await partnerships.update(announceTarget.id, {
        announcedAt: new Date().toISOString(),
        announcementChannelId: announceData.announcementChannelId,
        announcementMessageId: result.data?.messageId || result.messageId
      });

      toast.success('Partnership announced successfully!');
      setShowAnnounceModal(false);
      setAnnounceTarget(null);
      fetchPartnerships();
    } catch (error) {
      toast.error('Failed to announce partnership: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({ isOpen: true, partnershipId: id });
  };

  const handleEditClick = (partnership) => {
    setEditData({
      id: partnership.id,
      name: partnership.name || '',
      serverName: partnership.serverName || partnership.partnerName || partnership.name || '',
      serverInvite: partnership.serverInvite || partnership.url || '',
      logo: partnership.logo || '',
      description: partnership.description || '',
      status: partnership.status || 'active',
      type: partnership.type || 'cross-promotion'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      await partnerships.update(editData.id, {
        name: editData.name || `Partnership with ${editData.serverName}`,
        serverName: editData.serverName,
        partnerName: editData.serverName,
        serverInvite: editData.serverInvite,
        url: editData.serverInvite,
        logo: editData.logo,
        description: editData.description,
        status: editData.status,
        type: editData.type
      });
      toast.success('Partnership updated successfully!');
      setShowEditModal(false);
      fetchPartnerships();
    } catch (error) {
      toast.error('Failed to update partnership: ' + (error.response?.data?.error || error.message));
    }
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
        <button className="btn" onClick={() => setShowAddPartnership(true)} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '600' }}>
          <FaPlus /> Add Partnership
        </button>
      </div>

      {/* Add Partnership Modal (No Announcement) */}
      {showAddPartnership && (
        <div className="modal-overlay" onClick={() => setShowAddPartnership(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>
                <FaPlus /> Add New Partnership
              </h3>
              <button className="modal-close" onClick={() => setShowAddPartnership(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Partner Name *</label>
                <input
                  type="text"
                  value={addPartnershipData.partnerName}
                  onChange={(e) => setAddPartnershipData({ ...addPartnershipData, partnerName: e.target.value })}
                  placeholder="Enter partner name (e.g., Liminal Logistics)"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Partner Invite Link *</label>
                <input
                  type="text"
                  value={addPartnershipData.partnerLink}
                  onChange={(e) => setAddPartnershipData({ ...addPartnershipData, partnerLink: e.target.value })}
                  placeholder="https://discord.gg/... or any URL"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Partner Logo URL (Optional)</label>
                <input
                  type="text"
                  value={addPartnershipData.logo}
                  onChange={(e) => setAddPartnershipData({ ...addPartnershipData, logo: e.target.value })}
                  placeholder="Image URL for the website (e.g. https://i.imgur.com/...)"
                  className="form-input"
                />
              </div>

              <div style={{ 
                padding: '12px 16px', 
                background: 'var(--bg-tertiary)', 
                borderRadius: '10px', 
                border: '1px solid var(--border-secondary)',
                marginTop: '8px',
                marginBottom: '8px'
              }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  💡 This will only <strong style={{ color: 'var(--text-primary)' }}>save</strong> the partnership to your records. No Discord announcement will be sent. You can announce it later from the partnership card.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button className="btn" style={{ flex: 1 }} onClick={handleAddPartnership}>
                  <FaPlus /> Add Partnership
                </button>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddPartnership(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announce Partnership Modal (Separate) */}
      {showAnnounceModal && announceTarget && (
        <div className="modal-overlay" onClick={() => { setShowAnnounceModal(false); setAnnounceTarget(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1050px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>
                <FaBullhorn /> Announce Partnership
              </h3>
              <button className="modal-close" onClick={() => { setShowAnnounceModal(false); setAnnounceTarget(null); }}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid grid-2" style={{ gap: '32px' }}>
                {/* Left Column - Form Fields */}
                <div>
                  <div style={{ 
                    padding: '14px 16px', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: '10px', 
                    border: '1px solid var(--border-secondary)',
                    marginBottom: '20px'
                  }}>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      📢 Announcing partnership with <strong style={{ color: 'var(--primary)' }}>{announceTarget.serverName || announceTarget.name}</strong>
                    </p>
                    {announceTarget.serverInvite && (
                      <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                        🔗 {announceTarget.serverInvite}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Announcement Destination Channel *</label>
                    <select
                      value={announceData.announcementChannelId}
                      onChange={(e) => setAnnounceData({ ...announceData, announcementChannelId: e.target.value })}
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
                      value={announceData.roleToTag}
                      onChange={(e) => setAnnounceData({ ...announceData, roleToTag: e.target.value })}
                      className="form-select"
                    >
                      <option value="">No role tag</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>@ {role.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                    <button className="btn" style={{ flex: 1 }} onClick={handleAnnounce}>
                      <FaBullhorn /> Broadcast Announcement
                    </button>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShowAnnounceModal(false); setAnnounceTarget(null); }}>
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
                          {announceTarget.serverName || announceTarget.name || '[Partner Name]'}
                        </span>
                        {' '}🎉🎉🎉
                      </p>
                      {announceTarget.serverInvite && (
                        <p style={{ color: 'var(--text-tertiary)', margin: '12px 0 0 0', fontSize: '13px', fontFamily: 'monospace' }}>
                          🔗 {announceTarget.serverInvite}
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
              Click "Add Partnership" to register your first partnership
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
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="badge badge-primary" style={{ fontSize: '12px' }}>
                          {partnership.serverName || 'Partner'}
                        </span>
                        {partnership.announcedAt ? (
                          <span className="badge" style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            ✓ Announced
                          </span>
                        ) : (
                          <span className="badge" style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                            Not Announced
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!partnership.announcedAt && (
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleOpenAnnounce(partnership)}>
                          <FaBullhorn /> Announce
                        </button>
                      )}
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEditClick(partnership)}>
                        Edit
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                      Created: {partnership.createdAt ? new Date(partnership.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                    {partnership.announcedAt && (
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
                        Announced: {new Date(partnership.announcedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>Edit Partnership Details</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group">
                <label className="form-label">Partner / Community Name *</label>
                <input
                  type="text"
                  value={editData.serverName}
                  onChange={(e) => setEditData({ ...editData, serverName: e.target.value })}
                  placeholder="e.g. NextGen Trucking"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Invite Link / Website URL *</label>
                <input
                  type="text"
                  value={editData.serverInvite}
                  onChange={(e) => setEditData({ ...editData, serverInvite: e.target.value })}
                  placeholder="https://discord.gg/... or https://..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Partner Logo URL</label>
                <input
                  type="text"
                  value={editData.logo}
                  onChange={(e) => setEditData({ ...editData, logo: e.target.value })}
                  placeholder="https://i.ibb.co/... (Image URL)"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Community Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  placeholder="Brief description of the partner community..."
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Partnership Status</label>
                  <select
                    className="form-select"
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Partnership Type</label>
                  <select
                    className="form-select"
                    value={editData.type}
                    onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                  >
                    <option value="cross-promotion">Cross-Promotion</option>
                    <option value="event-partner">Event Partner</option>
                    <option value="community-partner">Community Partner</option>
                    <option value="official">Official Partner</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button className="btn" style={{ flex: 1, padding: '12px' }} onClick={handleEditSubmit}>
                  Save Changes
                </button>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

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
