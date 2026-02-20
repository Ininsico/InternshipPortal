import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';

type TabKey = 'overview' | 'applications' | 'documents' | 'profile';

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
    in_progress: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
};

const MOCK_APPLICATIONS = [
    { id: 1, company: 'Systems Limited', position: 'Software Engineer Intern', appliedDate: '2026-01-15', status: 'approved' },
    { id: 2, company: 'Netsol Technologies', position: 'Frontend Developer Intern', appliedDate: '2026-01-20', status: 'pending' },
    { id: 3, company: 'Teradata Pakistan', position: 'Data Analyst Intern', appliedDate: '2026-02-01', status: 'in_progress' },
    { id: 4, company: 'Techlogix', position: 'Backend Developer Intern', appliedDate: '2026-02-10', status: 'rejected' },
];

const MOCK_DEADLINES = [
    { id: 1, title: 'Submit Internship Preference Form', due: '2026-02-25', urgent: true },
    { id: 2, title: 'Upload Updated CV', due: '2026-03-01', urgent: false },
    { id: 3, title: 'Midterm Evaluation Report', due: '2026-03-15', urgent: false },
];

const TABS: { key: TabKey; label: string; icon: typeof BarChart3 }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'applications', label: 'Applications', icon: Briefcase },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'profile', label: 'Profile', icon: User },
];

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [searchQuery, setSearchQuery] = useState('');

    const stats = [
        { label: 'Applications', value: '4', icon: Briefcase, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/25' },
        { label: 'Approved', value: '1', icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/25' },
        { label: 'Pending', value: '1', icon: Clock, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/25' },
        { label: 'In Progress', value: '1', icon: AlertCircle, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/25' },
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-2xl">
                <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 lg:px-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-lg font-extrabold tracking-tight text-slate-900">Student Portal</span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-0.5">COMSATS University</span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 bg-slate-100/80 rounded-2xl px-4 py-2.5 w-80">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search applications, companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 outline-none w-full placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                            <Bell className="h-4.5 w-4.5" />
                            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">2</span>
                        </button>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-black text-white shadow-lg shadow-blue-500/20">
                                {user?.name?.charAt(0) || 'S'}
                            </div>
                            <div className="hidden lg:flex flex-col leading-none">
                                <span className="text-sm font-bold text-slate-900">{user?.name || 'Student'}</span>
                                <span className="text-[11px] font-semibold text-slate-400 mt-0.5">{user?.rollNumber || ''}</span>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                            <LogOut className="h-4.5 w-4.5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-8">
                <nav className="flex gap-1 mb-8 bg-white rounded-2xl p-1.5 border border-slate-200/60 shadow-sm w-fit">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${activeTab === tab.key
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
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
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="mb-8">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                                    {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'} 👋
                                </h1>
                                <p className="mt-1 text-sm font-semibold text-slate-400">Here's what's happening with your internship journey</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                                {stats.map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                                <p className="mt-2 text-3xl font-black text-slate-900">{stat.value}</p>
                                            </div>
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg ${stat.shadow}`}>
                                                <stat.icon className="h-5 w-5 text-white" />
                                            </div>
                                        </div>
                                        <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                    </motion.div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                        <h3 className="text-base font-extrabold text-slate-900">Recent Applications</h3>
                                        <button
                                            onClick={() => setActiveTab('applications')}
                                            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                            View All <ChevronRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {MOCK_APPLICATIONS.slice(0, 3).map((app) => {
                                            const style = STATUS_STYLES[app.status];
                                            return (
                                                <div key={app.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                                        <Building2 className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 truncate">{app.position}</p>
                                                        <p className="text-xs font-semibold text-slate-400 mt-0.5">{app.company}</p>
                                                    </div>
                                                    <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${style.bg} ${style.text}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                                                        {app.status.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
                                    <div className="px-6 py-5 border-b border-slate-100">
                                        <h3 className="text-base font-extrabold text-slate-900">Upcoming Deadlines</h3>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {MOCK_DEADLINES.map((dl) => (
                                            <div key={dl.id} className="flex items-start gap-3 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${dl.urgent ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-900">{dl.title}</p>
                                                    <p className={`text-xs font-semibold mt-0.5 ${dl.urgent ? 'text-red-500' : 'text-slate-400'}`}>
                                                        Due: {new Date(dl.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                {dl.urgent && (
                                                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-black text-white uppercase">Urgent</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'applications' && (
                        <motion.div
                            key="applications"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight text-slate-900">My Applications</h1>
                                    <p className="mt-1 text-sm font-semibold text-slate-400">Track your internship applications</p>
                                </div>
                                <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95">
                                    <Briefcase className="h-4 w-4" /> New Application
                                </button>
                            </div>

                            <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Company</th>
                                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Position</th>
                                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Applied</th>
                                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Status</th>
                                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {MOCK_APPLICATIONS.map((app) => {
                                                const style = STATUS_STYLES[app.status];
                                                return (
                                                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                                                    <Building2 className="h-4.5 w-4.5" />
                                                                </div>
                                                                <span className="text-sm font-bold text-slate-900">{app.company}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">{app.position}</td>
                                                        <td className="px-6 py-4 text-sm font-semibold text-slate-400">
                                                            {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${style.bg} ${style.text}`}>
                                                                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                                                                {app.status.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                                                Details <ExternalLink className="h-3 w-3" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'documents' && (
                        <motion.div
                            key="documents"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="mb-8">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900">Documents</h1>
                                <p className="mt-1 text-sm font-semibold text-slate-400">Upload and manage your internship documents</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {[
                                    { title: 'Resume / CV', desc: 'Your latest resume', uploaded: true, date: 'Feb 10, 2026' },
                                    { title: 'Internship Letter', desc: 'University approval letter', uploaded: true, date: 'Jan 28, 2026' },
                                    { title: 'Transcript', desc: 'Latest academic transcript', uploaded: false, date: null },
                                    { title: 'NOC', desc: 'No Objection Certificate', uploaded: false, date: null },
                                    { title: 'Offer Letter', desc: 'Company offer letter', uploaded: false, date: null },
                                    { title: 'Completion Certificate', desc: 'Internship completion cert', uploaded: false, date: null },
                                ].map((doc, i) => (
                                    <motion.div
                                        key={doc.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        className="rounded-2xl bg-white border border-slate-200/60 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${doc.uploaded ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            {doc.uploaded && (
                                                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                                                    <CheckCircle2 className="h-3 w-3" /> Uploaded
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-sm font-extrabold text-slate-900">{doc.title}</h4>
                                        <p className="text-xs font-semibold text-slate-400 mt-1">{doc.desc}</p>
                                        {doc.date && <p className="text-[10px] font-bold text-slate-300 mt-2">Uploaded: {doc.date}</p>}
                                        <button className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${doc.uploaded
                                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700'
                                            }`}>
                                            <Upload className="h-3.5 w-3.5" />
                                            {doc.uploaded ? 'Replace' : 'Upload'}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="mb-8">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900">My Profile</h1>
                                <p className="mt-1 text-sm font-semibold text-slate-400">Your account information</p>
                            </div>

                            <div className="max-w-2xl">
                                <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
                                    <div className="relative h-32 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600">
                                        <div className="absolute -bottom-10 left-8">
                                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-2xl font-black text-blue-600 shadow-xl ring-4 ring-white">
                                                {user?.name?.charAt(0) || 'S'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-14 px-8 pb-8">
                                        <h3 className="text-xl font-black text-slate-900">{user?.name || 'Student'}</h3>
                                        <p className="text-sm font-semibold text-slate-400 mt-0.5">{user?.rollNumber || ''}</p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                                            {[
                                                { label: 'Full Name', value: user?.name || '-' },
                                                { label: 'Roll Number', value: user?.rollNumber || '-' },
                                                { label: 'Email', value: user?.email || '-' },
                                                { label: 'Session', value: user?.session || '-' },
                                                { label: 'Degree Program', value: user?.degree || '-' },
                                                { label: 'Role', value: 'Student' },
                                            ].map((field) => (
                                                <div key={field.label}>
                                                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{field.label}</p>
                                                    <p className="mt-1 text-sm font-bold text-slate-900">{field.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StudentDashboard;
