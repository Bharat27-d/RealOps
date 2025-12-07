import React, { useState, useEffect } from 'react';
import { discord, embeds, staff } from '../services/api';
import { toast } from 'react-toastify';
import { FaBook, FaPaperPlane, FaFileAlt, FaUserPlus, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
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
    roles: [] // Will store {roleId, name, status}
  });
  
  // Fixed 4 roles - replace these IDs with your actual Discord role IDs
  const STAFF_ROLE_IDS = [
    '1291818052744253612', // Replace with Planner role ID
    '1345496957082406972', // Replace with Jnr Planner role ID
    '1291122795190812774', // Replace with Real-Ops Staff role ID
    '1296423697711894528'  // Replace with Media Team role ID
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
      content: '**Partnership terms and conditions**\n\n**1.** As partners you will receive priority bookings over non partners.\n**1.1** Partner bookings are accepted on a first come first served basis. ( with no exceptions )\n\n**2.** As partners you are allowed to request bookings for a full year in advance.\n\n**3.** We request that you are polite and respectful to our staff at all times.\n\n**4.** We openly welcome your input to any scenarios you would like to implement at you events (within TMP rules)\n\n**5.** If the person / persons who agreed to this partnership leave this server the partnership will be automatically cancelled unless ownership is transferred before they leave the server.\n**5.1.** All event bookings will be removed from our system if Rule 5. has been actioned.\n\n**6.** You must give us prior notice of at least 48hrs of any changes to your events. for example date / time changes, cancelations.\n\n**7.** TMP rules must be followed at all times at your events.\n**7.1** If your VTC / Group is found to be regularly breaking TMP rules this partnership will be terminated with out notice.\n\n**8.** We reserve the right to cancel this partnership at any time if you are found in breach of these terms and conditions.\n\n**VTC Partnerships**\n**9.** As VTC partners we expect a minimum of 3 requests a year of our services for your events.\n**9.1** Partnerships will be reviewed every 6 months and you will be reminded if you are found not to be meeting this requirement.\n**9.2** We reserve the right to withdraw the partnership if no bookings received after 3 reminders.\n**9.3** If rule 9.2 implemented you are not allowed to request a new partnership for 3 Months from the date of Rule 9.2 being implemented.\n\n**Group Partnerships**\n**10.** As Group partners we expect assistance of additional staff from your groups at large events we are attending.\n**10.1** We are happy to assist at your events when needed\n\nPlease react with ✅ if you agree to these terms,\nPlease react with ❌ if you do not agree to these terms.\n\nIf you have any questions or concerns about the terms, feel free to reply here.',
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
      content: 'Hello and welcome to The Real-Ops Group\n\nWe are a group dedicated to providing Real-Ops for events on TruckersMP.\nWe where built from experienced staff within the TruckersMP community with years of experience in producing great events enjoyed by our great community time after time.\nWe thought it was time this community deserved a dedicated team that could bring real-ops to your events.\nOur staff consist of long serving TMP staff and experienced long serving players of this great community.\n\nWhat we can offer\n\nOur experienced staff will take care of everything for you and keep you informed as each stage is completed and supply the documentation you need for the TMP Event Managers to pass your events Real-ops requests.\nThen our experienced Event Team can take care of your real-ops to insure your event goes perfectly every time.\nWe can also supply your events with Convoy Control through our CC Groups partners.\n\nContact us\n\nIf you would like to know more then please feel free to speak to our support staff by opening a ticket in [Support](https://discord.com/channels/1291110532837015584/1318312015630045184) and they will be happy to answer all your questions.\n\nIf you would like to book us for your event then please open a Real-Ops Request ticket in [Book us](https://discord.com/channels/1291110532837015584/1318311275314286682) and our experienced planners will take care of everything for you.\n\nIf you would like to join our team you can find all available staff positions in [staff-openings](https://discord.com/channels/1291110532837015584/1291739954791059527) and you can apply by opening a ticket in [Join the Team](https://discord.com/channels/1291110532837015584/1318310934015512649)\n\nhttps://discord.gg/realops\nhttps://imgur.com/x3rgpvg\nhttps://imgur.com/kmrKx8y.png',
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
    // Initialize all 4 fixed roles when creating/editing opening
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

  // Initialize roles when modal opens and Discord roles are loaded
  useEffect(() => {
    if (showCreateOpening && discordRoles.length > 0 && openingForm.roles.length === 0) {
      initializeRoles();
    }
  }, [showCreateOpening, discordRoles]);

  const handleSendMessage = async () => {
    if (!selectedChannelId) {
      toast.error('Please select a channel first');
      return;
    }

    try {
      if (announcingOpenings) {
        // Send staff opening announcement
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

      // Check if message should be sent as code block
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

        // Add optional thumbnail, image, and footer if they exist
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
    <div className="feedback-page" style={{
      background: '#000',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="page-header" style={{
        background: '#FFD700',
        padding: '30px',
        borderRadius: '10px',
        marginBottom: '30px',
        border: '2px solid #FFA500'
      }}>
        <h1 style={{
          color: '#000',
          fontSize: '32px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          margin: 0
        }}>
          <FaBook size={40} /> Documentation Messages
        </h1>
      </div>

      <div className="documentation-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {documentMessages.map((message, index) => (
          <div key={message.id} style={{
            background: '#1a1a1a',
            borderRadius: '10px',
            padding: '25px',
            border: '2px solid #FFD700',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = '#FFA500';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#FFD700';
            }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div style={{
                background: '#FFD700',
                padding: '10px',
                borderRadius: '8px'
              }}>
                <FaFileAlt size={24} style={{ color: '#000' }} />
              </div>
              <h3 style={{
                margin: 0,
                color: '#FFD700',
                fontSize: '20px',
                fontWeight: '600'
              }}>{message.title}</h3>
            </div>

            <div style={{
              background: '#0a0a0a',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              borderLeft: '3px solid #FFD700'
            }}>
              <p style={{
                color: '#ccc',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: 0,
                whiteSpace: 'pre-line',
                maxHeight: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{message.content}</p>
            </div>

            <button
              onClick={() => handleSelectMessage(message)}
              style={{
                width: '100%',
                background: '#FFD700',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                color: '#000',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#FFA500';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#FFD700';
              }}
            >
              <FaPaperPlane /> Send to Channel
            </button>
          </div>
        ))}
      </div>

      {/* Staff Opening - Create & Post */}
      <div style={{
        background: 'linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)',
        borderRadius: '20px',
        padding: '50px',
        border: '2px solid #FFD700',
        boxShadow: '0 15px 50px rgba(255, 215, 0, 0.2), inset 0 1px 0 rgba(255, 215, 0, 0.1)',
        marginBottom: '40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeIn 0.8s ease-out'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'rotate 20s linear infinite'
        }}></div>
        <div style={{
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 25px',
          boxShadow: '0 10px 40px rgba(255, 215, 0, 0.5), 0 0 60px rgba(255, 215, 0, 0.3)',
          animation: 'pulse 2s ease-in-out infinite',
          position: 'relative',
          zIndex: 1
        }}>
          <FaUserPlus size={40} style={{ color: '#000' }} />
        </div>
        <h2 style={{
          color: '#FFD700',
          fontSize: '28px',
          fontWeight: '800',
          marginBottom: '15px',
          textShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
          position: 'relative',
          zIndex: 1
        }}>
          Post Staff Opening to Discord
        </h2>
        <p style={{
          color: '#aaa',
          fontSize: '16px',
          marginBottom: '35px',
          maxWidth: '600px',
          margin: '0 auto 35px',
          lineHeight: '1.6',
          position: 'relative',
          zIndex: 1
        }}>
          Create a professional staff opening announcement and broadcast it directly to your Discord community
        </p>
        <button
          onClick={() => {
            setOpeningForm({ title: '', description: '', requirements: '', roles: [] });
            setShowCreateOpening(true);
          }}
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            border: 'none',
            padding: '18px 45px',
            borderRadius: '15px',
            color: '#000',
            fontSize: '18px',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 10px 40px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.2)',
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.08) translateY(-3px)';
            e.target.style.boxShadow = '0 15px 60px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.4)';
            e.target.style.background = 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1) translateY(0)';
            e.target.style.boxShadow = '0 10px 40px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.2)';
            e.target.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
          }}
        >
          <FaUserPlus size={22} /> Create Staff Opening
        </button>
      </div>

      {showChannelModal && (
        <div className="modal-backdrop" onClick={() => setShowChannelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{announcingOpenings ? 'Select Channel to Post' : 'Select Channel'}</h3>
              <button
                onClick={() => setShowChannelModal(false)}
                className="close-btn"
              >×</button>
            </div>

            <div style={{ padding: '25px' }}>
              <p style={{
                color: '#FFD700',
                marginBottom: '20px',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                {announcingOpenings 
                  ? 'Choose where to announce your staff opening:'
                  : `Select destination for ${selectedMessage?.title || 'this message'}:`
                }
              </p>

              <input
                type="text"
                placeholder="🔍 Search channels..."
                value={channelSearch}
                onChange={(e) => setChannelSearch(e.target.value)}
                className="input-field"
                style={{ marginBottom: '20px' }}
              />

              {!announcingOpenings && selectedMessage && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    color: '#dcddde', 
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Mention User (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter User ID to mention (e.g., 123456789012345678)"
                    value={mentionUserId}
                    onChange={(e) => setMentionUserId(e.target.value)}
                    className="input-field"
                    style={{
                      background: '#2C2F33',
                      border: '1px solid #40444b',
                      color: '#dcddde',
                      padding: '10px',
                      borderRadius: '6px',
                      width: '100%'
                    }}
                  />
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#72767d', 
                    marginTop: '6px',
                    fontStyle: 'italic'
                  }}>
                    Leave empty to send without mentioning anyone
                  </p>
                </div>
              )}

              <div style={{
                maxHeight: '350px',
                overflowY: 'auto',
                marginBottom: '20px'
              }}>
                {channels
                  .filter(channel => channel.name.toLowerCase().includes(channelSearch.toLowerCase()))
                  .map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannelId(channel.id)}
                      className="channel-item"
                      style={{
                        background: selectedChannelId === channel.id ? '#1a1a1a' : '#000',
                        borderColor: selectedChannelId === channel.id ? '#FFD700' : '#333',
                        color: selectedChannelId === channel.id ? '#FFD700' : '#888',
                        fontWeight: selectedChannelId === channel.id ? '600' : '400'
                      }}
                    >
                      # {channel.name}
                    </button>
                  ))}
                {channels.filter(channel => channel.name.toLowerCase().includes(channelSearch.toLowerCase())).length === 0 && (
                  <p style={{
                    color: '#666',
                    textAlign: 'center',
                    padding: '30px',
                    fontSize: '14px'
                  }}>No channels found matching "{channelSearch}"</p>
                )}
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!selectedChannelId}
                className="btn-primary"
                style={{
                  width: '100%',
                  opacity: selectedChannelId ? 1 : 0.4,
                  cursor: selectedChannelId ? 'pointer' : 'not-allowed'
                }}
              >
                <FaPaperPlane /> Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Staff Opening Modal */}
      {showCreateOpening && (
        <div className="modal-backdrop" onClick={() => setShowCreateOpening(false)}>
          <div className="modal-content" style={{ maxWidth: '900px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaUserPlus /> Create Staff Opening</h3>
              <button
                onClick={() => setShowCreateOpening(false)}
                className="close-btn"
              >×</button>
            </div>

            <div style={{ padding: '25px' }}>
              <div style={{ display: 'flex', gap: '25px', width: '100%' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{
                      display: 'block',
                      color: '#FFD700',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>Position Title *</label>
                    <input
                      type="text"
                      value={openingForm.title}
                      onChange={(e) => setOpeningForm({ ...openingForm, title: e.target.value })}
                      placeholder="e.g., Community Manager, Event Coordinator"
                      className="input-field"
                    />
                  </div>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{
                      display: 'block',
                      color: '#FFD700',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>Description *</label>
                    <textarea
                      value={openingForm.description}
                      onChange={(e) => setOpeningForm({ ...openingForm, description: e.target.value })}
                      placeholder="Describe the role and responsibilities..."
                      rows={4}
                      className="input-field"
                      style={{ resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  </div>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{
                      display: 'block',
                      color: '#FFD700',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>Requirements (Optional)</label>
                    <textarea
                      value={openingForm.requirements}
                      onChange={(e) => setOpeningForm({ ...openingForm, requirements: e.target.value })}
                      placeholder="List any requirements or qualifications..."
                      rows={3}
                      className="input-field"
                      style={{ resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  <label style={{
                    display: 'block',
                    color: '#FFD700',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>Staff Positions Status</label>
                  <div style={{
                    background: '#1a1a1a',
                    borderRadius: '8px',
                    padding: '15px',
                    border: '2px solid #333',
                    minHeight: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {openingForm.roles.length > 0 ? (
                      openingForm.roles.map((role) => {
                        const discordRole = discordRoles.find(r => r.id === role.roleId);
                        return (
                          <div key={role.roleId} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: '#000',
                            borderRadius: '6px',
                            border: '1px solid #333'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              flex: 1
                            }}>
                              <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: discordRole?.color || '#99aab5',
                                flexShrink: 0
                              }} />
                              <span style={{
                                color: '#FFD700',
                                fontSize: '14px',
                                fontWeight: '500',
                                wordBreak: 'break-word',
                                whiteSpace: 'normal',
                                maxWidth: '220px',
                                overflowWrap: 'anywhere'
                              }}>{role.name}</span>
                            </div>
                            <button
                              onClick={() => handleToggleRoleStatus(role.roleId)}
                              style={{
                                background: role.status === 'open' ? '#27ae60' : '#e74c3c',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '15px',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                minWidth: '85px'
                              }}
                            >
                              {role.status === 'open' ? '🟢 Open' : '🔴 Closed'}
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{
                        color: '#666',
                        fontSize: '13px',
                        textAlign: 'center',
                        margin: 0,
                        padding: '10px'
                      }}>Loading roles...</p>
                    )}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '15px',
                marginTop: '25px'
              }}>
                <button
                  onClick={() => {
                    setShowCreateOpening(false);
                    setOpeningForm({
                      title: '',
                      description: '',
                      requirements: '',
                      roles: []
                    });
                  }}
                  style={{
                    background: '#333',
                    border: '2px solid #555',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.borderColor = '#FFD700'}
                  onMouseLeave={(e) => e.target.style.borderColor = '#555'}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePostToDiscord}
                  className="btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaPaperPlane /> Post to Discord
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal for Staff Openings */}
    </div>
  );
}

export default Feedback;
