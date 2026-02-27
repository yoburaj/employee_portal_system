import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Database, Menu, X } from 'lucide-react';

const PublicNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const hideNavbarPaths = ['/login', '/signup'];
  if (hideNavbarPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="public-nav">
      <div className="container nav-content">
        <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="menu-trigger">
            <Menu size={20} color="white" />
          </div>
          <span className="logo-text">VisionHR</span>
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
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid var(--border-color);
                }

                .nav-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .menu-trigger {
                    background: var(--primary-color);
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .menu-trigger svg {
                    stroke: white;
                }

                .logo-text {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--text-main);
                    letter-spacing: -0.01em;
                }

                .nav-links {
                    display: flex;
                    gap: 1.5rem;
                    align-items: center;
                }

                .btn-ghost {
                    background: transparent;
                    color: var(--text-muted);
                    border: none;
                    transition: all 0.2s ease;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 0.5rem 1rem;
                }

                .btn-ghost:hover {
                    color: var(--primary-color);
                    background: #f1f5f9;
                    border-radius: 0.5rem;
                }

                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                    padding: 0.6rem 1.25rem;
                    border-radius: 0.6rem;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
                }

                .btn-primary:hover {
                    background: var(--primary-hover);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
                }

                .mobile-menu-btn {
                    display: none;
                    background: transparent;
                    border: none;
                    color: var(--text-main);
                    cursor: pointer;
                }

                .mobile-menu {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    background: white;
                    border-bottom: 1px solid var(--border-color);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                @media (max-width: 968px) {
                    .desktop-only { display: none; }
                    .mobile-menu-btn { display: block; }
                }
            `}</style>
    </nav>
  );
};

export default PublicNavbar;
