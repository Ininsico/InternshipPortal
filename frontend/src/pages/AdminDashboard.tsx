import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    LogOut,
    ShieldCheck,
    Users,
    Briefcase,
    Building2,
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    Bell,
    ChevronRight,
    BarChart3,
    Settings,
    TrendingUp,
    UserCheck,
    UserX,
    Calendar,
    MoreHorizontal,
    Download,
    Filter,
} from 'lucide-react';

type AdminTab = 'overview' | 'students' | 'companies' | 'reports' | 'settings';

const MOCK_STUDENTS = [
    { id: 1, name: 'Ali Raza', rollNumber: 'FA21-BCS-001', session: 'FA21', degree: 'BCS', status: 'active', applications: 3 },
    { id: 2, name: 'Sara Khan', rollNumber: 'FA22-BSE-042', session: 'FA22', degree: 'BSE', status: 'active', applications: 2 },
    { id: 3, name: 'Hamza Ahmed', rollNumber: 'SP23-BCS-015', session: 'SP23', degree: 'BCS', status: 'active', applications: 1 },
    { id: 4, name: 'Ayesha Malik', rollNumber: 'FA22-BCS-033', session: 'FA22', degree: 'BCS', status: 'inactive', applications: 0 },
    { id: 5, name: 'Usman Tariq', rollNumber: 'SP22-BEE-011', session: 'SP22', degree: 'BEE', status: 'active', applications: 4 },
    { id: 6, name: 'Fatima Noor', rollNumber: 'FA23-BCS-008', session: 'FA23', degree: 'BCS', status: 'active', applications: 2 },
];

const MOCK_COMPANIES = [
    { id: 1, name: 'Systems Limited', industry: 'Software & IT', openings: 5, applicants: 12, status: 'active' },
    { id: 2, name: 'Netsol Technologies', industry: 'Financial Technology', openings: 3, applicants: 8, status: 'active' },
    { id: 3, name: 'Teradata Pakistan', industry: 'Data Analytics', openings: 2, applicants: 6, status: 'active' },
    { id: 4, name: 'Techlogix', industry: 'Enterprise Solutions', openings: 4, applicants: 10, status: 'paused' },
    { id: 5, name: 'i2c Inc.', industry: 'Payment Technologies', openings: 3, applicants: 7, status: 'active' },
];

const MOCK_ACTIVITY = [
    { id: 1, action: 'Ali Raza submitted application to Systems Limited', time: '2 minutes ago', type: 'application' },
    { id: 2, action: 'Sara Khan uploaded internship completion certificate', time: '15 minutes ago', type: 'document' },
    { id: 3, action: 'Netsol Technologies added 2 new openings', time: '1 hour ago', type: 'company' },
    { id: 4, action: 'Hamza Ahmed approved for Teradata internship', time: '3 hours ago', type: 'approval' },
    { id: 5, action: 'New student registration: Fatima Noor (FA23-BCS-008)', time: '5 hours ago', type: 'registration' },
];

