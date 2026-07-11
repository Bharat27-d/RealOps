import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, FaCalendar, FaTicketAlt, FaUsers, 
  FaPalette, FaLayerGroup, FaChartBar, FaSignOutAlt,
  FaHandshake, FaBook, FaTerminal, FaUserShield, FaBullhorn, FaCog, FaCircle
} from 'react-icons/fa';

function Sidebar({ user, onLogout }) {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-brand">
          <img src="https://i.ibb.co/FMYFdhk/real-ops-group-logo.png" alt="RealOps" />
          <div>
            <h2>RealOps</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <FaCircle style={{ fontSize: '7px', color: '#10B981' }} />
              <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>Admin Portal</span>
            </div>
          </div>
        </div>
        <span className="sidebar-status-pill">PRO</span>
      </div>

      {/* Navigation Groups */}
      <div className="sidebar-nav-container">
        <div className="sidebar-section-title">Overview</div>
        <ul className="sidebar-nav">
          <li>
            <NavLink to="/" end>
              <FaHome /> <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/analytics">
              <FaChartBar /> <span>Analytics</span>
            </NavLink>
          </li>
        </ul>

        <div className="sidebar-section-title">Management</div>
        <ul className="sidebar-nav">
          <li>
            <NavLink to="/events">
              <FaCalendar /> <span>Events</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/tickets">
              <FaTicketAlt /> <span>Tickets Archive</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/staff">
              <FaUsers /> <span>Staff Roster</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/roles">
              <FaUserShield /> <span>Roles & Permissions</span>
            </NavLink>
          </li>
        </ul>

        <div className="sidebar-section-title">Content & Config</div>
        <ul className="sidebar-nav">
          <li>
            <NavLink to="/embeds">
              <FaPalette /> <span>Embed Builder</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/panels">
              <FaLayerGroup /> <span>Ticket Panels</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/custom-commands">
              <FaTerminal /> <span>Bot Commands</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/announcements">
              <FaBullhorn /> <span>Announcements</span>
            </NavLink>
          </li>
        </ul>

        <div className="sidebar-section-title">System & Docs</div>
        <ul className="sidebar-nav">
          <li>
            <NavLink to="/partnerships">
              <FaHandshake /> <span>Partnerships</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/feedback">
              <FaBook /> <span>Documentation</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings">
              <FaCog /> <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </div>

      {/* User Session Footer */}
      <div style={{ 
        marginTop: 'auto', 
        padding: '16px', 
        borderTop: '1px solid var(--border-secondary)',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ 
          padding: '12px 14px', 
          marginBottom: '12px',
          background: 'var(--bg-tertiary)',
          borderRadius: '12px',
          border: '1px solid var(--border-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--primary-subtle)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '15px',
            flexShrink: 0
          }}>
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: '600' }}>
              Logged in as
            </p>
            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.username || 'Administrator'}
            </p>
          </div>
        </div>
        <button onClick={onLogout} style={{
          width: '100%',
          padding: '11px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '10px',
          color: 'var(--danger)',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all var(--transition-fast)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--danger)';
          e.currentTarget.style.color = '#FFFFFF';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
          e.currentTarget.style.color = 'var(--danger)';
        }}>
          <FaSignOutAlt /> <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
