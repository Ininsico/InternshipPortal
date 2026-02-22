import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    LogOut,
    GraduationCap,
    FileText,
    Briefcase,
    User,
    Plus,
    Loader2,
    X,
    LayoutDashboard,
    ArrowUpRight,
    Bell,
    ClipboardList,
    CheckCircle2,
    Upload,
    File,
    Camera,
    Clock,
    CheckCheck,
    AlertCircle,
    Send,
    Shield,
    Sparkles,
    Building2
} from 'lucide-react';

import API from '../config/api';
import StatusPill from '../components/StatusPill';

const API_BASE = API.STUDENT;

const STATUS_PIPELINE = [
    { key: 'submitted', label: 'Application Submitted', icon: Send, desc: 'Your internship application has been received and is under review.' },
    { key: 'approved', label: 'Application Approved', icon: CheckCheck, desc: 'Congratulations! Your application has been approved. Please submit your agreement form.' },
    { key: 'agreement_submitted', label: 'Agreement Submitted', icon: FileText, desc: 'Your internship agreement is submitted and awaiting admin verification.' },
    { key: 'verified', label: 'Documents Verified', icon: Shield, desc: 'All your documents have been verified. Awaiting final internship assignment by admin.' },
    { key: 'internship_assigned', label: 'Internship Assigned', icon: CheckCircle2, desc: 'You have been assigned to your company. Tasks and work will appear here.' },
];


