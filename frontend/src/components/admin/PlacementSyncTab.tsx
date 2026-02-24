import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
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
    Briefcase,
    X
} from 'lucide-react';
import axios from 'axios';
import API from '../../config/api';

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

interface PlacementSyncTabProps {
    student: any;
    token: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

const PlacementSyncTab = ({ student, token, onClose, onSuccess }: PlacementSyncTabProps) => {
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
        const loadContext = async () => {
            if (!student?._id || !token) return;
            setLoading(true);
            try {
                setForm({
                    assignedCompany: student.assignedCompany || '',
                    assignedPosition: student.assignedPosition || '',
                    siteSupervisorName: student.siteSupervisorName || '',
                    siteSupervisorEmail: student.siteSupervisorEmail || '',
                    siteSupervisorPhone: student.siteSupervisorPhone || '',
                });

                const { data: ctxData } = await axios.get(`${API.ADMIN}/students/${student._id}/placement-context`, config);
                if (ctxData.success) {
                    setContext(ctxData);
                    const companyToMatch = student.assignedCompany || ctxData.application?.companyName;
                    if (companyToMatch) {
                        const matched = ctxData.companies.find((c: any) => c.name.toLowerCase() === companyToMatch.toLowerCase());
                        if (matched) setSelectedPartneredCompany(matched._id);
                    }
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load placement context');
            } finally {
                setLoading(false);
            }
        };
        loadContext();
    }, [student?._id, token]);

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

        const appCompany = context.application?.companyName || '';
        const matchedPartner = context.companies.find(c => c.name.toLowerCase() === appCompany.toLowerCase());

