import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaCalendar, FaUsers, FaChartLine, FaSync, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { analytics } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);
      setError(null);
      
      const response = await analytics.getOverview();
      setStats(response.data);
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
    fetchStats();
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

      {/* Event Status Card */}
      <div style={{ marginTop: '30px' }}>
        <div style={{
          backgroundColor: '#2C2F33',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #40444b',
          maxWidth: '600px'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#ffffff',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaCalendar style={{ color: '#00b894' }} />
            Event Status
          </h2>
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#23272A',
              borderRadius: '8px',
              marginBottom: '12px',
              border: '1px solid #40444b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#5865F2' 
                }}></div>
                <span style={{ color: '#dcddde', fontSize: '14px', fontWeight: '500' }}>Scheduled</span>
              </div>
              <span style={{
                backgroundColor: '#5865F220',
                color: '#5865F2',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {stats?.events?.scheduled || 0}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#23272A',
              borderRadius: '8px',
              marginBottom: '12px',
              border: '1px solid #40444b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#fdcb6e' 
                }}></div>
                <span style={{ color: '#dcddde', fontSize: '14px', fontWeight: '500' }}>Upcoming</span>
              </div>
              <span style={{
                backgroundColor: '#fdcb6e20',
                color: '#fdcb6e',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {stats?.events?.upcoming || 0}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#23272A',
              borderRadius: '8px',
              marginBottom: '12px',
              border: '1px solid #40444b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#00b894' 
                }}></div>
                <span style={{ color: '#dcddde', fontSize: '14px', fontWeight: '500' }}>Completed</span>
              </div>
              <span style={{
                backgroundColor: '#00b89420',
                color: '#00b894',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {stats?.events?.completed || 0}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#23272A',
              borderRadius: '8px',
              border: '1px solid #40444b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#ed4245' 
                }}></div>
                <span style={{ color: '#dcddde', fontSize: '14px', fontWeight: '500' }}>Cancelled</span>
              </div>
              <span style={{
                backgroundColor: '#ed424520',
                color: '#ed4245',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {stats?.events?.cancelled || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div style={{
        backgroundColor: '#2C2F33',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #40444b',
        marginTop: '30px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#ffffff',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaChartLine style={{ color: '#e17055' }} />
            Activity Overview (Last 7 Days)
          </h2>
          <div style={{
            backgroundColor: '#5865F220',
            color: '#5865F2',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            Total: {stats?.engagement?.last7Days?.reduce((sum, day) => sum + day.count, 0) || 0} interactions
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={stats?.engagement?.last7Days || []} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#40444b" />
            <XAxis 
              dataKey="date" 
              stroke="#b9bbbe" 
              style={{ fontSize: '12px' }}
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#b9bbbe" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                background: '#23272A', 
                border: '1px solid #40444b', 
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
              labelStyle={{ color: '#ffffff', fontWeight: '600', marginBottom: '8px' }}
              itemStyle={{ color: '#00b894' }}
              labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'short', 
                day: 'numeric' 
              })}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#00b894" 
              strokeWidth={3}
              dot={{ fill: '#00b894', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#00b894', stroke: '#23272A', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-3" style={{ marginTop: '30px', gap: '24px' }}>
        <div style={{
          backgroundColor: '#2C2F33',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #40444b',
          textAlign: 'center'
        }}>
          <FaCheckCircle size={32} style={{ color: '#00b894', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
            {((stats?.tickets?.closed / stats?.tickets?.total) * 100 || 0).toFixed(1)}%
          </h3>
          <p style={{ color: '#b9bbbe', fontSize: '14px', margin: 0 }}>Resolution Rate</p>
        </div>

        <div style={{
          backgroundColor: '#2C2F33',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #40444b',
          textAlign: 'center'
        }}>
          <FaUsers size={32} style={{ color: '#fdcb6e', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
            {stats?.staff?.active || 0}
          </h3>
          <p style={{ color: '#b9bbbe', fontSize: '14px', margin: 0 }}>Active Staff</p>
        </div>

        <div style={{
          backgroundColor: '#2C2F33',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #40444b',
          textAlign: 'center'
        }}>
          <FaCalendar size={32} style={{ color: '#5865F2', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
            {stats?.events?.upcoming || 0}
          </h3>
          <p style={{ color: '#b9bbbe', fontSize: '14px', margin: 0 }}>Upcoming Events</p>
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
