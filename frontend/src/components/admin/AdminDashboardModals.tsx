import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Building2, Sparkles, StickyNote, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

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

    editStudentTarget: any;
    setEditStudentTarget: (v: any) => void;
    editStudentForm: any;
    setEditStudentForm: (v: any) => void;
    handleEditStudent: (e: any) => void;
    editStudentLoading: boolean;
    editStudentError: string;

    apiBase: string;
    config: any;
    setPartneredCompanies: (v: any) => void;
}

interface PlacementContext {
    application: {
        companyName: string;
        position: string;
        internshipType: string;
        status: string;
    } | null;
    agreement: {
        supervisorName: string;
        supervisorEmail: string;
        supervisorPhone: string;
        supervisorDesignation: string;
        companyAddress: string;
        sourcingType: string;
    } | null;
    companies: { _id: string; name: string; email: string; website: string; phone: string }[];
}

interface EditStudentModalProps {
    target: any;
    form: any;
    setForm: (v: any) => void;
    onSubmit: (e: any) => void;
    loading: boolean;
    error: string;
    onClose: () => void;
    apiBase: string;
    config: any;
    setPartneredCompanies: (v: any) => void;
}

const EditStudentModal = ({ target, form, setForm, onSubmit, loading, error, onClose, apiBase, config, setPartneredCompanies }: EditStudentModalProps) => {
    const [context, setContext] = useState<PlacementContext | null>(null);
    const [contextLoading, setContextLoading] = useState(true);
    const [activeSource, setActiveSource] = useState<'none' | 'application' | 'partnered'>('none');
    const [selectedPartneredCompany, setSelectedPartneredCompany] = useState<string>('');
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        const fetchContext = async () => {
            setContextLoading(true);
            try {
                const { data } = await axios.get(`${apiBase}/students/${target._id}/placement-context`, config);
                if (data.success) {
                    setContext(data);
                    if (form.assignedCompany) {
                        const matched = data.companies.find((c: any) => c.name.toLowerCase() === form.assignedCompany.toLowerCase());
                        if (matched) setSelectedPartneredCompany(matched._id);
                    }
                }
            } catch (_) { /* silent */ }
            finally { setContextLoading(false); }
        };
        fetchContext();
    }, [target._id, apiBase, config, form.assignedCompany]);

    const isCompanyRegistered = (name: string) => {
        return context?.companies.some(c => c.name.toLowerCase() === name.toLowerCase()) || false;
    };

    const handleQuickRegister = async () => {
        if (!context?.application?.companyName) return;
        setRegistering(true);
        try {
            const payload = {
                name: context.application.companyName,
                email: context.agreement?.supervisorEmail || '',
                phone: context.agreement?.supervisorPhone || '',
                address: context.agreement?.companyAddress || ''
            };
            const { data } = await axios.post(`${apiBase}/companies`, payload, config);
            if (data.success) {
                const newComp = { _id: data.company._id, name: data.company.name, email: data.company.email || '', website: data.company.website || '', phone: data.company.phone || '' };
                setContext(prev => prev ? { ...prev, companies: [...prev.companies, newComp].sort((a, b) => a.name.localeCompare(b.name)) } : null);
                setPartneredCompanies((prev: any) => [...prev, { ...data.company, company: data.company.name, isManual: true }]);
                applyPartneredCompany(newComp._id);
            }
        } catch (err) { console.error(err); }
        finally { setRegistering(false); }
    };

    const applyApplicationSource = () => {
        if (!context?.application) return;
        setForm({
            ...form,
            assignedCompany: context.application.companyName || '',
            assignedPosition: context.application.position || '',
            siteSupervisorName: context.agreement?.supervisorName || '',
            siteSupervisorEmail: context.agreement?.supervisorEmail || '',
            siteSupervisorPhone: context.agreement?.supervisorPhone || '',
        });
        setActiveSource('application');
        setSelectedPartneredCompany('');
    };

    const applyPartneredCompany = (id: string) => {
        if (!context?.companies) return;
        const company = context.companies.find(c => c._id === id);
        if (!company) return;
        setForm({
            ...form,
            assignedCompany: company.name || '',
            siteSupervisorName: '',
            siteSupervisorEmail: company.email || '',
            siteSupervisorPhone: company.phone || '',
        });
        setSelectedPartneredCompany(id);
        setActiveSource('partnered');
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-sm rounded-3xl bg-white shadow-2xl relative my-2"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-5 pt-5 pb-3 border-b border-slate-50">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic leading-none">Placement Sync</h3>
                            <p className="text-[7px] font-black text-slate-400 mt-1 uppercase tracking-widest">{target.name} · {target.rollNumber}</p>
                        </div>
                        <button onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-all shrink-0"><X className="h-3 w-3" /></button>
                    </div>
                </div>

                <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2.5 flex items-center gap-2"><Sparkles className="h-2.5 w-2.5 text-blue-400" /> Auto-Inference</p>
                    {contextLoading ? (
                        <div className="flex gap-2">
                            {[1, 2].map(i => <div key={i} className="flex-1 h-12 rounded-xl bg-slate-100 animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={applyApplicationSource}
                                    disabled={!context?.application}
                                    className={`flex-1 rounded-xl border-2 p-2.5 text-left transition-all ${activeSource === 'application' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-blue-200 disabled:opacity-40'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${activeSource === 'application' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}><StickyNote className="h-3 w-3" /></div>
                                        <div className="min-w-0">
                                            <p className="text-[7px] font-black uppercase tracking-widest text-slate-900 leading-none mb-0.5">Use App Data</p>
                                            <p className="text-[7px] font-bold text-slate-400 truncate italic leading-none">{context?.application ? `${context.application.companyName}` : 'Empty'}</p>
                                        </div>
                                    </div>
                                </button>
                                <div className={`flex-1 rounded-xl border-2 p-2.5 transition-all ${activeSource === 'partnered' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white'}`}>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${activeSource === 'partnered' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Building2 className="h-3 w-3" /></div>
                                        <p className="text-[7px] font-black uppercase tracking-widest text-slate-900 leading-none">Partner List</p>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={selectedPartneredCompany}
                                            onChange={e => applyPartneredCompany(e.target.value)}
                                            className="w-full h-5 rounded bg-white border border-slate-200 px-1 pr-4 text-[7px] font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">— Select —</option>
                                            {context?.companies?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-0.5 top-1 h-2.5 w-2.5 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {activeSource === 'application' && context?.application?.companyName && !isCompanyRegistered(context.application.companyName) && (
                                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-100">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="h-6 w-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0"><Building2 className="h-3 w-3" /></div>
                                        <div className="truncate">
                                            <p className="text-[7px] font-black text-amber-900 uppercase tracking-widest leading-none">Unregistered</p>
                                            <p className="text-[7px] font-bold text-amber-600 italic truncate leading-none">{context.application.companyName}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleQuickRegister} disabled={registering} className="px-2 py-1 rounded-md bg-white border border-amber-200 text-[7px] font-black text-amber-600 uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all disabled:opacity-50">
                                        {registering ? '...' : 'Register'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <form onSubmit={onSubmit} className="px-5 py-4 space-y-3">
                    <div className="bg-blue-50/40 p-2.5 rounded-xl border border-blue-100/50 flex items-center justify-between">
                        <label className="text-[7px] font-black uppercase tracking-widest text-blue-400 leading-none">Status</label>
                        <select value={form.internshipStatus} onChange={e => setForm({ ...form, internshipStatus: e.target.value })} className="h-7 rounded-lg bg-white border-none px-3 text-[9px] font-black text-blue-600 outline-none uppercase tracking-widest shadow-sm">
                            <option value="none">None</option>
                            <option value="submitted">Submitted</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="agreement_submitted">Agreement Submitted</option>
                            <option value="verified">Verified</option>
                            <option value="internship_assigned">Assigned</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Entity Name</label>
                            <input value={form.assignedCompany} onChange={e => setForm({ ...form, assignedCompany: e.target.value })} list="edit-cos" placeholder="Type name..." className="w-full h-9 rounded-xl bg-slate-50 border-none px-4 text-[10px] font-bold text-slate-900 outline-none" />
                            <datalist id="edit-cos">{context?.companies?.map(c => <option key={c._id} value={c.name} />)}</datalist>
                        </div>
                        <ModalInput label="Position" value={form.assignedPosition} onChange={e => setForm({ ...form, assignedPosition: e.target.value })} />
                        <ModalInput label="Supervisor" value={form.siteSupervisorName} onChange={e => setForm({ ...form, siteSupervisorName: e.target.value })} />
                        <ModalInput label="Email" type="email" value={form.siteSupervisorEmail} onChange={e => setForm({ ...form, siteSupervisorEmail: e.target.value })} />
                        <ModalInput label="Phone" type="tel" value={form.siteSupervisorPhone} onChange={e => setForm({ ...form, siteSupervisorPhone: e.target.value })} />
                    </div>

                    {context?.agreement && activeSource === 'application' && (
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                            <p className="text-[7px] font-black uppercase text-slate-400 mb-1.5">Contextual Reference</p>
                            <div className="grid grid-cols-2 gap-2 text-[8px] font-bold text-slate-500 italic">
                                {context.agreement.supervisorDesignation && <p>Title: {context.agreement.supervisorDesignation}</p>}
                                {context.agreement.companyAddress && <p className="col-span-2 truncate">Address: {context.agreement.companyAddress}</p>}
                            </div>
                        </div>
                    )}

                    {error && <p className="text-[8px] font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full h-9 rounded-xl bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50">
                        {loading ? 'Working...' : 'Finalize Assignment'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

// ─── Shared Input Component ───────────────────────────────────────────────────
interface ModalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
const ModalInput = ({ label, ...props }: ModalInputProps) => (
    <div>
        <label className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-1 block">{label}</label>
        <input
            {...props}
            className="w-full h-8 rounded-xl bg-slate-50 border-none px-3 text-[10px] font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-200"
        />
    </div>
);

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
            {/* ── Edit Student Placement ── */}
            <AnimatePresence>
                {props.editStudentTarget && (
                    <EditStudentModal
                        target={props.editStudentTarget}
                        form={props.editStudentForm}
                        setForm={props.setEditStudentForm}
                        onSubmit={props.handleEditStudent}
                        loading={props.editStudentLoading}
                        error={props.editStudentError}
                        onClose={() => props.setEditStudentTarget(null)}
                        apiBase={props.apiBase}
                        config={props.config}
                        setPartneredCompanies={props.setPartneredCompanies}
                    />
                )}
            </AnimatePresence>

            {/* ── Create Admin / Company Staff ── */}
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

            {/* ── Delete Faculty ── */}
            <AnimatePresence>
                {props.deleteFaculty && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => props.setDeleteFaculty(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
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
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={() => props.setDeleteStudent(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
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
                                <div className="grid grid-cols-3 gap-8">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Position Title</p>
                                        <p className="text-sm font-bold text-slate-900">{props.viewApp.position || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Work Arrangement</p>
                                        <p className="text-sm font-bold text-slate-900 capitalize">{props.viewApp.internshipType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Duration</p>
                                        <p className="text-sm font-bold text-slate-900">{props.viewApp.duration || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Internship Description</p>
                                    <p className="text-sm font-bold text-slate-600 leading-relaxed border-l-4 border-blue-100 pl-6 py-2">{props.viewApp.description || 'No description provided.'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-10 pt-10 border-t border-slate-50">
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Supporting Attachments</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {props.viewApp.documents && props.viewApp.documents.length > 0 ? (
                                                props.viewApp.documents.map((doc: any, i: number) => (
                                                    <a
                                                        key={i}
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                                                    >
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                            <Paperclip className="w-5 h-5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-widest leading-none mb-1">{doc.name || 'Attachment'}</p>
                                                            <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest leading-none">View Document →</p>
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
                                    <div className="col-span-2 pt-6 border-t border-slate-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submission Record</p>
                                                <p className="text-sm font-bold text-slate-900">{new Date(props.viewApp.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verification Status</p>
                                                <p className="text-sm font-black text-blue-600 uppercase tracking-widest">{props.viewApp.status}</p>
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

export default AdminDashboardModals;
