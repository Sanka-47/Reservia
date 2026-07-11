import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomerPortal } from './components/CustomerPortal';
import { AuthPortal } from './components/AuthPortal';
import { AdminPortal } from './components/AdminPortal';
import { MyBookings } from './components/MyBookings';

const MainApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState<'customer' | 'bookings' | 'auth' | 'admin'>('customer');

  // Handle automatic redirect on login/logout state change
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        setView('admin');
      } else {
        setView('customer');
      }
    } else {
      // If logged out and not on catalog, go back to catalog
      if (view === 'bookings' || view === 'admin') {
        setView('customer');
      }
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setView('customer');
  };

  return (
    <div>
      {/* Sticky Header Navbar */}
      <nav className="navbar" style={{ padding: '16px 40px' }}>
        <div className="nav-logo" onClick={() => setView('customer')} style={{ cursor: 'pointer' }}>
          <span style={{ color: 'var(--primary)', fontSize: '1.8rem' }}>✦</span> Reservia
        </div>

        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Services Catalog Tab (Accessible by everyone) */}
          <button
            className={`btn btn-small ${view === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('customer')}
          >
            🗓 Service Catalog
          </button>

          {/* Bookings Tab (Customers only) */}
          {user && user.role === 'CUSTOMER' && (
            <button
              className={`btn btn-small ${view === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('bookings')}
            >
              📋 My Bookings
            </button>
          )}

          {/* Admin Panel Tab (Admins only) */}
          {user && user.role === 'ADMIN' && (
            <button
              className={`btn btn-small ${view === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('admin')}
            >
              🛡 Admin Portal
            </button>
          )}

          {/* Profile Name & Sign In/Out Control */}
          <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
                  {user.name} {user.role === 'ADMIN' && <span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>(Admin)</span>}
                </span>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={handleLogout}
                  style={{ border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                className={`btn btn-small ${view === 'auth' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setView('auth')}
              >
                🔑 Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ minHeight: '80vh', paddingBottom: '60px' }}>
        {view === 'customer' && (
          <CustomerPortal />
        )}

        {view === 'bookings' && user && user.role === 'CUSTOMER' && (
          <MyBookings />
        )}

        {view === 'auth' && !user && (
          <AuthPortal />
        )}

        {view === 'admin' && user && user.role === 'ADMIN' && (
          <AdminPortal />
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-dark)', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
        &copy; {new Date().getFullYear()} Reservia Booking System. Built with NestJS, React, and TypeORM.
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
