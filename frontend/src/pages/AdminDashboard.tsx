import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Loader2, Menu, LogOut } from 'lucide-react';

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
import PlacementSyncTab from '../components/admin/PlacementSyncTab';
import { useAdminStore, type AdminTab } from '../store/adminStore';



import API from '../config/api';

const API_BASE = API.ADMIN;

const AdminDashboard = () => {
    const { user, token, logout } = useAuth();
    const {
        activeTab, setActiveTab,
        students, setStudents,
        faculty, setFaculty,
        reports, setReports,
        agreements, setAgreements,
        partneredCompanies, setPartneredCompanies
    } = useAdminStore();
    const isSuperAdmin = user?.role === 'super_admin';
    const [loading, setLoading] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'admin', company: '' });

    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [selectedReport, setSelectedReport] = useState<any | null>(null);

    const [editFaculty, setEditFaculty] = useState<any | null>(null);
    const [editFacultyForm, setEditFacultyForm] = useState({ name: '', email: '' });
    const [editFacultyLoading, setEditFacultyLoading] = useState(false);
    const [editFacultyError, setEditFacultyError] = useState('');

    const [deleteFaculty, setDeleteFaculty] = useState<any | null>(null);
    const [deleteFacultyLoading] = useState(false);

    const [deleteStudentTarget, setDeleteStudentTarget] = useState<any | null>(null);
    const [deleteStudentLoading, setDeleteStudentLoading] = useState(false);

    const [syncingStudent, setSyncingStudent] = useState<any | null>(null);
    const queryClient = useQueryClient();





    const [showInlineAddCompany, setShowInlineAddCompany] = useState(false);
    const [newCompany, setNewCompany] = useState({ name: '', email: '', website: '', phone: '', address: '' });
    const [companyLoading, setCompanyLoading] = useState(false);
    const [companyError, setCompanyError] = useState('');

    const [showInlineAddStaff, setShowInlineAddStaff] = useState(false);

    const [changeSupervisorTarget, setChangeSupervisorTarget] = useState<any | null>(null);
    const [changeSupervisorId, setChangeSupervisorId] = useState('');
    const [changeSupervisorLoading, setChangeSupervisorLoading] = useState(false);
    const [changeSupervisorError, setChangeSupervisorError] = useState('');

    const [editReport, setEditReport] = useState<any | null>(null);
    const [editReportForm, setEditReportForm] = useState({ summary: '', overallRating: 0, recommendation: '', completionStatus: '', scores: {} });
    const [editReportLoading, setEditReportLoading] = useState(false);
    const [editReportError, setEditReportError] = useState('');

    const [fetchedTabs, setFetchedTabs] = useState<Set<string>>(new Set());
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchTabData = async (tab: AdminTab, silent = false) => {
        if (!token) return;
        if (!silent && !fetchedTabs.has(tab)) setLoading(true);

        try {
            switch (tab) {
                case 'overview':
                    const stateRes = await axios.get(`${API_BASE}/dashboard-state`, config);
                    if (stateRes.data.success) {
                        setRecentActivity(stateRes.data.recentActivity);
                        // Pre-fill students if it's the first load and we are super admin
                        if (stateRes.data.initialStudents && stateRes.data.initialStudents.length > 0) {
                            setStudents(stateRes.data.initialStudents);
                        }
                    }
                    break;
                case 'students':
                case 'approvals':
                    const studentsRes = await axios.get(`${API_BASE}/students`, config);
                    if (studentsRes.data.success) setStudents(studentsRes.data.students);

                    if (user?.role === 'super_admin') {
                        const facultyRes = await axios.get(`${API_BASE}/faculty`, config);
                        if (facultyRes.data.success) setFaculty(facultyRes.data.admins);
                    }
                    break;
                case 'faculty':
                    // Handled by React Query in FacultyTab component
                    break;
                case 'agreements':
                    if (user?.role === 'super_admin') {
                        const aRes = await axios.get(`${API_BASE}/agreements`, config);
                        if (aRes.data.success) setAgreements(aRes.data.agreements);
                    }
                    break;
                case 'reports':
                    if (user?.role === 'super_admin') {
                        const rRes = await axios.get(`${API_BASE}/reports`, config);
                        if (rRes.data.success) setReports(rRes.data.reports);
                    }
                    break;
                case 'companies':
                    if (user?.role === 'super_admin') {
                        const pRes = await axios.get(`${API_BASE}/partnered-companies`, config);
                        if (pRes.data.success) setPartneredCompanies(pRes.data.companies);
                    }
                    break;
            }
            setFetchedTabs(prev => new Set(prev).add(tab));
        } catch (err) {
            console.error(`Error fetching ${tab} data:`, err);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = (silent = false) => fetchTabData(activeTab, silent);

    useEffect(() => {
        if (token) {
            fetchTabData(activeTab);
        }
    }, [token, activeTab]);

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = { name: newAdmin.name, email: newAdmin.email, role: newAdmin.role };
            if (newAdmin.role === 'company_admin') payload.company = newAdmin.company;
            const { data } = await axios.post(`${API_BASE}/create-admin`, payload, config);
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['faculty'] });
                setShowAddAdminModal(false);
                setShowInlineAddStaff(false);
                setNewAdmin({ name: '', email: '', role: 'admin', company: '' });
                fetchData(true);
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
                queryClient.invalidateQueries({ queryKey: ['faculty'] }); // Invalidate faculty cache
                setEditFaculty(null);
                fetchData(true);
            }
        } catch (err: any) {
            setEditFacultyError(err.response?.data?.message || 'Update failed');
        } finally { setEditFacultyLoading(false); }
    };

    const deleteAdminMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`${API_BASE}/faculty/${id}`, config);
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['faculty'] });
            const previousData = queryClient.getQueryData(['faculty']);
            queryClient.setQueryData(['faculty'], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    total: old.total - 1,
                    data: old.data.filter((f: any) => f._id !== id)
                };
            });
            return { previousData };
        },
        onError: (_err, _id, context: any) => {
            queryClient.setQueryData(['faculty'], context.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['faculty'] });
            setDeleteFaculty(null);
            fetchData(true);
        },
    });

    const handleDeleteFaculty = () => {
        if (!deleteFaculty) return;
        deleteAdminMutation.mutate(deleteFaculty._id);
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
                setStudents((prev: any[]) => prev.filter(s => s._id !== deleteStudentTarget._id));
                setDeleteStudentTarget(null);
                fetchData(true);
            }
        } catch (err) { console.error(err); }
        finally { setDeleteStudentLoading(false); }
    };



    const handleApprove = async (studentId: string, status: string) => {
        try {
            const { data } = await axios.post(`${API_BASE}/approve-internship`, { studentId, status }, config);
            if (data.success) {
                setStudents((prev: any[]) => prev.map(s => s._id === studentId ? { ...s, internshipStatus: status, pipeline: { ...s.pipeline, applicationStatus: status } } : s));
                fetchData(true);
            }
        } catch (err) { console.error(err); }
    };

    const handleVerifyAgreement = async (agreementId: string, status: string) => {
        try {
            await axios.post(`${API_BASE}/verify-agreement`, { agreementId, status }, config);
            setAgreements((prev: any[]) => prev.filter(a => a._id !== agreementId));
            fetchData(true);
        } catch (err) { console.error(err); }
    };


    const handleChangeSupervisor = async (e: React.FormEvent) => {
        e.preventDefault();
        setChangeSupervisorLoading(true);
        setChangeSupervisorError('');
        try {
            const { data } = await axios.post(`${API_BASE}/change-supervisor`, { studentId: changeSupervisorTarget._id, newSupervisorId: changeSupervisorId }, config);
            if (data.success) {
                // Update local state and refresh
                setStudents((prev: any[]) => prev.map(s => s._id === changeSupervisorTarget._id ? { ...s, supervisorId: faculty.find((f: any) => f._id === changeSupervisorId) } : s));
                setChangeSupervisorTarget(null);
                fetchData(true);
            }
        } catch (err: any) {
            setChangeSupervisorError(err.response?.data?.message || 'Reassignment failed');
        } finally { setChangeSupervisorLoading(false); }
    };


    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        setCompanyLoading(true);
        setCompanyError('');
        try {
            const { data } = await axios.post(`${API_BASE}/companies`, newCompany, config);
            if (data.success) {
                setPartneredCompanies((prev: any[]) => [...prev, { ...data.company, company: data.company.name, name: 'Manual Entry', isManual: true }]);
                setShowInlineAddCompany(false);
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
                setPartneredCompanies((prev: any[]) => prev.filter((c: any) => c._id !== id));
                fetchData(true);
            }
        } catch (err: any) {
            const status = err.response?.status;
            const message = err.response?.data?.message || '';
            if (status === 404 && message.includes('not found')) {
                // Record is already gone — remove from UI and refresh
                setPartneredCompanies((prev: any[]) => prev.filter((c: any) => c._id !== id));
                fetchData(true);
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
                setReports((prev: any[]) => prev.filter((r: any) => r._id !== reportId));
                setSelectedReport(null);
                fetchData(true);
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
                setReports((prev: any[]) => prev.map(r => r._id === editReport._id ? data.report : r));
                setEditReport(null);
                setSelectedReport(null);
            }
        } catch (err: any) {
            setEditReportError(err.response?.data?.message || 'Update failed');
        } finally { setEditReportLoading(false); }
    };



    return (
        <div className="flex h-screen bg-blue-50/40 overflow-hidden">
            {/* Mobile sidebar overlay */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar — hidden on mobile unless toggled */}
            <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <AdminSidebar
                    activeTab={activeTab}
                    setActiveTab={(tab) => { setActiveTab(tab as AdminTab); setMobileSidebarOpen(false); }}
                    isSuperAdmin={isSuperAdmin}
                />
            </div>

            <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative overflow-y-auto">
                <header className="sticky top-0 z-30 flex h-24 w-full items-center justify-between border-b border-blue-50/50 bg-white/80 px-8 backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setMobileSidebarOpen(true)} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-600 shadow-sm lg:hidden hover:bg-slate-50 transition-colors">
                            <Menu className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-normal text-slate-900 capitalize tracking-tight leading-none">
                                {activeTab.replace('_', ' ')}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 h-12 px-8 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </header>


                <div className="p-8 pb-32 max-w-7xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[60vh] items-center justify-center">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                            </motion.div>
                        ) : !syncingStudent ? (
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                                {activeTab === 'overview' && <OverviewTab recentActivity={recentActivity} />}
                                {activeTab === 'students' && (
                                    <StudentsTab
                                        students={students}
                                        isSuperAdmin={isSuperAdmin}
                                        setChangeSupervisorTarget={setChangeSupervisorTarget}
                                        setChangeSupervisorId={setChangeSupervisorId}
                                        setDeleteStudentTarget={setDeleteStudentTarget}
                                        handleResendStudentEmail={handleResendStudentEmail}
                                        onSyncPlacement={(stu) => setSyncingStudent(stu)}
                                    />
                                )}
                                {activeTab === 'reports' && <ReportsTab reports={reports} handleDeleteReport={handleDeleteReport} setSelectedReport={setSelectedReport} setEditReport={(r) => { setEditReport(r); setEditReportForm({ summary: r.summary, overallRating: r.overallRating, recommendation: r.recommendation, completionStatus: r.completionStatus, scores: r.scores || {} }); }} />}
                                {activeTab === 'faculty' && isSuperAdmin && (
                                    <FacultyTab
                                        setShowAddAdminModal={setShowAddAdminModal}
                                        setEditFaculty={setEditFaculty}
                                        setEditFacultyForm={setEditFacultyForm}
                                        setDeleteFaculty={setDeleteFaculty}
                                        handleResendInvitation={handleResendInvitation}
                                        token={token || ''}
                                        showInlineAddStaff={showInlineAddStaff}
                                        setShowInlineAddStaff={setShowInlineAddStaff}
                                        newAdmin={newAdmin}
                                        setNewAdmin={setNewAdmin}
                                        partneredCompanies={partneredCompanies}
                                        handleCreateAdmin={handleCreateAdmin}
                                    />
                                )}
                                {activeTab === 'companies' && isSuperAdmin && (
                                    <CompaniesTab
                                        companies={partneredCompanies}
                                        handleDeleteCompany={handleDeleteCompany}
                                        showInlineAddCompany={showInlineAddCompany}
                                        setShowInlineAddCompany={setShowInlineAddCompany}
                                        newCompany={newCompany}
                                        setNewCompany={setNewCompany}
                                        handleCreateCompany={handleCreateCompany}
                                        companyLoading={companyLoading}
                                        companyError={companyError}
                                        token={token || ''}
                                    />
                                )}
                                {activeTab === 'approvals' && isSuperAdmin && <ApprovalsTab students={students} handleApprove={handleApprove} />}
                                {activeTab === 'agreements' && isSuperAdmin && <AgreementsTab agreements={agreements} handleVerifyAgreement={handleVerifyAgreement} />}

                            </motion.div>
                        ) : (
                            <motion.div
                                key="placement-sync"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="min-h-[60vh]"
                            >
                                <PlacementSyncTab
                                    student={syncingStudent}
                                    token={token}
                                    onClose={() => setSyncingStudent(null)}
                                    onSuccess={() => {
                                        setSyncingStudent(null);
                                        fetchData();
                                    }}
                                />
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
                    deleteStudent: deleteStudentTarget, setDeleteStudent: setDeleteStudentTarget, handleDeleteStudent, deleteStudentLoading,
                    faculty,
                    changeSupervisorTarget, setChangeSupervisorTarget, changeSupervisorId, setChangeSupervisorId, changeSupervisorLoading, changeSupervisorError, handleChangeSupervisor,
                    apiBase: API_BASE,
                    config,
                    setPartneredCompanies
                }}
            />


        </div>
    );
};

export default AdminDashboard;
