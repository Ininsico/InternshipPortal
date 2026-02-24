import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    LogOut, Plus, Loader2,
    Send, File, Trash2, RefreshCw, Menu, Star, X, Upload
} from 'lucide-react';

import API from '../config/api';
import { useCompanyStore, type CompanyTab } from '../store/companyStore';

const API_BASE = API.COMPANY;



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
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
};

const CompanyDashboard = () => {
    const { user, token, logout } = useAuth();
    const {
        activeTab, setActiveTab,
        students, setStudents,
        tasks, setTasks,
        submissions, setSubmissions
    } = useCompanyStore();
    const [loading, setLoading] = useState(true);

    // Create Task — inline state (no modal)
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [taskForm, setTaskForm] = useState({ title: '', description: '', deadline: '', maxMarks: 100, assignedTo: '' });
    const [taskLoading, setTaskLoading] = useState(false);
    const [taskError, setTaskError] = useState('');

    // Grade submission — inline state (no modal)
    const [gradeTarget, setGradeTarget] = useState<any | null>(null);
    const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '' });
    const [gradeLoading, setGradeLoading] = useState(false);
    const [gradeError, setGradeError] = useState('');

    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchAll = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
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
            setRefreshing(false);
        }
    };

    useEffect(() => {
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
                setTasks((prev: any[]) => [data.task, ...prev]);
                setShowCreateTask(false);
                setTaskForm({ title: '', description: '', deadline: '', maxMarks: 100, assignedTo: '' });
                fetchAll(true);
            }
        } catch (err: any) {
            setTaskError(err?.response?.data?.message || 'Failed to create task.');
        } finally {
            setTaskLoading(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            const { data } = await axios.delete(`${API_BASE}/tasks/${taskId}`, config);
            if (data.success) {
                setTasks((prev: any[]) => prev.filter(t => t._id !== taskId));
                fetchAll(true);
            }
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Failed to delete task.');
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
                setSubmissions((prev: any[]) => prev.map(s => s._id === gradeTarget._id ? data.submission : s));
                setGradeTarget(null);
                fetchAll(true);
            }
        } catch (err: any) {
            setGradeError(err?.response?.data?.message || 'Failed to grade.');
        } finally {
            setGradeLoading(false);
        }
    };

    const ungradedCount = submissions.filter(s => !s.companyGrade?.marks).length;

    // Check if a task has any submissions
    const taskHasSubmissions = (taskId: string) => submissions.some(s => (s.task?._id || s.task) === taskId);

    const navItems: { id: CompanyTab; label: string }[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'students', label: 'My Students' },
        { id: 'tasks', label: 'Tasks' },
        { id: 'submissions', label: 'Submissions' },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
            {/* Mobile sidebar overlay */}
            {showMobileSidebar && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white border-r border-slate-100 shadow-sm transition-transform duration-300 lg:relative lg:translate-x-0 ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-6 py-8 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center shrink-0 bg-white rounded-xl shadow-sm border border-slate-100">
                            <img src="/comsatslogo.png" alt="CUI logo" className="h-full w-full object-contain p-1" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">CUI ATD Portal</p>
                            <p className="text-xs font-medium text-slate-500 truncate max-w-[120px]">{user?.name}</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
                        >
                            {item.label}
                            {item.id === 'submissions' && ungradedCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{ungradedCount}</span>
                            )}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <button onClick={logout} className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
                        <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur-xl px-4 md:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowMobileSidebar(true)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all lg:hidden"
                        >
                            <Menu className="h-4 w-4" />
                        </button>
                        <span className="text-xs font-bold text-indigo-600 lg:hidden">Partner Portal</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchAll(true)}
                            disabled={refreshing}
                            className="h-9 px-4 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {refreshing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                            {refreshing ? 'Syncing...' : 'Sync Data'}
                        </button>
                        <div className="flex h-9 w-9 items-center justify-center shrink-0 bg-white rounded-xl shadow-sm border border-slate-100">
                            <img src="/comsatslogo.png" alt="CUI logo" className="h-full w-full object-contain p-1" />
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6 md:p-8">

                        <div className="flex flex-wrap items-center gap-4">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                                {activeTab === 'overview' && 'Dashboard Overview'}
                                {activeTab === 'students' && 'Assigned Interns'}
                                {activeTab === 'tasks' && 'Task Management'}
                                {activeTab === 'submissions' && 'Submission Grading'}
                            </h1>
                        </div>

                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Active Interns', value: students.length, color: 'indigo' },
                                        { label: 'Total Tasks', value: tasks.length, color: 'blue' },
                                        { label: 'Ungraded Submissions', value: ungradedCount, color: 'amber' },
                                    ].map(stat => (
                                        <div key={stat.label} className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                            <p className={`mt-2 text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="rounded-2xl bg-white border border-slate-100 p-8 shadow-sm">
                                    <h3 className="text-base font-bold text-slate-900 mb-6">Recent Task Distribution</h3>
                                    {tasks.slice(0, 5).map(t => (
                                        <div key={t._id} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{t.title}</p>
                                                <p className="text-xs font-medium text-slate-400 mt-1">Deadline: {new Date(t.deadline).toLocaleDateString()}</p>
                                            </div>
                                            <StatusBadge status={t.status} />
                                        </div>
                                    ))}
                                    {tasks.length === 0 && <p className="text-sm text-slate-400 font-bold text-center py-6">No tasks yet. Create your first task!</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'students' && (
                            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 px-8 py-6 bg-slate-50/50">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Intern Allocation at {user?.email}</h3>
                                </div>
                                {students.length === 0 ? (
                                    <div className="py-20 text-center text-slate-400 font-bold">No interns assigned to your company yet.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left min-w-[500px]">
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
                                                                <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-xs font-black text-indigo-600 overflow-hidden">
                                                                    {s.profilePicture ? (
                                                                        <img src={s.profilePicture.startsWith('http') ? s.profilePicture : `${API.BASE}/${s.profilePicture.replace(/^\//, '')}`} alt="" className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        s.name[0]
                                                                    )}
                                                                </div>
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
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div className="space-y-6">
                                {/* Inline Create Task Form or Task List */}
                                {!showCreateTask ? (
                                    <>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => setShowCreateTask(true)}
                                                disabled={students.length === 0}
                                                title={students.length === 0 ? "You cannot create tasks until students are assigned to your company." : ""}
                                                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                                            >
                                                <Plus className="h-4 w-4" /> Create Task
                                            </button>
                                        </div>
                                        {tasks.length === 0 ? (
                                            <div className="rounded-2xl bg-white border border-slate-100 py-20 text-center text-slate-400 font-bold shadow-sm">No tasks yet.</div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {tasks.map(t => (
                                                    <div key={t._id} className="group rounded-2xl bg-white border border-slate-100 p-6 shadow-sm hover:border-indigo-100 transition-all">
                                                        <div className="flex items-start justify-between gap-4 mb-3">
                                                            <h4 className="text-base font-black text-slate-900">{t.title}</h4>
                                                            <div className="flex items-center gap-2">
                                                                <StatusBadge status={t.status} />
                                                                {!taskHasSubmissions(t._id) && (
                                                                    <button
                                                                        onClick={() => handleDeleteTask(t._id)}
                                                                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                                                                        title="Delete task"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2">{t.description}</p>
                                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                                            <span className="text-slate-400">Due {new Date(t.deadline).toLocaleDateString()}</span>
                                                            <span className="text-indigo-500">{t.maxMarks} marks</span>
                                                        </div>
                                                        {t.assignedTo && (
                                                            <div className="mt-3 flex items-center gap-2">
                                                                <div className="h-6 w-6 rounded-lg bg-indigo-50 flex items-center justify-center text-[8px] font-black text-indigo-600 overflow-hidden">
                                                                    {t.assignedTo.profilePicture ? (
                                                                        <img src={t.assignedTo.profilePicture.startsWith('http') ? t.assignedTo.profilePicture : `${API.BASE}/${t.assignedTo.profilePicture.replace(/^\//, '')}`} alt="" className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        t.assignedTo.name[0]
                                                                    )}
                                                                </div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight line-clamp-1">{t.assignedTo.name} ({t.assignedTo.rollNumber})</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Inline Create Task — same pattern as StudentDashboard Upload Task */
                                    <div className="max-w-4xl mx-auto">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40 overflow-hidden"
                                        >
                                            <div className="px-10 py-10 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                                                <div className="flex items-center gap-6">
                                                    <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 rotate-3">
                                                        <Upload className="h-7 w-7 text-white" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Task</h2>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mt-1">New Assignment</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => { setShowCreateTask(false); setTaskError(''); setTaskForm({ title: '', description: '', deadline: '', maxMarks: 100, assignedTo: '' }); }}
                                                    className="h-12 w-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-950 hover:border-slate-300 shadow-sm transition-all active:scale-95"
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                            </div>

                                            <form onSubmit={handleCreateTask} className="p-10 space-y-8">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                    <div className="space-y-6">
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Task Title</label>
                                                            <input required value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100/50 focus:bg-white transition-all" placeholder="e.g. Weekly Progress Report" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Description</label>
                                                            <textarea required value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={6} className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100/50 focus:bg-white transition-all resize-none" placeholder="What should the student submit?" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Deadline</label>
                                                            <input required type="date" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100/50 focus:bg-white transition-all" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Max Marks</label>
                                                            <input type="number" min={1} max={1000} value={taskForm.maxMarks} onChange={e => setTaskForm({ ...taskForm, maxMarks: Number(e.target.value) })} className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100/50 focus:bg-white transition-all" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Assign to specific intern (optional)</label>
                                                            <select value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })} className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100/50 focus:bg-white transition-all">
                                                                <option value="">— All interns at your company —</option>
                                                                {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {taskError && <p className="text-xs font-bold text-red-500 bg-red-50 rounded-2xl px-5 py-4">{taskError}</p>}

                                                <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-5">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setShowCreateTask(false); setTaskError(''); setTaskForm({ title: '', description: '', deadline: '', maxMarks: 100, assignedTo: '' }); }}
                                                        className="px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={taskLoading}
                                                        className="px-10 py-4 rounded-2xl bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                                    >
                                                        {taskLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                                        {taskLoading ? 'Creating...' : 'Create Task'}
                                                    </button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'submissions' && (
                            <div className="space-y-6">
                                {!gradeTarget ? (
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
                                                            <div className="flex items-start gap-4">
                                                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 mt-1">
                                                                    {sub.student?.profilePicture ? (
                                                                        <img src={sub.student.profilePicture.startsWith('http') ? sub.student.profilePicture : `${API.BASE}/${sub.student.profilePicture.replace(/^\//, '')}`} alt="" className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-xs font-black text-slate-400">{sub.student?.name?.[0]}</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-black text-slate-900 leading-tight">{sub.student?.name} <span className="text-slate-400 font-bold">— {sub.task?.title}</span></p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sub.student?.rollNumber} · Submitted {new Date(sub.submittedAt).toLocaleDateString()}</p>
                                                                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{sub.content}</p>
                                                                    {sub.attachments && sub.attachments.length > 0 && (
                                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                                            {sub.attachments.map((f: any, i: number) => (
                                                                                <a key={i} href={f.url.startsWith('http') ? f.url : `${API.BASE}/${f.url.replace(/^\//, '')}`} download={f.originalname} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-tight text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
                                                                                    <File className="h-3 w-3" /> {f.originalname}
                                                                                </a>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                                <StatusBadge status={sub.status} />
                                                                {sub.companyGrade?.marks != null ? (
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-sm font-black text-emerald-600">{sub.companyGrade.marks}/{sub.task?.maxMarks}</span>
                                                                        <button
                                                                            onClick={() => { setGradeTarget(sub); setGradeForm({ marks: String(sub.companyGrade.marks), feedback: sub.companyGrade.feedback || '' }); setGradeError(''); }}
                                                                            className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-all px-3 py-1.5 rounded-lg hover:bg-indigo-50"
                                                                            title="Edit Grade"
                                                                        >
                                                                            Edit Grade
                                                                        </button>
                                                                    </div>
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
                                ) : (
                                    /* Inline Grade Form — same pattern as StudentDashboard Upload Task */
                                    <div className="max-w-4xl mx-auto">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40 overflow-hidden"
                                        >
                                            <div className="px-10 py-10 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                                                <div className="flex items-center gap-6">
                                                    <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 rotate-3">
                                                        <Star className="h-7 w-7 text-white" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{gradeTarget.student?.name}</h2>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mt-1">{gradeTarget.task?.title}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setGradeTarget(null)}
                                                    className="h-12 w-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-950 hover:border-slate-300 shadow-sm transition-all active:scale-95"
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                            </div>

                                            {/* Submission content preview */}
                                            <div className="px-10 py-6 bg-slate-50 border-b border-slate-100">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Submission Content</p>
                                                <p className="text-sm font-medium text-slate-700 leading-relaxed">{gradeTarget.content}</p>
                                                {gradeTarget.attachments && gradeTarget.attachments.length > 0 && (
                                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {gradeTarget.attachments.map((f: any, i: number) => (
                                                            <a key={i} href={f.url.startsWith('http') ? f.url : `${API.BASE}${f.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl bg-white border border-slate-100 px-4 py-3 text-[10px] font-black uppercase text-indigo-600 hover:shadow-md transition-all">
                                                                <span className="flex items-center gap-2 truncate"><File className="h-4 w-4 shrink-0" /> {f.originalname}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <form onSubmit={handleGrade} className="p-10 space-y-8">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Marks (out of {gradeTarget.task?.maxMarks})</label>
                                                        <input required type="number" min={0} max={gradeTarget.task?.maxMarks} value={gradeForm.marks} onChange={e => setGradeForm({ ...gradeForm, marks: e.target.value })} className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100/50 focus:bg-white transition-all" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Feedback (optional)</label>
                                                        <textarea value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} rows={4} className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100/50 focus:bg-white transition-all resize-none" placeholder="Provide constructive feedback..." />
                                                    </div>
                                                </div>

                                                {gradeError && <p className="text-xs font-bold text-red-500 bg-red-50 rounded-2xl px-5 py-4">{gradeError}</p>}

                                                <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setGradeTarget(null)}
                                                        className="px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={gradeLoading}
                                                        className="px-10 py-4 rounded-2xl bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                                    >
                                                        {gradeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                                                        {gradeLoading ? 'Saving...' : 'Submit Grade'}
                                                    </button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </main>

        </div>
    );
};

export default CompanyDashboard;
