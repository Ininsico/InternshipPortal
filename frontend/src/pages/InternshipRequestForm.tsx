import { useState, useEffect, useCallback } from 'react';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/900.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Building2,
    Clock,
    Send,
    AlertCircle,
    Loader2,
    LogOut,
    Edit3,
    Globe,
    Laptop,
    UserCheck,
    PlusCircle,
    MinusCircle
} from 'lucide-react';

import API from '../config/api';
// Removed StatusTracker import as requested

const API_BASE = API.STUDENT;

const InternshipRequestForm = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [application, setApplication] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        companyName: '',
        position: '',
        internshipType: 'onsite',
        duration: '',
        description: '',
        semester: '',
        contactNumber: '',
        internshipField: '',
        internshipCategory: 'university_assigned',
        workMode: 'onsite',
        selfFoundSupervisor: {
            name: '',
            email: '',
            phone: '',
            designation: '',
            companyAddress: ''
        },
        freelancerAccounts: [
            { platform: 'Upwork', profileUrl: '', username: '' }
        ]
    });

    const fetchApplication = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_BASE}/applications`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success && data.applications.length > 0) {
                const latest = data.applications[data.applications.length - 1];
                setApplication(latest);
                setFormData({
                    companyName: latest.companyName || '',
                    position: latest.position || '',
                    internshipType: latest.internshipType || 'onsite',
                    duration: latest.duration || '',
                    description: latest.description || '',
                    semester: latest.semester || '',
                    contactNumber: latest.contactNumber || '',
                    internshipField: latest.internshipField || '',
                    internshipCategory: latest.internshipCategory || 'university_assigned',
                    workMode: latest.workMode || 'onsite',
                    selfFoundSupervisor: latest.selfFoundSupervisor || {
                        name: '', email: '', phone: '', designation: '', companyAddress: ''
                    },
                    freelancerAccounts: latest.freelancerAccounts?.length ? latest.freelancerAccounts : [
                        { platform: 'Upwork', profileUrl: '', username: '' }
                    ]
                });
                return latest;
            }
            return null;
        } catch (err) {
            console.error('Failed to fetch applications:', err);
            return null;
        } finally {
            setFetching(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            if (user?.internshipStatus === 'approved') {
                navigate('/dashboard');
                return;
            }
            await fetchApplication();
        };

        init();
    }, [user?.internshipStatus, navigate, fetchApplication]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const data = new FormData();

            // Core common fields
            data.append('semester', formData.semester);
            data.append('contactNumber', formData.contactNumber);
            data.append('internshipField', formData.internshipField);
            data.append('internshipCategory', formData.internshipCategory);
            data.append('internshipType', formData.internshipType);
            data.append('duration', formData.duration);
            data.append('description', formData.description);

            // Category specific fields — send as flat keys to avoid JSON parse issues
            if (formData.internshipCategory === 'university_assigned') {
                data.append('companyName', 'To be assigned by University');
                data.append('position', 'Intern');
            } else if (formData.internshipCategory === 'self_found') {
                data.append('companyName', formData.companyName);
                data.append('position', formData.position);
                // Send supervisor as flat fields
                data.append('sup_name', formData.selfFoundSupervisor.name);
                data.append('sup_email', formData.selfFoundSupervisor.email);
                data.append('sup_phone', formData.selfFoundSupervisor.phone);
                data.append('sup_designation', formData.selfFoundSupervisor.designation);
                data.append('sup_address', formData.selfFoundSupervisor.companyAddress);
            } else if (formData.internshipCategory === 'freelancer') {
                data.append('companyName', 'Freelancing');
                data.append('position', 'Freelancer');
                // Send each account as indexed flat fields
                formData.freelancerAccounts.forEach((acc, i) => {
                    data.append(`acc_${i}_platform`, acc.platform);
                    data.append(`acc_${i}_profileUrl`, acc.profileUrl);
                    data.append(`acc_${i}_username`, acc.username);
                });
                data.append('acc_count', String(formData.freelancerAccounts.length));
            }

            const res = await axios.post(`${API_BASE}/apply`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                await fetchApplication();
                setIsEditing(false);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    const addFreelanceAccount = () => {
        setFormData({
            ...formData,
            freelancerAccounts: [...formData.freelancerAccounts, { platform: 'Upwork', profileUrl: '', username: '' }]
        });
    };

    const removeFreelanceAccount = (index: number) => {
        setFormData({
            ...formData,
            freelancerAccounts: formData.freelancerAccounts.filter((_, i) => i !== index)
        });
    };

    const updateFreelanceAccount = (index: number, field: string, value: string) => {
        const updated = [...formData.freelancerAccounts];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, freelancerAccounts: updated });
    };

    if (user?.internshipStatus === 'approved') return null;

    if (fetching) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-xs font-bold text-slate-400">Verifying Status...</p>
            </div>
        );
    }

    const hasApplication = application !== null;
    const isSubmittedOrRejected = user?.internshipStatus === 'submitted' || user?.internshipStatus === 'rejected' || (user?.internshipStatus === 'none' && hasApplication);
    const showStatus = isSubmittedOrRejected && !isEditing;

    if (showStatus) {
        const isRejected = user?.internshipStatus === 'rejected';

        return (
            <div className="min-h-screen bg-[#f0f4ff] flex flex-col items-center justify-center p-4 md:p-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <div className="w-full max-w-lg">
                    {/* Top accent */}
                    <div className="h-1 bg-blue-600 rounded-t-2xl" />
                    <div className="bg-white rounded-b-2xl shadow-xl shadow-blue-100 border border-blue-50 overflow-hidden">
                        <div className="p-6 sm:p-10">
                            {/* Icon + Title */}
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-lg ${isRejected ? 'bg-red-50 text-red-500 shadow-red-100' : 'bg-blue-50 text-blue-600 shadow-blue-100'
                                    }`}>
                                    {isRejected
                                        ? <AlertCircle className="w-10 h-10" />
                                        : <Clock className="w-10 h-10 animate-pulse" />}
                                </div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight mb-2">
                                    {isRejected ? 'Application Rejected' : 'Awaiting Approval'}
                                </h2>
                                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                                    {isRejected
                                        ? 'Your request was not approved. Review feedback and resubmit.'
                                        : 'Your internship request is under review by the department.'}
                                </p>
                            </div>

                            {/* Details card */}
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Category</span>
                                    <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                                        {application?.internshipCategory?.replace(/_/g, ' ') || 'Pending'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Entity</p>
                                        <p className="text-sm font-bold text-slate-900 leading-snug">{application?.companyName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Role</p>
                                        <p className="text-sm font-bold text-slate-900 leading-snug">{application?.position || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                                            <Globe className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Mode</p>
                                            <p className="text-xs font-bold text-slate-800 capitalize">{application?.internshipType || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                                            <Clock className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Duration</p>
                                            <p className="text-xs font-bold text-slate-800">{application?.duration || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                {isRejected && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex-1 h-11 bg-white border-2 border-blue-100 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all active:scale-95"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        Edit Application
                                    </button>
                                )}
                                <button
                                    onClick={() => logout()}
                                    className="flex-1 h-11 bg-blue-600 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#f8fafc] flex flex-col lg:flex-row overflow-hidden" style={{ fontFamily: "'Montserrat', sans-serif" }}>

            {/* Left Section: University Branding & Stage — hidden on mobile, shown on lg+ */}
            <div className="hidden lg:flex w-[38%] bg-slate-50 flex-col items-center text-center justify-center border-r border-slate-200 relative overflow-hidden group shrink-0">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white rounded-full blur-3xl opacity-50" />

                <div className="relative z-10 flex flex-col items-center px-10">
                    <img
                        src="/comsatslogo.png"
                        alt="COMSATS logo"
                        style={{ width: '160px', height: '160px' }}
                        className="mb-6 object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                    <h2 className="text-lg font-black text-slate-950 tracking-tight border-b-2 border-blue-600 pb-3 mb-3 uppercase leading-tight">
                        COMSATS UNIVERSITY ISLAMABAD
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 leading-loose">
                        Department of Computer Science<br />Abbottabad Campus
                    </p>
                    <div className="w-10 h-0.5 bg-slate-200 mb-6" />
                    <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-snug max-w-xs mb-8">
                        Internship Placement & Verification
                    </h1>

                    {/* Stage Indicator */}
                    <div className="w-full max-w-xs space-y-2">
                        {[
                            { step: 1, label: 'Student Credentials', active: true },
                            { step: 2, label: 'Placement Category', active: true },
                            { step: 3, label: 'Entity Details', active: true },
                            { step: 4, label: 'Documentation', active: true },
                        ].map((s) => (
                            <div key={s.step} className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${s.active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {s.step}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${s.active ? 'text-slate-700' : 'text-slate-300'}`}>{s.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200 w-full max-w-xs">
                        <button
                            type="button"
                            onClick={() => logout()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all active:scale-95"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Section: The Form */}
            <div className="flex-1 flex flex-col h-screen bg-white overflow-hidden">
                {/* Form Header */}
                <div className="bg-blue-600 px-8 py-5 shrink-0 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-full bg-white/10 skew-x-[-20deg] translate-x-32" />
                    <div className="relative z-10">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 block mb-0.5">University Placement Registry</span>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Section I: Official Record Verification</span>
                    </div>
                    <div className="relative z-10 flex gap-1.5">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/10" />
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                    <div className="p-6 space-y-8">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                            </div>
                        )}

                        {/* Section 1: Student Credentials */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-slate-400">
                                    <UserCheck className="w-3.5 h-3.5" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Student Credentials</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <ReadOnlyField label="Legal Full Name" value={user?.name || ''} />
                                <ReadOnlyField label="Registration Identity" value={user?.rollNumber || ''} />
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Semester</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. 7th"
                                        className="w-full h-10 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-50 transition-all placeholder:text-slate-300"
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Number</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="+92 XXX XXXXXXX"
                                        className="w-full h-10 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-50 transition-all placeholder:text-slate-300"
                                        value={formData.contactNumber}
                                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Placement Categorization */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-slate-400">
                                    <Building2 className="w-3.5 h-3.5" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Placement Categorization</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'university_assigned', label: 'University Assigned', icon: Building2, desc: 'Dept handles placement' },
                                    { id: 'self_found', label: 'Self Sourced', icon: Globe, desc: 'Student secured company' },
                                    { id: 'freelancer', label: 'Freelancer', icon: Laptop, desc: 'Independent work' }
                                ].map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, internshipCategory: cat.id })}
                                        className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all group ${formData.internshipCategory === cat.id
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-blue-300'
                                            }`}
                                    >
                                        <cat.icon className={`w-5 h-5 mb-2 transition-colors ${formData.internshipCategory === cat.id ? 'text-white' : 'text-slate-300 group-hover:text-slate-500'}`} />
                                        <span className="text-[9px] font-black uppercase tracking-widest mb-1">{cat.label}</span>
                                        <span className={`text-[7px] font-bold uppercase tracking-wider ${formData.internshipCategory === cat.id ? 'text-slate-400' : 'text-slate-300'}`}>{cat.desc}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Professional Domain</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Full Stack Development"
                                        className="w-full h-10 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-50 transition-all placeholder:text-slate-300"
                                        value={formData.internshipField}
                                        onChange={(e) => setFormData({ ...formData, internshipField: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Proposed Duration</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. 8 Weeks"
                                        className="w-full h-10 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-50 transition-all placeholder:text-slate-300"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Entity Details — only for self_found */}
                        {formData.internshipCategory === 'self_found' && (
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center text-blue-500">
                                        <Globe className="w-3.5 h-3.5" />
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Company Details</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Company / Organization</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Legal Company Name"
                                            className="w-full h-10 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Internship Title</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Software Engineer Intern"
                                            className="w-full h-10 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Modality</label>
                                        <select
                                            required
                                            className="w-full h-10 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer appearance-none"
                                            value={formData.internshipType}
                                            onChange={(e) => setFormData({ ...formData, internshipType: e.target.value })}
                                        >
                                            <option value="onsite">Stationed (On-site)</option>
                                            <option value="remote">Distributed (Remote)</option>
                                            <option value="hybrid">Flexible (Hybrid)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">Company Supervisor Details</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input required placeholder="Supervisor Full Name" className="w-full h-9 bg-white border border-slate-200 rounded-lg px-4 text-[11px] font-bold focus:border-blue-400 outline-none" value={formData.selfFoundSupervisor.name} onChange={(e) => setFormData({ ...formData, selfFoundSupervisor: { ...formData.selfFoundSupervisor, name: e.target.value } })} />
                                        <input required type="email" placeholder="Supervisor Official Email" className="w-full h-9 bg-white border border-slate-200 rounded-lg px-4 text-[11px] font-bold focus:border-blue-400 outline-none" value={formData.selfFoundSupervisor.email} onChange={(e) => setFormData({ ...formData, selfFoundSupervisor: { ...formData.selfFoundSupervisor, email: e.target.value } })} />
                                        <input required placeholder="Contact Number" className="w-full h-9 bg-white border border-slate-200 rounded-lg px-4 text-[11px] font-bold focus:border-blue-400 outline-none" value={formData.selfFoundSupervisor.phone} onChange={(e) => setFormData({ ...formData, selfFoundSupervisor: { ...formData.selfFoundSupervisor, phone: e.target.value } })} />
                                        <input required placeholder="Corporate Designation" className="w-full h-9 bg-white border border-slate-200 rounded-lg px-4 text-[11px] font-bold focus:border-blue-400 outline-none" value={formData.selfFoundSupervisor.designation} onChange={(e) => setFormData({ ...formData, selfFoundSupervisor: { ...formData.selfFoundSupervisor, designation: e.target.value } })} />
                                        <div className="col-span-2">
                                            <input required placeholder="Company Physical Address" className="w-full h-9 bg-white border border-slate-200 rounded-lg px-4 text-[11px] font-bold focus:border-blue-400 outline-none" value={formData.selfFoundSupervisor.companyAddress} onChange={(e) => setFormData({ ...formData, selfFoundSupervisor: { ...formData.selfFoundSupervisor, companyAddress: e.target.value } })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 4: Freelancer Profiles (Conditional) */}
                        {formData.internshipCategory === 'freelancer' && (
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Laptop className="w-3.5 h-3.5" />
                                        </div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Platform Identities</h3>
                                    </div>
                                    <button type="button" onClick={addFreelanceAccount} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-600 hover:bg-white hover:border-slate-300 transition-all">
                                        <PlusCircle className="w-3 h-3" /> Add Account
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.freelancerAccounts.map((acc, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                                            {idx > 0 && <button type="button" onClick={() => removeFreelanceAccount(idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-all"><MinusCircle className="w-3.5 h-3.5" /></button>}
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-1"><label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1">Platform</label><select className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-[11px] font-bold" value={acc.platform} onChange={(e) => updateFreelanceAccount(idx, 'platform', e.target.value)}><option value="Upwork">Upwork</option><option value="Fiverr">Fiverr</option><option value="Freelancer">Freelancer.com</option><option value="Toptal">Toptal</option><option value="Other">Other</option></select></div>
                                                <div className="space-y-1"><label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1">Profile URL</label><input required placeholder="https://..." className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-[11px] font-bold" value={acc.profileUrl} onChange={(e) => updateFreelanceAccount(idx, 'profileUrl', e.target.value)} /></div>
                                                <div className="space-y-1"><label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1">Username</label><input required placeholder="@username" className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-[11px] font-bold" value={acc.username} onChange={(e) => updateFreelanceAccount(idx, 'username', e.target.value)} /></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Submit Footer */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-6 shrink-0">
                        <p className="text-[8px] font-black text-slate-400 leading-relaxed uppercase tracking-wider max-w-xs">
                            By submitting, I certify that the placement details provided are authentic and subject to departmental verification.
                        </p>
                        <div className="flex items-center gap-3">
                            {isEditing && (
                                <button type="button" onClick={() => setIsEditing(false)} className="px-6 h-10 border border-slate-200 text-slate-500 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-white transition-all shadow-sm active:scale-95">
                                    Withdraw
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
                            >
                                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Send className="w-3.5 h-3.5" />}
                                {isEditing ? 'Authorize Records' : 'Authorize Placement'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
    <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
        <div className="w-full h-10 bg-slate-50 border border-slate-100 rounded-xl px-4 flex items-center">
            <span className="text-xs font-bold text-slate-700">{value || 'N/A'}</span>
        </div>
    </div>
);

export default InternshipRequestForm;
