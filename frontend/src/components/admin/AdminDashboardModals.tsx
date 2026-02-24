import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Paperclip } from 'lucide-react';

interface ModalsProps {
    showAddAdminModal: boolean;
    setShowAddAdminModal: (v: boolean) => void;
    newAdmin: any;
    setNewAdmin: (v: any) => void;
    partneredCompanies: any[];
    handleCreateAdmin: (e: any) => void;

    editFaculty: any;
    setEditFaculty: (v: any) => void;
    editFacultyForm: any;
    setEditFacultyForm: (v: any) => void;
    handleUpdateFaculty: (e: any) => void;
    editFacultyLoading: boolean;
    editFacultyError: string;

    deleteFaculty: any;
    setDeleteFaculty: (v: any) => void;
    handleDeleteFaculty: () => void;
    deleteFacultyLoading: boolean;

    deleteStudent: any;
    setDeleteStudent: (v: any) => void;
    handleDeleteStudent: () => void;
    deleteStudentLoading: boolean;

    viewApp: any;
    setViewApp: (v: any) => void;

    faculty: any[];

    changeSupervisorTarget: any;
    setChangeSupervisorTarget: (v: any) => void;
    changeSupervisorId: string;
    setChangeSupervisorId: (v: string) => void;
    changeSupervisorLoading: boolean;
    changeSupervisorError: string;
    handleChangeSupervisor: (e: any) => void;

    apiBase: string;
    config: any;
    setPartneredCompanies: (v: any) => void;
}

// ─── Legacy Input (kept for other modals) ────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
const Input = ({ label, ...props }: InputProps) => (
    <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{label}</label>
        <input {...props} required className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300" />
    </div>
);

