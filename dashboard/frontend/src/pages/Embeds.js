import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaSave, FaPaperPlane, FaPlus, FaTrash, FaCopy, FaBold, FaItalic, FaUnderline, FaStrikethrough, FaCode, FaLink, FaTimes, FaEdit } from 'react-icons/fa';
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
      backgroundColor: 'var(--bg-tertiary)',
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
            backgroundColor: 'var(--border-secondary)',
            border: 'none',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#5865F2'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--border-secondary)'}
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
          backgroundColor: 'var(--border-secondary)',
          border: 'none',
          borderRadius: '4px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '11px',
          fontFamily: 'monospace',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#5865F2'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--border-secondary)'}
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
          backgroundColor: 'var(--border-secondary)',
          border: 'none',
          borderRadius: '4px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '13px',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#5865F2'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--border-secondary)'}
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
        background: 'var(--bg-tertiary)',
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
          <span style={{ color: 'var(--text-tertiary)', fontSize: '14px', alignSelf: 'center' }}>
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
            background: 'var(--bg-secondary)',
            border: '1px solid #40444b',
            borderRadius: '4px',
            color: 'var(--text-primary)',
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
            background: 'var(--bg-secondary)',
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
                  color: 'var(--text-primary)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--border-secondary)'}
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
      <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: 'var(--text-primary)', fontSize: '14px' }}>
        {label}
      </label>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '12px',
        background: 'var(--bg-tertiary)',
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
          <span style={{ color: 'var(--text-tertiary)', fontSize: '14px', alignSelf: 'center' }}>
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
            background: 'var(--bg-secondary)',
            border: '1px solid #40444b',
            borderRadius: '4px',
            color: 'var(--text-primary)',
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
            background: 'var(--bg-secondary)',
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
                  color: 'var(--text-primary)',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-secondary)'}
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
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
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
      <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: 'var(--text-primary)', fontSize: '14px' }}>
        {label}
      </label>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '12px',
        background: 'var(--bg-tertiary)',
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
          <span style={{ color: 'var(--text-tertiary)', fontSize: '14px', alignSelf: 'center' }}>
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
            background: 'var(--bg-secondary)',
            border: '1px solid #40444b',
            borderRadius: '4px',
            color: 'var(--text-primary)',
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
            background: 'var(--bg-secondary)',
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
                  color: 'var(--text-primary)',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  {member.avatar && <img src={member.avatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
                  <div>
                    <span>@{member.nickname || member.username}</span>
                    {member.nickname && (
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '6px' }}>({member.username})</span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
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
  const defaultEmbedState = {
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
  };

  const [embedData, setEmbedData] = useState({...defaultEmbedState});

  // Multi-embed state
  const [embedsList, setEmbedsList] = useState([{...defaultEmbedState}]);
  const [activeEmbedIndex, setActiveEmbedIndex] = useState(0);

  const [savedEmbeds, setSavedEmbeds] = useState([]);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedChannelIds, setSelectedChannelIds] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [userMentions, setUserMentions] = useState([]);
  const [editingEmbedId, setEditingEmbedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Embed (from message link) states
  const [editEmbedView, setEditEmbedView] = useState(false);
  const [messageLink, setMessageLink] = useState('');
  const [editMessageLoading, setEditMessageLoading] = useState(false);
  const [editMessageData, setEditMessageData] = useState(null); // { channelId, messageId }
  const [editEmbedData, setEditEmbedData] = useState(null);

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
      if (editingEmbedId) {
        // Update existing embed — strip metadata fields that shouldn't go back to Firestore
        const { id, createdAt, createdBy, updatedAt, ...cleanData } = embedData;
        await embeds.update(editingEmbedId, cleanData);
        // Immediately update the local list
        setSavedEmbeds(prev => prev.map(e => 
          e.id === editingEmbedId ? { ...e, ...cleanData } : e
        ));
        toast.success('Embed updated successfully!');
        setEditingEmbedId(null);
      } else {
        // Save as new embed
        const res = await embeds.save(embedData);
        // Add to local list immediately
        if (res.data) {
          setSavedEmbeds(prev => [res.data, ...prev]);
        }
        toast.success('Embed saved successfully!');
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Unknown error';
      console.error('Embed save/update error:', msg, error);
      toast.error(`Failed to ${editingEmbedId ? 'update' : 'save'} embed: ${msg}`);
    }
  };

  // Switch to a different embed tab
  const switchEmbed = (index) => {
    // Save current embed to list
    const updatedList = embedsList.map((e, i) => i === activeEmbedIndex ? {...embedData} : e);
    setEmbedsList(updatedList);
    // Load the selected embed
    setEmbedData({...updatedList[index]});
    setActiveEmbedIndex(index);
  };

  // Add a new embed
  const addNewEmbed = () => {
    if (embedsList.length >= 10) {
      toast.error('Discord allows maximum 10 embeds per message');
      return;
    }
    // Save current embed to list first
    const updatedList = embedsList.map((e, i) => i === activeEmbedIndex ? {...embedData} : e);
    const newEmbed = {
      ...defaultEmbedState,
      color: ['#00b894', '#5865F2', '#fdcb6e', '#e17055', '#a29bfe', '#00cec9', '#fd79a8', '#6c5ce7', '#55efc4', '#fab1a0'][updatedList.length] || '#00b894'
    };
    const newList = [...updatedList, newEmbed];
    setEmbedsList(newList);
    setEmbedData({...newEmbed});
    setActiveEmbedIndex(newList.length - 1);
    toast.success(`Embed ${newList.length} added`);
  };

  // Remove a specific embed
  const removeEmbed = (index) => {
    if (embedsList.length <= 1) {
      toast.error('You need at least one embed');
      return;
    }
    const updatedList = embedsList.filter((_, i) => i !== index);
    setEmbedsList(updatedList);
    // Adjust active index
    let newActive = activeEmbedIndex;
    if (index <= activeEmbedIndex) {
      newActive = Math.max(0, activeEmbedIndex - 1);
    }
    if (newActive >= updatedList.length) {
      newActive = updatedList.length - 1;
    }
    setActiveEmbedIndex(newActive);
    setEmbedData({...updatedList[newActive]});
    toast.success('Embed removed');
  };

  const sendEmbed = async () => {
    if (selectedChannelIds.length === 0) {
      toast.error('Please select at least one channel');
      return;
    }

    // Sync current editor to list
    const finalList = embedsList.map((e, i) => i === activeEmbedIndex ? {...embedData} : e);
    
    // Validate all embeds have at least title or description
    const validEmbeds = finalList.filter(e => e.title || e.description);
    if (validEmbeds.length === 0) {
      toast.error('At least one embed must have a title or description');
      return;
    }

    try {
      const allMentions = [
        ...mentions.map(m => ({ type: 'role', id: m.id })),
        ...userMentions.map(u => ({ type: 'user', id: u.id }))
      ];
      
      if (validEmbeds.length === 1) {
        // Single embed — use existing announcements route
        await announcements.sendToMultiple(
          selectedChannelIds,
          '',
          validEmbeds[0],
          allMentions
        );
      } else {
        // Multiple embeds — use new send-multiple route
        await embeds.sendMultiple(
          selectedChannelIds,
          validEmbeds,
          allMentions
        );
      }
      toast.success(`${validEmbeds.length} embed(s) sent to ${selectedChannelIds.length} channel(s)!`);
      setMentions([]);
      setUserMentions([]);
    } catch (error) {
      toast.error('Failed to send embed(s)');
    }
  };

  // Merge loaded embed with defaults to ensure all fields exist
  const defaultEmbed = {
    name: '',
    title: '',
    description: '',
    color: '#00b894',
    thumbnail: '',
    image: '',
    footer: { text: '', iconURL: '' },
    author: { name: '', iconURL: '' },
    fields: [],
    timestamp: false,
    buttons: [],
    selectMenu: null
  };

  const mergeWithDefaults = (embed) => ({
    ...defaultEmbed,
    ...embed,
    footer: { ...defaultEmbed.footer, ...(embed.footer || {}) },
    author: { ...defaultEmbed.author, ...(embed.author || {}) },
    fields: Array.isArray(embed.fields) ? embed.fields : [],
    buttons: Array.isArray(embed.buttons) ? embed.buttons : [],
  });

  const loadEmbed = (embed) => {
    setEmbedData(mergeWithDefaults(embed));
    setEditingEmbedId(null);
    toast.info('Embed loaded into builder');
  };

  const editEmbed = (embed) => {
    setEmbedData(mergeWithDefaults(embed));
    setEditingEmbedId(embed.id);
    toast.info('Editing embed — make changes and click Update Template');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteEmbed = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await embeds.delete(id);
      toast.success('Embed deleted!');
      // Immediately remove from local state
      setSavedEmbeds(prev => prev.filter(e => e.id !== id));
      // If we were editing this embed, clear edit mode
      if (editingEmbedId === id) {
        setEditingEmbedId(null);
      }
    } catch (error) {
      toast.error('Failed to delete embed');
    }
  };

  const cancelEdit = () => {
    setEditingEmbedId(null);
    toast.info('Edit cancelled');
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

  // Parse Discord message link: https://discord.com/channels/{guild}/{channel}/{message}
  const parseMessageLink = (link) => {
    const match = link.match(/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/);
    if (!match) return null;
    return { guildId: match[1], channelId: match[2], messageId: match[3] };
  };

  const loadMessageEmbed = async () => {
    if (!messageLink.trim()) {
      toast.error('Please enter a Discord message link');
      return;
    }
    const parsed = parseMessageLink(messageLink);
    if (!parsed) {
      toast.error('Invalid message link. Format: https://discord.com/channels/guild/channel/message');
      return;
    }

    setEditMessageLoading(true);
    try {
      const response = await embeds.fetchMessage(parsed.channelId, parsed.messageId);
      const msgData = response.data;
      
      if (!msgData.embeds || msgData.embeds.length === 0) {
        toast.error('This message has no embeds to edit');
        setEditMessageLoading(false);
        return;
      }

      const embed = msgData.embeds[0];
      setEditEmbedData({
        name: '',
        title: embed.title || '',
        description: embed.description || '',
        color: embed.color || '#00b894',
        thumbnail: embed.thumbnail || '',
        image: embed.image || '',
        footer: embed.footer || { text: '', iconURL: '' },
        author: embed.author || { name: '', iconURL: '' },
        fields: embed.fields || [],
        timestamp: embed.timestamp || false,
        buttons: [],
        selectMenu: null
      });
      setEditMessageData({ channelId: parsed.channelId, messageId: parsed.messageId });
      toast.success('Embed loaded successfully!');
    } catch (error) {
      const msg = error.response?.data?.error || error.message;
      toast.error('Failed to load message: ' + msg);
    } finally {
      setEditMessageLoading(false);
    }
  };

  const saveEditedEmbed = async () => {
    if (!editMessageData || !editEmbedData) {
      toast.error('No embed loaded to save');
      return;
    }
    if (!editEmbedData.title && !editEmbedData.description) {
      toast.error('Embed must have a title or description');
      return;
    }

    setEditMessageLoading(true);
    try {
      await embeds.editMessage(
        editMessageData.channelId,
        editMessageData.messageId,
        editEmbedData
      );
      toast.success('Embed updated successfully!');
    } catch (error) {
      const msg = error.response?.data?.error || error.message;
      toast.error('Failed to update embed: ' + msg);
    } finally {
      setEditMessageLoading(false);
    }
  };

  const editEmbedDescRef = useRef(null);

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  // Edit Embed View
  if (editEmbedView) {
    return (
      <div className="page-container">
        <div className="page-title">
          <h1>Edit Existing Embed</h1>
          <button className="btn btn-outline" onClick={() => { setEditEmbedView(false); setEditEmbedData(null); setEditMessageData(null); setMessageLink(''); }}>
            ← Back to Builder
          </button>
        </div>

        {/* Message Link Input */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaLink style={{ color: '#5865F2' }} /> Load Embed from Message Link
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Discord Message Link</label>
              <input
                type="text"
                value={messageLink}
                onChange={(e) => setMessageLink(e.target.value)}
                placeholder="https://discord.com/channels/123456/789012/345678"
                style={{ width: '100%' }}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={loadMessageEmbed}
              disabled={editMessageLoading}
              style={{ height: '42px', whiteSpace: 'nowrap' }}
            >
              {editMessageLoading ? '⏳ Loading...' : '📥 Load Embed'}
            </button>
          </div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '10px' }}>
            Paste the message link of a bot-sent embed. Right-click the message in Discord → Copy Message Link.
          </p>
        </div>

        {/* Edit Form + Preview (shown after loading) */}
        {editEmbedData && (
          <div className="grid grid-2">
            {/* Editor */}
            <div className="card">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaEdit style={{ color: '#00b894' }} /> Edit Embed
              </h2>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editEmbedData.title}
                  onChange={(e) => setEditEmbedData({...editEmbedData, title: e.target.value})}
                  placeholder="Embed Title"
                  maxLength={256}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <FormattingToolbar
                  targetRef={editEmbedDescRef}
                  onInsert={(text, start, end) => {
                    const current = editEmbedData.description;
                    const newDesc = current.substring(0, start) + text + current.substring(end);
                    setEditEmbedData({ ...editEmbedData, description: newDesc });
                  }}
                />
                <textarea
                  ref={editEmbedDescRef}
                  value={editEmbedData.description}
                  onChange={(e) => setEditEmbedData({...editEmbedData, description: e.target.value})}
                  placeholder="Embed description..."
                  maxLength={4096}
                  rows={6}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Color</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={editEmbedData.color?.length === 7 ? editEmbedData.color : '#00b894'}
                      onChange={(e) => setEditEmbedData({...editEmbedData, color: e.target.value})}
                      style={{ width: '60px', height: '40px', cursor: 'pointer', border: '2px solid #40444b', borderRadius: '8px', padding: '2px' }}
                    />
                    <input
                      type="text"
                      value={editEmbedData.color}
                      onChange={(e) => setEditEmbedData({...editEmbedData, color: e.target.value})}
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
                      checked={editEmbedData.timestamp}
                      onChange={(e) => setEditEmbedData({...editEmbedData, timestamp: e.target.checked})}
                      style={{ width: 'auto' }}
                    />
                    <span>Include timestamp</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Thumbnail URL</label>
                <input
                  type="text"
                  value={editEmbedData.thumbnail}
                  onChange={(e) => setEditEmbedData({...editEmbedData, thumbnail: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  value={editEmbedData.image}
                  onChange={(e) => setEditEmbedData({...editEmbedData, image: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Footer Text</label>
                  <input
                    type="text"
                    value={editEmbedData.footer?.text || ''}
                    onChange={(e) => setEditEmbedData({...editEmbedData, footer: {...editEmbedData.footer, text: e.target.value}})}
                    placeholder="Footer text"
                  />
                </div>
                <div className="form-group">
                  <label>Footer Icon URL</label>
                  <input
                    type="text"
                    value={editEmbedData.footer?.iconURL || ''}
                    onChange={(e) => setEditEmbedData({...editEmbedData, footer: {...editEmbedData.footer, iconURL: e.target.value}})}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Author Name</label>
                  <input
                    type="text"
                    value={editEmbedData.author?.name || ''}
                    onChange={(e) => setEditEmbedData({...editEmbedData, author: {...editEmbedData.author, name: e.target.value}})}
                    placeholder="Author name"
                  />
                </div>
                <div className="form-group">
                  <label>Author Icon URL</label>
                  <input
                    type="text"
                    value={editEmbedData.author?.iconURL || ''}
                    onChange={(e) => setEditEmbedData({...editEmbedData, author: {...editEmbedData.author, iconURL: e.target.value}})}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #2C2F33' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>Fields</h3>
                <button className="btn btn-outline" onClick={() => setEditEmbedData({...editEmbedData, fields: [...editEmbedData.fields, { name: '', value: '', inline: false }]})}>
                  <FaPlus /> Add Field
                </button>
              </div>

              {editEmbedData.fields.map((field, index) => (
                <div key={index} style={{ padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong>Field {index + 1}</strong>
                    <button className="btn btn-danger" onClick={() => setEditEmbedData({...editEmbedData, fields: editEmbedData.fields.filter((_, i) => i !== index)})} style={{ padding: '5px 10px' }}>
                      <FaTrash />
                    </button>
                  </div>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => {
                        const newFields = [...editEmbedData.fields];
                        newFields[index].name = e.target.value;
                        setEditEmbedData({...editEmbedData, fields: newFields});
                      }}
                      placeholder="Field name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Value</label>
                    <textarea
                      value={field.value}
                      onChange={(e) => {
                        const newFields = [...editEmbedData.fields];
                        newFields[index].value = e.target.value;
                        setEditEmbedData({...editEmbedData, fields: newFields});
                      }}
                      placeholder="Field value"
                      rows={3}
                    />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={field.inline}
                      onChange={(e) => {
                        const newFields = [...editEmbedData.fields];
                        newFields[index].inline = e.target.checked;
                        setEditEmbedData({...editEmbedData, fields: newFields});
                      }}
                      style={{ width: 'auto' }}
                    />
                    <span>Inline</span>
                  </label>
                </div>
              ))}

              <button
                className="btn btn-primary"
                onClick={saveEditedEmbed}
                disabled={editMessageLoading}
                style={{ width: '100%', marginTop: '20px', padding: '14px' }}
              >
                {editMessageLoading ? '⏳ Saving...' : '💾 Save Changes to Discord'}
              </button>
            </div>

            {/* Live Preview */}
            <div className="card">
              <h2>Live Preview</h2>
              <div style={{
                borderLeft: `4px solid ${editEmbedData.color}`,
                background: 'var(--bg-secondary)',
                padding: '15px',
                borderRadius: '4px',
                marginTop: '20px',
                display: 'flex',
                gap: '15px'
              }}>
                <div style={{ flex: 1 }}>
                  {editEmbedData.author?.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      {editEmbedData.author.iconURL && <img src={editEmbedData.author.iconURL} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
                      <strong style={{ fontSize: '14px', color: '#ffffff' }}>{renderDiscordMarkdown(editEmbedData.author.name)}</strong>
                    </div>
                  )}
                  {editEmbedData.title && <h3 style={{ marginBottom: '10px', color: '#ffffff' }}>{renderDiscordMarkdown(editEmbedData.title)}</h3>}
                  {editEmbedData.description && <div style={{ color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.5' }}>{renderDiscordMarkdown(editEmbedData.description)}</div>}

                  {editEmbedData.fields.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: editEmbedData.fields.some(f => f.inline) ? 'repeat(3, 1fr)' : '1fr', gap: '10px', marginTop: '10px' }}>
                      {editEmbedData.fields.map((field, idx) => (
                        <div key={idx}>
                          <strong style={{ fontSize: '14px', display: 'block', marginBottom: '5px', color: '#ffffff' }}>{renderDiscordMarkdown(field.name)}</strong>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{renderDiscordMarkdown(field.value)}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {editEmbedData.image && <img src={editEmbedData.image} alt="" style={{ width: '100%', borderRadius: '4px', marginTop: '15px' }} />}

                  {editEmbedData.footer?.text && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {editEmbedData.footer.iconURL && <img src={editEmbedData.footer.iconURL} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />}
                      <span>{renderDiscordMarkdown(editEmbedData.footer.text)}</span>
                      {editEmbedData.timestamp && <span> • {new Date().toLocaleString()}</span>}
                    </div>
                  )}
                </div>
                {editEmbedData.thumbnail && (
                  <div style={{ flexShrink: 0 }}>
                    <img src={editEmbedData.thumbnail} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                )}
              </div>

              {/* Message Info */}
              {editMessageData && (
                <div style={{
                  marginTop: '20px',
                  padding: '14px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  border: '1px solid #40444b'
                }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Channel ID:</strong> {editMessageData.channelId}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Message ID:</strong> {editMessageData.messageId}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state when no embed loaded */}
        {!editEmbedData && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px solid #40444b'
          }}>
            <FaEdit size={48} style={{ color: 'var(--border-secondary)', marginBottom: '16px' }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No Embed Loaded</h3>
            <p style={{ color: 'var(--text-tertiary)', maxWidth: '400px', margin: '0 auto' }}>
              Paste a Discord message link above and click "Load Embed" to edit an existing embed sent by the bot.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-title">
        <h1>Embed Builder</h1>
        <button className="btn btn-primary" onClick={() => setEditEmbedView(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaEdit /> Edit Embed
        </button>
      </div>

      <div className="grid grid-2">
        {/* Editor */}
        <div className="card">
          <h2>Embed Editor</h2>
          
          {/* Multi-embed tabs */}
          <div style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {embedsList.map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => switchEmbed(i)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: embedsList.length > 1 ? '8px 0 0 8px' : '8px',
                    border: i === activeEmbedIndex ? '1px solid #5865F2' : '1px solid #40444b',
                    backgroundColor: i === activeEmbedIndex ? '#5865F2' : 'var(--bg-tertiary)',
                    color: i === activeEmbedIndex ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: i === activeEmbedIndex ? '600' : '400',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '3px',
                    backgroundColor: (i === activeEmbedIndex ? embedData.color : embedsList[i].color) || '#00b894'
                  }} />
                  Embed {i + 1}
                </button>
                {embedsList.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeEmbed(i); }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '0 8px 8px 0',
                      border: '1px solid #40444b',
                      borderLeft: 'none',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: '#ed4245',
                      cursor: 'pointer',
                      fontSize: '12px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ed424520'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                    title={`Remove Embed ${i + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addNewEmbed}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px dashed #5865F2',
                backgroundColor: 'transparent',
                color: '#5865F2',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5865F215'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Add another embed (max 10)"
            >
              <FaPlus style={{ fontSize: '10px' }} /> Add Embed
            </button>
          </div>

          {embedsList.length > 1 && (
            <div style={{
              padding: '10px 14px',
              background: '#5865F215',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📦 Sending <strong style={{ color: '#ffffff' }}>{embedsList.length} embeds</strong> in one message (max 10)
            </div>
          )}
          
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
            <div key={index} style={{ padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '10px' }}>
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

          <div style={{ marginTop: '20px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Character Count: <strong style={{ color: charCount > 6000 ? '#ED4245' : '#00b894' }}>{charCount} / 6000</strong>
            </p>
          </div>

          {editingEmbedId && (
            <div style={{
              marginTop: '20px',
              padding: '12px',
              background: '#5865F220',
              border: '1px solid #5865F2',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#dee0fc', fontSize: '13px' }}>
                ✏️ Editing: <strong>{embedData.name}</strong>
              </span>
              <button
                className="btn btn-outline"
                onClick={cancelEdit}
                style={{ padding: '4px 12px', fontSize: '12px' }}
              >
                Cancel Edit
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={saveEmbed} style={{ flex: 1 }}>
              <FaSave /> {editingEmbedId ? 'Update Template' : 'Save Template'}
            </button>
            <button className="btn btn-secondary" onClick={sendEmbed} style={{ flex: 1 }}>
              <FaPaperPlane /> Send {embedsList.length > 1 ? `${embedsList.length} Embeds` : 'Embed'} to {selectedChannelIds.length} Channel(s)
            </button>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="card">
            <h2>Live Preview {embedsList.length > 1 && <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '400' }}>({embedsList.length} embeds)</span>}</h2>

            {/* Mentions outside embed preview */}
            {(mentions.length > 0 || userMentions.length > 0) && (
              <div style={{
                padding: '8px 0',
                marginTop: '16px',
                color: 'var(--text-primary)',
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
            
            {/* Render all embeds stacked */}
            {(() => {
              const allEmbeds = embedsList.map((e, i) => i === activeEmbedIndex ? embedData : e);
              return allEmbeds.map((emb, embIdx) => (
                (emb.title || emb.description || emb.image) && (
                  <div key={embIdx} style={{ 
                    borderLeft: `4px solid ${emb.color || '#00b894'}`, 
                    background: 'var(--bg-secondary)', 
                    padding: '15px', 
                    borderRadius: '4px',
                    marginTop: embIdx === 0 ? ((mentions.length > 0 || userMentions.length > 0) ? '8px' : '20px') : '4px',
                    display: 'flex',
                    gap: '15px',
                    cursor: 'pointer',
                    outline: embIdx === activeEmbedIndex ? '1px solid #5865F250' : 'none'
                  }}
                  onClick={() => switchEmbed(embIdx)}
                  title={`Click to edit Embed ${embIdx + 1}`}
                  >
                    <div style={{ flex: 1 }}>
                      {emb.author?.name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          {emb.author.iconURL && <img src={emb.author.iconURL} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
                          <strong style={{ fontSize: '14px', color: '#ffffff' }}>{renderDiscordMarkdown(emb.author.name)}</strong>
                        </div>
                      )}
                      
                      {emb.title && <h3 style={{ marginBottom: '10px', color: '#ffffff' }}>{renderDiscordMarkdown(emb.title)}</h3>}
                      {emb.description && <div style={{ color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.5' }}>{renderDiscordMarkdown(emb.description)}</div>}
                      
                      {emb.fields?.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: emb.fields.some(f => f.inline) ? 'repeat(3, 1fr)' : '1fr', gap: '10px', marginTop: '10px' }}>
                          {emb.fields.map((field, idx) => (
                            <div key={idx}>
                              <strong style={{ fontSize: '14px', display: 'block', marginBottom: '5px', color: '#ffffff' }}>{renderDiscordMarkdown(field.name)}</strong>
                              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{renderDiscordMarkdown(field.value)}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {emb.image && (
                        <img src={emb.image} alt="" style={{ width: '100%', borderRadius: '4px', marginTop: '15px' }} />
                      )}

                      {emb.footer?.text && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {emb.footer.iconURL && <img src={emb.footer.iconURL} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />}
                          <span>{renderDiscordMarkdown(emb.footer.text)}</span>
                          {emb.timestamp && <span> • {new Date().toLocaleString()}</span>}
                        </div>
                      )}
                    </div>

                    {emb.thumbnail && (
                      <div style={{ flexShrink: 0 }}>
                        <img src={emb.thumbnail} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                      </div>
                    )}
                  </div>
                )
              ));
            })()}
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <h3>Saved Templates</h3>
            {savedEmbeds.map(embed => (
              <div key={embed.id} style={{
                padding: '10px 12px',
                background: editingEmbedId === embed.id ? '#5865F215' : 'var(--bg-secondary)',
                borderRadius: '8px',
                marginTop: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: editingEmbedId === embed.id ? '1px solid #5865F2' : '1px solid transparent',
                transition: 'all 0.2s'
              }}>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {editingEmbedId === embed.id && <span style={{ color: '#5865F2', marginRight: '6px' }}>✏️</span>}
                  {embed.name}
                </span>
                <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                  <button className="btn btn-outline" onClick={() => editEmbed(embed)} style={{ padding: '5px 10px' }} title="Edit">
                    <FaEdit />
                  </button>
                  <button className="btn btn-outline" onClick={() => loadEmbed(embed)} style={{ padding: '5px 10px' }} title="Load">
                    Load
                  </button>
                  <button className="btn btn-secondary" onClick={() => duplicateEmbed(embed.id)} style={{ padding: '5px 10px' }} title="Duplicate">
                    <FaCopy />
                  </button>
                  <button className="btn btn-danger" onClick={() => deleteEmbed(embed.id, embed.name)} style={{ padding: '5px 10px' }} title="Delete">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
            {savedEmbeds.length === 0 && (
              <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No saved templates</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Embeds;
