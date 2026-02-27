import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WebcamCapture from '../common/WebcamCapture';
import axios from 'axios';
import { LogIn, User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const LoginForm = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [sessionToken, setSessionToken] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleCredentialsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const resp = await axios.post(`${API_BASE}/auth/login`, formData);
            const { status, data } = resp.data;
            if (status === 'authorized') {
                login(data, data.access_token);
                navigate('/dashboard');
            } else if (data.requires_facial_verification) {
                setSessionToken(data.session_token);
                setStep(2);
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    const handleFaceVerify = async (imageSrc) => {
        setLoading(true);
        setError('');
        try {
            const fetchResponse = await fetch(imageSrc);
            const blob = await fetchResponse.blob();
            const faceFile = new File([blob], 'face.jpg', { type: 'image/jpeg' });

            const body = new FormData();
            body.append('session_token', sessionToken);
            body.append('face_image', faceFile);

            const resp = await axios.post(`${API_BASE}/auth/verify-face`, body);
            login(resp.data.data, resp.data.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Facial verification failed. Unknown user.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card glass animate-fade-in">
                <header className="login-header">
                    <div className="logo-box">
                        <LogIn className="logo-icon" size={28} />
                    </div>
                    <h2 className="title">HRMS Portal</h2>
                    <p className="subtitle">Secure Enterprise Login</p>
                </header>

                {error && (
                    <div className="error-message animate-shake">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form className="auth-form animate-slide-up" onSubmit={handleCredentialsSubmit}>
                        <div className="input-group-auth">
                            <label><User size={14} /> Username</label>
                            <input
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Enter your username"
                                autoComplete="username"
                            />
                        </div>
                        <div className="input-group-auth">
                            <label><Lock size={14} /> Password</label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                        </div>
                        <button className="btn btn-primary w-full" disabled={loading}>
                            {loading ? 'Verifying...' : 'Next Step'} <ArrowRight size={18} />
                        </button>
                        <footer className="form-footer">
                            <span>Don't have an account?</span>{' '}
                            <a href="/signup" className="link">Sign Up</a>
                        </footer>
                    </form>
                ) : (
                    <div className="auth-form animate-slide-up">
                        <div className="verification-status">
                            <div className="status-badge">
                                <ShieldCheck size={20} />
                                <span>Credentials Verified</span>
                            </div>
                            <p className="status-text">Please look at the camera for biometric verification</p>
                        </div>
                        <WebcamCapture onCapture={handleFaceVerify} />
                        <button
                            className="btn btn-outline w-full mt-6"
                            onClick={() => setStep(1)}
                            disabled={loading}
                        >
                            Back to Credentials
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    background-color: var(--bg-main);
                    background-image: linear-gradient(to bottom right, #f8fafc, #dbeafe);
                    overflow: hidden;
                }

                .login-page .login-card {
                    width: 100%;
                    max-width: 440px;
                    padding: 2.5rem;
                    border-radius: 1.5rem;
                    background: var(--bg-card); /* White */
                    border: 1px solid var(--border-color);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
                    display: flex;
                    flex-direction: column;
                }

                .login-page .login-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .login-page .logo-box {
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, var(--primary-color), #60a5fa);
                    border-radius: 1.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                    box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
                }

                .login-page .logo-icon { color: white; }

                .login-page .title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    letter-spacing: -0.025em;
                    margin-bottom: 0.25rem;
                    color: var(--text-main);
                }

                .login-page .subtitle { color: var(--text-muted); font-size: 0.875rem; }

                .login-page .error-message {
                    background: #fef2f2;
                    border-left: 4px solid var(--danger-color);
                    color: #991b1b;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    margin-bottom: 1.5rem;
                    font-size: 0.875rem;
                }

                .login-page .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .login-page .input-group-auth {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .login-page .input-group-auth label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    color: var(--text-main);
                    font-size: 0.875rem;
                }

                .login-page .input-group-auth input {
                    height: 3rem;
                    font-size: 1rem;
                    padding: 0 1rem;
                    background: #ffffff;
                    border: 1px solid var(--border-color);
                    border-radius: 0.75rem;
                    color: var(--text-main);
                    outline: none;
                    transition: all 0.2s;
                }

                .login-page .input-group-auth input:focus {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                }

                .login-page .w-full { width: 100%; }
                .login-page .mt-6 { margin-top: 1.5rem; }

                .login-page .form-footer {
                    text-align: center;
                    font-size: 0.875rem;
                    color: var(--text-muted);
                }

                .login-page .link {
                    color: var(--primary-color);
                    text-decoration: none;
                    font-weight: 600;
                }

                .login-page .verification-status { text-align: center; margin-bottom: 1.5rem; }

                .login-page .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: #eff6ff; /* Blue 50 */
                    color: var(--primary-color);
                    border-radius: 2rem;
                    font-weight: 700;
                    font-size: 0.875rem;
                    margin-bottom: 0.75rem;
                    border: 1px solid #dbeafe;
                }

                .login-page .status-text { color: var(--text-muted); font-size: 0.875rem; }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .login-page .animate-slide-up {
                    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                .login-page .animate-shake { animation: shake 0.3s ease-in-out; }

                @media (max-width: 480px) {
                    .login-page .login-card { padding: 1.5rem; border-radius: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default LoginForm;
