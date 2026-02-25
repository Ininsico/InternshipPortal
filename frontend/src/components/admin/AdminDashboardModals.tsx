import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Paperclip, User, ShieldCheck, Loader2 } from 'lucide-react';

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

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
const Input = ({ label, ...props }: InputProps) => (
    <div className="space-y-2.5">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 font-display">{label}</label>
        <div className="relative group">
            <input
                {...props}
                required
                className="w-full h-14 rounded-2xl bg-slate-50 border-2 border-transparent px-6 text-[13px] font-bold text-slate-900 outline-none focus:border-blue-500/30 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-300 font-display"
            />
        </div>
    </div>
);

const AdminDashboardModals = (props: ModalsProps) => {
    return (
        <>
            {/* ── Create Admin / Company Staff ── */}
            <AnimatePresence>
                {props.showAddAdminModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4" onClick={() => props.setShowAddAdminModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="w-full max-w-md rounded-[2.5rem] bg-white p-8 md:p-10 shadow-2xl max-h-[90vh] overflow-y-auto ring-1 ring-slate-100"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight font-display uppercase">Add Personnel</h3>
                                    <p className="text-[10px] font-black text-blue-500 mt-2 uppercase tracking-[0.2em] font-display italic">System Registration</p>
                                </div>
                                <button onClick={() => props.setShowAddAdminModal(false)} className="h-10 w-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-100"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={props.handleCreateAdmin} className="space-y-8">
                                <Input label="Full Name" placeholder="Dr. John Doe" value={props.newAdmin.name} onChange={e => props.setNewAdmin({ ...props.newAdmin, name: e.target.value })} />
                                <Input label="Email Address" type="email" placeholder="john@university.edu" value={props.newAdmin.email} onChange={e => props.setNewAdmin({ ...props.newAdmin, email: e.target.value })} />
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 font-display">Account Role</label>
                                    <select
                                        value={props.newAdmin.role}
                                        onChange={e => props.setNewAdmin({ ...props.newAdmin, role: e.target.value })}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-2 border-transparent px-6 text-[13px] font-bold text-slate-900 outline-none focus:border-blue-500/30 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-display cursor-pointer"
                                    >
                                        <option value="admin">Faculty Supervisor</option>
                                        <option value="company_admin">Industry Partner</option>
                                    </select>
                                </div>
                                {props.newAdmin.role === 'company_admin' && (
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 font-display">Company Affiliation</label>
                                        <input
                                            required
                                            list="partnered-companies-list"
                                            placeholder="e.g. Systems Limited"
                                            value={props.newAdmin.company}
                                            onChange={e => props.setNewAdmin({ ...props.newAdmin, company: e.target.value })}
                                            className="w-full h-14 rounded-2xl bg-slate-50 border-2 border-transparent px-6 text-[13px] font-bold text-slate-900 outline-none focus:border-blue-500/30 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-300 font-display"
                                        />
                                        <datalist id="partnered-companies-list">
                                            {Array.isArray(props.partneredCompanies) && props.partneredCompanies.map((c: any, i: number) => (
                                                <option key={i} value={c.company} />
                                            ))}
                                        </datalist>
                                        <p className="text-[9px] font-bold text-slate-400 mt-3 px-1 italic">Type to match or register a new industry placement partner.</p>
                                    </div>
                                )}
                                <button type="submit" className="w-full h-16 rounded-[1.5rem] bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-2xl shadow-blue-500/20 font-display">Authorize Personnel</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Edit Faculty ── */}
            <AnimatePresence>
                {props.editFaculty && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4" onClick={() => props.setEditFaculty(null)}>
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="w-full max-w-md rounded-[2.5rem] bg-white p-8 md:p-10 shadow-2xl max-h-[90vh] overflow-y-auto ring-1 ring-slate-100"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight font-display uppercase">Edit Personnel</h3>
                                    <p className="text-[10px] font-black text-blue-500 mt-2 uppercase tracking-[0.2em] font-display italic">Update Records</p>
                                </div>
                                <button onClick={() => props.setEditFaculty(null)} className="h-10 w-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-100"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={props.handleUpdateFaculty} className="space-y-8">
                                <Input label="Full Name" value={props.editFacultyForm.name} onChange={e => props.setEditFacultyForm({ ...props.editFacultyForm, name: e.target.value })} />
                                <Input label="Email Address" type="email" value={props.editFacultyForm.email} onChange={e => props.setEditFacultyForm({ ...props.editFacultyForm, email: e.target.value })} />
                                {props.editFacultyError && (
                                    <div className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 p-5 rounded-2xl border border-red-100 font-display">
                                        ⚠️ Error: {props.editFacultyError}
                                    </div>
                                )}
                                <button disabled={props.editFacultyLoading} className="w-full h-16 rounded-[1.5rem] bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl font-display">
                                    {props.editFacultyLoading ? 'Processing Updates...' : 'Synchronize Changes'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Delete Faculty ── */}
            <AnimatePresence>
                {props.deleteFaculty && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4" onClick={() => props.setDeleteFaculty(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-[3rem] bg-white p-10 md:p-12 shadow-2xl text-center ring-1 ring-slate-100" onClick={e => e.stopPropagation()}>
                            <div className="h-24 w-24 bg-red-50 text-red-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner"><Trash2 className="h-11 w-11" /></div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter uppercase font-display">Revoke Access?</h3>
                            <p className="text-[13px] font-bold text-slate-400 mb-10 leading-relaxed font-display px-2">Are you sure you want to remove <span className="text-slate-900 font-black">"{props.deleteFaculty.name}"</span>? This will immediately terminate all system authorization.</p>
                            <div className="flex gap-4">
                                <button onClick={() => props.setDeleteFaculty(null)} className="flex-1 h-14 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-[.2em] text-slate-400 hover:bg-slate-50 transition-all font-display">Abort</button>
                                <button onClick={props.handleDeleteFaculty} disabled={props.deleteFacultyLoading} className="flex-1 h-14 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-[.2em] hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 font-display">
                                    {props.deleteFacultyLoading ? 'Terminating...' : 'Confirm Revocation'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Delete Student ── */}
            <AnimatePresence>
                {props.deleteStudent && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4" onClick={() => props.setDeleteStudent(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-[3rem] bg-white p-10 md:p-12 shadow-2xl text-center ring-1 ring-slate-100" onClick={e => e.stopPropagation()}>
                            <div className="h-24 w-24 bg-red-100 text-red-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner"><Trash2 className="h-11 w-11" /></div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter uppercase font-display">Permanent Wipe?</h3>
                            <p className="text-[13px] font-bold text-slate-400 mb-10 leading-relaxed font-display px-2">
                                Deleting <span className="text-slate-900 font-black">"{props.deleteStudent.name}"</span> will erase all associated dossiers, contracts, and evaluations. This is irreversible.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={() => props.setDeleteStudent(null)} className="flex-1 h-14 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-[.2em] text-slate-400 hover:bg-slate-50 transition-all font-display">Abort</button>
                                <button onClick={props.handleDeleteStudent} disabled={props.deleteStudentLoading} className="flex-1 h-14 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-[.2em] hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 font-display">
                                    {props.deleteStudentLoading ? 'Wiping Dossier...' : 'Confirm Deletion'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── View Application ── */}
            <AnimatePresence>
                {props.viewApp && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4" onClick={() => props.setViewApp(null)}>
                        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-2xl rounded-[3rem] bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ring-1 ring-slate-100" onClick={e => e.stopPropagation()}>
                            <div className="border-b border-slate-50 px-8 sm:px-12 py-8 flex items-center justify-between bg-slate-50/50 shrink-0">
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2 font-display italic">Internship Placement Dossier</p>
                                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter truncate font-display uppercase">{props.viewApp.companyName}</h3>
                                </div>
                                <button onClick={() => props.setViewApp(null)} className="h-12 w-12 flex items-center justify-center rounded-[1.25rem] bg-white text-slate-400 shadow-sm border border-slate-100 hover:text-slate-900 transition-all shrink-0 ml-6"><X className="h-6 w-6" /></button>
                            </div>
                            <div className="p-8 sm:p-12 space-y-10 sm:space-y-14 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12">
                                    <div className="col-span-2 sm:col-span-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 font-display">Designation</p>
                                        <p className="text-sm font-bold text-slate-900 font-display uppercase tracking-tight">{props.viewApp.position || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 font-display">Environment</p>
                                        <p className="text-sm font-bold text-slate-900 font-display uppercase tracking-tight">{props.viewApp.internshipType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 font-display">Tenure</p>
                                        <p className="text-sm font-bold text-slate-900 font-display uppercase tracking-tight">{props.viewApp.duration || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-display">Professional Scope</p>
                                    <div className="p-6 sm:p-8 rounded-[2rem] bg-slate-50 border border-slate-100 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                                        <p className="text-[13px] font-bold text-slate-600 leading-relaxed font-display italic">"{props.viewApp.description || 'Electronic dossier contains no descriptive content.'}"</p>
                                    </div>
                                </div>
                                <div className="space-y-6 pt-10 sm:pt-14 border-t border-slate-50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-display">Verified Attachments</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {props.viewApp.documents && props.viewApp.documents.length > 0 ? (
                                            props.viewApp.documents.map((doc: any, i: number) => (
                                                <a
                                                    key={i}
                                                    href={doc.url.startsWith('http') ? doc.url : `${props.apiBase}${doc.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-500/20 hover:bg-blue-50/30 transition-all group shadow-sm"
                                                >
                                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                                        <Paperclip className="w-5 h-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-widest font-display leading-none mb-2">{doc.name || 'Supporting Document'}</p>
                                                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] font-display leading-none">Download File →</p>
                                                    </div>
                                                </a>
                                            ))
                                        ) : (
                                            <div className="col-span-2 py-12 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                                                <Paperclip className="w-10 h-10 text-slate-200 mb-4" />
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-display">No supporting documents found</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-10 border-t border-slate-100">
                                        <div className="flex flex-wrap items-center justify-between gap-6 px-2">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 font-display">Submission Timestamp</p>
                                                <p className="text-[11px] font-black text-slate-900 font-display uppercase">{new Date(props.viewApp.createdAt).toLocaleString(undefined, { dateStyle: 'long' })}</p>
                                            </div>
                                            <div className="sm:text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 font-display">Validation Status</p>
                                                <div className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] font-display shadow-lg shadow-blue-500/20">
                                                    {props.viewApp.status}
                                                </div>
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
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4" onClick={() => props.setChangeSupervisorTarget(null)}>
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="w-full max-w-md rounded-[3rem] bg-white p-10 md:p-12 shadow-2xl border border-slate-100 ring-1 ring-slate-100"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic font-display leading-tight">Reassign Control</h3>
                                    <p className="text-[10px] font-black text-blue-600 mt-2 uppercase tracking-[0.3em] font-display flex items-center gap-2">
                                        <User className="h-3 w-3" /> {props.changeSupervisorTarget.name}
                                    </p>
                                </div>
                                <button onClick={() => props.setChangeSupervisorTarget(null)} className="h-12 w-12 flex items-center justify-center rounded-[1.25rem] bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-100">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={props.handleChangeSupervisor} className="space-y-10">
                                <div className="space-y-8">
                                    {/* Current Supervisor Card */}
                                    <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 h-24 w-24 bg-slate-100 rounded-bl-[4rem] group-hover:bg-blue-50 transition-colors" />
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 font-display">Current Faculty Lead</p>
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="h-12 w-12 rounded-[1rem] bg-white border border-slate-200 text-slate-300 flex items-center justify-center shadow-sm font-display font-black text-sm">
                                                {props.changeSupervisorTarget.supervisorId?.name?.[0] || '?'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 font-display uppercase tracking-tight">
                                                    {props.changeSupervisorTarget.supervisorId?.name || 'Unassigned System Record'}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 font-display mt-1">
                                                    {props.changeSupervisorTarget.supervisorId?.email || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 font-display">Target Faculty Supervisor</label>
                                        <div className="relative group">
                                            <select
                                                required
                                                value={props.changeSupervisorId}
                                                onChange={e => props.setChangeSupervisorId(e.target.value)}
                                                className="w-full h-16 rounded-2xl bg-slate-50 border-2 border-transparent px-6 text-[13px] font-bold text-slate-900 outline-none focus:border-blue-500/30 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none cursor-pointer font-display"
                                            >
                                                <option value="">— Select Authorized Personnel —</option>
                                                {props.faculty.map(f => (
                                                    <option key={f._id} value={f._id}>
                                                        {f.name} • {f.email.split('@')[0]}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                                <ShieldCheck className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {props.changeSupervisorError ? (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 p-6 rounded-[1.5rem] border border-red-100 font-display">
                                        ⚠️ Fatal Configuration: {props.changeSupervisorError}
                                    </motion.div>
                                ) : (
                                    <div className="p-6 rounded-[1.5rem] bg-blue-50/50 border border-blue-100/30">
                                        <p className="text-[9px] font-bold text-blue-600/70 leading-relaxed font-display italic tracking-wide">
                                            * Reassignment will migrate all active evaluation duties and reporting oversight to the selected faculty member immediately.
                                        </p>
                                    </div>
                                )}

                                <button
                                    disabled={props.changeSupervisorLoading}
                                    className="w-full h-18 rounded-[2rem] bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 font-display italic"
                                >
                                    {props.changeSupervisorLoading ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        'Commit Assignment'
                                    )}
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
