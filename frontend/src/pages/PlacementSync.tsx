import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    Sparkles,
    StickyNote,
    Building2,
    ChevronDown,
    Loader2,
    AlertCircle,
    CheckCircle2,
    User,
    Mail,
    Phone,
    Briefcase
} from 'lucide-react';
import axios from 'axios';
import API from '../config/api';
import { useAuth } from '../context/AuthContext';

interface PlacementContext {
    companies: {
        _id: string;
        name: string;
        email: string;
        website: string;
        phone: string;
        supervisors: { name: string; email: string }[];
    }[];
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
}

const PlacementSync = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [student, setStudent] = useState<any>(null);
    const [context, setContext] = useState<PlacementContext | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        assignedCompany: '',
        assignedPosition: '',
        siteSupervisorName: '',
        siteSupervisorEmail: '',
        siteSupervisorPhone: '',
    });

    const [activeSource, setActiveSource] = useState<'none' | 'application' | 'partnered'>('none');
    const [selectedPartneredCompany, setSelectedPartneredCompany] = useState<string>('');
    const [registering, setRegistering] = useState(false);

    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const loadPageData = async () => {
            if (!studentId || !token) return;
            setLoading(true);
            try {
                // Fetch student basic info
                const { data: stuData } = await axios.get(`${API.ADMIN}/students`, config);
                const target = stuData.students.find((s: any) => s._id === studentId);
                if (target) {
                    setStudent(target);
                    setForm({
                        assignedCompany: target.assignedCompany || '',
                        assignedPosition: target.assignedPosition || '',
                        siteSupervisorName: target.siteSupervisorName || '',
                        siteSupervisorEmail: target.siteSupervisorEmail || '',
                        siteSupervisorPhone: target.siteSupervisorPhone || '',
                    });
                }

                // Fetch placement context
                const { data: ctxData } = await axios.get(`${API.ADMIN}/students/${studentId}/placement-context`, config);
                if (ctxData.success) {
                    setContext(ctxData);

                    // If student already has an assigned company, try to match it with partnered list
                    if (target?.assignedCompany) {
                        const matched = ctxData.companies.find((c: any) => c.name.toLowerCase() === target.assignedCompany.toLowerCase());
                        if (matched) setSelectedPartneredCompany(matched._id);
                    }
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load placement data');
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, [studentId, token]);

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
            const { data } = await axios.post(`${API.ADMIN}/companies`, payload, config);
            if (data.success) {
                const newComp = {
                    _id: data.company._id,
                    name: data.company.name,
                    email: data.company.email || '',
                    website: data.company.website || '',
                    phone: data.company.phone || '',
                    supervisors: []
                };
                setContext(prev => prev ? { ...prev, companies: [...prev.companies, newComp].sort((a, b) => a.name.localeCompare(b.name)) } : null);
                applyPartneredCompany(newComp._id);
            }
        } catch (err) { console.error(err); }
        finally { setRegistering(false); }
    };

    const applyApplicationSource = () => {
        if (!context) return;
        setForm({
            ...form,
            assignedCompany: context.application?.companyName || 'N/A',
            assignedPosition: context.application?.position || 'N/A',
            siteSupervisorName: context.agreement?.supervisorName || 'N/A',
            siteSupervisorEmail: context.agreement?.supervisorEmail || 'N/A',
            siteSupervisorPhone: context.agreement?.supervisorPhone || 'N/A',
        });
        setActiveSource('application');
        setSelectedPartneredCompany('');
    };

    const applyPartneredCompany = (id: string) => {
        if (!context?.companies) return;
        const company = context.companies.find(c => c._id === id);
        if (!company) return;

        const supervisor = company.supervisors && company.supervisors.length > 0 ? company.supervisors[0] : null;

        setForm({
            ...form,
            assignedCompany: company.name || 'N/A',
            siteSupervisorName: supervisor ? supervisor.name : 'N/A',
            siteSupervisorEmail: supervisor ? supervisor.email : (company.email || 'N/A'),
            siteSupervisorPhone: company.phone || 'N/A',
        });
        setSelectedPartneredCompany(id);
        setActiveSource('partnered');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const { data } = await axios.put(`${API.ADMIN}/students/${studentId}/internship`, form, config);
            if (data.success) {
                setSuccess('Placement synchronization successful.');
                setTimeout(() => navigate('/admin'), 1500);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update placement');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Synchronization Engine...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-12">
            <div className="mx-auto max-w-5xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <button
                            onClick={() => navigate('/admin')}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors mb-4"
                        >
                            <ChevronLeft className="h-3 w-3" /> Back to Records
                        </button>
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-3">
                            Placement Sync
                        </h1>
                        <div className="flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">
                                {student?.name} · {student?.rollNumber}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Tools & Sources */}
                    <div className="lg:col-span-5 space-y-6">
                        <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Inference Engine</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Auto-populate from verified sources</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={applyApplicationSource}
                                    disabled={!context?.application}
                                    className={`w-full group rounded-3xl border-2 p-6 text-left transition-all relative ${activeSource === 'application' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-50 bg-slate-50/50 hover:border-blue-200 disabled:opacity-40'}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${activeSource === 'application' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>
                                            <StickyNote className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">Application Data</p>
                                            <p className="text-[11px] font-bold text-slate-400 truncate italic">
                                                {context?.application ? `${context.application.companyName}` : 'No Application Metadata'}
                                            </p>
                                        </div>
                                    </div>
                                    {activeSource === 'application' && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-600 animate-pulse" />}
                                </button>

                                <div className={`rounded-3xl border-2 p-6 transition-all ${activeSource === 'partnered' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-50 bg-slate-50/50'}`}>
                                    <div className="flex items-center gap-5 mb-5">
                                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${activeSource === 'partnered' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">Official Partners</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Select from verified industry list</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={selectedPartneredCompany}
                                            onChange={e => applyPartneredCompany(e.target.value)}
                                            className="w-full h-12 rounded-2xl bg-white border border-slate-200 px-6 pr-12 text-xs font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-400 transition-colors"
                                        >
                                            <option value="">— Select Official Entity —</option>
                                            {context?.companies?.map(c => (
                                                <option key={c._id} value={c._id}>
                                                    {c.name} {c.supervisors.length > 0 ? `(${c.supervisors.length} reps)` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {activeSource === 'application' && context?.application?.companyName && !isCompanyRegistered(context.application.companyName) && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 rounded-3xl bg-amber-50 border border-amber-100">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Unregistered Entity</p>
                                            <p className="text-[11px] font-bold text-amber-600 italic leading-relaxed">"{context.application.companyName}" is not in partner records.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleQuickRegister}
                                        disabled={registering}
                                        className="w-full h-12 rounded-xl bg-white border border-amber-200 text-[10px] font-black text-amber-600 uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all disabled:opacity-50"
                                    >
                                        {registering ? 'Processing...' : 'Register as Partner'}
                                    </button>
                                </motion.div>
                            )}
                        </section>

                        <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-xl shadow-slate-200">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 flex items-center gap-2 italic">
                                <AlertCircle className="h-3 w-3" /> System Integrity
                            </h4>
                            <p className="text-xs font-bold text-slate-300 leading-relaxed italic">
                                "Updating these records will synchronize the student's final internship profile across the entire ecosystem. This data is critical for academic reporting and certification."
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Editing Form */}
                    <div className="lg:col-span-7">
                        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-1">Final Internship Entity</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            required
                                            value={form.assignedCompany}
                                            onChange={e => setForm({ ...form, assignedCompany: e.target.value })}
                                            list="entities"
                                            placeholder="Assign Company Name..."
                                            className="w-full h-16 rounded-2xl bg-slate-50 border-none pl-16 pr-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-sans"
                                        />
                                        <datalist id="entities">{context?.companies?.map(c => <option key={c._id} value={c.name} />)}</datalist>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-1">Industry Position</label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            required
                                            value={form.assignedPosition}
                                            onChange={e => setForm({ ...form, assignedPosition: e.target.value })}
                                            placeholder="e.g. Software Engineering Intern"
                                            className="w-full h-16 rounded-2xl bg-slate-50 border-none pl-16 pr-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-sans"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 bg-slate-50/50 rounded-[2.5rem] p-8 space-y-8 border border-slate-50">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 flex items-center gap-2 italic">
                                        <User className="h-3 w-3" /> Supervisor Coordination
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Supervisor Name</label>
                                            <div className="relative">
                                                <input
                                                    value={form.siteSupervisorName || ''}
                                                    onChange={e => setForm({ ...form, siteSupervisorName: e.target.value })}
                                                    list="super-list"
                                                    placeholder="Full Name"
                                                    className="w-full h-14 rounded-2xl bg-white border border-slate-100 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-sans"
                                                />
                                                <datalist id="super-list">
                                                    {context?.agreement?.supervisorName && <option value={context.agreement.supervisorName}>Student's Contact: {context.agreement.supervisorName}</option>}
                                                    {context?.companies?.find(c => c.name.toLowerCase() === form.assignedCompany.toLowerCase())?.supervisors.map((s, i) => (
                                                        <option key={i} value={s.name}>Official Rep: {s.name}</option>
                                                    ))}
                                                </datalist>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Contact Email</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                                <input
                                                    type="email"
                                                    value={form.siteSupervisorEmail}
                                                    onChange={e => setForm({ ...form, siteSupervisorEmail: e.target.value })}
                                                    placeholder="super@company.com"
                                                    className="w-full h-14 rounded-2xl bg-white border border-slate-100 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-sans"
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Contact Phone</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                                <input
                                                    type="tel"
                                                    value={form.siteSupervisorPhone}
                                                    onChange={e => setForm({ ...form, siteSupervisorPhone: e.target.value })}
                                                    placeholder="+92 3XX XXXXXXX"
                                                    className="w-full h-14 rounded-2xl bg-white border border-slate-100 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-sans"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {success && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-5 rounded-3xl bg-green-50 text-green-600 border border-green-100 text-[10px] font-black uppercase tracking-widest">
                                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                                    <span>{success}</span>
                                </motion.div>
                            )}

                            {error && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-5 rounded-3xl bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-widest">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin')}
                                    className="w-full sm:flex-1 h-16 rounded-2xl border-2 border-slate-50 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:bg-slate-50 transition-all"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full sm:flex-[2] h-16 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 italic flex items-center justify-center gap-3"
                                >
                                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Commit Synchronization'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlacementSync;
