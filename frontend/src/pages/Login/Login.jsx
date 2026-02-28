import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WebcamCapture from '../../components/common/WebcamCapture';
import axios from 'axios';
import { LogIn, User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import './Login.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const Login = () => {
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
            <div className={`login-card glass animate-fade-in ${step === 2 ? 'split-layout' : ''}`}>
                {step === 1 ? (
                    <>
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
                    </>
                ) : (
                    <>
                        <div className="login-info-column animate-fade-in">
                            <header className="login-header">
                                <div className="logo-box">
                                    <LogIn className="logo-icon" size={28} />
                                </div>
                                <h2 className="title">Identity Verify</h2>
                                <p className="subtitle">Secure Biometrics Check</p>
                            </header>

                            <div className="verification-status">
                                <div className="status-badge">
                                    <ShieldCheck size={20} />
                                    <span>Credentials Verified</span>
                                </div>
                                <p className="status-text">We need to quickly verify your identity to grant secure access. Please look at the camera.</p>
                            </div>

                            {error && (
                                <div className="error-message animate-shake">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="auth-form animate-slide-up camera-column">
                            <WebcamCapture onCapture={handleFaceVerify} />
                            <button
                                className="btn btn-outline w-full mt-6"
                                onClick={() => setStep(1)}
                                disabled={loading}
                            >
                                Back to Credentials
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;
