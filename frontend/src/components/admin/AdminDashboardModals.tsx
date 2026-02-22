import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Loader2 } from 'lucide-react';


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

    assignTarget: any;
    setAssignTarget: (v: any) => void;
    assignForm: any;
    setAssignForm: (v: any) => void;
    faculty: any[];
    partneredCompaniesList: any[];
    assignLoading: boolean;
    assignError: string;
    handleAssignInternship: (e: any) => void;

    changeSupervisorTarget: any;
    setChangeSupervisorTarget: (v: any) => void;
    changeSupervisorId: string;
    setChangeSupervisorId: (v: string) => void;
    changeSupervisorLoading: boolean;
    changeSupervisorError: string;
    handleChangeSupervisor: (e: any) => void;
}

const AdminDashboardModals = (props: ModalsProps) => {
    return (
        <>

            <AnimatePresence>
                {props.showAddAdminModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => props.setShowAddAdminModal(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-8">
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
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Assign to Partner Company</label>
                                        <select
                                            required
                                            value={props.newAdmin.company}
                                            onChange={e => props.setNewAdmin({ ...props.newAdmin, company: e.target.value })}
                                            className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                        >
                                            <option value="">— Select Company —</option>
                                            {props.partneredCompanies.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                )}
                                <button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">Complete Setup</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            <AnimatePresence>
                {props.editFaculty && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => props.setEditFaculty(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-8">
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


            <AnimatePresence>
                {props.deleteFaculty && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => props.setDeleteFaculty(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
                            <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="h-10 w-10" />
                            </div>
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

            {/* DELETE STUDENT MODAL */}
            <AnimatePresence>
                {props.deleteStudent && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => props.setDeleteStudent(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
                            <div className="h-20 w-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2 italic tracking-tight uppercase">System Wipeout?</h3>
                            <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed italic">
                                Are you sure you want to permanently delete <span className="text-slate-900 font-black">"{props.deleteStudent.name}"</span>?
                                <br /><br />
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


            <AnimatePresence>
                {props.viewApp && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => props.setViewApp(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="border-b border-slate-50 px-10 py-8 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1 italic">Internship Application Dossier</p>
                                    <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">{props.viewApp.companyName}</h3>
                                </div>
                                <button onClick={() => props.setViewApp(null)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-slate-400 shadow-sm hover:text-slate-900 transition-all"><X className="h-5 w-5" /></button>
                            </div>
                            <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto italic">
                                <div className="grid grid-cols-2 gap-10">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Position Title</p>
                                        <p className="text-sm font-bold text-slate-900">{props.viewApp.position}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Employment Type</p>
                                        <p className="text-sm font-bold text-slate-900 capitalize">{props.viewApp.internshipType}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Professional Summary</p>
                                    <p className="text-sm font-bold text-slate-600 leading-relaxed border-l-4 border-blue-50 pl-6 py-2">{props.viewApp.summary}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-10 pt-10 border-t border-slate-50">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Company Domain</p>
                                        <p className="text-sm font-bold text-slate-900">{props.viewApp.companyDomain || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Submission Record</p>
                                        <p className="text-sm font-bold text-slate-900">{new Date(props.viewApp.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            <AnimatePresence>
                {props.assignTarget && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => props.setAssignTarget(null)}>
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-blue-500/10 overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="border-b border-slate-100 px-8 py-6 bg-slate-50/50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Internship Assignment</p>
                                <h2 className="text-lg font-black text-slate-900">{props.assignTarget.name}</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{props.assignTarget.rollNumber} · {props.assignTarget.degree}</p>
                            </div>
                            <form onSubmit={props.handleAssignInternship} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Faculty Supervisor *</label>
                                    <select
                                        required
                                        value={props.assignForm.facultySupervisorId}
                                        onChange={e => props.setAssignForm({ ...props.assignForm, facultySupervisorId: e.target.value })}
                                        className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-sans"
                                    >
                                        <option value="">— Select Faculty Supervisor —</option>
                                        {props.faculty.map(f => <option key={f._id} value={f._id}>{f.name} ({f.email})</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Assigned Company *</label>
                                        <select
                                            required
                                            value={props.assignForm.assignedCompany}
                                            onChange={e => props.setAssignForm({ ...props.assignForm, assignedCompany: e.target.value })}
                                            className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-sans"
                                        >
                                            <option value="">— Select Company —</option>
                                            {props.partneredCompaniesList.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <Input label="Assigned Position *" value={props.assignForm.assignedPosition} onChange={e => props.setAssignForm({ ...props.assignForm, assignedPosition: e.target.value })} required />
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-4">Site Supervisor Details</p>
                                    <div className="space-y-4">
                                        <Input label="Name" value={props.assignForm.siteSupervisorName} onChange={e => props.setAssignForm({ ...props.assignForm, siteSupervisorName: e.target.value })} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Email" type="email" value={props.assignForm.siteSupervisorEmail} onChange={e => props.setAssignForm({ ...props.assignForm, siteSupervisorEmail: e.target.value })} />
                                            <Input label="Phone" value={props.assignForm.siteSupervisorPhone} onChange={e => props.setAssignForm({ ...props.assignForm, siteSupervisorPhone: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                {props.assignError && <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg">{props.assignError}</p>}

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => props.setAssignTarget(null)} className="flex-1 h-12 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                    <button type="submit" disabled={props.assignLoading} className="flex-1 h-12 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
                                        {props.assignLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Finalize Assignment'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            <AnimatePresence>
                {props.changeSupervisorTarget && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => props.setChangeSupervisorTarget(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
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

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const Input = ({ label, ...props }: InputProps) => (
    <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{label}</label>
        <input {...props} required className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300" />
    </div>
);

export default AdminDashboardModals;
