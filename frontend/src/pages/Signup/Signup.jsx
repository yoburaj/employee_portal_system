import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WebcamCapture from '../../components/common/WebcamCapture';
import axios from 'axios';
import { UserPlus, User, Mail, Lock, Building, Briefcase, ChevronRight, ChevronLeft, Camera, CheckCircle2 } from 'lucide-react';
import './Signup.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const Signup = () => {
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
        </div>
    );
};

export default Signup;
