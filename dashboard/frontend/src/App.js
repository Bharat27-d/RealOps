import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import './theme.css';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Tickets from './pages/Tickets';
import Staff from './pages/Staff';
import Embeds from './pages/Embeds';
import Panels from './pages/Panels';
import Analytics from './pages/Analytics';
import Partnerships from './pages/Partnerships';
import Feedback from './pages/Feedback';
import Roles from './pages/Roles';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';
import Login from './pages/Login';
import CustomCommands from './pages/CustomCommands';

import { auth } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await auth.getUser();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <div className="dashboard">
        <Sidebar user={user} onLogout={handleLogout} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/embeds" element={<Embeds />} />
            <Route path="/panels" element={<Panels />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/partnerships" element={<Partnerships />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/custom-commands" element={<CustomCommands />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </Router>
  );
}

export default App;
