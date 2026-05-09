import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTicketAlt, FaCalendar, FaUsers, FaClock, FaDownload, FaCheckCircle } from 'react-icons/fa';
import { analytics } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#00b894', '#5865F2', '#fdcb6e', '#ED4245'];

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
      toast.error('Failed to load analytics');
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
    a.download = `analytics-report-${new Date().toISOString()}.json`;
    a.click();
    toast.success('Report exported');
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const ticketStatusData = [
    { name: 'Open', value: stats?.tickets?.open || 0 },
    { name: 'Pending', value: stats?.tickets?.pending || 0 },
    { name: 'Closed', value: stats?.tickets?.closed || 0 }
  ];

  const eventStatusData = [
    { name: 'Scheduled', value: stats?.events?.scheduled || 0, color: '#5865F2' },
    { name: 'Completed', value: stats?.events?.completed || 0, color: '#00b894' }
  ];

  // Compute event completion rate
  const totalEvents = stats?.events?.total || 0;
  const completedEvents = stats?.events?.completed || 0;
  const eventCompletionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

  const eventCompletionData = [
    { name: 'Completed', value: completedEvents },
    { name: 'Remaining', value: Math.max(0, totalEvents - completedEvents) }
  ];

  // Ticket breakdown
  const openTickets = stats?.tickets?.open || 0;
  const pendingTickets = stats?.tickets?.pending || 0;
  const closedTickets = stats?.tickets?.closed || 0;
  const totalTickets = stats?.tickets?.total || 1; // avoid division by zero

  return (
    <div className="page-container">
      <div className="page-title">
        <h1><FaDownload /> Analytics & Reports</h1>
        <button className="btn" onClick={exportReport}>
          <FaDownload /> Export Report
        </button>
      </div>

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
            <h3>{stats?.tickets?.avgResponseTime || 0}m</h3>
            <p>Avg Response</p>
          </div>
          <div className="stat-icon">
            <FaClock />
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '25px' }}>
        <div className="card">
          <h2>Ticket Status Distribution</h2>
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
              <Tooltip contentStyle={{ background: '#23272A', border: '1px solid #2C2F33', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Event Status Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2F33" />
              <XAxis dataKey="name" stroke="#b9bbbe" />
              <YAxis stroke="#b9bbbe" />
              <Tooltip contentStyle={{ background: '#23272A', border: '1px solid #2C2F33', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#00b894" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event Completion Rate + Ticket Resolution Summary */}
      <div className="grid grid-2" style={{ marginTop: '25px' }}>
        
        {/* Event Completion Rate */}
        <div className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaCheckCircle style={{ color: '#00b894' }} />
            Event Completion Rate
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginTop: '10px' }}>
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={eventCompletionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill="#00b894" />
                  <Cell fill="#40444b" />
                </Pie>
                <Tooltip contentStyle={{ background: '#23272A', border: '1px solid #2C2F33', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div>
              <div style={{ fontSize: '42px', fontWeight: '700', color: '#00b894' }}>
                {eventCompletionRate}%
              </div>
              <div style={{ color: '#b9bbbe', fontSize: '14px', marginTop: '4px' }}>
                {completedEvents} of {totalEvents} events completed
              </div>
              <div style={{ marginTop: '16px' }}>
                {eventStatusData.map((item, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '6px',
                    fontSize: '13px',
                    color: '#dcddde'
                  }}>
                    <div style={{ 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '3px', 
                      backgroundColor: item.color || COLORS[i] 
                    }} />
                    {item.name}: {item.value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Resolution Summary */}
        <div className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaTicketAlt style={{ color: '#5865F2' }} />
            Ticket Resolution Summary
          </h2>
          <div style={{ marginTop: '20px' }}>
            {[
              { label: 'Open', value: openTickets, color: '#00b894', pct: Math.round((openTickets / totalTickets) * 100) },
              { label: 'Pending', value: pendingTickets, color: '#fdcb6e', pct: Math.round((pendingTickets / totalTickets) * 100) },
              { label: 'Closed', value: closedTickets, color: '#5865F2', pct: Math.round((closedTickets / totalTickets) * 100) },
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
                    <span style={{ color: '#dcddde', fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
                  </div>
                  <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>
                    {item.value} ({item.pct}%)
                  </span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#23272A', 
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
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#23272A',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#b9bbbe', fontSize: '13px' }}>Resolution Rate</span>
              <span style={{ 
                fontSize: '22px', 
                fontWeight: '700', 
                color: '#00b894' 
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
