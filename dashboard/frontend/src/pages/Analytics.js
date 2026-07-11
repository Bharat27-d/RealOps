import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTicketAlt, FaCalendar, FaUsers, FaClock, FaDownload, FaCheckCircle, FaChartBar } from 'react-icons/fa';
import { analytics } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EF4444'];

function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analytics.getOverview();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load analytics metrics');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const report = JSON.stringify(stats, null, 2);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `realops-analytics-report-${new Date().toISOString()}.json`;
    a.click();
    toast.success('Analytics report exported successfully');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Aggregating system analytics and metrics...</p>
      </div>
    );
  }

  const ticketStatusData = [
    { name: 'Open', value: stats?.tickets?.open || 0 },
    { name: 'Pending', value: stats?.tickets?.pending || 0 },
    { name: 'Closed', value: stats?.tickets?.closed || 0 }
  ];

  const eventStatusData = [
    { name: 'Scheduled', value: stats?.events?.scheduled || 0, color: '#6366F1' },
    { name: 'Completed', value: stats?.events?.completed || 0, color: '#10B981' }
  ];

  const totalEvents = stats?.events?.total || 0;
  const completedEvents = stats?.events?.completed || 0;
  const eventCompletionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

  const eventCompletionData = [
    { name: 'Completed', value: completedEvents },
    { name: 'Remaining', value: Math.max(0, totalEvents - completedEvents) }
  ];

  const openTickets = stats?.tickets?.open || 0;
  const pendingTickets = stats?.tickets?.pending || 0;
  const closedTickets = stats?.tickets?.closed || 0;
  const totalTickets = stats?.tickets?.total || 1;

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-title">
        <div>
          <div className="page-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '11px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>
            RealOps Portal / Intelligence
          </div>
          <h1>
            <FaChartBar /> System Analytics & Reports
          </h1>
        </div>
        <button className="btn" onClick={exportReport} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '600' }}>
          <FaDownload /> Export Report JSON
        </button>
      </div>

      <div className="grid grid-4" style={{ gap: '20px' }}>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats?.tickets?.total || 0}</h3>
            <p>Total Tickets</p>
          </div>
          <div className="stat-icon" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <FaTicketAlt />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats?.events?.total || 0}</h3>
            <p>Total Events</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
            <FaCalendar />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats?.staff?.total || 0}</h3>
            <p>Staff Members</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
            <FaUsers />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats?.tickets?.avgResponseTime || 0}m</h3>
            <p>Avg Response Time</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
            <FaClock />
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '24px', gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h2>Ticket Status Distribution</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ticketStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {ticketStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: '10px', color: 'var(--text-primary)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Event Status Overview</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: '10px', color: 'var(--text-primary)' }} />
              <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event Completion Rate + Ticket Resolution Summary */}
      <div className="grid grid-2" style={{ marginTop: '24px', gap: '24px' }}>
        
        {/* Event Completion Rate */}
        <div className="card">
          <div className="card-header">
            <h2>
              <FaCheckCircle style={{ color: '#10B981' }} /> Event Completion Rate
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginTop: '12px' }}>
            <ResponsiveContainer width="50%" height={210}>
              <PieChart>
                <Pie
                  data={eventCompletionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={84}
                  fill="#8884d8"
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill="#10B981" />
                  <Cell fill="var(--bg-tertiary)" />
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: '10px', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div>
              <div style={{ fontSize: '46px', fontWeight: '800', color: '#10B981', letterSpacing: '-1px' }}>
                {eventCompletionRate}%
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px', fontWeight: '500' }}>
                {completedEvents} of {totalEvents} total events finalized
              </div>
              <div style={{ marginTop: '18px' }}>
                {eventStatusData.map((item, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    marginBottom: '8px',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    fontWeight: '500'
                  }}>
                    <div style={{ 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '3px', 
                      backgroundColor: item.color || COLORS[i] 
                    }} />
                    {item.name}: <strong style={{ marginLeft: '4px' }}>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Resolution Summary */}
        <div className="card">
          <div className="card-header">
            <h2>
              <FaTicketAlt style={{ color: 'var(--primary)' }} /> Ticket Resolution Summary
            </h2>
          </div>
          <div style={{ marginTop: '16px' }}>
            {[
              { label: 'Open Tickets', value: openTickets, color: '#10B981', pct: Math.round((openTickets / totalTickets) * 100) },
              { label: 'Pending Review', value: pendingTickets, color: '#F59E0B', pct: Math.round((pendingTickets / totalTickets) * 100) },
              { label: 'Closed / Resolved', value: closedTickets, color: '#6366F1', pct: Math.round((closedTickets / totalTickets) * 100) },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '3px', 
                      backgroundColor: item.color 
                    }} />
                    <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600' }}>{item.label}</span>
                  </div>
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '700' }}>
                    {item.value} <span style={{ color: 'var(--text-secondary)', fontWeight: '400', fontSize: '13px' }}>({item.pct}%)</span>
                  </span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-secondary)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${item.pct}%`, 
                    height: '100%', 
                    backgroundColor: item.color,
                    borderRadius: '4px',
                    transition: 'width 0.6s ease'
                  }} />
                </div>
              </div>
            ))}
            
            <div style={{
              marginTop: '26px',
              padding: '16px 20px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-secondary)',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Overall Resolution Efficiency</span>
              <span style={{ 
                fontSize: '24px', 
                fontWeight: '800', 
                color: '#10B981' 
              }}>
                {stats?.tickets?.total > 0 
                  ? Math.round((closedTickets / stats.tickets.total) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
