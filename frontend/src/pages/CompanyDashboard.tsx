import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, ClipboardList, BarChart2,
    LogOut, Plus, Loader2, CheckCircle2, XCircle, Clock,
    ChevronDown, ChevronUp, Send, Star, AlertCircle, Briefcase, File, ArrowUpRight
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/company';

type Tab = 'overview' | 'students' | 'tasks' | 'submissions';

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; cls: string }> = {
        submitted: { label: 'Submitted', cls: 'bg-blue-50 text-blue-600' },
        graded_by_company: { label: 'Graded (You)', cls: 'bg-purple-50 text-purple-600' },
        graded_by_faculty: { label: 'Graded (Faculty)', cls: 'bg-teal-50 text-teal-600' },
        fully_graded: { label: 'Fully Graded', cls: 'bg-emerald-50 text-emerald-600' },
        active: { label: 'Active', cls: 'bg-green-50 text-green-600' },
        closed: { label: 'Closed', cls: 'bg-slate-100 text-slate-400' },
    };
    const cfg = map[status] || { label: status, cls: 'bg-slate-100 text-slate-500' };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
};

const CompanyDashboard = () => {
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [students, setStudents] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // New task form
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskForm, setTaskForm] = useState({ title: '', description: '', deadline: '', maxMarks: 100, assignedTo: '' });
    const [taskLoading, setTaskLoading] = useState(false);
    const [taskError, setTaskError] = useState('');

    // Grade modal
    const [gradeTarget, setGradeTarget] = useState<any | null>(null);
    const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '' });
    const [gradeLoading, setGradeLoading] = useState(false);
    const [gradeError, setGradeError] = useState('');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [stuRes, taskRes, subRes] = await Promise.all([
                    axios.get(`${API_BASE}/students`, config),
                    axios.get(`${API_BASE}/tasks`, config),
                    axios.get(`${API_BASE}/submissions`, config),
                ]);
                if (stuRes.data.success) setStudents(stuRes.data.students);
                if (taskRes.data.success) setTasks(taskRes.data.tasks);
                if (subRes.data.success) setSubmissions(subRes.data.submissions);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchAll();
    }, [token]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setTaskLoading(true);
        setTaskError('');
        try {
            const { data } = await axios.post(`${API_BASE}/tasks`, {
                ...taskForm,
                maxMarks: Number(taskForm.maxMarks),
                assignedTo: taskForm.assignedTo || undefined,
            }, config);
            if (data.success) {
                setTasks(prev => [data.task, ...prev]);
                setShowTaskModal(false);
                setTaskForm({ title: '', description: '', deadline: '', maxMarks: 100, assignedTo: '' });
            }
        } catch (err: any) {
            setTaskError(err?.response?.data?.message || 'Failed to create task.');
        } finally {
            setTaskLoading(false);
        }
    };

    const handleGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gradeTarget) return;
        setGradeLoading(true);
        setGradeError('');
        try {
            const { data } = await axios.put(`${API_BASE}/submissions/${gradeTarget._id}/grade`, {
                marks: Number(gradeForm.marks),
                feedback: gradeForm.feedback,
            }, config);
            if (data.success) {
                setSubmissions(prev => prev.map(s => s._id === gradeTarget._id ? data.submission : s));
                setGradeTarget(null);
                setGradeForm({ marks: '', feedback: '' });
            }
        } catch (err: any) {
            setGradeError(err?.response?.data?.message || 'Failed to grade.');
        } finally {
            setGradeLoading(false);
        }
    };

    const ungradedCount = submissions.filter(s => !s.companyGrade?.marks).length;

    const navItems: { id: Tab; label: string; icon: any }[] = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'students', label: 'My Students', icon: Users },
        { id: 'tasks', label: 'Tasks', icon: ClipboardList },
        { id: 'submissions', label: 'Submissions', icon: BarChart2 },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="flex w-64 flex-col bg-white border-r border-slate-100 shadow-sm">
                <div className="px-6 py-8 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                            <Briefcase className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-900">Company Portal</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">{user?.name}</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-black uppercase tracking-wider transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {item.label}
                            {item.id === 'submissions' && ungradedCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">{ungradedCount}</span>
                            )}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <button onClick={logout} className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                        <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto p-8">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">

                        {/* Header */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Company Portal</p>
                            <h1 className="text-3xl font-black text-slate-900">
                                {activeTab === 'overview' && 'Dashboard'}
                                {activeTab === 'students' && 'My Interns'}
                                {activeTab === 'tasks' && 'Task Management'}
                                {activeTab === 'submissions' && 'Submissions & Grading'}
                            </h1>
                        </div>

                        {/* OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-6">
                                    {[
                                        { label: 'Active Interns', value: students.length, color: 'indigo' },
                                        { label: 'Total Tasks', value: tasks.length, color: 'blue' },
                                        { label: 'Ungraded Submissions', value: ungradedCount, color: 'amber' },
                                    ].map(stat => (
                                        <div key={stat.label} className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                                            <p className={`mt-2 text-4xl font-black text-${stat.color}-600`}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Recent Tasks</h3>
                                    {tasks.slice(0, 5).map(t => (
                                        <div key={t._id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{t.title}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Due {new Date(t.deadline).toLocaleDateString()}</p>
                                            </div>
                                            <StatusBadge status={t.status} />
                                        </div>
                                    ))}
                                    {tasks.length === 0 && <p className="text-sm text-slate-400 font-bold text-center py-6">No tasks yet. Create your first task!</p>}
                                </div>
                            </div>
                        )}

                        {/* STUDENTS */}
                        {activeTab === 'students' && (
                            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 px-8 py-6 bg-slate-50/50">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Interns at {user?.email}</h3>
                                </div>
                                {students.length === 0 ? (
                                    <div className="py-20 text-center text-slate-400 font-bold">No interns assigned to your company yet.</div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <th className="px-8 py-4">Student</th>
                                                <th className="px-8 py-4">Degree</th>
                                                <th className="px-8 py-4">Position</th>
                                                <th className="px-8 py-4">Faculty Supervisor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {students.map(s => (
                                                <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-8 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-xs font-black text-indigo-600">{s.name[0]}</div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900">{s.name}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{s.rollNumber}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4 text-xs font-bold text-slate-500">{s.degree}</td>
                                                    <td className="px-8 py-4 text-xs font-bold text-slate-500">{s.assignedPosition || '—'}</td>
                                                    <td className="px-8 py-4 text-xs font-bold text-slate-500">{s.supervisorId?.name || <span className="text-amber-500">Not Assigned</span>}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* TASKS */}
                        {activeTab === 'tasks' && (
                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95">
                                        <Plus className="h-4 w-4" /> Create Task
                                    </button>
                                </div>
                                {tasks.length === 0 ? (
                                    <div className="rounded-2xl bg-white border border-slate-100 py-20 text-center text-slate-400 font-bold shadow-sm">No tasks yet.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {tasks.map(t => (
                                            <div key={t._id} className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm hover:border-indigo-100 transition-all">
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <h4 className="text-base font-black text-slate-900">{t.title}</h4>
                                                    <StatusBadge status={t.status} />
                                                </div>
                                                <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2">{t.description}</p>
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-slate-400">Due {new Date(t.deadline).toLocaleDateString()}</span>
                                                    <span className="text-indigo-500">{t.maxMarks} marks</span>
                                                </div>
                                                {t.assignedTo && (
                                                    <p className="mt-2 text-[10px] font-bold text-slate-400">→ {t.assignedTo.name} ({t.assignedTo.rollNumber})</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SUBMISSIONS */}
                        {activeTab === 'submissions' && (
                            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 px-8 py-6 bg-slate-50/50">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Student Submissions ({submissions.length})</h3>
                                </div>
                                {submissions.length === 0 ? (
                                    <div className="py-20 text-center text-slate-400 font-bold">No submissions yet.</div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {submissions.map(sub => (
                                            <div key={sub._id} className="px-8 py-5 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{sub.student?.name} <span className="text-slate-400 font-bold">— {sub.task?.title}</span></p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{sub.student?.rollNumber} · Submitted {new Date(sub.submittedAt).toLocaleDateString()}</p>
                                                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{sub.content}</p>
                                                        {sub.attachments && sub.attachments.length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {sub.attachments.map((f: any, i: number) => (
                                                                    <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-tight text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
                                                                        <File className="h-3 w-3" /> {f.originalname}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                                        <StatusBadge status={sub.status} />
                                                        {sub.companyGrade?.marks != null ? (
                                                            <span className="text-sm font-black text-emerald-600">{sub.companyGrade.marks}/{sub.task?.maxMarks}</span>
                                                        ) : (
                                                            <button
                                                                onClick={() => { setGradeTarget(sub); setGradeForm({ marks: '', feedback: '' }); setGradeError(''); }}
                                                                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-700 transition-all"
                                                            >
                                                                <Star className="h-3.5 w-3.5" /> Grade
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {sub.companyGrade?.feedback && (
                                                    <p className="mt-2 text-xs font-bold text-slate-400 bg-slate-50 rounded-lg px-3 py-2">Your feedback: {sub.companyGrade.feedback}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </main>

            {/* CREATE TASK MODAL */}
            <AnimatePresence>
                {showTaskModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => setShowTaskModal(false)}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="w-full max-w-lg rounded-3xl bg-white border border-slate-100 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="border-b border-slate-100 px-8 py-6 bg-slate-50/50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">New Assignment</p>
                                <h2 className="text-xl font-black text-slate-900">Create Task</h2>
                            </div>
                            <form onSubmit={handleCreateTask} className="p-8 space-y-5">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Task Title</label>
                                    <input required value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100" placeholder="e.g. Weekly Progress Report" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Description</label>
                                    <textarea required value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={3} className="w-full rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100 resize-none" placeholder="What should the student submit?" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Deadline</label>
                                        <input required type="date" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Max Marks</label>
                                        <input type="number" min={1} max={1000} value={taskForm.maxMarks} onChange={e => setTaskForm({ ...taskForm, maxMarks: Number(e.target.value) })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Assign to specific intern (optional)</label>
                                    <select value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100">
                                        <option value="">— All interns at your company —</option>
                                        {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>)}
                                    </select>
                                </div>
                                {taskError && <p className="text-xs font-bold text-red-500 bg-red-50 rounded-lg px-4 py-3">{taskError}</p>}
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 h-12 rounded-2xl border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                    <button type="submit" disabled={taskLoading} className="flex-1 h-12 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                                        {taskLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        {taskLoading ? 'Creating...' : 'Create Task'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* GRADE MODAL */}
            <AnimatePresence>
                {gradeTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => setGradeTarget(null)}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="w-full max-w-md rounded-3xl bg-white border border-slate-100 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="border-b border-slate-100 px-8 py-6 bg-slate-50/50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">Grade Submission</p>
                                <h2 className="text-lg font-black text-slate-900">{gradeTarget.student?.name}</h2>
                                <p className="text-xs font-bold text-slate-400 mt-0.5">{gradeTarget.task?.title}</p>
                            </div>
                            <div className="px-8 py-5 bg-slate-50 border-b border-slate-100">
                                <p className="text-xs font-bold text-slate-600 mb-3">{gradeTarget.content}</p>
                                {gradeTarget.attachments && gradeTarget.attachments.length > 0 && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {gradeTarget.attachments.map((f: any, i: number) => (
                                            <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl bg-white border border-slate-100 px-4 py-2.5 text-[10px] font-black uppercase text-indigo-600 hover:shadow-md transition-all">
                                                <span className="flex items-center gap-2 truncate"><File className="h-3.5 w-3.5" /> {f.originalname}</span>
                                                <ArrowUpRight className="h-3.5 w-3.5 opacity-40" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleGrade} className="p-8 space-y-5">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Marks (out of {gradeTarget.task?.maxMarks})</label>
                                    <input required type="number" min={0} max={gradeTarget.task?.maxMarks} value={gradeForm.marks} onChange={e => setGradeForm({ ...gradeForm, marks: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Feedback (optional)</label>
                                    <textarea value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} rows={3} className="w-full rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100 resize-none" placeholder="Write constructive feedback..." />
                                </div>
                                {gradeError && <p className="text-xs font-bold text-red-500 bg-red-50 rounded-lg px-4 py-3">{gradeError}</p>}
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setGradeTarget(null)} className="flex-1 h-12 rounded-2xl border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                    <button type="submit" disabled={gradeLoading} className="flex-1 h-12 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                                        {gradeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                                        {gradeLoading ? 'Saving...' : 'Submit Grade'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompanyDashboard;
