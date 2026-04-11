import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTicketAlt, FaCalendar, FaUsers, FaChartLine, FaSync, FaClock, FaExclamationTriangle, FaPaperPlane, FaPlus, FaCog, FaRocket, FaBell, FaCode, FaCheckCircle, FaCircle } from 'react-icons/fa';
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
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAll(true);
    }, 30000);
    return () => clearInterval(interval);
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
      
      // Get upcoming + recent events sorted by date
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
        <p style={{ color: '#FFD700', fontSize: '16px' }}>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center" style={{ padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
        <FaExclamationTriangle size={64} style={{ color: '#e74c3c', marginBottom: '20px' }} />
        <h2 style={{ color: '#FFD700', marginBottom: '12px' }}>Failed to Load Dashboard</h2>
        <p style={{ color: '#888', marginBottom: '24px' }}>{error}</p>
        <button onClick={handleRefresh} className="btn">
          <FaSync /> Retry
        </button>
      </div>
    );
  }

  const quickActions = [
    { icon: FaBell, label: 'Create Announcement', path: '/events', color: '#5865F2', desc: 'Send event announcement' },
    { icon: FaPaperPlane, label: 'Send Embed', path: '/embeds', color: '#00b894', desc: 'Build & send Discord embed' },
    { icon: FaPlus, label: 'Scenario Pack', path: '/events', color: '#fdcb6e', desc: 'Create scenario embeds' },
    { icon: FaTicketAlt, label: 'View Tickets', path: '/tickets', color: '#e17055', desc: 'Manage support tickets' },
    { icon: FaUsers, label: 'Staff Panel', path: '/staff', color: '#a29bfe', desc: 'Manage staff members' },
    { icon: FaCog, label: 'Settings', path: '/settings', color: '#636e72', desc: 'Bot & dashboard settings' },
  ];

  const getEventStatusColor = (event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    if (event.status === 'cancelled') return '#ed4245';
    if (event.status === 'completed') return '#00b894';
    if (eventDate < now) return '#b9bbbe';
    return '#5865F2';
  };

  const getEventStatusLabel = (event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    if (event.status === 'cancelled') return 'Cancelled';
    if (event.status === 'completed') return 'Completed';
    if (eventDate < now) return 'Past';
    return 'Upcoming';
  };

  return (
    <div className="page-container" style={{ maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header with refresh button */}
      <div className="page-title">
        <div>
          <h1>Dashboard Overview</h1>
          {lastUpdated && (
            <p style={{ color: '#000', fontSize: '13px', margin: '5px 0 0 0', opacity: 0.7 }}>
              <FaClock style={{ marginRight: '6px' }} />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="btn">
          <FaSync style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-4">
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats?.tickets?.total || 0}</h3>
            <p>Total Tickets</p>
          </div>
          <div className="stat-icon">
            <FaTicketAlt />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats?.events?.total || 0}</h3>
            <p>Total Events</p>
          </div>
          <div className="stat-icon">
            <FaCalendar />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats?.staff?.total || 0}</h3>
            <p>Staff Members</p>
          </div>
          <div className="stat-icon">
            <FaUsers />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats?.engagement?.totalInteractions || 0}</h3>
            <p>Total Interactions</p>
          </div>
          <div className="stat-icon">
            <FaChartLine />
          </div>
        </div>
      </div>

      {/* Quick Actions + Event Status Row */}
      <div className="grid grid-2" style={{ marginTop: '30px', gap: '24px' }}>
        
        {/* Quick Actions */}
        <div style={{
          backgroundColor: '#2C2F33',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #40444b'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#ffffff',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaRocket style={{ color: '#5865F2' }} />
            Quick Actions
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '12px' 
          }}>
            {quickActions.map((action, i) => (
              <button 
                key={i}
                onClick={() => navigate(action.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  backgroundColor: '#23272A',
                  border: '1px solid #40444b',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  color: '#dcddde'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = action.color;
                  e.currentTarget.style.backgroundColor = '#2C2F33';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#40444b';
                  e.currentTarget.style.backgroundColor = '#23272A';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: `${action.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <action.icon style={{ color: action.color, fontSize: '16px' }} />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#ffffff' }}>{action.label}</div>
                  <div style={{ fontSize: '11px', color: '#72767d', marginTop: '2px' }}>{action.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Event Status Card */}
        <div style={{
          backgroundColor: '#2C2F33',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #40444b'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#ffffff',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaCalendar style={{ color: '#00b894' }} />
            Event Status
          </h2>
          <div>
            {[
              { label: 'Scheduled', value: stats?.events?.scheduled || 0, color: '#5865F2' },
              { label: 'Upcoming', value: stats?.events?.upcoming || 0, color: '#fdcb6e' },
              { label: 'Completed', value: stats?.events?.completed || 0, color: '#00b894' },
              { label: 'Cancelled', value: stats?.events?.cancelled || 0, color: '#ed4245' },
            ].map((item, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '14px 16px',
                backgroundColor: '#23272A',
                borderRadius: '8px',
                marginBottom: i < 3 ? '10px' : '0',
                border: '1px solid #40444b'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: item.color 
                  }}></div>
                  <span style={{ color: '#dcddde', fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
                </div>
                <span style={{
                  backgroundColor: `${item.color}20`,
                  color: item.color,
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Events Feed */}
      <div style={{
        backgroundColor: '#2C2F33',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #40444b',
        marginTop: '24px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#ffffff',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaCalendar style={{ color: '#fdcb6e' }} />
            Recent Events
          </h2>
          <button 
            onClick={() => navigate('/events')}
            style={{
              backgroundColor: '#5865F220',
              color: '#5865F2',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#5865F240'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#5865F220'}
          >
            View All →
          </button>
        </div>
        
        {recentEvents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentEvents.map((event, i) => (
              <div key={event.id || i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '14px 16px',
                backgroundColor: '#23272A',
                borderRadius: '10px',
                border: '1px solid #40444b',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#5865F2'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#40444b'}
              >
                {event.image ? (
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '8px', 
                      objectFit: 'cover',
                      flexShrink: 0
                    }} 
                  />
                ) : (
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    backgroundColor: `${getEventStatusColor(event)}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FaCalendar style={{ color: getEventStatusColor(event), fontSize: '18px' }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    fontSize: '14px', 
                    color: '#ffffff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {event.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#72767d', marginTop: '4px' }}>
                    {event.date ? new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
                    }) : 'No date'}
                    {event.time && ` • ${event.time}`}
                  </div>
                </div>
                <span style={{
                  backgroundColor: `${getEventStatusColor(event)}20`,
                  color: getEventStatusColor(event),
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {getEventStatusLabel(event)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            color: '#72767d' 
          }}>
            <FaCalendar size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>No events found. Create your first event!</p>
          </div>
        )}
      </div>

      {/* Server Overview */}
      <div className="grid grid-3" style={{ marginTop: '24px', gap: '16px' }}>
        <div style={{
          backgroundColor: '#2C2F33',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #40444b',
          textAlign: 'center'
        }}>
          <FaCheckCircle size={28} style={{ color: '#00b894', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '26px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
            {((stats?.tickets?.closed / stats?.tickets?.total) * 100 || 0).toFixed(1)}%
          </h3>
          <p style={{ color: '#b9bbbe', fontSize: '13px', margin: 0 }}>Ticket Resolution Rate</p>
        </div>

        <div style={{
          backgroundColor: '#2C2F33',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #40444b',
          textAlign: 'center'
        }}>
          <FaCircle size={28} style={{ color: '#00b894', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '26px', fontWeight: '700', color: '#00b894', marginBottom: '6px' }}>
            Online
          </h3>
          <p style={{ color: '#b9bbbe', fontSize: '13px', margin: 0 }}>Bot Status</p>
        </div>

        <div style={{
          backgroundColor: '#2C2F33',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #40444b',
          textAlign: 'center'
        }}>
          <FaCode size={28} style={{ color: '#a29bfe', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '26px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
            {stats?.tickets?.open || 0}
          </h3>
          <p style={{ color: '#b9bbbe', fontSize: '13px', margin: 0 }}>Open Tickets</p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
