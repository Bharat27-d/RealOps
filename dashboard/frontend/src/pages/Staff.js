import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaSearch, FaUserShield, FaCalendarAlt, FaUsers, FaChartBar, FaBriefcase } from 'react-icons/fa';
import { discord } from '../services/api';

const STAFF_ROLE_IDS = [
  '1291116832308068448', // Founder
  '1291139504786378823', // Co-Founder
  '1386691716945543240', // Developer
  '1291144543630262292', // Project Manager
  '1488997119162318970', // Snr Event Manager
  '1300834129780150272', // Partner Manager
  '1291121579207692430', // Event Manager
  '1344406747955200081', // Snr Support Manager
  '1296422181806542898', // Media Manager
  '1291123331591831632', // Social Media Manager
  '1292896422949163120', // HR Department
  '1291394387888177193', // Support Staff
  '1291122540864864348', // Event Supervisor
  '1291818052744253612', // Planner
  '1345496957082406972', // Junior Planner
  '1296423697711894528'  // Media Team
];

const ROLE_NAMES = {
  '1291116832308068448': 'Founder',
  '1291139504786378823': 'Co-Founder',
  '1386691716945543240': 'Developer',
  '1291144543630262292': 'Project Manager',
  '1488997119162318970': 'Snr Event Manager',
  '1300834129780150272': 'Partner Manager',
  '1291121579207692430': 'Event Manager',
  '1344406747955200081': 'Snr Support Manager',
  '1296422181806542898': 'Media Manager',
  '1291123331591831632': 'Social Media Manager',
  '1292896422949163120': 'HR Department',
  '1291394387888177193': 'Support Staff',
  '1291122540864864348': 'Event Supervisor',
  '1291818052744253612': 'Planner',
  '1345496957082406972': 'Junior Planner',
  '1296423697711894528': 'Media Team'
};

const ROLE_CUSTOM_COLORS = {
  '1292896422949163120': '#3498db',
  '1296422181806542898': '#e74c3c'
};

const getRoleColor = (role) => {
  if (ROLE_CUSTOM_COLORS[role.id]) {
    return ROLE_CUSTOM_COLORS[role.id];
  }
  if (!role.color || role.color === '#000000' || role.color === '#ffffff') {
    return '#64748B';
  }
  return role.color;
};