        if (matchedPartner) {
            // Smart Link: Company detected in official partners. Prioritize verified info.
            const supervisor = matchedPartner.supervisors && matchedPartner.supervisors.length > 0 ? matchedPartner.supervisors[0] : null;

            setForm({
                assignedCompany: matchedPartner.name,
                assignedPosition: context.application?.position || 'N/A',
                // Priority: Official Supervisor > Agreement Info > N/A
                siteSupervisorName: supervisor ? supervisor.name : (context.agreement?.supervisorName || 'N/A'),
                // Priority: Official Supervisor Email > Official Company Email > Agreement Info (Trust DB over Student Input)
                siteSupervisorEmail: supervisor ? supervisor.email : (matchedPartner.email && matchedPartner.email !== '—' ? matchedPartner.email : (context.agreement?.supervisorEmail || 'N/A')),
                // Priority: Official Company Phone > Agreement Info
                siteSupervisorPhone: (matchedPartner.phone && matchedPartner.phone !== '—') ? matchedPartner.phone : (context.agreement?.supervisorPhone || 'N/A'),
            });
            setActiveSource('partnered');
            setSelectedPartneredCompany(matchedPartner._id);
            setSuccess(`Smart Link: Verified records merged for ${matchedPartner.name}`);
            setTimeout(() => setSuccess(''), 3000);
        } else {
            // Standard App Source: Use details provided by student in the forms.
            setForm({
                assignedCompany: context.application?.companyName || 'N/A',
                assignedPosition: context.application?.position || 'N/A',
                siteSupervisorName: context.agreement?.supervisorName || 'N/A',
                siteSupervisorEmail: context.agreement?.supervisorEmail || 'N/A',
                siteSupervisorPhone: context.agreement?.supervisorPhone || 'N/A',
            });
            setActiveSource('application');
            setSelectedPartneredCompany('');
        }
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
            siteSupervisorEmail: supervisor ? supervisor.email : (company.email && company.email !== '—' ? company.email : 'N/A'),
            siteSupervisorPhone: company.phone && company.phone !== '—' ? company.phone : 'N/A',
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
            const { data } = await axios.put(`${API.ADMIN}/students/${student._id}/internship`, form, config);
            if (data.success) {
                setSuccess('Placement synchronization successful.');
                setTimeout(() => onSuccess(), 1000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update placement');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 md:p-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Sync Engine...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-2">
                        Placement Sync Engine
                    </h2>
                    <p className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">
                        {student?.name} · {student?.rollNumber}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-slate-100/50 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center hover:bg-slate-200 self-end sm:self-auto"
                >
                    <X className="h-5 w-5 md:h-6 md:w-6" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                {/* Tools & Sources */}
                <div className="lg:col-span-4 space-y-6">
                    <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 md:mb-8">
                            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none italic">Auto-Inference</h3>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={applyApplicationSource}
                                disabled={!context?.application}
                                className={`w-full group rounded-3xl border-2 p-5 md:p-6 text-left transition-all relative ${activeSource === 'application' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-50 bg-slate-50/50 hover:border-blue-200 disabled:opacity-40'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-11 w-11 md:h-12 md:w-12 rounded-2xl flex items-center justify-center shrink-0 ${activeSource === 'application' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                        <StickyNote className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-900 mb-1">Application Hub</p>
                                        <p className="text-[10px] font-bold text-slate-400 truncate italic">
                                            {context?.application ? `${context.application.companyName}` : 'No Application Metadata'}
                                        </p>
                                    </div>
                                </div>
                            </button>

                            <div className={`rounded-3xl border-2 p-5 md:p-6 transition-all ${activeSource === 'partnered' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-50 bg-slate-50/50'}`}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`h-11 w-11 md:h-12 md:w-12 rounded-2xl flex items-center justify-center shrink-0 ${activeSource === 'partnered' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-900">Partner Records</p>
                                </div>
                                <div className="relative">
                                    <select
                                        value={selectedPartneredCompany}
                                        onChange={e => applyPartneredCompany(e.target.value)}
                                        className="w-full h-10 rounded-xl bg-white border border-slate-200 px-4 pr-10 text-[10px] font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-400 transition-colors"
                                    >
                                        <option value="">— Select Partner —</option>
                                        {context?.companies?.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {activeSource === 'application' && context?.application?.companyName && !isCompanyRegistered(context.application.companyName) && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 p-5 md:p-6 rounded-3xl bg-amber-50 border border-amber-100 flex flex-col gap-4">
                                <div className="flex items-start gap-3 md:gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-200"><Building2 className="h-5 w-5" /></div>
                                    <div>
                                        <p className="text-[9px] font-black text-amber-900 uppercase tracking-widest leading-none mb-1">New Entity Detected</p>
                                        <p className="text-[10px] font-bold text-amber-600 italic leading-tight">Unregistered company name detected.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleQuickRegister}
                                    disabled={registering}
                                    className="w-full h-11 md:h-12 rounded-xl bg-white border border-amber-200 text-[9px] font-black text-amber-600 uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                >
                                    {registering ? 'Processing...' : 'Register Entity'}
                                </button>
                            </motion.div>
                        )}
                    </section>
                </div>

                {/* Form Editor */}
                <div className="lg:col-span-8">
                    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 p-6 md:p-10 lg:p-12 shadow-sm space-y-8 md:y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 md:mb-4 block ml-1">Assigned Industrial Partner</label>
                                <div className="relative group">
                                    <Building2 className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-slate-200 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        required
                                        value={form.assignedCompany}
                                        onChange={e => setForm({ ...form, assignedCompany: e.target.value })}
                                        list="entities"
                                        placeholder="Company Name"
                                        className="w-full h-14 md:h-16 rounded-2xl bg-slate-50 border-none pl-12 md:pl-16 pr-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-200"
                                    />
                                    <datalist id="entities">{context?.companies?.map(c => <option key={c._id} value={c.name} />)}</datalist>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 md:mb-4 block ml-1">Assigned Professional Position</label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-slate-200 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        required
                                        value={form.assignedPosition}
                                        onChange={e => setForm({ ...form, assignedPosition: e.target.value })}
                                        placeholder="Position (e.g. Software Architect Intern)"
                                        className="w-full h-14 md:h-16 rounded-2xl bg-slate-50 border-none pl-12 md:pl-16 pr-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-slate-50/50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 space-y-6 md:y-8 border border-slate-50">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-3 italic">
                                    <User className="h-3 w-3" /> External Supervisor Link
                                </h4>

                                <div className="space-y-6">
                                    {selectedPartneredCompany && context?.companies.find(c => c._id === selectedPartneredCompany)?.supervisors?.length! > 0 && (
                                        <div className="pb-6 border-b border-slate-100">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-3 block ml-1">Select Verified Supervisor</label>
                                            <div className="relative">
                                                <select
                                                    onChange={(e) => {
                                                        const company = context?.companies.find(c => c._id === selectedPartneredCompany);
                                                        const supervisor = company?.supervisors[parseInt(e.target.value)];
                                                        if (supervisor) {
                                                            setForm({
                                                                ...form,
                                                                siteSupervisorName: supervisor.name,
                                                                siteSupervisorEmail: supervisor.email
                                                            });
                                                        }
                                                    }}
                                                    className="w-full h-12 rounded-xl bg-white border-2 border-blue-100 px-4 pr-10 text-[10px] font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-400 transition-colors"
                                                >
                                                    <option value="">— Pick a Registered Supervisor —</option>
                                                    {context?.companies.find(c => c._id === selectedPartneredCompany)?.supervisors.map((s, idx) => (
                                                        <option key={idx} value={idx}>{s.name} ({s.email})</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400 pointer-events-none" />
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-400 mt-2 italic px-1">Selecting an option will auto-fill the fields below.</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2 md:mb-3 block ml-1">Full Name</label>
                                            <input
                                                value={form.siteSupervisorName}
                                                onChange={e => setForm({ ...form, siteSupervisorName: e.target.value })}
                                                placeholder="Supervisor Name"
                                                className="w-full h-12 md:h-14 rounded-2xl bg-white border border-slate-100 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2 md:mb-3 block ml-1">Professional Email</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                                <input
                                                    type="email"
                                                    value={form.siteSupervisorEmail}
                                                    onChange={e => setForm({ ...form, siteSupervisorEmail: e.target.value })}
                                                    placeholder="email@partner.com"
                                                    className="w-full h-12 md:h-14 rounded-2xl bg-white border border-slate-100 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2 md:mb-3 block ml-1">Verified Phone Line</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                                <input
                                                    type="tel"
                                                    value={form.siteSupervisorPhone}
                                                    onChange={e => setForm({ ...form, siteSupervisorPhone: e.target.value })}
                                                    placeholder="Contact Number"
                                                    className="w-full h-12 md:h-14 rounded-2xl bg-white border border-slate-100 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(success || error) && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-4 p-5 md:p-6 rounded-3xl border text-[10px] font-black uppercase tracking-widest ${success ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                {success ? <CheckCircle2 className="h-5 md:h-6 w-5 md:w-6 shrink-0" /> : <AlertCircle className="h-5 md:h-6 w-5 md:w-6 shrink-0" />}
                                <span>{success || error}</span>
                            </motion.div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 md:pt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:flex-1 h-14 md:h-16 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all order-2 sm:order-1"
                            >
                                Discard Sync
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full sm:flex-[2] h-14 md:h-16 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 italic order-1 sm:order-2"
                            >
                                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Execute Placement Sync'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PlacementSyncTab;
