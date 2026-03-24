import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaSave, FaPaperPlane, FaPlus, FaTrash, FaCopy, FaBold, FaItalic, FaUnderline, FaStrikethrough, FaCode, FaLink, FaTimes } from 'react-icons/fa';
import { embeds, discord, announcements } from '../services/api';

// Discord Markdown Renderer
function renderDiscordMarkdown(text) {
  if (!text) return '';
  
  let html = text;
  
  // Replace code blocks first (```code```)
  html = html.replace(/```([\s\S]*?)```/g, '<code style="background: #2f3136; padding: 8px; display: block; border-radius: 4px; margin: 4px 0; white-space: pre-wrap;">$1</code>');
  
  // Replace inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code style="background: #2f3136; padding: 2px 4px; border-radius: 3px;">$1</code>');
  
  // Replace bold + italic (***text***)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  
  // Replace bold (**text**)
  html = html.replace(/\*\*(.+?)\*\*(?!\*)/g, '<strong>$1</strong>');
  
  // Replace underline (__text__)
  html = html.replace(/__(.+?)__/g, '<u>$1</u>');
  
  // Replace italic (*text* or _text_)
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Replace strikethrough (~~text~~)
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
  
  // Replace links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #00b0f4; text-decoration: none;">$1</a>');
  
  // Replace role mentions <@&id>
  html = html.replace(/<@&(\d+)>/g, '<span style="background: #5865f2; color: white; padding: 0 4px; border-radius: 3px;">@role</span>');
  
  // Replace user mentions <@id>
  html = html.replace(/<@!?(\d+)>/g, '<span style="background: #5865f2; color: white; padding: 0 4px; border-radius: 3px;">@user</span>');
  
  // Replace newlines with <br>
  html = html.replace(/\n/g, '<br>');
  
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// Formatting Toolbar Component
function FormattingToolbar({ onInsert, targetRef }) {
  const insertFormatting = (before, after = before) => {
    const textarea = targetRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = `${before}${selectedText}${after}`;
    
    onInsert(newText, start, end);
    
    // Set cursor position between the markers (or after selected text if any)
    setTimeout(() => {
      textarea.focus();
      const newPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const buttons = [
    { icon: FaBold, label: 'Bold', format: '**' },
    { icon: FaItalic, label: 'Italic', format: '*' },
    { icon: FaUnderline, label: 'Underline', format: '__' },
    { icon: FaStrikethrough, label: 'Strikethrough', format: '~~' },
    { icon: FaCode, label: 'Inline Code', format: '`' },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      padding: '8px',
      backgroundColor: '#23272A',
      borderRadius: '6px',
      border: '1px solid #40444b',
      marginBottom: '8px',
      flexWrap: 'wrap'
    }}>
      {buttons.map(({ icon: Icon, label, format }) => (
        <button
          key={label}
          type="button"
          onClick={() => insertFormatting(format)}
          title={label}
          style={{
            padding: '6px 10px',
            backgroundColor: '#40444b',
            border: 'none',
            borderRadius: '4px',
            color: '#dcddde',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#5865F2'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#40444b'}
        >
          <Icon size={12} />
        </button>
      ))}
      <button
        type="button"
        onClick={() => insertFormatting('```\n', '\n```')}
        title="Code Block"
        style={{
          padding: '6px 10px',
          backgroundColor: '#40444b',
          border: 'none',
          borderRadius: '4px',
          color: '#dcddde',
          cursor: 'pointer',
          fontSize: '11px',
          fontFamily: 'monospace',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#5865F2'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#40444b'}
      >
        {'{}'}
      </button>
      <button
        type="button"
        onClick={() => {
          const url = prompt('Enter URL:');
          if (url) insertFormatting('[', `](${url})`);
        }}
        title="Link"
        style={{
          padding: '6px 10px',
          backgroundColor: '#40444b',
          border: 'none',
          borderRadius: '4px',
          color: '#dcddde',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '13px',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#5865F2'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#40444b'}
      >
        <FaLink size={12} />
      </button>
    </div>
  );
}

// Multi-select channel component
function ChannelMultiSelect({ selectedChannelIds, channels, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedChannelIds.includes(channel.id)
  );

  const selectedChannels = channels.filter(ch => selectedChannelIds.includes(ch.id));

  const addChannel = (channelId) => {
    onChange([...selectedChannelIds, channelId]);
    setSearchTerm('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const removeChannel = (channelId) => {
    onChange(selectedChannelIds.filter(id => id !== channelId));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '12px',
        background: '#23272A',
        border: '1px solid #40444b',
        borderRadius: '4px',
        minHeight: '50px',
        marginBottom: '10px'
      }}>
        {selectedChannels.map(channel => (
          <div key={channel.id} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            background: '#5865F2',
            borderRadius: '16px',
            color: 'white',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            <span>#{channel.name}</span>
            <FaTimes
              onClick={() => removeChannel(channel.id)}
              style={{ cursor: 'pointer', fontSize: '11px', opacity: 0.9 }}
            />
          </div>
        ))}
        {selectedChannels.length === 0 && (
          <span style={{ color: '#72767d', fontSize: '14px', alignSelf: 'center' }}>
            No channels selected
          </span>
        )}
      </div>

      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Type channel name to add..."
          style={{
            width: '100%',
            padding: '12px',
            background: '#2C2F33',
            border: '1px solid #40444b',
            borderRadius: '4px',
            color: '#dcddde',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        
        {isOpen && filteredChannels.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '5px',
            background: '#2C2F33',
            border: '1px solid #40444b',
            borderRadius: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            {filteredChannels.map(channel => (
              <div
                key={channel.id}
                onClick={() => addChannel(channel.id)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  color: '#dcddde',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#40444b'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                #{channel.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Mention selector for roles
function MentionSelector({ selectedMentions, roles, onChange, label = 'Mention Roles (Optional)' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedMentions.some(m => m.id === role.id)
  );

  const addMention = (item) => {
    const mention = { 
      type: 'role', 
      id: item.id, 
      name: item.name, 
      color: item.color 
    };
    onChange([...selectedMentions, mention]);
    setSearchTerm('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const removeMention = (index) => {
    onChange(selectedMentions.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#dcddde', fontSize: '14px' }}>
        {label}
      </label>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '12px',
        background: '#23272A',
        border: '1px solid #40444b',
        borderRadius: '4px',
        minHeight: '50px',
        marginBottom: '10px'
      }}>
        {selectedMentions.map((mention, index) => (
          <div 
            key={index} 
            title={`Role ID: ${mention.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              background: mention.color || '#99AAB5',
              borderRadius: '16px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'help'
            }}>
            <span>@{mention.name}</span>
            <span style={{ fontSize: '10px', opacity: 0.7 }}>({mention.id})</span>
            <FaTimes
              onClick={() => removeMention(index)}
              style={{ cursor: 'pointer', fontSize: '11px', opacity: 0.9 }}
            />
          </div>
        ))}
        {selectedMentions.length === 0 && (
          <span style={{ color: '#72767d', fontSize: '14px', alignSelf: 'center' }}>
            No mentions selected
          </span>
        )}
      </div>

      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Type to search roles..."
          style={{
            width: '100%',
            padding: '12px',
            background: '#2C2F33',
            border: '1px solid #40444b',
            borderRadius: '4px',
            color: '#dcddde',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        
        {isOpen && filteredRoles.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '5px',
            background: '#2C2F33',
            border: '1px solid #40444b',
            borderRadius: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            {filteredRoles.map((role, index) => (
              <div
                key={index}
                onClick={() => addMention(role)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  color: '#dcddde',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#40444b'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '4px',
                    background: role.color || '#99AAB5'
                  }} />
                  <span>@{role.name}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#72767d', fontFamily: 'monospace' }}>
                  {role.id}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Mention selector for users
function UserMentionSelector({ selectedUsers, members, onChange, label = 'Mention Users (Optional)' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filteredMembers = members.filter(member =>
    (member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (member.nickname && member.nickname.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    !selectedUsers.some(u => u.id === member.id)
  );

  const addUser = (member) => {
    const user = {
      type: 'user',
      id: member.id,
      username: member.username,
      nickname: member.nickname,
      avatar: member.avatar
    };
    onChange([...selectedUsers, user]);
    setSearchTerm('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const removeUser = (index) => {
    onChange(selectedUsers.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#dcddde', fontSize: '14px' }}>
        {label}
      </label>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '12px',
        background: '#23272A',
        border: '1px solid #40444b',
        borderRadius: '4px',
        minHeight: '50px',
        marginBottom: '10px'
      }}>
        {selectedUsers.map((user, index) => (
          <div
            key={index}
            title={`User ID: ${user.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              background: '#5865F2',
              borderRadius: '16px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'help'
            }}>
            {user.avatar && <img src={user.avatar} alt="" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />}
            <span>@{user.nickname || user.username}</span>
            <FaTimes
              onClick={() => removeUser(index)}
              style={{ cursor: 'pointer', fontSize: '11px', opacity: 0.9 }}
            />
          </div>
        ))}
        {selectedUsers.length === 0 && (
          <span style={{ color: '#72767d', fontSize: '14px', alignSelf: 'center' }}>
            No users selected
          </span>
        )}
      </div>

      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Type to search users..."
          style={{
            width: '100%',
            padding: '12px',
            background: '#2C2F33',
            border: '1px solid #40444b',
            borderRadius: '4px',
            color: '#dcddde',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        
        {isOpen && filteredMembers.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '5px',
            background: '#2C2F33',
            border: '1px solid #40444b',
            borderRadius: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            {filteredMembers.slice(0, 50).map((member, index) => (
              <div
                key={index}
                onClick={() => addUser(member)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  color: '#dcddde',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#40444b'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  {member.avatar && <img src={member.avatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
                  <div>
                    <span>@{member.nickname || member.username}</span>
                    {member.nickname && (
                      <span style={{ fontSize: '11px', color: '#72767d', marginLeft: '6px' }}>({member.username})</span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#72767d', fontFamily: 'monospace' }}>
                  {member.id}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Embeds() {
  const [embedData, setEmbedData] = useState({
    name: '',
    title: '',
    description: '',
    color: '#00b894',
    thumbnail: '',
    image: '',
    footer: { text: 'The Real Ops Group', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' },
    author: { name: '', iconURL: '' },
    fields: [],
    timestamp: false,
    buttons: [],
    selectMenu: null
  });

  const [savedEmbeds, setSavedEmbeds] = useState([]);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedChannelIds, setSelectedChannelIds] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [userMentions, setUserMentions] = useState([]);
  const [loading, setLoading] = useState(true);

  const descriptionRef = useRef(null);
  const footerRef = useRef(null);
  const authorRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [embedsRes, channelsRes, rolesRes, membersRes] = await Promise.all([
        embeds.getAll(),
        discord.getChannels(),
        discord.getRoles(),
        discord.getMembers()
      ]);
      setSavedEmbeds(embedsRes.data);
      setChannels(channelsRes.data);
      setMembers(membersRes.data || []);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to load data';
      toast.error(errorMsg);
      
      // If not authenticated, reload the page to trigger login screen
      if (error.response?.status === 401) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    setEmbedData({
      ...embedData,
      fields: [...embedData.fields, { name: '', value: '', inline: false }]
    });
  };

  const updateField = (index, key, value) => {
    const newFields = [...embedData.fields];
    newFields[index][key] = value;
    setEmbedData({ ...embedData, fields: newFields });
  };

  const removeField = (index) => {
    setEmbedData({
      ...embedData,
      fields: embedData.fields.filter((_, i) => i !== index)
    });
  };

  const saveEmbed = async () => {
    if (!embedData.name) {
      toast.error('Please enter a name for the embed');
      return;
    }

    try {
      await embeds.save(embedData);
      toast.success('Embed saved successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to save embed');
    }
  };

  const sendEmbed = async () => {
    if (selectedChannelIds.length === 0) {
      toast.error('Please select at least one channel');
      return;
    }

    if (!embedData.title && !embedData.description) {
      toast.error('Embed must have a title or description');
      return;
    }

    try {
      // Build combined mentions array with type info
      const allMentions = [
        ...mentions.map(m => ({ type: 'role', id: m.id })),
        ...userMentions.map(u => ({ type: 'user', id: u.id }))
      ];
      
      await announcements.sendToMultiple(
        selectedChannelIds,
        '',
        embedData,
        allMentions
      );
      toast.success(`Embed sent to ${selectedChannelIds.length} channel(s)!`);
      setMentions([]);
      setUserMentions([]);
    } catch (error) {
      toast.error('Failed to send embed');
    }
  };

  const loadEmbed = (embed) => {
    setEmbedData(embed);
    toast.info('Embed loaded into builder');
  };

  const duplicateEmbed = async (id) => {
    try {
      await embeds.duplicate(id);
      toast.success('Embed duplicated!');
      fetchData();
    } catch (error) {
      toast.error('Failed to duplicate embed');
    }
  };

  const charCount = (embedData.title?.length || 0) + (embedData.description?.length || 0) + 
    embedData.fields.reduce((acc, f) => acc + (f.name?.length || 0) + (f.value?.length || 0), 0);

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-title">
        <h1>Advanced Embed Builder</h1>
      </div>

      <div className="grid grid-2">
        {/* Editor */}
        <div className="card">
          <h2>Embed Editor</h2>
          
          <div className="form-group">
            <label>📍 Select Channels</label>
            <ChannelMultiSelect
              selectedChannelIds={selectedChannelIds}
              channels={channels}
              onChange={setSelectedChannelIds}
            />
          </div>

          <div className="form-group">
            <MentionSelector
              selectedMentions={mentions}
              roles={roles}
              label="👥 Mention Outside Embed (Roles)"
              onChange={setMentions}
            />
          </div>

          <div className="form-group">
            <UserMentionSelector
              selectedUsers={userMentions}
              members={members}
              label="👤 Mention Outside Embed (Users)"
              onChange={setUserMentions}
            />
          </div>

          <div className="form-group">
            <label>Template Name</label>
            <input 
              type="text"
              value={embedData.name}
              onChange={(e) => setEmbedData({...embedData, name: e.target.value})}
              placeholder="My Embed Template"
            />
          </div>

          <div className="form-group">
            <label>Title</label>
            <input 
              type="text"
              value={embedData.title}
              onChange={(e) => setEmbedData({...embedData, title: e.target.value})}
              placeholder="Embed Title"
              maxLength={256}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <FormattingToolbar 
              targetRef={descriptionRef}
              onInsert={(text, start, end) => {
                const current = embedData.description;
                const newDesc = current.substring(0, start) + text + current.substring(end);
                setEmbedData({ ...embedData, description: newDesc });
              }}
            />
            <textarea 
              ref={descriptionRef}
              value={embedData.description}
              onChange={(e) => setEmbedData({...embedData, description: e.target.value})}
              placeholder="Embed description..."
              maxLength={4096}
              rows={5}
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Color (Click to Pick)</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="color"
                  value={embedData.color.length === 7 ? embedData.color : '#00b894'}
                  onChange={(e) => setEmbedData({...embedData, color: e.target.value})}
                  style={{ 
                    width: '100px', 
                    height: '50px', 
                    cursor: 'pointer',
                    border: '2px solid #40444b',
                    borderRadius: '8px',
                    padding: '4px'
                  }}
                  title="Click to open color picker"
                />
                <input 
                  type="text"
                  value={embedData.color}
                  onChange={(e) => setEmbedData({...embedData, color: e.target.value})}
                  placeholder="#00b894"
                  maxLength={7}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Timestamp</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={embedData.timestamp}
                  onChange={(e) => setEmbedData({...embedData, timestamp: e.target.checked})}
                  style={{ width: 'auto' }}
                />
                <span>Include current timestamp</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Thumbnail URL</label>
            <input 
              type="text"
              value={embedData.thumbnail}
              onChange={(e) => setEmbedData({...embedData, thumbnail: e.target.value})}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input 
              type="text"
              value={embedData.image}
              onChange={(e) => setEmbedData({...embedData, image: e.target.value})}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Footer Text</label>
              <FormattingToolbar 
                targetRef={footerRef}
                onInsert={(text, start, end) => {
                  const current = embedData.footer.text;
                  const newText = current.substring(0, start) + text + current.substring(end);
                  setEmbedData({ ...embedData, footer: { ...embedData.footer, text: newText } });
                }}
              />
              <input 
                ref={footerRef}
                type="text"
                value={embedData.footer.text}
                onChange={(e) => setEmbedData({...embedData, footer: {...embedData.footer, text: e.target.value}})}
                placeholder="Footer text"
                maxLength={2048}
              />
            </div>
            <div className="form-group">
              <label>Footer Icon URL</label>
              <input 
                type="text"
                value={embedData.footer.iconURL}
                onChange={(e) => setEmbedData({...embedData, footer: {...embedData.footer, iconURL: e.target.value}})}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Author Name</label>
              <FormattingToolbar 
                targetRef={authorRef}
                onInsert={(text, start, end) => {
                  const current = embedData.author.name;
                  const newText = current.substring(0, start) + text + current.substring(end);
                  setEmbedData({ ...embedData, author: { ...embedData.author, name: newText } });
                }}
              />
              <input 
                ref={authorRef}
                type="text"
                value={embedData.author.name}
                onChange={(e) => setEmbedData({...embedData, author: {...embedData.author, name: e.target.value}})}
                placeholder="Author name"
                maxLength={256}
              />
            </div>
            <div className="form-group">
              <label>Author Icon URL</label>
              <input 
                type="text"
                value={embedData.author.iconURL}
                onChange={(e) => setEmbedData({...embedData, author: {...embedData.author, iconURL: e.target.value}})}
                placeholder="https://..."
              />
            </div>
          </div>

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #2C2F33' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Fields</h3>
            <button className="btn btn-outline" onClick={addField}>
              <FaPlus /> Add Field
            </button>
          </div>

          {embedData.fields.map((field, index) => (
            <div key={index} style={{ padding: '15px', background: '#2C2F33', borderRadius: '8px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong>Field {index + 1}</strong>
                <button className="btn btn-danger" onClick={() => removeField(index)} style={{ padding: '5px 10px' }}>
                  <FaTrash />
                </button>
              </div>
              
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text"
                  value={field.name}
                  onChange={(e) => updateField(index, 'name', e.target.value)}
                  placeholder="Field name"
                  maxLength={256}
                />
              </div>

              <div className="form-group">
                <label>Value</label>
                <textarea 
                  value={field.value}
                  onChange={(e) => updateField(index, 'value', e.target.value)}
                  placeholder="Field value"
                  maxLength={1024}
                  rows={3}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={field.inline}
                  onChange={(e) => updateField(index, 'inline', e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <span>Inline</span>
              </label>
            </div>
          ))}

          <div style={{ marginTop: '20px', padding: '10px', background: '#2C2F33', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#b9bbbe' }}>
              Character Count: <strong style={{ color: charCount > 6000 ? '#ED4245' : '#00b894' }}>{charCount} / 6000</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={saveEmbed} style={{ flex: 1 }}>
              <FaSave /> Save Template
            </button>
            <button className="btn btn-secondary" onClick={sendEmbed} style={{ flex: 1 }}>
              <FaPaperPlane /> Send to {selectedChannelIds.length} Channel(s)
            </button>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="card">
            <h2>Live Preview</h2>

            {/* Mentions outside embed preview */}
            {(mentions.length > 0 || userMentions.length > 0) && (
              <div style={{
                padding: '8px 0',
                marginTop: '16px',
                color: '#dcddde',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {mentions.map((m, i) => (
                  <span key={`role-${i}`} style={{
                    background: 'rgba(88, 101, 242, 0.3)',
                    color: '#dee0fc',
                    padding: '0 4px',
                    borderRadius: '3px',
                    marginRight: '4px',
                    cursor: 'default'
                  }}>@{m.name}</span>
                ))}
                {userMentions.map((u, i) => (
                  <span key={`user-${i}`} style={{
                    background: 'rgba(88, 101, 242, 0.3)',
                    color: '#dee0fc',
                    padding: '0 4px',
                    borderRadius: '3px',
                    marginRight: '4px',
                    cursor: 'default'
                  }}>@{u.nickname || u.username}</span>
                ))}
              </div>
            )}
            
            <div style={{ 
              borderLeft: `4px solid ${embedData.color}`, 
              background: '#2C2F33', 
              padding: '15px', 
              borderRadius: '4px',
              marginTop: (mentions.length > 0 || userMentions.length > 0) ? '8px' : '20px',
              display: 'flex',
              gap: '15px'
            }}>
              <div style={{ flex: 1 }}>
                {embedData.author.name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    {embedData.author.iconURL && <img src={embedData.author.iconURL} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
                    <strong style={{ fontSize: '14px', color: '#ffffff' }}>{renderDiscordMarkdown(embedData.author.name)}</strong>
                  </div>
                )}
                
                {embedData.title && <h3 style={{ marginBottom: '10px', color: '#ffffff' }}>{renderDiscordMarkdown(embedData.title)}</h3>}
                {embedData.description && <div style={{ color: '#b9bbbe', marginBottom: '10px', lineHeight: '1.5' }}>{renderDiscordMarkdown(embedData.description)}</div>}
                
                {embedData.fields.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: embedData.fields.some(f => f.inline) ? 'repeat(3, 1fr)' : '1fr', gap: '10px', marginTop: '10px' }}>
                    {embedData.fields.map((field, idx) => (
                      <div key={idx}>
                        <strong style={{ fontSize: '14px', display: 'block', marginBottom: '5px', color: '#ffffff' }}>{renderDiscordMarkdown(field.name)}</strong>
                        <div style={{ fontSize: '13px', color: '#b9bbbe', lineHeight: '1.4' }}>{renderDiscordMarkdown(field.value)}</div>
                      </div>
                    ))}
                  </div>
                )}

                {embedData.image && (
                  <img src={embedData.image} alt="" style={{ width: '100%', borderRadius: '4px', marginTop: '15px' }} />
                )}

                {embedData.footer.text && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', fontSize: '12px', color: '#b9bbbe' }}>
                    {embedData.footer.iconURL && <img src={embedData.footer.iconURL} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />}
                    <span>{renderDiscordMarkdown(embedData.footer.text)}</span>
                    {embedData.timestamp && <span> • {new Date().toLocaleString()}</span>}
                  </div>
                )}
              </div>

              {embedData.thumbnail && (
                <div style={{ flexShrink: 0 }}>
                  <img src={embedData.thumbnail} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <h3>Saved Templates</h3>
            {savedEmbeds.map(embed => (
              <div key={embed.id} style={{ padding: '10px', background: '#2C2F33', borderRadius: '8px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{embed.name}</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button className="btn btn-outline" onClick={() => loadEmbed(embed)} style={{ padding: '5px 10px' }}>
                    Load
                  </button>
                  <button className="btn btn-secondary" onClick={() => duplicateEmbed(embed.id)} style={{ padding: '5px 10px' }}>
                    <FaCopy />
                  </button>
                </div>
              </div>
            ))}
            {savedEmbeds.length === 0 && (
              <p style={{ textAlign: 'center', padding: '20px', color: '#b9bbbe' }}>No saved templates</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Embeds;
