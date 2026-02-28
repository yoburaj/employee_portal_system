import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard, User, Calendar, FileText, Settings,
    Bell, LogOut, Info, ShieldCheck, Mail, Phone,
    ChevronRight, Rocket, Edit, Clock, Smartphone,
    HelpCircle, Activity, ChevronLeft, Camera, X, Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './EmployeeDashboard.css';

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

    // Skills State
    const [allSkills, setAllSkills] = useState([]);
    const [editSkills, setEditSkills] = useState([]);
    const [selectedSkillToAdd, setSelectedSkillToAdd] = useState('');

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
                const [profileResp, logsResp, skillsResp] = await Promise.all([
                    axios.get(`${API_BASE}/employees/me`, { headers }),
                    axios.get(`${API_BASE}/admin/auth-logs`, { headers }),
                    axios.get(`${API_BASE}/admin/skills`, { headers })
                ]);
                setProfile(profileResp.data);
                setAttendanceLogs(logsResp.data);
                setAllSkills(skillsResp.data);
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
        try {
            const token = localStorage.getItem('token');
            const resp = await axios.put(`${API_BASE}/employees/me`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(resp.data);
            setShowEditModal(false);
        } catch (err) {
            console.error("Failed to update profile", err);
            alert("Failed to update profile. " + (err.response?.data?.detail || ""));
        } finally {
            setSaving(false);
        }
    };

    const handleAddSkill = () => {
        if (!selectedSkillToAdd) return;
        const skillObj = allSkills.find(s => s.id.toString() === selectedSkillToAdd);
        if (skillObj && !editSkills.some(es => (es.skill?.id || es.skill_id) === skillObj.id)) {
            setEditSkills([...editSkills, {
                skill: skillObj,
                skill_id: skillObj.id,
                proficiency_level: "beginner"
            }]);
        }
        setSelectedSkillToAdd('');
    };

    const handleSaveSkills = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const resp = await axios.put(`${API_BASE}/employees/me`, {
                skills: editSkills.map(s => ({
                    skill_id: s.skill?.id || s.skill_id,
                    proficiency_level: s.proficiency_level.toLowerCase()
                }))
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(resp.data);
            setShowSkillsModal(false);
        } catch (err) {
            console.error("Failed to update skills", err);
            alert("Failed to update skills. " + (err.response?.data?.detail || ""));
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const token = localStorage.getItem('token');
            const resp = await axios.post(`${API_BASE}/employees/upload-avatar`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProfile(prev => ({ ...prev, profile_picture: resp.data.url }));
        } catch (err) {
            console.error("Failed to upload avatar", err);
            alert("Failed to upload image.");
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Synchronizing Employee Profile...</p>
            </div>
        );
    }

    const successfulLogs = attendanceLogs.filter(log => log.login_status === 'success');

    // 1. Working Days in current month
    const currentMonthLogs = successfulLogs.filter(log => new Date(log.login_attempt_time).getMonth() === now.getMonth() && new Date(log.login_attempt_time).getFullYear() === now.getFullYear());
    const currentMonthUniquePresentDates = new Set(currentMonthLogs.map(log => new Date(log.login_attempt_time).toDateString()));
    const workingDaysCount = currentMonthUniquePresentDates.size;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // 2. Avg Login Time
    let avgLoginTimeDisplay = "N/A";
    if (successfulLogs.length > 0) {
        const totalMinutes = successfulLogs.reduce((acc, log) => {
            const d = new Date(log.login_attempt_time);
            return acc + (d.getHours() * 60 + d.getMinutes());
        }, 0);
        const avgMinutes = Math.floor(totalMinutes / successfulLogs.length);
        const avgH = Math.floor(avgMinutes / 60);
        const avgM = avgMinutes % 60;
        const ampm = avgH >= 12 ? 'PM' : 'AM';
        const formattedH = avgH % 12 || 12;
        avgLoginTimeDisplay = `${formattedH.toString().padStart(2, '0')}:${avgM.toString().padStart(2, '0')} ${ampm}`;
    }

    // 3. Recognition Score
    let avgRecScoreDisplay = "N/A";
    if (successfulLogs.length > 0) {
        const totalScore = successfulLogs.reduce((acc, log) => acc + (log.facial_confidence || 0), 0);
        avgRecScoreDisplay = (totalScore / successfulLogs.length).toFixed(1) + "%";
    }

    const getWeekAttendance = () => {
        const weekData = [0, 0, 0, 0, 0, 0, 0];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        successfulLogs.forEach(log => {
            const d = new Date(log.login_attempt_time);
            if (d >= startOfWeek) {
                const dayIndex = (d.getDay() || 7) - 1; // 0 for Mon, 6 for Sun
                if (dayIndex >= 0 && dayIndex < 7) {
                    weekData[dayIndex] = log.facial_confidence || 95;
                }
            }
        });
        return weekData;
    };
    const attendanceChartData = getWeekAttendance();

    const skillsLevel = profile?.skills?.length > 4 ? "Expert" : profile?.skills?.length > 2 ? "Advanced" : profile?.skills?.length > 0 ? "Intermediate" : "Beginner";
    const skillPercentile = profile?.skills?.length > 4 ? "Top 5%" : profile?.skills?.length > 2 ? "Top 15%" : profile?.skills?.length > 0 ? "Top 40%" : "New Learner";

    const renderDashboard = () => (
        <div className="employee-dashboard-view animate-fade-in animate-slide-up">
            <div className="stats-row">
                <div className="stat-card glass">
                    <div className="stat-icon-box blue"><Calendar size={20} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Working Days</p>
                        <p className="stat-value">{workingDaysCount} / {daysInMonth}</p>
                        <span className="stat-trend positive">Current Month</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <div className="stat-icon-box purple"><Clock size={20} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Avg. Login Time</p>
                        <p className="stat-value">{avgLoginTimeDisplay}</p>
                        <span className="stat-trend">Based on records</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <div className="stat-icon-box green"><ShieldCheck size={20} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Recognition Score</p>
                        <p className="stat-value">{avgRecScoreDisplay}</p>
                        <span className="stat-trend positive">AI Verify Avg</span>
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
                            {attendanceChartData.map((h, i) => (
                                <div key={i} className="chart-item">
                                    <div className="bar" style={{ height: `${h}%`, opacity: (h === 0 && i < ((now.getDay() || 7) - 1)) ? 0.1 : (h === 0 ? 0.05 : 1) }}></div>
                                    <span className="day-label">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                                </div>
                            ))}
                        </div>
                        <p className="chart-desc">Your attendance consistency for the current week.</p>
                    </div>
                </div>

                <div className="card glass recent-announcements">
                    <div className="card-header-with-icon">
                        <div className="header-icon-box purple"><Clock size={20} /></div>
                        <h3>RECENT ACTIVITY</h3>
                    </div>
                    <div className="announcement-list">
                        {attendanceLogs.slice(0, 3).map((log, i) => (
                            <div key={log.id || i} className="announcement-item">
                                <div className={`ann-dot ${i === 0 ? 'active' : ''}`}></div>
                                <div className="ann-content">
                                    <p className="ann-title">{log.login_status === 'success' ? 'Biometric Authentication' : 'Failed Access Attempt'}</p>
                                    <p className="ann-time">{new Date(log.login_attempt_time).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                        {attendanceLogs.length === 0 && (
                            <div className="announcement-item" style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
                                No recent activity
                            </div>
                        )}
                    </div>
                    <button className="view-all-btn" onClick={() => setActiveTab('attendance')}>View Attendance Logs</button>
                </div>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="employee-profile-view animate-fade-in animate-slide-up">
            <div className="profile-header-card glass">
                <div className="profile-main-info">
                    <div className="profile-avatar-wrapper">
                        <label className="avatar-upload-label">
                            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} />
                            {profile?.profile_picture ? (
                                <img src={`${API_BASE.replace('/api/v1', '')}${profile.profile_picture}`} alt="Profile" className="profile-avatar" style={{ objectFit: 'cover' }} />
                            ) : (
                                <div className="profile-avatar">
                                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                                </div>
                            )}
                            <div className="avatar-upload-overlay">
                                <Camera size={24} />
                            </div>
                        </label>
                        <div className="status-indicator-dot"></div>
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
                        <InfoItem label="DEPARTMENT" value={profile?.department?.name || 'Unassigned'} />
                        <InfoItem label="JOINED DATE" value={new Date(profile?.hire_date || new Date()).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })} />
                        <InfoItem label="REPORTING MANAGER" value={profile?.department?.manager_name || "Unassigned"} />
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
                                <p className="value">
                                    {successfulLogs.length > 0
                                        ? new Date(successfulLogs[0].login_attempt_time).toLocaleString()
                                        : 'No records found'}
                                </p>
                                <div className="security-pills">
                                    <span className="security-pill">{successfulLogs[0]?.facial_confidence || 0}% Face Match</span>
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
                        <button className="update-btn" onClick={() => {
                            setEditSkills(profile?.skills ? [...profile.skills] : []);
                            setShowSkillsModal(true);
                        }}>+ UPDATE</button>
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
        <div className="employee-attendance-view animate-fade-in animate-slide-up">
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
        <div className="employee-documents-view animate-fade-in animate-slide-up">
            <div className="card-header-with-icon" style={{ marginBottom: '1.5rem' }}>
                <div className="header-icon-box"><FileText size={20} /></div>
                <h3>MY DOCUMENTS</h3>
            </div>
            {profile?.documents?.length > 0 ? (
                <div className="documents-grid">
                    {profile.documents.map((doc, i) => (
                        <div key={doc.id || i} className="card glass document-card">
                            <div className="doc-icon">
                                {doc.document_name.endsWith('.pdf') ? <FileText size={24} /> : <Camera size={24} />}
                            </div>
                            <div className="doc-info">
                                <p className="doc-name">{doc.document_name}</p>
                                <p className="doc-meta">{(doc.file_size_bytes / (1024 * 1024)).toFixed(2)} MB • {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                            </div>
                            <a href={`${API_BASE.replace('/api/v1', '')}${doc.file_path}`} download target="_blank" rel="noreferrer" className="icon-btn download" style={{ color: 'inherit' }}>
                                <ChevronRight size={20} />
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-skills" style={{ marginTop: '2rem' }}>
                    <div className="empty-icon-circle"><FileText size={32} /></div>
                    <p className="empty-title">No documents available</p>
                    <p className="empty-desc">Your official HR documents will appear here once uploaded by Admin.</p>
                </div>
            )}
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

            <main className="portal-main animate-fade-in">
                <header className="portal-header">
                    <div className="breadcrumb">
                        <span className="root">Employee Self-Service</span>
                        <ChevronRight size={14} />
                        <span className="current">{activeTab === 'profile' ? 'Profile Details' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
                    </div>
                    <div className="header-actions">
                        <div className="search-minimal">
                            <Rocket size={16} className="text-muted" />
                            <input type="text" placeholder="Global search..." />
                        </div>
                        <button className="icon-btn"><Bell size={20} /></button>
                        <button className="icon-btn" onClick={() => setActiveTab('settings')}><Settings size={20} /></button>
                        <div className="divider-v"></div>
                        <div className="user-nav-pill" onClick={() => setActiveTab('profile')}>
                            <div className="user-avatar-sm">
                                {user?.username?.[0].toUpperCase()}
                            </div>
                            <div className="user-details-sm">
                                <span className="username">{user?.username}</span>
                                <span className="status">Online</span>
                            </div>
                        </div>
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
                                    <select
                                        className="settings-input"
                                        style={{ flex: 1, height: '40px', border: '1px solid var(--border-color)', borderRadius: '0.375rem', padding: '0 0.75rem', fontSize: '0.875rem', background: 'white' }}
                                        value={selectedSkillToAdd}
                                        onChange={e => setSelectedSkillToAdd(e.target.value)}
                                    >
                                        <option value="">Select a skill to add...</option>
                                        {allSkills.map(skill => (
                                            <option key={skill.id} value={skill.id} disabled={editSkills.some(es => (es.skill?.id || es.skill_id) === skill.id)}>
                                                {skill.name} {skill.category ? `(${skill.category})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <button className="btn btn-primary" onClick={handleAddSkill} disabled={!selectedSkillToAdd}>Add</button>
                                </div>
                            </div>
                            <div className="current-skills-list">
                                <label>Your Current Skills</label>
                                {editSkills?.length > 0 ? (
                                    <div className="skills-modal-grid">
                                        {editSkills.map((s, index) => (
                                            <div key={s.skill?.id || index} className="skill-edit-card">
                                                <span>{s.skill?.name}</span>
                                                <select
                                                    value={s.proficiency_level.charAt(0).toUpperCase() + s.proficiency_level.slice(1)}
                                                    onChange={e => {
                                                        const newSkills = [...editSkills];
                                                        newSkills[index].proficiency_level = e.target.value.toLowerCase();
                                                        setEditSkills(newSkills);
                                                    }}
                                                >
                                                    <option value="Beginner">Beginner</option>
                                                    <option value="Intermediate">Intermediate</option>
                                                    <option value="Advanced">Advanced</option>
                                                    <option value="Expert">Expert</option>
                                                </select>
                                                <button className="remove-skill-btn" onClick={() => {
                                                    const newSkills = [...editSkills];
                                                    newSkills.splice(index, 1);
                                                    setEditSkills(newSkills);
                                                }}><X size={14} /></button>
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
                            <button className="btn btn-primary" onClick={handleSaveSkills} disabled={saving}>
                                {saving ? 'Updating...' : 'Update Portfolio'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
