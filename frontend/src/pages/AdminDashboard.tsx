import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

// Components
import AdminSidebar from '../components/admin/AdminSidebar';
import OverviewTab from '../components/admin/OverviewTab';
import StudentsTab from '../components/admin/StudentsTab';
import ReportsTab from '../components/admin/ReportsTab';
import FacultyTab from '../components/admin/FacultyTab';
import ApprovalsTab from '../components/admin/ApprovalsTab';
import AgreementsTab from '../components/admin/AgreementsTab';
import AssignmentsTab from '../components/admin/AssignmentsTab';
import StudentProfileModal from '../components/admin/StudentProfileModal';
import ReportDetailsModal from '../components/admin/ReportDetailsModal';
import EditReportModal from '../components/admin/EditReportModal';
import SubmissionsTab from '../components/admin/SubmissionsTab';
import EditSubmissionGradeModal from '../components/admin/EditSubmissionGradeModal';
import AdminDashboardModals from '../components/admin/AdminDashboardModals';

type AdminTab = 'overview' | 'students' | 'faculty' | 'companies' | 'reports' | 'settings' | 'approvals' | 'agreements' | 'assignments' | 'submissions';

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
    const [companyAdmins, setCompanyAdmins] = useState<any[]>([]);
    const [partneredCompanies, setPartneredCompanies] = useState<string[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);

    // Modals State
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

    const [viewApp, setViewApp] = useState<any | null>(null);
    const [viewAppLoading, setViewAppLoading] = useState(false);

    const [assignTarget, setAssignTarget] = useState<any | null>(null);
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

    const [changeSupervisorTarget, setChangeSupervisorTarget] = useState<any | null>(null);
    const [changeSupervisorId, setChangeSupervisorId] = useState('');
    const [changeSupervisorLoading, setChangeSupervisorLoading] = useState(false);
    const [changeSupervisorError, setChangeSupervisorError] = useState('');

    const [editReport, setEditReport] = useState<any | null>(null);
    const [editReportForm, setEditReportForm] = useState({ summary: '', overallRating: 0, recommendation: '', completionStatus: '', scores: {} });
    const [editReportLoading, setEditReportLoading] = useState(false);
    const [editReportError, setEditReportError] = useState('');

    const [editSubmission, setEditSubmission] = useState<any | null>(null);
    const [editSubmissionForm, setEditSubmissionForm] = useState({ facultyGrade: { marks: 0 }, companyGrade: { marks: 0 }, status: '' });
    const [editSubmissionLoading, setEditSubmissionLoading] = useState(false);
    const [editSubmissionError, setEditSubmissionError] = useState('');

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
                    const [facultyRes, agreementsRes, verifiedRes, companyAdminRes, reportsRes, partneredRes, submissionsRes] = await Promise.all([
                        axios.get(`${API_BASE}/faculty`, config),
                        axios.get(`${API_BASE}/agreements`, config),
                        axios.get(`${API_BASE}/verified-students`, config),
                        axios.get(`${API_BASE}/company-admins`, config),
                        axios.get(`${API_BASE}/reports`, config),
                        axios.get(`${API_BASE}/partnered-companies`, config),
                        axios.get(`${API_BASE}/submissions`, config),
                    ]);
                    if (facultyRes.data.success) setFaculty(facultyRes.data.admins);
                    if (agreementsRes.data.success) setAgreements(agreementsRes.data.agreements);
                    if (verifiedRes.data.success) setVerifiedStudents(verifiedRes.data.students);
                    if (companyAdminRes.data.success) setCompanyAdmins(companyAdminRes.data.admins);
                    if (reportsRes.data.success) setReports(reportsRes.data.reports);
                    if (partneredRes.data.success) setPartneredCompanies(partneredRes.data.companies);
                    if (submissionsRes.data.success) setSubmissions(submissionsRes.data.submissions);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, user?.role]);

    // Handlers
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
                setFaculty(prev => prev.filter(f => f._id !== deleteFaculty._id));
                setDeleteFaculty(null);
            }
        } catch (err) { console.error(err); }
        finally { setDeleteFacultyLoading(false); }
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
            const { data } = await axios.post(`${API_BASE}/verify-agreement`, { agreementId, status }, config);
            if (data.success) {
                setAgreements(prev => prev.filter(a => a._id !== agreementId));
                if (status === 'verified') {
                    const vRes = await axios.get(`${API_BASE}/verified-students`, config);
                    if (vRes.data.success) setVerifiedStudents(vRes.data.students);
                }
            }
        } catch (err) { console.error(err); }
    };

    const handleAssignInternship = async (e: React.FormEvent) => {
        e.preventDefault();
        setAssignLoading(true);
        setAssignError('');
        try {
            const { data } = await axios.post(`${API_BASE}/assign-student`, { studentId: assignTarget._id, ...assignForm }, config);
            if (data.success) {
                setVerifiedStudents(prev => prev.filter(s => s._id !== assignTarget._id));
                setAssignTarget(null);
            }
        } catch (err: any) {
            setAssignError(err.response?.data?.message || 'Assignment failed');
        } finally { setAssignLoading(false); }
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
            const { data } = await axios.get(`${API_BASE}/student-application/${studentId}`, config);
            if (data.success) setViewApp(data.application);
        } catch (err) { console.error(err); }
        finally { setViewAppLoading(false); }
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

    const handleUpdateSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditSubmissionLoading(true);
        setEditSubmissionError('');
        try {
            const { data } = await axios.put(`${API_BASE}/submissions/${editSubmission._id}/grade`, editSubmissionForm, config);
            if (data.success) {
                setSubmissions(prev => prev.map(s => s._id === editSubmission._id ? data.submission : s));
                setEditSubmission(null);
            }
        } catch (err: any) {
            setEditSubmissionError(err.response?.data?.message || 'Update failed');
        } finally { setEditSubmissionLoading(false); }
    };

    const isSuperAdmin = user?.role === 'super_admin';

    return (
        <div className="flex h-screen bg-slate-900 overflow-hidden">
            <AdminSidebar activeTab={activeTab} setActiveTab={(tab) => setActiveTab(tab as AdminTab)} isSuperAdmin={isSuperAdmin} user={user} logout={logout} />

            <main className="flex-1 bg-white rounded-l-[3rem] my-4 overflow-y-auto custom-scrollbar shadow-2xl relative z-10">
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-white/80 px-10 backdrop-blur-xl border-b border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                            Environment / {activeTab}
                        </h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                            <div className="text-right">
                                <p className="text-xs font-black text-slate-900 leading-none">{user?.name}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-blue-600 mt-1">{user?.role?.replace('_', ' ')}</p>
                            </div>
                            <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs uppercase italic shadow-lg shadow-blue-500/20">
                                {user?.name?.[0]}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-10 pb-20">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[60vh] items-center justify-center">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                            </motion.div>
                        ) : (
                            <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.4 }}>
                                {activeTab === 'overview' && <OverviewTab stats={stats} recentActivity={recentActivity} setShowAddAdminModal={setShowAddAdminModal} />}
                                {activeTab === 'students' && <StudentsTab students={students} isSuperAdmin={isSuperAdmin} setSelectedStudent={setSelectedStudent} setChangeSupervisorTarget={setChangeSupervisorTarget} setChangeSupervisorId={setChangeSupervisorId} />}
                                {activeTab === 'reports' && <ReportsTab reports={reports} handleDeleteReport={handleDeleteReport} setSelectedReport={setSelectedReport} setEditReport={(r) => { setEditReport(r); setEditReportForm({ summary: r.summary, overallRating: r.overallRating, recommendation: r.recommendation, completionStatus: r.completionStatus, scores: r.scores || {} }); }} />}
                                {activeTab === 'faculty' && isSuperAdmin && <FacultyTab faculty={faculty} companyAdmins={companyAdmins} setShowAddAdminModal={setShowAddAdminModal} setEditFaculty={setEditFaculty} setEditFacultyForm={setEditFacultyForm} setDeleteFaculty={setDeleteFaculty} />}
                                {activeTab === 'approvals' && isSuperAdmin && <ApprovalsTab students={students} handleViewApp={handleViewApp} viewAppLoading={viewAppLoading} handleApprove={handleApprove} />}
                                {activeTab === 'agreements' && isSuperAdmin && <AgreementsTab agreements={agreements} handleVerifyAgreement={handleVerifyAgreement} />}
                                {activeTab === 'assignments' && isSuperAdmin && <AssignmentsTab verifiedStudents={verifiedStudents} setAssignTarget={setAssignTarget} setAssignForm={setAssignForm} setAssignError={setAssignError} />}
                                {activeTab === 'submissions' && isSuperAdmin && <SubmissionsTab submissions={submissions} setEditSubmission={(s) => { setEditSubmission(s); setEditSubmissionForm({ facultyGrade: s.facultyGrade || { marks: 0 }, companyGrade: s.companyGrade || { marks: 0 }, status: s.status }); }} />}
                                {activeTab === 'settings' && (
                                    <div className="h-[60vh] rounded-[3rem] border-2 border-dashed border-slate-100 flex items-center justify-center text-center">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Section Modules</p>
                                            <h3 className="text-xl font-black text-slate-900 mt-4 italic tracking-tight uppercase">System Settings</h3>
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
            <EditSubmissionGradeModal
                editSubmission={editSubmission}
                setEditSubmission={setEditSubmission}
                editSubmissionForm={editSubmissionForm}
                setEditSubmissionForm={setEditSubmissionForm}
                handleUpdateSubmission={handleUpdateSubmission}
                editSubmissionLoading={editSubmissionLoading}
                editSubmissionError={editSubmissionError}
            />
            <AdminDashboardModals
                {...{
                    showAddAdminModal, setShowAddAdminModal, newAdmin, setNewAdmin, partneredCompanies, handleCreateAdmin,
                    editFaculty, setEditFaculty, editFacultyForm, setEditFacultyForm, handleUpdateFaculty, editFacultyLoading, editFacultyError,
                    deleteFaculty, setDeleteFaculty, handleDeleteFaculty, deleteFacultyLoading,
                    viewApp, setViewApp,
                    assignTarget, setAssignTarget, assignForm, setAssignForm, faculty, partneredCompaniesList: partneredCompanies, assignLoading, assignError, handleAssignInternship,
                    changeSupervisorTarget, setChangeSupervisorTarget, changeSupervisorId, setChangeSupervisorId, changeSupervisorLoading, changeSupervisorError, handleChangeSupervisor
                }}
            />
        </div>
    );
};

export default AdminDashboard;
