import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { auth } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await auth.emailLogin(email, password);
      if (response.data.success) {
        toast.success('Login successful!');
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
      padding: '20px'
    }}>
      <div className="card" style={{ 
        maxWidth: '420px', 
        width: '100%', 
        padding: '36px 32px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-secondary)',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '16px',
            background: 'var(--primary-subtle)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px auto'
          }}>
            <img 
              src="https://i.ibb.co/FMYFdhk/real-ops-group-logo.png" 
              alt="RealOps" 
              style={{ width: '44px', height: 'auto', display: 'block' }}
            />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
            RealOps Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Enterprise Command & Management System
          </p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>
              Admin Email Address
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@realops.group"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '14px',
                background: 'var(--bg-tertiary)'
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '26px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>
              Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '14px',
                background: 'var(--bg-tertiary)'
              }}
            />
          </div>

          <button 
            type="submit" 
            className="btn" 
            style={{ 
              width: '100%', 
              padding: '13px', 
              fontSize: '15px', 
              fontWeight: '700',
              borderRadius: '10px'
            }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-secondary)', textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)' }}>
          RealOps Discord Infrastructure • Secure Portal
        </div>
      </div>
    </div>
  );
}

export default Login;
