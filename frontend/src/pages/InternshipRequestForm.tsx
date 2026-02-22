import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Building2,
    Briefcase,
    Calendar,
    Clock,
    Send,
    CheckCircle2,
    AlertCircle,
    Loader2,
    LogOut,
    Edit3
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/student';

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
        internshipType: 'On-site',
        duration: '',
        description: ''
    });

    const fetchApplication = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_BASE}/applications`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success && data.applications.length > 0) {
                // Get the most recent application
                const latest = data.applications[data.applications.length - 1];
                setApplication(latest);
                setFormData({
                    companyName: latest.companyName || '',
                    position: latest.position || '',
                    internshipType: latest.internshipType || 'On-site',
                    duration: latest.duration || '',
                    description: latest.description || ''
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

            // ALWAYS fetch applications on mount, regardless of status
            // This fixes the issue where internshipStatus might be 'none' but a record exists
            await fetchApplication();
        };

        init();
    }, [user, navigate, fetchApplication]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API_BASE}/apply`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                await fetchApplication();
                setIsEditing(false);
                // Force a reload to ensure the AuthContext user object is refreshed with the new internshipStatus
                window.location.reload();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    if (user?.internshipStatus === 'approved') return null;

    if (fetching) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Verifying Session State...</p>
            </div>
        );
    }

    // We show the status screen if:
    // 1. The user's status is 'submitted' or 'rejected'
    // 2. OR we found an application in the DB but the status is lagged/old
    const hasApplication = application !== null;
    const isSubmittedOrRejected = user?.internshipStatus === 'submitted' || user?.internshipStatus === 'rejected' || (user?.internshipStatus === 'none' && hasApplication);
    const showStatus = isSubmittedOrRejected && !isEditing;

    if (showStatus) {
        const isRejected = user?.internshipStatus === 'rejected';

        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
                <div className="max-w-2xl w-full">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-100 overflow-hidden">
                        <div className="p-12">
                            <div className="flex flex-col items-center text-center mb-10">
                                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 ${isRejected ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    {isRejected ? (
                                        <AlertCircle className="w-12 h-12" />
                                    ) : (
                                        <Clock className="w-12 h-12 animate-pulse" />
                                    )}
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-3">
                                    {isRejected ? 'Request Rejected' : 'Approval Pending'}
                                </h2>
                                <p className="text-slate-500 font-medium max-w-sm">
                                    {isRejected
                                        ? 'Your previous request was not approved. Please review the feedback and resubmit.'
                                        : 'Your internship request is currently being reviewed by the Super Admin.'}
                                </p>
                            </div>

                            {/* Status Details Card */}
                            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 mb-8">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Record</span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isRejected ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {user?.internshipStatus === 'none' ? 'Processing' : user?.internshipStatus}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Company</p>
                                        <p className="text-sm font-bold text-slate-900">{application?.companyName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Position</p>
                                        <p className="text-sm font-bold text-slate-900">{application?.position || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Type</p>
                                        <p className="text-sm font-bold text-slate-900">{application?.internshipType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Duration</p>
                                        <p className="text-sm font-bold text-slate-900">{application?.duration || 'N/A'}</p>
                                    </div>
                                </div>

                                {application?.feedback && (
                                    <div className="mt-8 pt-6 border-t border-slate-200">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">Admin Feedback</p>
                                        <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
                                            "{application.feedback}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                {isRejected && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex-1 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Edit Form
                                    </button>
                                )}
                                <button
                                    onClick={() => logout()}
                                    className="flex-1 h-14 bg-slate-900 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all active:scale-[0.98]"
                                >
                                    <LogOut className="w-4 h-4" />
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
        <div className="min-h-screen bg-[#f8fafc] flex flex-col">
            <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Building2 className="w-6 h-6 text-white" />
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

            <main className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-3xl w-full">
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="h-[2px] w-8 bg-blue-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Verification Process</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-4 leading-none">
                            Internship <br /> <span className="text-blue-600">Approval Request</span>
                        </h1>
                        <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
                            {isEditing
                                ? "Update your internship details below. Make sure all information is accurate to avoid rejection."
                                : "The system requires an approved internship placement to activate your student dashboard."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-100 overflow-hidden">
                        <div className="p-12 space-y-8">
                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl flex items-center gap-4 animate-shake">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company Name</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Google Pakistan"
                                            className="w-full pl-12 pr-6 h-14 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/10 focus:bg-white text-sm font-bold text-slate-900 transition-all placeholder:text-slate-300"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Job Position</label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. UI/UX Intern"
                                            className="w-full pl-12 pr-6 h-14 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/10 focus:bg-white text-sm font-bold text-slate-900 transition-all placeholder:text-slate-300"
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Arrangement</label>
                                    <div className="relative group">
                                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                                        <select
                                            required
                                            className="w-full pl-12 pr-6 h-14 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/10 focus:bg-white text-sm font-bold text-slate-900 transition-all appearance-none cursor-pointer"
                                            value={formData.internshipType}
                                            onChange={(e) => setFormData({ ...formData, internshipType: e.target.value })}
                                        >
                                            <option value="On-site">On-site</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Total Duration</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. 8 Weeks / 3 Months"
                                            className="w-full pl-12 pr-6 h-14 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/10 focus:bg-white text-sm font-bold text-slate-900 transition-all placeholder:text-slate-300"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Brief Overview</label>
                                <textarea
                                    rows={4}
                                    placeholder="Briefly describe your responsibilities..."
                                    className="w-full p-6 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-blue-500/10 focus:bg-white text-sm font-bold text-slate-900 transition-all placeholder:text-slate-300 resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50 p-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                            <div className="flex items-start gap-4 max-w-sm">
                                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 leading-normal uppercase tracking-wider">
                                    Your information will be electronically signed and submitted for verification.
                                </p>
                            </div>
                            <div className="flex gap-4 w-full sm:w-auto">
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 sm:w-32 px-6 h-14 border-2 border-slate-200 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 sm:w-56 h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            {isEditing ? 'Update Request' : 'Submit Request'}
                                            <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>

            <footer className="py-10 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                    Precision Academic Management System &trade;
                </p>
            </footer>
        </div>
    );
};

export default InternshipRequestForm;