function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAvailability, setShowAvailability] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');

  useEffect(() => {
    fetchStaff();
    fetchAllRoles();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await discord.getMembers(STAFF_ROLE_IDS);
      const staffData = Array.isArray(response.data) ? response.data : [];
      setStaffList(staffData);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast.error(`Failed to load staff roster: ${error.response?.data?.error || error.message}`);
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRoles = async () => {
    try {
      const response = await discord.getRoles();
      setAllRoles(response.data);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleAddRole = async (roleId) => {
    try {
      await discord.addRole(selectedMember.id, roleId);
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await discord.getMembers(STAFF_ROLE_IDS);
      const newStaffList = response.data;
      setStaffList(newStaffList);
      const updatedMember = newStaffList.find(m => m.id === selectedMember.id);
      if (updatedMember) {
        setSelectedMember(updatedMember);
        toast.success('Role added successfully');
      }
    } catch (error) {
      toast.error(`Failed to add role: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleRemoveRole = async (roleId) => {
    try {
      await discord.removeRole(selectedMember.id, roleId);
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await discord.getMembers(STAFF_ROLE_IDS);
      const newStaffList = response.data;
      setStaffList(newStaffList);
      const updatedMember = newStaffList.find(m => m.id === selectedMember.id);
      if (updatedMember) {
        setSelectedMember(updatedMember);
        toast.success('Role removed successfully');
      }
    } catch (error) {
      toast.error(`Failed to remove role: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast.error('Please enter a message');
      return;
    }
    try {
      await discord.sendDM(selectedMember.id, messageContent, null);
      toast.success(`Message sent to ${selectedMember.username}`);
      setMessageContent('');
      setShowMessageModal(false);
    } catch (error) {
      toast.error(`Failed to send message: ${error.response?.data?.error || error.message}`);
    }
  };

  const getTopStaffRoles = (member) => {
    const topRoles = [];
    for (const roleId of STAFF_ROLE_IDS) {
      const role = member.roles.find(r => r.id === roleId);
      if (role) {
        topRoles.push({
          ...role,
          displayName: ROLE_NAMES[roleId] || role.name
        });
        if (topRoles.length === 2) break;
      }
    }
    return topRoles;
  };

  const getHighestRolePriority = (member) => {
    for (let i = 0; i < STAFF_ROLE_IDS.length; i++) {
      if (member.roles.some(role => role.id === STAFF_ROLE_IDS[i])) {
        return i;
      }
    }
    return STAFF_ROLE_IDS.length;
  };

  const safeStaffList = Array.isArray(staffList) ? staffList : [];

  let filteredStaff = safeStaffList.filter(member => {
    const matchesSearch = member.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.roles.some(role => role.id === selectedRole);
    return matchesSearch && matchesRole;
  });

  if (selectedRole === 'all') {
    filteredStaff = filteredStaff.sort((a, b) => {
      return getHighestRolePriority(a) - getHighestRolePriority(b);
    });
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Loading staff roster and roles...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-secondary)',
        borderRadius: '16px',
        padding: '22px 28px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '11px', color: '#60A5FA', fontWeight: '700', marginBottom: '6px' }}>
            REALOPS PORTAL / MANAGEMENT
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px', color: '#FFFFFF' }}>
            <FaUsers style={{ color: '#818CF8', fontSize: '24px' }} /> Staff Roster Directory
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.35)', color: '#818CF8', padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {filteredStaff.length} Active Members
          </span>
          <button style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-secondary)',
            color: '#FFFFFF',
            padding: '9px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }} onClick={() => setShowAvailability(true)}>
            <FaCalendarAlt style={{ color: '#60A5FA' }} /> Availability Status
          </button>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-4" style={{ gap: '20px', marginBottom: '24px' }}>
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: '16px', padding: '22px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1 }}>{safeStaffList.length}</h3>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#1C203A', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              <FaUsers />
            </div>
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.8px', textTransform: 'uppercase' }}>TOTAL STAFF</p>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: '16px', padding: '22px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1 }}>{STAFF_ROLE_IDS.length}</h3>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#15213D', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              <FaUserShield />
            </div>
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.8px', textTransform: 'uppercase' }}>STAFF POSITIONS</p>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: '16px', padding: '22px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1 }}>{filteredStaff.length}</h3>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#112C27', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              <FaChartBar />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
              Operational
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.8px', textTransform: 'uppercase' }}>FILTERED RESULTS</p>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: '16px', padding: '22px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1 }}>{new Set(safeStaffList.flatMap(m => m.roles?.map(r => r.id) || [])).size}</h3>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#2B2116', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              <FaBriefcase />
            </div>
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.8px', textTransform: 'uppercase' }}>UNIQUE ROLES</p>
        </div>
      </div>

      {/* Directory Card */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: '16px', padding: '24px' }}>
        {/* Filters */}
        <div className="grid grid-2" style={{ marginBottom: '24px', gap: '20px' }}>
          <div style={{ margin: 0 }}>
            <label style={{ display: 'block', color: '#64748B', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Search Directory</label>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input 
                type="text" 
                placeholder="Search by username or nickname..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)', color: '#FFFFFF', padding: '12px 16px 12px 44px', borderRadius: '10px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s ease' }}
              />
            </div>
          </div>

          <div style={{ margin: 0 }}>
            <label style={{ display: 'block', color: '#64748B', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Filter by Position</label>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)', color: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394A3B8' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', paddingRight: '40px' }}
            >
              <option value="all">All Positions</option>
              <option value="1291116832308068448">Founder</option>
              <option value="1291144543630262292">Project Manager</option>
              <option value="1386691716945543240">Developer</option>
              <option value="1292896422949163120">HR Director</option>
              <option value="1300834129780150272">Partnership Manager</option>
              <option value="1291121579207692430">Event Manager</option>
              <option value="1296422181806542898">Media Manager</option>
              <option value="1291123331591831632">Design Manager</option>
              <option value="1344406747955200081">Senior Support Manager</option>
              <option value="1296423697711894528">Media Team</option>
              <option value="1291818052744253612">Planner</option>
              <option value="1345496957082406972">Junior Planner</option>
              <option value="1291394387888177193">Support Staff</option>
              <option value="1291122540864864348">Event Staff</option>
            </select>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Member Info</th>
                <th>Nickname</th>
                <th>Assigned Roles</th>
                <th>Joined Server</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map(member => {
                const topRoles = getTopStaffRoles(member);
                return (
                  <tr key={member.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img 
                          src={member.avatar} 
                          alt={member.username}
                          style={{ 
                            width: '42px', 
                            height: '42px', 
                            borderRadius: '12px',
                            objectFit: 'cover',
                            border: '1px solid #1E2538'
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: '700', color: '#FFFFFF', fontSize: '14px' }}>
                            {member.username}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>
                            #{member.discriminator || '0000'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#94A3B8', fontSize: '14px' }}>
                      {member.nickname || <span style={{ color: '#64748B', fontStyle: 'italic' }}>None</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {topRoles.length > 0 ? (
                          topRoles.map(role => (
                            <span 
                              key={role.id}
                              style={{ 
                                background: 'rgba(99, 102, 241, 0.12)',
                                color: '#FFFFFF',
                                border: `1px solid ${getRoleColor(role)}`,
                                fontSize: '11px',
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <FaUserShield style={{ color: getRoleColor(role), fontSize: '10px' }} /> {role.displayName}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: '#64748B' }}>No staff role</span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: '#64748B', fontSize: '13px' }}>
                      {new Date(member.joinedAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <button 
                        style={{ 
                          background: 'var(--bg-tertiary)', 
                          border: '1px solid var(--border-secondary)', 
                          color: '#FFFFFF', 
                          padding: '6px 14px', 
                          fontSize: '13px', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          fontWeight: '600', 
                          transition: 'all 0.2s ease' 
                        }}
                        onClick={() => setSelectedMember(member)}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#60A5FA'; e.currentTarget.style.background = '#1A2035'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-secondary)'; e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStaff.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#64748B',
            background: 'var(--bg-tertiary)',
            borderRadius: '14px',
            marginTop: '20px',
            border: '1px solid var(--border-secondary)'
          }}>
            <FaUsers size={48} style={{ opacity: 0.3, marginBottom: '14px' }} />
            <p style={{ fontSize: '16px', color: '#FFFFFF', fontWeight: '600', margin: '0 0 4px 0' }}>No Staff Members Found</p>
            <p style={{ fontSize: '14px', margin: 0 }}>Try modifying your directory search query or role filter.</p>
          </div>
        )}
      </div>

      {showAvailability && (
        <div className="modal-overlay" onClick={() => setShowAvailability(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3><FaCalendarAlt /> Staff Roster Availability Status</h3>
              <button className="modal-close" onClick={() => setShowAvailability(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
                Active operational status of all registered staff members:
              </p>

              <div className="grid grid-2" style={{ gap: '12px' }}>
                {filteredStaff.map(member => (
                  <div key={member.id} style={{ 
                    padding: '14px 16px', 
                    background: 'var(--bg-tertiary)', 
                    border: '1px solid var(--border-secondary)', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={member.avatar} 
                        alt={member.username}
                        style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>{member.username}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{member.nickname || 'Active Roster'}</div>
                      </div>
                    </div>
                    <span className="badge badge-success">Available</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMember && (
        <div className="modal-overlay" onClick={() => setSelectedMember(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3><FaUserShield /> Staff Member Profile</h3>
              <button className="modal-close" onClick={() => setSelectedMember(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px', 
                marginBottom: '28px', 
                padding: '20px', 
                background: 'var(--bg-tertiary)', 
                borderRadius: '14px', 
                border: '1px solid var(--border-secondary)' 
              }}>
                <img 
                  src={selectedMember.avatar} 
                  alt={selectedMember.username}
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '16px',
                    objectFit: 'cover',
                    border: '2px solid var(--primary)'
                  }}
                />
                <div>
                  <h2 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)', fontSize: '20px' }}>
                    {selectedMember.username}<span style={{ color: 'var(--text-tertiary)' }}>#{selectedMember.discriminator}</span>
                  </h2>
                  {selectedMember.nickname && (
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '13px' }}>Server Nickname: {selectedMember.nickname}</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Discord User ID</label>
                <input className="form-input" type="text" value={selectedMember.id} readOnly style={{ fontFamily: 'monospace' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Joined Timestamp</label>
                <input 
                  className="form-input"
                  type="text" 
                  value={new Date(selectedMember.joinedAt).toLocaleString()} 
                  readOnly 
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Assigned Roles ({selectedMember.roles.length})</label>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 14px', fontSize: '12px' }}
                    onClick={() => setShowRoleManager(!showRoleManager)}
                  >
                    {showRoleManager ? 'Done' : 'Manage Roles'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '14px', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-secondary)' }}>
                  {selectedMember.roles
                    .sort((a, b) => {
                      const aIndex = STAFF_ROLE_IDS.indexOf(a.id);
                      const bIndex = STAFF_ROLE_IDS.indexOf(b.id);
                      const aPriority = aIndex === -1 ? 999 : aIndex;
                      const bPriority = bIndex === -1 ? 999 : bIndex;
                      return aPriority - bPriority;
                    })
                    .map(role => (
                      <span 
                        key={role.id}
                        className="badge" 
                        style={{ 
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          border: `1px solid ${getRoleColor(role)}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FaUserShield style={{ color: getRoleColor(role) }} /> {ROLE_NAMES[role.id] || role.name}
                        {showRoleManager && (
                          <button
                            onClick={() => handleRemoveRole(role.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--danger)',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '14px',
                              marginLeft: '4px'
                            }}
                            title="Remove Role"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))
                  }
                </div>
              </div>

              {showRoleManager && (
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Add New Role</label>
                  <select 
                    className="form-select"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddRole(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Select a role to add to this member...</option>
                    {allRoles
                      .filter(role => !selectedMember.roles.some(mr => mr.id === role.id))
                      .map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-secondary)' }}>
                <button 
                  className="btn" 
                  style={{ flex: 1 }}
                  onClick={() => setShowMessageModal(true)}
                >
                  Send Direct Message
                </button>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setSelectedMember(null); setShowRoleManager(false); }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMessageModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Send Direct Message to {selectedMember.username}</h3>
              <button className="modal-close" onClick={() => setShowMessageModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Message Content</label>
                <textarea 
                  className="form-textarea"
                  rows="6"
                  placeholder="Type your message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  className="btn" 
                  style={{ flex: 1 }}
                  onClick={handleSendMessage}
                >
                  Send Direct Message
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }} 
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageContent('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff;
