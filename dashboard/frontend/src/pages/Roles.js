import React, { useState, useEffect } from 'react';
import { roles, discord } from '../services/api';
import { toast } from 'react-toastify';
import { FaUserShield, FaTag, FaChartBar, FaUsers, FaCrown, FaPlus, FaTrash } from 'react-icons/fa';
import ConfirmDialog from '../components/ConfirmDialog';

function Roles() {
  const [nicknameRules, setNicknameRules] = useState([]);
  const [discordRoles, setDiscordRoles] = useState([]);
  const [members, setMembers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'nickname'
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, ruleId: null });

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
      const rolesRes = await discord.getRoles();
      setDiscordRoles(rolesRes.data);

      if (activeTab === 'analytics') {
        try {
          const membersRes = await discord.getMembers([]);
          setMembers(membersRes.data);
        } catch (error) {
          console.error('Error fetching members:', error);
          setMembers([]);
        }
      }

      if (activeTab === 'nickname') {
        const nrRes = await roles.getNicknameRules();
        setNicknameRules(nrRes.data);
      }
      
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  const handleCreateNicknameRule = async () => {
    if (!newNicknameRule.pattern || !newNicknameRule.value) {
      toast.error('Please enter a pattern and value');
      return;
    }
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

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-title">
        <div>
          <div className="page-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '11px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>
            RealOps Portal / Management
          </div>
          <h1>
            <FaUserShield /> Role & Permission Management
          </h1>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '28px',
        flexWrap: 'wrap'
      }}>
        <button 
          className={activeTab === 'analytics' ? 'btn' : 'btn btn-secondary'}
          onClick={() => setActiveTab('analytics')}
          style={{ padding: '12px 24px', fontSize: '14px' }}
        >
          <FaChartBar /> Role Analytics
        </button>
        <button 
          className={activeTab === 'nickname' ? 'btn' : 'btn btn-secondary'}
          onClick={() => setActiveTab('nickname')}
          style={{ padding: '12px 24px', fontSize: '14px' }}
        >
          <FaTag /> Nickname Automation
        </button>
      </div>

      {/* ROLE ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="analytics-section">
          {members.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>Loading role metrics and member assignments...</p>
            </div>
          ) : (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-3" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>{discordRoles.length}</h3>
                    <p>Total Server Roles</p>
                  </div>
                  <div className="stat-icon">
                    <FaUserShield />
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-info">
                    <h3>{members.length}</h3>
                    <p>Tracked Members</p>
                  </div>
                  <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                    <FaUsers />
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-info">
                    <h3>{members.reduce((sum, m) => sum + m.roles.length, 0)}</h3>
                    <p>Role Assignments</p>
                  </div>
                  <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
                    <FaCrown />
                  </div>
                </div>
              </div>

              {/* Role Distribution Meter */}
              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                  <h2><FaChartBar /> Role Distribution Overview</h2>
                </div>
                <div>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '14px', 
                              height: '14px', 
                              borderRadius: '50%', 
                              background: role.color && role.color !== '#000000' ? role.color : 'var(--primary)',
                              border: '2px solid var(--border-secondary)'
                            }} />
                            <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px' }}>{role.name}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>
                              {role.memberCount} members
                            </span>
                            <span className="badge badge-primary" style={{ fontSize: '11px', minWidth: '55px', justifyContent: 'center' }}>
                              {role.percentage}%
                            </span>
                          </div>
                        </div>
                        <div style={{ 
                          width: '100%', 
                          height: '8px', 
                          background: 'var(--bg-tertiary)', 
                          borderRadius: '999px',
                          overflow: 'hidden',
                          border: '1px solid var(--border-secondary)'
                        }}>
                          <div style={{ 
                            width: `${Math.min(role.percentage, 100)}%`, 
                            height: '100%', 
                            background: role.color && role.color !== '#000000' ? role.color : 'var(--primary)',
                            borderRadius: '999px',
                            transition: 'width 0.4s ease'
                          }} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Top & Bottom Assigned Roles */}
              <div className="grid grid-2">
                <div className="card">
                  <div className="card-header">
                    <h2><FaCrown /> Most Assigned Roles</h2>
                  </div>
                  <div>
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
                          gap: '14px',
                          padding: '14px 16px',
                          background: index === 0 ? 'var(--primary-subtle)' : 'var(--bg-tertiary)',
                          border: `1px solid ${index === 0 ? 'var(--primary-border)' : 'var(--border-secondary)'}`,
                          borderRadius: '12px',
                          marginBottom: '10px'
                        }}>
                          <div style={{ 
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            background: index === 0 ? 'var(--primary)' : 'var(--bg-secondary)',
                            color: index === 0 ? '#FFFFFF' : 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '14px'
                          }}>
                            {index + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px' }}>{role.name}</div>
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{role.memberCount} assigned members</div>
                          </div>
                          {index === 0 && <span className="badge badge-primary">Rank #1</span>}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h2><FaUsers /> Least Assigned Roles</h2>
                  </div>
                  <div>
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
                          gap: '14px',
                          padding: '14px 16px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-secondary)',
                          borderRadius: '12px',
                          marginBottom: '10px'
                        }}>
                          <div style={{ 
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '14px'
                          }}>
                            {index + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px' }}>{role.name}</div>
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{role.memberCount} assigned members</div>
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

      {/* NICKNAME AUTOMATION TAB */}
      {activeTab === 'nickname' && (
        <div className="nickname-rules-section">
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h2><FaPlus /> Create Nickname Automation Rule</h2>
            </div>
            <div className="grid grid-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Regex Pattern or Matcher</label>
                <input
                  type="text"
                  className="form-input"
                  value={newNicknameRule.pattern}
                  onChange={(e) => setNewNicknameRule({ ...newNicknameRule, pattern: e.target.value })}
                  placeholder="e.g., ^[A-Z] or [Team]"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Action</label>
                <select
                  className="form-select"
                  value={newNicknameRule.action}
                  onChange={(e) => setNewNicknameRule({ ...newNicknameRule, action: e.target.value })}
                >
                  <option value="prefix">Add Prefix</option>
                  <option value="suffix">Add Suffix</option>
                  <option value="replace">Replace Text</option>
                  <option value="require">Require Format</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Replacement Value / Tag</label>
                <input
                  type="text"
                  className="form-input"
                  value={newNicknameRule.value}
                  onChange={(e) => setNewNicknameRule({ ...newNicknameRule, value: e.target.value })}
                  placeholder="e.g., [RealOps] "
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target Role (Optional)</label>
                <select
                  className="form-select"
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
            <button className="btn btn-success" onClick={handleCreateNicknameRule} style={{ marginTop: '8px' }}>
              <FaPlus /> Deploy Rule
            </button>
          </div>

          <div className="card">
            <div className="card-header">
              <h2><FaTag /> Active Nickname Rules ({nicknameRules.length})</h2>
            </div>
            {nicknameRules.length > 0 ? (
              <div className="grid grid-2" style={{ gap: '16px' }}>
                {nicknameRules.map((nr) => (
                  <div key={nr.id} style={{
                    padding: '18px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-secondary)',
                    borderRadius: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>
                          {nr.action}
                        </span>
                        <button className="btn-icon danger" onClick={() => handleDeleteRule(nr.id)} title="Delete Rule">
                          <FaTrash />
                        </button>
                      </div>
                      <h4 style={{ color: 'var(--text-primary)', fontSize: '16px', margin: '4px 0 8px 0' }}>
                        "{nr.value}"
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, fontFamily: 'monospace' }}>
                        Pattern: {nr.pattern}
                      </p>
                    </div>
                    {nr.roleId && (
                      <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-secondary)', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        Target Role: <strong style={{ color: 'var(--text-primary)' }}>{getRoleName(nr.roleId)}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
                <FaTag size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
                <p style={{ fontSize: '14px', margin: 0 }}>No active nickname automation rules configured yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Automation Rule"
        message="Are you sure you want to delete this nickname rule? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, ruleId: null })}
      />
    </div>
  );
}

export default Roles;
