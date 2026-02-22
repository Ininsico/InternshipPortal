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
    Zap,
    ArrowUpRight,
    Bell,
    ClipboardList,
    CheckCircle2
} from 'lucide-react';

type TabKey = 'overview' | 'applications' | 'tasks' | 'documents' | 'profile';

const API_BASE = 'http://localhost:5000/api/student';

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
    const [submitLoading, setSubmitLoading] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [newApp, setNewApp] = useState({ companyName: '', position: '', description: '' });

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [profileRes, appsRes, tasksRes, subsRes, reportRes] = await Promise.all([
                    axios.get(`${API_BASE}/profile`, config),
                    axios.get(`${API_BASE}/applications`, config),
                    axios.get(`${API_BASE}/tasks`, config),
                    axios.get(`${API_BASE}/submissions`, config),
                    axios.get(`${API_BASE}/report`, config),
                ]);
                if (profileRes.data.success) setProfile(profileRes.data.student);
                if (appsRes.data.success) setApplications(appsRes.data.applications);
                if (tasksRes.data.success) setTasks(tasksRes.data.tasks);
                if (subsRes.data.success) setSubmissions(subsRes.data.submissions);
                if (reportRes.data.success) setMyReport(reportRes.data.report);
            } catch (err) {
                console.error(err);
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
            console.error(err);
        }
    };

    const handleSubmitTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!submitTarget) return;
        setSubmitLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post(`${API_BASE}/submit-task`, { taskId: submitTarget._id, content: submitContent }, config);
            if (data.success) {
                setSubmissions(prev => [...prev, data.submission]);
                setSubmitTarget(null);
                setSubmitContent('');
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
        { key: 'tasks', label: 'My Tasks', icon: ClipboardList },
        { key: 'documents', label: 'Documents', icon: FileText },
        { key: 'profile', label: 'My Profile', icon: User },
    ];

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
                        {loading && activeTab === 'overview' ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[60vh] items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </motion.div>
                        ) : (
                            <motion.div key={activeTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                                {activeTab === 'overview' && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <MetricCard label="Total Applications" value={applications.length} sub="Overall" />
                                            <MetricCard label="Approved Status" value={applications.filter(a => a.status === 'approved').length} sub="Verified" />
                                            <MetricCard label="Pending Review" value={applications.filter(a => a.status === 'pending').length} sub="In Progress" />
                                            <MetricCard label="Assigned Faculty" value={profile?.supervisorId?.name?.split(' ')[0] || 'Pending'} sub="Supervisor" />
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                                                <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
                                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Recent Applications</h3>
                                                    <button onClick={() => setShowApplyModal(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
                                                        <Plus className="h-3.5 w-3.5" /> New Application
                                                    </button>
                                                </div>
                                                <div className="divide-y divide-slate-50">
                                                    {applications.slice(0, 4).map((app: any) => (
                                                        <div key={app._id} className="flex items-center justify-between px-8 py-5 hover:bg-slate-50 transition-colors">
                                                            <div className="flex items-center gap-5">
                                                                <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100"><Zap className="h-4 w-4 text-blue-600" /></div>
                                                                <div>
                                                                    <p className="text-sm font-black text-slate-900 leading-none">{app.position}</p>
                                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">{app.companyName}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-6">
                                                                <StatusBadge status={app.status || 'pending'} />
                                                                <button className="text-slate-200 hover:text-slate-400"><ArrowUpRight className="h-4 w-4" /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {applications.length === 0 && <div className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">No applications found</div>}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="rounded-2xl border border-blue-600 bg-blue-600 p-8 shadow-2xl shadow-blue-600/20 text-white">
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Faculty Supervisor</h4>
                                                    <p className="mt-4 text-xl font-black">{profile?.supervisorId?.name || 'Awaiting Assignment'}</p>
                                                    <p className="mt-1 text-[10px] font-black uppercase tracking-widest opacity-60">CUI Staff Member</p>
                                                    <div className="mt-8 pt-6 border-t border-white/10">
                                                        <button className="flex w-full items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                                            Contact Supervisor <ArrowUpRight className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:bg-slate-50 transition-all font-black uppercase text-[10px] tracking-widest text-slate-600">
                                                    <FileText className="h-4 w-4" /> Download Records
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'applications' && (
                                    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                                        <div className="border-b border-slate-100 px-8 py-6 flex justify-between items-center bg-slate-50/50">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">All Applications ({applications.length})</h3>
                                            <button onClick={() => setShowApplyModal(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-700 shadow-lg shadow-blue-600/10">
                                                <Plus className="h-3.5 w-3.5" /> New Application
                                            </button>
                                        </div>
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 bg-slate-50/30">
                                                    <th className="px-8 py-4">Company Name</th>
                                                    <th className="px-8 py-4">Status</th>
                                                    <th className="px-8 py-4">Applied Date</th>
                                                    <th className="px-8 py-4 text-right">Progress</th>
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
                                    </div>
                                )}

                                {activeTab === 'tasks' && (
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
                                                    const sub = submissions.find((s: any) => s.task?._id === task._id || s.task === task._id);
                                                    return (
                                                        <div key={task._id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:border-blue-100 transition-all">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{task.company}</span>
                                                                        {task.deadline && <span className="text-[10px] font-black text-amber-600">Due {new Date(task.deadline).toLocaleDateString()}</span>}
                                                                    </div>
                                                                    <h4 className="text-base font-black text-slate-900">{task.title}</h4>
                                                                    <p className="text-sm text-slate-500 mt-1 font-medium">{task.description}</p>
                                                                    {task.maxMarks && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Max: {task.maxMarks} marks</p>}
                                                                </div>
                                                                <div className="shrink-0 text-right">
                                                                    {sub ? (
                                                                        <div>
                                                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-600">
                                                                                <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
                                                                            </span>
                                                                            {sub.companyGrade?.marks !== null && sub.companyGrade?.marks !== undefined && (
                                                                                <p className="mt-2 text-base font-black text-indigo-600">{sub.companyGrade.marks}/{task.maxMarks}</p>
                                                                            )}
                                                                            {sub.companyGrade?.feedback && <p className="mt-1 text-xs text-slate-400 font-bold">{sub.companyGrade.feedback}</p>}
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => { setSubmitTarget(task); setSubmitContent(''); }}
                                                                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all active:scale-95"
                                                                        >
                                                                            <Plus className="h-3.5 w-3.5" /> Submit
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

                                {activeTab === 'profile' && (
                                    <div className="max-w-xl mx-auto space-y-8 py-12">
                                        <div className="text-center space-y-4">
                                            <div className="inline-flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-blue-600 text-white text-3xl font-black shadow-2xl shadow-blue-500/30 mb-4 ring-8 ring-blue-50">
                                                {user?.name[0]}
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-900 leading-none capitalize">{profile?.name}</h2>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-8">{profile?.rollNumber}</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <ProfileField label="University Email" value={profile?.email} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <ProfileField label="Current Session" value={profile?.session} />
                                                <ProfileField label="Degree Program" value={profile?.degree} />
                                            </div>
                                            <ProfileField label="Faculty Supervisor" value={profile?.supervisorId?.name || 'Not Yet Assigned'} isLink />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

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

            {/* TASK SUBMISSION MODAL */}
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
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Submission Content *</label>
                                <textarea
                                    required
                                    rows={6}
                                    value={submitContent}
                                    onChange={e => setSubmitContent(e.target.value)}
                                    className="w-full rounded-2xl bg-slate-50 border-none p-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300 resize-none"
                                    placeholder="Describe your work, attach details or share a link..."
                                />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setSubmitTarget(null)} className="flex-1 h-14 rounded-2xl border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" disabled={submitLoading} className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                                    {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
                                    {submitLoading ? 'Submitting...' : 'Submit Task'}
                                </button>
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
    sub: string;
}

const MetricCard = ({ label, value, sub }: MetricCardProps) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 group hover:border-blue-200 shadow-sm transition-all">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <p className="mt-3 text-3xl font-black tracking-tighter text-slate-900 leading-none">{value}</p>
        <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-blue-600 opacity-60 group-hover:opacity-100">{sub}</p>
    </div>
);

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

const StatusBadge = ({ status }: { status: string }) => {
    const isSuccess = status === 'approved' || status === 'completed' || status === 'verified';
    return (
        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${isSuccess ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-100'
            }`}>
            {status}
        </span>
    );
};

export default StudentDashboard;
