import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard, Users, Building2, Calendar, Settings,
    Search, UserPlus, Eye, Pencil, ShieldCheck, UserCheck,
    MoreVertical, ChevronLeft, ChevronRight, Activity, ScanFace,
    Camera, CheckCircle2, X, Trash2, Shield, Bell, Monitor, Lock, Globe, Smartphone, Save, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import WebcamCapture from '../common/WebcamCapture';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const VisionHRDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };
    const [employees, setEmployees] = useState([]);
    const [stats, setStats] = useState({
        total_employees: 0,
        total_departments: 0,
        total_skills: 0,
        active_users: 0,
        recognition_rate: '99.8%'
    });
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [newEmployee, setNewEmployee] = useState({
        username: '',
        email: '',
        password: 'string@12',
        first_name: '',
        last_name: '',
        role: 'employee',
        department_id: '',
        enableFacial: false
    });

    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        department: '',
    });

    // Multi-step modal state
    const [modalStep, setModalStep] = useState(1);
    const [createdUserId, setCreatedUserId] = useState(null);
    const [capturedCount, setCapturedCount] = useState(0);
    const [capturedImages, setCapturedImages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // View/Edit/Delete state
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [actionType, setActionType] = useState(null); // 'view', 'edit', 'delete'
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [newDept, setNewDept] = useState({ name: '', description: '' });
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [settings, setSettings] = useState({
        companyName: 'VisionHR Intelligence',
        securityLevel: 'Enterprise',
        facialThreshold: 95,
        sessionTimeout: 30,
        notifications: true,
        autoEnrollment: false,
        facialAlerts: true,
        mfaEnabled: true
    });

    useEffect(() => {
        fetchData();
    }, [searchTerm, filters]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            let url = `${API_BASE}/employees`;
            const params = new URLSearchParams();
            if (filters.department) params.append('department_id', filters.department);
            if (params.toString()) url += `?${params.toString()}`;

            const [empRes, statsRes, deptRes, logsRes] = await Promise.all([
                axios.get(url, { headers }),
                axios.get(`${API_BASE}/dashboard/stats`, { headers }),
                axios.get(`${API_BASE}/admin/departments`, { headers }),
                axios.get(`${API_BASE}/admin/auth-logs`, { headers })
            ]);

            let filteredEmployees = empRes.data;
            if (searchTerm) {
                const lowerSearch = searchTerm.toLowerCase();
                filteredEmployees = filteredEmployees.filter(emp =>
                    emp.first_name.toLowerCase().includes(lowerSearch) ||
                    emp.last_name.toLowerCase().includes(lowerSearch) ||
                    emp.employee_id.toLowerCase().includes(lowerSearch)
                );
            }

            setEmployees(filteredEmployees);
            setStats({ ...statsRes.data.data, recognition_rate: '99.8%' });
            setDepartments(deptRes.data);
            setAttendanceLogs(logsRes.data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const resp = await axios.post(`${API_BASE}/employees`, {
                ...newEmployee,
                department_id: parseInt(newEmployee.department_id) || null
            }, { headers });

            setCreatedUserId(resp.data.user.id);
            if (newEmployee.enableFacial) {
                setModalStep(2);
            } else {
                setModalStep(3);
            }
        } catch (err) {
            alert("Error adding employee: " + (err.response?.data?.detail || err.message));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFaceCapture = (imageSrc) => {
        if (capturedCount < 50) {
            setCapturedImages(prev => [...prev, imageSrc]);
            setCapturedCount(prev => prev + 1);
        }
    };

    const handleEnrollSubmit = async () => {
        setIsProcessing(true);
        try {
            const body = new FormData();
            body.append('user_id', createdUserId);

            for (let i = 0; i < capturedImages.length; i++) {
                const blob = await (await fetch(capturedImages[i])).blob();
                body.append('face_images', blob, `face_${i}.jpg`);
            }

            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.post(`${API_BASE}/auth/facial-enroll`, body, { headers });
            setModalStep(3);
        } catch (err) {
            alert("Facial enrollment failed: " + (err.response?.data?.detail || err.message));
        } finally {
            setIsProcessing(false);
        }
    };

    const resetModal = () => {
        setShowAddModal(false);
        setModalStep(1);
        setCreatedUserId(null);
        setCapturedCount(0);
        setCapturedImages([]);
        setNewEmployee({
            username: '', email: '', password: 'string@12',
            first_name: '', last_name: '', role: 'employee', department_id: '',
            enableFacial: false
        });
        fetchData();
    };

    const handleAddDept = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.post(`${API_BASE}/admin/departments`, newDept, { headers });
            setShowDeptModal(false);
            setNewDept({ name: '', description: '' });
            fetchData();
        } catch (err) {
            alert("Error adding department: " + (err.response?.data?.detail || err.message));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`${API_BASE}/employees/${selectedEmployee.employee_id}`, {
                first_name: selectedEmployee.first_name,
                last_name: selectedEmployee.last_name,
                email: selectedEmployee.user?.email,
                department_id: parseInt(selectedEmployee.department_id) || null
            }, { headers });

            setActionType(null);
            setSelectedEmployee(null);
            fetchData();
        } catch (err) {
            alert("Error updating employee: " + (err.response?.data?.detail || err.message));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteEmployee = async () => {
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${API_BASE}/employees/${selectedEmployee.employee_id}`, { headers });

            setActionType(null);
            setSelectedEmployee(null);
            fetchData();
        } catch (err) {
            alert("Error deleting employee: " + (err.response?.data?.detail || err.message));
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8f9fa' }}>
            <div style={{ textAlign: 'center' }}>
                <Activity className="animate-pulse" size={48} color="#1a73e8" />
                <p style={{ marginTop: '1rem', color: '#5f6368', fontWeight: '500' }}>Initializing VisionHR Intelligence...</p>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <>
            <section className="vision-stats">
                <StatCard
                    title="Total Employees"
                    value={stats.total_employees}
                    trend="+5.2% from last month"
                    icon={<Users size={20} color="var(--primary-color)" />}
                />
                <StatCard
                    title="Dept Headcount"
                    value={`${stats.total_departments} Depts`}
                    trend="Stable"
                    icon={<Building2 size={20} color="var(--primary-color)" />}
                />
                <StatCard
                    title="Recognition Rate"
                    value={stats.recognition_rate}
                    trend="System healthy"
                    icon={<ShieldCheck size={20} color="var(--primary-color)" />}
                />
                <StatCard
                    title="Active Sessions"
                    value={stats.active_users}
                    trend="88% Capacity"
                    icon={<UserCheck size={20} color="var(--primary-color)" />}
                />
            </section>

            <section className="vision-content-card animate-fade-in">
                <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="icon-pulse" style={{ padding: '0.4rem' }}>
                            <Activity size={18} color="var(--primary-color)" />
                        </div>
                        <h2>Recent Activity Summary</h2>
                    </div>
                    <button className="view-all-btn" onClick={() => setActiveTab('attendance')}>View Detailed Logs</button>
                </div>
                <div className="activity-summary-list">
                    {attendanceLogs.length > 0 ? (
                        attendanceLogs.slice(0, 5).map((log, idx) => (
                            <div key={log.id || idx} className="activity-item">
                                <div className="activity-user">
                                    <div className="activity-avatar">
                                        {log.user?.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="activity-info">
                                        <p className="activity-title">
                                            <span className="user-name">{log.user?.username || 'Unknown'}</span>
                                            {log.login_status === 'success' ? ' successfully verified' : ' failed verification'}
                                        </p>
                                        <p className="activity-time">
                                            <Clock size={12} /> {new Date(log.login_attempt_time).toLocaleTimeString()} · {new Date(log.login_attempt_time).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="activity-metrics">
                                    <div className="confidence-badge">
                                        Match: {log.facial_confidence}%
                                    </div>
                                    <span className={`status-dot ${log.login_status === 'success' ? 'success' : 'failed'}`}></span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                            <Activity size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p>No recent activity logs found. Ensure biometric systems are active.</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );

    const renderEmployees = () => (
        <section className="vision-content-card">
            <div className="card-header">
                <h2>Employee Directory</h2>
                <div className="search-bar">
                    <Search size={18} color="#94a3b8" />
                    <input
                        type="text"
                        placeholder="Search name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="filter-bar">
                <FilterDropdown
                    label="Department"
                    options={departments.map(d => ({ value: d.id, label: d.name }))}
                    onChange={(val) => setFilters({ ...filters, department: val })}
                />
                <FilterDropdown label="Skills" />
                <FilterDropdown label="Status" />
                <FilterDropdown label="Shift" />
            </div>

            <div className="vision-table-wrapper">
                <table className="vision-table">
                    <thead>
                        <tr>
                            <th>EMPLOYEE</th>
                            <th>DEPARTMENT</th>
                            <th>SKILLS</th>
                            <th>RECOGNITION</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.length > 0 ? employees.map(emp => (
                            <tr key={emp.id}>
                                <td>
                                    <div className="emp-cell">
                                        <div className="emp-avatar">
                                            {emp.first_name[0]}{emp.last_name[0]}
                                        </div>
                                        <div>
                                            <p className="emp-name">{emp.first_name} {emp.last_name}</p>
                                            <p className="emp-id">{emp.employee_id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>{emp.department?.name || 'N/A'}</td>
                                <td>
                                    <div className="skills-tags">
                                        {emp.skills.slice(0, 2).map(s => (
                                            <span key={s.skill.id} className="skill-tag">{s.skill.name}</span>
                                        ))}
                                        {emp.skills.length > 2 && <span className="skill-tag">+{emp.skills.length - 2}</span>}
                                    </div>
                                </td>
                                <td>
                                    <div className="recognition-status">
                                        <span className={`status-dot ${emp.user?.facial_data?.is_enrolled ? 'active' : 'inactive'}`}></span>
                                        {emp.user?.facial_data?.is_enrolled ? 'Face Active' : 'Enrollment Req.'}
                                    </div>
                                </td>
                                <td>
                                    <span className="status-badge present">Present</span>
                                </td>
                                <td>
                                    <div className="action-icons">
                                        <button title="View" onClick={() => { setSelectedEmployee(emp); setActionType('view'); }}><Eye size={16} /></button>
                                        <button title="Edit" onClick={() => { setSelectedEmployee(emp); setActionType('edit'); }}><Pencil size={16} /></button>
                                        <button title="Delete" onClick={() => { setSelectedEmployee(emp); setActionType('delete'); }} className="btn-delete-row"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                    No employees found. Seed the database or add new employees.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="card-footer">
                <p>Showing {employees.length > 0 ? `1-${Math.min(10, employees.length)}` : '0'} of {stats.total_employees} employees</p>
                <div className="pagination">
                    <button className="btn-page"><ChevronLeft size={16} /></button>
                    <button className="btn-page"><ChevronRight size={16} /></button>
                </div>
            </div>
        </section>
    );

    const handleSaveSettings = () => {
        setSettingsSaving(true);
        // Simulate a real API persistence delay
        setTimeout(() => {
            setSettingsSaving(false);
            // In a real app, you'd call an API here
        }, 1200);
    };

    const SettingToggle = ({ label, desc, icon, value, onToggle }) => (
        <div className="setting-item">
            <div className="setting-info">
                <label>{label}</label>
                <span>{desc}</span>
            </div>
            <div className={`toggle-switch ${value ? 'active' : ''}`} onClick={onToggle}>
                <div className="toggle-knob" />
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="settings-grid animate-fade-in">
            <div className="settings-section">
                <div className="settings-group">
                    <h4><Shield size={18} color="var(--primary-color)" /> Security Architecture <div className="header-line" /></h4>
                    <div className="setting-item">
                        <div className="setting-info">
                            <label>Facial Match Threshold</label>
                            <span>Minimum confidence % for system entry</span>
                        </div>
                        <input
                            type="number"
                            className="settings-input"
                            value={settings.facialThreshold}
                            onChange={(e) => setSettings({ ...settings, facialThreshold: e.target.value })}
                        />
                    </div>
                    <SettingToggle
                        label="Multi-Factor Authentication"
                        desc="Require facial verify after password"
                        value={settings.mfaEnabled}
                        onToggle={() => setSettings({ ...settings, mfaEnabled: !settings.mfaEnabled })}
                    />
                    <div className="setting-item">
                        <div className="setting-info">
                            <label>Session Timeout (Minutes)</label>
                            <span>Force logout after inactivity</span>
                        </div>
                        <input
                            type="number"
                            className="settings-input"
                            value={settings.sessionTimeout}
                            onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                        />
                    </div>
                </div>

                <div className="settings-group">
                    <h4><Bell size={18} color="var(--primary-color)" /> Notifications & Alerts <div className="header-line" /></h4>
                    <SettingToggle
                        label="System Notifications"
                        desc="Receive global system status updates"
                        value={settings.notifications}
                        onToggle={() => setSettings({ ...settings, notifications: !settings.notifications })}
                    />
                    <SettingToggle
                        label="High-Risk Entry Alerts"
                        desc="Alert on low confidence face matches"
                        value={settings.facialAlerts}
                        onToggle={() => setSettings({ ...settings, facialAlerts: !settings.facialAlerts })}
                    />
                </div>
            </div>

            <div className="settings-section">
                <div className="settings-group">
                    <h4><Globe size={18} color="var(--primary-color)" /> Organization Profile <div className="header-line" /></h4>
                    <div className="setting-item">
                        <div className="setting-info">
                            <label>Company Display Name</label>
                            <span>Used in headers and reports</span>
                        </div>
                        <input
                            type="text"
                            className="settings-input"
                            style={{ width: '200px' }}
                            value={settings.companyName}
                            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                        />
                    </div>
                    <div className="setting-item">
                        <div className="setting-info">
                            <label>Security Level</label>
                            <span>Governance policy level</span>
                        </div>
                        <select
                            className="settings-input"
                            value={settings.securityLevel}
                            onChange={(e) => setSettings({ ...settings, securityLevel: e.target.value })}
                        >
                            <option value="Standard">Standard</option>
                            <option value="Enterprise">Enterprise</option>
                            <option value="Military Grade">Military Grade</option>
                        </select>
                    </div>
                </div>

                <div className="settings-group">
                    <h4><Smartphone size={18} color="var(--primary-color)" /> Mobile Interface <div className="header-line" /></h4>
                    <SettingToggle
                        label="Auto-Enrollment"
                        desc="Enable mobile self-facial enrollment"
                        value={settings.autoEnrollment}
                        onToggle={() => setSettings({ ...settings, autoEnrollment: !settings.autoEnrollment })}
                    />
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            className="btn-add"
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}
                            onClick={handleSaveSettings}
                            disabled={settingsSaving}
                        >
                            {settingsSaving ? <Activity className="animate-pulse" size={18} /> : <Save size={18} />}
                            {settingsSaving ? 'Saving Configuration...' : 'Save All Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAttendance = () => (
        <section className="vision-content-card animate-fade-in">
            <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="icon-pulse">
                        <Activity size={20} color="var(--primary-color)" />
                    </div>
                    <h2>Biometric Attendance Logs</h2>
                </div>
                <div className="tag-premium">SYSTEM LIVE</div>
            </div>
            <div className="vision-table-container">
                <table className="vision-table">
                    <thead>
                        <tr>
                            <th>User Identifier</th>
                            <th>Auth Status</th>
                            <th>Face Match Confidence</th>
                            <th>Timestamp</th>
                            <th>Geo Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceLogs.length > 0 ? attendanceLogs.map(log => (
                            <tr key={log.id}>
                                <td>
                                    <div className="emp-info">
                                        <div className="emp-avatar small">
                                            {log.user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="name">{log.user?.username || 'Unknown User'}</p>
                                            <p className="id">ID: {log.user_id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-pill ${log.login_status === 'success' ? 'active' : 'inactive'}`}>
                                        {log.login_status === 'success' ? 'VERIFIED' : 'FAILED'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div className="confidence-track">
                                            <div
                                                className="confidence-fill"
                                                style={{
                                                    width: `${log.facial_confidence || 0}%`,
                                                    background: log.facial_confidence > 90 ? '#10b981' : '#f59e0b'
                                                }}
                                            />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>
                                            {log.facial_confidence ? `${log.facial_confidence}%` : 'N/A'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
                                        <Clock size={14} />
                                        {new Date(log.login_attempt_time).toLocaleString()}
                                    </div>
                                </td>
                                <td>
                                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Detected: 127.0.0.1 (Local)</span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="empty-state">No attendance logs available for this period.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );

    const renderDepartments = () => (
        <section className="vision-content-card animate-fade-in">
            <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Building2 size={24} color="var(--primary-color)" />
                    <h2>Organizational Units</h2>
                </div>
                <button className="btn-add" onClick={() => setShowDeptModal(true)}>
                    <UserPlus size={18} /> Create Department
                </button>
            </div>
            <div className="dept-grid">
                {departments.map(dept => (
                    <div key={dept.id} className="dept-card glass">
                        <div className="dept-header">
                            <div className="dept-icon">
                                <Users size={20} color="white" />
                            </div>
                            <h3>{dept.name}</h3>
                        </div>
                        <p className="dept-desc">{dept.description || 'No description provided for this department.'}</p>
                        <div className="dept-stats">
                            <div className="d-stat">
                                <span className="label">Headcount</span>
                                <span className="val">Dynamic</span>
                            </div>
                            <div className="d-stat">
                                <span className="label">Status</span>
                                <span className="val text-accent">ACTIVE</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );

    const renderPlaceholder = (title) => (
        <section className="vision-content-card">
            <div className="card-header">
                <h2>{title}</h2>
            </div>
            <div style={{ padding: '5rem', textAlign: 'center', color: '#94a3b8' }}>
                <Activity size={64} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                <h3>{title} Module</h3>
                <p>This module is currently being optimized for VisionHR Intelligence.</p>
            </div>
        </section>
    );

    return (
        <div className="vision-container">
            {/* Sidebar */}
            <aside className="vision-sidebar">
                <div className="vision-logo">
                    <div className="logo-icon">
                        <ScanFace size={24} color="white" />
                    </div>
                    <span>Admin Panel</span>
                </div>

                <nav className="vision-nav">
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <NavItem
                        icon={<Users size={20} />}
                        label="Employees"
                        active={activeTab === 'employees'}
                        onClick={() => setActiveTab('employees')}
                    />
                    <NavItem
                        icon={<Calendar size={20} />}
                        label="Attendance"
                        active={activeTab === 'attendance'}
                        onClick={() => setActiveTab('attendance')}
                    />
                    <NavItem
                        icon={<Building2 size={20} />}
                        label="Departments"
                        active={activeTab === 'departments'}
                        onClick={() => setActiveTab('departments')}
                    />
                    <NavItem
                        icon={<Settings size={20} />}
                        label="Settings"
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </nav>

                <div className="vision-user-profile" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    <div className="avatar">
                        <Users size={20} />
                    </div>
                    <div className="user-info">
                        <p className="user-name">{user?.username || 'Admin'}</p>
                        <p className="user-role">System Manager</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="vision-main">
                <header className="vision-header">
                    <div>
                        <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <p className="subtitle">
                            {activeTab === 'dashboard' ? 'Manage your workforce and facial recognition logs.' :
                                activeTab === 'employees' ? 'View and manage all organization employees.' :
                                    `Manage your ${activeTab} configuration.`}
                        </p>
                    </div>
                    {activeTab === 'employees' && (
                        <button className="btn-add" onClick={() => setShowAddModal(true)}>
                            <UserPlus size={18} /> Add Employee
                        </button>
                    )}
                    {activeTab === 'departments' && (
                        <button className="btn-add" onClick={() => setShowDeptModal(true)}>
                            <UserPlus size={18} /> Add Department
                        </button>
                    )}
                </header>

                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'employees' && renderEmployees()}
                {activeTab === 'attendance' && renderAttendance()}
                {activeTab === 'departments' && renderDepartments()}
                {activeTab === 'settings' && renderSettings()}

            </main>

            {/* Add Department Modal */}
            {showDeptModal && (
                <div className="vision-modal-overlay">
                    <div className="vision-modal glass animate-fade-in" style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <div>
                                <h3>Create Organization Unit</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Define a new department for the organization</p>
                            </div>
                            <button onClick={() => setShowDeptModal(false)} className="btn-close"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddDept} className="vision-form">
                            <div className="form-group">
                                <label>Department Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Research & Development"
                                    value={newDept.name}
                                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    rows="3"
                                    placeholder="Brief overview of department functions..."
                                    value={newDept.description}
                                    onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn-add w-full" disabled={isProcessing}>
                                {isProcessing ? 'Creating...' : 'Initialize Department'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="vision-modal-overlay">
                    <div className="vision-modal glass animate-fade-in">
                        <div className="modal-header">
                            <div>
                                <h3>{modalStep === 1 ? 'Add New Employee' : modalStep === 2 ? 'Facial Enrollment' : 'Employee Added'}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {modalStep === 1 ? 'Enter basic professional information' :
                                        modalStep === 2 ? 'Reference identity for biometric security' :
                                            'Configuration complete'}
                                </p>
                            </div>
                            <button onClick={resetModal} className="btn-close"><X size={20} /></button>
                        </div>

                        {modalStep === 1 ? (
                            <form onSubmit={handleAddEmployee} className="vision-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input type="text" required value={newEmployee.first_name} onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input type="text" required value={newEmployee.last_name} onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Username</label>
                                    <input type="text" required value={newEmployee.username} onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" required value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <select required value={newEmployee.department_id} onChange={(e) => setNewEmployee({ ...newEmployee, department_id: e.target.value })}>
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group facial-toggle">
                                    <input
                                        type="checkbox"
                                        id="enableFacial"
                                        checked={newEmployee.enableFacial}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, enableFacial: e.target.checked })}
                                    />
                                    <div className="toggle-info">
                                        <label htmlFor="enableFacial">Enable Facial Recognition</label>
                                        <span>Highly recommended for secure attendance tracking</span>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" onClick={resetModal} className="btn btn-outline" style={{ border: 'none' }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                                        {isProcessing ? 'Creating...' : newEmployee.enableFacial ? 'Continue to Enrollment' : 'Create Employee'}
                                    </button>
                                </div>
                            </form>
                        ) : modalStep === 2 ? (
                            <div className="enrollment-flow">
                                <div className="progress-container">
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${(capturedCount / 50) * 100}%` }}></div>
                                    </div>
                                    <span className="progress-text">{capturedCount} / 50 Reference Points</span>
                                </div>

                                <WebcamCapture onCapture={handleFaceCapture} isEnrolling={true} />

                                <div className="modal-footer" style={{ marginTop: '2rem' }}>
                                    <button className="btn btn-outline" onClick={() => setModalStep(3)} disabled={isProcessing}>Skip Enrollment</button>
                                    <button
                                        className="btn btn-primary"
                                        disabled={capturedCount < 50 || isProcessing}
                                        onClick={handleEnrollSubmit}
                                    >
                                        {isProcessing ? 'Processing...' : 'Link Biometric Identity'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="success-step" style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <div style={{ color: 'var(--accent-color)', marginBottom: '1.5rem' }}>
                                    <CheckCircle2 size={64} style={{ margin: '0 auto' }} />
                                </div>
                                <h3>Account Provisioned</h3>
                                <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
                                    Employee credentials and {capturedCount > 0 ? 'biometric data' : 'profile'} have been successfully synchronized with VisionHR Intelligence.
                                </p>
                                <button className="btn btn-primary" style={{ width: '100%' }} onClick={resetModal}>
                                    Perfect, understood
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* View/Edit/Delete Modals */}
            {actionType && selectedEmployee && (
                <div className="vision-modal-overlay">
                    <div className="vision-modal glass animate-fade-in">
                        <div className="modal-header">
                            <div>
                                <h3>{actionType === 'view' ? 'Employee Profile' : actionType === 'edit' ? 'Edit Employee' : 'Confirm Deletion'}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {actionType === 'view' ? 'Full systemic audit of record' :
                                        actionType === 'edit' ? 'Update professional information' :
                                            'Permanently remove record from system'}
                                </p>
                            </div>
                            <button onClick={() => { setActionType(null); setSelectedEmployee(null); }} className="btn-close"><X size={20} /></button>
                        </div>

                        {actionType === 'view' && (
                            <div className="vision-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <p className="view-value">{selectedEmployee.first_name}</p>
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <p className="view-value">{selectedEmployee.last_name}</p>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Employee ID</label>
                                    <p className="view-value">{selectedEmployee.employee_id}</p>
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <p className="view-value">{selectedEmployee.user?.email || 'N/A'}</p>
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <p className="view-value">{selectedEmployee.department?.name || 'N/A'}</p>
                                </div>
                                <div className="form-group">
                                    <label>Skills</label>
                                    <div className="skills-tags">
                                        {selectedEmployee.skills.map(s => (
                                            <span key={s.skill.id} className="skill-tag">{s.skill.name}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-primary" onClick={() => setActionType(null)}>Close View</button>
                                </div>
                            </div>
                        )}

                        {actionType === 'edit' && (
                            <form onSubmit={handleUpdateEmployee} className="vision-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input type="text" required value={selectedEmployee.first_name} onChange={(e) => setSelectedEmployee({ ...selectedEmployee, first_name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input type="text" required value={selectedEmployee.last_name} onChange={(e) => setSelectedEmployee({ ...selectedEmployee, last_name: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" required value={selectedEmployee.user?.email || ''} onChange={(e) => setSelectedEmployee({ ...selectedEmployee, user: { ...selectedEmployee.user, email: e.target.value } })} />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <select required value={selectedEmployee.department_id || ''} onChange={(e) => setSelectedEmployee({ ...selectedEmployee, department_id: e.target.value })}>
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" onClick={() => setActionType(null)} className="btn btn-outline" style={{ border: 'none' }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                                        {isProcessing ? 'Updating...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {actionType === 'delete' && (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <div style={{ color: 'var(--danger-color)', marginBottom: '1.5rem' }}>
                                    <Trash2 size={48} style={{ margin: '0 auto' }} />
                                </div>
                                <p style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Are you sure you want to delete?</p>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                    This will permanently remove <strong>{selectedEmployee.first_name} {selectedEmployee.last_name}</strong> from the database. This action cannot be undone.
                                </p>
                                <div className="modal-footer" style={{ justifyContent: 'center' }}>
                                    <button onClick={() => setActionType(null)} className="btn btn-outline" style={{ border: 'none' }}>Keep Record</button>
                                    <button onClick={handleDeleteEmployee} className="btn btn-danger" disabled={isProcessing} style={{ padding: '0.75rem 2rem' }}>
                                        {isProcessing ? 'Deleting...' : 'Yes, Delete'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .vision-container {
                    display: flex;
                    min-height: 100vh;
                    background: var(--bg-main);
                    color: var(--text-main);
                }

                .vision-sidebar {
                    width: 260px;
                    background: var(--bg-card);
                    border-right: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    padding: 1.5rem;
                }

                .vision-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin-bottom: 2.5rem;
                }

                .logo-icon {
                    background: var(--primary-color);
                    padding: 0.5rem;
                    border-radius: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    color: var(--text-muted);
                    text-decoration: none;
                    margin-bottom: 0.5rem;
                    transition: all 0.2s;
                    cursor: pointer;
                    font-weight: 500;
                }

                .nav-item:hover { background: #f1f5f9; color: var(--text-main); }
                .nav-item.active { background: #eff6ff; color: var(--primary-color); font-weight: 600; }

                .vision-user-profile {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 0.75rem;
                    margin-top: auto;
                    border: 1px solid var(--border-color);
                }

                .avatar {
                    width: 36px;
                    height: 36px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .user-info .user-name { font-weight: 600; font-size: 0.875rem; color: var(--text-main); }
                .user-info .user-role { font-size: 0.75rem; color: var(--text-muted); }

                .vision-main { flex: 1; padding: 2rem 3rem; overflow-y: auto; background-color: #f8fafc; }
                .vision-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; }
                .vision-header h1 { font-size: 1.75rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.025em; }
                .subtitle { color: var(--text-muted); }

                .btn-add {
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.25rem;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
                }
                .btn-add:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 6px 10px -1px rgba(37, 99, 235, 0.3); }

                .vision-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
                .stat-card { background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border-color); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                .stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
                .stat-value { font-size: 1.75rem; font-weight: 700; margin: 0.25rem 0; color: var(--text-main); }
                .stat-trend { font-size: 0.75rem; color: var(--text-muted); }
                .trend-up { color: #10b981; font-weight: 600; }

                .vision-content-card { background: white; border-radius: 1rem; border: 1px solid var(--border-color); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                .card-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); }
                .card-header h2 { font-size: 1.1rem; font-weight: 700; color: var(--text-main); }

                .search-bar { display: flex; align-items: center; gap: 0.75rem; background: #f8fafc; padding: 0.5rem 1rem; border-radius: 0.75rem; width: 300px; border: 1px solid var(--border-color); }
                .search-bar input { background: transparent; border: none; outline: none; width: 100%; color: var(--text-main); }
                
                .filter-bar { padding: 1rem 1.5rem; display: flex; gap: 1rem; border-bottom: 1px solid var(--border-color); background: #fcfcfc; }
                .filter-dropdown { padding: 0.5rem 1rem; background: white; border: 1px solid var(--border-color); border-radius: 0.5rem; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; position: relative; min-width: 140px; color: var(--text-main); }
                .filter-dropdown:hover { border-color: #cbd5e1; }

                .vision-table-wrapper { overflow-x: auto; }
                .vision-table { width: 100%; border-collapse: collapse; }
                .vision-table th { text-align: left; padding: 1rem 1.5rem; background: #f8fafc; color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; border-bottom: 1px solid var(--border-color); }
                .vision-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); color: var(--text-main); font-size: 0.9rem; }
                
                .emp-cell { display: flex; align-items: center; gap: 0.75rem; }
                .emp-avatar { width: 40px; height: 40px; background: #e0e7ff; color: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; border: 1px solid #c7d2fe; }
                .emp-name { font-weight: 600; color: var(--text-main); }
                .emp-id { font-size: 0.75rem; color: var(--text-muted); }
                
                .skill-tag { padding: 0.2rem 0.6rem; background: #f1f5f9; border-radius: 0.35rem; font-size: 0.75rem; margin-right: 0.4rem; color: var(--text-main); border: 1px solid #e2e8f0; font-weight: 500; }
                
                .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 0.5rem; }
                .status-dot.active { background: #10b981; }
                .status-dot.inactive { background: #ef4444; }
                
                .status-badge { padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; }
                .status-badge.present { background: #ecfdf5; color: #059669; border: 1px solid #d1fae5; }

                .vision-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
                .vision-modal { background: white; padding: 2rem; border-radius: 1.25rem; width: 550px; border: 1px solid var(--border-color); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
                .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
                .modal-header h3 { font-size: 1.25rem; color: var(--text-main); margin-bottom: 0.25rem; font-weight: 700; }
                
                .btn-close { background: #f1f5f9; border: none; color: var(--text-muted); padding: 0.4rem; border-radius: 0.5rem; cursor: pointer; display: flex; align-items: center; transition: all 0.2s; }
                .btn-close:hover { background: #fee2e2; color: #ef4444; }
                
                .action-icons { display: flex; gap: 0.25rem; }
                .action-icons button {
                    background: transparent;
                    border: 1px solid transparent;
                    color: var(--text-muted);
                    width: 32px;
                    height: 32px;
                    border-radius: 0.6rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .action-icons button:hover {
                    background: #f1f5f9;
                    color: var(--primary-color);
                }
                .action-icons .btn-delete-row:hover {
                    background: #fee2e2;
                    color: #ef4444;
                }

                /* Settings Styles */
                .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .settings-section { display: flex; flex-direction: column; gap: 1.5rem; }
                .settings-group { display: flex; flex-direction: column; gap: 1.25rem; padding: 1.5rem; background: white; border-radius: 1rem; border: 1px solid var(--border-color); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                .settings-group h4 { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
                .header-line { height: 1px; flex: 1; background: var(--border-color); }
                
                .setting-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; }
                .setting-info { display: flex; flex-direction: column; gap: 0.25rem; }
                .setting-info label { font-size: 0.9375rem; font-weight: 600; color: var(--text-main); }
                .setting-info span { font-size: 0.75rem; color: var(--text-muted); max-width: 200px; }
                
                .toggle-switch { width: 44px; height: 24px; background: #e2e8f0; border-radius: 12px; position: relative; cursor: pointer; transition: all 0.2s; border: 1px solid #cbd5e1; }
                .toggle-switch.active { background: var(--primary-color); border-color: var(--primary-hover); }
                .toggle-knob { width: 18px; height: 18px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
                .toggle-switch.active .toggle-knob { left: 22px; }
                
                .settings-input { background: white; border: 1px solid #cbd5e1; border-radius: 0.6rem; padding: 0.6rem 0.8rem; color: var(--text-main); font-size: 0.875rem; outline: none; transition: all 0.2s; }
                .settings-input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
                
                .view-value { padding: 0.75rem; background: #f8fafc; border: 1px solid var(--border-color); border-radius: 0.6rem; color: var(--text-main); font-weight: 500; }
                
                /* Activity Summary Styles */
                .activity-summary-list { display: flex; flex-direction: column; }
                .activity-item { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); transition: all 0.2s; }
                .activity-item:last-child { border-bottom: none; }
                .activity-item:hover { background: #f8fafc; }
                .activity-user { display: flex; align-items: center; gap: 1rem; }
                .activity-avatar { width: 36px; height: 36px; border-radius: 50%; background: #e0e7ff; color: var(--primary-color); border: 1px solid #c7d2fe; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; }
                .activity-info { display: flex; flex-direction: column; gap: 0.25rem; }
                .activity-title { font-size: 0.9rem; color: var(--text-main); }
                .user-name { font-weight: 700; color: var(--text-main); margin-right: 0.3rem }
                .activity-time { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem; }
                .activity-metrics { display: flex; align-items: center; gap: 1rem; }
                .confidence-badge { font-size: 0.75rem; font-weight: 700; color: var(--text-main); background: #f1f5f9; padding: 0.25rem 0.6rem; border-radius: 2rem; border: 1px solid var(--border-color); }
                
                .view-all-btn { background: white; border: 1px solid var(--border-color); color: var(--text-muted); padding: 0.4rem 0.8rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .view-all-btn:hover { background: #f8fafc; color: var(--text-main); border-color: #cbd5e1; }
                
                /* Attendance & Confidence Styles */
                .confidence-track { width: 100px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
                .confidence-fill { height: 100%; border-radius: 3px; transition: width 1s ease-out; }
                .icon-pulse { background: #e0e7ff; padding: 0.5rem; border-radius: 0.5rem; }
                
                .tag-premium { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.05em; }
                .emp-avatar.small { width: 32px; height: 32px; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; background: #f1f5f9; border-radius: 50%; border: 1px solid var(--border-color); color: var(--text-muted); font-weight: 600; }

                /* Department Styles */
                .dept-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; padding-top: 1rem; }
                .dept-card { padding: 1.5rem; border-radius: 1.25rem; transition: transform 0.3s; background: white; border: 1px solid var(--border-color); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                .dept-card:hover { transform: translateY(-3px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-color: #cbd5e1; }
                .dept-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
                .dept-icon { width: 40px; height: 40px; background: #eff6ff; color: var(--primary-color); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; border: 1px solid #dbeafe; }
                .dept-card h3 { font-size: 1.125rem; font-weight: 600; color: var(--text-main); }
                .dept-desc { font-size: 0.875rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.5rem; min-height: 3rem; }
                .dept-stats { display: flex; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--border-color); }
                .d-stat { display: flex; flex-direction: column; gap: 0.25rem; }
                .d-stat .label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700; }
                .d-stat .val { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
                .d-stat .val.text-accent { color: #10b981; }
                
                .btn-danger { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; padding: 0.75rem 1.25rem; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .btn-danger:hover { background: #fecaca; color: #991b1b; }

                .vision-form { display: flex; flex-direction: column; gap: 1.25rem; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label { font-size: 0.875rem; font-weight: 600; color: var(--text-main); }
                .form-group input, .form-group select { padding: 0.75rem; background: white; border: 1px solid #cbd5e1; border-radius: 0.6rem; color: var(--text-main); outline: none; transition: all 0.2s; }
                .form-group input:focus, .form-group select:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
                .form-group textarea { padding: 0.75rem; background: white; border: 1px solid #cbd5e1; border-radius: 0.6rem; color: var(--text-main); outline: none; transition: all 0.2s; font-family: inherit; resize: vertical; }

                .facial-toggle { flexDirection: row; alignItems: center; gap: 1rem; marginTop: 0.5rem; padding: 1rem; background: #eff6ff; border-radius: 0.75rem; border: 1px solid #dbeafe; }
                .facial-toggle input[type="checkbox"] { width: 20px; height: 20px; cursor: pointer; accent-color: var(--primary-color); }
                .toggle-info { display: flex; flexDirection: column; }
                .toggle-info label { cursor: pointer; color: var(--text-main); font-size: 0.9rem; font-weight: 600; }
                .toggle-info span { font-size: 0.75rem; color: var(--text-muted); }

                .enrollment-flow { display: flex; flex-direction: column; gap: 1.5rem; }
                .progress-container { background: #f8fafc; padding: 1rem; border-radius: 0.75rem; border: 1px solid var(--border-color); }
                .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem; }
                .progress-fill { height: 100%; background: var(--primary-color); transition: width 0.3s ease; }
                .progress-text { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }

                .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }

                .card-footer { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; color: var(--text-muted); font-size: 0.875rem; border-top: 1px solid var(--border-color); }
                .pagination { display: flex; gap: 0.5rem; }
                .btn-page { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); background: white; color: var(--text-muted); border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; }
                .btn-page:hover { background: #f8fafc; color: var(--text-main); border-color: #cbd5e1; }
                
                .status-pill { padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
                .status-pill.active { background: rgba(16, 185, 129, 0.1); color: #059669; border: 1px solid rgba(16, 185, 129, 0.1); }
                .status-pill.inactive { background: rgba(239, 68, 68, 0.1); color: #b91c1c; border: 1px solid rgba(239, 68, 68, 0.1); }

                @media (max-width: 1024px) {
                    .vision-sidebar { width: 80px; }
                    .vision-logo span, .nav-item span, .user-info, .subtitle { display: none; }
                }
            `}</style>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }) => (
    <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
        {icon}
        <span>{label}</span>
    </div>
);

const StatCard = ({ title, value, trend, icon }) => (
    <div className="stat-card">
        <div className="stat-header">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
            {icon}
        </div>
        <p className="stat-value">{value}</p>
        <p className={`stat-trend ${trend.includes('+') ? 'trend-up' : ''}`}>{trend}</p>
    </div>
);

const FilterDropdown = ({ label, options, onChange }) => (
    <div className="filter-dropdown">
        <select
            onChange={(e) => onChange && onChange(e.target.value)}
            style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: 'inherit', cursor: 'pointer', appearance: 'none',
                width: '100%', paddingRight: '1rem',
                fontSize: '0.875rem', fontWeight: '500'
            }}
        >
            <option value="">{label}</option>
            {options?.map(opt => (
                <option key={opt.value || opt} value={opt.value || opt}>
                    {opt.label || opt}
                </option>
            ))}
        </select>
        <MoreVertical size={14} style={{ position: 'absolute', right: '0.5rem', pointerEvents: 'none', opacity: 0.5 }} />
    </div>
);

export default VisionHRDashboard;
