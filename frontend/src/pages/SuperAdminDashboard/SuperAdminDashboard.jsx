import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users, Building2, Calendar, Settings, Plus, Search,
    Filter, MoreVertical, LogOut, LayoutDashboard, CheckCircle2,
    Clock, Shield, ArrowUpRight, Trash2, Edit2, Eye, X, Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import WebcamCapture from '../../components/common/WebcamCapture';
import './SuperAdminDashboard.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const SuperAdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('employees');
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [authLogs, setAuthLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [modalStep, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    // Selected items for view/edit/delete
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [actionType, setActionType] = useState(null); // 'view', 'edit', 'delete'

    const [newEmployee, setNewEmployee] = useState({
        username: '', email: '', first_name: '', last_name: '',
        department_id: '', role: 'employee', enableFacial: true
    });

    const [newDept, setNewDept] = useState({ name: '', description: '' });
    const [capturedCount, setCapturedCount] = useState(0);
    const [capturedImages, setCapturedImages] = useState([]);

    // Department edit / delete state
    const [selectedDept, setSelectedDept] = useState(null);
    const [deptActionType, setDeptActionType] = useState(null); // 'edit' | 'delete'
    const [editDeptData, setEditDeptData] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const [empResp, deptResp, logResp] = await Promise.all([
                axios.get(`${API_BASE}/admin/employees`, { headers }),
                axios.get(`${API_BASE}/admin/departments`, { headers }),
                axios.get(`${API_BASE}/admin/auth-logs`, { headers })
            ]);
            setEmployees(empResp.data);
            setDepartments(deptResp.data);
            setAuthLogs(logResp.data);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const resp = await axios.post(`${API_BASE}/auth/signup`, {
                ...newEmployee,
                department_id: parseInt(newEmployee.department_id),
                password: 'InitialPassword123!', // System generated
                skills: []
            });
            if (newEmployee.enableFacial) {
                setSelectedEmployee({ id: resp.data.id });
                setStep(2);
            } else {
                setStep(3);
                fetchData();
            }
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to create employee");
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
            body.append('user_id', selectedEmployee.id);
            for (let i = 0; i < capturedImages.length; i++) {
                const blob = await (await fetch(capturedImages[i])).blob();
                body.append('face_images', blob, `face_${i}.jpg`);
            }
            await axios.post(`${API_BASE}/auth/facial-enroll`, body);
            setStep(3);
            fetchData();
        } catch (err) {
            alert("Facial enrollment failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE}/admin/employees/${selectedEmployee.id}`, {
                first_name: selectedEmployee.first_name,
                last_name: selectedEmployee.last_name,
                department_id: parseInt(selectedEmployee.department_id)
            }, { headers: { Authorization: `Bearer ${token}` } });
            setActionType(null);
            fetchData();
        } catch (err) {
            alert("Update failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteEmployee = async () => {
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE}/admin/employees/${selectedEmployee.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActionType(null);
            fetchData();
        } catch (err) {
            alert("Deletion failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddDept = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE}/admin/departments`, newDept, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowDeptModal(false);
            setNewDept({ name: '', description: '' });
            fetchData();
        } catch (err) {
            alert("Failed to create department");
        } finally {
            setIsProcessing(false);
        }
    };

    const resetModal = () => {
        setShowAddModal(false);
        setStep(1);
        setCapturedCount(0);
        setCapturedImages([]);
        setNewEmployee({ username: '', email: '', first_name: '', last_name: '', department_id: '', role: 'employee', enableFacial: true });
    };

    const handleUpdateDept = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const resp = await axios.put(`${API_BASE}/admin/departments/${selectedDept.id}`, editDeptData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(prev => prev.map(d => d.id === resp.data.id ? resp.data : d));
            setDeptActionType(null);
            setSelectedDept(null);
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to update department');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteDept = async () => {
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE}/admin/departments/${selectedDept.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(prev => prev.filter(d => d.id !== selectedDept.id));
            setDeptActionType(null);
            setSelectedDept(null);
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to delete department');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate Dynamic Stats
    const getWorkforceDistribution = () => {
        if (!employees.length || !departments.length) return { dist: [], topDept: null };
        const deptCounts = {};
        employees.forEach(emp => {
            const deptId = emp.department_id;
            if (deptId) {
                deptCounts[deptId] = (deptCounts[deptId] || 0) + 1;
            }
        });

        let dist = departments.map(d => ({
            ...d,
            count: deptCounts[d.id] || 0,
            percentage: Math.round(((deptCounts[d.id] || 0) / employees.length) * 100)
        })).filter(d => d.count > 0).sort((a, b) => b.count - a.count);

        return { dist, topDept: dist[0] || departments[0] || { name: 'N/A', percentage: 0 } };
    };

    const getSecurityAlerts = () => {
        const last24h = new Date();
        last24h.setHours(last24h.getHours() - 24);
        return authLogs.filter(log => {
            const logTime = new Date(log.login_attempt_time);
            return logTime > last24h && (log.login_status === 'failed' || log.facial_confidence < 50);
        }).length;
    };

    const { dist: workforceDist, topDept } = getWorkforceDistribution();
    const securityAlertsCount = getSecurityAlerts();

    return (
        <div className="vision-container">
            <aside className="vision-sidebar">
                <div className="vision-logo">
                    <div className="logo-icon"><Users color="white" size={20} /></div>
                    <span>Fusion Staffing</span>
                </div>
                <nav>
                    <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <NavItem icon={<Users size={20} />} label="Employees" active={activeTab === 'employees'} onClick={() => setActiveTab('employees')} />
                    <NavItem icon={<Building2 size={20} />} label="Departments" active={activeTab === 'departments'} onClick={() => setActiveTab('departments')} />
                    <NavItem icon={<Calendar size={20} />} label="Time & Attendance" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
                </nav>

                <div className="vision-user-profile">
                    <div className="avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
                    <div className="user-info">
                        <p className="user-name">{user?.username || 'Unknown'}</p>
                        <p className="user-role">{user?.role?.replace('_', ' ') || ''}</p>
                    </div>
                    <LogOut size={18} style={{ marginLeft: 'auto', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={logout} />
                </div>
            </aside>

            <main className="vision-main">
                <header className="vision-header">
                    <div>
                        <h1>{activeTab === 'overview' ? 'Command Center' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <p className="subtitle">Synchronized with VisionHR Core v4.2</p>
                    </div>
                    {activeTab === 'employees' && (
                        <button className="btn btn-primary animate-fade-in" onClick={() => setShowAddModal(true)}>
                            <Plus size={18} /> Provision Employee
                        </button>
                    )}
                    {activeTab === 'departments' && (
                        <button className="btn btn-primary animate-fade-in" onClick={() => setShowDeptModal(true)}>
                            <Plus size={18} /> New Department
                        </button>
                    )}
                </header>

                {activeTab === 'overview' && (
                    <div className="vision-overview animate-fade-in animate-slide-up">
                        <div className="vision-stats">
                            <StatCard title="Total Workforce" value={employees.length} trend="+4.2%" icon={<Users size={20} color="var(--primary-color)" />} />
                            <StatCard title="Active Systems" value={departments.length} trend="Stable" icon={<Building2 size={20} color="var(--primary-color)" />} />
                            <StatCard title="Security Alerts" value={securityAlertsCount} trend={`${securityAlertsCount > 0 ? 'Action Required' : '0% (24h)'}`} icon={<Shield size={20} color={securityAlertsCount > 0 ? "#ef4444" : "#10b981"} />} />
                            <StatCard title="System Uptime" value="99.9%" trend="+0.1%" icon={<ArrowUpRight size={20} color="#10b981" />} />
                        </div>

                        <div className="vision-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                            <div className="vision-content-card glass">
                                <div className="card-header">
                                    <h2>Global Activity Log</h2>
                                    <button className="view-all-btn">Export Audit</button>
                                </div>
                                <div className="activity-summary-list">
                                    {authLogs.slice(0, 5).map((log, i) => (
                                        <div key={i} className="activity-item">
                                            <div className="activity-user">
                                                <div className="activity-avatar">{log.user?.username?.[0].toUpperCase()}</div>
                                                <div className="activity-info">
                                                    <p className="activity-title"><span className="user-name">{log.user?.username}</span> accessed the portal</p>
                                                    <p className="activity-time"><Clock size={12} /> {new Date(log.login_attempt_time).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                            <div className="activity-metrics">
                                                <div className="confidence-badge">
                                                    {log.facial_confidence}% Biometric Match
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="vision-content-card glass">
                                <div className="card-header">
                                    <h2>Workforce Distribution</h2>
                                </div>
                                <div style={{ padding: '2rem', textAlign: 'center' }}>
                                    <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto', borderRadius: '50%', background: `conic-gradient(var(--primary-color) 0% ${topDept?.percentage || 0}%, #c7d2fe ${topDept?.percentage || 0}% 100%)` }}>
                                        <div style={{ position: 'absolute', inset: '20px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{topDept?.percentage || 0}%</span>
                                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{topDept?.name || 'NO DATA'}</span>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {workforceDist.length > 0 ? workforceDist.map((d, idx) => (
                                            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: idx === 0 ? 'var(--primary-color)' : '#c7d2fe' }}></div>
                                                    {d.name}
                                                </span>
                                                <span style={{ fontWeight: '600' }}>{d.percentage}%</span>
                                            </div>
                                        )) : (
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No departmental data available.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'employees' && (
                    <div className="vision-content-card glass animate-fade-in animate-slide-up">
                        <div className="card-header">
                            <div className="search-bar">
                                <Search size={18} color="var(--text-muted)" />
                                <input type="text" placeholder="Search by name or serial ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div className="filter-dropdown"><Filter size={14} /> All Departments</div>
                                <div className="filter-dropdown"><Filter size={14} /> Active Only</div>
                            </div>
                        </div>
                        <div className="vision-table-wrapper">
                            {filteredEmployees.length > 0 ? (
                                <table className="vision-table">
                                    <thead>
                                        <tr>
                                            <th>Employee Identity</th>
                                            <th>Departmental Unit</th>
                                            <th>Sync Status</th>
                                            <th>Primary Skills</th>
                                            <th>Security Integrity</th>
                                            <th style={{ textAlign: 'right' }}>Management</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEmployees.map((emp) => (
                                            <tr key={emp.id}>
                                                <td>
                                                    <div className="emp-cell">
                                                        <div className="emp-avatar">{emp.first_name[0]}{emp.last_name[0]}</div>
                                                        <div>
                                                            <p className="emp-name">{emp.first_name} {emp.last_name}</p>
                                                            <p className="emp-id">{emp.employee_id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{emp.department?.name || 'Unassigned'}</td>
                                                <td><span className="status-badge present">Synchronized</span></td>
                                                <td>
                                                    <div className="skills-tags">
                                                        {emp.skills?.slice(0, 2).map(s => <span key={s.skill.id} className="skill-tag">{s.skill.name}</span>)}
                                                        {emp.skills?.length > 2 && <span className="skill-tag">+{emp.skills.length - 2}</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div className="confidence-track"><div className="confidence-fill" style={{ width: '98%', background: '#10b981' }}></div></div>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>98%</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="action-icons" style={{ justifyContent: 'flex-end' }}>
                                                        <button onClick={() => { setSelectedEmployee(emp); setActionType('view'); }}><Eye size={16} /></button>
                                                        <button onClick={() => { setSelectedEmployee(emp); setActionType('edit'); }}><Edit2 size={16} /></button>
                                                        <button className="btn-delete-row" onClick={() => { setSelectedEmployee(emp); setActionType('delete'); }}><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon glass-sub">
                                        <Users size={32} color="var(--primary-color)" />
                                    </div>
                                    <h3>No Personnel Found</h3>
                                    <p>The workforce registry is currently empty or no matches were found. Provision a new employee to populate the system.</p>
                                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ marginTop: '1rem' }}>
                                        <Plus size={18} /> Provision First Employee
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="card-footer">
                            <span>Showing {filteredEmployees.length} registered personnel</span>
                            <div className="pagination">
                                <button className="btn-page active">1</button>
                                <button className="btn-page">2</button>
                                <button className="btn-page">3</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'departments' && (
                    <div className="dept-grid animate-fade-in animate-slide-up">
                        {departments.map(dept => (
                            <div key={dept.id} className="dept-card glass">
                                <div className="dept-header">
                                    <div className="dept-icon"><Building2 size={24} /></div>
                                    <h3>{dept.name}</h3>
                                    <div className="dept-actions">
                                        <button
                                            className="dept-action-btn edit"
                                            title="Edit Department"
                                            onClick={() => {
                                                setSelectedDept(dept);
                                                setEditDeptData({ name: dept.name, description: dept.description || '' });
                                                setDeptActionType('edit');
                                            }}
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            className="dept-action-btn delete"
                                            title="Delete Department"
                                            onClick={() => { setSelectedDept(dept); setDeptActionType('delete'); }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <p className="dept-desc">{dept.description || 'No specialized description provided for this operational unit.'}</p>
                                <div className="dept-stats">
                                    <div className="d-stat">
                                        <span className="label">Workforce</span>
                                        <span className="val">{employees.filter(e => e.department_id === dept.id).length}</span>
                                    </div>
                                    <div className="d-stat">
                                        <span className="label">Unit Load</span>
                                        <span className="val text-accent">High Efficiency</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="vision-content-card glass animate-fade-in">
                        <div className="card-header">
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="filter-dropdown">This Week</div>
                                <div className="filter-dropdown">All Departments</div>
                            </div>
                            <button className="btn-add" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Generate Integrity Report</button>
                        </div>
                        <div className="vision-table-wrapper">
                            <table className="vision-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Access Event</th>
                                        <th>Verification Method</th>
                                        <th>System Confidence</th>
                                        <th>Timestamp</th>
                                        <th>Terminal ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {authLogs.map((log, i) => (
                                        <tr key={i}>
                                            <td>
                                                <div className="emp-cell">
                                                    <div className="emp-avatar small">{log.user?.username?.[0].toUpperCase()}</div>
                                                    <span style={{ fontWeight: 600 }}>{log.user?.username}</span>
                                                </div>
                                            </td>
                                            <td><span className="status-pill active">{log.login_status}</span></td>
                                            <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Shield size={14} color="var(--primary-color)" /> Biometric-AI</div></td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div className="confidence-track" style={{ width: '60px' }}>
                                                        <div className="confidence-fill" style={{ width: `${log.facial_confidence}%`, background: log.facial_confidence > 80 ? '#10b981' : '#f59e0b' }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem' }}>{log.facial_confidence}%</span>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(log.login_attempt_time).toLocaleString()}</td>
                                            <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>MAIN_GATE_0{i % 4 + 1}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}


            </main>

            {/* Modals - Same logic as before but with updated structure */}
            {showDeptModal && (
                <div className="vision-modal-overlay">
                    <div className="vision-modal glass animate-fade-in">
                        <div className="modal-header">
                            <div>
                                <h3>Initialize Departmental Unit</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configure a new specialized wing in the organization</p>
                            </div>
                            <button onClick={() => setShowDeptModal(false)} className="btn-close"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddDept} className="vision-form">
                            <div className="form-group">
                                <label>Department Designation</label>
                                <input type="text" placeholder="e.g. AI Research & Reliability" required value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Mission Parameters (Description)</label>
                                <textarea
                                    placeholder="Briefly describe the unit's core function..."
                                    rows={4}
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

                                <WebcamCapture onCapture={handleFaceCapture} isEnrolling={true} loading={isProcessing} />

                                <div className="modal-footer" style={{ marginTop: '2rem' }}>
                                    <button className="btn btn-outline" onClick={() => setStep(3)} disabled={isProcessing}>Skip Enrollment</button>
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

            {/* Department Edit / Delete Modals */}
            {deptActionType && selectedDept && (
                <div className="vision-modal-overlay">
                    <div className="vision-modal glass animate-fade-in">
                        <div className="modal-header">
                            <div>
                                <h3>{deptActionType === 'edit' ? 'Edit Department' : 'Delete Department'}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {deptActionType === 'edit' ? 'Update department details' : 'This action cannot be undone'}
                                </p>
                            </div>
                            <button onClick={() => { setDeptActionType(null); setSelectedDept(null); }} className="btn-close"><X size={20} /></button>
                        </div>

                        {deptActionType === 'edit' ? (
                            <form onSubmit={handleUpdateDept} className="vision-form">
                                <div className="form-group">
                                    <label>Department Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={editDeptData.name}
                                        onChange={e => setEditDeptData({ ...editDeptData, name: e.target.value })}
                                        placeholder="e.g. Engineering"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        rows={3}
                                        value={editDeptData.description}
                                        onChange={e => setEditDeptData({ ...editDeptData, description: e.target.value })}
                                        placeholder="Briefly describe this department's function..."
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" onClick={() => { setDeptActionType(null); setSelectedDept(null); }} className="btn btn-outline" style={{ border: 'none' }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                                        {isProcessing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <div style={{ color: 'var(--danger-color)', marginBottom: '1.5rem' }}>
                                    <Trash2 size={48} style={{ margin: '0 auto' }} />
                                </div>
                                <p style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Delete this department?</p>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                    This will permanently remove <strong>{selectedDept.name}</strong> from the system. This action cannot be undone.
                                </p>
                                <div className="modal-footer" style={{ justifyContent: 'center' }}>
                                    <button onClick={() => { setDeptActionType(null); setSelectedDept(null); }} className="btn btn-outline" style={{ border: 'none' }}>Cancel</button>
                                    <button onClick={handleDeleteDept} className="btn btn-danger" disabled={isProcessing} style={{ padding: '0.75rem 2rem' }}>
                                        {isProcessing ? 'Deleting...' : 'Yes, Delete'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
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

export default SuperAdminDashboard;
