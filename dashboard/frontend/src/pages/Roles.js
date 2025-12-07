import React, { useState, useEffect } from 'react';
import { roles, discord } from '../services/api';
import { toast } from 'react-toastify';
import { FaUserShield, FaTag, FaChartBar, FaUsers, FaCrown } from 'react-icons/fa';
import ConfirmDialog from '../components/ConfirmDialog';

function Roles() {
  const [autoRoles, setAutoRoles] = useState([]);
  const [nicknameRules, setNicknameRules] = useState([]);
  const [channels, setChannels] = useState([]);
  const [discordRoles, setDiscordRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'auto', 'nickname'
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, ruleId: null });

  const [newAutoRole, setNewAutoRole] = useState({
    roleId: '',
    condition: 'on-join',
    delay: 0
  });

  const [newNicknameRule, setNewNicknameRule] = useState({
    pattern: '',
    action: 'prefix',
    value: '',
    roleId: ''
  });

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchAllData = async () => {
    try {
      const [channelsRes, rolesRes] = await Promise.all([
        discord.getChannels(),
        discord.getRoles()
      ]);
      setChannels(channelsRes.data);
      setDiscordRoles(rolesRes.data);

      // Fetch all members for analytics
      if (activeTab === 'analytics') {
        try {
          const membersRes = await discord.getMembers([]);
          setMembers(membersRes.data);
        } catch (error) {
          console.error('Error fetching members:', error);
          setMembers([]);
        }
      }

      if (activeTab === 'auto') {
        const arRes = await roles.getAutoRoles();
        setAutoRoles(arRes.data);
      } else if (activeTab === 'nickname') {
        const nrRes = await roles.getNicknameRules();
        setNicknameRules(nrRes.data);
      }
      
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  const handleCreateAutoRole = async () => {
    try {
      await roles.createAutoRole(newAutoRole);
      toast.success('Auto-role created successfully!');
      setNewAutoRole({ roleId: '', condition: 'on-join', delay: 0 });
      fetchAllData();
    } catch (error) {
      toast.error('Failed to create auto-role');
    }
  };

  const handleToggleAutoRole = async (id) => {
    try {
      await roles.toggleAutoRole(id);
      toast.success('Auto-role toggled');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to toggle auto-role');
    }
  };

  const handleCreateNicknameRule = async () => {
    try {
      await roles.createNicknameRule(newNicknameRule);
      toast.success('Nickname rule created successfully!');
      setNewNicknameRule({ pattern: '', action: 'prefix', value: '', roleId: '' });
      fetchAllData();
    } catch (error) {
      toast.error('Failed to create nickname rule');
    }
  };

  const handleDeleteRule = (id) => {
    setConfirmDialog({ isOpen: true, ruleId: id });
  };

  const confirmDelete = async () => {
    try {
      await roles.delete(confirmDialog.ruleId);
      toast.success('Rule deleted');
      setConfirmDialog({ isOpen: false, ruleId: null });
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete rule');
      setConfirmDialog({ isOpen: false, ruleId: null });
    }
  };

  const getRoleName = (roleId) => {
    const role = discordRoles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  // eslint-disable-next-line no-unused-vars
  const getChannelName = (channelId) => {
    const channel = channels.find(c => c.id === channelId);
    return channel ? channel.name : channelId;
  };

  return (
    <div className="page-container">
      <div className="page-title">
        <h1><FaUserShield /> Role & Permission Management</h1>
      </div>

      <div className="tab-buttons" style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '25px',
        flexWrap: 'wrap'
      }}>
        <button 
          className={activeTab === 'analytics' ? 'btn' : 'btn-secondary'}
          onClick={() => setActiveTab('analytics')}
          style={{ padding: '12px 24px' }}
        >
          <FaChartBar /> Role Analytics
        </button>
        <button 
          className={activeTab === 'auto' ? 'btn' : 'btn-secondary'}
          onClick={() => setActiveTab('auto')}
          style={{ padding: '12px 24px' }}
        >
          <FaUserShield /> Auto Roles
        </button>
        <button 
          className={activeTab === 'nickname' ? 'btn' : 'btn-secondary'}
          onClick={() => setActiveTab('nickname')}
          style={{ padding: '12px 24px' }}
        >
          <FaTag /> Nickname Rules
        </button>
      </div>

      {/* ROLE ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="analytics-section">
          {members.length === 0 ? (
            <div className="card">
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                color: '#888'
              }}>
                <FaChartBar size={60} style={{ color: '#FFD700', opacity: 0.5, marginBottom: '15px' }} />
                <p style={{ fontSize: '16px', margin: 0 }}>Loading analytics data...</p>
              </div>
            </div>
          ) : (
            <>
          {/* Summary Stats */}
          <div className="grid grid-3" style={{ marginBottom: '30px' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ 
                background: 'rgba(255, 215, 0, 0.15)',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaUserShield size={28} style={{ color: '#FFD700' }} />
              </div>
              <div className="stat-content">
                <h3 style={{ color: '#FFD700', fontSize: '32px', margin: '0 0 5px 0', fontWeight: '600' }}>{discordRoles.length}</h3>
                <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>Total Roles</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ 
                background: 'rgba(76, 175, 80, 0.15)',
                border: '2px solid rgba(76, 175, 80, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaUsers size={28} style={{ color: '#4CAF50' }} />
              </div>
              <div className="stat-content">
                <h3 style={{ color: '#FFD700', fontSize: '32px', margin: '0 0 5px 0', fontWeight: '600' }}>{members.length}</h3>
                <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>Total Members</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ 
                background: 'rgba(33, 150, 243, 0.15)',
                border: '2px solid rgba(33, 150, 243, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaCrown size={28} style={{ color: '#2196F3' }} />
              </div>
              <div className="stat-content">
                <h3 style={{ color: '#FFD700', fontSize: '32px', margin: '0 0 5px 0', fontWeight: '600' }}>{members.reduce((sum, m) => sum + m.roles.length, 0)}</h3>
                <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>Total Role Assignments</p>
              </div>
            </div>
          </div>

          {/* Role Distribution */}
          <div className="card" style={{ marginBottom: '25px' }}>
            <div className="card-header">
              <h3 style={{ color: '#FFD700', margin: 0 }}>Role Distribution</h3>
            </div>
            <div style={{ padding: '20px' }}>
              {discordRoles
                .map(role => {
                  const memberCount = members.filter(m => m.roles.some(r => r.id === role.id)).length;
                  const percentage = members.length > 0 ? (memberCount / members.length * 100).toFixed(1) : 0;
                  return { ...role, memberCount, percentage };
                })
                .sort((a, b) => b.memberCount - a.memberCount)
                .slice(0, 15)
                .map(role => (
                  <div key={role.id} style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          borderRadius: '50%', 
                          background: role.color && role.color !== '#000000' ? role.color : '#888',
                          border: '2px solid rgba(255, 215, 0, 0.3)',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                        }} />
                        <span style={{ color: '#FFD700', fontWeight: '500', fontSize: '15px' }}>{role.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ color: '#ccc', fontSize: '14px', fontWeight: '500' }}>
                          {role.memberCount} members
                        </span>
                        <span style={{ color: '#888', fontSize: '13px', minWidth: '50px', textAlign: 'right' }}>
                          ({role.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '10px', 
                      background: '#0a0a0a', 
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '1px solid #2a2a2a',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                    }}>
                      <div style={{ 
                        width: `${role.percentage}%`, 
                        height: '100%', 
                        background: role.color && role.color !== '#000000' 
                          ? `linear-gradient(90deg, ${role.color} 0%, ${role.color}dd 100%)`
                          : 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                        transition: 'width 0.3s ease',
                        boxShadow: `0 0 8px ${role.color && role.color !== '#000000' ? role.color + '88' : '#FFD70088'}`
                      }} />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Top & Bottom Roles */}
          <div className="grid grid-2">
            <div className="card">
              <div className="card-header">
                <h3 style={{ color: '#FFD700', margin: 0 }}>Most Assigned Roles</h3>
              </div>
              <div style={{ padding: '20px' }}>
                {discordRoles
                  .map(role => ({
                    ...role,
                    memberCount: members.filter(m => m.roles.some(r => r.id === role.id)).length
                  }))
                  .sort((a, b) => b.memberCount - a.memberCount)
                  .slice(0, 5)
                  .map((role, index) => (
                    <div key={role.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '15px',
                      padding: '15px',
                      background: index === 0 ? 'rgba(255, 215, 0, 0.05)' : '#0a0a0a',
                      border: '1px solid #2a2a2a',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ 
                        minWidth: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: index === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' : '#1a1a1a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: index === 0 ? '#000' : '#FFD700',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#FFD700', fontWeight: '500', marginBottom: '4px' }}>{role.name}</div>
                        <div style={{ color: '#888', fontSize: '13px' }}>{role.memberCount} members</div>
                      </div>
                      {index === 0 && <FaCrown style={{ color: '#FFD700' }} />}
                    </div>
                  ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 style={{ color: '#FFD700', margin: 0 }}>Least Assigned Roles</h3>
              </div>
              <div style={{ padding: '20px' }}>
                {discordRoles
                  .map(role => ({
                    ...role,
                    memberCount: members.filter(m => m.roles.some(r => r.id === role.id)).length
                  }))
                  .filter(role => role.memberCount > 0)
                  .sort((a, b) => a.memberCount - b.memberCount)
                  .slice(0, 5)
                  .map((role, index) => (
                    <div key={role.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '15px',
                      padding: '15px',
                      background: '#0a0a0a',
                      border: '1px solid #2a2a2a',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ 
                        minWidth: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: '#1a1a1a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#888',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#ccc', fontWeight: '500', marginBottom: '4px' }}>{role.name}</div>
                        <div style={{ color: '#888', fontSize: '13px' }}>{role.memberCount} members</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          </>
          )}
        </div>
      )}

      {/* AUTO ROLES TAB */}
      {activeTab === 'auto' && (
        <div className="auto-roles-section">
          <div className="create-form card">
            <h3>Create Auto Role</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={newAutoRole.roleId}
                  onChange={(e) => setNewAutoRole({ ...newAutoRole, roleId: e.target.value })}
                >
                  <option value="">Select Role</option>
                  {discordRoles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Condition</label>
                <select
                  value={newAutoRole.condition}
                  onChange={(e) => setNewAutoRole({ ...newAutoRole, condition: e.target.value })}
                >
                  <option value="on-join">On Join</option>
                  <option value="verified">After Verification</option>
                  <option value="first-message">First Message</option>
                </select>
              </div>
              <div className="form-group">
                <label>Delay (seconds)</label>
                <input
                  type="number"
                  value={newAutoRole.delay}
                  onChange={(e) => setNewAutoRole({ ...newAutoRole, delay: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
            </div>
            <button className="btn btn-success" onClick={handleCreateAutoRole}>Create Auto Role</button>
          </div>

          <div className="rules-list">
            {autoRoles.map((ar) => (
              <div key={ar.id} className="rule-card card">
                <div className="rule-header">
                  <h4>{getRoleName(ar.roleId)}</h4>
                  <div>
                    <button 
                      className={`btn btn-sm ${ar.enabled ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => handleToggleAutoRole(ar.id)}
                    >
                      {ar.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteRule(ar.id)}>
                      Delete
                    </button>
                  </div>
                </div>
                <p>Condition: {ar.condition}</p>
                <p>Delay: {ar.delay}s</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NICKNAME RULES TAB */}
      {activeTab === 'nickname' && (
        <div className="nickname-rules-section">
          <div className="create-form card">
            <h3>Create Nickname Rule</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Pattern (regex or text)</label>
                <input
                  type="text"
                  value={newNicknameRule.pattern}
                  onChange={(e) => setNewNicknameRule({ ...newNicknameRule, pattern: e.target.value })}
                  placeholder="e.g., ^[A-Z]"
                />
              </div>
              <div className="form-group">
                <label>Action</label>
                <select
                  value={newNicknameRule.action}
                  onChange={(e) => setNewNicknameRule({ ...newNicknameRule, action: e.target.value })}
                >
                  <option value="prefix">Add Prefix</option>
                  <option value="suffix">Add Suffix</option>
                  <option value="replace">Replace</option>
                  <option value="require">Require Format</option>
                </select>
              </div>
              <div className="form-group">
                <label>Value</label>
                <input
                  type="text"
                  value={newNicknameRule.value}
                  onChange={(e) => setNewNicknameRule({ ...newNicknameRule, value: e.target.value })}
                  placeholder="e.g., [Team] "
                />
              </div>
              <div className="form-group">
                <label>Apply to Role (optional)</label>
                <select
                  value={newNicknameRule.roleId}
                  onChange={(e) => setNewNicknameRule({ ...newNicknameRule, roleId: e.target.value })}
                >
                  <option value="">All Members</option>
                  {discordRoles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="btn btn-success" onClick={handleCreateNicknameRule}>Create Rule</button>
          </div>

          <div className="rules-list">
            {nicknameRules.map((nr) => (
              <div key={nr.id} className="rule-card card">
                <div className="rule-header">
                  <h4>{nr.action}: {nr.value}</h4>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteRule(nr.id)}>
                    Delete
                  </button>
                </div>
                <p>Pattern: {nr.pattern}</p>
                {nr.roleId && <p>Role: {getRoleName(nr.roleId)}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Rule"
        message="Are you sure you want to delete this rule? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, ruleId: null })}
      />
    </div>
  );
}

export default Roles;
