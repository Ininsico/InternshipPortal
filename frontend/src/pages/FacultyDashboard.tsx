import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, FileText, ClipboardList,
    LogOut, Plus, Loader2, Star, BookOpen, Award, CheckCircle2, Pencil, Building2, X, RefreshCw, Menu
} from 'lucide-react';

import API from '../config/api';

const API_BASE = API.FACULTY;

type Tab = 'overview' | 'students' | 'submissions' | 'reports';

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; cls: string }> = {
        submitted: { label: 'Submitted', cls: 'bg-blue-50 text-blue-600' },
        graded_by_company: { label: 'Graded by Company', cls: 'bg-purple-50 text-purple-600' },
        graded_by_faculty: { label: 'Graded by You', cls: 'bg-teal-50 text-teal-600' },
        fully_graded: { label: 'Fully Graded ✓', cls: 'bg-emerald-50 text-emerald-600' },
    };
    const cfg = map[status] || { label: status, cls: 'bg-slate-100 text-slate-500' };
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.cls}`}>{cfg.label}</span>;
};

const RatingPill = ({ val }: { val: number }) => {
    const color = val >= 75 ? 'emerald' : val >= 50 ? 'amber' : 'red';
    return <span className={`px-3 py-1 rounded-full text-xs font-black bg-${color}-50 text-${color}-600`}>{val}/100</span>;
};

const FacultyDashboard = () => {
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [students, setStudents] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportTarget, setReportTarget] = useState<any | null>(null);
    const [reportForm, setReportForm] = useState({
        summary: '', overallRating: 75,
        scores: { technical: 75, communication: 75, teamwork: 75, punctuality: 75 },
        recommendation: 'good', completionStatus: 'ongoing'
    });
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState('');

    const [gradeTarget, setGradeTarget] = useState<any | null>(null);
    const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '' });
    const [gradeLoading, setGradeLoading] = useState(false);
    const [gradeError, setGradeError] = useState('');

    const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
    const [newCompany, setNewCompany] = useState({ name: '', email: '', website: '', phone: '', address: '' });
    const [companyLoading, setCompanyLoading] = useState(false);
    const [companyError, setCompanyError] = useState('');

    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchAll = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const [stuRes, subRes, repRes] = await Promise.all([
                axios.get(`${API_BASE}/students`, config),
                axios.get(`${API_BASE}/submissions`, config),
                axios.get(`${API_BASE}/reports`, config),
            ]);
            if (stuRes.data.success) setStudents(stuRes.data.students);
            if (subRes.data.success) setSubmissions(subRes.data.submissions);
            if (repRes.data.success) setReports(repRes.data.reports);
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
                fetchAll(true);
            }
        } catch (err: any) {
            setGradeError(err?.response?.data?.message || 'Failed to grade.');
        } finally {
            setGradeLoading(false);
        }
    };

    const handleReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reportTarget) return;
        setReportLoading(true);
        setReportError('');
        try {
            const { data } = await axios.post(`${API_BASE}/reports`, {
                studentId: reportTarget._id,
                ...reportForm,
            }, config);
            if (data.success) {
                setReports(prev => {
                    const idx = prev.findIndex(r => String(r.student?._id) === String(reportTarget._id));
                    if (idx >= 0) { const next = [...prev]; next[idx] = data.report; return next; }
                    return [data.report, ...prev];
                });
                setShowReportModal(false);
                setReportTarget(null);
                fetchAll(true);
            }
        } catch (err: any) {
            setReportError(err?.response?.data?.message || 'Failed to save report.');
        } finally {
            setReportLoading(false);
        }
    };

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        setCompanyLoading(true);
        setCompanyError('');
        try {
            const { data } = await axios.post(`${API_BASE}/companies`, newCompany, config);
            if (data.success) {
                setShowAddCompanyModal(false);
                setNewCompany({ name: '', email: '', website: '', phone: '', address: '' });
                fetchAll(true);
            }
        } catch (err: any) {
            setCompanyError(err?.response?.data?.message || 'Failed to add company.');
        } finally {
            setCompanyLoading(false);
        }
    };

    const openReportModal = (student: any) => {
        const existing = reports.find(r => String(r.student?._id) === String(student._id));
        setReportTarget(student);
        setReportForm(existing ? {
            summary: existing.summary,
            overallRating: existing.overallRating,
            scores: existing.scores || { technical: 75, communication: 75, teamwork: 75, punctuality: 75 },
            recommendation: existing.recommendation,
            completionStatus: existing.completionStatus,
        } : {
            summary: '', overallRating: 75,
            scores: { technical: 75, communication: 75, teamwork: 75, punctuality: 75 },
            recommendation: 'good', completionStatus: 'ongoing'
        });
        setReportError('');
        setShowReportModal(true);
    };

    const ungradedCount = submissions.filter(s => !s.facultyGrade?.marks).length;
    const reportedCount = reports.length;

    const navItems: { id: Tab; label: string; icon: any; badge?: number }[] = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'students', label: 'My Students', icon: Users },
        { id: 'submissions', label: 'Submissions', icon: ClipboardList, badge: ungradedCount },
        { id: 'reports', label: 'Reports', icon: FileText },
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
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
                            <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-900">Faculty Portal</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">{user?.name}</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-black uppercase tracking-wider transition-all ${activeTab === item.id ? 'bg-teal-600 text-white shadow-md shadow-teal-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {item.label}
                            {item.badge != null && item.badge > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">{item.badge}</span>
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

            <main className="flex-1 overflow-y-auto flex flex-col">
                {/* Mobile top bar */}
                <div className="sticky top-0 z-30 flex h-12 items-center gap-3 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 lg:hidden">
                    <button
                        onClick={() => setShowMobileSidebar(true)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-all"
                    >
                        <Menu className="h-4 w-4" />
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Faculty Portal</span>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6 md:p-8">

                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-teal-500 mb-1">Faculty Portal</p>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                                    {activeTab === 'overview' && 'Dashboard'}
                                    {activeTab === 'students' && 'My Students'}
                                    {activeTab === 'submissions' && 'Student Submissions'}
                                    {activeTab === 'reports' && 'Internship Reports'}
                                </h1>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => fetchAll(true)}
                                    disabled={refreshing}
                                    className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {refreshing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                                    {refreshing ? 'Syncing...' : 'Sync Data'}
                                </button>
                                {activeTab === 'overview' && (
                                    <button
                                        onClick={() => setShowAddCompanyModal(true)}
                                        className="h-12 px-6 rounded-2xl bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 flex items-center gap-2"
                                    >
                                        <Building2 className="h-4 w-4" /> Add Partner
                                    </button>
                                )}
                            </div>
                        </div>

                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Assigned Students', value: students.length, color: 'teal' },
                                        { label: 'Ungraded Submissions', value: ungradedCount, color: 'amber' },
                                        { label: 'Reports Issued', value: reportedCount, color: 'indigo' },
                                    ].map(stat => (
                                        <div key={stat.label} className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                                            <p className={`mt-2 text-4xl font-black text-${stat.color}-600`}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Students Without Reports</h3>
                                    {students.filter(s => !reports.find(r => String(r.student?._id) === String(s._id))).map(s => (
                                        <div key={s._id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{s.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{s.rollNumber} · {s.assignedCompany || 'No company'}</p>
                                            </div>
                                            <button onClick={() => openReportModal(s)} className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-teal-700 transition-all">
                                                <Plus className="h-3.5 w-3.5" /> Create Report
                                            </button>
                                        </div>
                                    ))}
                                    {students.every(s => reports.find(r => String(r.student?._id) === String(s._id))) && students.length > 0 && (
                                        <p className="text-center text-sm font-bold text-emerald-500 py-4">✓ All students have reports!</p>
                                    )}
                                    {students.length === 0 && <p className="text-center text-sm font-bold text-slate-400 py-4">No students assigned yet.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'students' && (
                            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 px-8 py-6 bg-slate-50/50">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Supervised Students ({students.length})</h3>
                                </div>
                                {students.length === 0 ? (
                                    <div className="py-20 text-center text-slate-400 font-bold">No students assigned to you yet.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left min-w-[560px]">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <th className="px-8 py-4">Student</th>
                                                    <th className="px-8 py-4">Company</th>
                                                    <th className="px-8 py-4">Position</th>
                                                    <th className="px-8 py-4">Report</th>
                                                    <th className="px-8 py-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {students.map(s => {
                                                    const hasReport = reports.find(r => String(r.student?._id) === String(s._id));
                                                    return (
                                                        <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-8 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-9 w-9 rounded-xl bg-teal-50 flex items-center justify-center text-xs font-black text-teal-600 overflow-hidden">
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
                                                            <td className="px-8 py-4 text-xs font-bold text-slate-500">{s.assignedCompany || '—'}</td>
                                                            <td className="px-8 py-4 text-xs font-bold text-slate-500">{s.assignedPosition || '—'}</td>
                                                            <td className="px-8 py-4">
                                                                {hasReport
                                                                    ? <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-wider"><CheckCircle2 className="h-3.5 w-3.5" /> Issued</span>
                                                                    : <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">⚠ Pending</span>
                                                                }
                                                            </td>
                                                            <td className="px-8 py-4">
                                                                <button onClick={() => openReportModal(s)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600 transition-all">
                                                                    <FileText className="h-3.5 w-3.5" /> {hasReport ? 'Edit Report' : 'Create Report'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'submissions' && (
                            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 px-8 py-6 bg-slate-50/50">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Submissions for My Students ({submissions.length})</h3>
                                </div>
                                {submissions.length === 0 ? (
                                    <div className="py-20 text-center text-slate-400 font-bold">No submissions yet.</div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {submissions.map(sub => (
                                            <div key={sub._id} className="px-8 py-5 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 overflow-hidden border border-teal-100 mt-1">
                                                            {sub.student?.profilePicture ? (
                                                                <img src={sub.student.profilePicture.startsWith('http') ? sub.student.profilePicture : `${API.BASE}/${sub.student.profilePicture.replace(/^\//, '')}`} alt="" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <span className="text-xs font-black text-teal-600">{sub.student?.name?.[0]}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-black text-slate-900 leading-tight">{sub.student?.name} <span className="text-slate-400 font-bold">— {sub.task?.title}</span></p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sub.student?.rollNumber} · {sub.student?.assignedCompany} · {new Date(sub.submittedAt).toLocaleDateString()}</p>
                                                            <p className="text-sm text-slate-600 mt-2 line-clamp-2">{sub.content}</p>
                                                            {sub.attachments && sub.attachments.length > 0 && (
                                                                <div className="mt-3 flex flex-wrap gap-2">
                                                                    {sub.attachments.map((f: any, i: number) => (
                                                                        <a key={i} href={f.url?.startsWith('http') ? f.url : `${API.BASE}/${f.url?.replace(/^\//, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-tight text-slate-500 hover:text-teal-600 hover:border-teal-100 transition-all shadow-sm">
                                                                            <FileText className="h-3 w-3" /> {f.originalname}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {sub.companyGrade?.marks != null && (
                                                                <p className="mt-1.5 text-xs font-bold text-purple-600">Company grade: {sub.companyGrade.marks}/{sub.task?.maxMarks} — {sub.companyGrade.feedback || 'No feedback'}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                                        <StatusBadge status={sub.status} />
                                                        {sub.facultyGrade?.marks != null ? (
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-black text-emerald-600">Your grade: {sub.facultyGrade.marks}/{sub.task?.maxMarks}</span>
                                                                <button
                                                                    onClick={() => { setGradeTarget(sub); setGradeForm({ marks: String(sub.facultyGrade.marks), feedback: sub.facultyGrade.feedback || '' }); setGradeError(''); }}
                                                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-all"
                                                                    title="Edit Grade"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => { setGradeTarget(sub); setGradeForm({ marks: '', feedback: '' }); setGradeError(''); }}
                                                                className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-teal-700 transition-all"
                                                            >
                                                                <Star className="h-3.5 w-3.5" /> Grade
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'reports' && (
                            <div className="space-y-4">
                                {reports.length === 0 ? (
                                    <div className="rounded-2xl bg-white border border-slate-100 py-20 text-center text-slate-400 font-bold shadow-sm">No reports issued yet. Go to Students to create a report.</div>
                                ) : (
                                    reports.map(r => (
                                        <div key={r._id} className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm hover:border-teal-100 transition-all">
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center text-sm font-black text-teal-600 overflow-hidden">
                                                            {r.student?.profilePicture ? (
                                                                <img src={r.student.profilePicture.startsWith('http') ? r.student.profilePicture : `${API.BASE}/${r.student.profilePicture.replace(/^\//, '')}`} alt="" className="h-full w-full object-cover" />
                                                            ) : (
                                                                r.student?.name?.[0]
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-black text-slate-900">{r.student?.name}</h4>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{r.student?.rollNumber} · {r.student?.assignedCompany}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <RatingPill val={r.overallRating} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{r.recommendation?.replace('_', ' ')}</span>
                                                    <button onClick={() => openReportModal(students.find(s => String(s._id) === String(r.student?._id)) || r.student)} className="text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700">Edit</button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 font-medium">{r.summary}</p>
                                            {r.scores && (
                                                <div className="mt-4 grid grid-cols-4 gap-3">
                                                    {Object.entries(r.scores).filter(([, v]) => v != null).map(([k, v]) => (
                                                        <div key={k} className="text-center bg-slate-50 rounded-xl p-3">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{k}</p>
                                                            <p className="text-lg font-black text-teal-600">{String(v)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </main>

            <AnimatePresence>
                {showReportModal && reportTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setShowReportModal(false)}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="w-full max-w-xl rounded-3xl bg-white border border-slate-100 shadow-2xl overflow-hidden my-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="border-b border-slate-100 px-8 py-6 bg-slate-50/50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-1">Internship Report</p>
                                <h2 className="text-xl font-black text-slate-900">{reportTarget.name}</h2>
                                <p className="text-xs font-bold text-slate-400 mt-0.5">{reportTarget.rollNumber} · {reportTarget.assignedCompany || 'No company'}</p>
                            </div>
                            <form onSubmit={handleReport} className="p-6 md:p-8 space-y-5 overflow-y-auto">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Summary & Evaluation</label>
                                    <textarea required value={reportForm.summary} onChange={e => setReportForm({ ...reportForm, summary: e.target.value })} rows={4} className="w-full rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-100 resize-none" placeholder="Describe the student's overall performance, strengths, and areas for improvement..." />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Overall Rating: <span className="text-teal-600">{reportForm.overallRating}/100</span></label>
                                    <input type="range" min={0} max={100} value={reportForm.overallRating} onChange={e => setReportForm({ ...reportForm, overallRating: Number(e.target.value) })} className="w-full accent-teal-600" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {(['technical', 'communication', 'teamwork', 'punctuality'] as const).map(field => (
                                        <div key={field}>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{field}: <span className="text-teal-600">{reportForm.scores[field]}</span></label>
                                            <input type="range" min={0} max={100} value={reportForm.scores[field]} onChange={e => setReportForm({ ...reportForm, scores: { ...reportForm.scores, [field]: Number(e.target.value) } })} className="w-full accent-teal-600" />
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Recommendation</label>
                                        <select value={reportForm.recommendation} onChange={e => setReportForm({ ...reportForm, recommendation: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-100">
                                            <option value="excellent">Excellent</option>
                                            <option value="good">Good</option>
                                            <option value="satisfactory">Satisfactory</option>
                                            <option value="needs_improvement">Needs Improvement</option>
                                            <option value="unsatisfactory">Unsatisfactory</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Completion Status</label>
                                        <select value={reportForm.completionStatus} onChange={e => setReportForm({ ...reportForm, completionStatus: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-100">
                                            <option value="ongoing">Ongoing</option>
                                            <option value="completed">Completed</option>
                                            <option value="incomplete">Incomplete</option>
                                        </select>
                                    </div>
                                </div>
                                {reportError && <p className="text-xs font-bold text-red-500 bg-red-50 rounded-lg px-4 py-3">{reportError}</p>}
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 h-12 rounded-2xl border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                    <button type="submit" disabled={reportLoading} className="flex-1 h-12 rounded-2xl bg-teal-600 text-white text-xs font-black uppercase tracking-widest hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                                        {reportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                                        {reportLoading ? 'Saving...' : 'Save Report'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {gradeTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setGradeTarget(null)}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="w-full max-w-md rounded-3xl bg-white border border-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="border-b border-slate-100 px-8 py-6 bg-slate-50/50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-1">Grade Submission</p>
                                <h2 className="text-lg font-black text-slate-900">{gradeTarget.student?.name}</h2>
                                <p className="text-xs font-bold text-slate-400 mt-0.5">{gradeTarget.task?.title}</p>
                            </div>
                            <div className="px-8 py-5 bg-slate-50 border-b border-slate-100">
                                <p className="text-xs font-bold text-slate-600 mb-3">{gradeTarget.content}</p>
                                {gradeTarget.attachments && gradeTarget.attachments.length > 0 && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {gradeTarget.attachments.map((f: any, i: number) => (
                                            <a key={i} href={f.url?.startsWith('http') ? f.url : `${API.BASE}${f.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl bg-white border border-slate-100 px-4 py-2.5 text-[10px] font-black uppercase text-teal-600 hover:shadow-md transition-all">
                                                <span className="flex items-center gap-2 truncate"><FileText className="h-4 w-4" /> {f.originalname}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleGrade} className="p-6 md:p-8 space-y-5 overflow-y-auto">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Marks (out of {gradeTarget.task?.maxMarks})</label>
                                    <input required type="number" min={0} max={gradeTarget.task?.maxMarks} value={gradeForm.marks} onChange={e => setGradeForm({ ...gradeForm, marks: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-100" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Feedback (optional)</label>
                                    <textarea value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} rows={3} className="w-full rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-100 resize-none" />
                                </div>
                                {gradeError && <p className="text-xs font-bold text-red-500 bg-red-50 rounded-lg px-4 py-3">{gradeError}</p>}
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setGradeTarget(null)} className="flex-1 h-12 rounded-2xl border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                    <button type="submit" disabled={gradeLoading} className="flex-1 h-12 rounded-2xl bg-teal-600 text-white text-xs font-black uppercase tracking-widest hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                                        {gradeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                                        {gradeLoading ? 'Saving...' : 'Submit Grade'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAddCompanyModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setShowAddCompanyModal(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest italic">Add Partner</h3>
                                <button onClick={() => setShowAddCompanyModal(false)} className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"><X className="h-4 w-4" /></button>
                            </div>
                            <form onSubmit={handleCreateCompany} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Company Name</label>
                                    <input required value={newCompany.name} onChange={e => setNewCompany({ ...newCompany, name: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-100 transition-all" placeholder="e.g. Google" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Industry Email (Optional)</label>
                                    <input type="email" value={newCompany.email} onChange={e => setNewCompany({ ...newCompany, email: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-100 transition-all" placeholder="hr@company.com" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Website</label>
                                        <input value={newCompany.website} onChange={e => setNewCompany({ ...newCompany, website: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-100 transition-all" placeholder="company.com" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Phone</label>
                                        <input value={newCompany.phone} onChange={e => setNewCompany({ ...newCompany, phone: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-100 transition-all" placeholder="+1..." />
                                    </div>
                                </div>
                                {companyError && <p className="text-xs font-bold text-red-500 bg-red-50 p-4 rounded-xl">{companyError}</p>}
                                <button type="submit" disabled={companyLoading} className="w-full h-12 rounded-xl bg-teal-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 active:scale-95 disabled:opacity-50">
                                    {companyLoading ? 'Processing...' : 'Register Partner'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FacultyDashboard;
