import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaCog, FaSave, FaDiscord, FaSearch } from 'react-icons/fa';
import { config as configApi, auth } from '../services/api';

// Role Selector Component
function RoleSelector({ roleKey, label, selectedRoleIds, discordRoles, updateConfig }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  
  const selectedRoles = discordRoles.filter(role => selectedRoleIds.includes(role.id));
  const availableRoles = discordRoles.filter(role => 
    !selectedRoleIds.includes(role.id) && 
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addRole = (roleId) => {
    const newRoles = [...selectedRoleIds, roleId];
    updateConfig(`staffRoles.${roleKey}`, newRoles);
    setSearchTerm('');
    setShowDropdown(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const removeRole = (roleId) => {
    const newRoles = selectedRoleIds.filter(id => id !== roleId);
    updateConfig(`staffRoles.${roleKey}`, newRoles);
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      
      {/* Selected Roles Display */}
      <div style={{ 
        background: '#2C2F33', 
        border: '1px solid #40444b', 
        borderRadius: '4px', 
        padding: '8px',
        minHeight: '48px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        {selectedRoles.map(role => (
          <div
            key={role.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              background: '#5865F2',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '13px'
            }}
          >
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: role.color || '#99aab5'
            }} />
            <span>{role.name}</span>
            <button
              onClick={() => removeRole(role.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: '0 2px',
                fontSize: '16px',
                lineHeight: '1',
                marginLeft: '2px'
              }}
            >
              ×
            </button>
          </div>
        ))}
        {selectedRoles.length === 0 && (
          <span style={{ color: '#72767d', fontSize: '14px' }}>No roles selected</span>
        )}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Type to search roles..."
          style={{
            width: '100%',
            padding: '10px',
            background: '#202225',
            border: '1px solid #40444b',
            borderRadius: '4px',
            color: '#dcddde',
            fontSize: '14px'
          }}
        />
        
        {/* Dropdown */}
        {showDropdown && searchTerm && availableRoles.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: '#2C2F33',
            border: '1px solid #40444b',
            borderRadius: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}>
            {availableRoles.slice(0, 10).map(role => (
              <div
                key={role.id}
                onClick={() => addRole(role.id)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: '1px solid #40444b'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#36393f'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: role.color || '#99aab5'
                }} />
                <span style={{ color: '#dcddde', fontSize: '14px' }}>{role.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <small style={{ color: '#b9bbbe', display: 'block', marginTop: '8px' }}>
        {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
      </small>
    </div>
  );
}

// Searchable Select Component
function SearchableSelect({ value, onChange, options, placeholder = "Select..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.id === value);

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
          color: selectedOption ? '#dcddde' : '#72767d'
        }}
      >
        <span>{selectedOption ? `#${selectedOption.name}` : placeholder}</span>
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
          overflow: 'hidden',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
          <div style={{ padding: '10px', borderBottom: '1px solid #40444b' }}>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#72767d' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search channels..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px 8px 8px 35px',
                  background: '#202225',
                  border: '1px solid #40444b',
                  borderRadius: '4px',
                  color: '#dcddde',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <div
              onClick={() => {
                onChange('');
                setIsOpen(false);
                setSearchTerm('');
              }}
              style={{
                padding: '10px',
                cursor: 'pointer',
                background: !value ? '#5865F2' : 'transparent',
                color: '#dcddde',
                borderBottom: '1px solid #40444b'
              }}
              onMouseEnter={(e) => !value && (e.target.style.background = '#4752C4')}
              onMouseLeave={(e) => !value && (e.target.style.background = '#5865F2')}
            >
              {placeholder}
            </div>
            {filteredOptions.map(option => (
              <div
                key={option.id}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  background: value === option.id ? '#5865F2' : 'transparent',
                  color: '#dcddde',
                  borderBottom: '1px solid #40444b'
                }}
                onMouseEnter={(e) => {
                  if (value !== option.id) e.target.style.background = '#36393f';
                }}
                onMouseLeave={(e) => {
                  if (value !== option.id) e.target.style.background = 'transparent';
                }}
              >
                #{option.name}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div style={{ padding: '10px', color: '#72767d', textAlign: 'center' }}>
                No channels found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Settings() {
  const [config, setConfig] = useState(null);
  const [generalSettings, setGeneralSettings] = useState(null);
  const [discordRoles, setDiscordRoles] = useState([]);
  const [discordChannels, setDiscordChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Password change states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchGeneralSettings();
    fetchDiscordData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await configApi.get();
      setConfig(response.data);
    } catch (error) {
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const fetchGeneralSettings = async () => {
    try {
      const response = await configApi.getGeneralSettings();
      setGeneralSettings(response.data);
    } catch (error) {
      console.error('Failed to load general settings');
      setGeneralSettings({ 
        eventReminderChannelId: null,
        eventReminderRoleIds: []
      });
    }
  };

  const fetchDiscordData = async () => {
    try {
      const [rolesRes, channelsRes] = await Promise.all([
        configApi.getDiscordRoles(),
        configApi.getDiscordChannels()
      ]);
      setDiscordRoles(rolesRes.data);
      setDiscordChannels(channelsRes.data);
    } catch (error) {
      console.error('Failed to load Discord data');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        configApi.update(config),
        generalSettings && configApi.updateGeneralSettings(generalSettings)
      ]);
      toast.success('Configuration saved successfully! Bot will use new settings.');
    } catch (error) {
      console.error('Settings save error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save configuration';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await auth.changePassword(currentPassword, newPassword);

      if (response.data.success) {
        toast.success('Password change initiated successfully!');
        toast.info(`Update .env file with: ADMIN_PASSWORD=${response.data.newPassword}`, { autoClose: 10000 });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);
      }
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  const updateConfig = (path, value) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-title">
        <h1><FaCog /> Bot Configuration</h1>
        <button onClick={handleSave} className="btn" disabled={saving}>
          <FaSave /> {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Password Change Section */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px', color: '#FFD700' }}>
          Change Admin Password
        </h3>
        
        {!showPasswordSection ? (
          <button 
            onClick={() => setShowPasswordSection(true)}
            className="btn"
            style={{ background: '#5865F2' }}
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter current password"
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Confirm new password"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button 
                type="submit" 
                className="btn"
                disabled={changingPassword}
                style={{ background: '#43b581' }}
              >
                {changingPassword ? 'Changing...' : 'Update Password'}
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowPasswordSection(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="btn"
                style={{ background: '#f04747' }}
              >
                Cancel
              </button>
            </div>

            <div style={{ marginTop: '15px', padding: '10px', background: '#2C2F33', borderRadius: '4px', fontSize: '13px', color: '#dcddde' }}>
              <strong>Note:</strong> After changing the password, you'll need to update the <code>ADMIN_PASSWORD</code> in your server's <code>.env</code> file and restart the backend for the change to take effect.
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <p style={{ marginBottom: '25px', color: '#888', fontSize: '15px' }}>
          <FaDiscord style={{ marginRight: '8px', color: '#FFD700' }} /> 
          Configure bot settings that sync across dashboard and Discord bot. Changes take effect immediately.
        </p>

        {/* Channels Configuration */}
        <div style={{ marginBottom: '35px' }}>
          <h2 style={{ color: '#FFD700', marginBottom: '20px', fontSize: '20px', fontWeight: '700' }}>
            📺 Channel Configuration
          </h2>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label>Log Channel</label>
              <SearchableSelect
                value={config?.channels?.logChannel || ''}
                onChange={(value) => updateConfig('channels.logChannel', value)}
                options={discordChannels}
                placeholder="Select Channel"
              />
            </div>

            <div className="form-group">
              <label>Transcript Channel</label>
              <SearchableSelect
                value={config?.channels?.transcriptChannel || ''}
                onChange={(value) => updateConfig('channels.transcriptChannel', value)}
                options={discordChannels}
                placeholder="Select Channel"
              />
            </div>

            <div className="form-group">
              <label>Welcome Channel</label>
              <SearchableSelect
                value={config?.channels?.welcomeChannel || ''}
                onChange={(value) => updateConfig('channels.welcomeChannel', value)}
                options={discordChannels}
                placeholder="Select Channel"
              />
            </div>

            <div className="form-group">
              <label>Staff Changes Channel</label>
              <SearchableSelect
                value={config?.channels?.staffChangesChannel || ''}
                onChange={(value) => updateConfig('channels.staffChangesChannel', value)}
                options={discordChannels}
                placeholder="Select Channel"
              />
            </div>
          </div>
        </div>

        {/* Ticket Categories */}
        <div style={{ marginBottom: '30px' }}>
          <h2>🎫 Ticket Categories</h2>
          <p style={{ fontSize: '14px', color: '#b9bbbe', marginBottom: '15px' }}>
            Select Discord channels for different ticket types
          </p>
          <div className="form-grid">
            {config?.ticketCategories && Object.keys(config.ticketCategories).map(key => (
              <div key={key} className="form-group">
                <label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                <SearchableSelect
                  value={config.ticketCategories[key]}
                  onChange={(value) => updateConfig(`ticketCategories.${key}`, value)}
                  options={discordChannels}
                  placeholder="Select Channel"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Event Reminder Settings */}
        <div style={{ marginBottom: '30px' }}>
          <h2>🔔 Event Reminder Settings</h2>
          <p style={{ fontSize: '14px', color: '#b9bbbe', marginBottom: '15px' }}>
            Configure where automatic event reminders are sent (2 hours before calendar events)
          </p>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Event Reminder Channel *</label>
            {generalSettings && (
              <SearchableSelect
                value={generalSettings.eventReminderChannelId}
                onChange={(value) => setGeneralSettings({...generalSettings, eventReminderChannelId: value})}
                options={discordChannels}
                placeholder="Select channel for event reminders"
              />
            )}
            <small style={{ color: '#72767d', marginTop: '8px', display: 'block' }}>
              This channel will receive automatic reminder notifications 2 hours before events.
            </small>
          </div>
          
          <div className="form-group">
            <label>Roles to Tag (Optional)</label>
            {generalSettings && (
              <RoleSelector
                roleKey="eventReminder"
                label=""
                selectedRoleIds={generalSettings.eventReminderRoleIds || []}
                discordRoles={discordRoles}
                updateConfig={(path, value) => setGeneralSettings({...generalSettings, eventReminderRoleIds: value})}
              />
            )}
            <small style={{ color: '#72767d', marginTop: '8px', display: 'block' }}>
              These roles will be mentioned in reminder notifications to alert members.
            </small>
          </div>
        </div>

        {/* Staff Roles */}
        <div style={{ marginBottom: '30px' }}>
          <h2>👥 Staff Roles</h2>
          <p style={{ fontSize: '14px', color: '#b9bbbe', marginBottom: '15px' }}>
            Configure which Discord roles can manage different ticket types
          </p>
          <div className="form-grid">
            {config?.staffRoles && Object.keys(config.staffRoles).map(key => (
              <RoleSelector
                key={key}
                roleKey={key}
                label={`${key.charAt(0).toUpperCase() + key.slice(1)} Staff`}
                selectedRoleIds={config.staffRoles[key] || []}
                discordRoles={discordRoles}
                updateConfig={updateConfig}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
        <button onClick={() => { fetchConfig(); fetchGeneralSettings(); }} className="btn">
          Reset Changes
        </button>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
          <FaSave /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}

export default Settings;
