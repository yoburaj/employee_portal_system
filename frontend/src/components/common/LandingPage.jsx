import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Database,
  Shield,
  Users,
  TrendingUp,
  ArrowRight,
  Search,
  Mail,
  Linkedin,
  Twitter,
  Facebook,
  MoreHorizontal
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_employees: 1284, active_users: 84 }); // Placeholder fallback

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
        const response = await axios.get(`${API_BASE}/dashboard/public-stats`);
        if (response.data?.status === 'success') {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load public stats:', err);
      }
    };
    fetchStats();
  }, []);

  const features = [
    {
      icon: <Users className="w-6 h-6 text-indigo-400" />,
      title: "Employee Hub",
      description: "A centralized system for all employee records, documents, and interactions. Simple, secure, and always accessible."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-indigo-400" />,
      title: "Predictive Analytics",
      description: "Leverage AI-driven insights to predict turnover and identify top performers before they even know they're ready for a change."
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-400" />,
      title: "Enterprise Security",
      description: "Military-grade encryption and GDPR compliance out of the box. Your sensitive employee data is safe with us."
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="hero container animate-fade-in">
        <div className="hero-content">
          <div className="release-badge">
            <span className="dot"></span>
            NEW V2.4 RELEASE
          </div>
          <h1>The Next <br />Generation of <span className="highlight">HR <br />Management</span></h1>
          <p className="hero-description">
            Streamline your workforce management with VisionHR. From
            secure onboarding to advanced analytics, manage everything in
            one powerful platform.
          </p>
          <div className="hero-actions">
            <button onClick={() => navigate('/signup')} className="btn btn-primary btn-large">
              Start Your Tour <ArrowRight size={20} />
            </button>
            <button onClick={() => navigate('/login')} className="btn btn-outline btn-large">
              Sign In
            </button>
          </div>

          <div className="trusted-by">
            <div className="avatar-group">
              <img src="https://ui-avatars.com/api/?name=John+Doe&background=random" alt="User" />
              <img src="https://ui-avatars.com/api/?name=Jane+Smith&background=random" alt="User" />
              <img src="https://ui-avatars.com/api/?name=Bob+Wilson&background=random" alt="User" />
              <div className="avatar-more">+2k</div>
            </div>
            <span>Trusted by 2,000+ HR professionals</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="overview-card glass animate-float">
            <div className="card-header">
              <div className="dots">
                <span className="red"></span>
                <span className="yellow"></span>
                <span className="green"></span>
              </div>
              <span className="header-title">System Overview</span>
              <MoreHorizontal size={16} className="text-muted" />
            </div>
            <div className="card-stats">
              <div className="stat">
                <span className="label">ACTIVE EMPLOYEES</span>
                <span className="value">{stats.total_employees.toLocaleString()}</span>
              </div>
              <div className="stat">
                <span className="label">SECURITY LEVEL</span>
                <span className="value text-accent">High</span>
              </div>
            </div>
            <div className="card-progress">
              <div className="progress-label">
                <span>Data Processing</span>
                <span>{Math.min(100, Math.round((stats.active_users / Math.max(stats.total_employees, 1)) * 100))}%</span>
              </div>
              <div className="progress-bar">
                <div className="fill" style={{ width: `${Math.min(100, Math.round((stats.active_users / Math.max(stats.total_employees, 1)) * 100))}%` }}></div>
              </div>
            </div>
            <div className="card-status glass-sub">
              <Shield size={16} className="text-indigo-400" />
              <span>Compliance Check</span>
              <span className="status-badge">STABLE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features container">
        <div className="section-header">
          <h2>Everything you need to scale</h2>
          <p>Our unified platform provides all the tools you need to build, manage, and engage your global workforce from anywhere.</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card glass">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container footer-grid">
          <div className="footer-brand-section">
            <div className="logo-section">
              <div className="logo-icon">
                <Database size={24} color="white" />
              </div>
              <span className="logo-text">VisionHR</span>
            </div>
            <p className="brand-description">
              Empowering the modern workforce with intelligent HR solutions designed for global scale and local impact.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon"><Linkedin size={20} /></a>
              <a href="#" className="social-icon"><Twitter size={20} /></a>
              <a href="#" className="social-icon"><Facebook size={20} /></a>
            </div>
          </div>

          <div className="footer-links">
            <h4>PRODUCT</h4>
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">Security</a>
            <a href="#">Integrations</a>
          </div>

          <div className="footer-links">
            <h4>COMPANY</h4>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
            <a href="#">Press</a>
          </div>

          <div className="footer-links">
            <h4>RESOURCES</h4>
            <a href="#">Blog</a>
            <a href="#">Documentation</a>
            <a href="#">Help Center</a>
            <a href="#">Community</a>
          </div>

          <div className="footer-subscribe">
            <h4>STAY UPDATED</h4>
            <p>Get the latest updates in your inbox.</p>
            <div className="subscribe-form">
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input type="email" placeholder="Email address" />
              </div>
              <button className="btn btn-primary w-full">Subscribe</button>
            </div>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>© 2024 VisionHR Inc. All rights reserved. Built with precision.</p>
          <div className="bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Settings</a>
          </div>
        </div>
      </footer>

      <style>{`
                .landing-page {
                    background-color: var(--bg-main);
                    color: var(--text-main);
                    overflow-x: hidden;
                    font-family: var(--font-body);
                }

                .container {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }

                .hero {
                    padding: 9rem 2rem 6rem;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4rem;
                    align-items: center;
                    position: relative;
                }

                .release-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--primary-light);
                    border: 1px solid rgba(37, 99, 235, 0.15);
                    padding: 0.4rem 1rem;
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 800;
                    font-family: var(--font-heading);
                    color: var(--primary-color);
                    margin-bottom: 2.5rem;
                    letter-spacing: 0.08em;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
                }

                .release-badge .dot {
                    width: 6px;
                    height: 6px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    box-shadow: 0 0 8px rgba(37, 99, 235, 0.4);
                }

                .hero h1 {
                    font-size: 4.5rem;
                    line-height: 1.1;
                    font-weight: 800;
                    margin-bottom: 2rem;
                    letter-spacing: -0.04em;
                    color: var(--text-heading);
                    font-family: var(--font-heading);
                }

                .hero h1 .highlight {
                    color: var(--primary-color);
                }

                .hero-description {
                    font-size: 1.125rem;
                    line-height: 1.6;
                    color: var(--text-muted);
                    max-width: 480px;
                    margin-bottom: 3rem;
                }

                .hero-actions {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 4rem;
                }

                .btn-large {
                    padding: 1rem 2.5rem;
                    font-size: 1.125rem;
                    border-radius: var(--radius-full);
                    font-weight: 700;
                    font-family: var(--font-body);
                }
                
                .btn-outline {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-heading);
                    font-weight: 600;
                    font-family: var(--font-body);
                    transition: var(--transition-base);
                }
                .btn-outline:hover {
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                    background: var(--primary-light);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
                }

                .trusted-by {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .avatar-group {
                    display: flex;
                    align-items: center;
                }

                .avatar-group img, .avatar-more {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 2px solid white;
                    margin-left: -12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .avatar-group img:first-child { margin-left: 0; }

                .avatar-more {
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .trusted-by span {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                /* Hero Visual Card */
                .hero-visual {
                    display: flex;
                    justify-content: flex-end;
                }

                .overview-card {
                    width: 380px;
                    padding: 2rem;
                    border-radius: 1.5rem;
                    background: white;
                    border: 1px solid var(--border-color);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2.5rem;
                }

                .header-title {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    flex: 1;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .dots { display: flex; gap: 6px; }
                .dots span { width: 10px; height: 10px; border-radius: 50%; }
                .dots .red { background: #ef4444; }
                .dots .yellow { background: #f59e0b; }
                .dots .green { background: #10b981; }

                .card-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    margin-bottom: 2.5rem;
                }

                .card-stats .label {
                    display: block;
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }

                .card-stats .value {
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--text-main);
                }

                .text-accent { color: #10b981; }

                .card-progress { margin-bottom: 2rem; }
                .progress-label {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-bottom: 0.75rem;
                    font-weight: 600;
                }

                .progress-bar {
                    height: 8px;
                    background: #f1f5f9;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar .fill {
                    height: 100%;
                    background: linear-gradient(to right, var(--primary-color), #60a5fa);
                    box-shadow: 0 0 10px rgba(37, 99, 235, 0.2);
                }

                .card-status {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    border-radius: 1rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-main);
                    background: #f8fafc;
                    border: 1px solid var(--border-color);
                }

                .status-badge {
                    margin-left: auto;
                    font-size: 0.65rem;
                    font-weight: 700;
                    padding: 0.2rem 0.6rem;
                    background: #ecfdf5;
                    color: #059669;
                    border-radius: 4px;
                    border: 1px solid #d1fae5;
                }

                /* Features Section */
                .features {
                    padding: 10rem 2rem;
                    text-align: center;
                    background: #f8fafc;
                }

                .section-header h2 {
                    font-size: 3rem;
                    font-weight: 800;
                    margin-bottom: 1.5rem;
                    color: var(--text-heading);
                    font-family: var(--font-heading);
                    letter-spacing: -0.03em;
                }

                .section-header p {
                    color: var(--text-muted);
                    font-size: 1.125rem;
                    max-width: 700px;
                    margin: 0 auto 5rem;
                    line-height: 1.6;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                }

                .feature-card {
                    padding: 3rem 2rem;
                    border-radius: 1.5rem;
                    text-align: left;
                    background: white;
                    border: 1px solid var(--border-color);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }

                .feature-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    border-color: #cbd5e1;
                }

                .feature-icon {
                    width: 48px;
                    height: 48px;
                    background: #eff6ff;
                    border-radius: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 2rem;
                    color: var(--primary-color);
                }

                .feature-card h3 {
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    font-weight: 800;
                    color: var(--text-heading);
                    font-family: var(--font-heading);
                    letter-spacing: -0.02em;
                }

                .feature-card p {
                    color: var(--text-muted);
                    line-height: 1.6;
                    font-size: 0.95rem;
                }

                /* Footer */
                .landing-footer {
                    background: white;
                    padding-top: 8rem;
                    border-top: 1px solid var(--border-color);
                }

                .footer-grid {
                    display: grid;
                    grid-template-columns: 2fr repeat(3, 1fr) 1.5fr;
                    gap: 4rem;
                    margin-bottom: 6rem;
                }

                .footer-brand-section .logo-text {
                    color: var(--text-heading);
                    font-family: var(--font-heading);
                    font-weight: 800;
                    font-size: 1.5rem;
                    letter-spacing: -0.02em;
                }

                .logo-icon {
                    background: linear-gradient(135deg, var(--primary-color), #6366f1);
                    padding: 0.6rem;
                    border-radius: var(--radius-md);
                    box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.3);
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .footer-brand-section .brand-description {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin: 1.5rem 0 2rem;
                    max-width: 280px;
                }

                .social-links {
                    display: flex;
                    gap: 1.5rem;
                }

                .social-icon {
                    color: var(--text-muted);
                    transition: color 0.3s ease;
                }

                .social-icon:hover { color: var(--primary-color); }

                .footer-links h4, .footer-subscribe h4 {
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    margin-bottom: 2rem;
                    color: var(--text-main);
                }

                .footer-links {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .footer-links a {
                    color: var(--text-muted);
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: color 0.3s ease;
                }

                .footer-links a:hover { color: var(--primary-color); }

                .footer-subscribe p {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin-bottom: 1.5rem;
                }

                .subscribe-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .input-with-icon {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }

                .subscribe-form input {
                    width: 100%;
                    background: #f8fafc;
                    border: 1px solid var(--border-color);
                    padding: 0.75rem 1rem 0.75rem 3rem;
                    border-radius: 0.5rem;
                    color: var(--text-main);
                    outline: none;
                    transition: all 0.2s;
                }
                
                .subscribe-form input:focus {
                    border-color: var(--primary-color);
                    background: white;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }

                .footer-bottom {
                    padding: 2.5rem 1.5rem;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    background: #f8fafc;
                }

                .bottom-links {
                    display: flex;
                    gap: 2rem;
                }

                .bottom-links a {
                    color: var(--text-muted);
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .bottom-links a:hover { color: var(--primary-color); }

                /* Animations */
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }

                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }

                @media (max-width: 1024px) {
                    .footer-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 3rem;
                    }
                    .footer-brand-section { grid-column: span 2; }
                    .footer-subscribe { grid-column: span 2; }
                }

                @media (max-width: 968px) {
                    .hero {
                        grid-template-columns: 1fr;
                        text-align: center;
                        padding-top: 6rem;
                    }
                    .hero-description { margin: 0 auto 3rem; }
                    .hero-actions { justify-content: center; }
                    .hero-visual { display: none; }
                    .features-grid { grid-template-columns: 1fr; }
                    .footer-bottom { flex-direction: column; gap: 1.5rem; text-align: center; }
                    .hero h1 { font-size: 3rem; }
                }
            `}</style>
    </div>
  );
};

export default LandingPage;
