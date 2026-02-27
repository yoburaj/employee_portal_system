import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Layout, Users, User, Building2, BrainCircuit, Activity, Clock, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import VisionHRDashboard from './VisionHRDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({
        total_employees: 0,
        total_departments: 0,
        total_skills: 0,
        active_users: 0,
        recent_logins: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const [statsResp, logsResp] = await Promise.all([
                    axios.get(`${API_BASE}/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_BASE}/admin/auth-logs`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setStats({ ...statsResp.data.data, recent_logins: logsResp.data });
            } catch (err) {
                console.error("Failed to load dashboard data");
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1>System Overview</h1>
                <p style={{ color: 'var(--text-muted)' }}>Super Admin Control Panel</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard icon={<Users color="#6366f1" />} title="Total Employees" value={stats.total_employees} />
                <StatCard icon={<Building2 color="#10b981" />} title="Departments" value={stats.total_departments} />
                <StatCard icon={<BrainCircuit color="#f59e0b" />} title="Registered Skills" value={stats.total_skills} />
                <StatCard icon={<Activity color="#6366f1" />} title="Active Sessions" value={stats.active_users} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="card glass">
                    <h3>Authentication Audit Log</h3>
                    <div style={{ marginTop: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '0.75rem 0' }}>User</th>
                                    <th>Status</th>
                                    <th>Confidence</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent_logins.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '0.875rem' }}>
                                        <td style={{ padding: '1rem 0' }}>{log.user?.username || 'Unknown'}</td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.25rem',
                                                fontSize: '0.75rem',
                                                background: log.login_status === 'success' ? 'rgba(16, 185, 129,0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: log.login_status === 'success' ? 'var(--accent-color)' : 'var(--danger-color)'
                                            }}>
                                                {log.login_status}
                                            </span>
                                        </td>
                                        <td>{log.facial_confidence ? `${log.facial_confidence}%` : '-'}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{new Date(log.login_attempt_time).toLocaleTimeString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card glass">
                    <h3>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>Add New Employee</button>
                        <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>Manage Departments</button>
                        <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>System Settings</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Redundant component removed as it's now in EmployeeDashboard.jsx

const StatCard = ({ icon, title, value }) => (
    <div className="card glass animate-fade-in" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '0.75rem'
            }}>
                {icon}
            </div>
            <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{title}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</p>
            </div>
        </div>
    </div>
);

const ProfileInfoItem = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
        <div style={{ color: 'var(--text-muted)', width: '24px' }}>{icon}</div>
        <div style={{ color: 'var(--text-muted)', width: '100px' }}>{label}</div>
        <div style={{ fontWeight: '500' }}>{value}</div>
    </div>
);

const Dashboard = () => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
                <Activity className="animate-pulse" style={{ marginRight: '0.5rem' }} /> Loading Secure Dashboard...
            </div>
        </div>
    );

    if (!user) return null;

    if (user.role === 'super_admin' || user.role === 'admin') return <VisionHRDashboard />;
    return <EmployeeDashboard />;
};

export default Dashboard;
