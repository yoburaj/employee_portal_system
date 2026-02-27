import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WebcamCapture from '../common/WebcamCapture';
import axios from 'axios';
import { UserPlus, User, Mail, Lock, Building, Briefcase, ChevronRight, ChevronLeft, Camera, CheckCircle2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const SignupForm = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [departments, setDepartments] = useState([]);
    const [skills, setSkills] = useState([]);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        department_id: '',
        role: 'employee',
        skills: []
    });

    const [userId, setUserId] = useState(null);
    const [capturedCount, setCapturedCount] = useState(0);
    const [capturedImages, setCapturedImages] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptResp, skillResp] = await Promise.all([
                    axios.get(`${API_BASE}/admin/departments`),
                    axios.get(`${API_BASE}/admin/skills`)
                ]);
                setDepartments(deptResp.data);
                setSkills(skillResp.data);
            } catch (err) {
                console.error("Failed to load metadata", err);
            }
        };
        fetchData();
    }, []);

    const handleBasicSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const resp = await axios.post(`${API_BASE}/auth/signup`, {
                ...formData,
                department_id: formData.department_id ? parseInt(formData.department_id) : null,
                skills: formData.skills.map(s => ({ skill_id: parseInt(s), proficiency_level: 'intermediate' }))
            });
            setUserId(resp.data.id);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFaceCapture = (imageSrc) => {
        if (capturedCount < 50) {
            setCapturedImages(prev => [...prev, imageSrc]);
            setCapturedCount(prev => prev + 1);
        }
    };

    const handleEnrollSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            if (capturedImages.length === 0) {
                setStep(3);
                return;
            }
            const body = new FormData();
            body.append('user_id', userId);
            for (let i = 0; i < capturedImages.length; i++) {
                const blob = await (await fetch(capturedImages[i])).blob();
                body.append('face_images', blob, `face_${i}.jpg`);
            }
            await axios.post(`${API_BASE}/auth/facial-enroll`, body);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.detail || 'Facial enrollment failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-card glass animate-fade-in">
                <header className="auth-header">
                    <div className="logo-box">
                        <UserPlus className="logo-icon" size={step === 2 ? 22 : 28} />
                    </div>
                    <h2 className="title">{step === 2 ? 'Biometric Sync' : step === 3 ? 'Success' : 'Create Account'}</h2>
                    {step === 1 && <p className="subtitle">Join the Enterprise HRMS</p>}
                </header>

                {error && <div className="error-message animate-shake">{error}</div>}

                {step === 1 ? (
                    <form className="auth-form-signup animate-slide-up" onSubmit={handleBasicSubmit}>
                        <div className="form-grid-signup">
                            <div className="input-group-signup">
                                <label>First Name</label>
                                <input type="text" required value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} placeholder="John" />
                            </div>
                            <div className="input-group-signup">
                                <label>Last Name</label>
                                <input type="text" required value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} placeholder="Doe" />
                            </div>
                        </div>
                        <div className="form-grid-signup">
                            <div className="input-group-signup">
                                <label>Username</label>
                                <input type="text" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} placeholder="johndoe" />
                            </div>
                            <div className="input-group-signup">
                                <label>Password</label>
                                <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
                            </div>
                        </div>
                        <div className="input-group-signup">
                            <label>Email Address</label>
                            <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@company.com" />
                        </div>
                        <div className="form-grid-signup">
                            <div className="input-group-signup">
                                <label>Department</label>
                                <select value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })}>
                                    <option value="">Select Dept</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="input-group-signup">
                                <label>Role</label>
                                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                        </div>
                        <button className="btn btn-primary w-full" disabled={loading}>
                            {loading ? 'Creating...' : 'Continue to Enrollment'} <ChevronRight size={18} />
                        </button>
                        <footer className="form-footer">
                            <span>Already have an account?</span>{' '}
                            <a href="/login" className="link">Log In</a>
                        </footer>
                    </form>
                ) : step === 2 ? (
                    <div className="auth-form-signup animate-slide-up">
                        <div className="enrollment-status">
                            <div className="progress-info">
                                <span className="progress-label">Biometric Progress</span>
                                <span className="progress-count">{capturedCount}/50</span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{ width: `${(capturedCount / 50) * 100}%` }} />
                            </div>
                        </div>

                        <WebcamCapture
                            onCapture={handleFaceCapture}
                            isEnrolling={true}
                            autoStop={capturedCount >= 50}
                        />

                        <div className="button-group mt-6">
                            <button className="btn btn-outline" onClick={() => setStep(1)} disabled={loading}>Back</button>
                            <button
                                className="btn btn-primary flex-1"
                                disabled={capturedCount < 50 || loading}
                                onClick={handleEnrollSubmit}
                            >
                                {loading ? 'Processing AI Data...' : 'Complete Enrollment'}
                            </button>
                        </div>
                        {loading && (
                            <p style={{
                                textAlign: 'center',
                                fontSize: '0.7rem',
                                color: 'var(--primary-color)',
                                marginTop: '1rem',
                                animation: 'pulse 2s infinite'
                            }}>
                                Training biometric model. Please wait, this may take up to 30 seconds...
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="auth-form-signup animate-slide-up success-view">
                        <div className="success-icon-wrapper">
                            <CheckCircle2 className="success-icon" size={48} />
                        </div>
                        <h3 className="success-title">Profile Sync Complete</h3>
                        <p className="success-text">Your facial biometric data has been processed and saved. You can now sign in using your credentials.</p>
                        <button className="btn btn-primary w-full" onClick={() => navigate('/login')}>
                            Go back to Login
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .signup-page {
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    background-color: var(--bg-main);
                    background-image: linear-gradient(to bottom right, #f8fafc, #dbeafe);
                    overflow: hidden;
                }

                .signup-page .signup-card {
                    width: 100%;
                    max-width: 460px;
                    padding: 1.5rem;
                    border-radius: 1.5rem;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
                    display: flex;
                    flex-direction: column;
                }

                .signup-page .auth-header {
                    text-align: center;
                    margin-bottom: 1rem;
                }

                .signup-page .logo-box {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, var(--primary-color), #60a5fa);
                    border-radius: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 0.75rem;
                    box-shadow: 0 6px 15px rgba(37, 99, 235, 0.4);
                }

                .signup-page .logo-icon { color: white; }

                .signup-page .title {
                    font-size: 1.35rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    margin-bottom: 0.15rem;
                    color: var(--text-main);
                }

                .signup-page .subtitle {
                    color: var(--text-muted);
                    font-size: 0.75rem;
                }

                .signup-page .auth-form-signup {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .signup-page .form-grid-signup {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                }

                .signup-page .input-group-signup label {
                    display: block;
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: var(--text-main);
                    text-transform: uppercase;
                    margin-bottom: 0.25rem;
                    letter-spacing: 0.05em;
                }

                .signup-page .input-group-signup input, .signup-page .input-group-signup select {
                    height: 2.25rem;
                    padding: 0 0.75rem;
                    background: #ffffff;
                    border: 1px solid var(--border-color);
                    border-radius: 0.625rem;
                    color: var(--text-main);
                    width: 100%;
                    outline: none;
                    font-size: 0.8125rem;
                    transition: all 0.2s;
                }

                .signup-page .input-group-signup input:focus {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                }

                .signup-page .error-message {
                    background: #fef2f2;
                    border-left: 3px solid var(--danger-color);
                    color: #991b1b;
                    padding: 0.625rem;
                    border-radius: 0.5rem;
                    margin-bottom: 0.75rem;
                    font-size: 0.75rem;
                }

                .signup-page .w-full { width: 100%; }
                .signup-page .mt-6 { margin-top: 0.5rem; }

                .signup-page .form-footer {
                    text-align: center;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-top: 0.25rem;
                }

                .signup-page .link {
                    color: var(--primary-color);
                    text-decoration: none;
                    font-weight: 600;
                }

                .signup-page .enrollment-status {
                    margin-bottom: 0.75rem;
                }

                .signup-page .progress-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    margin-bottom: 0.35rem;
                }

                .signup-page .progress-track {
                    height: 4px;
                    background: #e2e8f0;
                    border-radius: 10px;
                    overflow: hidden;
                }

                .signup-page .progress-fill {
                    height: 100%;
                    background: var(--primary-color);
                    box-shadow: 0 0 10px rgba(37, 99, 235, 0.5);
                    transition: width 0.3s ease;
                }

                .signup-page .button-group {
                    display: flex;
                    gap: 0.75rem;
                }

                .signup-page .success-view {
                    text-align: center;
                    padding: 0.5rem 0;
                }

                .signup-page .success-icon-wrapper {
                    width: 56px;
                    height: 56px;
                    background: rgba(16, 185, 129, 0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                    color: #10b981;
                }

                .signup-page .success-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    color: var(--text-main);
                }

                .signup-page .success-text {
                    color: var(--text-muted);
                    font-size: 0.75rem;
                    line-height: 1.5;
                    margin-bottom: 1.5rem;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .signup-page .animate-slide-up {
                    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                .signup-page .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }

                @media (max-width: 480px) {
                    .signup-page .signup-card { padding: 1.25rem; }
                    .signup-page .form-grid-signup { grid-template-columns: 1fr; gap: 0.5rem; }
                    .signup-page { overflow-y: auto; align-items: flex-start; }
                }

                @media (max-height: 600px) {
                    .signup-page .signup-card { transform: scale(0.9); transform-origin: top center; }
                }
            `}</style>
        </div>
    );
};

export default SignupForm;