const TABS: { key: AdminTab; label: string; icon: typeof BarChart3 }[] = [
    { key: 'overview', label: 'Dashboard', icon: BarChart3 },
    { key: 'students', label: 'Students', icon: Users },
    { key: 'companies', label: 'Companies', icon: Building2 },
    { key: 'reports', label: 'Reports', icon: FileText },
    { key: 'settings', label: 'Settings', icon: Settings },
];

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [searchQuery, setSearchQuery] = useState('');

    const stats = [
        { label: 'Total Students', value: '248', change: '+12 this month', icon: Users, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/25' },
        { label: 'Active Applications', value: '67', change: '+8 this week', icon: Briefcase, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/25' },
        { label: 'Partner Companies', value: '15', change: '+2 new', icon: Building2, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/25' },
        { label: 'Placements', value: '34', change: '72% rate', icon: TrendingUp, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/25' },
    ];

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
                            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">5</span>
                        </button>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-sm font-black text-white shadow-lg shadow-slate-900/20">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="hidden lg:flex flex-col leading-none">
                                <span className="text-sm font-bold text-slate-900">{user?.name || 'Admin'}</span>
                                <span className="text-[11px] font-semibold text-slate-400 mt-0.5">{user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
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
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="mb-8">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                                    Welcome back, {user?.name?.split(' ')[0] || 'Admin'} 🛡️
                                </h1>
                                <p className="mt-1 text-sm font-semibold text-slate-400">Internship Portal administration overview</p>
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
                                                <p className="mt-1 text-[11px] font-bold text-emerald-500">{stat.change}</p>
                                            </div>
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg ${stat.shadow}`}>
                                                <stat.icon className="h-5 w-5 text-white" />
                                            </div>
                                        </div>
                                        <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                    </motion.div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                <div className="lg:col-span-3 rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                        <h3 className="text-base font-extrabold text-slate-900">Recent Activity</h3>
                                        <button className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">View All</button>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {MOCK_ACTIVITY.map((act) => (
                                            <div key={act.id} className="flex items-start gap-3 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${act.type === 'application' ? 'bg-blue-50 text-blue-500' :
                                                        act.type === 'document' ? 'bg-violet-50 text-violet-500' :
                                                            act.type === 'company' ? 'bg-emerald-50 text-emerald-500' :
                                                                act.type === 'approval' ? 'bg-green-50 text-green-500' :
                                                                    'bg-amber-50 text-amber-500'
                                                    }`}>
                                                    {act.type === 'application' ? <Briefcase className="h-4 w-4" /> :
                                                        act.type === 'document' ? <FileText className="h-4 w-4" /> :
                                                            act.type === 'company' ? <Building2 className="h-4 w-4" /> :
                                                                act.type === 'approval' ? <CheckCircle2 className="h-4 w-4" /> :
                                                                    <Users className="h-4 w-4" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-slate-700">{act.action}</p>
                                                    <p className="text-xs font-medium text-slate-400 mt-0.5">{act.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="lg:col-span-2 space-y-6">
                                    <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
                                        <div className="px-6 py-5 border-b border-slate-100">
                                            <h3 className="text-base font-extrabold text-slate-900">Quick Actions</h3>
                                        </div>
                                        <div className="p-4 grid grid-cols-2 gap-3">
                                            {[
                                                { label: 'Add Student', icon: UserCheck, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
                                                { label: 'Add Company', icon: Building2, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
                                                { label: 'Export Data', icon: Download, color: 'bg-violet-50 text-violet-600 hover:bg-violet-100' },
                                                { label: 'View Reports', icon: BarChart3, color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
                                            ].map((action) => (
                                                <button
                                                    key={action.label}
                                                    className={`flex flex-col items-center gap-2 rounded-xl p-4 text-xs font-bold transition-all ${action.color}`}
                                                >
                                                    <action.icon className="h-5 w-5" />
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-xl shadow-slate-900/20">
                                        <h4 className="text-sm font-extrabold text-white">Placement Rate</h4>
                                        <div className="mt-4 flex items-end gap-4">
                                            <span className="text-5xl font-black text-white">72<span className="text-2xl text-slate-400">%</span></span>
                                            <span className="mb-1 flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                                                <TrendingUp className="h-3 w-3" /> +5%
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs font-semibold text-slate-400">vs last semester</p>
                                        <div className="mt-4 h-2 w-full rounded-full bg-slate-700">
                                            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'students' && (
                        <motion.div
                            key="students"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Students</h1>
                                    <p className="mt-1 text-sm font-semibold text-slate-400">Manage registered students</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all">
                                        <Filter className="h-4 w-4" /> Filter
                                    </button>
                                    <button className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/25 hover:bg-slate-800 transition-all active:scale-95">
                                        <UserCheck className="h-4 w-4" /> Add Student
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Student</th>
                                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Roll Number</th>
                                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Session</th>
                                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Degree</th>
                                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Applications</th>
                                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Status</th>
                                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {MOCK_STUDENTS.map((stu) => (
                                                <tr key={stu.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-black text-white">
                                                                {stu.name.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-900">{stu.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-slate-600 font-mono">{stu.rollNumber}</td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-slate-500">{stu.session}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{stu.degree}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{stu.applications}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${stu.status === 'active'
                                                                ? 'bg-emerald-50 text-emerald-600'
                                                                : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${stu.status === 'active' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                                                            {stu.status.charAt(0).toUpperCase() + stu.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'companies' && (
                        <motion.div
                            key="companies"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Partner Companies</h1>
                                    <p className="mt-1 text-sm font-semibold text-slate-400">Manage internship partners and openings</p>
                                </div>
                                <button className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/25 hover:bg-slate-800 transition-all active:scale-95">
                                    <Building2 className="h-4 w-4" /> Add Company
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {MOCK_COMPANIES.map((comp, i) => (
                                    <motion.div
                                        key={comp.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        className="group rounded-2xl bg-white border border-slate-200/60 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 group-hover:bg-gradient-to-br group-hover:from-slate-800 group-hover:to-slate-900 group-hover:text-white transition-all duration-300">
                                                <Building2 className="h-5 w-5" />
                                            </div>
                                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${comp.status === 'active'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                {comp.status.charAt(0).toUpperCase() + comp.status.slice(1)}
                                            </span>
                                        </div>
                                        <h4 className="text-base font-extrabold text-slate-900">{comp.name}</h4>
                                        <p className="text-xs font-semibold text-slate-400 mt-1">{comp.industry}</p>
                                        <div className="mt-4 flex gap-4">
                                            <div>
                                                <p className="text-lg font-black text-slate-900">{comp.openings}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Openings</p>
                                            </div>
                                            <div className="h-10 w-px bg-slate-100" />
                                            <div>
                                                <p className="text-lg font-black text-slate-900">{comp.applicants}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Applicants</p>
                                            </div>
                                        </div>
                                        <button className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
                                            View Details <ChevronRight className="h-3.5 w-3.5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'reports' && (
                        <motion.div
                            key="reports"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="mb-8">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900">Reports & Analytics</h1>
                                <p className="mt-1 text-sm font-semibold text-slate-400">Generate and download reports</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {[
                                    { title: 'Student Placement Report', desc: 'Overview of all student placements for the current semester', icon: UserCheck, color: 'from-blue-500 to-blue-600' },
                                    { title: 'Company Engagement Report', desc: 'Detailed partner company participation metrics', icon: Building2, color: 'from-emerald-500 to-emerald-600' },
                                    { title: 'Application Trends', desc: 'Monthly application submission and approval trends', icon: TrendingUp, color: 'from-violet-500 to-violet-600' },
                                    { title: 'Session-wise Analysis', desc: 'Breakdown of internships by session and degree program', icon: BarChart3, color: 'from-amber-500 to-amber-600' },
                                ].map((report, i) => (
                                    <motion.div
                                        key={report.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="rounded-2xl bg-white border border-slate-200/60 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${report.color} shadow-lg mb-4`}>
                                            <report.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <h4 className="text-base font-extrabold text-slate-900">{report.title}</h4>
                                        <p className="text-xs font-semibold text-slate-400 mt-1 leading-relaxed">{report.desc}</p>
                                        <div className="mt-5 flex gap-3">
                                            <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-all">
                                                <BarChart3 className="h-3.5 w-3.5" /> Generate
                                            </button>
                                            <button className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all">
                                                <Download className="h-3.5 w-3.5" /> Download
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="mb-8">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900">Settings</h1>
                                <p className="mt-1 text-sm font-semibold text-slate-400">Manage portal configuration</p>
                            </div>

                            <div className="max-w-2xl space-y-6">
                                <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
                                    <div className="relative h-32 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800">
                                        <div className="absolute -bottom-10 left-8">
                                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-2xl font-black text-slate-900 shadow-xl ring-4 ring-white">
                                                {user?.name?.charAt(0) || 'A'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-14 px-8 pb-8">
                                        <h3 className="text-xl font-black text-slate-900">{user?.name || 'Admin'}</h3>
                                        <p className="text-sm font-semibold text-slate-400 mt-0.5">{user?.email || ''}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                                            {[
                                                { label: 'Full Name', value: user?.name || '-' },
                                                { label: 'Email Address', value: user?.email || '-' },
                                                { label: 'Role', value: user?.role === 'super_admin' ? 'Super Admin' : 'Admin' },
                                                { label: 'Account Status', value: 'Active' },
                                            ].map((field) => (
                                                <div key={field.label}>
                                                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{field.label}</p>
                                                    <p className="mt-1 text-sm font-bold text-slate-900">{field.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm p-6">
                                    <h4 className="text-base font-extrabold text-slate-900 mb-4">Portal Settings</h4>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Allow new student registrations', enabled: true },
                                            { label: 'Email notifications for new applications', enabled: true },
                                            { label: 'Auto-approve verified companies', enabled: false },
                                            { label: 'Maintenance mode', enabled: false },
                                        ].map((setting) => (
                                            <div key={setting.label} className="flex items-center justify-between py-2">
                                                <span className="text-sm font-semibold text-slate-700">{setting.label}</span>
                                                <button className={`relative h-6 w-11 rounded-full transition-colors ${setting.enabled ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${setting.enabled ? 'left-[22px]' : 'left-0.5'}`} />
                                                </button>
                                            </div>
                                        ))}
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

export default AdminDashboard;