// ─── Main Modal Container ─────────────────────────────────────────────────────
const AdminDashboardModals = (props: ModalsProps) => {
    return (
        <>


            {/* ── Create Admin / Company Staff ── */}
            <AnimatePresence>
                {props.showAddAdminModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => props.setShowAddAdminModal(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6 md:mb-8">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest italic">Create Access</h3>
                                <button onClick={() => props.setShowAddAdminModal(false)} className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"><X className="h-4 w-4" /></button>
                            </div>
                            <form onSubmit={props.handleCreateAdmin} className="space-y-6">
                                <Input label="Full Name" placeholder="Dr. John Doe" value={props.newAdmin.name} onChange={e => props.setNewAdmin({ ...props.newAdmin, name: e.target.value })} />
                                <Input label="Email Address" type="email" placeholder="john@university.edu" value={props.newAdmin.email} onChange={e => props.setNewAdmin({ ...props.newAdmin, email: e.target.value })} />
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Account Role</label>
                                    <select
                                        value={props.newAdmin.role}
                                        onChange={e => props.setNewAdmin({ ...props.newAdmin, role: e.target.value })}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                    >
                                        <option value="admin">Faculty Supervisor</option>
                                        <option value="company_admin">Company Staff</option>
                                    </select>
                                </div>
                                {props.newAdmin.role === 'company_admin' && (
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Company Name</label>
                                        <input
                                            required
                                            list="partnered-companies-list"
                                            placeholder="e.g. Systems Limited"
                                            value={props.newAdmin.company}
                                            onChange={e => props.setNewAdmin({ ...props.newAdmin, company: e.target.value })}
                                            className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300"
                                        />
                                        <datalist id="partnered-companies-list">
                                            {Array.isArray(props.partneredCompanies) && props.partneredCompanies.map((c: any, i: number) => (
                                                <option key={i} value={c.company} />
                                            ))}
                                        </datalist>
                                        <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-widest px-2 italic">Select existing or type a new company name</p>
                                    </div>
                                )}
                                <button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">Complete Setup</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Edit Faculty ── */}
            <AnimatePresence>
                {props.editFaculty && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => props.setEditFaculty(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6 md:mb-8">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest italic">Edit Manager</h3>
                                <button onClick={() => props.setEditFaculty(null)} className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"><X className="h-4 w-4" /></button>
                            </div>
                            <form onSubmit={props.handleUpdateFaculty} className="space-y-6">
                                <Input label="Full Name" value={props.editFacultyForm.name} onChange={e => props.setEditFacultyForm({ ...props.editFacultyForm, name: e.target.value })} />
                                <Input label="Email Address" type="email" value={props.editFacultyForm.email} onChange={e => props.setEditFacultyForm({ ...props.editFacultyForm, email: e.target.value })} />
                                {props.editFacultyError && <p className="text-xs font-bold text-red-500 bg-red-50 p-4 rounded-xl">{props.editFacultyError}</p>}
                                <button disabled={props.editFacultyLoading} className="w-full h-14 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50">
                                    {props.editFacultyLoading ? 'Processing...' : 'Save Configuration'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Delete Faculty ── */}
            <AnimatePresence>
                {props.deleteFaculty && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => props.setDeleteFaculty(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-3xl bg-white p-6 md:p-10 shadow-2xl text-center max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 className="h-10 w-10" /></div>
                            <h3 className="text-xl font-black text-slate-900 mb-2 italic tracking-tight">Terminate Access?</h3>
                            <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed italic">Are you sure you want to remove <span className="text-slate-900 font-black">"{props.deleteFaculty.name}"</span>? This action will immediately revoke all system credentials.</p>
                            <div className="flex gap-4">
                                <button onClick={() => props.setDeleteFaculty(null)} className="flex-1 h-14 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Abort</button>
                                <button onClick={props.handleDeleteFaculty} disabled={props.deleteFacultyLoading} className="flex-1 h-14 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50">
                                    {props.deleteFacultyLoading ? 'Processing...' : 'Terminate Now'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Delete Student ── */}
            <AnimatePresence>
                {props.deleteStudent && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => props.setDeleteStudent(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-3xl bg-white p-6 md:p-10 shadow-2xl text-center max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="h-20 w-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 className="h-10 w-10" /></div>
                            <h3 className="text-xl font-black text-slate-900 mb-2 italic tracking-tight uppercase">System Wipeout?</h3>
                            <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed italic">
                                Are you sure you want to permanently delete <span className="text-slate-900 font-black">"{props.deleteStudent.name}"</span>?<br /><br />
                                <span className="text-red-500 font-black">WARNING:</span> This will wipe out all applications, agreements, submissions, and reports associated with this student. This cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={() => props.setDeleteStudent(null)} className="flex-1 h-14 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Abort</button>
                                <button onClick={props.handleDeleteStudent} disabled={props.deleteStudentLoading} className="flex-1 h-14 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50">
                                    {props.deleteStudentLoading ? 'Wiping Out...' : 'Complete Wipeout'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── View Application ── */}
            <AnimatePresence>
                {props.viewApp && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => props.setViewApp(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl rounded-[2rem] sm:rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="border-b border-slate-50 px-5 sm:px-10 py-5 sm:py-8 flex items-center justify-between bg-slate-50/50 shrink-0">
                                <div className="min-w-0">
                                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1 italic truncate">Internship Application Dossier</p>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 italic tracking-tight truncate">{props.viewApp.companyName}</h3>
                                </div>
                                <button onClick={() => props.setViewApp(null)} className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-white text-slate-400 shadow-sm hover:text-slate-900 transition-all shrink-0 ml-4"><X className="h-4 w-4 sm:h-5 sm:w-5" /></button>
                            </div>
                            <div className="p-5 sm:p-10 space-y-6 sm:space-y-10 overflow-y-auto italic">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
                                    <div className="col-span-2 sm:col-span-1">
                                        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 sm:mb-3">Position Title</p>
                                        <p className="text-xs sm:text-sm font-bold text-slate-900">{props.viewApp.position || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 sm:mb-3">Work Arrangement</p>
                                        <p className="text-xs sm:text-sm font-bold text-slate-900 capitalize">{props.viewApp.internshipType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 sm:mb-3">Duration</p>
                                        <p className="text-xs sm:text-sm font-bold text-slate-900">{props.viewApp.duration || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 sm:mb-3">Internship Description</p>
                                    <p className="text-xs sm:text-sm font-bold text-slate-600 leading-relaxed border-l-4 border-blue-100 pl-4 sm:pl-6 py-2">{props.viewApp.description || 'No description provided.'}</p>
                                </div>
                                <div className="grid grid-cols-1 gap-6 pt-6 sm:pt-10 border-t border-slate-50">
                                    <div>
                                        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Supporting Attachments</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {props.viewApp.documents && props.viewApp.documents.length > 0 ? (
                                                props.viewApp.documents.map((doc: any, i: number) => (
                                                    <a
                                                        key={i}
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                                                    >
                                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                                            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[9px] sm:text-[10px] font-black text-slate-900 truncate uppercase tracking-widest leading-none mb-1">{doc.name || 'Attachment'}</p>
                                                            <p className="text-[7px] sm:text-[8px] font-bold text-blue-500 uppercase tracking-widest leading-none">View Document →</p>
                                                        </div>
                                                    </a>
                                                ))
                                            ) : (
                                                <div className="col-span-2 py-8 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
                                                    <Paperclip className="w-8 h-8 text-slate-200 mb-2" />
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No attachments provided</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-slate-50">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div>
                                                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submission Record</p>
                                                <p className="text-xs sm:text-sm font-bold text-slate-900">{new Date(props.viewApp.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="sm:text-right">
                                                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verification Status</p>
                                                <p className="text-xs sm:text-sm font-black text-blue-600 uppercase tracking-widest">{props.viewApp.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Change Supervisor ── */}
            <AnimatePresence>
                {props.changeSupervisorTarget && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => props.setChangeSupervisorTarget(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest italic leading-none">Modify Supervisor</h3>
                                    <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">{props.changeSupervisorTarget.name}</p>
                                </div>
                                <button onClick={() => props.setChangeSupervisorTarget(null)} className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"><X className="h-4 w-4" /></button>
                            </div>
                            <form onSubmit={props.handleChangeSupervisor} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">New Faculty Supervisor</label>
                                    <select
                                        required
                                        value={props.changeSupervisorId}
                                        onChange={e => props.setChangeSupervisorId(e.target.value)}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-sans"
                                    >
                                        <option value="">— Select Supervisor —</option>
                                        {props.faculty.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                    </select>
                                </div>
                                {props.changeSupervisorError && <p className="text-xs font-bold text-red-500 bg-red-50 p-4 rounded-xl">{props.changeSupervisorError}</p>}
                                <button disabled={props.changeSupervisorLoading} className="w-full h-14 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50">
                                    {props.changeSupervisorLoading ? 'Processing...' : 'Confirm Reassignment'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AdminDashboardModals;
