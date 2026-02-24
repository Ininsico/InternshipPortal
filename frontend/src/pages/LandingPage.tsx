import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, Loader2, AlertCircle, X, CheckCircle2, Mail, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API from '../config/api';

type FormMode = 'student' | 'admin';
type StudentView = 'login' | 'signup' | 'verify-otp';

interface ApiResponse {
    success: boolean;
    message: string;
    token?: string;
    pendingEmail?: string;
    user?: {
        id: string;
        name: string;
        role: string;
        rollNumber?: string;
        email?: string;
        internshipStatus?: 'none' | 'submitted' | 'approved' | 'rejected' | 'agreement_submitted' | 'verified' | 'internship_assigned';
    };
}

const SESSIONS = ['FA20', 'SP20', 'FA21', 'SP21', 'FA22', 'SP22', 'FA23', 'SP23', 'FA24', 'SP24'];
const DEGREES = ['BSE', 'BCS', 'BBA'];
const API_BASE = API.AUTH;

const LandingPage = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [mode, setMode] = useState<FormMode>('student');
    const [studentView, setStudentView] = useState<StudentView>('login');

    const [session, setSession] = useState('FA21');
    const [degree, setDegree] = useState('BCS');
    const [rollId, setRollId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotFeedback, setForgotFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupRoll, setSignupRoll] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [showSignupPass, setShowSignupPass] = useState(false);
    const [signupLoading, setSignupLoading] = useState(false);
    const [signupFeedback, setSignupFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

    const [pendingEmail, setPendingEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpFeedback, setOtpFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (user) {
            if (user.role === 'student') navigate('/dashboard', { replace: true });
            else if (user.role === 'company_admin') navigate('/company-portal', { replace: true });
            else if (user.role === 'admin') navigate('/faculty-portal', { replace: true });
            else if (user.role === 'super_admin') navigate('/admin', { replace: true });
            else navigate('/', { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    if (user) return null;

    const switchMode = (next: FormMode) => {
        if (next === mode) return;
        setMode(next);
        setPassword(''); setShowPassword(false); setFeedback(null);
        setEmail(''); setRollId('');
        setStudentView('login');
    };

    const clearFeedback = () => setFeedback(null);

    const handleStudentSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); clearFeedback(); setLoading(true);
        try {
            const { data } = await axios.post<ApiResponse>(`${API_BASE}/login/student`, { session, degree, rollId, password });
            if (data.token && data.user) { login(data.token, data.user); navigate('/dashboard'); }
            else setFeedback({ type: 'success', msg: data.message });
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err) && err.response?.data?.message
                ? err.response.data.message : 'Something went wrong. Please try again.';
            setFeedback({ type: 'error', msg });
        } finally { setLoading(false); }
    };

    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); clearFeedback(); setLoading(true);
        try {
            const { data } = await axios.post<ApiResponse>(`${API_BASE}/login/admin`, { email, password });
            if (data.token && data.user) {
                login(data.token, data.user);
                const role = data.user.role;
                if (role === 'company_admin') navigate('/company-portal', { replace: true });
                else if (role === 'admin') navigate('/faculty-portal', { replace: true });
                else if (role === 'super_admin') navigate('/admin', { replace: true });
                else navigate('/', { replace: true });
            }
            setFeedback({ type: 'success', msg: data.message });
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err) && err.response?.data?.message
                ? err.response.data.message : 'Something went wrong. Please try again.';
            setFeedback({ type: 'error', msg });
        } finally { setLoading(false); }
    };

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSignupFeedback(null); setSignupLoading(true);
        try {
            const { data } = await axios.post<ApiResponse>(`${API_BASE}/signup/student`, {
                name: signupName, email: signupEmail, rollNumber: signupRoll, password: signupPassword,
            });
            if (data.success) {
                setPendingEmail(data.pendingEmail || signupEmail);
                setResendCooldown(60);
                setStudentView('verify-otp');
            } else {
                setSignupFeedback({ type: 'error', msg: data.message });
            }
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err) && err.response?.data?.message
                ? err.response.data.message : 'Something went wrong. Please try again.';
            setSignupFeedback({ type: 'error', msg });
        } finally { setSignupLoading(false); }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault(); setOtpFeedback(null); setOtpLoading(true);
        try {
            const { data } = await axios.post<ApiResponse>(`${API_BASE}/verify-otp`, { email: pendingEmail, otp });
            if (data.success && data.token && data.user) {
                login(data.token, data.user);
                navigate('/dashboard');
            } else {
                setOtpFeedback({ type: 'error', msg: data.message });
            }
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err) && err.response?.data?.message
                ? err.response.data.message : 'Verification failed. Please try again.';
            setOtpFeedback({ type: 'error', msg });
        } finally { setOtpLoading(false); }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setOtpFeedback(null);
        try {
            await axios.post(`${API_BASE}/resend-otp`, { email: pendingEmail });
            setResendCooldown(60);
            setOtpFeedback({ type: 'success', msg: 'A new code has been sent to your email.' });
        } catch {
            setOtpFeedback({ type: 'error', msg: 'Failed to resend code. Please try again.' });
        }
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setForgotLoading(true); setForgotFeedback(null);
        try {
            const { data } = await axios.post(`${API_BASE}/forgot-password`, { email: forgotEmail });
            setForgotFeedback({ type: 'success', msg: data.message });
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err) && err.response?.data?.message
                ? err.response.data.message : 'Something went wrong.';
            setForgotFeedback({ type: 'error', msg });
        } finally { setForgotLoading(false); }
    };

    const isAdmin = mode === 'admin';

    return (
        <div className="relative min-h-screen bg-[#FDFBF7] text-slate-900 selection:bg-blue-600 selection:text-white overflow-hidden">

            <header className="fixed top-0 left-0 right-0 z-50 px-12 py-10">
                <nav className="mx-auto flex max-w-[1400px] items-center justify-between bg-transparent">
                    <div className="flex items-center gap-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black tracking-[-0.05em] text-slate-900 uppercase leading-none">COMSATS</h1>
                        </div>
                    </div>
                    <div className="hidden items-center gap-10 md:flex">
                        <button
                            onClick={() => switchMode(isAdmin ? 'student' : 'admin')}
                            className="px-8 py-3.5 rounded-2xl bg-white text-blue-600 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:bg-slate-50 hover:shadow-[0_10px_30px_-5px_rgba(37,99,235,0.15)] active:scale-95"
                        >
                            {isAdmin ? 'Student Entry' : 'Faculty Access'}
                        </button>
                    </div>
                </nav>
            </header>

            <main className="relative flex min-h-screen items-center justify-center px-6 pt-20">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 w-full max-w-[400px]"
                >
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)]">
                        <div className="p-8 lg:p-10">

                            <div className="mb-8 text-center">
                                <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter leading-none mb-2">
                                    {isAdmin ? 'FACULTY' : studentView === 'verify-otp' ? 'VERIFY' : 'STUDENT'}
                                </h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 opacity-80">
                                    {isAdmin ? 'Portal Authentication'
                                        : studentView === 'login' ? 'Portal Authentication'
                                            : studentView === 'signup' ? 'Create Your Account'
                                                : 'Email Verification'}
                                </p>

                                {!isAdmin && studentView !== 'verify-otp' && (
                                    <div className="flex mt-6 bg-slate-50 rounded-2xl p-1 border border-slate-100">
                                        <button
                                            onClick={() => { setStudentView('login'); setFeedback(null); setSignupFeedback(null); }}
                                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${studentView === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >Sign In</button>
                                        <button
                                            onClick={() => { setStudentView('signup'); setFeedback(null); setSignupFeedback(null); }}
                                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${studentView === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >Sign Up</button>
                                    </div>
                                )}
                            </div>

                            <AnimatePresence mode="wait">
                                {feedback && (
                                    <motion.div
                                        key="fb"
                                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                                        className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-[9px] font-black uppercase tracking-widest ${feedback.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}
                                    >
                                        <AlertCircle className="h-4 w-4 shrink-0" /><span>{feedback.msg}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence mode="wait">

                                {!isAdmin && studentView === 'login' && (
                                    <motion.form key="stu-login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleStudentSubmit} className="space-y-5" autoComplete="off">
                                        <div className="flex gap-3">
                                            <select value={session} onChange={e => setSession(e.target.value)} className="h-13 flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-xs font-black text-slate-900 outline-none focus:border-blue-500 transition-all py-3.5">
                                                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <select value={degree} onChange={e => setDegree(e.target.value)} className="h-13 flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-xs font-black text-slate-900 outline-none focus:border-blue-500 transition-all py-3.5">
                                                {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <input type="text" placeholder="Roll Number (e.g. 015)" value={rollId} onChange={e => setRollId(e.target.value)} required className="h-13 w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all placeholder:text-slate-400 py-3.5" autoComplete="off" />
                                        <div className="relative">
                                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="h-13 w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all placeholder:text-slate-400 py-3.5" placeholder="Password" autoComplete="new-password" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900">
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-4 pt-1">
                                            <button disabled={loading} className="h-13 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.4em] transition-all hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 py-3.5 flex items-center justify-center gap-2">
                                                {loading && <Loader2 className="h-4 w-4 animate-spin" />} {loading ? 'Verifying...' : 'Sign In'}
                                            </button>
                                            <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 text-center transition-colors">Forgot Password?</button>
                                        </div>
                                    </motion.form>
                                )}

                                {!isAdmin && studentView === 'signup' && (
                                    <motion.form key="stu-signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSignupSubmit} className="space-y-4" autoComplete="off">
                                        <AnimatePresence>
                                            {signupFeedback && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-[9px] font-black uppercase tracking-widest ${signupFeedback.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{signupFeedback.msg}</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <input type="text" placeholder="Full Name" value={signupName} onChange={e => setSignupName(e.target.value)} required className="h-12 w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 placeholder:text-slate-400" />
                                        <input type="email" placeholder="University Email (@cuiatd.edu.pk)" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required className="h-12 w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 placeholder:text-slate-400" />
                                        <input type="text" placeholder="Roll Number (e.g. FA21-BCS-015)" value={signupRoll} onChange={e => setSignupRoll(e.target.value)} required className="h-12 w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 placeholder:text-slate-400" />
                                        <div className="relative">
                                            <input type={showSignupPass ? 'text' : 'password'} placeholder="Create Password (min 6 chars)" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required className="h-12 w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 placeholder:text-slate-400 pr-12" />
                                            <button type="button" onClick={() => setShowSignupPass(!showSignupPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900">
                                                {showSignupPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 text-center leading-relaxed px-2">
                                            Only <span className="text-blue-600 font-black">@cuiatd.edu.pk</span> emails are accepted.<br />A verification code will be sent to your inbox.
                                        </p>
                                        <button disabled={signupLoading} className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.4em] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                                            {signupLoading && <Loader2 className="h-4 w-4 animate-spin" />}{signupLoading ? 'Creating Account...' : 'Create Account'}
                                        </button>
                                    </motion.form>
                                )}

                                {!isAdmin && studentView === 'verify-otp' && (
                                    <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-6">
                                            <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-blue-400">Code sent to</p>
                                                <p className="text-xs font-black text-blue-700 truncate">{pendingEmail}</p>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {otpFeedback && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-[9px] font-black uppercase tracking-widest mb-4 ${otpFeedback.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                                                    {otpFeedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                                                    <span>{otpFeedback.msg}</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">6-Digit Verification Code</label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={6}
                                                    placeholder="000000"
                                                    value={otp}
                                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                                    required
                                                    className="h-16 w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 text-3xl font-black text-slate-900 text-center outline-none focus:border-blue-500 tracking-[0.5em] placeholder:text-slate-200 placeholder:text-2xl transition-all"
                                                    autoComplete="one-time-code"
                                                />
                                            </div>

                                            <button disabled={otpLoading || otp.length !== 6} className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.4em] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                                                {otpLoading && <Loader2 className="h-4 w-4 animate-spin" />}{otpLoading ? 'Verifying...' : 'Verify & Sign In'}
                                            </button>
                                        </form>

                                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                                            <button onClick={handleResendOtp} disabled={resendCooldown > 0} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-700 disabled:text-slate-300 transition-colors">
                                                <RefreshCw className="h-3 w-3" />
                                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                                            </button>
                                            <button onClick={() => { setStudentView('signup'); setOtpFeedback(null); setOtp(''); }} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
                                                ← Back
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {isAdmin && (
                                    <motion.form key="adm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleAdminSubmit} className="space-y-5" autoComplete="off">
                                        <input type="email" placeholder="Faculty Email" value={email} onChange={e => setEmail(e.target.value)} required className="h-13 w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all placeholder:text-slate-400 py-3.5" autoComplete="off" />
                                        <div className="relative">
                                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="h-13 w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all placeholder:text-slate-400 py-3.5" placeholder="Password" autoComplete="new-password" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900">
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-4 pt-1">
                                            <button disabled={loading} className="h-13 w-full rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.4em] transition-all hover:bg-slate-800 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] active:scale-[0.98] disabled:opacity-50 py-3.5 flex items-center justify-center gap-2">
                                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}{loading ? 'Verifying...' : 'Sign In'}
                                            </button>
                                            <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 text-center transition-colors">Forgot Password?</button>
                                        </div>
                                    </motion.form>
                                )}

                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </main>

            <AnimatePresence>
                {showForgotModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                            className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-12 shadow-2xl relative">
                            <button onClick={() => { setShowForgotModal(false); setForgotFeedback(null); }} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors"><X className="h-6 w-6" /></button>
                            <div className="mb-10 text-center">
                                <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">PASSWORD RESET</h2>
                                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Account Recovery Service</p>
                            </div>
                            {forgotFeedback && (
                                <div className={`mb-8 p-5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${forgotFeedback.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                                    {forgotFeedback.msg}
                                </div>
                            )}
                            <form onSubmit={handleForgotSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">University Email</label>
                                    <input type="email" placeholder="user@cuiatd.edu.pk" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required className="h-16 w-full rounded-2xl bg-slate-50 border border-slate-200 px-6 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 placeholder:text-slate-300" />
                                </div>
                                <button disabled={forgotLoading} className="w-full h-16 rounded-2xl bg-slate-900 text-white text-[12px] font-black uppercase tracking-[0.5em] active:scale-95 transition-all flex items-center justify-center gap-3">
                                    {forgotLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    RESET PASSWORD
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPage;
