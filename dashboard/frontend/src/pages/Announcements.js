import React, { useState, useEffect, useRef } from 'react';
import { announcements, discord } from '../services/api';
import { toast } from 'react-toastify';
import { FaBullhorn, FaClock, FaPaperPlane, FaCalendarAlt, FaTimes, FaBold, FaItalic, FaUnderline, FaStrikethrough, FaCode, FaLink } from 'react-icons/fa';
import ConfirmDialog from '../components/ConfirmDialog';

// Discord Markdown Renderer
function renderDiscordMarkdown(text) {
  if (!text) return null;
  
  let html = text;
  
  // Code blocks (must be before inline code)
  html = html.replace(/```([\s\S]*?)```/g, '<pre style="background: #2f3136; padding: 8px; border-radius: 4px; overflow-x: auto; margin: 8px 0;"><code>$1</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background: #2f3136; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 0.85em;">$1</code>');
  
  // Bold + Italic (must be before individual bold/italic)
  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
  
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<u>$1</u>');
  
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  // Strikethrough
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  
  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #00b0f4; text-decoration: none;">$1</a>');
  
  // Mentions (roles/users)
  html = html.replace(/&lt;@&amp;(\d+)&gt;/g, '<span style="background: #5865f2; color: white; padding: 0 4px; border-radius: 3px; font-weight: 500;">@role</span>');
  html = html.replace(/&lt;@(\d+)&gt;/g, '<span style="background: #5865f2; color: white; padding: 0 4px; border-radius: 3px; font-weight: 500;">@user</span>');
  html = html.replace(/<@&(\d+)>/g, '<span style="background: #5865f2; color: white; padding: 0 4px; border-radius: 3px; font-weight: 500;">@role</span>');
  html = html.replace(/<@(\d+)>/g, '<span style="background: #5865f2; color: white; padding: 0 4px; border-radius: 3px; font-weight: 500;">@user</span>');
  
  // Line breaks
  html = html.replace(/\n/g, '<br/>');
  
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
            backgroundColor: '#2a2a2a',
            border: 'none',
            borderRadius: '4px',
            color: '#ccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#FFD700'}
          onMouseLeave={(e) => { e.target.style.backgroundColor = '#2a2a2a'; e.target.style.color = '#ccc'; }}
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
          backgroundColor: '#2a2a2a',
          border: 'none',
          borderRadius: '4px',
          color: '#ccc',
          cursor: 'pointer',
          fontSize: '11px',
          fontFamily: 'monospace',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#FFD700'}
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
          backgroundColor: '#2a2a2a',
          border: 'none',
          borderRadius: '4px',
          color: '#ccc',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '13px',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#FFD700'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#40444b'}
      >
        <FaLink size={12} />
      </button>
    </div>
  );
}

// Multi-select channel component with search
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
            background: '#FFD700',
            borderRadius: '16px',
            color: '#000',
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
            color: '#ccc',
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
                  color: '#ccc',
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

      <p style={{ marginTop: '8px', fontSize: '13px', color: '#72767d' }}>
        Selected: {selectedChannelIds.length} channel(s)
      </p>
    </div>
  );
}

// Mention selector for roles only
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
      <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#ccc', fontSize: '14px' }}>
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
            color: '#ccc',
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
                  color: '#ccc',
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
                  <span style={{ fontSize: '11px', color: '#72767d' }}>
                    👥
                  </span>
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

      <p style={{ marginTop: '8px', fontSize: '13px', color: '#72767d' }}>
        Selected: {selectedMentions.length} mention(s)
      </p>
    </div>
  );
}