const StudentDashboard = () => {
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'tasks' | 'profile'>('overview');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [myReport, setMyReport] = useState<any>(null);
    const [submitTarget, setSubmitTarget] = useState<any | null>(null);
    const [submitContent, setSubmitContent] = useState('');
    const [submitFiles, setSubmitFiles] = useState<File[]>([]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [newApp, setNewApp] = useState({ companyName: '', position: '', description: '' });
    const [profileImageLoading, setProfileImageLoading] = useState(false);

    const internshipStatus = user?.internshipStatus || 'none';
    const isAssigned = internshipStatus === 'internship_assigned';
    const canApply = internshipStatus === 'none' || internshipStatus === 'rejected';

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [profileRes, appsRes] = await Promise.all([
                    axios.get(`${API_BASE}/profile`, config),
                    axios.get(`${API_BASE}/applications`, config),
                ]);
                if (profileRes.data.success) setProfile(profileRes.data.student);
                if (appsRes.data.success) setApplications(appsRes.data.applications);

                if (isAssigned) {
                    const [tasksRes, subsRes, reportRes] = await Promise.all([
                        axios.get(`${API_BASE}/tasks`, config),
                        axios.get(`${API_BASE}/submissions`, config),
                        axios.get(`${API_BASE}/report`, config),
                    ]);
                    if (tasksRes.data.success) setTasks(tasksRes.data.tasks);
                    if (subsRes.data.success) setSubmissions(subsRes.data.submissions);
                    if (reportRes.data.success) setMyReport(reportRes.data.report);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, isAssigned]);

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
            console.error(err);
        }
    };

    const handleSubmitTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!submitTarget) return;
        setSubmitLoading(true);
        try {
            const formData = new FormData();
            formData.append('taskId', submitTarget._id);
            formData.append('content', submitContent || 'Assignment Submission');
            submitFiles.forEach(file => formData.append('files', file));
            const config = {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            };
            const { data } = await axios.post(`${API_BASE}/submit-task`, formData, config);
            if (data.success) {
                setSubmissions(prev => {
                    const existingIdx = prev.findIndex(s => (s.task?._id || s.task) === submitTarget._id);
                    if (existingIdx > -1) {
                        const updated = [...prev];
                        updated[existingIdx] = data.submission;
                        return updated;
                    }
                    return [data.submission, ...prev];
                });
                setSubmitTarget(null);
                setSubmitContent('');
                setSubmitFiles([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('profilePicture', file);
        setProfileImageLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            };
            const { data } = await axios.post(`${API_BASE}/profile-picture`, formData, config);
            if (data.success) {
                setProfile((prev: any) => ({ ...prev, profilePicture: data.profilePicture }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setProfileImageLoading(false);
        }
    };

    const renderStatusTracker = () => {
        const currentIdx = STATUS_PIPELINE.findIndex(s => s.key === internshipStatus);
        const currentStep = STATUS_PIPELINE[currentIdx] ?? (isAssigned ? STATUS_PIPELINE[STATUS_PIPELINE.length - 1] : null);

        if (internshipStatus === 'none') {
            return (
                <div className="rounded-[2.5rem] border-2 border-dashed border-blue-100 bg-blue-50/30 p-12 text-center">
                    <div className="mx-auto w-20 h-20 rounded-[2rem] bg-white border border-blue-100 flex items-center justify-center mb-6 text-blue-600 shadow-xl shadow-blue-500/5">
                        <Briefcase className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Ready to Start?</h3>
                    <p className="mt-3 text-sm font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Your professional journey begins here. Submit your first internship application to activate your track.
                    </p>
                    <button
                        onClick={() => setShowApplyModal(true)}
                        className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-95"
                    >
                        <Plus className="h-4 w-4" /> Start Application
                    </button>
                </div>
            );
        }

        if (internshipStatus === 'rejected') {
            return (
                <div className="rounded-[2.5rem] border-2 border-red-100 bg-red-50/30 p-12 text-center">
                    <div className="mx-auto w-20 h-20 rounded-[2rem] bg-white border border-red-100 flex items-center justify-center mb-6 text-red-500 shadow-xl shadow-red-500/5">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Requirement Gap</h3>
                    <p className="mt-3 text-sm font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Your application was not approved. Please review the feedback and resubmit with updated details.
                    </p>
                    <button
                        onClick={() => setShowApplyModal(true)}
                        className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-red-600 px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-red-700 transition-all shadow-2xl shadow-red-500/30 active:scale-95"
                    >
                        <Plus className="h-3.5 w-3.5" /> Fix & Resubmit
                    </button>
                </div>
            );
        }

        return (
            <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="border-b border-slate-100 px-10 py-8 bg-slate-50/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 mb-1">Internship Pipeline</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Real-time status tracking</p>
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{internshipStatus.replace('_', ' ')}</span>
                    </div>
                </div>
                <div className="px-10 py-10">
                    <div className="relative space-y-0">
                        {STATUS_PIPELINE.map((step, idx) => {
                            const isCompleted = idx < currentIdx || (isAssigned && idx < STATUS_PIPELINE.length);
                            const isCurrent = !isAssigned && idx === currentIdx;
                            const isPending = !isAssigned && idx > currentIdx;
                            const StepIcon = step.icon;

                            return (
                                <div key={step.key} className="flex gap-8 relative">
                                    <div className="flex flex-col items-center">
                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 z-10
                                            ${isCompleted ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 rotate-12 scale-110'
                                                : isCurrent ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 ring-8 ring-blue-50'
                                                    : 'bg-slate-100 text-slate-300'}`}
                                        >
                                            {isCompleted
                                                ? <CheckCheck className="h-5 w-5" />
                                                : <StepIcon className={`h-5 w-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                                            }
                                        </div>
                                        {idx < STATUS_PIPELINE.length - 1 && (
                                            <div className={`w-1 flex-1 min-h-[40px] transition-colors duration-500 ${isCompleted ? 'bg-emerald-200' : 'bg-slate-100'}`} />
                                        )}
                                    </div>

                                    <div className="pb-10 pt-1">
                                        <p className={`text-[11px] font-black uppercase tracking-[0.2em] leading-none mb-2
                                            ${isCompleted ? 'text-emerald-600'
                                                : isCurrent ? 'text-blue-600'
                                                    : 'text-slate-300'}`}
                                        >
                                            {step.label}
                                        </p>
                                        {(isCurrent || (isAssigned && idx === STATUS_PIPELINE.length - 1)) && (
                                            <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-medium text-slate-500 max-w-md leading-relaxed">
                                                {step.desc}
                                            </motion.p>
                                        )}
                                        {isPending && (
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Next step in the workflow</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {currentStep && (
                    <div className="px-10 py-6 bg-slate-900 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                                Current Stage: {currentStep.label}
                            </p>
                        </div>
                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-3 py-1 rounded-full">Automated verification</div>
                    </div>
                )}
            </div>
        );
    };

    const menuItems = [
        { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { key: 'applications', label: 'My Applications', icon: Briefcase },
        ...(isAssigned ? [{ key: 'tasks', label: 'Work Console', icon: ClipboardList }] : []),
        { key: 'profile', label: 'Profile Settings', icon: User },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            <aside className="fixed left-0 top-0 z-40 h-screen w-20 flex-col border-r border-slate-100 bg-white md:w-72 shadow-sm">
                <div className="flex h-24 items-center px-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/20">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4 hidden md:block">
                        <span className="text-sm font-black tracking-tight text-slate-900 uppercase italic">CU Portal</span>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Student Access</p>
                    </div>
                </div>
                <nav className="flex-1 space-y-1 px-4">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key as any)}
                            className={`flex w-full items-center rounded-[1.25rem] px-5 py-4 transition-all duration-300 ${activeTab === item.key
                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span className="ml-4 hidden text-[11px] font-black uppercase tracking-[0.2em] md:block">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4">
                    <button onClick={logout} className="flex w-full items-center rounded-[1.25rem] px-5 py-4 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all font-black text-[11px] uppercase tracking-[0.2em]">
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className="ml-4 hidden md:block">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="ml-20 flex-1 md:ml-72 transition-all">
                <header className="sticky top-0 z-30 flex h-24 items-center justify-between border-b border-slate-100 bg-white/80 px-10 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Portal / {activeTab}</h2>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-5 border-r border-slate-100 pr-8">
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-900 leading-none capitalize">{user?.name}</p>
                                <p className="mt-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600">{profile?.rollNumber}</p>
                            </div>
                            <div className="relative group">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-xs font-black text-white shadow-xl shadow-slate-900/10 overflow-hidden ring-4 ring-white">
                                    {profile?.profilePicture ? (
                                        <img src={profile.profilePicture} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.charAt(0)
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white" />
                            </div>
                        </div>
                        <button className="text-slate-400 hover:text-slate-900 transition-colors relative">
                            <Bell className="h-6 w-6" />
                            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[60vh] items-center justify-center">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                            </motion.div>
                        ) : (
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                {activeTab === 'overview' && (
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            {[
                                                { label: 'Internship Status', val: internshipStatus.replace('_', ' '), sub: 'Current Pipeline', color: 'blue' },
                                                { label: 'Position Sourced', val: applications[0]?.position || 'Not Applied', sub: applications[0]?.companyName || 'N/A', color: 'slate' },
                                                { label: 'Task Compliance', val: isAssigned ? `${submissions.length} / ${tasks.length}` : '—', sub: 'Submissions', color: 'indigo' }
                                            ].map((stat, i) => (
                                                <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 group-hover:text-blue-600 transition-colors">{stat.label}</p>
                                                    <p className="mt-4 text-2xl font-black tracking-tight text-slate-900 leading-none capitalize">{stat.val}</p>
                                                    <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.sub}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                            <div className="lg:col-span-2 space-y-6">
                                                {renderStatusTracker()}
                                            </div>

                                            <div className="space-y-8">
                                                {isAssigned && (
                                                    <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 p-10 shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden group">
                                                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-500" />
                                                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Assigned Faculty</h4>
                                                        <p className="mt-6 text-2xl font-black">{profile?.supervisorId?.name || 'Awaiting Allocation'}</p>
                                                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-white/30">LHR Staff Directory</p>
                                                        <div className="mt-10 pt-8 border-t border-white/5">
                                                            {profile?.supervisorId?.email ? (
                                                                <a href={`mailto:${profile.supervisorId.email}`} className="flex w-full items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] group/link">
                                                                    Contact Direct <ArrowUpRight className="h-5 w-5 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                                                </a>
                                                            ) : (
                                                                <button disabled className="flex w-full items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] opacity-20">Contact Disabled <ArrowUpRight className="h-5 w-5" /></button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {isAssigned && profile?.assignedCompany && (
                                                    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Corporate Placement</p>
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                                                <Building2 className="w-5 h-5 text-slate-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-slate-900">{profile.assignedCompany}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{profile.assignedPosition}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => window.print()}
                                                    className="flex w-full items-center justify-center gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-8 text-[11px] font-black uppercase tracking-[0.25em] text-slate-900 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                                                >
                                                    <FileText className="h-5 w-5 text-blue-600" /> Generate Logbook
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'applications' && (
                                    <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
                                        <div className="border-b border-slate-100 px-10 py-8 flex justify-between items-center bg-slate-50/50">
                                            <div>
                                                <h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">Historical Records</h3>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Found {applications.length} submitted requests</p>
                                            </div>
                                            <button
                                                onClick={() => setShowApplyModal(true)}
                                                disabled={!canApply}
                                                className={`flex items-center gap-3 rounded-2xl px-8 h-14 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-2xl ${!canApply
                                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                                    : 'bg-blue-600 shadow-blue-500/30 hover:bg-blue-700 active:scale-95'
                                                    }`}
                                            >
                                                <Plus className="h-4 w-4" /> {!canApply ? 'Applied' : 'New Intake'}
                                            </button>
                                        </div>
                                        {applications.length === 0 ? (
                                            <div className="p-32 text-center text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">Null records found</div>
                                        ) : (
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 bg-slate-50/20">
                                                        <th className="px-10 py-6">Placement / Position</th>
                                                        <th className="px-10 py-6">Approval Status</th>
                                                        <th className="px-10 py-6">Log Date</th>
                                                        <th className="px-10 py-6 text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {applications.map((app: any) => (
                                                        <tr key={app._id} className="hover:bg-slate-50 transition-colors group">
                                                            <td className="px-10 py-8">
                                                                <p className="text-sm font-black text-slate-900">{app.companyName}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5 tracking-widest">{app.position}</p>
                                                            </td>
                                                            <td className="px-10 py-8">
                                                                <StatusPill status={app.status || 'pending'} />
                                                            </td>
                                                            <td className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                                {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'N/A'}
                                                            </td>
                                                            <td className="px-10 py-8 text-right">
                                                                <button className="h-10 w-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:border-blue-100 transition-all"><ArrowUpRight className="h-5 w-5" /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'tasks' && isAssigned && (
                                    <div className="space-y-10">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Work Console</h3>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Assigned Deliverables ({tasks.length})</p>
                                            </div>
                                        </div>
                                        {tasks.length === 0 ? (
                                            <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-white py-32 text-center shadow-sm">
                                                <Clock className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Standby Content</p>
                                                <p className="text-xs text-slate-300 font-bold mt-2">Awaiting supervisor task dispatch.</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-6">
                                                {tasks.map((task: any) => {
                                                    const sub = submissions.find((s: any) => (s.task?._id || s.task) === task._id);
                                                    const isNew = new Date(task.createdAt).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000;
                                                    return (
                                                        <div key={task._id} className={`rounded-[2rem] border bg-white p-10 shadow-sm transition-all relative overflow-hidden group ${!sub ? 'border-blue-200 shadow-xl shadow-blue-500/5 ring-1 ring-blue-50' : 'border-slate-100'}`}>
                                                            {isNew && !sub && (
                                                                <div className="absolute top-0 right-10">
                                                                    <div className="bg-blue-600 text-white text-[9px] font-black px-5 py-2 uppercase tracking-[0.2em] rounded-b-2xl shadow-xl animate-bounce">Priority Intake</div>
                                                                </div>
                                                            )}
                                                            <div className="flex items-start justify-between gap-8">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-4">
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full">{task.company}</span>
                                                                        {task.deadline && (
                                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${new Date(task.deadline).getTime() < Date.now() + 2 * 24 * 60 * 60 * 1000 ? 'text-red-500' : 'text-amber-600'}`}>
                                                                                Target: {new Date(task.deadline).toLocaleDateString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{task.title}</h4>
                                                                    <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed max-w-2xl">{task.description}</p>
                                                                    {task.maxMarks && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 border-t border-slate-50 pt-4 inline-block">{task.maxMarks} Performance Points</p>}

                                                                    {sub && sub.attachments && sub.attachments.length > 0 && (
                                                                        <div className="mt-8 flex flex-wrap gap-3">
                                                                            {sub.attachments.map((file: any, i: number) => (
                                                                                <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-[10px] font-black uppercase text-slate-600 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                                                                                    <File className="h-4 w-4" /> {file.originalname}
                                                                                </a>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="shrink-0 pt-2">
                                                                    {sub ? (
                                                                        <div className="text-right">
                                                                            <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-5 py-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
                                                                                <CheckCheck className="h-4 w-4" /> Finalized
                                                                            </span>
                                                                            {sub.companyGrade?.marks !== null && sub.companyGrade?.marks !== undefined && (
                                                                                <div className="mt-6">
                                                                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{sub.companyGrade.marks}<span className="text-xs text-slate-300 font-bold ml-1 uppercase">/ {task.maxMarks}</span></p>
                                                                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">Verified Grade</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => { setSubmitTarget(task); setSubmitContent(''); setSubmitFiles([]); }}
                                                                            className="flex items-center gap-3 rounded-2xl bg-blue-600 px-8 h-16 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 active:scale-95 group/btn"
                                                                        >
                                                                            Submit Intent <Send className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {myReport && (
                                            <div className="rounded-[2.5rem] border border-teal-100 bg-teal-50/20 p-12 shadow-sm border-l-8 border-l-teal-500">
                                                <div className="flex items-center gap-3 mb-8">
                                                    <Shield className="w-5 h-5 text-teal-600" />
                                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-teal-600">Performance Assessment Record</p>
                                                </div>
                                                <div className="flex items-start justify-between gap-8 mb-10">
                                                    <p className="text-lg font-medium text-slate-700 leading-relaxed max-w-2xl">{myReport.summary}</p>
                                                    <div className="text-center">
                                                        <div className={`text-5xl font-black mb-1 p-4 rounded-3xl bg-white shadow-xl shadow-teal-500/10 border border-teal-50 ${myReport.overallRating >= 75 ? 'text-emerald-600' : myReport.overallRating >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                                            {myReport.overallRating}
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-3">Final Index</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-6 mb-10">
                                                    <div className="bg-white/60 px-5 py-3 rounded-2xl border border-teal-50 text-[10px] font-black uppercase tracking-widest text-teal-600">{myReport.recommendation?.replace('_', ' ')}</div>
                                                    <div className="bg-white/60 px-5 py-3 rounded-2xl border border-teal-50 text-[10px] font-black uppercase tracking-widest text-slate-600">{myReport.completionStatus}</div>
                                                </div>
                                                {myReport.scores && (
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                        {Object.entries(myReport.scores).map(([k, v]: [string, any]) => (
                                                            <div key={k} className="bg-white rounded-[1.75rem] p-6 border border-teal-50 shadow-sm text-center transform transition-transform hover:scale-105">
                                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">{k}</p>
                                                                <p className="text-3xl font-black text-teal-600 tracking-tighter">{v}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'profile' && (
                                    <div className="max-w-2xl mx-auto space-y-12 py-12 text-center">
                                        <div className="relative inline-block group">
                                            <div className="h-40 w-40 rounded-[3rem] bg-indigo-600 text-white text-5xl font-black shadow-[0_20px_50px_rgba(79,70,229,0.3)] overflow-hidden ring-[12px] ring-indigo-50 flex items-center justify-center relative translate-y-0 hover:-translate-y-2 transition-transform duration-500">
                                                {profile?.profilePicture ? (
                                                    <img src={profile.profilePicture} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    profile?.name?.[0]
                                                )}
                                                {profileImageLoading && (
                                                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center">
                                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <label className="absolute -bottom-2 -right-2 h-14 w-14 bg-white border-4 border-white rounded-[1.25rem] shadow-2xl flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all text-slate-400 hover:text-indigo-600 hover:scale-110 z-20">
                                                <Camera className="h-6 w-6" />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleProfilePictureChange} disabled={profileImageLoading} />
                                            </label>
                                        </div>

                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black text-slate-900 leading-none capitalize tracking-tight">{profile?.name}</h2>
                                            <p className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600">{profile?.rollNumber}</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 text-left">
                                            <ProfileField label="Institutional Login" value={profile?.email} />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <ProfileField label="Academic Year" value={profile?.session} />
                                                <ProfileField label="Degree Cluster" value={profile?.degree} />
                                            </div>
                                            <ProfileField label="Faculty Anchor" value={profile?.supervisorId?.name || 'Awaiting Super Admin Match'} isLink />
                                            <ProfileField label="Internship Vector" value={
                                                internshipStatus === 'none' ? 'No Active Thread'
                                                    : internshipStatus === 'submitted' ? 'Reviewing Submission'
                                                        : internshipStatus === 'approved' ? 'Request Authorized'
                                                            : internshipStatus === 'agreement_submitted' ? 'Paperwork Verification'
                                                                : internshipStatus === 'verified' ? 'Credentials Logged'
                                                                    : internshipStatus === 'internship_assigned' ? 'Placement Synchronized'
                                                                        : internshipStatus === 'rejected' ? 'Request Terminated'
                                                                            : internshipStatus
                                            } />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {showApplyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl p-8">
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-xl rounded-[3.5rem] border border-slate-100 bg-white p-14 shadow-[0_40px_100px_rgba(0,0,0,0.1)] relative">
                        <button onClick={() => setShowApplyModal(false)} className="absolute top-12 right-12 text-slate-300 hover:text-slate-900 transition-all hover:rotate-90"><X className="h-8 w-8" /></button>
                        <div className="mb-12">
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Sync New Request</h2>
                            <p className="mt-3 text-xs font-black uppercase tracking-[0.3em] text-blue-600">Placement Authorization</p>
                        </div>
                        <form onSubmit={handleApply} className="space-y-8">
                            <InputField label="Hiring Organization" value={newApp.companyName} onChange={e => setNewApp({ ...newApp, companyName: e.target.value })} placeholder="e.g. Arfa Software Park" />
                            <InputField label="Target Designation" value={newApp.position} onChange={e => setNewApp({ ...newApp, position: e.target.value })} placeholder="e.g. Associate Engineer" />
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Executive Summary</label>
                                <textarea rows={5} value={newApp.description} onChange={e => setNewApp({ ...newApp, description: e.target.value })} className="w-full rounded-3xl bg-slate-50 border-none p-8 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 resize-none shadow-inner" placeholder="Provide a granular overview of the proposed internship role..." />
                            </div>
                            <button type="submit" className="w-full h-20 rounded-[2rem] bg-blue-600 text-white text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/40 hover:bg-blue-700 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-4">
                                <span>Authorize Submission</span>
                                <Plus className="w-5 h-5" />
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {submitTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl p-8" onClick={() => setSubmitTarget(null)}>
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-xl rounded-[3.5rem] border border-slate-100 bg-white p-14 shadow-[0_40px_100px_rgba(0,0,0,0.1)] relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSubmitTarget(null)} className="absolute top-12 right-12 text-slate-300 hover:text-slate-900 transition-all hover:rotate-90"><X className="h-8 w-8" /></button>
                        <div className="mb-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-3">{submitTarget.company}</p>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{submitTarget.title}</h2>
                            <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">{submitTarget.description}</p>
                        </div>
                        <form onSubmit={handleSubmitTask} className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Submission Brief</label>
                                <textarea rows={4} value={submitContent} onChange={e => setSubmitContent(e.target.value)} className="w-full rounded-3xl bg-slate-50 border-none p-8 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 resize-none shadow-inner" placeholder="Key takeaways and deliverables summary..." />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">External Artifacts</label>
                                <div className="relative">
                                    <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => e.target.files && setSubmitFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
                                    <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50/50 p-10 text-center group hover:border-blue-200 transition-all flex flex-col items-center">
                                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-4 text-slate-400 group-hover:text-blue-500 transition-all shadow-sm">
                                            <Upload className="h-7 w-7" />
                                        </div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Select Deliverables</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Multi-format support (Max 10MB per object)</p>
                                    </div>
                                </div>

                                {submitFiles.length > 0 && (
                                    <div className="grid grid-cols-1 gap-3 mt-6">
                                        {submitFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm">
                                                        <File className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-slate-900 truncate max-w-[200px] uppercase tracking-tighter">{file.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Payload: {(file.size / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => setSubmitFiles(prev => prev.filter((_, i) => i !== idx))} className="p-2 hover:bg-white hover:text-red-500 rounded-xl text-slate-300 transition-all"><X className="h-4 w-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={submitLoading || (submitFiles.length === 0 && !submitContent)} className="w-full h-20 rounded-[2rem] bg-slate-900 text-white text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/30 hover:bg-slate-800 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-4">
                                {submitLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
                                {submitLoading ? 'Syncing...' : 'Log Submission'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

const ProfileField = ({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) => (
    <div className={`p-8 rounded-[2rem] border transition-all ${isLink ? 'border-indigo-100 bg-indigo-50/10 hover:bg-indigo-50/20' : 'border-slate-50 bg-slate-50/50 hover:bg-slate-100/50'}`}>
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] block mb-3">{label}</label>
        <p className="text-base font-black text-slate-900 tracking-tight">{value || 'Standby...'}</p>
    </div>
);

const InputField = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 block">{label}</label>
        <input {...props} required className="w-full h-18 rounded-3xl bg-slate-50 border-none px-8 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 shadow-inner" />
    </div>
);

export default StudentDashboard;
