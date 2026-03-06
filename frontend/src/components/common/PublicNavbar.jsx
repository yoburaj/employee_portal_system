import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Database, Menu, X } from 'lucide-react';

const PublicNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="public-nav">
      <div className="container nav-content">
        <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon-container">
            <Database size={18} color="white" strokeWidth={2.5} />
          </div>
          <span className="logo-text">Fusion Staffing</span>
        </div>

        <div className="nav-links desktop-only">
          {!isActive('/login') && (
            <button onClick={() => navigate('/login')} className="btn btn-ghost">Login</button>
          )}
          {!isActive('/signup') && (
            <button onClick={() => navigate('/signup')} className="btn btn-primary">Get Started</button>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu glass animate-fade-in">
          <button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="btn btn-ghost">Login</button>
          <button onClick={() => { navigate('/signup'); setIsMenuOpen(false); }} className="btn btn-primary">Get Started</button>
        </div>
      )}

      <style>{`
                .public-nav {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(226, 232, 240, 0.8);
                    transition: var(--transition-base);
                }

                .public-nav .nav-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    height: 90px;
                    padding: 0 2rem;
                    max-width: 1280px;
                    margin: 0 auto;
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                    transition: var(--transition-base);
                }

                .logo-section:hover {
                    opacity: 0.9;
                }

                .logo-icon-container {
                    background: linear-gradient(135deg, var(--primary-color), #4f46e5);
                    width: 36px;
                    height: 36px;
                    border-radius: 0.6rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 8px 16px -4px rgba(37, 99, 235, 0.4);
                }

                .logo-text {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--text-heading);
                    font-family: var(--font-heading);
                    letter-spacing: -0.03em;
                }

                .nav-links {
                    display: flex;
                    gap: 1.25rem;
                    align-items: center;
                }

                .btn-ghost {
                    background: transparent;
                    color: var(--text-muted);
                    border: none;
                    transition: var(--transition-base);
                    font-weight: 600;
                    cursor: pointer;
                    padding: 0.6rem 1.25rem;
                    font-size: 0.95rem;
                    font-family: var(--font-body);
                    border-radius: var(--radius-full);
                }

                .btn-ghost:hover {
                    color: var(--text-heading);
                    background: #f1f5f9;
                }

                .btn-primary {
                    background: linear-gradient(135deg, var(--primary-color), #4f46e5);
                    color: white;
                    padding: 0.75rem 1.75rem;
                    border-radius: var(--radius-full);
                    font-size: 0.95rem;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: var(--transition-base);
                    box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.3);
                    font-family: var(--font-body);
                    letter-spacing: 0.01em;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
                }

                .mobile-menu-btn {
                    display: none;
                    background: transparent;
                    border: none;
                    color: var(--text-heading);
                    cursor: pointer;
                    padding: 0.5rem;
                }

                .mobile-menu {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid var(--border-color);
                    box-shadow: var(--shadow-lg);
                }

                @media (max-width: 968px) {
                    .desktop-only { display: none; }
                    .mobile-menu-btn { display: block; }
                    .nav-content { padding: 1rem 1.5rem; }
                }
            `}</style>
    </nav>
  );
};

export default PublicNavbar;
