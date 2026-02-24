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
    Edit3,
    Paperclip,
    FilePlus,
    X as XIcon,
    FileText,
    Image as ImageIcon
} from 'lucide-react';

import API from '../config/api';
import StatusTracker from '../components/StatusTracker';

const API_BASE = API.STUDENT;

const InternshipRequestForm = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [application, setApplication] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const [files, setFiles] = useState<File[]>([]);
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
            await fetchApplication();
        };

        init();
    }, [user?.internshipStatus, navigate, fetchApplication]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            data.append('companyName', formData.companyName);
            data.append('position', formData.position);
            data.append('internshipType', formData.internshipType);
            data.append('duration', formData.duration);
            data.append('description', formData.description);

            files.forEach(file => {
                data.append('files', file);
            });

            const res = await axios.post(`${API_BASE}/apply`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                await fetchApplication();
                setIsEditing(false);
                setFiles([]);
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
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 md:p-6">
                <div className="max-w-2xl w-full">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-100 overflow-hidden">
                        <div className="p-6 md:p-12">
                            <div className="flex flex-col items-center text-center mb-10">
                                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 ${isRejected ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    {isRejected ? (
                                        <AlertCircle className="w-12 h-12" />
                                    ) : (
                                        <Clock className="w-12 h-12 animate-pulse" />
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
                                    {isRejected ? 'Application Rejected' : 'Approval Pending'}
                                </h2>
                                <p className="text-slate-500 font-medium max-w-sm">
                                    {isRejected
                                        ? 'Your previous request was not approved. Please review the feedback and resubmit.'
                                        : 'Your internship request is currently being reviewed by the HOD.'}
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 mb-8">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Application Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isRejected ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                        }`}>
                                        {user?.internshipStatus === 'none' ? 'In Review' : user?.internshipStatus}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Company</p>
                                        <p className="text-sm font-bold text-slate-900">{application?.companyName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Position</p>
                                        <p className="text-sm font-bold text-slate-900">{application?.position || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-200">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Internship Description</p>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                        {application?.description || 'No description provided.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mt-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Work Arrangement</p>
                                        <p className="text-sm font-bold text-slate-900">{application?.internshipType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Duration</p>
                                        <p className="text-sm font-bold text-slate-900">{application?.duration || 'N/A'}</p>
                                    </div>
                                </div>

                                {application?.documents && application.documents.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-slate-200">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Submitted Attachments</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            {application.documents.map((doc: any, i: number) => (
                                                <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 transition-all group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-all">
                                                            <Paperclip className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-600 truncate max-w-[180px]">{doc.name}</p>
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">View →</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {application?.feedback && (
                                    <div className="mt-8 pt-6 border-t border-slate-200">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-2">HOD Feedback</p>
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
                                        className="flex-1 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Edit Application
                                    </button>
                                )}
                                <button
                                    onClick={() => logout()}
                                    className="flex-1 h-14 bg-slate-900 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition-all"
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
            <header className="h-16 md:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-5 md:px-10 sticky top-0 z-20">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Building2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <span className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">University Portal</span>
                </div>
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-5 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                </button>
            </header>

            <main className="flex-1 flex items-start md:items-center justify-center p-4 md:p-8 py-8">
                <div className="max-w-3xl w-full">
                    <div className="mb-8 md:mb-12">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="h-[2px] w-8 bg-blue-600" />
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Verification Status</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4 leading-none">
                            Internship <br /> <span className="text-blue-600 font-bold">Registration</span>
                        </h1>
                        <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
                            {isEditing
                                ? "Update your internship details below. Make sure all information is accurate to avoid rejection."
                                : "The system requires an approved internship placement to activate your student dashboard."}
                        </p>
                    </div>

                    <div className="mb-8 md:mb-10 bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <StatusTracker currentStatus={user?.internshipStatus || 'none'} />
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-100 overflow-hidden">
                        <div className="p-6 md:p-12 space-y-8">
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
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Internship Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Briefly describe your responsibilities and the work your will be doing..."
                                    className="w-full p-6 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-blue-500/10 focus:bg-white text-sm font-bold text-slate-900 transition-all placeholder:text-slate-300 resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Attachments (Offer Letter / Pictures)</label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="relative flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-200 rounded-3xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group">
                                        <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-3">
                                            <FilePlus className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Click to upload files</p>
                                    </label>

                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {files.map((file, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                                                        {file.type.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4 text-slate-400" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold text-slate-700 truncate leading-none mb-1">{file.name}</p>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{(file.size / 1024).toFixed(0)} KB</p>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => removeFile(i)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                    <XIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {files.length === 0 && (
                                            <div className="h-full flex flex-col items-center justify-center border border-slate-50 rounded-3xl bg-slate-50/30 p-8">
                                                <Paperclip className="w-6 h-6 text-slate-200 mb-2" />
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No files attached</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 md:p-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 md:gap-8">
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
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Internship Management System
                </p>
            </footer>
        </div>
    );
};

export default InternshipRequestForm;
