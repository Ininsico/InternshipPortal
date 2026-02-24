import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    FileText,
    LogOut,
    CheckCircle2,
    Phone,
    Mail,
    MapPin,
    Building2,
    Building,
    User,
    Briefcase,
    Loader2,
    UserCircle,
    GraduationCap,
    Clock
} from 'lucide-react';

import API from '../config/api';
import StatusTracker from '../components/StatusTracker';

const API_BASE = API.STUDENT;

const StudentAgreementPage = () => {
    const { user, token, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [application, setApplication] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        sourcingType: 'Self',
        phoneNumber: '',
        personalEmail: '',
        homeAddress: '',
        companyAddress: '',
        supervisorName: '',
        supervisorDesignation: '',
        supervisorEmail: '',
        supervisorPhone: ''
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const appsRes = await axios.get(`${API_BASE}/applications`, config);
                if (appsRes.data.success) {
                    const approved = appsRes.data.applications.find((a: any) => a.status === 'approved');
                    if (approved) setApplication(approved);
                }

                if (user?.internshipStatus === 'agreement_submitted') {
                    const agreeRes = await axios.get(`${API_BASE}/agreement`, config);
                    if (agreeRes.data.success && agreeRes.data.agreement) {
                        setFormData({
                            sourcingType: agreeRes.data.agreement.sourcingType || 'Self',
                            phoneNumber: agreeRes.data.agreement.phoneNumber || '',
                            personalEmail: agreeRes.data.agreement.personalEmail || '',
                            homeAddress: agreeRes.data.agreement.homeAddress || '',
                            companyAddress: agreeRes.data.agreement.companyAddress || '',
                            supervisorName: agreeRes.data.agreement.supervisorName || '',
                            supervisorDesignation: agreeRes.data.agreement.supervisorDesignation || '',
                            supervisorEmail: agreeRes.data.agreement.supervisorEmail || '',
                            supervisorPhone: agreeRes.data.agreement.supervisorPhone || ''
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
    }, [token, user?.internshipStatus]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!application) return;

        setLoading(true);
        setError(null);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = {
                applicationId: application._id,
                ...formData
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

    if (fetching) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Agreement Form...</p>
            </div>
        );
    }

    const isLocked = user?.internshipStatus === 'agreement_submitted';

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col">
            <header className="h-16 md:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 md:px-10 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tight uppercase italic">CU Portal</span>
                </div>
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-5 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                </button>
            </header>

            <main className="flex-1 p-4 sm:p-8 md:p-12">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="h-[2px] w-8 bg-blue-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Step 4: Internship Agreement</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight mb-4 leading-none">
                            Finalize Your <br /> <span className="text-blue-600">Placement Contract</span>
                        </h1>
                        <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
                            {isLocked
                                ? "Your agreement has been submitted and is currently being processed. You will gain full dashboard access once verified."
                                : "Please provide the following details to finalize your internship placement agreement. This information is required for legal and administrative records."}
                        </p>
                    </div>

                    <div className="mb-10 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <StatusTracker currentStatus={user?.internshipStatus || 'none'} />
                    </div>

                    {isLocked ? (
                        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-100 overflow-hidden p-6 sm:p-8 md:p-12 text-center">
                            <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-blue-600">
                                <Clock className="w-12 h-12 animate-pulse" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Agreement Under Review</h2>
                            <p className="text-slate-500 font-medium max-w-md mx-auto mb-10">
                                Excellent! You've completed the agreement. The internship office is currently verifying your details. You'll be notified once your portal is fully unlocked.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                                    <p className="text-xs font-black text-blue-600 uppercase">Awaiting Verification</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Priority</p>
                                    <p className="text-xs font-black text-slate-900 uppercase">High</p>
                                </div>
                            </div>
                            <button
                                onClick={() => logout()}
                                className="mt-12 w-full h-16 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all active:scale-[0.98]"
                            >
                                Sign Out & Check Back Later
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl flex items-center gap-4">
                                    <FileText className="w-5 h-5" />
                                    <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                                </div>
                            )}

                            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <Briefcase className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Internship Sourcing</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Self', 'University Assigned'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, sourcingType: type })}
                                            className={`h-20 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${formData.sourcingType === type
                                                ? 'border-blue-600 bg-blue-50/50 text-blue-600'
                                                : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-100 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                                            {formData.sourcingType === type && <CheckCircle2 className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-10 shadow-sm">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <UserCircle className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Personal Contact Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <InputField
                                        label="Personal Phone Number"
                                        icon={Phone}
                                        value={formData.phoneNumber}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        placeholder="e.g. 03XX-XXXXXXX"
                                    />
                                    <InputField
                                        label="Personal Email Address"
                                        icon={Mail}
                                        value={formData.personalEmail}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, personalEmail: e.target.value })}
                                        placeholder="e.g. personal@gmail.com"
                                    />
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Home Address</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-5 top-6 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                            <textarea
                                                required
                                                rows={3}
                                                className="w-full pl-12 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/10 focus:bg-white text-sm font-bold text-slate-900 transition-all placeholder:text-slate-300 resize-none"
                                                value={formData.homeAddress}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, homeAddress: e.target.value })}
                                                placeholder="Enter your full permanent or current residential address..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {formData.sourcingType === 'Self' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-10 shadow-sm"
                                >
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <Building className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Industry Supervisor Details</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="md:col-span-2 space-y-3">
                                            <label className="text-[10px) font-black uppercase tracking-widest text-slate-400 ml-1">Company Physical Address</label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-5 top-5 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                                <textarea
                                                    required
                                                    rows={2}
                                                    className="w-full pl-12 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/10 focus:bg-white text-sm font-bold text-slate-900 transition-all placeholder:text-slate-300 resize-none"
                                                    value={formData.companyAddress}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, companyAddress: e.target.value })}
                                                    placeholder="Full address of the company office you'll be attending..."
                                                />
                                            </div>
                                        </div>
                                        <InputField
                                            label="Supervisor Full Name"
                                            icon={User}
                                            value={formData.supervisorName}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, supervisorName: e.target.value })}
                                            placeholder="Name of your direct reporting manager"
                                        />
                                        <InputField
                                            label="Supervisor Designation"
                                            icon={Briefcase}
                                            value={formData.supervisorDesignation}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, supervisorDesignation: e.target.value })}
                                            placeholder="e.g. Senior Project Manager"
                                        />
                                        <InputField
                                            label="Supervisor Contact Email"
                                            icon={Mail}
                                            value={formData.supervisorEmail}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, supervisorEmail: e.target.value })}
                                            placeholder="Official company email address"
                                        />
                                        <InputField
                                            label="Supervisor Office Phone"
                                            icon={Phone}
                                            value={formData.supervisorPhone}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, supervisorPhone: e.target.value })}
                                            placeholder="Contact number for verification"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-18 bg-blue-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 py-6"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Submit Agreement & Finalize Placement</span>
                                        <CheckCircle2 className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
};

interface InputFieldProps {
    label: string;
    icon: any;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    disabled?: boolean;
}

const InputField = ({ label, icon: Icon, value, onChange, placeholder, disabled }: InputFieldProps) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
        <div className="relative group">
            <Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            <input
                required
                disabled={disabled}
                className="w-full h-14 pl-12 pr-6 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/10 focus:bg-white text-sm font-bold text-slate-900 transition-all placeholder:text-slate-300"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    </div>
);

export default StudentAgreementPage;
