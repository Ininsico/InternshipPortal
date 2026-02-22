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
    Paperclip,
    Upload,
    File,
    Camera,
    Clock,
    CheckCheck,
    AlertCircle,
    Send,
    Shield,
} from 'lucide-react';

type TabKey = 'overview' | 'applications' | 'tasks' | 'profile';

import API from '../config/api';

const API_BASE = API.STUDENT;

// Internship status pipeline — ordered progression
const STATUS_PIPELINE = [
    { key: 'submitted', label: 'Application Submitted', icon: Send, desc: 'Your internship application has been received and is under review.' },
    { key: 'approved', label: 'Application Approved', icon: CheckCheck, desc: 'Congratulations! Your application has been approved. Please submit your agreement form.' },
    { key: 'agreement_submitted', label: 'Agreement Submitted', icon: FileText, desc: 'Your internship agreement is submitted and awaiting admin verification.' },
    { key: 'verified', label: 'Documents Verified', icon: Shield, desc: 'All your documents have been verified. Awaiting final internship assignment by admin.' },
    { key: 'internship_assigned', label: 'Internship Assigned', icon: CheckCircle2, desc: 'You have been assigned to your company. Tasks and work will appear here.' },
];

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; cls: string }> = {
        pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
        approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-600 border-red-100' },
        in_progress: { label: 'In Progress', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
        completed: { label: 'Completed', cls: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
        verified: { label: 'Verified', cls: 'bg-teal-50 text-teal-600 border-teal-100' },
        internship_assigned: { label: 'Assigned', cls: 'bg-purple-50 text-purple-600 border-purple-100' },
    };
    const cfg = map[status] || { label: status, cls: 'bg-slate-50 text-slate-400 border-slate-100' };
    return (
        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border transition-colors ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
};

const StudentDashboard = () => {
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
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
    // Can only apply if they haven't submitted anything yet
    const canApply = internshipStatus === 'none' || internshipStatus === 'rejected';

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // Always fetch profile and applications
                const [profileRes, appsRes] = await Promise.all([
                    axios.get(`${API_BASE}/profile`, config),
                    axios.get(`${API_BASE}/applications`, config),
                ]);
                if (profileRes.data.success) setProfile(profileRes.data.student);
                if (appsRes.data.success) setApplications(appsRes.data.applications);

                // Only fetch tasks/submissions/report for assigned students
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

    const menuItems = [
        { key: 'overview', label: 'Overview', icon: LayoutDashboard },
        { key: 'applications', label: 'Applications', icon: Briefcase },
        ...(isAssigned ? [{ key: 'tasks', label: 'My Tasks', icon: ClipboardList }] : []),
        { key: 'profile', label: 'My Profile', icon: User },
    ];

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

    // ─── Render the status pipeline tracker for non-assigned students ────
    const renderStatusTracker = () => {
        const currentIdx = STATUS_PIPELINE.findIndex(s => s.key === internshipStatus);
        const currentStep = STATUS_PIPELINE[currentIdx] ?? null;

        if (internshipStatus === 'none') {
            return (
                <div className="rounded-2xl border-2 border-dashed border-blue-100 bg-blue-50/30 p-10 text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-white border border-blue-100 flex items-center justify-center mb-4 text-blue-600 shadow-sm">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">No Application Yet</h3>
                    <p className="mt-2 text-sm font-medium text-slate-500 max-w-sm mx-auto">
                        Start your internship journey by submitting a new application.
                    </p>
                    <button
                        onClick={() => setShowApplyModal(true)}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Plus className="h-3.5 w-3.5" /> Submit Application
                    </button>
                </div>
            );
        }

        if (internshipStatus === 'rejected') {
            return (
                <div className="rounded-2xl border-2 border-red-100 bg-red-50/30 p-10 text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-white border border-red-100 flex items-center justify-center mb-4 text-red-500 shadow-sm">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Application Rejected</h3>
                    <p className="mt-2 text-sm font-medium text-slate-500 max-w-sm mx-auto">
                        Your application was not approved. You may resubmit with corrected information.
                    </p>
                    <button
                        onClick={() => setShowApplyModal(true)}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                    >
                        <Plus className="h-3.5 w-3.5" /> Resubmit Application
                    </button>
                </div>
            );
        }

        return (
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 px-8 py-5 bg-slate-50/50">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900">Application Progress</h3>
                    <p className="mt-1 text-xs text-slate-400 font-medium">Track your internship approval pipeline</p>
                </div>
                <div className="px-8 py-6 space-y-0">
                    {STATUS_PIPELINE.map((step, idx) => {
                        const isCompleted = idx < currentIdx;
                        const isCurrent = idx === currentIdx;
                        const isPending = idx > currentIdx;
                        const StepIcon = step.icon;

                        return (
                            <div key={step.key} className="flex gap-5">
                                {/* Connector + icon */}
                                <div className="flex flex-col items-center">
                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all
                                        ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                            : isCurrent ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 ring-4 ring-blue-50'
                                                : 'bg-slate-100 text-slate-300'}`}
                                    >
                                        {isCompleted
                                            ? <CheckCheck className="h-4 w-4" />
                                            : <StepIcon className={`h-4 w-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                                        }
                                    </div>
                                    {idx < STATUS_PIPELINE.length - 1 && (
                                        <div className={`mt-1 w-px flex-1 min-h-[28px] ${isCompleted ? 'bg-emerald-200' : 'bg-slate-100'}`} />
                                    )}
                                </div>

                                {/* Text */}
                                <div className="pb-6">
                                    <p className={`text-xs font-black uppercase tracking-widest leading-none
                                        ${isCompleted ? 'text-emerald-600'
                                            : isCurrent ? 'text-blue-600'
                                                : 'text-slate-300'}`}
                                    >
                                        {isCompleted ? '✓ ' : ''}{step.label}
                                    </p>
                                    {isCurrent && (
                                        <p className="mt-1.5 text-xs font-medium text-slate-500 max-w-sm">
                                            {step.desc}
                                        </p>
                                    )}
                                    {isPending && (
                                        <p className="mt-1 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Upcoming</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Current status highlight footer */}
                {currentStep && (
                    <div className="border-t border-blue-50 bg-blue-50/40 px-8 py-4 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                            Current Status: {currentStep.label}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-white">
            <aside className="fixed left-0 top-0 z-40 h-screen w-16 flex-col border-r border-slate-100 bg-white md:w-64">
                <div className="flex h-16 items-center border-b border-slate-100 px-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
                        <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <span className="ml-3 hidden text-xs font-black tracking-[0.2em] text-slate-900 md:block uppercase leading-none">Student Portal</span>
                </div>
                <nav className="flex-1 space-y-1 p-3">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key as TabKey)}
                            className={`flex w-full items-center rounded-lg px-3 py-2.5 transition-all ${activeTab === item.key
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="ml-3 hidden text-[10px] font-black uppercase tracking-widest md:block">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="border-t border-slate-100 p-3">
                    <button onClick={logout} className="flex w-full items-center rounded-lg px-3 py-2.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all font-bold">
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span className="ml-3 hidden text-[10px] font-black uppercase tracking-widest md:block">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="ml-16 flex-1 md:ml-64">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-8 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Internship Portal / {activeTab}</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 border-r border-slate-100 pr-6">
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-900 leading-none">{user?.name}</p>
                                <p className="mt-1 text-[9px] font-black uppercase tracking-tighter text-blue-600">{profile?.rollNumber}</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-[10px] font-black text-white shadow-lg shadow-blue-500/20">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                        <button className="text-slate-400 hover:text-slate-900 transition-colors"><Bell className="h-5 w-5" /></button>
                    </div>
                </header>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[60vh] items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </motion.div>
                        ) : (
                            <motion.div key={activeTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>

                                {/* ─── OVERVIEW ─── */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-8">
                                        {/* Single current status card */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Internship Status</p>
                                                <p className="mt-3 text-xl font-black tracking-tight text-slate-900 leading-none capitalize">
                                                    {internshipStatus === 'none' ? 'Not Started'
                                                        : internshipStatus === 'submitted' ? 'Under Review'
                                                            : internshipStatus === 'approved' ? 'Approved'
                                                                : internshipStatus === 'agreement_submitted' ? 'Agreement Pending'
                                                                    : internshipStatus === 'verified' ? 'Verified'
                                                                        : internshipStatus === 'internship_assigned' ? 'Active'
                                                                            : internshipStatus === 'rejected' ? 'Rejected'
                                                                                : internshipStatus}
                                                </p>
                                                <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-blue-600 opacity-60">Current</p>
                                            </div>

                                            {applications.length > 0 && (
                                                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Application</p>
                                                    <p className="mt-3 text-xl font-black tracking-tight text-slate-900 leading-none">{applications[0]?.position}</p>
                                                    <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-400">{applications[0]?.companyName}</p>
                                                </div>
                                            )}

                                            {isAssigned && (
                                                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Tasks Progress</p>
                                                    <p className="mt-3 text-3xl font-black tracking-tighter text-slate-900 leading-none">
                                                        {submissions.length}<span className="text-slate-300 text-lg"> / {tasks.length}</span>
                                                    </p>
                                                    <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-blue-600 opacity-60">Submitted</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <div className="lg:col-span-2 space-y-6">
                                                {/* Status tracker for non-assigned, application tracker for assigned */}
                                                {!isAssigned && internshipStatus !== 'none' && internshipStatus !== 'rejected'
                                                    ? renderStatusTracker()
                                                    : renderStatusTracker()
                                                }
                                            </div>

                                            <div className="space-y-6">
                                                {isAssigned && (
                                                    <div className="rounded-2xl border border-blue-600 bg-blue-600 p-8 shadow-2xl shadow-blue-600/20 text-white">
                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Faculty Supervisor</h4>
                                                        <p className="mt-4 text-xl font-black">{profile?.supervisorId?.name || 'Awaiting Assignment'}</p>
                                                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest opacity-60">CUI Staff Member</p>
                                                        <div className="mt-8 pt-6 border-t border-white/10">
                                                            {profile?.supervisorId?.email ? (
                                                                <a
                                                                    href={`mailto:${profile.supervisorId.email}`}
                                                                    className="flex w-full items-center justify-between text-[10px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform"
                                                                >
                                                                    Contact Supervisor <ArrowUpRight className="h-4 w-4" />
                                                                </a>
                                                            ) : (
                                                                <button className="flex w-full items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-40 cursor-not-allowed">
                                                                    Contact Supervisor <ArrowUpRight className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {isAssigned && profile?.assignedCompany && (
                                                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Assigned Company</p>
                                                        <p className="text-sm font-black text-slate-900">{profile.assignedCompany}</p>
                                                        {profile.assignedPosition && (
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{profile.assignedPosition}</p>
                                                        )}
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => window.print()}
                                                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:bg-slate-50 transition-all font-black uppercase text-[10px] tracking-widest text-slate-600 active:scale-95"
                                                >
                                                    <FileText className="h-4 w-4" /> Download Records
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ─── APPLICATIONS ─── */}
                                {activeTab === 'applications' && (
                                    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                                        <div className="border-b border-slate-100 px-8 py-6 flex justify-between items-center bg-slate-50/50">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">All Applications ({applications.length})</h3>
                                            <button
                                                onClick={() => setShowApplyModal(true)}
                                                disabled={!canApply}
                                                className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg ${!canApply
                                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                                    : 'bg-blue-600 shadow-blue-600/10 hover:bg-blue-700'
                                                    }`}
                                            >
                                                <Plus className="h-3.5 w-3.5" /> {!canApply ? 'Already Applied' : 'New Application'}
                                            </button>
                                        </div>
                                        {applications.length === 0 ? (
                                            <div className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">No applications found</div>
                                        ) : (
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-100 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 bg-slate-50/30">
                                                        <th className="px-8 py-4">Company / Position</th>
                                                        <th className="px-8 py-4">Status</th>
                                                        <th className="px-8 py-4">Applied Date</th>
                                                        <th className="px-8 py-4 text-right">Details</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {applications.map((app: any) => (
                                                        <tr key={app._id} className="hover:bg-slate-50 group transition-colors">
                                                            <td className="px-8 py-5 text-sm font-black text-slate-900">
                                                                <div>
                                                                    <p>{app.companyName}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{app.position}</p>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <StatusBadge status={app.status || 'pending'} />
                                                            </td>
                                                            <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'N/A'}
                                                            </td>
                                                            <td className="px-8 py-5 text-right">
                                                                <button className="text-slate-200 hover:text-blue-600"><ArrowUpRight className="h-4 w-4" /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}

                                {/* ─── TASKS (only for internship_assigned students) ─── */}
                                {activeTab === 'tasks' && isAssigned && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Assigned Tasks ({tasks.length})</h3>
                                        </div>
                                        {tasks.length === 0 ? (
                                            <div className="rounded-2xl border border-slate-100 bg-white py-20 text-center shadow-sm">
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No tasks assigned yet.</p>
                                                <p className="text-xs text-slate-300 font-bold mt-1">Your company supervisor will assign tasks here.</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-5">
                                                {tasks.map((task: any) => {
                                                    const sub = submissions.find((s: any) => (s.task?._id || s.task) === task._id);
                                                    const isNew = new Date(task.createdAt).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000;
                                                    return (
                                                        <div key={task._id} className={`rounded-2xl border bg-white p-6 shadow-sm transition-all relative overflow-hidden ${!sub ? 'border-blue-200 shadow-blue-500/5 ring-1 ring-blue-50' : 'border-slate-100'}`}>
                                                            {isNew && !sub && (
                                                                <div className="absolute top-0 right-0">
                                                                    <div className="bg-blue-600 text-white text-[8px] font-black px-3 py-1 uppercase tracking-widest rounded-bl-xl shadow-lg animate-pulse">New Task</div>
                                                                </div>
                                                            )}
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{task.company}</span>
                                                                        {task.deadline && (
                                                                            <span className={`text-[10px] font-black ${new Date(task.deadline).getTime() < Date.now() + 2 * 24 * 60 * 60 * 1000 ? 'text-red-500' : 'text-amber-600'}`}>
                                                                                Due {new Date(task.deadline).toLocaleDateString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <h4 className="text-base font-black text-slate-900">{task.title}</h4>
                                                                    <p className="text-sm text-slate-500 mt-1 font-medium">{task.description}</p>
                                                                    {task.maxMarks && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{task.maxMarks} Marks Available</p>}

                                                                    {sub && sub.attachments && sub.attachments.length > 0 && (
                                                                        <div className="mt-4 flex flex-wrap gap-2">
                                                                            {sub.attachments.map((file: any, i: number) => (
                                                                                <a
                                                                                    key={i}
                                                                                    href={file.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="inline-flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-white hover:text-blue-600 transition-all shadow-sm"
                                                                                >
                                                                                    <File className="h-3 w-3" /> {file.originalname}
                                                                                </a>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="shrink-0 text-right">
                                                                    {sub ? (
                                                                        <div>
                                                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-600">
                                                                                <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
                                                                            </span>
                                                                            {sub.companyGrade?.marks !== null && sub.companyGrade?.marks !== undefined && (
                                                                                <p className="mt-3 text-2xl font-black text-slate-900">{sub.companyGrade.marks}<span className="text-xs text-slate-400 font-bold ml-1">/ {task.maxMarks}</span></p>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => { setSubmitTarget(task); setSubmitContent(''); setSubmitFiles([]); }}
                                                                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 group"
                                                                        >
                                                                            <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform" /> Submit Now
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
                                            <div className="rounded-2xl border border-teal-100 bg-teal-50/20 p-8 shadow-sm">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-4">Faculty Internship Report</p>
                                                <div className="flex items-start justify-between gap-4">
                                                    <p className="text-sm font-medium text-slate-700">{myReport.summary}</p>
                                                    <div className={`text-2xl font-black shrink-0 ${myReport.overallRating >= 75 ? 'text-emerald-600' : myReport.overallRating >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                                        {myReport.overallRating}/100
                                                    </div>
                                                </div>
                                                <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{myReport.recommendation?.replace('_', ' ')} · {myReport.completionStatus}</p>
                                                {myReport.scores && (
                                                    <div className="mt-4 grid grid-cols-4 gap-3">
                                                        {Object.entries(myReport.scores).map(([k, v]: [string, any]) => (
                                                            <div key={k} className="text-center bg-white rounded-xl p-3 border border-teal-100">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{k}</p>
                                                                <p className="text-lg font-black text-teal-600">{v}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Guard: tasks tab shown but not assigned (shouldn't happen but fallback) */}
                                {activeTab === 'tasks' && !isAssigned && (
                                    <div className="rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/30 p-20 text-center">
                                        <Clock className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Tasks Not Available</p>
                                        <p className="text-xs font-medium text-slate-300 mt-2">Tasks will be visible once your internship has been fully assigned by admin.</p>
                                    </div>
                                )}

                                {/* ─── PROFILE ─── */}
                                {activeTab === 'profile' && (
                                    <div className="max-w-xl mx-auto space-y-8 py-12 text-center">
                                        <div className="relative inline-block group mb-8">
                                            <div className="h-32 w-32 rounded-[2.5rem] bg-indigo-600 text-white text-4xl font-black shadow-2xl shadow-indigo-500/30 overflow-hidden ring-8 ring-indigo-50 flex items-center justify-center relative">
                                                {profile?.profilePicture ? (
                                                    <img src={profile.profilePicture} alt={profile.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    profile?.name?.[0]
                                                )}
                                                {profileImageLoading && (
                                                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                                                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <label className="absolute -bottom-1 -right-1 h-10 w-10 bg-white border border-slate-100 rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all text-slate-400 hover:text-indigo-600 group-hover:scale-110">
                                                <Camera className="h-4 w-4" />
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleProfilePictureChange}
                                                    disabled={profileImageLoading}
                                                />
                                            </label>
                                        </div>

                                        <div className="space-y-1 mb-10">
                                            <h2 className="text-2xl font-black text-slate-900 leading-none capitalize">{profile?.name}</h2>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">{profile?.rollNumber}</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 text-left">
                                            <ProfileField label="University Email" value={profile?.email} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <ProfileField label="Current Session" value={profile?.session} />
                                                <ProfileField label="Degree Program" value={profile?.degree} />
                                            </div>
                                            <ProfileField label="Faculty Supervisor" value={profile?.supervisorId?.name || 'Not Yet Assigned'} isLink />
                                            <ProfileField label="Internship Status" value={
                                                internshipStatus === 'none' ? 'Not Started'
                                                    : internshipStatus === 'submitted' ? 'Under Review'
                                                        : internshipStatus === 'approved' ? 'Application Approved'
                                                            : internshipStatus === 'agreement_submitted' ? 'Agreement Pending Verification'
                                                                : internshipStatus === 'verified' ? 'Documents Verified'
                                                                    : internshipStatus === 'internship_assigned' ? 'Internship Active'
                                                                        : internshipStatus === 'rejected' ? 'Application Rejected'
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

            {/* ─── APPLY MODAL ─── */}
            {showApplyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-xl p-6">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-[2.5rem] border border-slate-100 bg-white p-12 shadow-2xl shadow-blue-600/5 relative">
                        <button onClick={() => setShowApplyModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors"><X className="h-6 w-6" /></button>
                        <div className="mb-10 text-center">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Internship Request</h2>
                            <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Submit New Application</p>
                        </div>
                        <form onSubmit={handleApply} className="space-y-6">
                            <InputField label="Company Name" value={newApp.companyName} onChange={e => setNewApp({ ...newApp, companyName: e.target.value })} placeholder="e.g. Systems Ltd" />
                            <InputField label="Internship Position" value={newApp.position} onChange={e => setNewApp({ ...newApp, position: e.target.value })} placeholder="e.g. Software Engineer" />
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Application Summary</label>
                                <textarea rows={4} value={newApp.description} onChange={e => setNewApp({ ...newApp, description: e.target.value })} className="w-full rounded-2xl bg-slate-50 border-none p-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300" placeholder="Brief details about the internship..." />
                            </div>
                            <button type="submit" className="w-full h-16 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 mt-6">Submit Application</button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* ─── TASK SUBMISSION MODAL ─── */}
            {submitTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-xl p-6" onClick={() => setSubmitTarget(null)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-[2.5rem] border border-slate-100 bg-white p-12 shadow-2xl shadow-blue-600/5 relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSubmitTarget(null)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors"><X className="h-6 w-6" /></button>
                        <div className="mb-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">{submitTarget.company}</p>
                            <h2 className="text-xl font-black text-slate-900">{submitTarget.title}</h2>
                            <p className="text-sm text-slate-500 mt-1">{submitTarget.description}</p>
                        </div>
                        <form onSubmit={handleSubmitTask} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Submission Comments</label>
                                <textarea
                                    rows={3}
                                    value={submitContent}
                                    onChange={e => setSubmitContent(e.target.value)}
                                    className="w-full rounded-2xl bg-slate-50 border-none p-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300 resize-none"
                                    placeholder="Brief notes about your submission..."
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Attachments (Screenshots, PDFs, Docs)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        multiple
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                setSubmitFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                                            }
                                        }}
                                    />
                                    <div className="rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 p-8 text-center group hover:border-blue-200 transition-all">
                                        <div className="mx-auto w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center mb-3 text-slate-400 group-hover:text-blue-500 transition-colors shadow-sm">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <p className="text-xs font-black text-slate-900">Click to upload or drag and drop</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">PDF, JPG, PNG, DOCX (Max 10MB)</p>
                                    </div>
                                </div>

                                {submitFiles.length > 0 && (
                                    <div className="grid grid-cols-1 gap-2 mt-4">
                                        {submitFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-blue-600">
                                                        <File className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-900 truncate max-w-[180px]">{file.name}</p>
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSubmitFiles(prev => prev.filter((_, i) => i !== idx))}
                                                    className="p-1.5 hover:bg-white hover:text-red-500 rounded-lg text-slate-300 transition-all"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => { setSubmitTarget(null); setSubmitFiles([]); }} className="flex-1 h-14 rounded-2xl border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={submitLoading || (submitFiles.length === 0 && !submitContent)}
                                    className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                                    {submitLoading ? 'Uploading...' : 'Submit Work'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

interface ProfileFieldProps {
    label: string;
    value: string;
    isLink?: boolean;
}

const ProfileField = ({ label, value, isLink }: ProfileFieldProps) => (
    <div className={`p-6 rounded-2xl border ${isLink ? 'border-blue-100 bg-blue-50/20' : 'border-slate-50 bg-slate-50/50'}`}>
        <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] block mb-2">{label}</label>
        <p className="text-sm font-black text-slate-900 tracking-tight">{value || 'N/A'}</p>
    </div>
);

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const InputField = ({ label, ...props }: InputFieldProps) => (
    <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{label}</label>
        <input {...props} required className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300" />
    </div>
);

export default StudentDashboard;
