import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, Loader2, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

type FormMode = 'student' | 'admin';

interface ApiResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        id: string;
        name: string;
        role: string;
        rollNumber?: string;
        email?: string;
    };
}

const SESSIONS = ['FA20', 'SP20', 'FA21', 'SP21', 'FA22', 'SP22', 'FA23', 'SP23', 'FA24', 'SP24'];
const DEGREES = ['BSE', 'BCS', 'BBA'];
const API_BASE = 'http://localhost:5000/api/auth';

const LandingPage = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [mode, setMode] = useState<FormMode>('student');

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

    useEffect(() => {
        if (user) {
            if (user.role === 'student') navigate('/dashboard', { replace: true });
            else if (user.role === 'company_admin') navigate('/company-portal', { replace: true });
            else if (user.role === 'admin') navigate('/faculty-portal', { replace: true });
            else navigate('/admin', { replace: true }); // super_admin
        }
    }, [user, navigate]);

    if (user) return null;

    const switchMode = (next: FormMode) => {
        if (next === mode) return;
        setMode(next);
        setPassword('');
        setShowPassword(false);
        setFeedback(null);
        setEmail('');
        setRollId('');
    };

    const handleStudentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);
        setLoading(true);
        try {
            const { data } = await axios.post<ApiResponse>(`${API_BASE}/login/student`, {
                session, degree, rollId, password,
            });
            if (data.token && data.user) {
                login(data.token, data.user);
                navigate('/dashboard');
            }
            setFeedback({ type: 'success', msg: data.message });
        } catch (err: unknown) {
            const msg =
                axios.isAxiosError(err) && err.response?.data?.message
                    ? err.response.data.message
                    : 'Something went wrong. Please try again.';
            setFeedback({ type: 'error', msg });
        } finally {
            setLoading(false);
        }
    };

    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);
        setLoading(true);
        try {
            const { data } = await axios.post<ApiResponse>(`${API_BASE}/login/admin`, {
                email, password,
            });
            if (data.token && data.user) {
                login(data.token, data.user);
                const role = data.user.role;
                if (role === 'company_admin') navigate('/company-portal');
                else if (role === 'admin') navigate('/faculty-portal');
                else navigate('/admin'); // super_admin
            }
            setFeedback({ type: 'success', msg: data.message });
        } catch (err: unknown) {
            const msg =
                axios.isAxiosError(err) && err.response?.data?.message
                    ? err.response.data.message
                    : 'Something went wrong. Please try again.';
            setFeedback({ type: 'error', msg });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotFeedback(null);
        try {
            const { data } = await axios.post(`${API_BASE}/forgot-password`, { email: forgotEmail });
            setForgotFeedback({ type: 'success', msg: data.message });
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err) && err.response?.data?.message
                ? err.response.data.message
                : 'Something went wrong.';
            setForgotFeedback({ type: 'error', msg });
        } finally {
            setForgotLoading(false);
        }
    };

    const isAdmin = mode === 'admin';

    return (
        <div className="relative min-h-screen text-white selection:bg-blue-600 selection:text-white overflow-hidden">
            <div className="fixed inset-0 -z-10 bg-black">
                <img
                    src="/landingpagebg.png"
                    className="h-full w-full object-cover blur-[2px]"
                    alt="Background"
                />
            </div>

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
                            className="px-8 py-3.5 rounded-2xl bg-white text-blue-600 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:bg-slate-50 hover:shadow-[0_10px_30px_-5px_rgba(255,255,255,0.2)] active:scale-95"
                        >
                            {isAdmin ? 'Student Entry' : 'Faculty Access'}
                        </button>
                    </div>
                </nav>
            </header>

            <main className="relative flex min-h-screen items-center justify-center px-6 pt-20">
                <div className="absolute top-1/4 -left-20 -z-10 h-[600px] w-[600px] rounded-full bg-blue-600/[0.15] blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 -right-20 -z-10 h-[600px] w-[600px] rounded-full bg-indigo-600/[0.1] blur-[120px]" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 w-full max-w-[380px]"
                >
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)]">
                        <div className="p-8 lg:p-12">
                            <div className="mb-10 text-center">
                                <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter leading-none mb-3">
                                    {mode === 'admin' ? 'FACULTY' : 'STUDENT'}
                                </h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 opacity-80">Portal Authentication</p>
                            </div>
                            <AnimatePresence mode="wait">
                                {feedback && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className={`mb-8 flex items-center gap-4 rounded-xl border px-5 py-3 text-[9px] font-black uppercase tracking-widest ${feedback.type === 'error'
                                            ? 'bg-red-50 border-red-100 text-red-600'
                                            : 'bg-blue-50 border-blue-100 text-blue-600'
                                            }`}
                                    >
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>{feedback.msg}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence mode="wait">
                                {!isAdmin ? (
                                    <motion.form key="stu" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleStudentSubmit} className="space-y-6" autoComplete="off">
                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <select value={session} onChange={e => setSession(e.target.value)} className="h-14 flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-xs font-black text-slate-900 outline-none focus:border-blue-500 transition-all">
                                                    {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <select value={degree} onChange={e => setDegree(e.target.value)} className="h-14 flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-xs font-black text-slate-900 outline-none focus:border-blue-500 transition-all">
                                                    {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                            <input type="text" name="student_roll" placeholder="Roll Number" value={rollId} onChange={e => setRollId(e.target.value)} required className="h-14 w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all placeholder:text-slate-400" autoComplete="off" />
                                        </div>

                                        <div className="relative">
                                            <input type={showPassword ? 'text' : 'password'} name="student_password_entry" value={password} onChange={e => setPassword(e.target.value)} required className="h-14 w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all placeholder:text-slate-400" placeholder="Password" autoComplete="new-password" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900">
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-6 pt-2">
                                            <button disabled={loading} className="h-14 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.4em] transition-all hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:brightness-110 active:scale-[0.98] disabled:opacity-50">
                                                {loading ? "Verifying..." : "Sign In"}
                                            </button>
                                            <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 text-center transition-colors">Forgot Password?</button>
                                        </div>
                                    </motion.form>
                                ) : (
                                    <motion.form key="adm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleAdminSubmit} className="space-y-6" autoComplete="off">
                                        <input type="email" name="admin_email" placeholder="Faculty Email" value={email} onChange={e => setEmail(e.target.value)} required className="h-14 w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all placeholder:text-slate-400" autoComplete="off" />

                                        <div className="relative">
                                            <input type={showPassword ? 'text' : 'password'} name="admin_password_entry" value={password} onChange={e => setPassword(e.target.value)} required className="h-14 w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all placeholder:text-slate-400" placeholder="Password" autoComplete="new-password" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900">
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-6 pt-2">
                                            <button disabled={loading} className="h-14 w-full rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.4em] transition-all hover:bg-slate-800 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] active:scale-[0.98] disabled:opacity-50">
                                                {loading ? "Verifying..." : "Sign In"}
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
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-12 shadow-2xl relative"
                        >
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
                                    <input
                                        type="email"
                                        placeholder="user@comsats.edu.pk"
                                        value={forgotEmail}
                                        onChange={e => setForgotEmail(e.target.value)}
                                        required
                                        className="h-16 w-full rounded-2xl bg-slate-50 border border-slate-200 px-6 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 placeholder:text-slate-300"
                                    />
                                </div>
                                <button
                                    disabled={forgotLoading}
                                    className="w-full h-16 rounded-2xl bg-slate-900 text-white text-[12px] font-black uppercase tracking-[0.5em] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
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
