import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, FaCalendar, FaTicketAlt, FaUsers, 
  FaPalette, FaLayerGroup, FaChartBar, FaSignOutAlt,
  FaHandshake, FaComments, FaUserShield, FaBullhorn, FaCog
} from 'react-icons/fa';

function Sidebar({ user, onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src="https://i.ibb.co/FMYFdhk/real-ops-group-logo.png" alt="RealOps" />
        <h2>RealOps</h2>
      </div>

      <ul className="sidebar-nav">
        <li>
          <NavLink to="/" end>
            <FaHome /> <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/events">
            <FaCalendar /> <span>Events</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/tickets">
            <FaTicketAlt /> <span>Tickets</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/staff">
            <FaUsers /> <span>Staff</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/embeds">
            <FaPalette /> <span>Embeds</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/panels">
            <FaLayerGroup /> <span>Panels</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/analytics">
            <FaChartBar /> <span>Analytics</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/partnerships">
            <FaHandshake /> <span>Partnerships</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/feedback">
            <FaComments /> <span>Documentation</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/roles">
            <FaUserShield /> <span>Roles</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/announcements">
            <FaBullhorn /> <span>Announcements</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings">
            <FaCog /> <span>Settings</span>
          </NavLink>
        </li>
      </ul>

      <div style={{ 
        marginTop: 'auto', 
        padding: '20px 12px', 
        borderTop: '1px solid #2a2a2a',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)'
      }}>
        <div style={{ 
          padding: '14px 16px', 
          marginBottom: '12px',
          background: 'rgba(255, 215, 0, 0.08)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 215, 0, 0.2)'
        }}>
          <p style={{ fontSize: '11px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
            Logged in as
          </p>
          <p style={{ fontSize: '15px', fontWeight: '700', color: '#FFD700', margin: 0 }}>
            {user?.username}
          </p>
        </div>
        <button onClick={onLogout} style={{
          width: '100%',
          padding: '12px',
          background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(231, 76, 60, 0.2)'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.2)';
        }}>
          <FaSignOutAlt /> <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
