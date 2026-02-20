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
    CheckCircle2,
    Search,
    Bell,
    ChevronRight,
    BarChart3,
    Settings,
    TrendingUp,
    UserCheck,
    Calendar,
    MoreHorizontal,
    Download,
    Filter,
    Plus,
    UserPlus,
    Loader2
} from 'lucide-react';

type AdminTab = 'overview' | 'students' | 'faculty' | 'companies' | 'reports' | 'settings';

const API_BASE = 'http://localhost:5000/api/admin';

const AdminDashboard = () => {
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [searchQuery, setSearchQuery] = useState('');
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
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'admin' });

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
                console.error('Error fetching admin data:', err);
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
                setFaculty([...faculty, data.admin]);
                setShowAddAdminModal(false);
                setNewAdmin({ name: '', email: '', password: '', role: 'admin' });
            }
        } catch (err) {
            console.error('Error creating admin:', err);
        }
    };

    const isSuperAdmin = user?.role === 'super_admin';

    const tabs: { key: AdminTab; label: string; icon: any; roles?: string[] }[] = [
        { key: 'overview', label: 'Dashboard', icon: BarChart3 },
        { key: 'students', label: 'Students', icon: Users },
        { key: 'faculty', label: 'Faculty', icon: ShieldCheck, roles: ['super_admin'] },
        { key: 'companies', label: 'Companies', icon: Building2 },
        { key: 'reports', label: 'Reports', icon: FileText },
        { key: 'settings', label: 'Settings', icon: Settings },
    ];

    const filteredTabs = tabs.filter(t => !t.roles || t.roles.includes(user?.role || ''));

    if (loading && activeTab === 'overview') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-2xl">
                <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 lg:px-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-slate-900/25">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-lg font-extrabold tracking-tight text-slate-900">Admin Portal</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">COMSATS University</span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 bg-slate-100/80 rounded-2xl px-4 py-2.5 w-96">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search students, companies, applications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 outline-none w-full placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                            <Bell className="h-4.5 w-4.5" />
                        </button>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-sm font-black text-white shadow-lg shadow-slate-900/20">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="hidden lg:flex flex-col leading-none">
                                <span className="text-sm font-bold text-slate-900">{user?.name || 'Admin'}</span>
                                <span className="text-[11px] font-semibold text-slate-400 mt-0.5">{isSuperAdmin ? 'Super Admin' : 'Faculty Supervisor'}</span>
                            </div>
                        </div>
                        <button onClick={logout} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                            <LogOut className="h-4.5 w-4.5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-8">
                <nav className="flex gap-1 mb-8 bg-white rounded-2xl p-1.5 border border-slate-200/60 shadow-sm w-fit">
                    {filteredTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${activeTab === tab.key
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/25'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                                <StatCard label="Total Students" value={stats.totalStudents} icon={Users} color="from-blue-500 to-blue-600" />
                                <StatCard label="Active Applications" value={stats.activeApplications} icon={Briefcase} color="from-violet-500 to-violet-600" />
                                <StatCard label="Admins / Faculty" value={faculty.length || 1} icon={ShieldCheck} color="from-emerald-500 to-emerald-600" />
                                <StatCard label="Placements" value={stats.completedPlacements} icon={TrendingUp} color="from-amber-500 to-amber-600" suffix={`${stats.placementRate}%`} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                <div className="lg:col-span-3 rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
                                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="text-base font-extrabold text-slate-900">Recent Applications</h3>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {recentActivity.map((act: any) => (
                                            <div key={act._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                                                    <Briefcase className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-900">{act.studentId?.name} applied to {act.companyName}</p>
                                                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{act.position} • {new Date(act.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <StatusBadge status={act.status} />
                                            </div>
                                        ))}
                                        {recentActivity.length === 0 && <div className="p-10 text-center text-slate-400 font-bold">No recent activity</div>}
                                    </div>
                                </div>

                                <div className="lg:col-span-2 space-y-6">
                                    <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden p-6">
                                        <h3 className="text-base font-extrabold text-slate-900 mb-4">Quick Actions</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {isSuperAdmin && (
                                                <ActionButton label="Add Faculty" icon={UserPlus} onClick={() => setShowAddAdminModal(true)} />
                                            )}
                                            <ActionButton label="Export Students" icon={Download} onClick={() => { }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'students' && (
                        <motion.div key="students" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Students</h1>
                                    <p className="mt-1 text-sm font-semibold text-slate-400">Total registered students: {students.length}</p>
                                </div>
                            </div>
                            <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400">Student</th>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400">Roll Number</th>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400">Supervisor</th>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400">Degree</th>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {students.map((stu: any) => (
                                            <tr key={stu._id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">{stu.name[0]}</div>
                                                        <span className="text-sm font-bold text-slate-900">{stu.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-600">{stu.rollNumber}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-emerald-600">{stu.supervisorId?.name || 'Unassigned'}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-500">{stu.degree}</td>
                                                <td className="px-6 py-4"><span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black">ACTIVE</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'faculty' && isSuperAdmin && (
                        <motion.div key="faculty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Faculty Supervisors</h1>
                                    <p className="mt-1 text-sm font-semibold text-slate-400">Manage portal administrators and supervisors</p>
                                </div>
                                <button onClick={() => setShowAddAdminModal(true)} className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800">
                                    <Plus className="h-4 w-4" /> Add Supervisor
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {faculty.map((f: any) => (
                                    <div key={f._id} className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-black">{f.name[0]}</div>
                                            <div>
                                                <h4 className="font-extrabold text-slate-900">{f.name}</h4>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{f.role}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-500">{f.email}</p>
                                        <button className="mt-4 text-xs font-bold text-blue-600 hover:underline">View Assigned Students</button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {showAddAdminModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
                    <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Add New Supervisor</h2>
                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase text-slate-400 mb-1 block">Full Name</label>
                                <input required value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold bg-slate-50 outline-none focus:border-slate-900 transition-all" />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase text-slate-400 mb-1 block">Email</label>
                                <input type="email" required value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold bg-slate-50 outline-none focus:border-slate-900 transition-all" />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase text-slate-400 mb-1 block">Temp Password</label>
                                <input type="password" required value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold bg-slate-50 outline-none focus:border-slate-900 transition-all" />
                            </div>
                            <div className="flex gap-3 pt-6">
                                <button type="button" onClick={() => setShowAddAdminModal(false)} className="flex-1 h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-black shadow-lg shadow-slate-900/20 active:scale-95 transition-all">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, suffix = '' }: any) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm relative overflow-hidden group">
        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{value}<span className="text-lg ml-1">{suffix}</span></p>
            </div>
            <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
        </div>
        <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-all`} />
    </div>
);

const ActionButton = ({ label, icon: Icon, onClick }: any) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 rounded-xl p-4 text-[11px] font-black uppercase bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
        <Icon className="h-5 w-5" />
        {label}
    </button>
);

const StatusBadge = ({ status }: any) => {
    const styles: any = {
        pending: 'bg-amber-50 text-amber-600 ring-amber-100',
        approved: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
        in_progress: 'bg-blue-50 text-blue-600 ring-blue-100',
        completed: 'bg-indigo-50 text-indigo-600 ring-indigo-100'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ${styles[status] || styles.pending}`}>
            {status.replace('_', ' ')}
        </span>
    );
};

export default AdminDashboard;
