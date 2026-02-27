import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import Dashboard from './components/dashboard/Dashboard';
import { LogOut, LayoutDashboard, Database, Info, User, Activity } from 'lucide-react';

import LandingPage from './components/common/LandingPage';
import PublicNavbar from './components/common/PublicNavbar';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" />;
  return children;
};

const Layout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const publicRoutes = ['/', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      {location.pathname === '/' && !user && <PublicNavbar />}
      {!isPublicRoute && location.pathname !== '/dashboard' && user && user.role !== 'super_admin' && user.role !== 'admin' && <Navbar />}
      <div className="main-wrapper">
        {children}
      </div>
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav className="glass" style={{
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      marginBottom: '2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'var(--primary-color)', padding: '0.5rem', borderRadius: '0.5rem' }}>
          <Database size={20} color="white" />
        </div>
        <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Enterprise HRMS</span>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
          <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', textDecoration: 'none' }}>
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
            <User size={18} /> My Profile
          </a>
        </div>

        <div style={{ height: '24px', width: '1px', background: 'var(--glass-border)' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{user.username}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>{(user.role || '').replace('_', ' ')}</p>
          </div>
          <button onClick={() => { logout(); window.location.href = '/'; }} className="btn btn-outline" style={{ padding: '0.5rem' }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

const LoadingScreen = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-dark)' }}>
    <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', color: 'white' }}>
      <Activity className="animate-pulse" style={{ marginRight: '1rem' }} /> Loading HRMS Application...
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </Router>
      <style>{`
        .app-container {
          min-height: 100vh;
          background: var(--bg-dark);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }
        .main-wrapper {
            min-height: calc(100vh - 80px); /* Adjust based on navbar height */
        }
      `}</style>
    </AuthProvider>
  );
}

export default App;
