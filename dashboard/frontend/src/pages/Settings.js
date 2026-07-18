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
      {label && <label className="form-label">{label}</label>}
      
      {/* Selected Roles Display */}
      <div style={{ 
        background: 'var(--bg-tertiary)', 
        border: '1px solid var(--border-secondary)', 
        borderRadius: '10px', 
        padding: '10px',
        minHeight: '48px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        {selectedRoles.map(role => (
          <div
            key={role.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'var(--primary-subtle)',
              border: '1px solid var(--primary-border)',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: role.color && role.color !== '#000000' ? role.color : 'var(--primary)'
            }} />
            <span>{role.name}</span>
            <button
              onClick={() => removeRole(role.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0 2px',
                fontSize: '16px',
                lineHeight: '1',
                marginLeft: '4px',
                transition: 'color var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--danger)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              ×
            </button>
          </div>
        ))}
        {selectedRoles.length === 0 && (
          <span style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>No roles selected</span>
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
          placeholder="Type to search and add server roles..."
          className="form-input"
        />
        
        {/* Dropdown */}
        {showDropdown && searchTerm && availableRoles.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '6px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-secondary)',
            borderRadius: '10px',
            maxHeight: '220px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: 'var(--shadow-lg)'
          }}>
            {availableRoles.slice(0, 10).map(role => (
              <div
                key={role.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addRole(role.id);
                }}
                style={{
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  borderBottom: '1px solid var(--border-secondary)',
                  transition: 'background var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: role.color && role.color !== '#000000' ? role.color : 'var(--primary)'
                }} />
                <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>{role.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <small style={{ color: 'var(--text-tertiary)', display: 'block', marginTop: '6px', fontSize: '12px' }}>
        {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} assigned
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
          padding: '12px 16px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-secondary)',
          borderRadius: '10px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-tertiary)',
          fontSize: '14px',
          fontWeight: selectedOption ? '500' : '400'
        }}
      >
        <span>{selectedOption ? `# ${selectedOption.name}` : placeholder}</span>
        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>▼</span>
      </div>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '6px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-secondary)',
          borderRadius: '12px',
          maxHeight: '300px',
          overflow: 'hidden',
          zIndex: 1000,
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ padding: '10px', borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-tertiary)' }}>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search channels..."
                autoFocus
                className="form-input"
                style={{
                  paddingLeft: '38px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>
          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            <div
              onClick={() => {
                onChange('');
                setIsOpen(false);
                setSearchTerm('');
              }}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                background: !value ? 'var(--primary-subtle)' : 'transparent',
                color: !value ? '#FFFFFF' : 'var(--text-secondary)',
                borderBottom: '1px solid var(--border-secondary)',
                fontSize: '13px'
              }}
            >
              {placeholder} (Clear Selection)
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
                  padding: '10px 16px',
                  cursor: 'pointer',
                  background: value === option.id ? 'var(--primary)' : 'transparent',
                  color: value === option.id ? '#FFFFFF' : 'var(--text-primary)',
                  borderBottom: '1px solid var(--border-secondary)',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  if (value !== option.id) e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  if (value !== option.id) e.currentTarget.style.background = 'transparent';
                }}
              >
                # {option.name}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div style={{ padding: '16px', color: 'var(--text-tertiary)', textAlign: 'center', fontSize: '13px' }}>
                No channels matching search
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
      toast.error('Failed to load bot configuration');
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
        weeklyAnnouncementChannelId: null,
        eventReminderRoleIds: [],
        weeklyAnnouncementRoleIds: []
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
      toast.success('Configuration saved successfully! Bot synced immediately.');
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
        toast.success('Password changed successfully! You can now use your new credentials.');
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
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Loading system settings and channels...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-title">
        <div>
          <div className="page-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '11px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>
            RealOps Portal / System
          </div>
          <h1>
            <FaCog /> System & Bot Configuration
          </h1>
        </div>
        <button onClick={handleSave} className="btn" disabled={saving}>
          <FaSave /> {saving ? 'Saving Changes...' : 'Save Configuration'}
        </button>
      </div>

      {/* Password Change Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2>Change Admin Credentials</h2>
        </div>
        
        {!showPasswordSection ? (
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
              Update your administrative account password used to access this dashboard.
            </p>
            <button 
              onClick={() => setShowPasswordSection(true)}
              className="btn btn-secondary"
            >
              Update Password
            </button>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} style={{ maxWidth: '480px' }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter current password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Confirm new password"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={changingPassword}
              >
                {changingPassword ? 'Updating...' : 'Save New Password'}
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowPasswordSection(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2><FaDiscord /> Bot Integration Settings</h2>
        </div>
        <p style={{ marginBottom: '28px', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Configure live Discord channels and role assignments that sync directly across your bot and dashboard services.
        </p>

        {/* Channels Configuration */}
        <div style={{ marginBottom: '36px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '17px', fontWeight: '700' }}>
            Channel Routing
          </h3>
          <div className="grid grid-2" style={{ gap: '20px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">System Log Channel</label>
              <SearchableSelect
                value={config?.channels?.logChannel || ''}
                onChange={(value) => updateConfig('channels.logChannel', value)}
                options={discordChannels}
                placeholder="Select System Log Channel"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Transcript Archive Channel</label>
              <SearchableSelect
                value={config?.channels?.transcriptChannel || ''}
                onChange={(value) => updateConfig('channels.transcriptChannel', value)}
                options={discordChannels}
                placeholder="Select Transcript Channel"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Welcome & Greeting Channel</label>
              <SearchableSelect
                value={config?.channels?.welcomeChannel || ''}
                onChange={(value) => updateConfig('channels.welcomeChannel', value)}
                options={discordChannels}
                placeholder="Select Welcome Channel"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Staff Roster Changes Channel</label>
              <SearchableSelect
                value={config?.channels?.staffChangesChannel || ''}
                onChange={(value) => updateConfig('channels.staffChangesChannel', value)}
                options={discordChannels}
                placeholder="Select Staff Changes Channel"
              />
            </div>
          </div>
        </div>

        {/* Ticket Categories */}
        <div style={{ marginBottom: '36px', paddingTop: '24px', borderTop: '1px solid var(--border-secondary)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '17px', fontWeight: '700' }}>
            Ticket Category Channels
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Assign specific destination categories or channels for opened support tickets
          </p>
          <div className="grid grid-2" style={{ gap: '20px' }}>
            {config?.ticketCategories && Object.keys(config.ticketCategories).map(key => (
              <div key={key} className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                <SearchableSelect
                  value={config.ticketCategories[key]}
                  onChange={(value) => updateConfig(`ticketCategories.${key}`, value)}
                  options={discordChannels}
                  placeholder="Select Destination Category/Channel"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Event Reminder Settings */}
        <div style={{ marginBottom: '36px', paddingTop: '24px', borderTop: '1px solid var(--border-secondary)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '17px', fontWeight: '700' }}>
            Event Reminder Automation
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Configure where automatic event reminders are dispatched (2 hours before scheduled calendar events)
          </p>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Event Reminder Notification Channel</label>
            {generalSettings && (
              <SearchableSelect
                value={generalSettings.eventReminderChannelId}
                onChange={(value) => setGeneralSettings(prev => ({...prev, eventReminderChannelId: value}))}
                options={discordChannels}
                placeholder="Select channel for automated event reminders"
              />
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Weekly Announcement Channel</label>
            {generalSettings && (
              <SearchableSelect
                value={generalSettings.weeklyAnnouncementChannelId}
                onChange={(value) => setGeneralSettings(prev => ({...prev, weeklyAnnouncementChannelId: value}))}
                options={discordChannels}
                placeholder="Select channel for weekly calendar announcements"
              />
            )}
          </div>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Roles to Tag in Reminder Alerts</label>
            {generalSettings && (
              <RoleSelector
                roleKey="eventReminder"
                label=""
                selectedRoleIds={generalSettings.eventReminderRoleIds || []}
                discordRoles={discordRoles}
                updateConfig={(path, value) => setGeneralSettings(prev => ({...prev, eventReminderRoleIds: value}))}
              />
            )}
          </div>
          
          <div className="form-group" style={{ margin: 0, marginTop: '20px' }}>
            <label className="form-label">Roles to Tag in Weekly Announcements</label>
            {generalSettings && (
              <RoleSelector
                roleKey="weeklyAnnouncement"
                label=""
                selectedRoleIds={generalSettings.weeklyAnnouncementRoleIds || []}
                discordRoles={discordRoles}
                updateConfig={(path, value) => setGeneralSettings(prev => ({...prev, weeklyAnnouncementRoleIds: value}))}
              />
            )}
          </div>
        </div>

        {/* Staff Roles */}
        <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border-secondary)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '17px', fontWeight: '700' }}>
            Ticket Management Staff Roles
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Assign Discord roles permitted to view, claim, and close specific ticket departments
          </p>
          <div className="grid grid-2" style={{ gap: '24px' }}>
            {config?.staffRoles && Object.keys(config.staffRoles).map(key => (
              <RoleSelector
                key={key}
                roleKey={key}
                label={`${key.charAt(0).toUpperCase() + key.slice(1)} Department Staff Roles`}
                selectedRoleIds={config.staffRoles[key] || []}
                discordRoles={discordRoles}
                updateConfig={updateConfig}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <button onClick={() => { fetchConfig(); fetchGeneralSettings(); }} className="btn btn-secondary">
          Reset Changes
        </button>
        <button onClick={handleSave} className="btn" disabled={saving}>
          <FaSave /> {saving ? 'Saving Changes...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}

export default Settings;
