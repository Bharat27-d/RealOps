import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaSearch, FaUserShield, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { discord } from '../services/api';

// Specific staff roles to display (excluding general STAFF role)
// Ordered by priority (highest to lowest)
const STAFF_ROLE_IDS = [
  '1291116832308068448', // FOUNDER
  '1291144543630262292', // PM - Project Manager
  '1386691716945543240', // DEVELOPER
  '1292896422949163120', // HRD - HR Director
  '1300834129780150272', // PMM - Partnership Manager
  '1291121579207692430', // EM - Event Manager
  '1296422181806542898', // MM - Media Manager
  '1291123331591831632', // DM - Design Manager
  '1344406747955200081', // SSM - Senior Support Manager
  '1296423697711894528', // M - Manager
  '1291818052744253612', // PL - Planner
  '1345496957082406972', // JNR_PLANNER - Junior Planner
  '1291394387888177193', // SS - Support Staff
  '1291122540864864348'  // ES - Event Staff
];

const ROLE_NAMES = {
  '1291116832308068448': 'Founder',
  '1291144543630262292': 'Project Manager',
  '1292896422949163120': 'Human Resources Team',
  '1300834129780150272': 'Partnership Manager',
  '1291121579207692430': 'Event Manager',
  '1296422181806542898': 'Media Manager',
  '1291123331591831632': 'Design Manager',
  '1344406747955200081': 'Senior Support Manager',
  '1296423697711894528': 'Manager',
  '1291818052744253612': 'Planner',
  '1386691716945543240': 'Developer',
  '1345496957082406972': 'Junior Planner',
  '1291394387888177193': 'Support Staff',
  '1291122540864864348': 'Event Staff'
};

// Custom colors for roles that are too light or hard to see
const ROLE_CUSTOM_COLORS = {
  '1292896422949163120': '#3498db', // HR Director - Blue
  '1296422181806542898': '#e74c3c', // Media Manager - Red
};

