import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard, User, Calendar, FileText, Settings,
    Bell, LogOut, Info, ShieldCheck, Mail, Phone,
    ChevronRight, Rocket, Edit, Clock, Smartphone,
    HelpCircle, Menu, Activity, ChevronLeft, Camera, X, CheckCircle2,
    AlertCircle, Briefcase, Globe, Hash
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const EmployeeDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };
    const [profile, setProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [attendanceLogs, setAttendanceLogs] = useState([]);

    // Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showSkillsModal, setShowSkillsModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        job_title: ''
    });

    // Get current date context for realistic data
    const now = new Date();
    const currentMonthName = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const [profileResp, logsResp] = await Promise.all([
                    axios.get(`${API_BASE}/employees/me`, { headers }),
                    axios.get(`${API_BASE}/admin/auth-logs`, { headers })
                ]);
                setProfile(profileResp.data);
                setAttendanceLogs(logsResp.data);
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        // Simulate API call
        setTimeout(() => {
            setProfile(prev => ({
                ...prev,
                first_name: editData.first_name,
                last_name: editData.last_name,
                phone_number: editData.phone_number,
                job_title: editData.job_title
            }));
            setSaving(false);
            setShowEditModal(false);
        }, 1500);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Synchronizing Employee Profile...</p>
            </div>
        );
    }

    const skillsLevel = profile?.skills?.length > 4 ? "Expert" : profile?.skills?.length > 2 ? "Advanced" : "Intermediate";
    const skillPercentile = profile?.skills?.length > 4 ? "Top 5%" : profile?.skills?.length > 2 ? "Top 15%" : "Top 40%";

    const renderDashboard = () => (
        <div className="employee-dashboard-view animate-fade-in">
            <div className="stats-row">
                <div className="stat-card glass">
                    <div className="stat-icon-box blue"><Calendar size={20} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Working Days</p>
                        <p className="stat-value">{now.getDate() - 1} / {new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}</p>
                        <span className="stat-trend positive">+1 since yesterday</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <div className="stat-icon-box purple"><Clock size={20} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Avg. Login Time</p>
                        <p className="stat-value">09:04 AM</p>
                        <span className="stat-trend">Highly Punctual</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <div className="stat-icon-box green"><ShieldCheck size={20} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Recognition Score</p>
                        <p className="stat-value">99.8%</p>
                        <span className="stat-trend positive">Perfect Week</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <div className="stat-icon-box orange"><Rocket size={20} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Skills Level</p>
                        <p className="stat-value">{skillsLevel}</p>
                        <span className="stat-trend positive">{skillPercentile}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="card glass attendance-overview">
                    <div className="card-header-with-icon">
                        <div className="header-icon-box"><Calendar size={20} /></div>
                        <h3>ATTENDANCE OVERVIEW</h3>
                    </div>
                    <div className="attendance-chart-placeholder">
                        <div className="chart-bar-container">
                            {[88, 92, 45, 95, 82, 0, 0].map((h, i) => (
                                <div key={i} className="chart-item">
                                    <div className="bar" style={{ height: `${h}%`, opacity: i > (now.getDay() - 1) ? 0.3 : 1 }}></div>
                                    <span className="day-label">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                                </div>
                            ))}
                        </div>
                        <p className="chart-desc">Your attendance consistency for the current week.</p>
                    </div>
                </div>

                <div className="card glass recent-announcements">
                    <div className="card-header-with-icon">
                        <div className="header-icon-box purple"><Bell size={20} /></div>
                        <h3>ANNOUNCEMENTS</h3>
                    </div>
                    <div className="announcement-list">
                        <div className="announcement-item">
                            <div className="ann-dot active"></div>
                            <div className="ann-content">
                                <p className="ann-title">Biometric System Update</p>
                                <p className="ann-time">Just Now</p>
                            </div>
                        </div>
                        <div className="announcement-item">
                            <div className="ann-dot"></div>
                            <div className="ann-content">
                                <p className="ann-title">Monthly Townhall - {currentMonthName}</p>
                                <p className="ann-time">2 hours ago</p>
                            </div>
                        </div>
                        <div className="announcement-item">
                            <div className="ann-dot"></div>
                            <div className="ann-content">
                                <p className="ann-title">New Security Protocol Active</p>
                                <p className="ann-time">Yesterday</p>
                            </div>
                        </div>
                    </div>
                    <button className="view-all-btn">View All Announcements</button>
                </div>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="employee-profile-view animate-fade-in">
            <div className="profile-header-card glass">
                <div className="profile-main-info">
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar">
                            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                            <div className="status-indicator-dot"></div>
                        </div>
                    </div>
                    <div className="profile-text-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h2>{profile?.first_name} {profile?.last_name}</h2>
                            <span className="active-badge">ACTIVE</span>
                        </div>
                        <p className="job-title">{profile?.job_title || 'Professional Staff'}</p>
                        <div className="contact-pills">
                            <div className="contact-pill">
                                <Mail size={14} />
                                <span>{user?.email}</span>
                            </div>
                            <div className="contact-pill">
                                <Phone size={14} />
                                <span>{profile?.phone_number || '+91' + Math.floor(7000000000 + Math.random() * 2999999999)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="btn btn-primary edit-profile-btn" onClick={() => {
                    setEditData({
                        first_name: profile?.first_name || '',
                        last_name: profile?.last_name || '',
                        email: user?.email || '',
                        phone_number: profile?.phone_number || '',
                        job_title: profile?.job_title || ''
                    });
                    setShowEditModal(true);
                }}>
                    <Edit size={16} /> Edit Profile
                </button>
            </div>

            <div className="content-grid">
                <div className="card glass">
                    <div className="card-header-with-icon">
                        <div className="header-icon-box"><Info size={20} /></div>
                        <h3>WORK INFORMATION</h3>
                    </div>
                    <div className="info-list">
                        <InfoItem label="EMPLOYEE ID" value={profile?.employee_id || "VHR-" + (1000 + (profile?.id || 1))} />
                        <InfoItem label="DEPARTMENT" value={profile?.department?.name || 'Operations'} />
                        <InfoItem label="JOINED DATE" value={profile?.hire_date ? new Date(profile.hire_date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }) : 'Jan 15, 2024'} />
                        <InfoItem label="REPORTING MANAGER" value={profile?.department?.manager_name || "Sarah Jenkins"} />
                    </div>
                </div>

                <div className="security-activity-column">
                    <div className="card glass security-card">
                        <div className="card-header-with-icon">
                            <div className="header-icon-box blue"><ShieldCheck size={20} /></div>
                            <h3>SECURITY ACTIVITY</h3>
                            <button className="view-history-link" onClick={() => setShowHistoryModal(true)}>View History</button>
                        </div>
                        <div className="security-item">
                            <div className="security-icon-box success"><ShieldCheck size={18} /></div>
                            <div className="security-details">
                                <p className="label">Last Biometric Login</p>
                                <p className="value">Today, {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                <div className="security-pills">
                                    <span className="security-pill">99.2% Face Match</span>
                                    <span className="security-pill">Secured Entry</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card glass security-card">
                        <div className="security-item">
                            <div className="security-icon-box gray"><Clock size={18} /></div>
                            <div className="security-details">
                                <p className="label">Password Updated</p>
                                <p className="value">Jan 28, 2026, 02:45 PM</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card glass skills-card">
                    <div className="card-header-with-icon">
                        <div className="header-icon-box purple"><Rocket size={20} /></div>
                        <h3>MY SKILLS</h3>
                        <button className="update-btn" onClick={() => setShowSkillsModal(true)}>+ UPDATE</button>
                    </div>
                    <div className="skills-content">
                        {profile?.skills?.length > 0 ? (
                            <div className="skills-grid">
                                {profile.skills.map(s => (
                                    <div key={s.skill.id} className="skill-chip">
                                        <span>{s.skill.name}</span>
                                        <span className="proficiency">{s.proficiency_level}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-skills">
                                <div className="empty-icon-circle">
                                    <Rocket size={32} />
                                </div>
                                <p className="empty-title">No skills added yet</p>
                                <p className="empty-desc">Highlight your professional expertise to your team members.</p>
                                <button className="get-started-link" onClick={() => setShowSkillsModal(true)}>Get started now <ChevronRight size={14} /></button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const uniquePresentDates = new Set(
        attendanceLogs
            .filter(log => log.login_status === 'success')
            .map(log => new Date(log.login_attempt_time).toDateString())
    );

    const lateDays = attendanceLogs.filter(log => {
        const time = new Date(log.login_attempt_time);
        return log.login_status === 'success' && (time.getHours() > 9 || (time.getHours() === 9 && time.getMinutes() > 30));
    }).length;

    const renderAttendance = () => (
        <div className="employee-attendance-view animate-fade-in">
            <div className="attendance-header-stats">
                <div className="card glass mini-stat">
                    <span className="label">Total Present</span>
                    <span className="value">{uniquePresentDates.size} Days</span>
                </div>
                <div className="card glass mini-stat">
                    <span className="label">Late Arrivals</span>
                    <span className="value text-orange">{lateDays} Days</span>
                </div>
                <div className="card glass mini-stat">
                    <span className="label">Leave Balance</span>
                    <span className="value text-green">14 Days</span>
                </div>
            </div>

            <div className="attendance-grid">
                <div className="card glass calendar-section">
                    <div className="card-header-with-icon">
                        <div className="header-icon-box"><Calendar size={20} /></div>
                        <h3>ATTENDANCE CALENDAR</h3>
                        <div className="calendar-nav">
                            <button className="icon-btn"><ChevronLeft size={16} /></button>
                            <span>{currentMonthName} {currentYear}</span>
                            <button className="icon-btn"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                    <div className="calendar-grid">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="calendar-day-label">{day}</div>
                        ))}
                        {Array.from({ length: 31 }).map((_, i) => {
                            const isToday = (i + 1) === now.getDate();
                            const isPast = (i + 1) < now.getDate();
                            const isWeekend = (i + 1) % 7 === 6 || (i + 1) % 7 === 0;
                            return (
                                <div key={i} className={`calendar-date ${isToday ? 'active' : ''} ${i + 1 > 28 ? 'next-month' : ''}`}>
                                    {i + 1 > 28 ? i - 27 : i + 1}
                                    {isPast && !isWeekend && i + 1 <= 28 && <div className="status-dot present"></div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card glass logs-section">
                    <div className="card-header-with-icon">
                        <div className="header-icon-box"><Clock size={20} /></div>
                        <h3>DAILY LOGS</h3>
                    </div>
                    <div className="logs-list">
                        {attendanceLogs.length > 0 ? attendanceLogs.slice(0, 10).map((log, i) => (
                            <div key={i} className="log-item">
                                <div className="log-date">{new Date(log.login_attempt_time).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}</div>
                                <div className="log-times">
                                    <span className="time">In: {new Date(log.login_attempt_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="time">Confidence: {log.facial_confidence}%</span>
                                </div>
                                <div className={`log-status ${log.login_status === 'success' ? 'present' : 'absent'}`}>
                                    {log.login_status === 'success' ? 'Verified' : 'Failed'}
                                </div>
                            </div>
                        )) : (
                            <div className="log-item" style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
                                No biometric logs found
                            </div>
                        )}
                    </div>
                    <button className="view-all-btn">Download Report</button>
                </div>
            </div>
        </div>
    );

    const renderDocuments = () => (
        <div className="employee-documents-view animate-fade-in">
            <div className="documents-grid">
                {[
                    { name: `${profile?.first_name || 'My'} - Offer Letter.pdf`, size: '1.2 MB', date: 'Jan 01, 2024', icon: <FileText size={24} /> },
                    { name: `${profile?.first_name || 'My'} - Identity Proof.jpg`, size: '2.4 MB', date: 'Jan 05, 2024', icon: <Camera size={24} /> },
                    { name: `${profile?.first_name || 'My'} - Contract Agreement.pdf`, size: '3.1 MB', date: 'Jan 01, 2024', icon: <FileText size={24} /> },
                    { name: `VisionHRMS - Company Policy.pdf`, size: '0.8 MB', date: 'Feb 01, 2026', icon: <ShieldCheck size={24} /> },
                ].map((doc, i) => (
                    <div key={i} className="card glass document-card">
                        <div className="doc-icon">{doc.icon}</div>
                        <div className="doc-info">
                            <p className="doc-name">{doc.name}</p>
                            <p className="doc-meta">{doc.size} • {doc.date}</p>
                        </div>
                        <button className="icon-btn download"><ChevronRight size={20} /></button>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="employee-portal">
            <aside className="portal-sidebar glass">
                <div className="sidebar-logo">
                    <div className="logo-box">
                        <Rocket size={20} color="white" />
                    </div>
                    <span>Fusion Staffing</span>
                </div>

                <nav className="portal-nav">
                    <PortalNavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <PortalNavItem
                        icon={<User size={20} />}
                        label="My Profile"
                        active={activeTab === 'profile'}
                        onClick={() => setActiveTab('profile')}
                    />
                    <PortalNavItem
                        icon={<Calendar size={20} />}
                        label="Attendance"
                        active={activeTab === 'attendance'}
                        onClick={() => setActiveTab('attendance')}
                    />
                    <PortalNavItem
                        icon={<FileText size={20} />}
                        label="Documents"
                        active={activeTab === 'documents'}
                        onClick={() => setActiveTab('documents')}
                    />
                </nav>

                <div className="sidebar-footer">
                    <div className="help-center">
                        <HelpCircle size={18} />
                        <span>Help Center</span>
                    </div>
                    <div className="logout-btn" onClick={handleLogout} style={{ cursor: 'pointer', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                        <LogOut size={18} color="#ef4444" />
                        <span style={{ color: '#ef4444' }}>Logout</span>
                    </div>
                </div>
            </aside>

            <main className="portal-main">
                <header className="portal-header">
                    <div className="breadcrumb">
                        <span>Employee Self-Service</span>
                        <ChevronRight size={14} />
                        <span className="current">{activeTab === 'profile' ? 'Profile Details' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
                    </div>
                    <div className="header-actions">
                        <button className="icon-btn"><Bell size={20} /></button>
                        <button className="icon-btn"><Settings size={20} /></button>
                    </div>
                </header>

                <div className="portal-content">
                    {activeTab === 'profile' ? renderProfile() :
                        activeTab === 'dashboard' ? renderDashboard() :
                            activeTab === 'attendance' ? renderAttendance() :
                                activeTab === 'documents' ? renderDocuments() : null
                    }
                </div>
            </main>

            {/* Modals */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content glass animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="header-title-group">
                                <div className="header-icon-box blue"><User size={20} /></div>
                                <div>
                                    <h3>Edit Profile</h3>
                                    <p>Update your personal and professional information</p>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}><X size={20} /></button>
                        </div>
                        <form className="modal-form" onSubmit={handleSaveProfile}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label><User size={14} /> First Name</label>
                                    <input
                                        type="text"
                                        value={editData.first_name}
                                        onChange={e => setEditData({ ...editData, first_name: e.target.value })}
                                        placeholder="First Name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label><User size={14} /> Last Name</label>
                                    <input
                                        type="text"
                                        value={editData.last_name}
                                        onChange={e => setEditData({ ...editData, last_name: e.target.value })}
                                        placeholder="Last Name"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label><Mail size={14} /> Email Address</label>
                                    <input
                                        type="email"
                                        value={editData.email}
                                        onChange={e => setEditData({ ...editData, email: e.target.value })}
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Phone size={14} /> Phone Number</label>
                                    <input
                                        type="text"
                                        value={editData.phone_number}
                                        onChange={e => setEditData({ ...editData, phone_number: e.target.value })}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Briefcase size={14} /> Job Title</label>
                                    <input
                                        type="text"
                                        value={editData.job_title}
                                        onChange={e => setEditData({ ...editData, job_title: e.target.value })}
                                        placeholder="Software Engineer"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showHistoryModal && (
                <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
                    <div className="modal-content glass animate-scale-up history-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="header-title-group">
                                <div className="header-icon-box purple"><Clock size={20} /></div>
                                <div>
                                    <h3>Security History</h3>
                                    <p>Review your recent account activity and logins</p>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setShowHistoryModal(false)}><X size={20} /></button>
                        </div>
                        <div className="history-list">
                            {[
                                { event: 'Biometric Login', time: 'Today, 03:27 PM', device: 'iPhone 15 Pro', status: 'Success' },
                                { event: 'Password Update', time: 'Jan 28, 2026, 02:45 PM', device: 'Windows 11, Chrome', status: 'Completed' },
                                { event: 'Portal Access', time: 'Jan 27, 2026, 09:12 AM', device: 'Linux, Firefox', status: 'Authorized' },
                                { event: 'Profile Edit', time: 'Jan 25, 2026, 11:30 AM', device: 'MacOS, Safari', status: 'Saved' },
                                { event: 'System Logout', time: 'Jan 24, 2026, 06:05 PM', device: 'iPhone 15 Pro', status: 'Secure' }
                            ].map((item, i) => (
                                <div key={i} className="history-item">
                                    <div className="history-icon">
                                        {item.event.includes('Login') ? <ShieldCheck size={16} /> : <Activity size={16} />}
                                    </div>
                                    <div className="history-info">
                                        <div className="history-main">
                                            <span className="event-name">{item.event}</span>
                                            <span className="event-status">{item.status}</span>
                                        </div>
                                        <div className="history-sub">
                                            <span>{item.time}</span>
                                            <span className="divider"></span>
                                            <span>{item.device}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showSkillsModal && (
                <div className="modal-overlay" onClick={() => setShowSkillsModal(false)}>
                    <div className="modal-content glass animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="header-title-group">
                                <div className="header-icon-box orange"><Rocket size={20} /></div>
                                <div>
                                    <h3>Update Skills</h3>
                                    <p>Manage your professional skill set</p>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setShowSkillsModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="skills-search">
                                <label>Add New Skill</label>
                                <div className="search-group">
                                    <input type="text" placeholder="Search skills (e.g. React, Python, UI Design)..." />
                                    <button className="btn btn-primary">Add</button>
                                </div>
                            </div>
                            <div className="current-skills-list">
                                <label>Your Current Skills</label>
                                {profile?.skills?.length > 0 ? (
                                    <div className="skills-modal-grid">
                                        {profile.skills.map(s => (
                                            <div key={s.skill.id} className="skill-edit-card">
                                                <span>{s.skill.name}</span>
                                                <select defaultValue={s.proficiency_level}>
                                                    <option>Beginner</option>
                                                    <option>Intermediate</option>
                                                    <option>Advanced</option>
                                                    <option>Expert</option>
                                                </select>
                                                <button className="remove-skill-btn"><X size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-skills-text">You haven't added any skills yet.</p>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowSkillsModal(false)}>Discard</button>
                            <button className="btn btn-primary" onClick={() => { setSaving(true); setTimeout(() => { setSaving(false); setShowSkillsModal(false); }, 1000); }}>
                                Update Portfolio
                            </button>
                        </div>
                    </div>
                </div>
            )}

                        <style>{`
                .employee-portal {
                    display: flex;
                    min-height: 100vh;
                    background: var(--bg-main);
                    color: var(--text-main);
                    font-family: 'Inter', sans-serif;
                }

                .glass {
                    background: var(--bg-card);
                    backdrop-filter: blur(12px);
                    border: 1px solid var(--border-color);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                /* Sidebar */
                .portal-sidebar {
                    width: 280px;
                    display: flex;
                    flex-direction: column;
                    padding: 2rem 1.5rem;
                    border-right: 1px solid var(--border-color);
                    background: var(--bg-card);
                }

                .sidebar-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 3rem;
                    color: var(--text-main);
                }

                .logo-box {
                    background: var(--primary-color);
                    padding: 0.5rem;
                    border-radius: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }

                .portal-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    flex: 1;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.875rem 1.25rem;
                    border-radius: 0.75rem;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                }

                .nav-item:hover { background: #f1f5f9; color: var(--text-main); }
                .nav-item.active { background: #eff6ff; color: var(--primary-color); font-weight: 600; }

                .sidebar-footer { margin-top: auto; padding-top: 2rem; border-top: 1px solid var(--border-color); }
                .help-center { display: flex; align-items: center; gap: 0.75rem; color: var(--text-muted); font-size: 0.875rem; cursor: pointer; transition: 0.2s; }
                .help-center:hover { color: var(--text-main); }
                .logout-btn { transition: 0.2s; }
                .logout-btn:hover { transform: translateX(5px); }

                /* Main */
                .portal-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    padding: 2rem 3rem;
                    background: #f8fafc;
                }

                .portal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2.5rem;
                }

                .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--text-muted); }
                .breadcrumb .current { color: var(--text-main); font-weight: 600; }

                .header-actions { display: flex; align-items: center; gap: 1rem; }
                .icon-btn { background: white; border: 1px solid var(--border-color); color: var(--text-muted); cursor: pointer; padding: 0.5rem; border-radius: 0.5rem; transition: all 0.2s; }
                .icon-btn:hover { background: #f1f5f9; color: var(--primary-color); border-color: #cbd5e1; }

                /* Dashboard View */
                .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
                .stat-card { padding: 1.5rem; border-radius: 1.25rem; display: flex; align-items: center; gap: 1.25rem; background: white; border: 1px solid var(--border-color); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .stat-icon-box { width: 48px; height: 48px; border-radius: 1rem; display: flex; align-items: center; justify-content: center; }
                .stat-icon-box.blue { color: #3b82f6; background: #eff6ff; }
                .stat-icon-box.purple { color: #a855f7; background: #f3e8ff; }
                .stat-icon-box.green { color: #10b981; background: #ecfdf5; }
                .stat-icon-box.orange { color: #f59e0b; background: #fffbeb; }
                .stat-label { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
                .stat-value { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; color: var(--text-main); }
                .stat-trend { font-size: 0.65rem; color: var(--text-muted); font-weight: 600; }
                .stat-trend.positive { color: #10b981; }

                .dashboard-grid { display: grid; grid-template-columns: 2fr 1.2fr; gap: 1.5rem; }
                .chart-bar-container { display: flex; align-items: flex-end; justify-content: space-between; height: 150px; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem; }
                .bar { width: 30px; background: linear-gradient(to top, var(--primary-color), #60a5fa); border-radius: 4px 4px 0 0; }
                .day-label { font-size: 0.65rem; color: var(--text-muted); font-weight: 600; }
                .announcement-list { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 1.5rem; }
                .announcement-item { display: flex; gap: 1rem; align-items: flex-start; }
                .ann-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary-color); margin-top: 0.6rem; }
                .ann-dot.active { background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
                .ann-title { font-size: 0.875rem; font-weight: 600; color: var(--text-main); }
                .ann-time { font-size: 0.75rem; color: var(--text-muted); }

                /* Profile View */
                .profile-header-card { padding: 2.5rem; border-radius: 1.5rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; background: white; border: 1px solid var(--border-color); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                .profile-main-info { display: flex; align-items: center; gap: 2rem; }
                .profile-avatar { width: 100px; height: 100px; background: #e0e7ff; border: 4px solid #c7d2fe; border-radius: 2rem; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; color: var(--primary-color); position: relative; }
                .status-indicator-dot { position: absolute; bottom: 0; right: 0; width: 18px; height: 18px; background: #10b981; border: 3px solid white; border-radius: 50%; }
                .active-badge { background: #eff6ff; color: var(--primary-color); font-size: 0.65rem; font-weight: 800; padding: 0.25rem 0.6rem; border-radius: 0.5rem; }
                .profile-text-info h2 { color: var(--text-main); font-weight: 700; margin: 0; }
                .job-title { color: var(--text-muted); font-weight: 500; margin-top: 0.25rem; }
                .contact-pills { display: flex; gap: 1rem; margin-top: 1rem; }
                .contact-pill { display: flex; align-items: center; gap: 0.5rem; background: #f1f5f9; padding: 0.5rem 1rem; border-radius: 0.75rem; font-size: 0.8125rem; color: var(--text-main); }

                .content-grid { display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 1.5rem; }
                .card { padding: 1.5rem; border-radius: 1.25rem; display: flex; flex-direction: column; background: white; border: 1px solid var(--border-color); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .card-header-with-icon { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
                .card-header-with-icon h3 { font-size: 0.8125rem; font-weight: 700; color: var(--text-muted); flex: 1; }
                .header-icon-box { padding: 0.5rem; background: #eff6ff; border-radius: 0.6rem; color: var(--primary-color); }
                .info-list { display: flex; flex-direction: column; gap: 1.25rem; }
                .info-item .label { font-size: 0.65rem; font-weight: 700; color: var(--text-muted); display: block; }
                .info-item .value { font-size: 0.9375rem; font-weight: 600; color: var(--text-main); }

                /* Attendance View */
                .attendance-header-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
                .mini-stat { padding: 1.25rem; }
                .mini-stat .label { color: var(--text-muted); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.25rem; }
                .mini-stat .value { color: var(--text-main); font-size: 1.25rem; font-weight: 700; }
                .text-orange { color: #f59e0b; }
                .text-green { color: #10b981; }
                
                .attendance-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem; }
                .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; margin-top: 1rem; }
                .calendar-date { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background: #f8fafc; border-radius: 0.75rem; font-size: 0.875rem; cursor: pointer; color: var(--text-main); border: 1px solid transparent; }
                .calendar-date:hover { border-color: var(--primary-color); }
                .calendar-date.active { background: var(--primary-color); color: white; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3); }
                
                .logs-list { display: flex; flex-direction: column; gap: 0.75rem; }
                .log-item { display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: #f8fafc; border-radius: 0.75rem; border: 1px solid var(--border-color); }
                .log-date { font-weight: 600; color: var(--text-main); font-size: 0.875rem; }
                .log-times { display: flex; flex-direction: column; font-size: 0.75rem; color: var(--text-muted); }
                .log-status { font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 0.4rem; }
                .log-status.present { background: #ecfdf5; color: #10b981; }
                .log-status.late { background: #fffbeb; color: #f59e0b; }
                .log-status.absent { background: #fef2f2; color: #ef4444; }

                /* Documents View */
                .documents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
                .document-card { flex-direction: row; align-items: center; gap: 1.25rem; padding: 1.25rem; cursor: pointer; transition: 0.2s; }
                .document-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-color: #cbd5e1; }
                .doc-icon { color: var(--primary-color); background: #eff6ff; padding: 0.75rem; border-radius: 0.75rem; }
                .doc-info { flex: 1; }
                .doc-name { font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem; font-size: 0.9rem; }
                .doc-meta { font-size: 0.75rem; color: var(--text-muted); }

                /* Common */
                .btn-primary { background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 1rem; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; transition: 0.2s; box-shadow: 0 2px 5px rgba(37, 99, 235, 0.2); }
                .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 5px 10px rgba(37, 99, 235, 0.3); }
                .btn-secondary { background: white; color: var(--text-muted); border: 1px solid var(--border-color); padding: 0.75rem 1.5rem; border-radius: 1rem; cursor: pointer; font-weight: 600; transition: 0.2s; }
                .btn-secondary:hover { background: #f8fafc; color: var(--text-main); }
                .view-all-btn { width: 100%; padding: 0.75rem; background: white; border: 1px solid var(--border-color); border-radius: 0.75rem; color: var(--text-muted); cursor: pointer; margin-top: 1rem; font-weight: 500; font-size: 0.875rem; }
                .view-all-btn:hover { background: #f8fafc; color: var(--text-main); border-color: #cbd5e1; }

                /* Modals Styling */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.5rem; }
                .modal-content { width: 100%; max-width: 600px; padding: 2rem; border-radius: 1.5rem; position: relative; background: white; border: 1px solid var(--border-color); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
                .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
                .header-title-group { display: flex; gap: 1rem; align-items: center; }
                .header-title-group h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; color: var(--text-main); }
                .header-title-group p { font-size: 0.875rem; color: var(--text-muted); }
                .close-btn { background: #f1f5f9; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem; border-radius: 0.5rem; transition: 0.2s; }
                .close-btn:hover { background: #fee2e2; color: #ef4444; }

                .modal-form { display: flex; flex-direction: column; gap: 1.5rem; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
                .form-group.full-width { grid-column: span 2; }
                .form-group label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; text-transform: uppercase; }
                .form-group input, .form-group select { width: 100%; background: white; border: 1px solid var(--border-color); padding: 0.875rem 1rem; border-radius: 0.75rem; color: var(--text-main); font-size: 0.9375rem; outline: none; transition: 0.2s; }
                .form-group input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

                .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }

                /* Action Buttons Styling */
                .view-history-link {
                    background: white;
                    border: 1px solid var(--border-color);
                    color: var(--text-muted);
                    padding: 0.4rem 0.9rem;
                    border-radius: 0.75rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .view-history-link:hover {
                    background: #f8fafc;
                    color: var(--text-main);
                    border-color: #cbd5e1;
                }

                .update-btn {
                    background: #eff6ff;
                    border: 1px solid #dbeafe;
                    color: var(--primary-color);
                    padding: 0.4rem 0.8rem;
                    border-radius: 0.6rem;
                    font-size: 0.65rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }
                .update-btn:hover {
                    background: var(--primary-color);
                    color: #fff;
                    border-color: var(--primary-color);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                    transform: translateY(-1px);
                }

                .get-started-link {
                    background: linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%);
                    color: #fff;
                    border: none;
                    padding: 0.6rem 1.25rem;
                    border-radius: 1rem;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin: 1.25rem auto 0;
                    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
                }
                .get-started-link:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
                }

                /* History Modal */
                .history-list { display: flex; flex-direction: column; gap: 1rem; max-height: 400px; overflow-y: auto; padding-right: 0.5rem; }
                .history-item { display: flex; gap: 1.25rem; padding: 1.25rem; background: #f8fafc; border-radius: 1rem; border: 1px solid var(--border-color); }
                .history-icon { width: 40px; height: 40px; border-radius: 0.75rem; background: #eff6ff; color: var(--primary-color); display: flex; align-items: center; justify-content: center; }
                .history-info { flex: 1; }
                .history-main { display: flex; justify-content: space-between; margin-bottom: 0.35rem; }
                .event-name { font-weight: 600; font-size: 0.9375rem; color: var(--text-main); }
                .event-status { font-size: 0.7rem; font-weight: 800; color: #10b981; background: #ecfdf5; padding: 0.2rem 0.5rem; border-radius: 0.4rem; letter-spacing: 0.05em; }
                .history-sub { display: flex; align-items: center; gap: 0.75rem; font-size: 0.75rem; color: var(--text-muted); }
                .divider { width: 4px; height: 4px; border-radius: 50%; background: #cbd5e1; }

                /* Skills Modal Edit */
                .skills-search { margin-bottom: 2rem; }
                .skills-search label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem; }
                .search-group { display: flex; gap: 0.75rem; }
                .search-group input { flex: 1; background: white; border: 1px solid var(--border-color); padding: 0.875rem 1rem; border-radius: 0.75rem; color: var(--text-main); }
                .current-skills-list label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 1rem; }
                .skills-modal-grid { display: flex; flex-direction: column; gap: 0.75rem; }
                .skill-edit-card { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.25rem; background: #f8fafc; border-radius: 1rem; border: 1px solid var(--border-color); }
                .skill-edit-card span { color: var(--text-main); font-weight: 600; }
                .skill-edit-card select { background: none; border: none; font-size: 0.8125rem; color: var(--primary-color); font-weight: 600; cursor: pointer; width: auto; padding: 0; outline: none; }
                .remove-skill-btn { background: none; border: none; color: #ef4444; cursor: pointer; padding: 0.25rem; opacity: 0.6; transition: 0.2s; }
                .remove-skill-btn:hover { opacity: 1; transform: scale(1.1); }

                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: var(--bg-main); color: var(--text-main); }
                .loader { border: 3px solid rgba(37, 99, 235, 0.1); border-top: 3px solid var(--primary-color); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 1rem; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const PortalNavItem = ({ icon, label, active, onClick }) => (
    <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
        {icon}
        <span>{label}</span>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div className="info-item">
        <span className="label">{label}</span>
        <span className="value">{value || 'N/A'}</span>
    </div>
);

export default EmployeeDashboard;
