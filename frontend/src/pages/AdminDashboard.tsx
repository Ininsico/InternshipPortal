import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    LogOut,
    ShieldCheck,
    Users,
    Briefcase,
    Building2,
    FileText,
    Search,
    Bell,
    Settings,
    Download,
    Plus,
    UserPlus,
    Loader2,
    LayoutDashboard,
    MoreVertical,
    CheckCircle2,
    XCircle,
    ClipboardList,
    Pencil,
    Trash2,
    UserCheck
} from 'lucide-react';

type AdminTab = 'overview' | 'students' | 'faculty' | 'companies' | 'reports' | 'settings' | 'approvals' | 'agreements' | 'assignments';

const API_BASE = 'http://localhost:5000/api/admin';

const AdminDashboard = () => {
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeApplications: 0,
        completedPlacements: 0,
        pendingAgreements: 0,
        placementRate: 0
    });
    const [students, setStudents] = useState<any[]>([]);
    const [faculty, setFaculty] = useState<any[]>([]);
    const [agreements, setAgreements] = useState<any[]>([]);
    const [verifiedStudents, setVerifiedStudents] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'admin', company: '' });
    const [assignTarget, setAssignTarget] = useState<any | null>(null); // student being assigned
    const [assignForm, setAssignForm] = useState({
        facultySupervisorId: '',
        assignedCompany: '',
        assignedPosition: '',
        siteSupervisorName: '',
        siteSupervisorEmail: '',
        siteSupervisorPhone: ''
    });
    const [assignLoading, setAssignLoading] = useState(false);
    const [assignError, setAssignError] = useState('');

    // Edit faculty state
    const [editFaculty, setEditFaculty] = useState<any | null>(null);
    const [editFacultyForm, setEditFacultyForm] = useState({ name: '', email: '' });
    const [editFacultyLoading, setEditFacultyLoading] = useState(false);
    const [editFacultyError, setEditFacultyError] = useState('');

    // Delete faculty state
    const [deleteFaculty, setDeleteFaculty] = useState<any | null>(null);
    const [deleteFacultyLoading, setDeleteFacultyLoading] = useState(false);

    // Change supervisor state (for students tab)
    const [changeSupervisorTarget, setChangeSupervisorTarget] = useState<any | null>(null);
    const [changeSupervisorId, setChangeSupervisorId] = useState('');
    const [changeSupervisorLoading, setChangeSupervisorLoading] = useState(false);
    const [changeSupervisorError, setChangeSupervisorError] = useState('');
    const [companyAdmins, setCompanyAdmins] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [statsRes, studentsRes] = await Promise.all([
                    axios.get(`${API_BASE}/stats`, config),
                    axios.get(`${API_BASE}/students`, config)
                ]);

                if (statsRes.data.success) {
                    setStats(statsRes.data.stats);
                    setRecentActivity(statsRes.data.recentActivity);
                }
                if (studentsRes.data.success) {
                    setStudents(studentsRes.data.students);
                }

                if (user?.role === 'super_admin') {
                    const [facultyRes, agreementsRes, verifiedRes, companyAdminRes, reportsRes] = await Promise.all([
                        axios.get(`${API_BASE}/faculty`, config),
                        axios.get(`${API_BASE}/agreements`, config),
                        axios.get(`${API_BASE}/verified-students`, config),
                        axios.get(`${API_BASE}/company-admins`, config),
                        axios.get(`${API_BASE}/reports`, config),
                    ]);
                    if (facultyRes.data.success) setFaculty(facultyRes.data.admins);
                    if (agreementsRes.data.success) setAgreements(agreementsRes.data.agreements);
                    if (verifiedRes.data.success) setVerifiedStudents(verifiedRes.data.students);
                    if (companyAdminRes.data.success) setCompanyAdmins(companyAdminRes.data.admins);
                    if (reportsRes.data.success) setReports(reportsRes.data.reports);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, user?.role]);

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload: any = { name: newAdmin.name, email: newAdmin.email, role: newAdmin.role };
            if (newAdmin.role === 'company_admin') payload.company = newAdmin.company;
            const { data } = await axios.post(`${API_BASE}/create-admin`, payload, config);
            if (data.success) {
                if (newAdmin.role === 'company_admin') {
                    setCompanyAdmins(prev => [...prev, data.admin]);
                } else {
                    setFaculty(prev => [...prev, data.admin] as any);
                }
                setShowAddAdminModal(false);
                setNewAdmin({ name: '', email: '', role: 'admin', company: '' });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleApprove = async (studentId: string, status: 'approved' | 'rejected') => {
        let feedback = '';
        if (status === 'rejected') {
            feedback = prompt('Please provide a reason for rejection:') || 'No feedback provided';
            if (feedback === 'No feedback provided') return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post(`${API_BASE}/approve-internship`, { studentId, status, feedback }, config);
            if (data.success) {
                setStudents(students.map((s: any) =>
                    s._id === studentId ? { ...s, internshipStatus: status } : s
                ) as any);
                setStats(prev => ({
                    ...prev,
                    activeApplications: status === 'approved' ? prev.activeApplications - 1 : prev.activeApplications
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleVerifyAgreement = async (agreementId: string, status: 'verified' | 'rejected') => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post(`${API_BASE}/verify-agreement`, { agreementId, status }, config);
            if (data.success) {
                setAgreements(agreements.filter((a: any) => a._id !== agreementId));
                setStats(prev => ({
                    ...prev,
                    pendingAgreements: prev.pendingAgreements - 1
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssignInternship = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignTarget) return;
        setAssignLoading(true);
        setAssignError('');
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post(`${API_BASE}/assign-internship`, {
                studentId: assignTarget._id,
                ...assignForm
            }, config);
            if (data.success) {
                setVerifiedStudents(prev => prev.filter((s: any) => s._id !== assignTarget._id));
                setAssignTarget(null);
                setAssignForm({ facultySupervisorId: '', assignedCompany: '', assignedPosition: '', siteSupervisorName: '', siteSupervisorEmail: '', siteSupervisorPhone: '' });
            }
        } catch (err: any) {
            setAssignError(err?.response?.data?.message || 'Failed to assign internship.');
        } finally {
            setAssignLoading(false);
        }
    };

    const handleEditFaculty = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editFaculty) return;
        setEditFacultyLoading(true);
        setEditFacultyError('');
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put(`${API_BASE}/faculty/${editFaculty._id}`, editFacultyForm, config);
            if (data.success) {
                setFaculty(prev => prev.map((f: any) => f._id === editFaculty._id ? data.admin : f));
                setEditFaculty(null);
            }
        } catch (err: any) {
            setEditFacultyError(err?.response?.data?.message || 'Failed to update.');
        } finally {
            setEditFacultyLoading(false);
        }
    };

    const handleDeleteFaculty = async () => {
        if (!deleteFaculty) return;
        setDeleteFacultyLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.delete(`${API_BASE}/faculty/${deleteFaculty._id}`, config);
            if (data.success) {
                setFaculty(prev => prev.filter((f: any) => f._id !== deleteFaculty._id));
                // Reflect the unassignment in the students list
                setStudents(prev => prev.map((s: any) =>
                    s.supervisorId?._id === deleteFaculty._id ? { ...s, supervisorId: null } : s
                ));
                setDeleteFaculty(null);
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setDeleteFacultyLoading(false);
        }
    };

    const handleChangeSupervisor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!changeSupervisorTarget) return;
        setChangeSupervisorLoading(true);
        setChangeSupervisorError('');
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post(`${API_BASE}/change-supervisor`, {
                studentId: changeSupervisorTarget._id,
                newSupervisorId: changeSupervisorId || null
            }, config);
            if (data.success) {
                setStudents(prev => prev.map((s: any) =>
                    s._id === changeSupervisorTarget._id ? { ...s, supervisorId: data.student.supervisorId } : s
                ));
                setChangeSupervisorTarget(null);
                setChangeSupervisorId('');
            }
        } catch (err: any) {
            setChangeSupervisorError(err?.response?.data?.message || 'Failed to change supervisor.');
        } finally {
            setChangeSupervisorLoading(false);
        }
    };

    const isSuperAdmin = user?.role === 'super_admin';

    const menuItems = [
        { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { key: 'students', label: 'Student Records', icon: Users },
        { key: 'faculty', label: 'Faculty Staff', icon: ShieldCheck, roles: ['super_admin'] },
        { key: 'companies', label: 'Partner Companies', icon: Building2 },
        { key: 'reports', label: 'Reports', icon: FileText },
        { key: 'approvals', label: 'Internship Approvals', icon: Briefcase, roles: ['super_admin'] },
        { key: 'agreements', label: 'Contract Verification', icon: CheckCircle2, roles: ['super_admin'] },
        { key: 'assignments', label: 'Internship Assignment', icon: ClipboardList, roles: ['super_admin'] },
        { key: 'settings', label: 'Settings', icon: Settings },
    ];

    const sidebarItems = menuItems.filter(item => !item.roles || item.roles.includes(user?.role || ''));

    return (
        <div className="flex min-h-screen bg-white">
            <aside className="fixed left-0 top-0 z-40 h-screen w-16 flex-col border-r border-slate-100 bg-white md:w-64">
                <div className="flex h-16 items-center border-b border-slate-100 px-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <span className="ml-3 hidden text-sm font-black tracking-tight text-slate-900 md:block uppercase">CU Portal</span>
                </div>
                <nav className="flex-1 space-y-1 p-3">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key as AdminTab)}
                            className={`flex w-full items-center rounded-lg px-3 py-2.5 transition-all ${activeTab === item.key
                                ? 'bg-blue-50 text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="ml-3 hidden text-xs font-bold uppercase tracking-wider md:block">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="border-t border-slate-100 p-3">
                    <button
                        onClick={logout}
                        className="flex w-full items-center rounded-lg px-3 py-2.5 text-slate-500 transition-all hover:bg-red-50 hover:text-red-500"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span className="ml-3 hidden text-xs font-bold uppercase tracking-wider md:block">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="ml-16 flex-1 md:ml-64">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-8 backdrop-blur-xl">
                    <div className="flex items-center">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                            {sidebarItems.find(t => t.key === activeTab)?.label}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 border-r border-slate-100 pr-4">
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-900 leading-none">{user?.name}</p>
                                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-blue-600">{user?.role === 'super_admin' ? 'Super Admin' : 'Admin Staff'}</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-600">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                        <button className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-900">
                            <Bell className="h-4.5 w-4.5" />
                        </button>
                    </div>
                </header>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[60vh] items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'overview' && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                                            <MetricCard label="Total Students" value={stats.totalStudents} progress={100} />
                                            <MetricCard label="Active Applications" value={stats.activeApplications} progress={45} />
                                            <MetricCard label="Faculty Supervisors" value={faculty.length || 1} progress={75} />
                                            <MetricCard label="Placement Rate" value={`${stats.placementRate}%`} progress={stats.placementRate} />
                                        </div>

                                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                            <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                                                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Recent Applications</h3>
                                                    <button onClick={() => setActiveTab('students')} className="text-[11px] font-black uppercase text-blue-600 hover:text-blue-700">View Directory</button>
                                                </div>
                                                <div className="divide-y divide-slate-100">
                                                    {recentActivity.map((act: any) => (
                                                        <div key={act._id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50">
                                                            <div className="flex items-center">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                                                                    <Briefcase className="h-4 w-4" />
                                                                </div>
                                                                <div className="ml-4">
                                                                    <p className="text-sm font-bold text-slate-900">{act.studentId?.name}</p>
                                                                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{act.companyName} • {act.position}</p>
                                                                </div>
                                                            </div>
                                                            <StatusPill status={act.status} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Portal Actions</h3>
                                                <div className="space-y-6">
                                                    <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">System Status</p>
                                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                        </div>
                                                        <p className="mt-2 text-xl font-black text-slate-900">Active</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <ActionButton label="Add Faculty Admin" icon={UserPlus} isPrimary onClick={() => setShowAddAdminModal(true)} />
                                                        <ActionButton label="Export Student Report" icon={Download} onClick={() => { }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'students' && (
                                    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                                        <div className="border-b border-slate-100 px-8 py-6 flex justify-between items-center bg-slate-50/50">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Student Directory ({students.length})</h3>
                                            <div className="flex gap-4">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                                    <input placeholder="Search Roll Number..." className="h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-xs font-bold outline-none focus:border-blue-500" />
                                                </div>
                                            </div>
                                        </div>
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <th className="px-8 py-4">Student Info</th>
                                                    <th className="px-8 py-4">Status</th>
                                                    <th className="px-8 py-4">Assigned Faculty</th>
                                                    <th className="px-8 py-4">Degree Program</th>
                                                    {isSuperAdmin && <th className="px-8 py-4">Actions</th>}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {students.map((stu: any) => (
                                                    <tr key={stu._id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-8 py-4">
                                                            <div className="flex items-center">
                                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs font-black text-blue-600">
                                                                    {stu.name[0]}
                                                                </div>
                                                                <div className="ml-4">
                                                                    <p className="text-sm font-bold text-slate-900">{stu.name}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{stu.rollNumber}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-4"><StatusPill status={stu.internshipStatus || 'none'} /></td>
                                                        <td className="px-8 py-4">
                                                            {stu.supervisorId?.name
                                                                ? <span className="text-xs font-bold text-slate-700">{stu.supervisorId.name}</span>
                                                                : <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md uppercase tracking-wider">⚠ Not Assigned</span>
                                                            }
                                                        </td>
                                                        <td className="px-8 py-4 text-xs font-bold text-slate-500">{stu.degree}</td>
                                                        {isSuperAdmin && (
                                                            <td className="px-8 py-4">
                                                                <button
                                                                    onClick={() => {
                                                                        setChangeSupervisorTarget(stu);
                                                                        setChangeSupervisorId(stu.supervisorId?._id || '');
                                                                        setChangeSupervisorError('');
                                                                    }}
                                                                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                                                >
                                                                    <UserCheck className="h-3.5 w-3.5" /> Change Supervisor
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {activeTab === 'faculty' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Faculty Management</h3>
                                            <button onClick={() => setShowAddAdminModal(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
                                                <Plus className="h-3.5 w-3.5" /> Add New Staff
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {faculty.map((f: any) => {
                                                const assignedCount = students.filter((s: any) => s.supervisorId?._id === f._id || s.supervisorId === f._id).length;
                                                return (
                                                    <div key={f._id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm group hover:border-blue-100 transition-all">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                                <ShieldCheck className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {assignedCount > 0 && (
                                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600">{assignedCount} student{assignedCount !== 1 ? 's' : ''}</span>
                                                                )}
                                                                <StatusPill status="Staff" />
                                                            </div>
                                                        </div>
                                                        <h4 className="text-base font-black text-slate-900">{f.name}</h4>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">{f.email}</p>
                                                        <div className="mt-6 border-t border-slate-100 pt-4 flex items-center gap-3">
                                                            <button
                                                                onClick={() => { setEditFaculty(f); setEditFacultyForm({ name: f.name, email: f.email }); setEditFacultyError(''); }}
                                                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                                                            >
                                                                <Pencil className="h-3 w-3" /> Edit
                                                            </button>
                                                            <span className="text-slate-200">|</span>
                                                            <button
                                                                onClick={() => setDeleteFaculty({ ...f, assignedCount })}
                                                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                                                            >
                                                                <Trash2 className="h-3 w-3" /> Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'companies' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Company Admins ({companyAdmins.length})</h3>
                                            <button onClick={() => setShowAddAdminModal(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
                                                <Plus className="h-3.5 w-3.5" /> Add Company Admin
                                            </button>
                                        </div>
                                        {companyAdmins.length === 0 ? (
                                            <div className="rounded-2xl border border-slate-100 bg-white py-20 text-center shadow-sm">
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No company admins created yet.</p>
                                                <p className="mt-2 text-xs text-slate-300 font-bold">Create a company admin account to get started.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {companyAdmins.map((ca: any) => (
                                                    <div key={ca._id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:border-blue-100 transition-all">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                                <Building2 className="h-5 w-5" />
                                                            </div>
                                                            <StatusPill status="Staff" />
                                                        </div>
                                                        <h4 className="text-base font-black text-slate-900">{ca.name}</h4>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{ca.email}</p>
                                                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-600">
                                                            <Briefcase className="h-3.5 w-3.5" />{ca.company || 'No company set'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'reports' && (
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Faculty Internship Reports ({reports.length})</h3>
                                        {reports.length === 0 ? (
                                            <div className="rounded-2xl border border-slate-100 bg-white py-20 text-center shadow-sm">
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No reports submitted yet.</p>
                                            </div>
                                        ) : (
                                            reports.map((r: any) => (
                                                <div key={r._id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:border-blue-100 transition-all">
                                                    <div className="flex items-start justify-between gap-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-black text-lg">{r.student?.name?.[0]}</div>
                                                            <div>
                                                                <h4 className="text-base font-black text-slate-900">{r.student?.name}</h4>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{r.student?.rollNumber} · {r.student?.assignedCompany || 'No company'}</p>
                                                                <p className="text-[10px] font-bold text-blue-600 mt-0.5">by {r.createdBy?.name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <div className={`text-2xl font-black ${r.overallRating >= 75 ? 'text-emerald-600' : r.overallRating >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{r.overallRating}/100</div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{r.recommendation?.replace('_', ' ')}</p>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-0.5">{r.completionStatus}</p>
                                                        </div>
                                                    </div>
                                                    <p className="mt-4 text-sm text-slate-600 font-medium">{r.summary}</p>
                                                    {r.scores && (
                                                        <div className="mt-4 grid grid-cols-4 gap-3">
                                                            {Object.entries(r.scores).map(([k, v]: [string, any]) => (
                                                                <div key={k} className="text-center bg-slate-50 rounded-xl p-3">
                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{k}</p>
                                                                    <p className="text-lg font-black text-teal-600">{v}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {activeTab === 'approvals' && isSuperAdmin && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Pending Internship Approvals</h3>
                                        </div>
                                        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        <th className="px-8 py-4">Student</th>
                                                        <th className="px-8 py-4">Internship Info</th>
                                                        <th className="px-8 py-4">Status</th>
                                                        <th className="px-8 py-4">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {students.filter((s: any) => s.internshipStatus === 'submitted').length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                                                No pending approval requests
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        students.filter((s: any) => s.internshipStatus === 'submitted').map((stu: any) => (
                                                            <tr key={stu._id} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-8 py-4">
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-900">{stu.name}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stu.rollNumber}</p>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-4">
                                                                    <div className="space-y-1">
                                                                        {recentActivity.find((a: any) => a.studentId?._id === stu._id) ? (
                                                                            <>
                                                                                <p className="text-xs font-bold text-slate-700">
                                                                                    {recentActivity.find((a: any) => a.studentId?._id === stu._id)?.companyName}
                                                                                </p>
                                                                                <p className="text-[10px] text-slate-500">
                                                                                    {recentActivity.find((a: any) => a.studentId?._id === stu._id)?.position} • {recentActivity.find((a: any) => a.studentId?._id === stu._id)?.internshipType}
                                                                                </p>
                                                                            </>
                                                                        ) : (
                                                                            <p className="text-[10px] text-slate-400 italic">Details not loaded</p>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-4">
                                                                    <StatusPill status="pending" />
                                                                </td>
                                                                <td className="px-8 py-4">
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleApprove(stu._id, 'approved')}
                                                                            className="rounded-lg bg-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all"
                                                                        >
                                                                            Approve
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleApprove(stu._id, 'rejected')}
                                                                            className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-100 transition-all"
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'agreements' && isSuperAdmin && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Contract Verification — Pending Agreements ({agreements.length})</h3>
                                        </div>
                                        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        <th className="px-8 py-4">Student</th>
                                                        <th className="px-8 py-4">Company / Position</th>
                                                        <th className="px-8 py-4">Type</th>
                                                        <th className="px-8 py-4">Status</th>
                                                        <th className="px-8 py-4">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {agreements.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                                                No agreements pending verification
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        agreements.map((agr: any) => (
                                                            <tr key={agr._id} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-8 py-4">
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-900">{agr.studentId?.name}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{agr.studentId?.rollNumber}</p>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-4">
                                                                    <p className="text-xs font-bold text-slate-700">{agr.applicationId?.companyName || '—'}</p>
                                                                    <p className="text-[10px] text-slate-400 mt-0.5">{agr.applicationId?.position || '—'}</p>
                                                                </td>
                                                                <td className="px-8 py-4 text-xs font-semibold text-slate-500 capitalize">
                                                                    {agr.applicationId?.internshipType || '—'}
                                                                </td>
                                                                <td className="px-8 py-4">
                                                                    <StatusPill status={agr.status} />
                                                                </td>
                                                                <td className="px-8 py-4">
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleVerifyAgreement(agr._id, 'verified')}
                                                                            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all"
                                                                        >
                                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Verify
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleVerifyAgreement(agr._id, 'rejected')}
                                                                            className="flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-100 transition-all"
                                                                        >
                                                                            <XCircle className="h-3.5 w-3.5" /> Reject
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'assignments' && isSuperAdmin && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Internship Assignment — Agreement Verified ({verifiedStudents.length})</h3>
                                        </div>
                                        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        <th className="px-8 py-4">Student</th>
                                                        <th className="px-8 py-4">Degree</th>
                                                        <th className="px-8 py-4">Current Supervisor</th>
                                                        <th className="px-8 py-4">Status</th>
                                                        <th className="px-8 py-4">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {verifiedStudents.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                                                No students with verified agreements
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        verifiedStudents.map((stu: any) => (
                                                            <tr key={stu._id} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-8 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs font-black text-blue-600">{stu.name[0]}</div>
                                                                        <div>
                                                                            <p className="text-sm font-bold text-slate-900">{stu.name}</p>
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{stu.rollNumber}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-4 text-xs font-semibold text-slate-500">{stu.degree}</td>
                                                                <td className="px-8 py-4 text-xs font-semibold text-slate-600">{stu.supervisorId?.name || <span className="text-slate-300">Not assigned</span>}</td>
                                                                <td className="px-8 py-4"><StatusPill status={stu.internshipStatus} /></td>
                                                                <td className="px-8 py-4">
                                                                    <button
                                                                        onClick={() => {
                                                                            setAssignTarget(stu);
                                                                            setAssignForm({ facultySupervisorId: stu.supervisorId?._id || '', assignedCompany: '', assignedPosition: '', siteSupervisorName: '', siteSupervisorEmail: '', siteSupervisorPhone: '' });
                                                                            setAssignError('');
                                                                        }}
                                                                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all"
                                                                    >
                                                                        <ClipboardList className="h-3.5 w-3.5" /> Assign
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* INTERNSHIP ASSIGNMENT MODAL */}
            {assignTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => setAssignTarget(null)}>
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-blue-500/10 overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="border-b border-slate-100 px-8 py-6 bg-slate-50/50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Internship Assignment</p>
                            <h2 className="text-lg font-black text-slate-900">{assignTarget.name}</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{assignTarget.rollNumber} · {assignTarget.degree}</p>
                        </div>
                        <form onSubmit={handleAssignInternship} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Faculty Supervisor *</label>
                                <select
                                    required
                                    value={assignForm.facultySupervisorId}
                                    onChange={e => setAssignForm({ ...assignForm, facultySupervisorId: e.target.value })}
                                    className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                >
                                    <option value="">— Select Faculty Supervisor —</option>
                                    {faculty.map((f: any) => (
                                        <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Company Name *</label>
                                    <input required value={assignForm.assignedCompany} onChange={e => setAssignForm({ ...assignForm, assignedCompany: e.target.value })} placeholder="e.g. PTCL" className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Position / Role *</label>
                                    <input required value={assignForm.assignedPosition} onChange={e => setAssignForm({ ...assignForm, assignedPosition: e.target.value })} placeholder="e.g. Software Intern" className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300" />
                                </div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pt-2 border-t border-slate-100">Site Supervisor (Optional)</p>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Full Name</label>
                                <input value={assignForm.siteSupervisorName} onChange={e => setAssignForm({ ...assignForm, siteSupervisorName: e.target.value })} placeholder="Mr. Khalid Ahmed" className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Email</label>
                                    <input type="email" value={assignForm.siteSupervisorEmail} onChange={e => setAssignForm({ ...assignForm, siteSupervisorEmail: e.target.value })} placeholder="supervisor@company.com" className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Phone</label>
                                    <input value={assignForm.siteSupervisorPhone} onChange={e => setAssignForm({ ...assignForm, siteSupervisorPhone: e.target.value })} placeholder="+92 300 0000000" className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300" />
                                </div>
                            </div>
                            {assignError && <p className="text-xs font-bold text-red-500 bg-red-50 rounded-lg px-4 py-3">{assignError}</p>}
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setAssignTarget(null)} className="flex-1 h-12 rounded-2xl border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" disabled={assignLoading} className="flex-1 h-12 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                                    {assignLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
                                    {assignLoading ? 'Assigning...' : 'Confirm Assignment'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* CHANGE SUPERVISOR MODAL */}
            {changeSupervisorTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => setChangeSupervisorTarget(null)}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-slate-100 bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="border-b border-slate-100 px-8 py-6 bg-slate-50/50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Change Faculty Supervisor</p>
                            <h2 className="text-lg font-black text-slate-900">{changeSupervisorTarget.name}</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{changeSupervisorTarget.rollNumber}</p>
                        </div>
                        <form onSubmit={handleChangeSupervisor} className="p-8 space-y-5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Assign Supervisor</label>
                                <select
                                    value={changeSupervisorId}
                                    onChange={e => setChangeSupervisorId(e.target.value)}
                                    className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                >
                                    <option value="">— Remove Supervisor —</option>
                                    {faculty.map((f: any) => (
                                        <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                                    ))}
                                </select>
                                {!changeSupervisorId && <p className="text-[10px] text-amber-500 font-bold mt-1.5">⚠ Student will have no supervisor assigned.</p>}
                            </div>
                            {changeSupervisorError && <p className="text-xs font-bold text-red-500 bg-red-50 rounded-lg px-4 py-3">{changeSupervisorError}</p>}
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setChangeSupervisorTarget(null)} className="flex-1 h-12 rounded-2xl border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" disabled={changeSupervisorLoading} className="flex-1 h-12 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                                    {changeSupervisorLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                                    {changeSupervisorLoading ? 'Saving...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* EDIT FACULTY MODAL */}
            {editFaculty && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => setEditFaculty(null)}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-slate-100 bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="border-b border-slate-100 px-8 py-6 bg-slate-50/50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Edit Faculty Details</p>
                            <h2 className="text-lg font-black text-slate-900">{editFaculty.name}</h2>
                        </div>
                        <form onSubmit={handleEditFaculty} className="p-8 space-y-5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Full Name</label>
                                <input required value={editFacultyForm.name} onChange={e => setEditFacultyForm({ ...editFacultyForm, name: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Email Address</label>
                                <input required type="email" value={editFacultyForm.email} onChange={e => setEditFacultyForm({ ...editFacultyForm, email: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100" />
                            </div>
                            {editFacultyError && <p className="text-xs font-bold text-red-500 bg-red-50 rounded-lg px-4 py-3">{editFacultyError}</p>}
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setEditFaculty(null)} className="flex-1 h-12 rounded-2xl border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" disabled={editFacultyLoading} className="flex-1 h-12 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                                    {editFacultyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                                    {editFacultyLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* DELETE FACULTY CONFIRMATION MODAL */}
            {deleteFaculty && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => setDeleteFaculty(null)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-3xl border border-slate-100 bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-8">
                            <div className="flex items-center justify-center mb-6">
                                <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center">
                                    <Trash2 className="h-6 w-6 text-red-500" />
                                </div>
                            </div>
                            <h2 className="text-center text-xl font-black text-slate-900">Delete Faculty Member?</h2>
                            <p className="mt-2 text-center text-sm font-bold text-slate-500">{deleteFaculty.name}</p>
                            {deleteFaculty.assignedCount > 0 ? (
                                <div className="mt-5 rounded-xl bg-amber-50 border border-amber-100 px-5 py-4">
                                    <p className="text-xs font-black text-amber-700 uppercase tracking-wider">⚠ Warning</p>
                                    <p className="mt-1 text-sm font-bold text-amber-600">
                                        <span className="text-amber-700">{deleteFaculty.assignedCount} student{deleteFaculty.assignedCount !== 1 ? 's are' : ' is'} currently assigned</span> to this supervisor. They will show <span className="text-amber-700">"Not Assigned"</span> after deletion.
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-4 text-center text-xs font-bold text-slate-400">No students are currently assigned to this supervisor.</p>
                            )}
                            <div className="flex gap-4 mt-7">
                                <button onClick={() => setDeleteFaculty(null)} className="flex-1 h-12 rounded-2xl border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                <button onClick={handleDeleteFaculty} disabled={deleteFacultyLoading} className="flex-1 h-12 rounded-2xl bg-red-500 text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                                    {deleteFacultyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    {deleteFacultyLoading ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {showAddAdminModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-xl p-6">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-[2.5rem] border border-slate-100 bg-white p-12 shadow-2xl shadow-blue-500/5">
                        <div className="mb-10 text-center">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Staff Account</h2>
                            <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Create New Administrator</p>
                        </div>
                        <form onSubmit={handleCreateAdmin} className="space-y-6">
                            <Input label="Full Name" value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} placeholder="Prof. Ahmad" />
                            <Input label="Email Address" type="email" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} placeholder="staff@comsats.edu.pk" />
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Account Role</label>
                                <select value={newAdmin.role} onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value, company: '' })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all">
                                    <option value="admin">Faculty Supervisor</option>
                                    <option value="company_admin">Company Admin</option>
                                </select>
                            </div>
                            {newAdmin.role === 'company_admin' && (
                                <Input label="Company Name" value={newAdmin.company} onChange={e => setNewAdmin({ ...newAdmin, company: e.target.value })} placeholder="e.g. PTCL, Systems Ltd" />
                            )}
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowAddAdminModal(false)} className="flex-1 h-14 rounded-2xl border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 h-14 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95">Create Account</button>
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
    progress: number;
}

const MetricCard = ({ label, value, progress }: MetricCardProps) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</p>
        <div className="mt-4 h-1 w-full rounded-full bg-slate-50 overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-blue-600"
            />
        </div>
    </div>
);

interface ActionButtonProps {
    label: string;
    icon: any;
    onClick: () => void;
    isPrimary?: boolean;
}

const ActionButton = ({ label, icon: Icon, onClick, isPrimary }: ActionButtonProps) => (
    <button
        onClick={onClick}
        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${isPrimary
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700'
            : 'border border-slate-100 bg-white text-slate-500 hover:bg-slate-50'
            }`}
    >
        {label}
        <Icon className="h-4 w-4" />
    </button>
);

const StatusPill = ({ status }: { status: string }) => {
    const isSuccess = ['staff', 'Staff', 'approved', 'verified', 'internship_assigned'].includes(status);
    const isPending = ['pending', 'submitted', 'agreement_submitted'].includes(status);
    const isError = ['rejected'].includes(status);

    let colors = 'bg-slate-50 text-slate-400';
    if (isSuccess) colors = 'bg-blue-50 text-blue-600';
    if (isPending) colors = 'bg-amber-50 text-amber-600';
    if (isError) colors = 'bg-red-50 text-red-600';

    const label = status === 'internship_assigned' ? 'Assigned'
        : status === 'agreement_submitted' ? 'Agr. Submitted'
            : status;

    return (
        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${colors}`}>
            {label}
        </span>
    );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const Input = ({ label, ...props }: InputProps) => (
    <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{label}</label>
        <input {...props} required className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300" />
    </div>
);

export default AdminDashboard;
