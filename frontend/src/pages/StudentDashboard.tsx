import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    LogOut,
    GraduationCap,
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    Briefcase,
    Building2,
    Calendar,
    ChevronRight,
    Bell,
    Search,
    User,
    BarChart3,
    Upload,
    ExternalLink,
    Plus,
    Loader2,
    X
} from 'lucide-react';

type TabKey = 'overview' | 'applications' | 'documents' | 'profile';

const API_BASE = 'http://localhost:5000/api/student';

const StudentDashboard = () => {
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [newApp, setNewApp] = useState({ companyName: '', position: '', description: '' });

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [profileRes, appsRes] = await Promise.all([
                    axios.get(`${API_BASE}/profile`, config),
                    axios.get(`${API_BASE}/applications`, config)
                ]);

                if (profileRes.data.success) setProfile(profileRes.data.student);
                if (appsRes.data.success) setApplications(appsRes.data.applications);
            } catch (err) {
                console.error('Error fetching student data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post(`${API_BASE}/apply`, newApp, config);
            if (data.success) {
                setApplications([data.application, ...applications]);
                setShowApplyModal(false);
                setNewApp({ companyName: '', position: '', description: '' });
                setActiveTab('applications');
            }
        } catch (err) {
            console.error('Error applying:', err);
        }
    };

    const stats = [
        { label: 'Applications', value: applications.length, icon: Briefcase, color: 'from-blue-500 to-blue-600' },
        { label: 'Approved', value: applications.filter(a => a.status === 'approved').length, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' },
        { label: 'Pending', value: applications.filter(a => a.status === 'pending').length, icon: Clock, color: 'from-amber-500 to-amber-600' },
        { label: 'Supervisor', value: profile?.supervisorId?.name || 'Pending', icon: User, color: 'from-violet-500 to-violet-600' },
    ];

    if (loading && activeTab === 'overview') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-2xl">
                <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 lg:px-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-lg font-extrabold tracking-tight text-slate-900">Student Portal</span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-0.5">COMSATS University</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-black text-white shadow-lg">
                                {user?.name?.charAt(0) || 'S'}
                            </div>
                            <div className="hidden lg:flex flex-col leading-none">
                                <span className="text-sm font-bold text-slate-900">{user?.name}</span>
                                <span className="text-[11px] font-semibold text-slate-400 mt-0.5">{profile?.rollNumber}</span>
                            </div>
                        </div>
                        <button onClick={logout} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all font-bold">
                            <LogOut className="h-4.5 w-4.5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-8">
                <nav className="flex gap-1 mb-8 bg-white rounded-2xl p-1.5 border border-slate-200/60 shadow-sm w-fit">
                    {[
                        { key: 'overview', label: 'Overview', icon: BarChart3 },
                        { key: 'applications', label: 'Applications', icon: Briefcase },
                        { key: 'documents', label: 'Documents', icon: FileText },
                        { key: 'profile', label: 'Profile', icon: User },
                    ].map((tab: any) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${activeTab === tab.key
                                ? 'bg-blue-600 text-white shadow-lg'
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
                            <div className="mb-8">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900">Welcome Back, {user?.name?.split(' ')[0]}! 👋</h1>
                                <p className="mt-1 text-sm font-semibold text-slate-400">Dashboard overview of your internship progress</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                                {stats.map((stat) => (
                                    <div key={stat.label} className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm group hover:shadow-lg transition-all">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                                <p className="mt-2 text-3xl font-black text-slate-900">{stat.value}</p>
                                            </div>
                                            <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                                <stat.icon className="h-5 w-5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
                                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="text-base font-extrabold text-slate-900">Recent Applications</h3>
                                        <button onClick={() => setShowApplyModal(true)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700 transition-all">
                                            <Plus className="h-3.5 w-3.5" /> Apply New
                                        </button>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {applications.slice(0, 3).map((app: any) => (
                                            <div key={app._id} className="flex items-center gap-4 px-6 py-4">
                                                <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"><Building2 className="h-5 w-5" /></div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-900">{app.position}</p>
                                                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{app.companyName}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ring-1 ${app.status === 'approved' ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : 'bg-amber-50 text-amber-600 ring-amber-100'}`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        ))}
                                        {applications.length === 0 && <div className="p-10 text-center text-slate-400 font-bold">No applications found</div>}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'applications' && (
                        <motion.div key="applications" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight text-slate-900">All Applications</h1>
                                    <p className="mt-1 text-sm font-semibold text-slate-400">Total applications: {applications.length}</p>
                                </div>
                                <button onClick={() => setShowApplyModal(true)} className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95">
                                    <Plus className="h-4 w-4" /> New Application
                                </button>
                            </div>
                            <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400">Company</th>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400">Position</th>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400">Date</th>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {applications.map((app: any) => (
                                            <tr key={app._id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 font-bold text-slate-900">{app.companyName}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-600">{app.position}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-400">{new Date(app.appliedDate).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase">{app.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'profile' && (
                        <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                            <div className="max-w-2xl bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
                                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />
                                <div className="px-10 pb-10">
                                    <div className="-mt-12 mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white p-2 shadow-xl">
                                        <div className="h-full w-full rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-3xl font-black text-white">{user?.name[0]}</div>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900">{profile?.name}</h2>
                                    <p className="text-slate-400 font-bold mb-8">{profile?.rollNumber}</p>

                                    <div className="grid grid-cols-2 gap-8">
                                        <Field label="Email" value={profile?.email} />
                                        <Field label="Session" value={profile?.session} />
                                        <Field label="Degree" value={profile?.degree} />
                                        <Field label="Supervisor" value={profile?.supervisorId?.name || 'Unassigned'} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {showApplyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
                    <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl relative">
                        <button onClick={() => setShowApplyModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors"><X className="h-6 w-6" /></button>
                        <h2 className="text-2xl font-black text-slate-900 mb-6">New Internship Application</h2>
                        <form onSubmit={handleApply} className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase text-slate-400 mb-1 block">Company Name</label>
                                <input required value={newApp.companyName} onChange={e => setNewApp({ ...newApp, companyName: e.target.value })} className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold bg-slate-50 outline-none focus:border-blue-600 transition-all" placeholder="e.g. Google, Microsoft" />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase text-slate-400 mb-1 block">Position</label>
                                <input required value={newApp.position} onChange={e => setNewApp({ ...newApp, position: e.target.value })} className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold bg-slate-50 outline-none focus:border-blue-600 transition-all" placeholder="e.g. Software Engineer Intern" />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase text-slate-400 mb-1 block">Description</label>
                                <textarea rows={4} value={newApp.description} onChange={e => setNewApp({ ...newApp, description: e.target.value })} className="w-full rounded-xl border border-slate-200 p-4 text-sm font-bold bg-slate-50 outline-none focus:border-blue-600 transition-all" placeholder="Brief about the internship..." />
                            </div>
                            <button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-600/20 active:scale-95 transition-all mt-6">Submit Application</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const Field = ({ label, value }: any) => (
    <div>
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">{label}</label>
        <p className="text-sm font-black text-slate-900">{value || 'N/A'}</p>
    </div>
);

export default StudentDashboard;
