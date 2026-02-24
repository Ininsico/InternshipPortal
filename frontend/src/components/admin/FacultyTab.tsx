import { UserPlus, Pencil, Trash2, Mail, ShieldCheck, RefreshCw } from 'lucide-react';
import StatusPill from '../StatusPill';

interface FacultyTabProps {
    faculty: any[];
    companyAdmins: any[];
    setShowAddAdminModal: (show: boolean) => void;
    setEditFaculty: (faculty: any) => void;
    setEditFacultyForm: (form: any) => void;
    setDeleteFaculty: (faculty: any) => void;
    handleResendInvitation: (adminId: string) => void;
    fetchData: (silent?: boolean) => void;
    setViewAdminStudents: (admin: any) => void;
}

const FacultyTab = ({
    faculty,
    companyAdmins,
    setShowAddAdminModal,
    setEditFaculty,
    setEditFacultyForm,
    setDeleteFaculty,
    handleResendInvitation,
    fetchData,
    setViewAdminStudents
}: FacultyTabProps) => {
    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">User Management</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Manage system administrators and staff</p>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={() => fetchData(true)}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 md:px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all"
                    >
                        <RefreshCw className="h-3 w-3" /> Refresh
                    </button>
                    <button
                        onClick={() => setShowAddAdminModal(true)}
                        className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 md:px-6 py-3 md:py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        <UserPlus className="h-4 w-4" /> <span className="hidden sm:inline">Add Administrator</span><span className="sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            <div className="space-y-12">
                <section>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                        Faculty Supervisors
                        <span className="h-5 px-2 rounded-md bg-slate-100 text-slate-500 flex items-center">{faculty.length}</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {faculty.map((f: any) => (
                            <div
                                key={f._id}
                                onClick={() => setViewAdminStudents(f)}
                                className="group rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm hover:border-blue-100 transition-all hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                        {!f.isActive && (
                                            <button
                                                onClick={() => handleResendInvitation(f._id)}
                                                className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                                title="Resend Invitation"
                                            >
                                                <Mail className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditFaculty(f); setEditFacultyForm({ name: f.name, email: f.email }); }}
                                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setDeleteFaculty(f); }}
                                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-lg font-black text-slate-900">{f.name}</h4>
                                    {!f.isActive && (
                                        <span className="text-[7px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">Pending</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                    <Mail className="h-3 w-3" /> {f.email}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <StatusPill status="Faculty Member" />
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">View Students →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                        Company Staff
                        <span className="h-5 px-2 rounded-md bg-slate-100 text-slate-500 flex items-center">{companyAdmins.length}</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {companyAdmins.map((ca: any) => (
                            <div
                                key={ca._id}
                                onClick={() => setViewAdminStudents(ca)}
                                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:border-blue-100 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <StatusPill status="Staff" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <h4 className="text-base font-black text-slate-900">{ca.name}</h4>
                                    {!ca.isActive && (
                                        <span className="text-[7px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">Pending</span>
                                    )}
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{ca.email}</p>
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-600">
                                        <ShieldCheck className="h-3.5 w-3.5" />{ca.company || 'No company set'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!ca.isActive && (
                                            <button
                                                onClick={() => handleResendInvitation(ca._id)}
                                                className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                title="Resend Invitation"
                                            >
                                                <Mail className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setDeleteFaculty(ca); }}
                                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                            title="Delete Admin"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default FacultyTab;
