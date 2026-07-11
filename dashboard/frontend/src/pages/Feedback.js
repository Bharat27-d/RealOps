import React, { useState, useEffect } from 'react';
import { discord, embeds, staff } from '../services/api';
import { toast } from 'react-toastify';
import { FaBook, FaPaperPlane, FaFileAlt, FaUserPlus, FaSearch } from 'react-icons/fa';
import './Feedback.css';

function Feedback() {
  const [channels, setChannels] = useState([]);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [channelSearch, setChannelSearch] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [mentionUserId, setMentionUserId] = useState('');
  
  // Staff openings state
  const [showCreateOpening, setShowCreateOpening] = useState(false);
  const [discordRoles, setDiscordRoles] = useState([]);
  const [openingForm, setOpeningForm] = useState({
    title: '',
    description: '',
    requirements: '',
    roles: []
  });
  
  const STAFF_ROLE_IDS = [
    '1291818052744253612',
    '1345496957082406972',
    '1291122795190812774',
    '1296423697711894528'
  ];
  const [announcingOpenings, setAnnouncingOpenings] = useState(false);

  const documentMessages = [
    {
      id: 1,
      title: 'Planning Stage 2',
      content: 'Hello this is just to let you know your event is the next one our planners will be working on.\n\nIf there are any scenarios you would like to see included then please let us know in this ticket within the next 24hr.\n\nWe will contact you again once this stage is completed',
      color: '#e67e22',
      thumbnail: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
      image: 'https://i.imgur.com/wLwstVS.png',
      footer: {
        text: 'The Real Ops Group',
        iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
      }
    },
    {
      id: 2,
      title: 'Partnership Terms & Conditions',
      content: '**Partnership terms and conditions**\n\n**1.** As partners you will receive priority bookings over non partners.\n**1.1** Partner bookings are accepted on a first come first served basis. ( with no exceptions )\n\n**2.** As partners you are allowed to request bookings for a full year in advance.\n\n**3.** We request that you are polite and respectful to our staff at all times.\n\n**4.** We openly welcome your input to any scenarios you would like to implement at your events (within TMP rules)\n\n**5.** If the person / persons who agreed to this partnership leave this server the partnership will be automatically cancelled unless ownership is transferred before they leave the server.\n**5.1.** All event bookings will be removed from our system if Rule 5. has been actioned.\n\n**6.** You must give us prior notice of at least 48hrs of any changes to your events. for example date / time changes, cancellations.\n\n**7.** TMP rules must be followed at all times at your events.\n**7.1** If your VTC / Group is found to be regularly breaking TMP rules this partnership will be terminated without notice.\n\n**8.** We reserve the right to cancel this partnership at any time if you are found in breach of these terms and conditions.\n\n**VTC Partnerships**\n**9.** As VTC partners we expect a minimum of 3 requests a year of our services for your events.\n**9.1** Partnerships will be reviewed every 6 months and you will be reminded if you are found not to be meeting this requirement.\n**9.2** We reserve the right to withdraw the partnership if no bookings received after 3 reminders.\n**9.3** If rule 9.2 implemented you are not allowed to request a new partnership for 3 Months from the date of Rule 9.2 being implemented.\n\n**Group Partnerships**\n**10.** As Group partners we expect assistance of additional staff from your groups at large events we are attending.\n**10.1** We are happy to assist at your events when needed\n\nPlease react with ✅ if you agree to these terms,\nPlease react with ❌ if you do not agree to these terms.\n\nIf you have any questions or concerns about the terms, feel free to reply here.',
      color: '#00b894',
      thumbnail: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
      image: 'https://i.imgur.com/58wgkaF.png',
      footer: {
        text: 'The Real Ops Group',
        iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
      }
    },
    {
      id: 3,
      title: 'Partnership Information',
      content: 'Hello and welcome to The Real-Ops Group\n\nWe are a group dedicated to providing Real-Ops for events on TruckersMP.\nWe where built from experienced staff within the TruckersMP community with years of experience in producing great events enjoyed by our great community time after time.\nWe thought it was time this community deserved a dedicated team that could bring real-ops to your events.\nOur staff consist of long serving TMP staff and experienced long serving players of this great community.\n\nWhat we can offer\n\nOur experienced staff will take care of everything for you and keep you informed as each stage is completed and supply the documentation you need for the TMP Event Managers to pass your events Real-ops requests.\nThen our experienced Event Team can take care of your real-ops to insure your event goes perfectly every time.\nWe can also supply your events with Convoy Control through our CC Groups partners.\n\nContact us\n\nIf you would like to know more then please feel free to speak to our support staff by opening a ticket in Support and they will be happy to answer all your questions.\n\nIf you would like to book us for your event then please open a Real-Ops Request ticket in Book us and our experienced planners will take care of everything for you.\n\nIf you would like to join our team you can find all available staff positions in staff-openings and apply by opening a ticket in Join the Team.',
      isCodeBlock: true
    }
  ];

  useEffect(() => {
    fetchChannels();
    fetchDiscordRoles();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await discord.getChannels();
      setChannels(response.data);
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  const fetchDiscordRoles = async () => {
    try {
      const response = await discord.getRoles();
      setDiscordRoles(response.data);
    } catch (error) {
      console.error('Failed to load Discord roles:', error);
    }
  };

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setChannelSearch('');
    setSelectedChannelId('');
    setMentionUserId('');
    setShowChannelModal(true);
    setAnnouncingOpenings(false);
  };

  const handlePostToDiscord = () => {
    if (!openingForm.title || !openingForm.description) {
      toast.error('Please fill in title and description');
      return;
    }
    setShowCreateOpening(false);
    setSelectedMessage(null);
    setChannelSearch('');
    setSelectedChannelId('');
    setShowChannelModal(true);
    setAnnouncingOpenings(true);
  };

  const initializeRoles = () => {
    const initializedRoles = STAFF_ROLE_IDS.map(roleId => {
      const discordRole = discordRoles.find(r => r.id === roleId);
      const existingRole = openingForm.roles.find(r => r.roleId === roleId);
      return {
        roleId,
        name: discordRole?.name || 'Unknown Role',
        status: existingRole?.status || 'open'
      };
    });
    setOpeningForm({
      ...openingForm,
      roles: initializedRoles
    });
  };

  const handleToggleRoleStatus = (roleId) => {
    const updatedRoles = openingForm.roles.map(role => 
      role.roleId === roleId 
        ? { ...role, status: role.status === 'open' ? 'closed' : 'open' }
        : role
    );
    setOpeningForm({
      ...openingForm,
      roles: updatedRoles
    });
  };

  useEffect(() => {
    if (showCreateOpening && discordRoles.length > 0 && openingForm.roles.length === 0) {
      initializeRoles();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCreateOpening, discordRoles]);

  const handleSendMessage = async () => {
    if (!selectedChannelId) {
      toast.error('Please select a channel first');
      return;
    }

    try {
      if (announcingOpenings) {
        await staff.announceOpenings(selectedChannelId, [openingForm]);
        toast.success('Staff opening posted successfully!');
        setShowChannelModal(false);
        setAnnouncingOpenings(false);
        setOpeningForm({ title: '', description: '', requirements: '', roles: [] });
        return;
      }

      if (!selectedMessage) {
        toast.error('No message selected');
        return;
      }

      if (selectedMessage.isCodeBlock) {
        let messageContent = '```\n' + selectedMessage.content + '\n```';
        if (mentionUserId && mentionUserId.trim()) {
          messageContent = `<@${mentionUserId.trim()}>\n${messageContent}`;
        }
        
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/discord/send-message`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelId: selectedChannelId,
            content: messageContent
          })
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to send message');
        }
      } else {
        const embedData = {
          title: selectedMessage.title,
          description: selectedMessage.content,
          color: selectedMessage.color,
          timestamp: true
        };

        if (selectedMessage.thumbnail) {
          embedData.thumbnail = selectedMessage.thumbnail;
        }
        if (selectedMessage.image) {
          embedData.image = selectedMessage.image;
        }
        if (selectedMessage.footer) {
          embedData.footer = selectedMessage.footer;
        }

        await embeds.send(selectedChannelId, embedData);
      }
      toast.success(`${selectedMessage.title} sent to channel successfully!`);
      setShowChannelModal(false);
      setSelectedMessage(null);
      setSelectedChannelId('');
    } catch (error) {
      toast.error('Failed to send message: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-title">
        <div>
          <div className="page-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '11px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>
            RealOps Portal / System & Docs
          </div>
          <h1>
            <FaBook /> Documentation & Announcements
          </h1>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: '32px' }}>
        {documentMessages.map((message) => (
          <div key={message.id} className="doc-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  <FaFileAlt />
                </div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '17px', fontWeight: '700' }}>
                  {message.title}
                </h3>
              </div>

              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '20px',
                borderLeft: '3px solid var(--primary)',
                borderTop: '1px solid var(--border-secondary)',
                borderRight: '1px solid var(--border-secondary)',
                borderBottom: '1px solid var(--border-secondary)'
              }}>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  margin: 0,
                  whiteSpace: 'pre-line',
                  maxHeight: '140px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>{message.content}</p>
              </div>
            </div>

            <button
              onClick={() => handleSelectMessage(message)}
              className="btn"
              style={{ width: '100%', padding: '12px' }}
            >
              <FaPaperPlane /> Send to Channel
            </button>
          </div>
        ))}
      </div>

      {/* Staff Opening - Create & Post Card */}
      <div className="card" style={{
        padding: '36px',
        textAlign: 'center',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-secondary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'var(--primary-subtle)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '18px',
          fontSize: '28px'
        }}>
          <FaUserPlus />
        </div>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>
          Post Staff Opening to Discord
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', maxWidth: '550px', lineHeight: '1.6' }}>
          Create a professional recruitment announcement with live position status indicators and broadcast it directly to your Discord community.
        </p>
        <button
          onClick={() => {
            setOpeningForm({ title: '', description: '', requirements: '', roles: [] });
            setShowCreateOpening(true);
          }}
          className="btn"
          style={{ padding: '12px 28px', fontSize: '15px' }}
        >
          <FaUserPlus /> Create Staff Opening
        </button>
      </div>

      {/* Channel Select Modal */}
      {showChannelModal && (
        <div className="modal-backdrop" onClick={() => setShowChannelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{announcingOpenings ? 'Select Channel to Post' : 'Select Destination Channel'}</h3>
              <button onClick={() => setShowChannelModal(false)} className="close-btn">×</button>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
                {announcingOpenings 
                  ? 'Choose where to announce your staff opening:'
                  : `Select destination channel for "${selectedMessage?.title || 'this message'}":`
                }
              </p>

              <div style={{ position: 'relative', marginBottom: '18px' }}>
                <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                />
              </div>

              {!announcingOpenings && selectedMessage && (
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                    Mention User ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter User ID to mention (e.g., 123456789012345678)"
                    value={mentionUserId}
                    onChange={(e) => setMentionUserId(e.target.value)}
                    className="input-field"
                  />
                </div>
              )}

              <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                {channels
                  .filter(channel => channel.name.toLowerCase().includes(channelSearch.toLowerCase()))
                  .map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannelId(channel.id)}
                      className="channel-item"
                      style={{
                        background: selectedChannelId === channel.id ? 'var(--primary-subtle)' : 'var(--bg-tertiary)',
                        borderColor: selectedChannelId === channel.id ? 'var(--primary)' : 'var(--border-secondary)',
                        color: selectedChannelId === channel.id ? '#FFFFFF' : 'var(--text-secondary)',
                        fontWeight: selectedChannelId === channel.id ? '600' : '400'
                      }}
                    >
                      # {channel.name}
                    </button>
                  ))}
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!selectedChannelId}
                className="btn"
                style={{ width: '100%', padding: '13px' }}
              >
                <FaPaperPlane /> Broadcast Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Staff Opening Modal */}
      {showCreateOpening && (
        <div className="modal-backdrop" onClick={() => setShowCreateOpening(false)}>
          <div className="modal-content" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaUserPlus /> Create Staff Opening</h3>
              <button onClick={() => setShowCreateOpening(false)} className="close-btn">×</button>
            </div>

            <div style={{ padding: '28px' }}>
              <div className="grid grid-2" style={{ gap: '24px' }}>
                <div>
                  <div className="form-group">
                    <label className="form-label">Position Title *</label>
                    <input
                      type="text"
                      value={openingForm.title}
                      onChange={(e) => setOpeningForm({ ...openingForm, title: e.target.value })}
                      placeholder="e.g., Event Planner, Support Staff"
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description *</label>
                    <textarea
                      value={openingForm.description}
                      onChange={(e) => setOpeningForm({ ...openingForm, description: e.target.value })}
                      placeholder="Describe the role and responsibilities..."
                      rows={4}
                      className="input-field"
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Requirements (Optional)</label>
                    <textarea
                      value={openingForm.requirements}
                      onChange={(e) => setOpeningForm({ ...openingForm, requirements: e.target.value })}
                      placeholder="List required qualifications..."
                      rows={3}
                      className="input-field"
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Staff Position Statuses</label>
                  <div style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: '14px',
                    padding: '16px',
                    border: '1px solid var(--border-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    {openingForm.roles.length > 0 ? (
                      openingForm.roles.map((role) => {
                        const discordRole = discordRoles.find(r => r.id === role.roleId);
                        return (
                          <div key={role.roleId} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '10px',
                            border: '1px solid var(--border-secondary)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                              <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: discordRole?.color || 'var(--primary)',
                                flexShrink: 0
                              }} />
                              <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>{role.name}</span>
                            </div>
                            <button
                              onClick={() => handleToggleRoleStatus(role.roleId)}
                              style={{
                                background: role.status === 'open' ? 'var(--success)' : 'var(--danger)',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '999px',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)'
                              }}
                            >
                              {role.status === 'open' ? '🟢 Open' : '🔴 Closed'}
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Loading roles...</p>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-secondary)' }}>
                <button
                  onClick={() => setShowCreateOpening(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePostToDiscord}
                  className="btn"
                >
                  <FaPaperPlane /> Proceed to Channel Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Feedback;