// Get role color with fallback for white/light colors
const getRoleColor = (role) => {
  // Check if we have a custom color override
  if (ROLE_CUSTOM_COLORS[role.id]) {
    return ROLE_CUSTOM_COLORS[role.id];
  }
  
  // If role has no color or is white/very light, use default
  if (!role.color || role.color === '#000000' || role.color === '#ffffff') {
    return '#b9bbbe';
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
      // Fetch members with specific staff role IDs
      console.log('Fetching staff with role IDs:', STAFF_ROLE_IDS);
      const response = await discord.getMembers(STAFF_ROLE_IDS);
      console.log('Staff response:', response.data);
      console.log('Response data type:', typeof response.data, 'Is array:', Array.isArray(response.data));
      
      // Ensure we always set an array
      const staffData = Array.isArray(response.data) ? response.data : [];
      console.log('Setting staff list with', staffData.length, 'members');
      setStaffList(staffData);
    } catch (error) {
      console.error('Error loading staff:', error);
      console.error('Error details:', error.response?.data);
      toast.error(`Failed to load staff: ${error.response?.data?.error || error.message}`);
      setStaffList([]); // Set empty array on error
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
      
      // Wait a moment for Discord to process the role change
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh staff list to get updated data
      const response = await discord.getMembers(STAFF_ROLE_IDS);
      const newStaffList = response.data;
      setStaffList(newStaffList);
      
      // Update selected member with fresh data
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
      
      // Wait a moment for Discord to process the role change
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh staff list to get updated data
      const response = await discord.getMembers(STAFF_ROLE_IDS);
      const newStaffList = response.data;
      setStaffList(newStaffList);
      
      // Update selected member with fresh data
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

  // Get the top 2 highest priority staff roles for a member
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

  // Get the highest role priority index for sorting
  const getHighestRolePriority = (member) => {
    for (let i = 0; i < STAFF_ROLE_IDS.length; i++) {
      if (member.roles.some(role => role.id === STAFF_ROLE_IDS[i])) {
        return i;
      }
    }
    return STAFF_ROLE_IDS.length; // If no staff role found, put at end
  };

  // Ensure staffList is always an array before filtering
  const safeStaffList = Array.isArray(staffList) ? staffList : [];

  let filteredStaff = safeStaffList.filter(member => {
    const matchesSearch = member.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.roles.some(role => role.id === selectedRole);
    return matchesSearch && matchesRole;
  });

  // Sort by highest role priority when "All Roles" is selected
  if (selectedRole === 'all') {
    filteredStaff = filteredStaff.sort((a, b) => {
      return getHighestRolePriority(a) - getHighestRolePriority(b);
    });
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-title">
        <div>
          <h1><FaUsers /> Staff Directory</h1>
          <p style={{ color: '#000', fontSize: '14px', margin: '8px 0 0 0', opacity: 0.8 }}>
            {filteredStaff.length} staff members
          </p>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-2" style={{ marginBottom: '25px' }}>
          <div className="form-group">
            <label className="form-label">Search Staff</label>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888', zIndex: 1 }} />
              <input 
                className="form-input"
                type="text" 
                placeholder="Search by username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '45px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Filter by Role</label>
            <select 
              className="form-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="1291116832308068448">Founder</option>
              <option value="1291144543630262292">Project Manager</option>
              <option value="1386691716945543240">Developer</option>
              <option value="1292896422949163120">HR Director</option>
              <option value="1300834129780150272">Partnership Manager</option>
              <option value="1291121579207692430">Event Manager</option>
              <option value="1296422181806542898">Media Manager</option>
              <option value="1291123331591831632">Design Manager</option>
              <option value="1344406747955200081">Senior Support Manager</option>
              <option value="1296423697711894528">Manager</option>
              <option value="1291818052744253612">Planner</option>
              <option value="1345496957082406972">Junior Planner</option>
              <option value="1291394387888177193">Support Staff</option>
              <option value="1291122540864864348">Event Staff</option>
            </select>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Username</th>
              <th>Nickname</th>
              <th>Roles</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map(member => {
              const topRoles = getTopStaffRoles(member);
              return (
                <tr key={member.id}>
                  <td>
                    <img 
                      src={member.avatar} 
                      alt={member.username}
                      style={{ 
                        width: '45px', 
                        height: '45px', 
                        borderRadius: '50%',
                        border: '2px solid #FFD700',
                        boxShadow: '0 2px 8px rgba(255, 215, 0, 0.2)'
                      }}
                    />
                  </td>
                  <td style={{ fontWeight: '600', color: '#FFD700' }}>{member.username}<span style={{ color: '#666' }}>#{member.discriminator}</span></td>
                  <td style={{ color: '#888' }}>{member.nickname || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {topRoles.length > 0 ? (
                        topRoles.map(role => (
                          <span 
                            key={role.id}
                            className="badge" 
                            style={{ background: getRoleColor(role) }}
                          >
                            <FaUserShield /> {role.displayName}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: '#b9bbbe' }}>-</span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: '#888' }}>{new Date(member.joinedAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn" 
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                      onClick={() => setSelectedMember(member)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredStaff.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#888',
            background: '#0a0a0a',
            borderRadius: '12px',
            marginTop: '20px'
          }}>
            <FaUsers size={60} style={{ color: '#FFD700', opacity: 0.5, marginBottom: '15px' }} />
            <p style={{ fontSize: '16px', margin: 0 }}>No staff members found</p>
          </div>
        )}
      </div>

      {showAvailability && (
        <div className="modal-overlay" onClick={() => setShowAvailability(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <h3><FaCalendarAlt /> Staff Availability Calendar</h3>
              <button className="modal-close" onClick={() => setShowAvailability(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <p style={{ color: '#888', marginBottom: '25px', fontSize: '15px' }}>
                Staff availability tracking system - integrate with calendar component for full functionality
              </p>

              <div className="grid grid-2">
                {filteredStaff.map(member => (
                  <div key={member.id} style={{ padding: '15px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <img 
                        src={member.avatar} 
                        alt={member.username}
                        style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid #FFD700' }}
                      />
                      <strong style={{ color: '#FFD700' }}>{member.username}</strong>
                    </div>
                    <span className="badge" style={{ background: '#28a745' }}>Available</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMember && (
        <div className="modal-overlay" onClick={() => setSelectedMember(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3><FaUserShield /> Staff Member Details</h3>
              <button className="modal-close" onClick={() => setSelectedMember(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', padding: '20px', background: '#0a0a0a', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
                <img 
                  src={selectedMember.avatar} 
                  alt={selectedMember.username}
                  style={{ 
                    width: '90px', 
                    height: '90px', 
                    borderRadius: '50%',
                    border: '3px solid #FFD700',
                    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.2)'
                  }}
                />
                <div>
                  <h2 style={{ margin: '0 0 8px 0', color: '#FFD700', fontSize: '22px' }}>
                    {selectedMember.username}<span style={{ color: '#666' }}>#{selectedMember.discriminator}</span>
                  </h2>
                  {selectedMember.nickname && (
                    <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>Nickname: {selectedMember.nickname}</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">User ID</label>
                <input className="form-input" type="text" value={selectedMember.id} readOnly style={{ background: '#0a0a0a', cursor: 'not-allowed' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Joined Server</label>
                <input 
                  className="form-input"
                  type="text" 
                  value={new Date(selectedMember.joinedAt).toLocaleString()} 
                  readOnly 
                  style={{ background: '#0a0a0a', cursor: 'not-allowed' }} 
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Current Roles ({selectedMember.roles.length})</span>
                  <button 
                    className="btn-secondary" 
                    style={{ 
                      padding: '8px 16px', 
                      fontSize: '13px',
                      background: '#FFD700',
                      color: '#000',
                      border: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#FFA500';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FFD700';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => setShowRoleManager(!showRoleManager)}
                  >
                    {showRoleManager ? 'Hide' : 'Manage Roles'}
                  </button>
                </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
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
                        background: getRoleColor(role),
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <FaUserShield /> {ROLE_NAMES[role.id] || role.name}
                      {showRoleManager && (
                        <button
                          onClick={() => handleRemoveRole(role.id)}
                          style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            borderRadius: '3px',
                            padding: '2px 5px',
                            fontSize: '0.8em',
                            marginLeft: '5px'
                          }}
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
              <div className="form-group">
                <label className="form-label">Add Role</label>
                <select 
                  className="form-select"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddRole(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Select a role to add...</option>
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

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                className="btn" 
                style={{ flex: 1 }}
                onClick={() => setShowMessageModal(true)}
              >
                Send Message
              </button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setSelectedMember(null); setShowRoleManager(false); }}>
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
              <h3>Send DM to {selectedMember.username}</h3>
              <button className="modal-close" onClick={() => setShowMessageModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea 
                  className="form-textarea"
                  rows="6"
                  placeholder="Type your message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  style={{ resize: 'vertical', minHeight: '120px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  className="btn" 
                  style={{ flex: 1 }}
                  onClick={handleSendMessage}
                >
                  Send Message
                </button>
                <button 
                  className="btn-secondary" 
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
