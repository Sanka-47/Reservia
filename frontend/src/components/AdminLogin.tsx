import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [googleToken, setGoogleToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitRealToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleToken.trim()) return;

    setError('');
    setLoading(true);
    try {
      await login(googleToken, mode);
    } catch (err: any) {
      setError(err.response?.data?.message?.[0] || 'Authentication failed. Invalid Google Token.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevSandboxLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Use the developer mock token that bypasses Google Auth verification
      await login('dev-admin-mock-token', mode);
    } catch (err: any) {
      // If mock login fails because the user already exists during "register"
      // let's try logging in instead!
      if (mode === 'register' && err.response?.status === 409) {
        try {
          await login('dev-admin-mock-token', 'login');
          return;
        } catch (retryErr: any) {
          setError(retryErr.response?.data?.message?.[0] || 'Mock login failed.');
        }
      }
      setError(err.response?.data?.message?.[0] || 'Mock authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '16px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
        
        {/* Card Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            {mode === 'login' ? 'Admin Portal Login' : 'Create Admin Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {mode === 'login' 
              ? 'Sign in to manage services and bookings' 
              : 'Register a new administrator profile'}
          </p>
        </div>

        {error && (
          <div className="badge-cancelled" style={{ width: '100%', padding: '10px', borderRadius: '8px', marginBottom: '20px', display: 'block', fontSize: '0.85rem', textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Option 1: Developer Sandbox (Recommended) */}
        <div style={{ marginBottom: '24px' }}>
          <button 
            type="button" 
            className="btn btn-primary" 
            style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent), #a21caf)', boxShadow: '0 4px 14px rgba(217, 70, 239, 0.3)' }}
            disabled={loading}
            onClick={handleDevSandboxLogin}
          >
            ⚡ Launch Developer Sandbox Login
          </button>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dark)', textAlign: 'center', marginTop: '6px' }}>
            Bypasses Google verification to let you test immediately.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '24px 0', color: 'var(--text-dark)' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
          <span style={{ fontSize: '0.8rem' }}>OR VERIFY GOOGLE ID TOKEN</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
        </div>

        {/* Option 2: Verify Real Google ID Token */}
        <form onSubmit={handleSubmitRealToken}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Google ID Token (credential)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Paste eyJhbGciOiJSUzI1Ni..." 
              required
              value={googleToken}
              onChange={e => setGoogleToken(e.target.value)}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-secondary" 
            style={{ width: '100%' }}
            disabled={loading || !googleToken.trim()}
          >
            {loading ? 'Verifying...' : `${mode === 'login' ? 'Login' : 'Register'} with Token`}
          </button>
        </form>

        {/* Footer Toggle */}
        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Need an account? " : "Already have an account? "}
          <button 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Register here' : 'Login here'}
          </button>
        </div>

      </div>
    </div>
  );
};
