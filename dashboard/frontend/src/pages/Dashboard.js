import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTicketAlt, FaCalendar, FaUsers, FaChartLine, FaSync, 
  FaClock, FaExclamationTriangle, FaPaperPlane, FaPlus, 
  FaCog, FaRocket, FaBell, FaCode, FaCheckCircle, FaCircle, FaArrowRight, FaHome
} from 'react-icons/fa';
import { analytics, events as eventsApi } from '../services/api';
import { toast } from 'react-toastify';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);
      setError(null);
      
      const [statsRes, eventsRes] = await Promise.all([
        analytics.getOverview(),
        eventsApi.getAll().catch(() => ({ data: [] }))
      ]);
      
      setStats(statsRes.data);
      
      const allEvents = eventsRes.data || [];
      const sorted = allEvents
        .filter(e => e.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setRecentEvents(sorted);
      
      setLastUpdated(new Date());
      
      if (!silent) {
        toast.success('Dashboard data loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAll();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Loading system metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '560px', margin: '40px auto' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--danger-bg)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' }}>
          <FaExclamationTriangle />
        </div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '10px', fontSize: '20px' }}>Unable to Load Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>{error}</p>
        <button onClick={handleRefresh} className="btn">
          <FaSync /> Retry Connection
        </button>
      </div>
    );
  }

  const quickActions = [
    { icon: FaBell, label: 'Create Announcement', path: '/announcements', desc: 'Broadcast to Discord channels' },
    { icon: FaPaperPlane, label: 'Send Embed', path: '/embeds', desc: 'Build & deploy custom embed' },
    { icon: FaCalendar, label: 'Event Management', path: '/events', desc: 'Schedule & manage real-ops' },
    { icon: FaTicketAlt, label: 'Tickets Archive', path: '/tickets', desc: 'Review closed support transcripts' },
    { icon: FaUsers, label: 'Staff Roster', path: '/staff', desc: 'Manage staff roles & assignments' },
    { icon: FaCog, label: 'System Settings', path: '/settings', desc: 'Configure bot preferences' },
  ];

  const getEventStatusClass = (event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    if (event.status === 'cancelled') return 'badge badge-danger';
    if (event.status === 'completed') return 'badge badge-success';
    if (eventDate < now) return 'badge badge-secondary';
    return 'badge badge-primary';
  };

  const getEventStatusLabel = (event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    if (event.status === 'cancelled') return 'Cancelled';
    if (event.status === 'completed') return 'Completed';
    if (eventDate < now) return 'Past';
    return 'Upcoming';
  };

  const resolutionRate = ((stats?.tickets?.closed / (stats?.tickets?.total || 1)) * 100 || 0).toFixed(1);

  return (
    <div className="page-container" style={{ maxWidth: '1500px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-title">
        <div>
          <div className="page-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '11px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>
            RealOps Portal / Overview
          </div>
          <h1>
            <FaHome /> Dashboard Overview
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {lastUpdated && (
            <span style={{ color: 'var(--text-tertiary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-secondary)' }}>
              <FaClock style={{ color: 'var(--primary)' }} />
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={handleRefresh} disabled={refreshing} className="btn">
            <FaSync style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing...' : 'Sync Data'}
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-4">
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats?.tickets?.total || 0}</h3>
            <p>Total Support Tickets</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
              <span className="badge badge-success" style={{ fontSize: '11px' }}>
                {stats?.tickets?.open || 0} Active
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>• {stats?.tickets?.closed || 0} Resolved</span>
            </div>
          </div>
          <div className="stat-icon">
            <FaTicketAlt />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats?.events?.total || 0}</h3>
            <p>Total Events</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
              <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                {stats?.events?.scheduled || 0} Scheduled
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>• {stats?.events?.completed || 0} Done</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
            <FaCalendar />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats?.staff?.total || 0}</h3>
            <p>Active Staff Members</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
              <span className="badge badge-success" style={{ fontSize: '11px' }}>
                Operational
              </span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <FaUsers />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats?.engagement?.totalInteractions || 0}</h3>
            <p>User Interactions</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Real-time bot tracking</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <FaChartLine />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Quick Actions & System Health */}
      <div className="grid grid-2" style={{ marginTop: '24px' }}>
        
        {/* Quick Actions Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <h2>
              <FaRocket /> Quick Actions
            </h2>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '14px',
            flex: 1
          }}>
            {quickActions.map((action, i) => (
              <button 
                key={i}
                onClick={() => navigate(action.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                  color: 'var(--text-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-secondary)';
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0
                }}>
                  <action.icon />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>{action.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* System Health & Status Metrics */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <h2>
              <FaCheckCircle /> System Status & Performance
            </h2>
            <span className="badge badge-success">
              <FaCircle style={{ fontSize: '8px' }} /> All Systems Operational
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center' }}>
            {/* Ticket Resolution Progress */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Ticket Resolution Rate</span>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>{stats?.tickets?.closed || 0} of {stats?.tickets?.total || 0} tickets successfully resolved</p>
                </div>
                <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--success)' }}>{resolutionRate}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min(resolutionRate, 100)}%`, 
                  height: '100%', 
                  background: 'var(--success)',
                  borderRadius: '999px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>

            {/* Event Distribution */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Event Schedule Status</span>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>Active operations vs completed events</p>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>
                  {stats?.events?.scheduled || 0} Active
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <div style={{ flex: 1, background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Scheduled</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#818CF8' }}>{stats?.events?.scheduled || 0}</span>
                </div>
                <div style={{ flex: 1, background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Completed</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--success)' }}>{stats?.events?.completed || 0}</span>
                </div>
              </div>
            </div>

            {/* Bot Status Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--primary-subtle)', padding: '14px 20px', borderRadius: '14px', border: '1px solid var(--primary-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  <FaCode />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>RealOps Discord Bot Service</div>
                  <div style={{ fontSize: '12px', color: '#818CF8' }}>Connected to Gateway API • WebSocket Active</div>
                </div>
              </div>
              <span className="badge badge-success" style={{ padding: '6px 14px' }}>
                Online & Synced
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events Feed Card */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h2>
            <FaCalendar /> Recent & Upcoming Events
          </h2>
          <button 
            onClick={() => navigate('/events')}
            className="btn btn-outline"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <span>View All Events</span>
            <FaArrowRight style={{ fontSize: '11px' }} />
          </button>
        </div>
        
        {recentEvents.length > 0 ? (
          <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Schedule Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((event, i) => (
                  <tr key={event.id || i} style={{ cursor: 'pointer' }} onClick={() => navigate('/events')}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {event.image ? (
                          <img 
                            src={event.image} 
                            alt={event.title} 
                            style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }} 
                          />
                        ) : (
                          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                            <FaCalendar />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>{event.title}</div>
                          {event.description && (
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', maxWidth: '450px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {event.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        {event.date ? new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
                        }) : 'Unscheduled'}
                      </div>
                      {event.time && (
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{event.time} UTC</div>
                      )}
                    </td>
                    <td>
                      <span className={getEventStatusClass(event)}>
                        {getEventStatusLabel(event)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-tertiary)' }}>
            <FaCalendar size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '4px' }}>No Events Found</p>
            <p style={{ fontSize: '13px' }}>Your upcoming scheduled real-ops and server events will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
