import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminLogin } from './components/AdminLogin';
import { AdminPortal } from './components/AdminPortal';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'customer' | 'admin'>('customer');

  return (
    <div>
      {/* Sticky Header Navbar */}
      <nav className="navbar">
        <div className="nav-logo" onClick={() => setView('customer')}>
          <span style={{ color: 'var(--primary)', fontSize: '1.8rem' }}>✦</span> Reservia
        </div>
        
        <div className="nav-links">
          <button 
            className={`btn btn-small ${view === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('customer')}
          >
            🗓 Book Appointment
          </button>
          
          <button 
            className={`btn btn-small ${view === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('admin')}
          >
            🛡 Admin Dashboard {user && '👤'}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ minHeight: '80vh', paddingBottom: '60px' }}>
        {view === 'customer' ? (
          <CustomerPortal />
        ) : user ? (
          <AdminPortal />
        ) : (
          <AdminLogin />
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
