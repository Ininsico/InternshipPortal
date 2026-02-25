import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FileText,
    LogOut,
    CheckCircle2,
    Phone,
    Mail,
    MapPin,
    Upload,
    Loader2,
    GraduationCap,
    Clock,
    X as XIcon,
    FilePlus,
    AlertCircle
} from 'lucide-react';
import API from '../config/api';

const API_BASE = API.STUDENT;

const StudentAgreementPage = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [application, setApplication] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [offerFile, setOfferFile] = useState<File | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        phoneNumber: '',
        personalEmail: '',
        homeAddress: '',
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const appsRes = await axios.get(`${API_BASE}/applications`, config);

                if (appsRes.data.success) {
                    const approved = appsRes.data.applications.find((a: any) => a.status === 'approved');
                    if (approved) {
                        setApplication(approved);

                        // University-assigned students skip this page entirely
                        if (approved.internshipCategory === 'university_assigned') {
                            navigate('/dashboard', { replace: true });
                            return;
                        }
                    }
                }

                // Pre-fill from existing agreement if already submitted
                if (user?.internshipStatus === 'agreement_submitted') {
                    const agreeRes = await axios.get(`${API_BASE}/agreement`, config);
                    if (agreeRes.data.success && agreeRes.data.agreement) {
                        setFormData({
                            phoneNumber: agreeRes.data.agreement.phoneNumber || '',
                            personalEmail: agreeRes.data.agreement.personalEmail || '',
                            homeAddress: agreeRes.data.agreement.homeAddress || '',
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to load agreement data:', err);
            } finally {
                setFetching(false);
            }
        };

        if (token) loadData();
    }, [token, user?.internshipStatus, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!application) return;

        if (!offerFile && user?.internshipStatus !== 'agreement_submitted') {
            setError('Please upload your offer letter before submitting.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = {
                applicationId: application._id,
                sourcingType: application.internshipCategory === 'freelancer' ? 'Freelancer' : 'Self',
                ...formData,
                // Pass supervisor data already stored in the application
                supervisorName: application.selfFoundSupervisor?.name || '',
                supervisorEmail: application.selfFoundSupervisor?.email || '',
                supervisorPhone: application.selfFoundSupervisor?.phone || '',
                supervisorDesignation: application.selfFoundSupervisor?.designation || '',
                companyAddress: application.selfFoundSupervisor?.companyAddress || '',
            };

            const { data } = await axios.post(`${API_BASE}/agreement`, payload, config);
            if (data.success) {
                window.location.reload();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit agreement');
        } finally {
            setLoading(false);
        }
    };

    // ── Loading state ──────────────────────────────────────────────────────────
    if (fetching) {
        return (
            <div className="min-h-screen bg-[#f0f4ff] flex flex-col items-center justify-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading...</p>
            </div>
        );
    }

    const isLocked = user?.internshipStatus === 'agreement_submitted';
    const category = application?.internshipCategory;
    const isFreelancer = category === 'freelancer';

    // ── Locked / Submitted state ───────────────────────────────────────────────
    if (isLocked) {
        return (
            <div className="min-h-screen bg-[#f0f4ff] flex flex-col items-center justify-center p-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <div className="w-full max-w-md">
                    <div className="h-1 bg-blue-600 rounded-t-2xl" />
                    <div className="bg-white rounded-b-2xl shadow-xl shadow-blue-100 border border-blue-50 p-8 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-blue-600">
                            <Clock className="w-8 h-8 animate-pulse" />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight mb-2">Agreement Under Review</h2>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed mb-8">
                            Your agreement has been submitted and is being processed by the department.
                            You'll gain full dashboard access once verified.
                        </p>
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-left">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                                <p className="text-[10px] font-black text-blue-600 uppercase">Awaiting Verification</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-left">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Category</p>
                                <p className="text-[10px] font-black text-slate-800 uppercase">{category?.replace(/_/g, ' ') || 'N/A'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="w-full h-12 rounded-xl bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out & Check Back Later
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main form ──────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f0f4ff] flex flex-col" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {/* Header */}
            <header className="bg-white border-b border-slate-100 flex items-center justify-between px-5 md:px-10 h-16 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-black text-slate-900 tracking-tight uppercase">CU Internship Portal</span>
                </div>
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all active:scale-95"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Sign Out</span>
                </button>
            </header>

            <main className="flex-1 flex items-start justify-center p-4 md:p-10">
                <div className="w-full max-w-2xl">

                    {/* Page title */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="h-[2px] w-6 bg-blue-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Internship Agreement</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                            Finalize Your <span className="text-blue-600">Placement Contract</span>
                        </h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider leading-relaxed">
                            Upload your offer letter and confirm your contact details to complete the agreement.
                        </p>
                    </div>

                    {/* Application summary badge */}
                    <div className="mb-6 flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                                {application?.companyName} — {application?.position}
                            </span>
                        </div>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">
                            {category?.replace(/_/g, ' ') || 'N/A'}
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-3 rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                            </div>
                        )}

                        {/* ── Offer Letter Upload ── */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Offer Letter</h3>
                            </div>

                            {!offerFile ? (
                                <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-blue-100 rounded-xl hover:bg-blue-50/30 hover:border-blue-300 transition-all cursor-pointer group">
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) setOfferFile(f);
                                        }}
                                    />
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3 text-blue-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                                        <FilePlus className="w-5 h-5" />
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Click to upload offer letter</p>
                                    <p className="text-[8px] font-bold text-slate-300 uppercase mt-1">PDF, PNG, JPG accepted</p>
                                </label>
                            ) : (
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 truncate max-w-[220px]">{offerFile.name}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">{(offerFile.size / 1024).toFixed(0)} KB</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setOfferFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                                        className="p-1.5 text-slate-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
                                    >
                                        <XIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-3">
                                {isFreelancer
                                    ? 'Upload any freelance contract or platform verification document.'
                                    : 'Upload the official offer letter issued by the company.'}
                            </p>
                        </div>

                        {/* ── Personal Contact Info ── */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Personal Contact Details</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    label="Personal Phone"
                                    icon={Phone}
                                    type="tel"
                                    placeholder="03XX-XXXXXXX"
                                    value={formData.phoneNumber}
                                    onChange={(v) => setFormData({ ...formData, phoneNumber: v })}
                                />
                                <FormField
                                    label="Personal Email"
                                    icon={Mail}
                                    type="email"
                                    placeholder="personal@gmail.com"
                                    value={formData.personalEmail}
                                    onChange={(v) => setFormData({ ...formData, personalEmail: v })}
                                />
                                <div className="sm:col-span-2 space-y-1.5">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                                        <MapPin className="w-3 h-3" /> Home Address
                                    </label>
                                    <textarea
                                        required
                                        rows={2}
                                        placeholder="Current residential address..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300 resize-none outline-none"
                                        value={formData.homeAddress}
                                        onChange={(e) => setFormData({ ...formData, homeAddress: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── Supervisor details read-only preview (self_found only) ── */}
                        {!isFreelancer && application?.selfFoundSupervisor?.name && (
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                        </div>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Supervisor Details</h3>
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-green-500 bg-green-50 px-2 py-1 rounded-lg">
                                        Pre-filled from application
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Name', val: application.selfFoundSupervisor.name },
                                        { label: 'Email', val: application.selfFoundSupervisor.email },
                                        { label: 'Phone', val: application.selfFoundSupervisor.phone },
                                        { label: 'Designation', val: application.selfFoundSupervisor.designation },
                                    ].map(({ label, val }) => val ? (
                                        <div key={label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                                            <p className="text-[10px] font-bold text-slate-800 truncate">{val}</p>
                                        </div>
                                    ) : null)}
                                </div>
                            </div>
                        )}

                        {/* ── Submit ── */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-[0.98]"
                        >
                            {loading
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <><CheckCircle2 className="w-4 h-4" /><span>Submit Agreement & Finalize Placement</span></>
                            }
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

// ── Small reusable field component ────────────────────────────────────────────
const FormField = ({
    label, icon: Icon, type = 'text', placeholder, value, onChange
}: {
    label: string; icon: any; type?: string; placeholder: string; value: string;
    onChange: (v: string) => void;
}) => (
    <div className="space-y-1.5">
        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
            <Icon className="w-3 h-3" /> {label}
        </label>
        <input
            required
            type={type}
            placeholder={placeholder}
            className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300 outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

export default StudentAgreementPage;
