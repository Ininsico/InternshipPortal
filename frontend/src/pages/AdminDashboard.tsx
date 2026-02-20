import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    LogOut,
    ShieldCheck,
    Users,
    Briefcase,
    Building2,
    FileText,
    Search,
    Bell,
    Settings,
    Download,
    Plus,
    UserPlus,
    Loader2,
    LayoutDashboard,
    MoreVertical
} from 'lucide-react';

type AdminTab = 'overview' | 'students' | 'faculty' | 'companies' | 'reports' | 'settings';

const API_BASE = 'http://localhost:5000/api/admin';

const AdminDashboard = () => {
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeApplications: 0,
        completedPlacements: 0,
        placementRate: 0
    });
    const [students, setStudents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'admin' });

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [statsRes, studentsRes] = await Promise.all([
                    axios.get(`${API_BASE}/stats`, config),
                    axios.get(`${API_BASE}/students`, config)
                ]);

                if (statsRes.data.success) {
                    setStats(statsRes.data.stats);
                    setRecentActivity(statsRes.data.recentActivity);
                }
                if (studentsRes.data.success) {
                    setStudents(studentsRes.data.students);
                }

                if (user?.role === 'super_admin') {
                    const facultyRes = await axios.get(`${API_BASE}/faculty`, config);
                    if (facultyRes.data.success) {
                        setFaculty(facultyRes.data.admins);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, user?.role]);

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post(`${API_BASE}/create-admin`, newAdmin, config);
            if (data.success) {
                setFaculty([...faculty, data.admin] as any);
                setShowAddAdminModal(false);
                setNewAdmin({ name: '', email: '', role: 'admin' });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const isSuperAdmin = user?.role === 'super_admin';

    const menuItems = [
        { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { key: 'students', label: 'Student Records', icon: Users },
        { key: 'faculty', label: 'Faculty Staff', icon: ShieldCheck, roles: ['super_admin'] },
        { key: 'companies', label: 'Partner Companies', icon: Building2 },
        { key: 'reports', label: 'Reports', icon: FileText },
        { key: 'settings', label: 'Settings', icon: Settings },
    ];

    const sidebarItems = menuItems.filter(item => !item.roles || item.roles.includes(user?.role || ''));

    return (
        <div className="flex min-h-screen bg-white">
            <aside className="fixed left-0 top-0 z-40 h-screen w-16 flex-col border-r border-slate-100 bg-white md:w-64">
                <div className="flex h-16 items-center border-b border-slate-100 px-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <span className="ml-3 hidden text-sm font-black tracking-tight text-slate-900 md:block uppercase">CU Portal</span>
                </div>
                <nav className="flex-1 space-y-1 p-3">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key as AdminTab)}
                            className={`flex w-full items-center rounded-lg px-3 py-2.5 transition-all ${activeTab === item.key
                                ? 'bg-blue-50 text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="ml-3 hidden text-xs font-bold uppercase tracking-wider md:block">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="border-t border-slate-100 p-3">
                    <button
                        onClick={logout}
                        className="flex w-full items-center rounded-lg px-3 py-2.5 text-slate-500 transition-all hover:bg-red-50 hover:text-red-500"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span className="ml-3 hidden text-xs font-bold uppercase tracking-wider md:block">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="ml-16 flex-1 md:ml-64">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-8 backdrop-blur-xl">
                    <div className="flex items-center">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                            {sidebarItems.find(t => t.key === activeTab)?.label}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 border-r border-slate-100 pr-4">
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-900 leading-none">{user?.name}</p>
                                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-blue-600">{user?.role === 'super_admin' ? 'Super Admin' : 'Admin Staff'}</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-600">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                        <button className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-900">
                            <Bell className="h-4.5 w-4.5" />
                        </button>
                    </div>
                </header>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[60vh] items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'overview' && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                                            <MetricCard label="Total Students" value={stats.totalStudents} progress={100} />
                                            <MetricCard label="Active Applications" value={stats.activeApplications} progress={45} />
                                            <MetricCard label="Faculty Supervisors" value={faculty.length || 1} progress={75} />
                                            <MetricCard label="Placement Rate" value={`${stats.placementRate}%`} progress={stats.placementRate} />
                                        </div>

                                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                            <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                                                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Recent Applications</h3>
                                                    <button onClick={() => setActiveTab('students')} className="text-[11px] font-black uppercase text-blue-600 hover:text-blue-700">View Directory</button>
                                                </div>
                                                <div className="divide-y divide-slate-100">
                                                    {recentActivity.map((act: any) => (
                                                        <div key={act._id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50">
                                                            <div className="flex items-center">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                                                                    <Briefcase className="h-4 w-4" />
                                                                </div>
                                                                <div className="ml-4">
                                                                    <p className="text-sm font-bold text-slate-900">{act.studentId?.name}</p>
                                                                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{act.companyName} • {act.position}</p>
                                                                </div>
                                                            </div>
                                                            <StatusPill status={act.status} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Portal Actions</h3>
                                                <div className="space-y-6">
                                                    <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">System Status</p>
                                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                        </div>
                                                        <p className="mt-2 text-xl font-black text-slate-900">Active</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <ActionButton label="Add Faculty Admin" icon={UserPlus} isPrimary onClick={() => setShowAddAdminModal(true)} />
                                                        <ActionButton label="Export Student Report" icon={Download} onClick={() => { }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'students' && (
                                    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                                        <div className="border-b border-slate-100 px-8 py-6 flex justify-between items-center bg-slate-50/50">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Student Directory ({students.length})</h3>
                                            <div className="flex gap-4">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                                    <input placeholder="Search Roll Number..." className="h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-xs font-bold outline-none focus:border-blue-500" />
                                                </div>
                                            </div>
                                        </div>
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <th className="px-8 py-4">Student Info</th>
                                                    <th className="px-8 py-4">Status</th>
                                                    <th className="px-8 py-4">Assigned Faculty</th>
                                                    <th className="px-8 py-4">Degree Program</th>
                                                    <th className="px-8 py-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {students.map((stu: any) => (
                                                    <tr key={stu._id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-8 py-4">
                                                            <div className="flex items-center">
                                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs font-black text-blue-600">
                                                                    {stu.name[0]}
                                                                </div>
                                                                <div className="ml-4">
                                                                    <p className="text-sm font-bold text-slate-900">{stu.name}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{stu.rollNumber}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-4">
                                                            <span className="flex items-center text-[10px] font-black uppercase text-blue-600">
                                                                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Verified
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-4 text-xs font-black text-slate-600">
                                                            {stu.supervisorId?.name || 'Not Assigned'}
                                                        </td>
                                                        <td className="px-8 py-4 text-xs font-bold text-slate-500">{stu.degree}</td>
                                                        <td className="px-8 py-4 text-right">
                                                            <button className="text-slate-300 hover:text-slate-600">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {activeTab === 'faculty' && isSuperAdmin && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Faculty Management</h3>
                                            <button onClick={() => setShowAddAdminModal(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
                                                <Plus className="h-3.5 w-3.5" /> Add New Staff
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {faculty.map((f: any) => (
                                                <div key={f._id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm group hover:border-blue-100 transition-all">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                            <ShieldCheck className="h-5 w-5" />
                                                        </div>
                                                        <StatusPill status="Staff" />
                                                    </div>
                                                    <h4 className="text-base font-black text-slate-900">{f.name}</h4>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">{f.email}</p>
                                                    <div className="mt-6 border-t border-slate-50 pt-4">
                                                        <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">Manage Account</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {showAddAdminModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-xl p-6">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-[2.5rem] border border-slate-100 bg-white p-12 shadow-2xl shadow-blue-500/5">
                        <div className="mb-10 text-center">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Faculty Account</h2>
                            <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Create New Administrator</p>
                        </div>
                        <form onSubmit={handleCreateAdmin} className="space-y-6">
                            <Input label="Full Name" value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} placeholder="Prof. Ahmad" />
                            <Input label="Email Address" type="email" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} placeholder="admin@comsats.edu.pk" />
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowAddAdminModal(false)} className="flex-1 h-14 rounded-2xl border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 h-14 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95">Create Account</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

interface MetricCardProps {
    label: string;
    value: string | number;
    progress: number;
}

const MetricCard = ({ label, value, progress }: MetricCardProps) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</p>
        <div className="mt-4 h-1 w-full rounded-full bg-slate-50 overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-blue-600"
            />
        </div>
    </div>
);

interface ActionButtonProps {
    label: string;
    icon: any;
    onClick: () => void;
    isPrimary?: boolean;
}

const ActionButton = ({ label, icon: Icon, onClick, isPrimary }: ActionButtonProps) => (
    <button
        onClick={onClick}
        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${isPrimary
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700'
            : 'border border-slate-100 bg-white text-slate-500 hover:bg-slate-50'
            }`}
    >
        {label}
        <Icon className="h-4 w-4" />
    </button>
);

const StatusPill = ({ status }: { status: string }) => {
    const isSuccess = status === 'staff' || status === 'Staff' || status === 'approved';
    return (
        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${isSuccess ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
            }`}>
            {status}
        </span>
    );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const Input = ({ label, ...props }: InputProps) => (
    <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{label}</label>
        <input {...props} required className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300" />
    </div>
);

export default AdminDashboard;