// Single channel select with search
// eslint-disable-next-line no-unused-vars
function ChannelSelect({ value, onChange, channels }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedChannel = channels.find(ch => ch.id === value);

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
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px',
          background: '#2C2F33',
          border: '1px solid #40444b',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: selectedChannel ? '#dcddde' : '#72767d'
        }}
      >
        <span>{selectedChannel ? `#${selectedChannel.name}` : "Select Channel"}</span>
        <span style={{ fontSize: '12px' }}>▼</span>
      </div>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '5px',
          background: '#2C2F33',
          border: '1px solid #40444b',
          borderRadius: '4px',
          maxHeight: '300px',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search channels..."
            autoFocus
            style={{
              width: 'calc(100% - 20px)',
              padding: '10px',
              margin: '10px',
              background: '#23272A',
              border: '1px solid #40444b',
              borderRadius: '4px',
              color: '#ccc',
              fontSize: '14px'
            }}
          />
          {filteredChannels.map(channel => (
            <div
              key={channel.id}
              onClick={() => {
                onChange(channel.id);
                setIsOpen(false);
                setSearchTerm('');
              }}
              style={{
                padding: '10px 15px',
                cursor: 'pointer',
                color: '#ccc',
                background: value === channel.id ? '#40444b' : 'transparent',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#40444b'}
              onMouseLeave={(e) => e.target.style.background = value === channel.id ? '#40444b' : 'transparent'}
            >
              #{channel.name}
            </div>
          ))}
          {filteredChannels.length === 0 && (
            <div style={{ padding: '15px', color: '#72767d', textAlign: 'center' }}>
              No channels found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Announcements() {
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('broadcast'); // 'broadcast' or 'scheduled'
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, messageId: null });
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [broadcastData, setBroadcastData] = useState({
    templateName: '',
    channelIds: [],
    mentions: [],
    embedData: {
      title: '',
      description: '',
      color: '#FFD700',
      url: '',
      thumbnail: '',
      image: '',
      footer: { text: '', iconURL: '' },
      author: { name: '', iconURL: '' },
      timestamp: false,
      fields: []
    }
  });

  const embedTitleRef = useRef(null);
  const embedDescRef = useRef(null);
  const embedFooterRef = useRef(null);
  const embedAuthorRef = useRef(null);

  const [scheduleData, setScheduleData] = useState({
    templateName: '',
    channelIds: [],
    mentions: [],
    scheduleTime: '',
    embedData: {
      title: '',
      description: '',
      color: '#FFD700',
      url: '',
      thumbnail: '',
      image: '',
      footer: { text: '', iconURL: '' },
      author: { name: '', iconURL: '' },
      timestamp: false,
      fields: []
    },
    repeat: 'none'
  });

  const scheduleEmbedTitleRef = useRef(null);
  const scheduleEmbedDescRef = useRef(null);
  const scheduleFooterRef = useRef(null);
  const scheduleAuthorRef = useRef(null);

  useEffect(() => {
    fetchScheduledMessages();
    fetchChannels();
  }, []);

  const fetchScheduledMessages = async () => {
    try {
      console.log('Fetching scheduled messages...');
      const response = await announcements.getScheduled();
      console.log('Scheduled messages response:', response.data);
      setScheduledMessages(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching scheduled messages:', error);
      toast.error(`Failed to load scheduled messages: ${error.response?.data?.error || error.message}`);
      setScheduledMessages([]);
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const [channelsRes, rolesRes] = await Promise.all([
        discord.getChannels(),
        discord.getRoles()
      ]);
      setChannels(channelsRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error('Failed to load Discord data', error);
    }
  };

  const handleBroadcast = async () => {
    if (broadcastData.channelIds.length === 0) {
      toast.error('Please select at least one channel');
      return;
    }
    if (!broadcastData.embedData.title && !broadcastData.embedData.description) {
      toast.error('Embed must have a title or description');
      return;
    }

    try {
      console.log('Sending announcement:', {
        channelIds: broadcastData.channelIds,
        embedData: broadcastData.embedData,
        mentions: broadcastData.mentions
      });
      
      // Extract just the role IDs from mentions array
      const roleIds = broadcastData.mentions.map(m => m.id);
      
      const response = await announcements.sendToMultiple(
        broadcastData.channelIds,
        '',
        broadcastData.embedData,
        roleIds
      );
      
      console.log('Announcement response:', response);
      toast.success(`Announcement sent to ${broadcastData.channelIds.length} channel(s)!`);
      setBroadcastData({
        channelIds: [],
        mentions: [],
        embedData: {
          title: '',
          description: '',
          color: '#FFD700',
          url: '',
          thumbnail: '',
          image: '',
          footer: { text: '', iconURL: '' },
          author: { name: '', iconURL: '' },
          timestamp: false,
          fields: []
        }
      });
    } catch (error) {
      console.error('Announcement error:', error);
      toast.error(`Failed to send announcement: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleData.channelIds || scheduleData.channelIds.length === 0) {
      toast.error('Please select at least one channel');
      return;
    }
    if (!scheduleData.scheduleTime) {
      toast.error('Please provide schedule time');
      return;
    }
    if (!scheduleData.embedData.title && !scheduleData.embedData.description) {
      toast.error('Please provide at least an embed title or description');
      return;
    }

    try {
      console.log('Scheduling message with data:', scheduleData);
      
      // Extract just the role IDs from mentions array
      const scheduleDataToSend = {
        ...scheduleData,
        mentions: scheduleData.mentions.map(m => m.id)
      };
      
      const response = await announcements.create(scheduleDataToSend);
      console.log('Schedule response:', response.data);
      toast.success('Message scheduled successfully!');
      setScheduleData({
        channelIds: [],
        mentions: [],
        scheduleTime: '',
        embedData: {
          title: '',
          description: '',
          color: '#FFD700',
          url: '',
          thumbnail: '',
          image: '',
          footer: { text: '', iconURL: '' },
          author: { name: '', iconURL: '' },
          timestamp: false,
          fields: []
        },
        repeat: 'none'
      });
      await fetchScheduledMessages();
    } catch (error) {
      console.error('Error scheduling message:', error);
      toast.error(`Failed to schedule message: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleCancel = (id) => {
    setConfirmDialog({ isOpen: true, messageId: id });
  };

  const confirmCancel = async () => {
    try {
      await announcements.cancel(confirmDialog.messageId);
      toast.success('Scheduled message cancelled');
      setConfirmDialog({ isOpen: false, messageId: null });
      fetchScheduledMessages();
    } catch (error) {
      toast.error('Failed to cancel scheduled message');
      setConfirmDialog({ isOpen: false, messageId: null });
    }
  };

  const saveTemplate = (data, type) => {
    if (!data.templateName) {
      toast.error('Please enter a template name');
      return;
    }

    const template = {
      name: data.templateName,
      type: type, // 'broadcast' or 'schedule'
      data: {
        embedData: data.embedData,
        mentions: data.mentions || [],
        channelIds: data.channelIds || [],
        ...(type === 'schedule' && { repeat: data.repeat })
      },
      createdAt: new Date().toISOString()
    };

    const templates = JSON.parse(localStorage.getItem('announcementTemplates') || '[]');
    templates.push(template);
    localStorage.setItem('announcementTemplates', JSON.stringify(templates));
    setSavedTemplates(templates);
    toast.success('Template saved successfully!');
  };

  const loadTemplate = (template) => {
    if (template.type === 'broadcast') {
      setBroadcastData({
        ...broadcastData,
        templateName: template.name,
        embedData: template.data.embedData,
        mentions: template.data.mentions || [],
        channelIds: template.data.channelIds || []
      });
      setActiveTab('broadcast');
    } else if (template.type === 'schedule') {
      setScheduleData({
        ...scheduleData,
        templateName: template.name,
        embedData: template.data.embedData,
        mentions: template.data.mentions || [],
        channelIds: template.data.channelIds || [],
        repeat: template.data.repeat || 'none'
      });
      setActiveTab('scheduled');
    }
    toast.success(`Template "${template.name}" loaded!`);
  };

  const deleteTemplate = (index) => {
    const templates = JSON.parse(localStorage.getItem('announcementTemplates') || '[]');
    templates.splice(index, 1);
    localStorage.setItem('announcementTemplates', JSON.stringify(templates));
    setSavedTemplates(templates);
    toast.success('Template deleted');
  };

  useEffect(() => {
    const templates = JSON.parse(localStorage.getItem('announcementTemplates') || '[]');
    setSavedTemplates(templates);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#FFD700',
      pending: '#ffc107',
      sent: '#28a745',
      failed: '#dc3545',
      cancelled: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-title">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaBullhorn /> Announcements & Scheduling
          </h1>
          <p style={{ color: '#888', fontSize: '14px', margin: '8px 0 0 0' }}>
            Broadcast messages and schedule announcements across multiple channels
          </p>
        </div>
      </div>

      <div className="tab-buttons" style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '25px',
        flexWrap: 'wrap'
      }}>
        <button 
          className={activeTab === 'broadcast' ? 'btn' : 'btn-secondary'}
          onClick={() => setActiveTab('broadcast')}
          style={{ padding: '12px 24px' }}
        >
          <FaPaperPlane /> Broadcast Now
        </button>
        <button 
          className={activeTab === 'scheduled' ? 'btn' : 'btn-secondary'}
          onClick={() => setActiveTab('scheduled')}
          style={{ padding: '12px 24px' }}
        >
          <FaClock /> Scheduled Messages
        </button>
      </div>

      {activeTab === 'broadcast' && (
        <div className="broadcast-section" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <h3 style={{ color: '#FFD700', margin: 0 }}>Send Announcement to Multiple Channels</h3>
            </div>
            <div style={{ padding: '20px' }}>
            
            <div style={{ display: 'grid', gap: '24px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>📝 Template Name (Optional)</label>
                <input
                  type="text"
                  value={broadcastData.templateName}
                  onChange={(e) => setBroadcastData({ ...broadcastData, templateName: e.target.value })}
                  placeholder="My Announcement Template"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #3a3a3a',
                    borderRadius: '6px',
                    color: '#ccc',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>
                  📍 Select Channels
                </label>
                <ChannelMultiSelect
                  selectedChannelIds={broadcastData.channelIds}
                  channels={channels}
                  onChange={(channelIds) => setBroadcastData({ ...broadcastData, channelIds })}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <MentionSelector
                  selectedMentions={broadcastData.mentions}
                  roles={roles}
                  label="👥 Mention Outside Embed (Roles)"
                  onChange={(mentions) => setBroadcastData({ ...broadcastData, mentions })}
                />
              </div>

              <div className="embed-builder" style={{ 
                  padding: '20px', 
                  backgroundColor: '#1a1a1a', 
                  borderRadius: '10px',
                  border: '2px solid #FFD700',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.1)'
                }}>
                  <h4 style={{ 
                    marginBottom: '20px', 
                    color: '#FFD700', 
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    ✨ Embed Settings
                  </h4>
                  
                  <div style={{ display: 'grid', gap: '18px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                        Embed Title
                      </label>
                      <FormattingToolbar 
                        targetRef={embedTitleRef}
                        onInsert={(text, start, end) => {
                          const current = broadcastData.embedData.title;
                          const newTitle = current.substring(0, start) + text + current.substring(end);
                          setBroadcastData({
                            ...broadcastData,
                            embedData: { ...broadcastData.embedData, title: newTitle }
                          });
                        }}
                      />
                      <input
                        ref={embedTitleRef}
                        type="text"
                        value={broadcastData.embedData.title}
                        onChange={(e) => setBroadcastData({
                          ...broadcastData,
                          embedData: { ...broadcastData.embedData, title: e.target.value }
                        })}
                        placeholder="Enter embed title..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#2a2a2a',
                          border: '1px solid #3a3a3a',
                          borderRadius: '6px',
                          color: '#ccc',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                        Embed Description
                      </label>
                      <FormattingToolbar 
                        targetRef={embedDescRef}
                        onInsert={(text, start, end) => {
                          const current = broadcastData.embedData.description;
                          const newDesc = current.substring(0, start) + text + current.substring(end);
                          setBroadcastData({
                            ...broadcastData,
                            embedData: { ...broadcastData.embedData, description: newDesc }
                          });
                        }}
                      />
                      <textarea
                        ref={embedDescRef}
                        value={broadcastData.embedData.description}
                        onChange={(e) => setBroadcastData({
                          ...broadcastData,
                          embedData: { ...broadcastData.embedData, description: e.target.value }
                        })}
                        placeholder="Enter embed description..."
                        rows="4"
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#2a2a2a',
                          border: '1px solid #3a3a3a',
                          borderRadius: '6px',
                          color: '#ccc',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          lineHeight: '1.5',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                        Embed Color (Click to Pick)
                      </label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={broadcastData.embedData.color?.length === 7 ? broadcastData.embedData.color : '#FFD700'}
                          onChange={(e) => setBroadcastData({
                            ...broadcastData,
                            embedData: { ...broadcastData.embedData, color: e.target.value }
                          })}
                          style={{
                            width: '60px',
                            height: '48px',
                            cursor: 'pointer',
                            border: '2px solid #40444b',
                            borderRadius: '8px',
                            backgroundColor: 'transparent'
                          }}
                          title="Click to open color picker"
                        />
                        <input
                          type="text"
                          value={broadcastData.embedData.color}
                          onChange={(e) => setBroadcastData({
                            ...broadcastData,
                            embedData: { ...broadcastData.embedData, color: e.target.value }
                          })}
                          placeholder="#FFD700"
                          maxLength={7}
                          style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#2a2a2a',
                            border: '1px solid #3a3a3a',
                            borderRadius: '6px',
                            color: '#ccc',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                        URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={broadcastData.embedData.url}
                        onChange={(e) => setBroadcastData({
                          ...broadcastData,
                          embedData: { ...broadcastData.embedData, url: e.target.value }
                        })}
                        placeholder="https://..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#2a2a2a',
                          border: '1px solid #3a3a3a',
                          borderRadius: '6px',
                          color: '#ccc',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                          Thumbnail URL
                        </label>
                        <input
                          type="url"
                          value={broadcastData.embedData.thumbnail}
                          onChange={(e) => setBroadcastData({
                            ...broadcastData,
                            embedData: { ...broadcastData.embedData, thumbnail: e.target.value }
                          })}
                          placeholder="https://..."
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#2a2a2a',
                            border: '1px solid #3a3a3a',
                            borderRadius: '6px',
                            color: '#ccc',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                          Image URL
                        </label>
                        <input
                          type="url"
                          value={broadcastData.embedData.image}
                          onChange={(e) => setBroadcastData({
                            ...broadcastData,
                            embedData: { ...broadcastData.embedData, image: e.target.value }
                          })}
                          placeholder="https://..."
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#2a2a2a',
                            border: '1px solid #3a3a3a',
                            borderRadius: '6px',
                            color: '#ccc',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                          Author Name
                        </label>
                        <FormattingToolbar 
                          targetRef={embedAuthorRef}
                          onInsert={(text, start, end) => {
                            const current = broadcastData.embedData.author.name;
                            const newName = current.substring(0, start) + text + current.substring(end);
                            setBroadcastData({
                              ...broadcastData,
                              embedData: { ...broadcastData.embedData, author: { ...broadcastData.embedData.author, name: newName } }
                            });
                          }}
                        />
                        <input
                          ref={embedAuthorRef}
                          type="text"
                          value={broadcastData.embedData.author.name}
                          onChange={(e) => setBroadcastData({
                            ...broadcastData,
                            embedData: { ...broadcastData.embedData, author: { ...broadcastData.embedData.author, name: e.target.value } }
                          })}
                          placeholder="Author name..."
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#2a2a2a',
                            border: '1px solid #3a3a3a',
                            borderRadius: '6px',
                            color: '#ccc',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                          Author Icon URL
                        </label>
                        <input
                          type="url"
                          value={broadcastData.embedData.author.iconURL}
                          onChange={(e) => setBroadcastData({
                            ...broadcastData,
                            embedData: { ...broadcastData.embedData, author: { ...broadcastData.embedData.author, iconURL: e.target.value } }
                          })}
                          placeholder="https://..."
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#2a2a2a',
                            border: '1px solid #3a3a3a',
                            borderRadius: '6px',
                            color: '#ccc',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                          Footer Text
                        </label>
                        <FormattingToolbar 
                          targetRef={embedFooterRef}
                          onInsert={(text, start, end) => {
                            const current = broadcastData.embedData.footer.text;
                            const newText = current.substring(0, start) + text + current.substring(end);
                            setBroadcastData({
                              ...broadcastData,
                              embedData: { ...broadcastData.embedData, footer: { ...broadcastData.embedData.footer, text: newText } }
                            });
                          }}
                        />
                        <input
                          ref={embedFooterRef}
                          type="text"
                          value={broadcastData.embedData.footer.text}
                          onChange={(e) => setBroadcastData({
                            ...broadcastData,
                            embedData: { ...broadcastData.embedData, footer: { ...broadcastData.embedData.footer, text: e.target.value } }
                          })}
                          placeholder="Footer text..."
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#2a2a2a',
                            border: '1px solid #3a3a3a',
                            borderRadius: '6px',
                            color: '#ccc',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                          Footer Icon URL
                        </label>
                        <input
                          type="url"
                          value={broadcastData.embedData.footer.iconURL}
                          onChange={(e) => setBroadcastData({
                            ...broadcastData,
                            embedData: { ...broadcastData.embedData, footer: { ...broadcastData.embedData.footer, iconURL: e.target.value } }
                          })}
                          placeholder="https://..."
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#2a2a2a',
                            border: '1px solid #3a3a3a',
                            borderRadius: '6px',
                            color: '#ccc',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={broadcastData.embedData.timestamp}
                          onChange={(e) => setBroadcastData({
                            ...broadcastData,
                            embedData: { ...broadcastData.embedData, timestamp: e.target.checked }
                          })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ color: '#ccc', fontSize: '13px', fontWeight: '500' }}>
                          Add Timestamp
                        </span>
                      </label>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={{ fontWeight: '500', color: '#ccc', fontSize: '13px', margin: 0 }}>
                          Fields
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newFields = [...broadcastData.embedData.fields, { name: '', value: '', inline: false }];
                            setBroadcastData({
                              ...broadcastData,
                              embedData: { ...broadcastData.embedData, fields: newFields }
                            });
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#FFD700',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          + Add Field
                        </button>
                      </div>
                      {broadcastData.embedData.fields.map((field, index) => (
                        <div key={index} style={{
                          padding: '12px',
                          backgroundColor: '#2C2F33',
                          borderRadius: '6px',
                          marginBottom: '8px',
                          border: '1px solid #40444b'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ color: '#ccc', fontSize: '12px', fontWeight: '600' }}>Field {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newFields = broadcastData.embedData.fields.filter((_, i) => i !== index);
                                setBroadcastData({
                                  ...broadcastData,
                                  embedData: { ...broadcastData.embedData, fields: newFields }
                                });
                              }}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#ed4245',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px'
                              }}
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => {
                              const newFields = [...broadcastData.embedData.fields];
                              newFields[index].name = e.target.value;
                              setBroadcastData({
                                ...broadcastData,
                                embedData: { ...broadcastData.embedData, fields: newFields }
                              });
                            }}
                            placeholder="Field name..."
                            style={{
                              width: '100%',
                              padding: '8px',
                              marginBottom: '6px',
                              backgroundColor: '#2a2a2a',
                              border: '1px solid #3a3a3a',
                              borderRadius: '4px',
                              color: '#ccc',
                              fontSize: '13px',
                              boxSizing: 'border-box'
                            }}
                          />
                          <textarea
                            value={field.value}
                            onChange={(e) => {
                              const newFields = [...broadcastData.embedData.fields];
                              newFields[index].value = e.target.value;
                              setBroadcastData({
                                ...broadcastData,
                                embedData: { ...broadcastData.embedData, fields: newFields }
                              });
                            }}
                            placeholder="Field value..."
                            rows="2"
                            style={{
                              width: '100%',
                              padding: '8px',
                              marginBottom: '6px',
                              backgroundColor: '#2a2a2a',
                              border: '1px solid #3a3a3a',
                              borderRadius: '4px',
                              color: '#ccc',
                              fontSize: '13px',
                              fontFamily: 'inherit',
                              resize: 'vertical',
                              boxSizing: 'border-box'
                            }}
                          />
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={field.inline}
                              onChange={(e) => {
                                const newFields = [...broadcastData.embedData.fields];
                                newFields[index].inline = e.target.checked;
                                setBroadcastData({
                                  ...broadcastData,
                                  embedData: { ...broadcastData.embedData, fields: newFields }
                                });
                              }}
                              style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                            />
                            <span style={{ color: '#b9bbbe', fontSize: '12px' }}>Inline</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <button 
                  className="btn" 
                  onClick={() => saveTemplate(broadcastData, 'broadcast')}
                  style={{
                    padding: '14px 28px',
                    backgroundColor: '#5865F2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  💾 Save as Template
                </button>
                <button 
                  className="btn btn-primary btn-large" 
                  onClick={handleBroadcast}
                  style={{
                    padding: '14px 32px',
                    backgroundColor: '#FFD700',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#FFA500'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#FFD700'}
                >
                  <FaPaperPlane /> Send Announcement Now
                </button>
              </div>
            </div>
            </div>
          </div>

          {/* Preview Section */}
          <div>
            <div className="card" style={{ 
              backgroundColor: '#2C2F33', 
              padding: '20px', 
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              border: '1px solid #40444b',
              position: 'sticky',
              top: '20px'
            }}>
              <h3 style={{ 
                marginBottom: '20px', 
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: '600',
                borderBottom: '2px solid #40444b',
                paddingBottom: '12px'
              }}>
                Live Preview
              </h3>
              
              {(broadcastData.embedData.title || broadcastData.embedData.description) && (
                <div style={{ 
                  borderLeft: `4px solid ${broadcastData.embedData.color || '#FFD700'}`, 
                  background: '#23272A', 
                  padding: '15px', 
                  borderRadius: '4px'
                }}>
                  {broadcastData.embedData.author.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      {broadcastData.embedData.author.iconURL && (
                        <img src={broadcastData.embedData.author.iconURL} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                      )}
                      <strong style={{ fontSize: '14px', color: '#ffffff' }}>{renderDiscordMarkdown(broadcastData.embedData.author.name)}</strong>
                    </div>
                  )}
                  
                  {broadcastData.embedData.thumbnail && (
                    <img src={broadcastData.embedData.thumbnail} alt="" style={{ width: '80px', float: 'right', borderRadius: '4px', marginLeft: '10px' }} />
                  )}
                  
                  {broadcastData.embedData.title && (
                    <h3 style={{ marginBottom: '10px', color: '#ffffff', fontSize: '16px' }}>
                      {broadcastData.embedData.url ? (
                        <a href={broadcastData.embedData.url} target="_blank" rel="noopener noreferrer" style={{ color: '#00b0f4', textDecoration: 'none' }}>
                          {renderDiscordMarkdown(broadcastData.embedData.title)}
                        </a>
                      ) : renderDiscordMarkdown(broadcastData.embedData.title)}
                    </h3>
                  )}
                  
                  {broadcastData.embedData.description && (
                    <div style={{ color: '#b9bbbe', marginBottom: '10px', fontSize: '14px', lineHeight: '1.5' }}>
                      {renderDiscordMarkdown(broadcastData.embedData.description)}
                    </div>
                  )}
                  
                  {broadcastData.embedData.fields.length > 0 && (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: broadcastData.embedData.fields.some(f => f.inline) ? 'repeat(3, 1fr)' : '1fr', 
                      gap: '10px', 
                      marginTop: '10px' 
                    }}>
                      {broadcastData.embedData.fields.map((field, idx) => (
                        field.name && field.value && (
                          <div key={idx} style={{ gridColumn: field.inline ? 'span 1' : 'span 3' }}>
                            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '5px', color: '#ffffff' }}>
                              {renderDiscordMarkdown(field.name)}
                            </strong>
                            <div style={{ fontSize: '13px', color: '#b9bbbe', lineHeight: '1.4' }}>
                              {renderDiscordMarkdown(field.value)}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {broadcastData.embedData.image && (
                    <img src={broadcastData.embedData.image} alt="" style={{ width: '100%', borderRadius: '4px', marginTop: '15px' }} />
                  )}

                  {(broadcastData.embedData.footer.text || broadcastData.embedData.timestamp) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', fontSize: '12px', color: '#b9bbbe' }}>
                      {broadcastData.embedData.footer.iconURL && (
                        <img src={broadcastData.embedData.footer.iconURL} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                      )}
                      <span>{renderDiscordMarkdown(broadcastData.embedData.footer.text)}</span>
                      {broadcastData.embedData.timestamp && broadcastData.embedData.footer.text && <span> • </span>}
                      {broadcastData.embedData.timestamp && <span>{new Date().toLocaleString()}</span>}
                    </div>
                  )}
                </div>
              )}

              {!broadcastData.embedData.title && !broadcastData.embedData.description && (
                <p style={{ color: '#72767d', textAlign: 'center', padding: '40px 20px', fontSize: '14px' }}>
                  Your embed preview will appear here
                </p>
              )}
            </div>

            {/* Broadcast Templates */}
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#ffffff',
                marginBottom: '15px',
                borderBottom: '2px solid #40444b',
                paddingBottom: '10px'
              }}>
                💾 Saved Broadcast Templates
              </h3>
              <div style={{ display: 'grid', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                {savedTemplates.filter(t => t.type === 'broadcast').length > 0 ? (
                  savedTemplates.filter(t => t.type === 'broadcast').map((template, index) => (
                    <div key={index} style={{
                      backgroundColor: '#23272A',
                      borderRadius: '8px',
                      padding: '12px',
                      border: '1px solid #40444b'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '600',
                            color: '#ffffff',
                            marginBottom: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {template.name}
                          </div>
                          {template.data.embedData?.title && (
                            <div style={{ 
                              color: '#72767d', 
                              fontSize: '12px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {template.data.embedData.title}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                          <button
                            onClick={() => loadTemplate(template)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#5865F2',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            📥
                          </button>
                          <button
                            onClick={() => deleteTemplate(savedTemplates.indexOf(template))}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#ED4245',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#72767d', textAlign: 'center', padding: '20px', fontSize: '13px' }}>
                    No broadcast templates saved
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scheduled' && (
        <div className="scheduled-section">
          <div className="schedule-form card" style={{ 
            backgroundColor: '#2C2F33', 
            padding: '30px', 
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            border: '1px solid #40444b',
            marginBottom: '30px'
          }}>
            <h3 style={{ 
              marginBottom: '24px', 
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: '600',
              borderBottom: '2px solid #40444b',
              paddingBottom: '12px'
            }}>
              Schedule Message
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
              {/* Form Section */}
              <div style={{ display: 'grid', gap: '24px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#ccc', fontSize: '14px' }}>
                    📝 Template Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={scheduleData.templateName}
                    onChange={(e) => setScheduleData({ ...scheduleData, templateName: e.target.value })}
                    placeholder="Enter a name to save this as a template"
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#ccc', fontSize: '14px' }}>
                  📍 Select Channels *
                </label>
                <ChannelMultiSelect
                  selectedChannelIds={scheduleData.channelIds}
                  onChange={(channelIds) => setScheduleData({ ...scheduleData, channelIds })}
                  channels={channels}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#ccc', fontSize: '14px' }}>
                  👥 Mention Roles (Outside Embed)
                </label>
                <MentionSelector
                  selectedMentions={scheduleData.mentions}
                  onChange={(mentions) => setScheduleData({ ...scheduleData, mentions })}
                  roles={roles}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#ccc', fontSize: '14px' }}>
                  📅 Schedule Date & Time (UTC) *
                </label>
                <input
                  type="datetime-local"
                  value={scheduleData.scheduleTime}
                  onChange={(e) => setScheduleData({ ...scheduleData, scheduleTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #3a3a3a',
                    borderRadius: '8px',
                    color: '#ccc',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <small style={{ color: '#72767d', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                  Enter time in UTC timezone. The message will be sent at exactly this time.
                </small>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#ccc', fontSize: '14px' }}>
                  🔄 Repeat Pattern
                </label>
                <select
                  value={scheduleData.repeat}
                  onChange={(e) => setScheduleData({ ...scheduleData, repeat: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #3a3a3a',
                    borderRadius: '8px',
                    color: '#ccc',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  <option value="none">One Time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="embed-builder" style={{ 
                padding: '20px', 
                backgroundColor: '#23272A', 
                borderRadius: '8px',
                border: '1px solid #40444b'
              }}>
                <h4 style={{ 
                  marginBottom: '16px', 
                  color: '#ffffff', 
                  fontSize: '15px',
                  fontWeight: '600'
                }}>
                  📝 Embed Builder *
                </h4>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                      Embed Title
                    </label>
                    <FormattingToolbar 
                      targetRef={scheduleEmbedTitleRef}
                      onInsert={(text, start, end) => {
                        const current = scheduleData.embedData.title;
                        const newTitle = current.substring(0, start) + text + current.substring(end);
                        setScheduleData({
                          ...scheduleData,
                          embedData: { ...scheduleData.embedData, title: newTitle }
                        });
                      }}
                    />
                    <input
                      ref={scheduleEmbedTitleRef}
                      type="text"
                      value={scheduleData.embedData.title}
                      onChange={(e) => setScheduleData({
                        ...scheduleData,
                        embedData: { ...scheduleData.embedData, title: e.target.value }
                      })}
                      placeholder="Leave blank to skip embed"
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #3a3a3a',
                        borderRadius: '6px',
                        color: '#ccc',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                      Embed Description
                    </label>
                    <FormattingToolbar 
                      targetRef={scheduleEmbedDescRef}
                      onInsert={(text, start, end) => {
                        const current = scheduleData.embedData.description;
                        const newDesc = current.substring(0, start) + text + current.substring(end);
                        setScheduleData({
                          ...scheduleData,
                          embedData: { ...scheduleData.embedData, description: newDesc }
                        });
                      }}
                    />
                    <textarea
                      ref={scheduleEmbedDescRef}
                      value={scheduleData.embedData.description}
                      onChange={(e) => setScheduleData({
                        ...scheduleData,
                        embedData: { ...scheduleData.embedData, description: e.target.value }
                      })}
                      placeholder="Embed description..."
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #3a3a3a',
                        borderRadius: '6px',
                        color: '#ccc',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        lineHeight: '1.5',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                      Embed Color (Click to Pick)
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={scheduleData.embedData.color?.length === 7 ? scheduleData.embedData.color : '#FFD700'}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          embedData: { ...scheduleData.embedData, color: e.target.value }
                        })}
                        style={{
                          width: '60px',
                          height: '48px',
                          cursor: 'pointer',
                          border: '2px solid #40444b',
                          borderRadius: '8px',
                          backgroundColor: 'transparent'
                        }}
                        title="Click to open color picker"
                      />
                      <input
                        type="text"
                        value={scheduleData.embedData.color}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          embedData: { ...scheduleData.embedData, color: e.target.value }
                        })}
                        placeholder="#FFD700"
                        maxLength={7}
                        style={{
                          flex: 1,
                          padding: '12px',
                          backgroundColor: '#2a2a2a',
                          border: '1px solid #3a3a3a',
                          borderRadius: '6px',
                          color: '#ccc',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                      URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={scheduleData.embedData.url}
                      onChange={(e) => setScheduleData({
                        ...scheduleData,
                        embedData: { ...scheduleData.embedData, url: e.target.value }
                      })}
                      placeholder="https://..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #3a3a3a',
                        borderRadius: '6px',
                        color: '#ccc',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                        Thumbnail URL
                      </label>
                      <input
                        type="url"
                        value={scheduleData.embedData.thumbnail}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          embedData: { ...scheduleData.embedData, thumbnail: e.target.value }
                        })}
                        placeholder="https://..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#2a2a2a',
                          border: '1px solid #3a3a3a',
                          borderRadius: '6px',
                          color: '#ccc',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={scheduleData.embedData.image}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          embedData: { ...scheduleData.embedData, image: e.target.value }
                        })}
                        placeholder="https://..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#2a2a2a',
                          border: '1px solid #3a3a3a',
                          borderRadius: '6px',
                          color: '#ccc',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                        Author Name
                      </label>
                      <FormattingToolbar 
                        targetRef={scheduleAuthorRef}
                        onInsert={(text, start, end) => {
                          const current = scheduleData.embedData.author.name;
                          const newName = current.substring(0, start) + text + current.substring(end);
                          setScheduleData({
                            ...scheduleData,
                            embedData: { ...scheduleData.embedData, author: { ...scheduleData.embedData.author, name: newName } }
                          });
                        }}
                      />
                      <input
                        ref={scheduleAuthorRef}
                        type="text"
                        value={scheduleData.embedData.author.name}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          embedData: { ...scheduleData.embedData, author: { ...scheduleData.embedData.author, name: e.target.value } }
                        })}
                        placeholder="Author name..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#2a2a2a',
                          border: '1px solid #3a3a3a',
                          borderRadius: '6px',
                          color: '#ccc',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                        Author Icon URL
                      </label>
                      <input
                        type="url"
                        value={scheduleData.embedData.author.iconURL}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          embedData: { ...scheduleData.embedData, author: { ...scheduleData.embedData.author, iconURL: e.target.value } }
                        })}
                        placeholder="https://..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#2a2a2a',
                          border: '1px solid #3a3a3a',
                          borderRadius: '6px',
                          color: '#ccc',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                        Footer Text
                      </label>
                      <FormattingToolbar 
                        targetRef={scheduleFooterRef}
                        onInsert={(text, start, end) => {
                          const current = scheduleData.embedData.footer.text;
                          const newText = current.substring(0, start) + text + current.substring(end);
                          setScheduleData({
                            ...scheduleData,
                            embedData: { ...scheduleData.embedData, footer: { ...scheduleData.embedData.footer, text: newText } }
                          });
                        }}
                      />
                      <input
                        ref={scheduleFooterRef}
                        type="text"
                        value={scheduleData.embedData.footer.text}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          embedData: { ...scheduleData.embedData, footer: { ...scheduleData.embedData.footer, text: e.target.value } }
                        })}
                        placeholder="Footer text..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#2a2a2a',
                          border: '1px solid #3a3a3a',
                          borderRadius: '6px',
                          color: '#ccc',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#ccc', fontSize: '13px' }}>
                        Footer Icon URL
                      </label>
                      <input
                        type="url"
                        value={scheduleData.embedData.footer.iconURL}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          embedData: { ...scheduleData.embedData, footer: { ...scheduleData.embedData.footer, iconURL: e.target.value } }
                        })}
                        placeholder="https://..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#2a2a2a',
                          border: '1px solid #3a3a3a',
                          borderRadius: '6px',
                          color: '#ccc',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={scheduleData.embedData.timestamp}
                        onChange={(e) => setScheduleData({
                          ...scheduleData,
                          embedData: { ...scheduleData.embedData, timestamp: e.target.checked }
                        })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ color: '#ccc', fontSize: '13px', fontWeight: '500' }}>
                        Add Timestamp
                      </span>
                    </label>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ fontWeight: '500', color: '#ccc', fontSize: '13px', margin: 0 }}>
                        Fields
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newFields = [...scheduleData.embedData.fields, { name: '', value: '', inline: false }];
                          setScheduleData({
                            ...scheduleData,
                            embedData: { ...scheduleData.embedData, fields: newFields }
                          });
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#FFD700',
                          color: '#000',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        + Add Field
                      </button>
                    </div>
                    {scheduleData.embedData.fields.map((field, index) => (
                      <div key={index} style={{
                        padding: '12px',
                        backgroundColor: '#2C2F33',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        border: '1px solid #40444b'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ color: '#ccc', fontSize: '12px', fontWeight: '600' }}>Field {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newFields = scheduleData.embedData.fields.filter((_, i) => i !== index);
                              setScheduleData({
                                ...scheduleData,
                                embedData: { ...scheduleData.embedData, fields: newFields }
                              });
                            }}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#ed4245',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => {
                            const newFields = [...scheduleData.embedData.fields];
                            newFields[index].name = e.target.value;
                            setScheduleData({
                              ...scheduleData,
                              embedData: { ...scheduleData.embedData, fields: newFields }
                            });
                          }}
                          placeholder="Field name..."
                          style={{
                            width: '100%',
                            padding: '8px',
                            marginBottom: '6px',
                            backgroundColor: '#2a2a2a',
                            border: '1px solid #3a3a3a',
                            borderRadius: '4px',
                            color: '#ccc',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                        />
                        <textarea
                          value={field.value}
                          onChange={(e) => {
                            const newFields = [...scheduleData.embedData.fields];
                            newFields[index].value = e.target.value;
                            setScheduleData({
                              ...scheduleData,
                              embedData: { ...scheduleData.embedData, fields: newFields }
                            });
                          }}
                          placeholder="Field value..."
                          rows="2"
                          style={{
                            width: '100%',
                            padding: '8px',
                            marginBottom: '6px',
                            backgroundColor: '#2a2a2a',
                            border: '1px solid #3a3a3a',
                            borderRadius: '4px',
                            color: '#ccc',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            boxSizing: 'border-box'
                          }}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={field.inline}
                            onChange={(e) => {
                              const newFields = [...scheduleData.embedData.fields];
                              newFields[index].inline = e.target.checked;
                              setScheduleData({
                                ...scheduleData,
                                embedData: { ...scheduleData.embedData, fields: newFields }
                              });
                            }}
                            style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                          />
                          <span style={{ color: '#b9bbbe', fontSize: '12px' }}>Inline</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </div>

              {/* Live Preview Section */}
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#23272A', 
                borderRadius: '8px',
                border: '1px solid #40444b',
                position: 'sticky',
                top: '20px',
                alignSelf: 'start',
                maxHeight: 'calc(100vh - 40px)',
                overflowY: 'auto'
              }}>
                <h4 style={{ 
                  marginBottom: '16px', 
                  color: '#ffffff', 
                  fontSize: '15px',
                  fontWeight: '600'
                }}>
                  👁️ Live Preview
                </h4>
                
                {scheduleData.mentions.length > 0 && (
                  <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {scheduleData.mentions.map((roleId) => {
                      const role = roles.find(r => r.id === roleId);
                      return role ? (
                        <span
                          key={roleId}
                          style={{
                            backgroundColor: `${role.color}20`,
                            color: role.color || '#99aab5',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: '500',
                            border: `1px solid ${role.color}40`
                          }}
                        >
                          @{role.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                <div style={{ 
                  borderLeft: `4px solid ${scheduleData.embedData.color}`, 
                  background: '#2C2F33', 
                  padding: '15px', 
                  borderRadius: '4px'
                }}>
                  {scheduleData.embedData.author.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      {scheduleData.embedData.author.iconURL && (
                        <img 
                          src={scheduleData.embedData.author.iconURL} 
                          alt="" 
                          style={{ width: '24px', height: '24px', borderRadius: '50%' }} 
                        />
                      )}
                      <strong style={{ fontSize: '14px', color: '#ffffff' }}>
                        {renderDiscordMarkdown(scheduleData.embedData.author.name)}
                      </strong>
                    </div>
                  )}
                  
                  {scheduleData.embedData.title && (
                    <h3 style={{ marginBottom: '10px', color: '#ffffff', fontSize: '16px' }}>
                      {scheduleData.embedData.url ? (
                        <a href={scheduleData.embedData.url} target="_blank" rel="noopener noreferrer" style={{ color: '#00b0f4', textDecoration: 'none' }}>
                          {renderDiscordMarkdown(scheduleData.embedData.title)}
                        </a>
                      ) : renderDiscordMarkdown(scheduleData.embedData.title)}
                    </h3>
                  )}
                  
                  {scheduleData.embedData.description && (
                    <div style={{ color: '#b9bbbe', marginBottom: '10px', fontSize: '14px', lineHeight: '1.5' }}>
                      {renderDiscordMarkdown(scheduleData.embedData.description)}
                    </div>
                  )}
                  
                  {scheduleData.embedData.fields.length > 0 && (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: scheduleData.embedData.fields.some(f => f.inline) ? 'repeat(3, 1fr)' : '1fr', 
                      gap: '10px', 
                      marginTop: '10px' 
                    }}>
                      {scheduleData.embedData.fields.map((field, idx) => 
                        field.name && field.value && (
                          <div key={idx} style={{ gridColumn: field.inline ? 'span 1' : 'span 3' }}>
                            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '5px', color: '#ffffff' }}>
                              {renderDiscordMarkdown(field.name)}
                            </strong>
                            <div style={{ fontSize: '13px', color: '#b9bbbe', lineHeight: '1.4' }}>
                              {renderDiscordMarkdown(field.value)}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {scheduleData.embedData.thumbnail && (
                    <img 
                      src={scheduleData.embedData.thumbnail} 
                      alt="" 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', float: 'right', marginLeft: '10px' }} 
                    />
                  )}

                  {scheduleData.embedData.image && (
                    <img 
                      src={scheduleData.embedData.image} 
                      alt="" 
                      style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '4px', marginTop: '15px', clear: 'both' }} 
                    />
                  )}

                  {scheduleData.embedData.footer.text && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      marginTop: '15px', 
                      paddingTop: '10px',
                      borderTop: '1px solid #40444b',
                      fontSize: '12px', 
                      color: '#b9bbbe' 
                    }}>
                      {scheduleData.embedData.footer.iconURL && (
                        <img 
                          src={scheduleData.embedData.footer.iconURL} 
                          alt="" 
                          style={{ width: '20px', height: '20px', borderRadius: '50%' }} 
                        />
                      )}
                      <span>{renderDiscordMarkdown(scheduleData.embedData.footer.text)}</span>
                      {scheduleData.embedData.timestamp && (
                        <span> • {new Date().toLocaleString()}</span>
                      )}
                    </div>
                  )}
                </div>

                {!scheduleData.embedData.title && !scheduleData.embedData.description && (
                  <p style={{ textAlign: 'center', color: '#72767d', fontSize: '14px', padding: '20px' }}>
                    Start building your embed to see a preview...
                  </p>
                )}

                {/* Scheduled Templates */}
                <div style={{ marginTop: '30px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#ffffff',
                    marginBottom: '15px',
                    borderBottom: '2px solid #40444b',
                    paddingBottom: '10px'
                  }}>
                    💾 Saved Schedule Templates
                  </h3>
                  <div style={{ display: 'grid', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                    {savedTemplates.filter(t => t.type === 'schedule').length > 0 ? (
                      savedTemplates.filter(t => t.type === 'schedule').map((template, index) => (
                        <div key={index} style={{
                          backgroundColor: '#23272A',
                          borderRadius: '8px',
                          padding: '12px',
                          border: '1px solid #40444b'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ 
                                fontSize: '14px', 
                                fontWeight: '600',
                                color: '#ffffff',
                                marginBottom: '4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {template.name}
                              </div>
                              {template.data.embedData?.title && (
                                <div style={{ 
                                  color: '#72767d', 
                                  fontSize: '12px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {template.data.embedData.title}
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                              <button
                                onClick={() => loadTemplate(template)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#5865F2',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}
                              >
                                📥
                              </button>
                              <button
                                onClick={() => deleteTemplate(savedTemplates.indexOf(template))}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#ED4245',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: '#72767d', textAlign: 'center', padding: '20px', fontSize: '13px' }}>
                        No schedule templates saved
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button 
                className="btn btn-success btn-large" 
                onClick={handleSchedule}
                style={{
                  padding: '14px 32px',
                  backgroundColor: '#FFD700',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaCalendarAlt /> Schedule Message
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => saveTemplate(scheduleData, 'schedule')}
                disabled={!scheduleData.templateName}
                style={{
                  padding: '14px 20px',
                  backgroundColor: scheduleData.templateName ? '#4a4a4a' : '#2a2a2a',
                  color: scheduleData.templateName ? '#fff' : '#666',
                  border: '1px solid #555',
                  borderRadius: '8px',
                  cursor: scheduleData.templateName ? 'pointer' : 'not-allowed',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                💾 Save as Template
              </button>
            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#ffffff',
              marginBottom: '20px',
              borderBottom: '2px solid #40444b',
              paddingBottom: '12px'
            }}>
              📋 Scheduled Messages
            </h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#72767d' }}>
                Loading scheduled messages...
              </div>
            ) : scheduledMessages.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                backgroundColor: '#2C2F33',
                borderRadius: '12px',
                border: '2px dashed #40444b'
              }}>
                <FaClock size={48} style={{ color: '#72767d', marginBottom: '16px' }} />
                <p style={{ color: '#72767d', fontSize: '16px', margin: 0 }}>No scheduled messages</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {scheduledMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    style={{ 
                      backgroundColor: '#2C2F33',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #40444b',
                      transition: 'all 0.2s',
                      ':hover': { borderColor: '#FFD700' }
                    }}
                  >
                    {/* Header with time and status */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '16px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid #40444b'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <FaClock style={{ color: '#FFD700' }} />
                          <h4 style={{ 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            color: '#ffffff',
                            margin: 0
                          }}>
                            {new Date(msg.scheduleTime || msg.scheduledFor).toLocaleString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </h4>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ 
                            backgroundColor: getStatusColor(msg.status),
                            color: '#ffffff',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            {msg.status}
                          </span>
                          {msg.repeat !== 'none' && (
                            <span style={{
                              backgroundColor: '#2a2a2a',
                              color: '#ccc',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              🔄 {msg.repeat}
                            </span>
                          )}
                        </div>
                      </div>
                      {msg.status === 'scheduled' && (
                        <button 
                          onClick={() => handleCancel(msg.id)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#ed4245',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginBottom: '12px'
                      }}>
                        <span style={{ color: '#b9bbbe', fontSize: '13px', fontWeight: '600' }}>📍 Channels:</span>
                        {(msg.channelIds || [msg.channelId]).map(id => {
                          const channel = channels.find(c => c.id === id);
                          return (
                            <span
                              key={id}
                              style={{
                                backgroundColor: '#2a2a2a',
                                color: '#ccc',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}
                            >
                              #{channel ? channel.name : id}
                            </span>
                          );
                        })}
                      </div>
                      {msg.mentions && msg.mentions.length > 0 && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px'
                        }}>
                          <span style={{ color: '#b9bbbe', fontSize: '13px', fontWeight: '600' }}>👥 Mentions:</span>
                          <span style={{
                            backgroundColor: '#FFD70020',
                            color: '#FFD700',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {msg.mentions.length} role(s)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Embed Preview */}
                    {msg.embedData && (msg.embedData.title || msg.embedData.description) && (
                      <div style={{ 
                        marginTop: '16px',
                        padding: '14px', 
                        borderLeft: `4px solid ${msg.embedData.color || '#FFD700'}`,
                        backgroundColor: '#23272A',
                        borderRadius: '6px'
                      }}>
                        {msg.embedData.title && (
                          <div style={{ 
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#ffffff',
                            marginBottom: msg.embedData.description ? '8px' : 0
                          }}>
                            {msg.embedData.title}
                          </div>
                        )}
                        {msg.embedData.description && (
                          <div style={{ 
                            color: '#b9bbbe', 
                            fontSize: '13px',
                            lineHeight: '1.5'
                          }}>
                            {msg.embedData.description.substring(0, 150)}
                            {msg.embedData.description.length > 150 ? '...' : ''}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer info */}
                    {(msg.sentAt || msg.error) && (
                      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #40444b' }}>
                        {msg.sentAt && (
                          <p style={{ 
                            color: '#72767d', 
                            fontSize: '12px',
                            margin: 0,
                            marginBottom: msg.error ? '8px' : 0
                          }}>
                            ✅ Sent: {new Date(msg.sentAt).toLocaleString()}
                          </p>
                        )}
                        {msg.error && (
                          <p style={{ 
                            color: '#ed4245', 
                            fontSize: '12px',
                            margin: 0,
                            padding: '8px 12px',
                            backgroundColor: '#ed424520',
                            borderRadius: '6px'
                          }}>
                            ❌ Error: {msg.error}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Cancel Scheduled Message"
        message="Are you sure you want to cancel this scheduled message? This action cannot be undone."
        onConfirm={confirmCancel}
        onCancel={() => setConfirmDialog({ isOpen: false, messageId: null })}
      />
    </div>
  );
}

export default Announcements;
