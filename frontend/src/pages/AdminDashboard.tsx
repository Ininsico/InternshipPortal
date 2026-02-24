import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Loader2, X } from 'lucide-react';

import AdminSidebar from '../components/admin/AdminSidebar';
import OverviewTab from '../components/admin/OverviewTab';
import StudentsTab from '../components/admin/StudentsTab';
import ReportsTab from '../components/admin/ReportsTab';
import FacultyTab from '../components/admin/FacultyTab';
import CompaniesTab from '../components/admin/CompaniesTab';
import ApprovalsTab from '../components/admin/ApprovalsTab';
import AgreementsTab from '../components/admin/AgreementsTab';
import StudentProfileModal from '../components/admin/StudentProfileModal';
import ReportDetailsModal from '../components/admin/ReportDetailsModal';
import EditReportModal from '../components/admin/EditReportModal';
import AdminDashboardModals from '../components/admin/AdminDashboardModals';

type AdminTab = 'overview' | 'students' | 'reports' | 'faculty' | 'companies' | 'approvals' | 'agreements' | 'settings';

import API from '../config/api';

const API_BASE = API.ADMIN;

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
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [companyAdmins, setCompanyAdmins] = useState<any[]>([]);
    const [partneredCompanies, setPartneredCompanies] = useState<string[]>([]);
    const [reports, setReports] = useState<any[]>([]);

    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'admin', company: '' });

    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [selectedReport, setSelectedReport] = useState<any | null>(null);

    const [editFaculty, setEditFaculty] = useState<any | null>(null);
    const [editFacultyForm, setEditFacultyForm] = useState({ name: '', email: '' });
    const [editFacultyLoading, setEditFacultyLoading] = useState(false);
    const [editFacultyError, setEditFacultyError] = useState('');

    const [deleteFaculty, setDeleteFaculty] = useState<any | null>(null);
    const [deleteFacultyLoading, setDeleteFacultyLoading] = useState(false);

    const [deleteStudentTarget, setDeleteStudentTarget] = useState<any | null>(null);
    const [deleteStudentLoading, setDeleteStudentLoading] = useState(false);

    const [editStudentTarget, setEditStudentTarget] = useState<any | null>(null);
    const [editStudentForm, setEditStudentForm] = useState({
        assignedCompany: '',
        assignedPosition: '',
        siteSupervisorName: '',
        siteSupervisorEmail: '',
        siteSupervisorPhone: '',
        internshipStatus: ''
    });
    const [editStudentLoading, setEditStudentLoading] = useState(false);
    const [editStudentError, setEditStudentError] = useState('');

    const [viewApp, setViewApp] = useState<any | null>(null);
    const [viewAppLoading, setViewAppLoading] = useState(false);

    const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
    const [newCompany, setNewCompany] = useState({ name: '', email: '', website: '', phone: '', address: '' });
    const [companyLoading, setCompanyLoading] = useState(false);
    const [companyError, setCompanyError] = useState('');

    const [changeSupervisorTarget, setChangeSupervisorTarget] = useState<any | null>(null);
    const [changeSupervisorId, setChangeSupervisorId] = useState('');
    const [changeSupervisorLoading, setChangeSupervisorLoading] = useState(false);
    const [changeSupervisorError, setChangeSupervisorError] = useState('');

    const [editReport, setEditReport] = useState<any | null>(null);
    const [editReportForm, setEditReportForm] = useState({ summary: '', overallRating: 0, recommendation: '', completionStatus: '', scores: {} });
    const [editReportLoading, setEditReportLoading] = useState(false);
    const [editReportError, setEditReportError] = useState('');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const [statsRes, studentsRes] = await Promise.all([
                    axios.get(`${API_BASE}/stats`, config),
                    axios.get(`${API_BASE}/students`, config),
                ]);

                if (statsRes.data.success) {
                    setStats(statsRes.data.stats);
                    setRecentActivity(statsRes.data.recentActivity);
                }
                if (studentsRes.data.success) {
                    setStudents(studentsRes.data.students);
                }

                if (user?.role === 'super_admin') {
                    const results = await Promise.allSettled([
                        axios.get(`${API_BASE}/faculty`, config),
                        axios.get(`${API_BASE}/agreements`, config),
                        axios.get(`${API_BASE}/company-admins`, config),
                        axios.get(`${API_BASE}/reports`, config),
                        axios.get(`${API_BASE}/partnered-companies`, config),
                    ]);

                    const [facultyRes, agreementsRes, companyAdminRes, reportsRes, partneredRes] = results;

                    if (facultyRes.status === 'fulfilled' && facultyRes.value.data.success) {
                        console.log('Setting faculty:', facultyRes.value.data.admins);
                        setFaculty(facultyRes.value.data.admins);
                    }
                    if (agreementsRes.status === 'fulfilled' && agreementsRes.value.data.success) setAgreements(agreementsRes.value.data.agreements);
                    if (companyAdminRes.status === 'fulfilled' && companyAdminRes.value.data.success) {
                        console.log('Setting company admins:', companyAdminRes.value.data.admins);
                        setCompanyAdmins(companyAdminRes.value.data.admins);
                    }
                    if (reportsRes.status === 'fulfilled' && reportsRes.value.data.success) setReports(reportsRes.value.data.reports);
                    if (partneredRes.status === 'fulfilled' && partneredRes.value.data.success) {
                        console.log('Setting partnered companies:', partneredRes.value.data.companies);
                        setPartneredCompanies(partneredRes.value.data.companies);
                    }

                    // Log failures for debugging
                    results.forEach((res, idx) => {
                        if (res.status === 'rejected') {
                            console.error(`Request ${idx} failed:`, res.reason);
                        }
                    });
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
            const payload: any = { name: newAdmin.name, email: newAdmin.email, role: newAdmin.role };
            if (newAdmin.role === 'company_admin') payload.company = newAdmin.company;
            const { data } = await axios.post(`${API_BASE}/create-admin`, payload, config);
            if (data.success) {
                if (newAdmin.role === 'company_admin') {
                    setCompanyAdmins(prev => [...prev, data.admin]);
                } else {
                    setFaculty(prev => [...prev, data.admin]);
                }
                setShowAddAdminModal(false);
                setNewAdmin({ name: '', email: '', role: 'admin', company: '' });
            }
        } catch (err) { console.error(err); }
    };

    const handleUpdateFaculty = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditFacultyLoading(true);
        setEditFacultyError('');
        try {
            const { data } = await axios.put(`${API_BASE}/faculty/${editFaculty._id}`, editFacultyForm, config);
            if (data.success) {
                setFaculty(prev => prev.map(f => f._id === editFaculty._id ? data.admin : f));
                setEditFaculty(null);
            }
        } catch (err: any) {
            setEditFacultyError(err.response?.data?.message || 'Update failed');
        } finally { setEditFacultyLoading(false); }
    };

    const handleDeleteFaculty = async () => {
        setDeleteFacultyLoading(true);
        try {
            const { data } = await axios.delete(`${API_BASE}/faculty/${deleteFaculty._id}`, config);
            if (data.success) {
                if (deleteFaculty.role === 'company_admin') {
                    setCompanyAdmins(prev => prev.filter(f => f._id !== deleteFaculty._id));
                    try {
                        const companiesRes = await axios.get(`${API_BASE}/partnered-companies`, config);
                        if (companiesRes.data.success) setPartneredCompanies(companiesRes.data.companies);
                    } catch (_) { }
                } else {
                    setFaculty(prev => prev.filter(f => f._id !== deleteFaculty._id));
                }
                setDeleteFaculty(null);
            }
        } catch (err) { console.error(err); }
        finally { setDeleteFacultyLoading(false); }
    };

    const handleResendInvitation = async (adminId: string) => {
        try {
            const { data } = await axios.post(`${API_BASE}/resend-invitation/${adminId}`, {}, config);
            if (data.success) {
                alert('Invitation email resent successfully.');
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to resend invitation.');
        }
    };

    const handleResendStudentEmail = async (email: string) => {
        try {
            const { data } = await axios.post(`${API.AUTH}/resend-otp`, { email });
            if (data.success) {
                alert('Verification email resent to student.');
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to resend email.');
        }
    };

    const handleDeleteStudent = async () => {
        setDeleteStudentLoading(true);
        try {
            const { data } = await axios.delete(`${API_BASE}/students/${deleteStudentTarget._id}`, config);
            if (data.success) {
                setStudents(prev => prev.filter(s => s._id !== deleteStudentTarget._id));
                setDeleteStudentTarget(null);
                // Also update stats since a student was removed
                const statsRes = await axios.get(`${API_BASE}/stats`, config);
                if (statsRes.data.success) setStats(statsRes.data.stats);
            }
        } catch (err) { console.error(err); }
        finally { setDeleteStudentLoading(false); }
    };

    const handleEditStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editStudentTarget) return;
        setEditStudentLoading(true);
        setEditStudentError('');
        try {
            const { data } = await axios.put(`${API_BASE}/students/${editStudentTarget._id}/internship`, editStudentForm, config);
            if (data.success) {
                setStudents(prev => prev.map(s => s._id === editStudentTarget._id ? { ...s, ...data.student } : s));
                setEditStudentTarget(null);
                // Update stats
                const statsRes = await axios.get(`${API_BASE}/stats`, config);
                if (statsRes.data.success) setStats(statsRes.data.stats);
            } else {
                setEditStudentError(data.message);
            }
        } catch (err: any) {
            setEditStudentError(err.response?.data?.message || 'Update failed');
        } finally {
            setEditStudentLoading(false);
        }
    };

    const handleApprove = async (studentId: string, status: string) => {
        try {
            const { data } = await axios.post(`${API_BASE}/approve-internship`, { studentId, status }, config);
            if (data.success) {
                setStudents(prev => prev.map(s => s._id === studentId ? { ...s, internshipStatus: status, pipeline: { ...s.pipeline, applicationStatus: status } } : s));
            }
        } catch (err) { console.error(err); }
    };

    const handleVerifyAgreement = async (agreementId: string, status: string) => {
        try {
            await axios.post(`${API_BASE}/verify-agreement`, { agreementId, status }, config);
            setAgreements(prev => prev.filter(a => a._id !== agreementId));
        } catch (err) { console.error(err); }
    };


    const handleChangeSupervisor = async (e: React.FormEvent) => {
        e.preventDefault();
        setChangeSupervisorLoading(true);
        setChangeSupervisorError('');
        try {
            const { data } = await axios.post(`${API_BASE}/change-supervisor`, { studentId: changeSupervisorTarget._id, newSupervisorId: changeSupervisorId }, config);
            if (data.success) {
                setStudents(prev => prev.map(s => s._id === changeSupervisorTarget._id ? { ...s, supervisorId: faculty.find(f => f._id === changeSupervisorId) } : s));
                setChangeSupervisorTarget(null);
            }
        } catch (err: any) {
            setChangeSupervisorError(err.response?.data?.message || 'Reassignment failed');
        } finally { setChangeSupervisorLoading(false); }
    };

    const handleViewApp = async (studentId: string) => {
        setViewAppLoading(true);
        try {
            const { data } = await axios.get(`${API_BASE}/application/${studentId}`, config);
            if (data.success) setViewApp(data.application);
        } catch (err) { console.error(err); }
        finally { setViewAppLoading(false); }
    };

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        setCompanyLoading(true);
        setCompanyError('');
        try {
            const { data } = await axios.post(`${API_BASE}/companies`, newCompany, config);
            if (data.success) {
                setPartneredCompanies(prev => [...prev, { ...data.company, company: data.company.name, name: 'Manual Entry', isManual: true }]);
                setShowAddCompanyModal(false);
                setNewCompany({ name: '', email: '', website: '', phone: '', address: '' });
            }
        } catch (err: any) {
            setCompanyError(err?.response?.data?.message || 'Failed to add company.');
        } finally {
            setCompanyLoading(false);
        }
    };

    const handleDeleteCompany = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this partnered company? This will also clear all student assignments for this company.')) return;
        try {
            const { data } = await axios.delete(`${API_BASE}/companies/${id}`, config);
            if (data.success) {
                setPartneredCompanies(prev => prev.filter((c: any) => c._id !== id));
                // Update stats
                const statsRes = await axios.get(`${API_BASE}/stats`, config);
                if (statsRes.data.success) setStats(statsRes.data.stats);
            }
        } catch (err: any) {
            const status = err.response?.status;
            const message = err.response?.data?.message || '';
            if (status === 404 && message.includes('not found')) {
                // Record is already gone — remove from UI and refresh
                setPartneredCompanies(prev => prev.filter((c: any) => c._id !== id));
            } else if (message.includes('Representative')) {
                // This is a company_admin supervisor — tell the user where to delete it
                alert(message);
            } else {
                alert(message || 'Failed to remove partnered company');
            }
        }
    };

    const handleDeleteReport = async (reportId: string) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;
        try {
            const { data } = await axios.delete(`${API_BASE}/reports/${reportId}`, config);
            if (data.success) {
                setReports(prev => prev.filter((r: any) => r._id !== reportId));
                setSelectedReport(null);
            }
        } catch (err) { console.error(err); }
    };

    const handleUpdateReport = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditReportLoading(true);
        setEditReportError('');
        try {
            const { data } = await axios.put(`${API_BASE}/reports/${editReport._id}`, editReportForm, config);
            if (data.success) {
                setReports(prev => prev.map(r => r._id === editReport._id ? data.report : r));
                setEditReport(null);
                setSelectedReport(null);
            }
        } catch (err: any) {
            setEditReportError(err.response?.data?.message || 'Update failed');
        } finally { setEditReportLoading(false); }
    };


    const isSuperAdmin = user?.role === 'super_admin';

    return (
        <div className="flex h-screen bg-blue-50/40 overflow-hidden">
            <AdminSidebar activeTab={activeTab} setActiveTab={(tab) => setActiveTab(tab as AdminTab)} isSuperAdmin={isSuperAdmin} user={user} logout={logout} />

            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white/90 px-8 backdrop-blur-xl border-b border-blue-50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
                            Admin / {activeTab}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                            <div className="text-right">
                                <p className="text-xs font-black text-slate-900 leading-none">{user?.name}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-blue-500 mt-1">{user?.role?.replace('_', ' ')}</p>
                            </div>
                            <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs uppercase shadow-lg shadow-blue-500/20">
                                {user?.name?.[0]}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 pb-20">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[60vh] items-center justify-center">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                            </motion.div>
                        ) : (
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                                {activeTab === 'overview' && <OverviewTab stats={stats} recentActivity={recentActivity} />}
                                {activeTab === 'students' && (
                                    <StudentsTab
                                        students={students}
                                        isSuperAdmin={isSuperAdmin}
                                        setSelectedStudent={setSelectedStudent}
                                        setChangeSupervisorTarget={setChangeSupervisorTarget}
                                        setChangeSupervisorId={setChangeSupervisorId}
                                        setDeleteStudentTarget={setDeleteStudentTarget}
                                        setEditStudentTarget={(stu) => {
                                            setEditStudentTarget(stu);
                                            setEditStudentForm({
                                                assignedCompany: stu.assignedCompany || '',
                                                assignedPosition: stu.assignedPosition || '',
                                                siteSupervisorName: stu.siteSupervisorName || '',
                                                siteSupervisorEmail: stu.siteSupervisorEmail || '',
                                                siteSupervisorPhone: stu.siteSupervisorPhone || '',
                                                internshipStatus: stu.internshipStatus || ''
                                            });
                                        }}
                                        handleResendStudentEmail={handleResendStudentEmail}
                                    />
                                )}
                                {activeTab === 'reports' && <ReportsTab reports={reports} handleDeleteReport={handleDeleteReport} setSelectedReport={setSelectedReport} setEditReport={(r) => { setEditReport(r); setEditReportForm({ summary: r.summary, overallRating: r.overallRating, recommendation: r.recommendation, completionStatus: r.completionStatus, scores: r.scores || {} }); }} />}
                                {activeTab === 'faculty' && isSuperAdmin && <FacultyTab faculty={faculty} companyAdmins={companyAdmins} setShowAddAdminModal={setShowAddAdminModal} setEditFaculty={setEditFaculty} setEditFacultyForm={setEditFacultyForm} setDeleteFaculty={setDeleteFaculty} handleResendInvitation={handleResendInvitation} />}
                                {activeTab === 'companies' && isSuperAdmin && <CompaniesTab companies={partneredCompanies} setShowAddCompanyModal={setShowAddCompanyModal} handleDeleteCompany={handleDeleteCompany} />}
                                {activeTab === 'approvals' && isSuperAdmin && <ApprovalsTab students={students} handleViewApp={handleViewApp} viewAppLoading={viewAppLoading} handleApprove={handleApprove} />}
                                {activeTab === 'agreements' && isSuperAdmin && <AgreementsTab agreements={agreements} handleVerifyAgreement={handleVerifyAgreement} />}
                                {activeTab === 'settings' && (
                                    <div className="h-[60vh] rounded-2xl border-2 border-dashed border-blue-100 bg-white flex items-center justify-center text-center">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-300">Configuration</p>
                                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest italic">SuperAdmin Console</h2>
                                            <p className="text-xs font-bold text-slate-400 mt-2 max-w-xs mx-auto">Access system configurations and security protocols here.</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <StudentProfileModal selectedStudent={selectedStudent} setSelectedStudent={setSelectedStudent} setChangeSupervisorTarget={setChangeSupervisorTarget} setChangeSupervisorId={setChangeSupervisorId} />
            <ReportDetailsModal
                selectedReport={selectedReport}
                setSelectedReport={setSelectedReport}
                handleDeleteReport={handleDeleteReport}
                setEditReport={(r) => { setEditReport(r); setEditReportForm({ summary: r.summary, overallRating: r.overallRating, recommendation: r.recommendation, completionStatus: r.completionStatus, scores: r.scores || {} }); }}
            />
            <EditReportModal
                editReport={editReport}
                setEditReport={setEditReport}
                editReportForm={editReportForm}
                setEditReportForm={setEditReportForm}
                handleUpdateReport={handleUpdateReport}
                editReportLoading={editReportLoading}
                editReportError={editReportError}
            />
            <AdminDashboardModals
                {...{
                    showAddAdminModal, setShowAddAdminModal, newAdmin, setNewAdmin, partneredCompanies, handleCreateAdmin,
                    editFaculty, setEditFaculty, editFacultyForm, setEditFacultyForm, handleUpdateFaculty, editFacultyLoading, editFacultyError,
                    deleteFaculty, setDeleteFaculty, handleDeleteFaculty, deleteFacultyLoading,
                    viewApp, setViewApp,
                    deleteStudent: deleteStudentTarget, setDeleteStudent: setDeleteStudentTarget, handleDeleteStudent, deleteStudentLoading,
                    faculty,
                    changeSupervisorTarget, setChangeSupervisorTarget, changeSupervisorId, setChangeSupervisorId, changeSupervisorLoading, changeSupervisorError, handleChangeSupervisor,
                    editStudentTarget, setEditStudentTarget, editStudentForm, setEditStudentForm, handleEditStudent, editStudentLoading, editStudentError,
                    apiBase: API_BASE,
                    config,
                    setPartneredCompanies
                }}
            />

            <AnimatePresence>
                {showAddCompanyModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => setShowAddCompanyModal(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest italic">Add Partner</h3>
                                <button onClick={() => setShowAddCompanyModal(false)} className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"><X className="h-4 w-4" /></button>
                            </div>
                            <form onSubmit={handleCreateCompany} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Company Name</label>
                                    <input required value={newCompany.name} onChange={e => setNewCompany({ ...newCompany, name: e.target.value })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300" placeholder="e.g. Google" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Industry Email (Optional)</label>
                                    <input type="email" value={newCompany.email} onChange={e => setNewCompany({ ...newCompany, email: e.target.value })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300" placeholder="hr@company.com" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Website</label>
                                        <input value={newCompany.website} onChange={e => setNewCompany({ ...newCompany, website: e.target.value })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300" placeholder="company.com" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Phone</label>
                                        <input value={newCompany.phone} onChange={e => setNewCompany({ ...newCompany, phone: e.target.value })} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300" placeholder="+1..." />
                                    </div>
                                </div>
                                {companyError && <p className="text-xs font-bold text-red-500 bg-red-50 p-4 rounded-xl">{companyError}</p>}
                                <button type="submit" disabled={companyLoading} className="w-full h-14 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50">
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

export default AdminDashboard;
