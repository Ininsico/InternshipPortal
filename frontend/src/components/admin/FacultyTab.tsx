import { Search, UserPlus, Pencil, Trash2, Mail, ShieldCheck } from 'lucide-react';
import StatusPill from '../StatusPill';

interface FacultyTabProps {
    faculty: any[];
    companyAdmins: any[];
    setShowAddAdminModal: (show: boolean) => void;
    setEditFaculty: (faculty: any) => void;
    setEditFacultyForm: (form: any) => void;
    setDeleteFaculty: (faculty: any) => void;
}

const FacultyTab = ({
    faculty,
    companyAdmins,
    setShowAddAdminModal,
    setEditFaculty,
    setEditFacultyForm,
    setDeleteFaculty
}: FacultyTabProps) => {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">User Management</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Manage system administrators and staff</p>
                </div>
                <button
                    onClick={() => setShowAddAdminModal(true)}
                    className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                    <UserPlus className="h-4 w-4" /> Add Administrator
                </button>
            </div>

            <div className="space-y-12">
                <section>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                        Faculty Supervisors
                        <span className="h-5 px-2 rounded-md bg-slate-100 text-slate-500 flex items-center">{faculty.length}</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {faculty.map((f: any) => (
                            <div key={f._id} className="group rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm hover:border-blue-100 transition-all hover:shadow-xl hover:shadow-blue-500/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                        <button
                                            onClick={() => { setEditFaculty(f); setEditFacultyForm({ name: f.name, email: f.email }); }}
                                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteFaculty(f)}
                                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <h4 className="text-lg font-black text-slate-900 mb-1">{f.name}</h4>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                    <Mail className="h-3 w-3" /> {f.email}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-50">
                                    <StatusPill status="Faculty Member" />
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
                            <div key={ca._id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:border-blue-100 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <StatusPill status="Staff" />
                                </div>
                                <h4 className="text-base font-black text-slate-900">{ca.name}</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{ca.email}</p>
                                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-600">
                                    <ShieldCheck className="h-3.5 w-3.5" />{ca.company || 'No company set'}
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
