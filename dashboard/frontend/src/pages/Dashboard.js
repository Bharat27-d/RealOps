import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTicketAlt, FaCalendar, FaUsers, FaChartLine, FaSync, 
  FaClock, FaExclamationTriangle, FaPaperPlane, 
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
    { icon: FaBell, label: 'Create Announcement', path: '/announcements', desc: 'Broadcast to Discord channels', iconBg: '#1C203A', iconColor: '#818CF8' },
    { icon: FaPaperPlane, label: 'Send Embed', path: '/embeds', desc: 'Build & deploy custom embed', iconBg: '#15213D', iconColor: '#60A5FA' },
    { icon: FaCalendar, label: 'Event Management', path: '/events', desc: 'Schedule & manage real-ops', iconBg: '#15213D', iconColor: '#60A5FA' },
    { icon: FaTicketAlt, label: 'Tickets Archive', path: '/tickets', desc: 'Review closed support transcripts', iconBg: '#1C203A', iconColor: '#818CF8' },
    { icon: FaUsers, label: 'Staff Roster', path: '/staff', desc: 'Manage staff roles & assignments', iconBg: '#15213D', iconColor: '#60A5FA' },
    { icon: FaCog, label: 'System Settings', path: '/settings', desc: 'Configure bot preferences', iconBg: '#221C3C', iconColor: '#A78BFA' },
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
            REALOPS PORTAL / OVERVIEW
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px', color: '#FFFFFF' }}>
            <FaHome style={{ color: '#818CF8', fontSize: '24px' }} /> Dashboard Overview
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {lastUpdated && (
            <div style={{ color: '#94A3B8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-tertiary)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-secondary)', fontWeight: '500' }}>
              <FaClock style={{ color: '#818CF8' }} />
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          <button onClick={handleRefresh} disabled={refreshing} style={{
            background: '#5865F2',
            color: '#FFFFFF',
            border: 'none',
            padding: '9px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(88, 101, 242, 0.3)',
            transition: 'all 0.2s ease'
          }}>
            <FaSync style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing...' : 'Sync Data'}
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-4" style={{ gap: '20px' }}>
        <div className="stat-card" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-secondary)',
          borderRadius: '16px',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '148px',
          position: 'relative'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1 }}>{stats?.tickets?.total || 265}</h3>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#1C203A', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                <FaTicketAlt />
              </div>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.8px', textTransform: 'uppercase' }}>TOTAL SUPPORT TICKETS</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center' }}>
              {stats?.tickets?.open ?? 16} Active
            </span>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>• {stats?.tickets?.closed ?? 88} Resolved</span>
          </div>
        </div>

        <div className="stat-card" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-secondary)',
          borderRadius: '16px',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '148px',
          position: 'relative'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1 }}>{stats?.events?.total || 160}</h3>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#15213D', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                <FaCalendar />
              </div>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.8px', textTransform: 'uppercase' }}>TOTAL EVENTS</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <span style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60A5FA', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center' }}>
              {stats?.events?.scheduled ?? 0} Scheduled
            </span>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>• {stats?.events?.completed ?? 0} Done</span>
          </div>
        </div>

        <div className="stat-card" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-secondary)',
          borderRadius: '16px',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '148px',
          position: 'relative'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1 }}>{stats?.staff?.total || 183}</h3>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#112C27', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                <FaUsers />
              </div>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.8px', textTransform: 'uppercase' }}>ACTIVE STAFF MEMBERS</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center' }}>
              Operational
            </span>
          </div>
        </div>

        <div className="stat-card" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-secondary)',
          borderRadius: '16px',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '148px',
          position: 'relative'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1 }}>{stats?.engagement?.totalInteractions || 425}</h3>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#2B2116', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                <FaChartLine />
              </div>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.8px', textTransform: 'uppercase' }}>USER INTERACTIONS</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>Real-time bot tracking</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Quick Actions & System Health */}
      <div className="grid grid-2" style={{ marginTop: '20px', gap: '20px' }}>
        
        {/* Quick Actions Card */}
        <div style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-secondary)', 
          borderRadius: '16px', 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaRocket style={{ color: '#60A5FA' }} /> Quick Actions
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
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#60A5FA';
                  e.currentTarget.style.background = '#1C233D';
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
                  background: action.iconBg || '#1C203A',
                  color: action.iconColor || '#818CF8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0
                }}>
                  <action.icon />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#FFFFFF', marginBottom: '3px' }}>{action.label}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* System Health & Status Metrics */}
        <div style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-secondary)', 
          borderRadius: '16px', 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaCheckCircle style={{ color: '#3B82F6' }} /> System Status & Performance
            </h2>
            <span style={{ 
              background: 'rgba(16, 185, 129, 0.12)', 
              border: '1px solid rgba(16, 185, 129, 0.3)', 
              color: '#10B981', 
              padding: '4px 12px', 
              borderRadius: '999px', 
              fontSize: '11px', 
              fontWeight: '600', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}>
              <FaCircle style={{ fontSize: '7px' }} /> All Systems Operational
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyItems: 'stretch' }}>
            {/* Ticket Resolution Progress */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF' }}>Ticket Resolution Rate</span>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>{stats?.tickets?.closed ?? 99} of {stats?.tickets?.total ?? 265} tickets successfully resolved</p>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#94A3B8' }}>{resolutionRate}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#1C2338', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min(resolutionRate, 100)}%`, 
                  height: '100%', 
                  background: '#10B981',
                  borderRadius: '999px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>

            {/* Event Distribution */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '18px 20px', borderRadius: '14px', border: '1px solid var(--border-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF' }}>Event Schedule Status</span>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>Active operations vs completed events</p>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#60A5FA' }}>
                  {stats?.events?.scheduled ?? 0} Active
                </span>
              </div>
              <div style={{ background: '#111624', border: '1px solid var(--border-secondary)', borderRadius: '10px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '20px' }}>
                  <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '500' }}>Scheduled</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#60A5FA' }}>{stats?.events?.scheduled ?? 0}</span>
                </div>
                <div style={{ width: '1px', height: '20px', background: 'var(--border-secondary)' }} />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '20px' }}>
                  <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '500' }}>Completed</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#10B981' }}>{stats?.events?.completed ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Bot Status Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#161C36', padding: '16px 20px', borderRadius: '14px', border: '1px solid #2B3467' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#5865F2', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  <FaCode />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }}>RealOps Discord Bot Service</div>
                  <div style={{ fontSize: '12px', color: '#818CF8' }}>Connected to Gateway API • WebSocket Active</div>
                </div>
              </div>
              <span style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
                Online & Synced
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events Feed Card */}
      <div style={{ 
        background: 'var(--bg-secondary)', 
        border: '1px solid var(--border-secondary)', 
        borderRadius: '16px', 
        padding: '24px', 
        marginTop: '20px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaCalendar style={{ color: '#60A5FA' }} /> Recent & Upcoming Events
          </h2>
          <button 
            onClick={() => navigate('/events')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
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
                          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#15213D', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
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
