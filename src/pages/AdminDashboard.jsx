import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return navigate('/login');
    const user = JSON.parse(userStr);
    if (user.role !== 'ADMIN') return navigate('/');

    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes, logsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/system-health')
        ]);
        
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setLogs(logsRes.data);
      } catch (error) {
        console.error('Failed to fetch admin data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  if (loading) {
    return (
      <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-[calc(100vh-72px)] flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
      </main>
    );
  }

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-[calc(100vh-72px)] flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <span className="material-symbols-outlined text-[32px] text-error">admin_panel_settings</span>
        <h1 className="text-headline-lg font-headline-lg text-on-surface">Platform Administration</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-8">
        {['overview', 'users', 'system logs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-label-lg font-label-lg capitalize transition-colors ${
              activeTab === tab
                ? 'text-error border-b-2 border-error'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Total Platform Revenue" value={`₹${stats?.platformRevenue?.toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon="attach_money" color="text-[#10B981]" />
              <MetricCard title="Total Users" value={stats?.totalUsers?.toLocaleString()} icon="group" color="text-secondary" />
              <MetricCard title="Active Stores" value={stats?.totalStores?.toLocaleString()} icon="storefront" color="text-tertiary" />
              <MetricCard title="Global AI Accuracy" value={`${stats?.globalAiAccuracy}%`} icon="psychology" color="text-primary" />
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h3 className="text-title-lg font-title-lg text-on-surface mb-4">Platform Growth</h3>
              <div className="h-64 flex items-center justify-center bg-surface-container-high rounded-xl border border-white/5">
                 <p className="text-on-surface-variant text-label-md">Interactive charts will be rendered here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-white/10 text-label-md text-on-surface-variant uppercase tracking-wider">
                  <th className="p-4">User ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-body-sm text-on-surface-variant font-mono">{u.id.slice(0, 8)}...</td>
                    <td className="p-4 text-body-md text-on-surface font-medium">{u.first_name} {u.last_name}</td>
                    <td className="p-4 text-body-md text-on-surface-variant">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-error/20 text-error' : u.role === 'SELLER' ? 'bg-secondary/20 text-secondary' : 'bg-surface-variant text-on-surface-variant'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-body-sm text-on-surface-variant">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button className="text-on-surface-variant hover:text-error transition-colors ml-2" title="Suspend User">
                        <span className="material-symbols-outlined text-[20px]">block</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'system logs' && (
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden bg-black/50 font-mono">
             <div className="bg-surface-container-high p-3 border-b border-white/10 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error"></div>
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                <span className="ml-2 text-label-sm text-on-surface-variant">terminal - one8_system_logs</span>
             </div>
             <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto text-sm">
                {logs.map(log => (
                  <div key={log.id} className="flex gap-4">
                     <span className="text-on-surface-variant/50">{new Date(log.timestamp).toLocaleTimeString()}</span>
                     <span className={`${log.type === 'INFO' ? 'text-blue-400' : log.type === 'WARNING' ? 'text-[#F59E0B]' : 'text-error'} font-bold w-16`}>[{log.type}]</span>
                     <span className="text-on-surface/80">{log.message}</span>
                  </div>
                ))}
                <div className="flex gap-4 pt-2">
                     <span className="text-on-surface-variant/50">{new Date().toLocaleTimeString()}</span>
                     <span className="text-[#10B981] font-bold w-16">[{'READY'}]</span>
                     <span className="text-on-surface/80 animate-pulse">_</span>
                </div>
             </div>
          </div>
        )}
      </div>
    </main>
  );
}

function MetricCard({ title, value, icon, color }) {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 flex items-center justify-between">
      <div>
        <p className="text-label-md text-on-surface-variant mb-1">{title}</p>
        <h3 className="text-headline-md font-headline-md text-on-surface">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center border border-white/5 ${color}`}>
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
    </div>
  );
}
