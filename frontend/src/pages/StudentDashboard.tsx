import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    LogOut,
    FileText,
    Briefcase,
    User,
    Plus,
    Loader2,
    X,
    ArrowUpRight,
    CheckCircle2,
    Upload,
    File,
    Camera,
    CheckCheck,
    AlertCircle,
    Send,
    Shield,
    Building2,
    Menu,
    GraduationCap,
    Mail,
    Calendar,
    Hash,
    FileCheck,
    ClipboardList,
    Globe,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Link,
    LayoutDashboard,
    Files,
    ChevronDown
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
    const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'pending_assignments' | 'assignment_summary' | 'results' | 'weekly_updates' | 'profile'>('overview');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [myReport, setMyReport] = useState<any>(null);
    const [weeklyUpdates, setWeeklyUpdates] = useState<any[]>([]);
    const [isFreelancer, setIsFreelancer] = useState(false);
    const [submitTarget, setSubmitTarget] = useState<any | null>(null);
    const [submitContent, setSubmitContent] = useState('');
    const [submitFiles, setSubmitFiles] = useState<File[]>([]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [profileImageLoading, setProfileImageLoading] = useState(false);
    const [assignmentsOpen, setAssignmentsOpen] = useState(false);
    const [applyError, setApplyError] = useState('');
    const [applyLoading, setApplyLoading] = useState(false);

    // Multi-step application form state
    const [applyStep, setApplyStep] = useState(0);
    const [internshipCategory, setInternshipCategory] = useState<'university_assigned' | 'self_found' | 'freelancer'>('university_assigned');
    const [newApp, setNewApp] = useState({
        companyName: '',
        position: '',
        description: '',
        internshipType: 'Full-time',
        duration: '8 weeks',
        workMode: 'onsite' as 'onsite' | 'remote',
        internshipField: '',
    });
    const [selfFoundSupervisor, setSelfFoundSupervisor] = useState({
        name: '', email: '', phone: '', designation: '', companyAddress: ''
    });
    const [freelancerAccounts, setFreelancerAccounts] = useState([
        { platform: '', profileUrl: '', username: '' }
    ]);

    // Weekly updates state
    const [showWeeklyModal, setShowWeeklyModal] = useState(false);
    const [weeklyForm, setWeeklyForm] = useState({
        weekNumber: 1, workSummary: '', hoursWorked: 0, technologiesUsed: '', challenges: ''
    });
    const [weeklyPlatformLinks, setWeeklyPlatformLinks] = useState<{ platform: string; url: string; description: string }[]>([]);
    const [weeklySubmitLoading, setWeeklySubmitLoading] = useState(false);

    const internshipStatus = profile?.internshipStatus || user?.internshipStatus || 'none';
    const isAssigned = internshipStatus === 'internship_assigned';
    const canApply = internshipStatus === 'none' || internshipStatus === 'rejected';

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`${API_BASE}/dashboard-state`, config);

                if (data.success) {
                    setProfile(data.student);
                    setApplications(data.applications);
                    setTasks(data.tasks);
                    setSubmissions(data.submissions);
                    setMyReport(data.report);
                    setWeeklyUpdates(data.weeklyUpdates || []);
                    setIsFreelancer(data.isFreelancer || false);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard state:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        setApplyError('');
        setApplyLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Build the payload based on internship category
            const payload: any = {
                ...newApp,
                internshipCategory,
            };

            if (internshipCategory === 'self_found') {
                payload.selfFoundSupervisor = selfFoundSupervisor;
                payload.companyName = payload.companyName || selfFoundSupervisor.companyAddress;
            } else if (internshipCategory === 'freelancer') {
                payload.freelancerAccounts = freelancerAccounts.filter(a => a.platform && a.profileUrl);
                payload.companyName = 'Freelance';
                payload.position = payload.position || 'Freelance Developer';
                delete payload.workMode;
            }

            const { data } = await axios.post(`${API_BASE}/apply`, payload, config);
            if (data.success) {
                setApplications([data.application, ...applications]);
                setShowApplyModal(false);
                setApplyStep(0);
                setNewApp({ companyName: '', position: '', description: '', internshipType: 'Full-time', duration: '8 weeks', workMode: 'onsite', internshipField: '' });
                setSelfFoundSupervisor({ name: '', email: '', phone: '', designation: '', companyAddress: '' });
                setFreelancerAccounts([{ platform: '', profileUrl: '', username: '' }]);
                setInternshipCategory('university_assigned');
                // Refresh the profile to get updated internship status
                const { data: dash } = await axios.get(`${API_BASE}/dashboard-state`, config);
                if (dash.success) {
                    setProfile(dash.student);
                    setIsFreelancer(dash.isFreelancer || false);
                }
            }
        } catch (err: any) {
            setApplyError(err?.response?.data?.message || 'Failed to submit application.');
        } finally {
            setApplyLoading(false);
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

    const renderStatusOverview = () => {
        if (internshipStatus === 'none') {
            return (
                <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 text-slate-400">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-950 font-display">No Active Application</h3>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 max-w-sm mx-auto">
                        Please initialize your internship application to activate the dashboard.
                    </p>
                    <button
                        onClick={() => setShowApplyModal(true)}
                        className="mt-8 inline-flex items-center gap-3 rounded-xl bg-slate-900 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        <Plus className="h-4 w-4" /> Initialize Application
                    </button>
                </div>
            );
        }

        if (internshipStatus === 'rejected') {
            return (
                <div className="rounded-3xl border border-red-100 bg-white p-12 text-center shadow-sm">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6 text-red-500">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-950 font-display">Application Rejected</h3>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 max-w-sm mx-auto">
                        Your application was not approved. Please review the feedback and resubmit.
                    </p>
                    <button
                        onClick={() => setShowApplyModal(true)}
                        className="mt-8 inline-flex items-center gap-3 rounded-xl bg-red-600 px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-100"
                    >
                        <Plus className="h-4 w-4" /> Rectify Records
                    </button>
                </div>
            );
        }

        const currentIdx = STATUS_PIPELINE.findIndex(s => s.key === internshipStatus);
        const currentStep = STATUS_PIPELINE[currentIdx];

        return (
            <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="p-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-950 font-display">Workflow Status</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Processing Status</p>
                        </div>
                        <div className="bg-slate-100 px-4 py-2 rounded-xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{internshipStatus.replace('_', ' ')}</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Current Activity Phase</p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-widest text-slate-900">{currentStep?.label || 'In Progress'}</p>
                                    <p className="text-[11px] font-bold text-slate-500 mt-1">{currentStep?.desc || 'Your application is being processed by the system registry.'}</p>
                                </div>
                            </div>
                        </div>

                        {applications.length > 0 && internshipStatus === 'submitted' && (
                            <div className="pt-6 border-t border-slate-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Categorization</p>
                                        <p className="text-xs font-bold text-slate-900 uppercase">{applications[0].internshipCategory?.replace('_', ' ')}</p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Proposed Duration</p>
                                        <p className="text-xs font-bold text-slate-900 uppercase">{applications[0].duration}</p>
                                    </div>

                                    {applications[0].internshipCategory === 'self_found' && (
                                        <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-3">Sourced Supervisor</p>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[11px] font-bold text-slate-900 uppercase">{applications[0].selfFoundSupervisor?.name}</p>
                                                    <p className="text-[10px] text-slate-400">{applications[0].selfFoundSupervisor?.email}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-slate-900">{applications[0].selfFoundSupervisor?.designation}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {applications[0].internshipCategory === 'freelancer' && (
                                        <div className="md:col-span-2 space-y-3">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-1">Freelance Identities</p>
                                            {applications[0].freelancerAccounts?.map((acc: any, i: number) => (
                                                <div key={i} className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between shadow-sm">
                                                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">{acc.platform}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono italic">{acc.username}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-slate-50/50 overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {showMobileSidebar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                        onClick={() => setShowMobileSidebar(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-[#f5f8ff] border-r border-blue-100/50 shadow-sm transition-transform duration-300 lg:sticky lg:translate-x-0 h-screen ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:w-72 lg:flex'}`}>
                <div className="flex h-24 items-center px-8 border-b border-blue-50 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center shrink-0 bg-white rounded-xl shadow-sm">
                        <img src="/comsatslogo.png" alt="COMSATS logo" className="h-full w-full object-contain p-2" />
                    </div>
                    <div className="ml-4 hidden md:block">
                        <span className="text-sm font-extrabold tracking-tight text-blue-900 leading-none">CUI ATD Portal</span>
                    </div>
                </div>
                <nav className="flex-1 space-y-2 px-6">
                    <div className="pb-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2 font-display">Main Portal</p>
                        <button
                            onClick={() => { setActiveTab('overview'); setAssignmentsOpen(false); setShowMobileSidebar(false); }}
                            className={`group flex w-full items-center gap-4 rounded-2xl px-5 py-3.5 transition-all duration-300 ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm'}`}
                        >
                            <LayoutDashboard className={`h-5 w-5 ${activeTab === 'overview' ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                            <span className="text-[13px] font-bold tracking-tight font-display">Dashboard</span>
                        </button>
                    </div>

                    {!isAssigned && (
                        <div className="pb-4">
                            <button
                                onClick={() => { setActiveTab('applications'); setAssignmentsOpen(false); setShowMobileSidebar(false); }}
                                className={`group flex w-full items-center gap-4 rounded-2xl px-5 py-3.5 transition-all duration-300 ${activeTab === 'applications' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm'}`}
                            >
                                <Files className={`h-5 w-5 ${activeTab === 'applications' ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                                <span className="text-[13px] font-bold tracking-tight font-display">Applications</span>
                            </button>
                        </div>
                    )}

                    {isAssigned && isFreelancer && (
                        <div className="pb-4">
                            <button
                                onClick={() => { setActiveTab('weekly_updates'); setAssignmentsOpen(false); setShowMobileSidebar(false); }}
                                className={`group flex w-full items-center gap-4 rounded-2xl px-5 py-3.5 transition-all duration-300 ${activeTab === 'weekly_updates' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm'}`}
                            >
                                <ClipboardList className={`h-5 w-5 ${activeTab === 'weekly_updates' ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                                <span className="text-[13px] font-bold tracking-tight font-display">Weekly Updates</span>
                            </button>
                        </div>
                    )}

                    {isAssigned && !isFreelancer && (
                        <div className="space-y-2 pb-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2 font-display">Academic Work</p>
                            <button
                                onClick={() => setAssignmentsOpen(!assignmentsOpen)}
                                className={`group flex w-full items-center justify-between rounded-2xl px-5 py-3.5 transition-all duration-300 ${activeTab === 'pending_assignments' || activeTab === 'assignment_summary' ? 'bg-blue-50/80 text-blue-700 ring-1 ring-blue-100/50' : 'text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <Briefcase className={`h-5 w-5 ${activeTab === 'pending_assignments' || activeTab === 'assignment_summary' ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                                    <span className="text-[13px] font-bold tracking-tight font-display">Assignments</span>
                                </div>
                                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${assignmentsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {assignmentsOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden space-y-1 ml-4 border-l-2 border-blue-50/50 pl-4 mt-2"
                                    >
                                        <button
                                            onClick={() => { setActiveTab('pending_assignments'); setShowMobileSidebar(false); }}
                                            className={`flex w-full items-center rounded-xl px-4 py-2.5 transition-all ${activeTab === 'pending_assignments' ? 'text-blue-700 bg-blue-50/50 font-bold' : 'text-slate-400 hover:text-blue-600 hover:bg-white'}`}
                                        >
                                            <span className="text-[12px] font-bold font-display">Pending Assignments</span>
                                        </button>
                                        <button
                                            onClick={() => { setActiveTab('assignment_summary'); setShowMobileSidebar(false); }}
                                            className={`flex w-full items-center rounded-xl px-4 py-2.5 transition-all ${activeTab === 'assignment_summary' ? 'text-blue-700 bg-blue-50/50 font-bold' : 'text-slate-400 hover:text-blue-600 hover:bg-white'}`}
                                        >
                                            <span className="text-[12px] font-bold font-display">Assignment Summary</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={() => { setActiveTab('results'); setAssignmentsOpen(false); setShowMobileSidebar(false); }}
                                className={`group flex w-full items-center gap-4 rounded-2xl px-5 py-3.5 transition-all duration-300 ${activeTab === 'results' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm'}`}
                            >
                                <GraduationCap className={`h-5 w-5 ${activeTab === 'results' ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                                <span className="text-[13px] font-bold tracking-tight font-display">Results</span>
                            </button>
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2 font-display">Account</p>
                        <button
                            onClick={() => { setActiveTab('profile'); setAssignmentsOpen(false); setShowMobileSidebar(false); }}
                            className={`group flex w-full items-center gap-4 rounded-2xl px-5 py-3.5 transition-all duration-300 ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm'}`}
                        >
                            <User className={`h-5 w-5 ${activeTab === 'profile' ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                            <span className="text-[13px] font-bold tracking-tight font-display">My Profile</span>
                        </button>
                    </div>
                </nav>

            </aside>


            <main className="flex-1 transition-all min-w-0 h-full overflow-y-auto">
                <header className="sticky top-0 z-30 flex h-16 md:h-24 items-center justify-between border-b border-slate-100 bg-white/80 px-4 md:px-10 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowMobileSidebar(true)}
                            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-900 hover:bg-slate-100 transition-all"
                        >
                            <Menu className="h-4 w-4" />
                        </button>
                        <div className="hidden lg:flex flex-col">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">University Portal</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Session</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-8">
                        <div className="flex items-center gap-3 md:gap-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 leading-none">{user?.name}</p>
                                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">{profile?.rollNumber}</p>
                            </div>
                            <div className="relative group">
                                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-slate-100 text-xs font-bold text-slate-900 shadow-sm overflow-hidden ring-4 ring-white">
                                    {profile?.profilePicture ? (
                                        <img src={profile.profilePicture} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.charAt(0)
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden md:block" />
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-black transition-all shadow-sm active:scale-95"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">Sign Out</span>
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-10 max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[60vh] items-center justify-center">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                            </motion.div>
                        ) : (
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                {activeTab === 'overview' && (
                                    <div className="space-y-6 md:space-y-10">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                                            {[
                                                { label: 'Internship Status', val: internshipStatus.replace('_', ' '), sub: '', color: 'blue' },
                                                { label: 'Internship Records', val: applications[0]?.position || (isAssigned ? profile?.assignedPosition : 'Not Applied'), sub: applications[0]?.companyName || (isAssigned ? profile?.assignedCompany : 'N/A'), color: 'slate' },
                                                { label: 'Submissions', val: isAssigned ? `${submissions.length} / ${tasks.length}` : '—', sub: '', color: 'indigo' }
                                            ].map((stat, i) => (
                                                <div key={i} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm group">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
                                                    <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900 font-display capitalize">{stat.val}</p>
                                                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-blue-600">{stat.sub}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                                            {/* Pipeline tracker: only shown while application is in-progress (not yet assigned) */}
                                            {!isAssigned && (
                                                <div className="lg:col-span-2 space-y-6">
                                                    {renderStatusOverview()}
                                                </div>
                                            )}

                                            <div className={`space-y-8 ${!isAssigned ? '' : 'lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-8'}`}>
                                                {isAssigned && (
                                                    <div className="rounded-3xl border border-slate-100 bg-white p-10 shadow-sm relative overflow-hidden group">
                                                        <div className="flex flex-col h-full">
                                                            <div className="flex items-center justify-between mb-8">
                                                                <div>
                                                                    <h4 className="text-xl font-bold text-slate-900 font-display">Faculty Advisor</h4>
                                                                </div>
                                                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                                    <User className="h-6 w-6" />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4 flex-1">
                                                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Supervisor Name</p>
                                                                    <p className="text-sm font-bold text-slate-900">{profile?.supervisorId?.name || 'Awaiting Allocation'}</p>
                                                                </div>
                                                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Directory Designation</p>
                                                                    <p className="text-sm font-bold text-slate-900">Academic Staff Member</p>
                                                                </div>
                                                            </div>


                                                        </div>
                                                    </div>
                                                )}

                                                {isAssigned && (
                                                    <div className="rounded-3xl border border-slate-100 bg-white p-10 shadow-sm relative overflow-hidden group">
                                                        <div className="flex flex-col h-full">
                                                            <div className="flex items-center justify-between mb-8">
                                                                <div>
                                                                    <h4 className="text-xl font-bold text-slate-900 font-display">Internship Details</h4>
                                                                </div>
                                                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                                    <Building2 className="h-6 w-6" />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4 flex-1">
                                                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Company Entity</p>
                                                                    <p className="text-sm font-bold text-slate-900">{profile?.assignedCompany || 'Assignment Pending'}</p>
                                                                </div>
                                                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Assigned Role</p>
                                                                    <p className="text-sm font-bold text-slate-900">{profile?.assignedPosition || 'Contractor'}</p>
                                                                </div>
                                                            </div>


                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'applications' && (
                                    <div className="rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
                                        <div className="border-b border-slate-100 px-5 md:px-10 py-5 md:py-8 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50">
                                            <div>
                                                <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-900">Historical Records</h3>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Found {applications.length} submitted requests</p>
                                            </div>
                                            <button
                                                onClick={() => setShowApplyModal(true)}
                                                disabled={!canApply}
                                                className={`flex items-center gap-3 rounded-2xl px-5 md:px-8 h-12 md:h-14 text-[11px] font-bold uppercase tracking-wider text-white transition-all shadow-2xl ${!canApply
                                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                                    : 'bg-blue-600 shadow-blue-500/30 hover:bg-blue-700 active:scale-95'
                                                    }`}
                                            >
                                                <Plus className="h-4 w-4" /> {!canApply ? 'Applied' : 'New Intake'}
                                            </button>
                                        </div>
                                        {applications.length === 0 ? (
                                            <div className="p-16 md:p-32 text-center text-[11px] font-bold uppercase tracking-wider text-slate-300">Null records found</div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left min-w-[500px]">
                                                    <thead>
                                                        <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/20">
                                                            <th className="px-5 md:px-10 py-4 md:py-6">Placement / Position</th>
                                                            <th className="px-5 md:px-10 py-4 md:py-6">Status</th>
                                                            <th className="px-5 md:px-10 py-4 md:py-6 hidden sm:table-cell">Date</th>
                                                            <th className="px-5 md:px-10 py-4 md:py-6 text-right">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {applications.map((app: any) => (
                                                            <tr key={app._id} className="hover:bg-slate-50 transition-colors group">
                                                                <td className="px-5 md:px-10 py-5 md:py-8">
                                                                    <p className="text-sm font-bold text-slate-900">{app.companyName}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5 tracking-widest">{app.position}</p>
                                                                </td>
                                                                <td className="px-5 md:px-10 py-5 md:py-8">
                                                                    <StatusPill status={app.status || 'pending'} />
                                                                </td>
                                                                <td className="px-5 md:px-10 py-5 md:py-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">
                                                                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'N/A'}
                                                                </td>
                                                                <td className="px-5 md:px-10 py-5 md:py-8 text-right">
                                                                    <button className="h-10 w-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:border-blue-100 transition-all"><ArrowUpRight className="h-5 w-5" /></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'pending_assignments' && isAssigned && (
                                    <div className="space-y-12">
                                        {!submitTarget ? (
                                            <>
                                                <div className="flex flex-wrap items-center justify-between gap-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900 font-display">Pending Assignments</h3>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Outstanding Tasks</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-100 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-amber-600">
                                                        {tasks.filter(t => !submissions.find(s => (s.task?._id || s.task) === t._id)).length} Remaining
                                                    </div>
                                                </div>

                                                <div className="grid gap-6">
                                                    {tasks.filter(t => !submissions.find(s => (s.task?._id || s.task) === t._id)).length === 0 ? (
                                                        <div className="rounded-3xl border border-slate-100 bg-white py-32 text-center shadow-sm">
                                                            <CheckCheck className="w-12 h-12 text-emerald-300 mx-auto mb-6" />
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">All tasks completed</p>
                                                        </div>
                                                    ) : (
                                                        tasks.filter(t => !submissions.find(s => (s.task?._id || s.task) === t._id)).map((task: any) => {
                                                            const isOverdue = task.deadline && new Date(task.deadline).getTime() < Date.now();
                                                            const isDueSoon = task.deadline && !isOverdue && new Date(task.deadline).getTime() < Date.now() + 2 * 24 * 60 * 60 * 1000;

                                                            return (
                                                                <div key={task._id} className={`rounded-3xl border bg-white shadow-sm transition-all overflow-hidden ${isOverdue ? 'border-red-200' : 'border-slate-100 shadow-xl shadow-slate-200/20'}`}>
                                                                    <div className={`h-1 w-full ${isOverdue ? 'bg-red-500' : isDueSoon ? 'bg-amber-400' : 'bg-blue-500'}`} />
                                                                    <div className="p-8">
                                                                        <div className="flex items-start justify-between gap-6">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-3 mb-4">
                                                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">{task.company}</span>
                                                                                    {task.deadline && (
                                                                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${isOverdue ? 'text-red-600 bg-red-50 border-red-100' : 'text-slate-500 bg-slate-50 border-slate-100'}`}>
                                                                                            Due: {new Date(task.deadline).toLocaleDateString()}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <h5 className="text-lg font-bold text-slate-900">{task.title}</h5>
                                                                                <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">{task.description}</p>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => { setSubmitTarget(task); setSubmitContent(''); setSubmitFiles([]); }}
                                                                                className="shrink-0 flex items-center gap-2.5 rounded-2xl bg-slate-900 px-6 h-12 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-black transition-all active:scale-95"
                                                                            >
                                                                                Upload Task <Send className="h-3.5 w-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="max-w-4xl mx-auto">
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40 overflow-hidden"
                                                >
                                                    <div className="px-10 py-10 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                                                        <div className="flex items-center gap-6">
                                                            <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3">
                                                                <Upload className="h-7 w-7 text-white" />
                                                            </div>
                                                            <div>
                                                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">{submitTarget.title}</h2>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-1 flex items-center gap-2">
                                                                    <Building2 className="w-3 h-3" />
                                                                    {submitTarget.company}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setSubmitTarget(null)}
                                                            className="h-12 w-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-950 hover:border-slate-300 shadow-sm transition-all active:scale-95"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </div>

                                                    <form onSubmit={handleSubmitTask} className="p-10 space-y-10">
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                                            <div className="space-y-6">
                                                                <div className="flex items-center justify-between px-1">
                                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Submission Response</label>
                                                                    <span className="text-[10px] font-bold text-slate-300">{submitContent.length} characters</span>
                                                                </div>
                                                                <textarea
                                                                    rows={12}
                                                                    value={submitContent}
                                                                    onChange={e => setSubmitContent(e.target.value)}
                                                                    className="w-full rounded-3xl bg-slate-50 border border-slate-100 p-8 text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-blue-100/50 focus:bg-white transition-all placeholder:text-slate-300 resize-none shadow-sm"
                                                                    placeholder="Describe your progress, findings, or any challenges encounter during this task..."
                                                                />
                                                            </div>

                                                            <div className="space-y-6">
                                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Supporting Documentation</label>
                                                                <div className="relative group">
                                                                    <input
                                                                        type="file"
                                                                        multiple
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                        onChange={(e) => e.target.files && setSubmitFiles(prev => [...prev, ...Array.from(e.target.files!)])}
                                                                    />
                                                                    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center flex flex-col items-center group-hover:bg-blue-50/50 group-hover:border-blue-300 transition-all duration-300">
                                                                        <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-md mb-6 group-hover:scale-110 transition-transform">
                                                                            <Upload className="h-6 w-6 text-blue-500" />
                                                                        </div>
                                                                        <p className="text-sm font-bold text-slate-900">Drop files here or click to browse</p>
                                                                        <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-wider">PDF, DOCX, ZIP • MAX 10MB</p>
                                                                    </div>
                                                                </div>

                                                                <AnimatePresence>
                                                                    {submitFiles.length > 0 && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 10 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            className="space-y-3 mt-6 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar"
                                                                        >
                                                                            {submitFiles.map((file, idx) => (
                                                                                <motion.div
                                                                                    key={idx}
                                                                                    initial={{ opacity: 0, x: -10 }}
                                                                                    animate={{ opacity: 1, x: 0 }}
                                                                                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-colors"
                                                                                >
                                                                                    <div className="flex items-center gap-4">
                                                                                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                                                                            <File className="h-5 w-5 text-blue-600" />
                                                                                        </div>
                                                                                        <div className="min-w-0">
                                                                                            <p className="text-[11px] font-bold text-slate-900 truncate max-w-[180px]">{file.name}</p>
                                                                                            <p className="text-[9px] font-medium text-slate-400 capitalize">{(file.size / 1024).toFixed(1)} KB</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => setSubmitFiles(prev => prev.filter((_, i) => i !== idx))}
                                                                                        className="h-8 w-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                                    >
                                                                                        <X className="h-4 w-4" />
                                                                                    </button>
                                                                                </motion.div>
                                                                            ))}
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </div>

                                                        <div className="pt-8 border-t border-slate-100 flex items-center justify-end gap-5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSubmitTarget(null)}
                                                                className="px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all font-display"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                disabled={submitLoading || (submitFiles.length === 0 && !submitContent)}
                                                                className="px-10 py-4 rounded-2xl bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-black hover:shadow-slate-900/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                                                            >
                                                                {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                                                {submitLoading ? 'Transmitting...' : 'Complete Submission'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </motion.div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'assignment_summary' && isAssigned && (
                                    <div className="space-y-12">
                                        {!submitTarget ? (
                                            <>
                                                <div className="flex flex-wrap items-center justify-between gap-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900 font-display">Assignment Summary</h3>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Academic Submissions</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                                                        {submissions.length} Records
                                                    </div>
                                                </div>

                                                <div className="grid gap-6">
                                                    {submissions.length === 0 ? (
                                                        <div className="rounded-3xl border border-slate-100 bg-white py-32 text-center shadow-sm">
                                                            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No submissions found</p>
                                                        </div>
                                                    ) : (
                                                        submissions.map((sub: any) => {
                                                            const task = sub.task;
                                                            const isGraded = sub?.companyGrade?.marks !== null && sub?.companyGrade?.marks !== undefined;

                                                            return (
                                                                <div key={sub._id} className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                                                                    <div className="p-8">
                                                                        <div className="flex items-start justify-between gap-6">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-3 mb-4">
                                                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">Completed</span>
                                                                                    {isGraded && (
                                                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">Marks: {sub.companyGrade.marks}</span>
                                                                                    )}
                                                                                </div>
                                                                                <h5 className="text-lg font-bold text-slate-900">
                                                                                    {typeof task === 'string' || !task?.title ? `Assignment ${submissions.length - submissions.indexOf(sub)}` : task?.title}
                                                                                </h5>
                                                                                <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">My Submission</p>
                                                                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{sub.content}</p>
                                                                                </div>
                                                                                {sub.companyGrade?.feedback && (
                                                                                    <div className="mt-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                                                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 mb-2">Feedback</p>
                                                                                        <p className="text-sm text-slate-700 font-medium leading-relaxed">{sub.companyGrade.feedback}</p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {!isGraded && (
                                                                                <button
                                                                                    onClick={() => { setSubmitTarget(task); setSubmitContent(sub.content || ''); setSubmitFiles([]); }}
                                                                                    className="shrink-0 flex items-center gap-2.5 rounded-2xl bg-white border border-slate-200 px-6 h-12 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all font-sans"
                                                                                >
                                                                                    Edit Submission <Send className="h-3.5 w-3.5" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>

                                                {myReport && (
                                                    <div className="rounded-[2.5rem] border border-blue-100 bg-gradient-to-br from-blue-50/10 to-white p-10 shadow-sm mt-12">
                                                        <div className="flex items-center gap-3 mb-8">
                                                            <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                                                                <Shield className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Final Performance Report</p>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Faculty Evaluation</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start justify-between gap-8 mb-8">
                                                            <p className="text-base font-medium text-slate-600 leading-relaxed max-w-2xl">{myReport.summary}</p>
                                                            <div className="shrink-0 text-center bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-500/5 p-6">
                                                                <p className={`text-5xl font-bold mb-1 ${myReport.overallRating >= 75 ? 'text-emerald-600' : myReport.overallRating >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                                                    {myReport.overallRating}
                                                                </p>
                                                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total Score</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <span className="bg-blue-50 border border-blue-100 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-blue-600">{myReport.recommendation?.replace('_', ' ')}</span>
                                                            <span className="bg-slate-50 border border-slate-100 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600">{myReport.completionStatus}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="max-w-4xl mx-auto">
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40 overflow-hidden"
                                                >
                                                    <div className="px-10 py-10 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                                                        <div className="flex items-center gap-6">
                                                            <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3">
                                                                <FileCheck className="h-7 w-7 text-white" />
                                                            </div>
                                                            <div>
                                                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">Edit Submission</h2>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-1 flex items-center gap-2">
                                                                    <Building2 className="w-3 h-3" />
                                                                    {submitTarget.company || 'Corporate Partner'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setSubmitTarget(null)}
                                                            className="h-12 w-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-950 hover:border-slate-300 shadow-sm transition-all active:scale-95"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </div>

                                                    <form onSubmit={handleSubmitTask} className="p-10 space-y-10">
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                                            <div className="space-y-6">
                                                                <div className="flex items-center justify-between px-1">
                                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Revised Content</label>
                                                                    <span className="text-[10px] font-bold text-slate-300">{submitContent.length} characters</span>
                                                                </div>
                                                                <textarea
                                                                    rows={12}
                                                                    value={submitContent}
                                                                    onChange={e => setSubmitContent(e.target.value)}
                                                                    className="w-full rounded-3xl bg-slate-50 border border-slate-100 p-8 text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-blue-100/50 focus:bg-white transition-all placeholder:text-slate-300 resize-none shadow-sm"
                                                                    placeholder="Update your submission details..."
                                                                />
                                                            </div>

                                                            <div className="space-y-6">
                                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">File Attachments</label>
                                                                <div className="relative group">
                                                                    <input
                                                                        type="file"
                                                                        multiple
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                        onChange={(e) => e.target.files && setSubmitFiles(prev => [...prev, ...Array.from(e.target.files!)])}
                                                                    />
                                                                    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center flex flex-col items-center group-hover:bg-blue-50/50 group-hover:border-blue-300 transition-all duration-300">
                                                                        <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-md mb-6 group-hover:scale-110 transition-transform">
                                                                            <Upload className="h-6 w-6 text-blue-500" />
                                                                        </div>
                                                                        <p className="text-sm font-bold text-slate-900">Add new documents</p>
                                                                        <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-wider">PDF, DOCX, ZIP • MAX 10MB</p>
                                                                    </div>
                                                                </div>

                                                                <AnimatePresence>
                                                                    {submitFiles.length > 0 && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 10 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            className="space-y-3 mt-6 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar"
                                                                        >
                                                                            {submitFiles.map((file, idx) => (
                                                                                <motion.div
                                                                                    key={idx}
                                                                                    initial={{ opacity: 0, x: -10 }}
                                                                                    animate={{ opacity: 1, x: 0 }}
                                                                                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-colors"
                                                                                >
                                                                                    <div className="flex items-center gap-4">
                                                                                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                                                                            <File className="h-5 w-5 text-blue-600" />
                                                                                        </div>
                                                                                        <div className="min-w-0">
                                                                                            <p className="text-[11px] font-bold text-slate-900 truncate max-w-[180px]">{file.name}</p>
                                                                                            <p className="text-[9px] font-medium text-slate-400 capitalize">{(file.size / 1024).toFixed(1)} KB</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => setSubmitFiles(prev => prev.filter((_, i) => i !== idx))}
                                                                                        className="h-8 w-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                                    >
                                                                                        <X className="h-4 w-4" />
                                                                                    </button>
                                                                                </motion.div>
                                                                            ))}
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </div>

                                                        <div className="pt-8 border-t border-slate-100 flex items-center justify-end gap-5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSubmitTarget(null)}
                                                                className="px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all font-display"
                                                            >
                                                                Discard Changes
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                disabled={submitLoading || (submitFiles.length === 0 && !submitContent)}
                                                                className="px-10 py-4 rounded-2xl bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-blue-600/10 hover:bg-blue-700 hover:shadow-blue-600/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                                                            >
                                                                {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                                                {submitLoading ? 'Updating...' : 'Save Submission'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </motion.div>
                                            </div>
                                        )}
                                    </div >
                                )}

                                {
                                    activeTab === 'results' && isAssigned && (
                                        <div className="space-y-12">
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <div>
                                                    <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900 font-display">University Results</h3>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Assignment Transcripts</p>
                                                </div>
                                                <div className="flex items-center gap-2 rounded-2xl bg-blue-50 border border-blue-100 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-blue-600 font-sans">
                                                    Academic Record
                                                </div>
                                            </div>

                                            <div className="rounded-[2rem] border border-slate-100 bg-white overflow-hidden shadow-sm">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                                <th className="px-10 py-6">Assignment</th>
                                                                <th className="px-10 py-6">Company Grade</th>
                                                                <th className="px-10 py-6">Faculty Grade</th>
                                                                <th className="px-10 py-6 text-center">Variance</th>
                                                                <th className="px-10 py-6 text-right">Final Aggregate</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-50">
                                                            {submissions.filter(s => s.companyGrade || s.facultyGrade).length === 0 ? (
                                                                <tr>
                                                                    <td colSpan={5} className="px-10 py-16 text-center text-[11px] font-bold uppercase tracking-wider text-slate-300">No graded results recorded yet</td>
                                                                </tr>
                                                            ) : (
                                                                submissions.filter(s => s.companyGrade || s.facultyGrade).map((sub: any) => (
                                                                    <tr key={sub._id} className="hover:bg-slate-50 transition-colors">
                                                                        <td className="px-10 py-8">
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[10px] font-bold uppercase tracking-wide text-blue-600 mb-1">
                                                                                    Assignment {submissions.filter(s => s.companyGrade || s.facultyGrade).length - (submissions.filter(s => s.companyGrade || s.facultyGrade).indexOf(sub))}
                                                                                </span>
                                                                                <p className="text-sm font-bold text-slate-900">{sub.task?.title || 'Archive Record'}</p>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-10 py-8">
                                                                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold">
                                                                                {sub.companyGrade?.marks ?? 'N/A'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-10 py-8">
                                                                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold">
                                                                                {sub.facultyGrade?.marks ?? 'N/A'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-10 py-8 text-center">
                                                                            {sub.companyGrade && sub.facultyGrade ? (
                                                                                <span className={`text-xs font-bold ${Math.abs(sub.companyGrade.marks - sub.facultyGrade.marks) > 10 ? 'text-red-500' : 'text-slate-400'}`}>
                                                                                    {Math.abs(sub.companyGrade.marks - sub.facultyGrade.marks)} pts
                                                                                </span>
                                                                            ) : <span className="text-slate-300">—</span>}
                                                                        </td>
                                                                        <td className="px-10 py-8 text-right">
                                                                            <span className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold font-sans shadow-sm shadow-blue-500/20">
                                                                                {sub.companyGrade && sub.facultyGrade
                                                                                    ? ((sub.companyGrade.marks + sub.facultyGrade.marks) / 2).toFixed(1)
                                                                                    : sub.companyGrade?.marks || sub.facultyGrade?.marks || '—'}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

                                {activeTab === 'weekly_updates' && isAssigned && isFreelancer && (
                                    <div className="space-y-8">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900 font-display">Weekly Updates</h3>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Freelancer Progress Log</p>
                                            </div>
                                            <button
                                                onClick={() => setShowWeeklyModal(true)}
                                                className="flex items-center gap-3 rounded-2xl px-6 h-12 text-[11px] font-bold uppercase tracking-wider text-white bg-blue-600 shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all"
                                            >
                                                <Plus className="h-4 w-4" /> Submit Update
                                            </button>
                                        </div>

                                        {weeklyUpdates.length === 0 ? (
                                            <div className="rounded-3xl border border-slate-100 bg-white py-32 text-center shadow-sm">
                                                <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No updates submitted yet</p>
                                                <p className="text-xs text-slate-300 mt-2">Submit your first weekly progress update above</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-6">
                                                {weeklyUpdates.map((update: any) => (
                                                    <div key={update._id} className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                                                        <div className={`h-1 w-full ${update.status === 'reviewed' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                                        <div className="p-8">
                                                            <div className="flex items-start justify-between gap-4 mb-6">
                                                                <div>
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">Week {update.weekNumber}</span>
                                                                    <p className="text-sm font-bold text-slate-900 mt-3">{update.workSummary}</p>
                                                                </div>
                                                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${update.status === 'reviewed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                    {update.status === 'reviewed' ? '✓ Reviewed' : 'Pending Review'}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                                {update.hoursWorked > 0 && (
                                                                    <div className="p-4 rounded-2xl bg-slate-50">
                                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Hours</p>
                                                                        <p className="text-sm font-bold text-slate-900">{update.hoursWorked}h</p>
                                                                    </div>
                                                                )}
                                                                {update.technologiesUsed && (
                                                                    <div className="p-4 rounded-2xl bg-slate-50 col-span-2">
                                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Technologies</p>
                                                                        <p className="text-sm font-bold text-slate-900">{update.technologiesUsed}</p>
                                                                    </div>
                                                                )}
                                                                <div className="p-4 rounded-2xl bg-slate-50">
                                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Submitted</p>
                                                                    <p className="text-sm font-bold text-slate-900">{new Date(update.createdAt).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            {update.facultyRemarks && (
                                                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Faculty Remarks</p>
                                                                    <p className="text-sm text-emerald-800">{update.facultyRemarks}</p>
                                                                </div>
                                                            )}
                                                            {update.platformLinks && update.platformLinks.length > 0 && (
                                                                <div className="mt-4">
                                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">Platform Links</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {update.platformLinks.map((link: any, i: number) => (
                                                                            <a key={i} href={link.url} target="_blank" rel="noreferrer"
                                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold hover:bg-blue-100 transition-colors">
                                                                                <Link className="h-3 w-3" /> {link.platform}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}




                                {
                                    activeTab === 'profile' && (
                                        <div className="max-w-5xl mx-auto py-10">
                                            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                                                {/* Profile Header - Style matched with Upload Task */}
                                                <div className="px-12 py-12 border-b border-slate-100 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 bg-gradient-to-r from-slate-50/50 to-white">
                                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                                        <div className="relative group">
                                                            <div className="h-32 w-32 rounded-[2rem] bg-white p-1.5 shadow-xl overflow-hidden ring-4 ring-slate-50">
                                                                <div className="h-full w-full rounded-[1.5rem] bg-slate-100 flex items-center justify-center overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                                                                    {profile?.profilePicture ? (
                                                                        <img
                                                                            src={profile.profilePicture.startsWith('http') ? profile.profilePicture : `${API.BASE}${profile.profilePicture}`}
                                                                            alt=""
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-4xl font-black text-blue-600">{profile?.name?.[0]}</span>
                                                                    )}
                                                                    {profileImageLoading && (
                                                                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                                                                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <label className="absolute -bottom-2 -right-2 h-10 w-10 bg-blue-600 text-white rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 hover:scale-110 transition-all border-4 border-white z-20">
                                                                <Camera className="h-4 w-4" />
                                                                <input type="file" className="hidden" accept="image/*" onChange={handleProfilePictureChange} disabled={profileImageLoading} />
                                                            </label>
                                                        </div>

                                                        <div className="text-center md:text-left">
                                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display mb-3 capitalize">{profile?.name}</h2>
                                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest ring-1 ring-blue-100">
                                                                    <Hash className="w-3 h-3" />
                                                                    {profile?.rollNumber}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest ring-1 ring-emerald-100">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                    Active Academic Status
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-12">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        <ProfileCard
                                                            icon={GraduationCap}
                                                            label="Degree Program"
                                                            value={profile?.degree}
                                                            color="blue"
                                                        />
                                                        <ProfileCard
                                                            icon={Calendar}
                                                            label="Academic Session"
                                                            value={profile?.session}
                                                            color="indigo"
                                                        />
                                                        <ProfileCard
                                                            icon={Mail}
                                                            label="Institutional Email"
                                                            value={profile?.email}
                                                            color="slate"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </motion.div >
                        )}
                    </AnimatePresence >
                </div >
            </main >

            {/* Weekly Update Submit Modal */}

            {showWeeklyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl p-4 md:p-8">
                    <motion.div initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-2xl rounded-[2.5rem] border border-slate-100 bg-white shadow-[0_40px_100px_rgba(0,0,0,0.12)] max-h-[90vh] overflow-y-auto">
                        <div className="p-8 md:p-12 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Weekly Progress Update</h2>
                                <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mt-1">Freelancer Update Log</p>
                            </div>
                            <button onClick={() => setShowWeeklyModal(false)} className="h-10 w-10 flex items-center justify-center rounded-2xl text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setWeeklySubmitLoading(true);
                            try {
                                const config = { headers: { Authorization: `Bearer ${token}` } };
                                const { data } = await axios.post(`${API_BASE}/weekly-update`, {
                                    ...weeklyForm,
                                    technologiesUsed: weeklyForm.technologiesUsed.split(',').map((t: string) => t.trim()).filter(Boolean),
                                    platformLinks: weeklyPlatformLinks.filter(l => l.platform && l.url)
                                }, config);
                                if (data.success) {
                                    setWeeklyUpdates(prev => [data.update, ...prev]);
                                    setShowWeeklyModal(false);
                                    setWeeklyForm({ weekNumber: weeklyUpdates.length + 2, workSummary: '', hoursWorked: 0, technologiesUsed: '', challenges: '' });
                                    setWeeklyPlatformLinks([]);
                                }
                            } catch (err: any) {
                                alert(err?.response?.data?.message || 'Failed to submit update.');
                            } finally {
                                setWeeklySubmitLoading(false);
                            }
                        }} className="p-8 md:p-12 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Week Number</label>
                                    <input type="number" min={1} value={weeklyForm.weekNumber}
                                        onChange={e => setWeeklyForm(f => ({ ...f, weekNumber: +e.target.value }))}
                                        className="w-full h-14 rounded-2xl bg-slate-50 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 transition-all" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Hours Worked</label>
                                    <input type="number" min={0} max={168} value={weeklyForm.hoursWorked}
                                        onChange={e => setWeeklyForm(f => ({ ...f, hoursWorked: +e.target.value }))}
                                        className="w-full h-14 rounded-2xl bg-slate-50 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Work Summary *</label>
                                <textarea rows={5} value={weeklyForm.workSummary} onChange={e => setWeeklyForm(f => ({ ...f, workSummary: e.target.value }))}
                                    className="w-full rounded-2xl bg-slate-50 p-5 text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-blue-50 transition-all resize-none" required
                                    placeholder="Describe the work done this week, deliverables completed, meetings attended..." />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Technologies / Tools Used</label>
                                <input type="text" value={weeklyForm.technologiesUsed} onChange={e => setWeeklyForm(f => ({ ...f, technologiesUsed: e.target.value }))}
                                    className="w-full h-14 rounded-2xl bg-slate-50 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                                    placeholder="React, Node.js, Python... (comma-separated)" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Challenges / Blockers</label>
                                <textarea rows={3} value={weeklyForm.challenges} onChange={e => setWeeklyForm(f => ({ ...f, challenges: e.target.value }))}
                                    className="w-full rounded-2xl bg-slate-50 p-5 text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-blue-50 transition-all resize-none"
                                    placeholder="Any blockers or challenges you faced this week..." />
                            </div>

                            {/* Platform links */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Platform / Delivery Links</label>
                                    <button type="button" onClick={() => setWeeklyPlatformLinks(l => [...l, { platform: '', url: '', description: '' }])}
                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                        <Plus className="h-3 w-3" /> Add Link
                                    </button>
                                </div>
                                {weeklyPlatformLinks.map((link, i) => (
                                    <div key={i} className="flex items-center gap-3 mb-3">
                                        <input type="text" placeholder="Platform (e.g. Fiverr)" value={link.platform}
                                            onChange={e => setWeeklyPlatformLinks(l => l.map((ll, idx) => idx === i ? { ...ll, platform: e.target.value } : ll))}
                                            className="w-32 h-12 rounded-xl bg-slate-50 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" />
                                        <input type="url" placeholder="https://..." value={link.url}
                                            onChange={e => setWeeklyPlatformLinks(l => l.map((ll, idx) => idx === i ? { ...ll, url: e.target.value } : ll))}
                                            className="flex-1 h-12 rounded-xl bg-slate-50 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" />
                                        <button type="button" onClick={() => setWeeklyPlatformLinks(l => l.filter((_, idx) => idx !== i))}
                                            className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-red-500 rounded-xl transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowWeeklyModal(false)}
                                    className="px-6 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={weeklySubmitLoading}
                                    className="px-8 py-3 rounded-2xl bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50">
                                    {weeklySubmitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    Submit Update
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Multi-step Apply Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-xl p-4 md:p-8">
                    <motion.div initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-2xl rounded-[2.5rem] border border-slate-100 bg-white shadow-[0_40px_100px_rgba(0,0,0,0.15)] max-h-[90vh] overflow-y-auto">

                        {/* Modal Header */}
                        <div className="px-8 md:px-12 py-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Step {applyStep + 1} of {internshipCategory === 'university_assigned' ? 2 : 3}</p>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {applyStep === 0 ? 'Select Internship Type' :
                                        applyStep === 1 ? 'Internship Details' :
                                            internshipCategory === 'self_found' ? 'Supervisor Information' : 'Freelancer Accounts'}
                                </h2>
                            </div>
                            <button onClick={() => { setShowApplyModal(false); setApplyStep(0); }}
                                className="h-10 w-10 flex items-center justify-center rounded-2xl text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="px-8 md:px-12 py-8">
                            {/* Step 0: Category selection */}
                            {applyStep === 0 && (
                                <div className="space-y-4">
                                    <p className="text-sm font-medium text-slate-500 mb-6">Choose the type of internship you are registering for:</p>
                                    {[
                                        { key: 'university_assigned', title: 'University Assigned', desc: 'Placed by COMSATS at a partner company. Company and supervisor set by admin.', icon: GraduationCap, color: 'blue' },
                                        { key: 'self_found', title: 'Self-Found Internship', desc: 'You independently found an internship. Provide company & supervisor details.', icon: Building2, color: 'indigo' },
                                        { key: 'freelancer', title: 'Freelancer / Remote', desc: 'Working independently on freelance platforms (Fiverr, Upwork, etc.).', icon: Globe, color: 'emerald' },
                                    ].map(opt => (
                                        <button key={opt.key} type="button"
                                            onClick={() => setInternshipCategory(opt.key as any)}
                                            className={`w-full flex items-start gap-5 p-6 rounded-2xl border-2 text-left transition-all ${internshipCategory === opt.key
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-100 hover:border-slate-200 bg-white'
                                                }`}>
                                            <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center ${opt.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                                opt.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                                                }`}>
                                                <opt.icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{opt.title}</p>
                                                <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
                                            </div>
                                            {internshipCategory === opt.key && (
                                                <CheckCircle2 className="h-5 w-5 text-blue-600 ml-auto shrink-0 mt-1" />
                                            )}
                                        </button>
                                    ))}
                                    <div className="pt-4">
                                        <button type="button" onClick={() => setApplyStep(1)}
                                            className="w-full h-14 rounded-2xl bg-blue-600 text-white text-[12px] font-bold uppercase tracking-wider shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                                            Continue <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 1: Details */}
                            {applyStep === 1 && (
                                <form onSubmit={internshipCategory === 'university_assigned' ? handleApply : (e) => { e.preventDefault(); setApplyStep(2); }} className="space-y-5">
                                    {internshipCategory !== 'freelancer' && (
                                        <>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Company / Organisation Name *</label>
                                                <input type="text" required value={newApp.companyName} onChange={e => setNewApp(a => ({ ...a, companyName: e.target.value }))}
                                                    className="w-full h-14 rounded-2xl bg-slate-50 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50" placeholder="e.g. Systems Limited" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Work Mode</label>
                                                    <select value={newApp.workMode} onChange={e => setNewApp(a => ({ ...a, workMode: e.target.value as any }))}
                                                        className="w-full h-14 rounded-2xl bg-slate-50 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50">
                                                        <option value="onsite">Onsite</option>
                                                        <option value="remote">Remote</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Duration</label>
                                                    <select value={newApp.duration} onChange={e => setNewApp(a => ({ ...a, duration: e.target.value }))}
                                                        className="w-full h-14 rounded-2xl bg-slate-50 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50">
                                                        {['6 weeks', '8 weeks', '10 weeks', '12 weeks', '6 months'].map(d => <option key={d} value={d}>{d}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Position / Role *</label>
                                        <input type="text" required value={newApp.position} onChange={e => setNewApp(a => ({ ...a, position: e.target.value }))}
                                            className="w-full h-14 rounded-2xl bg-slate-50 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50" placeholder="e.g. Software Engineer Intern" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Internship Field</label>
                                        <input type="text" value={newApp.internshipField} onChange={e => setNewApp(a => ({ ...a, internshipField: e.target.value }))}
                                            className="w-full h-14 rounded-2xl bg-slate-50 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50" placeholder="e.g. Web Development, Data Science" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Description</label>
                                        <textarea rows={4} value={newApp.description} onChange={e => setNewApp(a => ({ ...a, description: e.target.value }))}
                                            className="w-full rounded-2xl bg-slate-50 p-5 text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-blue-50 resize-none"
                                            placeholder="Brief description of your internship role and responsibilities..." />
                                    </div>

                                    {applyError && <p className="text-xs font-bold text-red-500 bg-red-50 px-4 py-3 rounded-xl">{applyError}</p>}

                                    <div className="flex items-center justify-between gap-4 pt-2">
                                        <button type="button" onClick={() => setApplyStep(0)}
                                            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
                                            <ChevronLeft className="h-4 w-4" /> Back
                                        </button>
                                        <button type="submit" disabled={applyLoading}
                                            className="flex-1 h-14 rounded-2xl bg-blue-600 text-white text-[12px] font-bold uppercase tracking-wider shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                            {applyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                                internshipCategory === 'university_assigned' ? 'Submit Application' : <><span>Next</span><ChevronRight className="h-4 w-4" /></>}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Step 2: Self-found supervisor info */}
                            {applyStep === 2 && internshipCategory === 'self_found' && (
                                <form onSubmit={handleApply} className="space-y-5">
                                    <p className="text-sm font-medium text-slate-500 mb-2">Provide details of your on-site supervisor at the company:</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Supervisor Name *</label>
                                            <input type="text" required value={selfFoundSupervisor.name} onChange={e => setSelfFoundSupervisor(s => ({ ...s, name: e.target.value }))}
                                                className="w-full h-14 rounded-2xl bg-slate-50 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50" placeholder="Mr. Ahmed Khan" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Designation</label>
                                            <input type="text" value={selfFoundSupervisor.designation} onChange={e => setSelfFoundSupervisor(s => ({ ...s, designation: e.target.value }))}
                                                className="w-full h-14 rounded-2xl bg-slate-50 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50" placeholder="Team Lead" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Supervisor Email *</label>
                                        <input type="email" required value={selfFoundSupervisor.email} onChange={e => setSelfFoundSupervisor(s => ({ ...s, email: e.target.value }))}
                                            className="w-full h-14 rounded-2xl bg-slate-50 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50" placeholder="supervisor@company.com" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Phone</label>
                                            <input type="tel" value={selfFoundSupervisor.phone} onChange={e => setSelfFoundSupervisor(s => ({ ...s, phone: e.target.value }))}
                                                className="w-full h-14 rounded-2xl bg-slate-50 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50" placeholder="+92 xxx xxxxxxx" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Company Address</label>
                                            <input type="text" value={selfFoundSupervisor.companyAddress} onChange={e => setSelfFoundSupervisor(s => ({ ...s, companyAddress: e.target.value }))}
                                                className="w-full h-14 rounded-2xl bg-slate-50 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50" placeholder="Plot 12, Tech Park" />
                                        </div>
                                    </div>

                                    {applyError && <p className="text-xs font-bold text-red-500 bg-red-50 px-4 py-3 rounded-xl">{applyError}</p>}

                                    <div className="flex items-center justify-between gap-4 pt-2">
                                        <button type="button" onClick={() => setApplyStep(1)}
                                            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
                                            <ChevronLeft className="h-4 w-4" /> Back
                                        </button>
                                        <button type="submit" disabled={applyLoading}
                                            className="flex-1 h-14 rounded-2xl bg-blue-600 text-white text-[12px] font-bold uppercase tracking-wider shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                            {applyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Application'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Step 2: Freelancer accounts */}
                            {applyStep === 2 && internshipCategory === 'freelancer' && (
                                <form onSubmit={handleApply} className="space-y-5">
                                    <p className="text-sm font-medium text-slate-500 mb-2">Add links to your freelancing profiles or active projects:</p>
                                    {freelancerAccounts.map((acc, i) => (
                                        <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Account {i + 1}</span>
                                                {freelancerAccounts.length > 1 && (
                                                    <button type="button" onClick={() => setFreelancerAccounts(a => a.filter((_, idx) => idx !== i))}
                                                        className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Platform *</label>
                                                    <input type="text" required value={acc.platform}
                                                        onChange={e => setFreelancerAccounts(a => a.map((aa, idx) => idx === i ? { ...aa, platform: e.target.value } : aa))}
                                                        className="w-full h-12 rounded-xl bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 border border-slate-100" placeholder="Fiverr, Upwork..." />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Username</label>
                                                    <input type="text" value={acc.username}
                                                        onChange={e => setFreelancerAccounts(a => a.map((aa, idx) => idx === i ? { ...aa, username: e.target.value } : aa))}
                                                        className="w-full h-12 rounded-xl bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 border border-slate-100" placeholder="@username" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Profile URL *</label>
                                                <input type="url" required value={acc.profileUrl}
                                                    onChange={e => setFreelancerAccounts(a => a.map((aa, idx) => idx === i ? { ...aa, profileUrl: e.target.value } : aa))}
                                                    className="w-full h-12 rounded-xl bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 border border-slate-100" placeholder="https://www.fiverr.com/..." />
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setFreelancerAccounts(a => [...a, { platform: '', profileUrl: '', username: '' }])}
                                        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">
                                        <Plus className="h-4 w-4" /> Add Another Platform
                                    </button>

                                    {applyError && <p className="text-xs font-bold text-red-500 bg-red-50 px-4 py-3 rounded-xl">{applyError}</p>}

                                    <div className="flex items-center justify-between gap-4 pt-2">
                                        <button type="button" onClick={() => setApplyStep(1)}
                                            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
                                            <ChevronLeft className="h-4 w-4" /> Back
                                        </button>
                                        <button type="submit" disabled={applyLoading}
                                            className="flex-1 h-14 rounded-2xl bg-blue-600 text-white text-[12px] font-bold uppercase tracking-wider shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                            {applyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Application'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

        </div >
    );
};

const ProfileCard = ({ icon: Icon, label, value, color, isHighlight }: { icon: any; label: string; value: string; color: string; isHighlight?: boolean }) => {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600 ring-blue-100',
        indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
        emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
        slate: 'bg-slate-50 text-slate-600 ring-slate-100',
    };

    return (
        <div className={`p-8 rounded-[2rem] border transition-all duration-300 group ${isHighlight ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/40'}`}>
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${isHighlight ? 'bg-white/10 text-white ring-1 ring-white/20' : colors[color]}`}>
                <Icon className="h-6 w-6" />
            </div>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isHighlight ? 'text-blue-100' : 'text-slate-400'}`}>{label}</p>
            <p className={`text-lg font-bold tracking-tight truncate ${isHighlight ? 'text-white' : 'text-slate-900'}`}>{value || 'N/A'}</p>
        </div>
    );
};


export default StudentDashboard;
