import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AuthPortal: React.FC = () => {
  const { login, register } = useAuth();
  const [roleMode, setRoleMode] = useState<'customer' | 'admin'>('customer');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Registration fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Other');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (roleMode === 'customer' && authMode === 'register') {
        // Register Customer
        await register({
          username,
          password,
          name,
          email,
          gender,
          phoneNumber: phone,
          dob,
        });
      } else {
        // Log in Customer or Admin
        await login(username, password);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (role: 'customer' | 'admin') => {
    setRoleMode(role);
    setAuthMode('login'); // Default back to login on tab change
    setError('');
    setUsername('');
    setPassword('');
    setName('');
    setEmail('');
    setGender('Other');
    setPhone('');
    setDob('');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '24px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '36px' }}>

        {/* Portal Role Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '28px' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              color: roleMode === 'customer' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 'bold',
              borderBottom: roleMode === 'customer' ? '2px solid var(--primary)' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => handleTabChange('customer')}
          >
            👤 Customer Area
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              color: roleMode === 'admin' ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: 'bold',
              borderBottom: roleMode === 'admin' ? '2px solid var(--accent)' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => handleTabChange('admin')}
          >
            🛡 Admin Sign In
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
            {roleMode === 'admin'
              ? 'Administrator Portal'
              : authMode === 'login' ? 'Sign In to Reservia' : 'Create Customer Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {roleMode === 'admin'
              ? 'Enter system credentials to manage services and bookings'
              : authMode === 'login'
                ? 'Sign in to schedule and view your appointments'
                : 'Join us to access our booking calendar'}
          </p>
        </div>

        {error && (
          <div className="badge-cancelled" style={{ width: '100%', padding: '10px', borderRadius: '8px', marginBottom: '20px', display: 'block', fontSize: '0.85rem', textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Tip for Admin login */}
        {roleMode === 'admin' && (
          <div className="badge-pending" style={{ width: '100%', padding: '10px', borderRadius: '8px', marginBottom: '20px', display: 'block', fontSize: '0.85rem', textAlign: 'center' }}>
            💡 Tip: Use predefined credentials: <strong>admin</strong> / <strong>admin123</strong>
          </div>
        )}

        {/* Dynamic Auth Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder={roleMode === 'admin' ? 'admin' : 'john_doe'}
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Customer Registration Fields */}
          {roleMode === 'customer' && authMode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="john@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-input"
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    disabled={loading}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1234567890"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              marginTop: '16px',
              background: roleMode === 'admin' ? 'linear-gradient(135deg, var(--accent), #a21caf)' : undefined,
              boxShadow: roleMode === 'admin' ? '0 4px 14px rgba(217, 70, 239, 0.3)' : undefined
            }}
            disabled={loading}
          >
            {loading
              ? 'Processing...'
              : roleMode === 'admin'
                ? 'Sign In as Admin'
                : authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle between Register and Login for customers */}
        {roleMode === 'customer' && (
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {authMode === 'login' ? "Need a customer account? " : "Already have an account? "}
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            >
              {authMode === 'login' ? 'Register here' : 'Sign in here'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
