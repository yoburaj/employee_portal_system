import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity } from 'lucide-react';
import SuperAdminDashboard from '../../pages/SuperAdminDashboard/SuperAdminDashboard';
import EmployeeDashboard from '../../pages/EmployeeDashboard/EmployeeDashboard';

const Dashboard = () => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="flex-center" style={{ height: '100vh', background: 'var(--bg-main)' }}>
            <div className="glass flex-center animate-scale-in" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', gap: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)' }}>
                <Activity className="animate-spin text-primary" size={24} />
                <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>Synchronizing Secure Workspace...</span>
            </div>
        </div>
    );

    if (!user) return null;

    // Route to appropriate dashboard based on role
    if (user.role === 'super_admin' || user.role === 'admin') {
        return <SuperAdminDashboard />;
    }

    return <EmployeeDashboard />;
};

export default Dashboard;
