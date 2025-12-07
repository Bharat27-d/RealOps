import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTicketAlt, FaCalendar, FaUsers, FaClock, FaDownload } from 'react-icons/fa';
import { analytics } from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
    { name: 'Scheduled', value: stats?.events?.scheduled || 0 },
    { name: 'Upcoming', value: stats?.events?.upcoming || 0 },
    { name: 'Completed', value: stats?.events?.completed || 0 },
    { name: 'Cancelled', value: stats?.events?.cancelled || 0 }
  ];

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
              <Bar dataKey="value" fill="#00b894" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginTop: '25px' }}>
        <h2>Activity Trend (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={stats?.engagement?.last7Days || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2C2F33" />
            <XAxis dataKey="date" stroke="#b9bbbe" />
            <YAxis stroke="#b9bbbe" />
            <Tooltip contentStyle={{ background: '#23272A', border: '1px solid #2C2F33', borderRadius: '8px' }} />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#00b894" strokeWidth={3} name="Interactions" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ marginTop: '25px' }}>
        <h2>Ticket Performance (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={stats?.tickets?.dailyTickets || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2C2F33" />
            <XAxis dataKey="date" stroke="#b9bbbe" />
            <YAxis stroke="#b9bbbe" />
            <Tooltip contentStyle={{ background: '#23272A', border: '1px solid #2C2F33', borderRadius: '8px' }} />
            <Legend />
            <Bar dataKey="count" fill="#5865F2" name="Tickets Created" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-3" style={{ marginTop: '25px' }}>
        <div className="card">
          <h3>Staff Status</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Active</span>
              <span className="badge badge-success">{stats?.staff?.active || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Inactive</span>
              <span className="badge badge-warning">{stats?.staff?.inactive || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>On Leave</span>
              <span className="badge badge-info">{stats?.staff?.onLeave || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Quick Stats</h3>
          <div style={{ marginTop: '15px' }}>
            <p style={{ marginBottom: '10px' }}>
              <strong>Total Interactions:</strong> {stats?.engagement?.totalInteractions || 0}
            </p>
            <p style={{ marginBottom: '10px' }}>
              <strong>Upcoming Events:</strong> {stats?.events?.upcoming || 0}
            </p>
            <p>
              <strong>Open Tickets:</strong> {stats?.tickets?.open || 0}
            </p>
          </div>
        </div>

        <div className="card">
          <h3>Performance</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ fontSize: '12px', color: '#b9bbbe', marginBottom: '5px' }}>Avg Response Time</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#00b894' }}>
                {stats?.tickets?.avgResponseTime || 0} min
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#b9bbbe', marginBottom: '5px' }}>Ticket Resolution Rate</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#00b894' }}>
                {stats?.tickets?.total > 0 
                  ? Math.round((stats?.tickets?.closed / stats?.tickets?.total) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
