import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, Loader2, AlertCircle } from 'lucide-react';
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
const DEGREES = ['BCS', 'BSE', 'BBA', 'BEE', 'BME', 'BAR'];
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

    if (user) {
        if (user.role === 'student') {
            navigate('/dashboard', { replace: true });
        } else {
            navigate('/admin', { replace: true });
        }
        return null;
    }

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
                navigate('/admin');
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

    const isAdmin = mode === 'admin';

    return (
        <div className="relative min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-hidden">

            <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-2xl">
                <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-xl shadow-blue-500/10">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-lg font-black tracking-tight text-slate-900 uppercase">COMSATS</span>
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">Internship Portal</span>
                        </div>
                    </div>

                    <div className="hidden items-center gap-4 md:flex">
                        <button
                            onClick={() => switchMode(isAdmin ? 'student' : 'admin')}
                            className="flex items-center gap-2 rounded-xl border border-slate-100 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all font-bold"
                        >
                            {isAdmin ? 'Student Access' : 'Faculty Access'}
                        </button>
                    </div>
                </nav>
            </header>

            <main className="relative flex min-h-screen items-center justify-center px-6 pt-20 bg-slate-50/30">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="relative z-10 w-full max-w-lg"
                >
                    <div className="overflow-hidden rounded-[3rem] border border-slate-100 bg-white shadow-2xl shadow-blue-500/5">

                        <div className="flex border-b border-slate-50">
                            {(['student', 'admin'] as FormMode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => switchMode(m)}
                                    className={`flex-1 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${mode === m
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {m === 'student' ? 'Student' : 'Faculty Admin'}
                                </button>
                            ))}
                        </div>

                        <div className="p-10 lg:p-16">
                            <div className="mb-12 text-center text-slate-900">
                                <h1 className="text-3xl font-black uppercase tracking-tighter">
                                    {isAdmin ? 'Faculty Login' : 'Student Login'}
                                </h1>
                                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">
                                    {isAdmin ? 'Staff Credentials Only' : 'Enter University Credentials'}
                                </p>
                            </div>

                            <AnimatePresence>
                                {feedback && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className={`mb-8 flex items-start gap-4 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest ${feedback.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                            }`}
                                    >
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        {feedback.msg}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence mode="wait">
                                {!isAdmin ? (
                                    <motion.form key="stu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleStudentSubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Roll Number</label>
                                            <div className="flex gap-3">
                                                <select value={session} onChange={e => setSession(e.target.value)} className="h-14 w-28 rounded-2xl bg-slate-50 border-none px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100">
                                                    {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <select value={degree} onChange={e => setDegree(e.target.value)} className="h-14 w-28 rounded-2xl bg-slate-50 border-none px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100">
                                                    {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                                <input type="text" placeholder="001" value={rollId} onChange={e => setRollId(e.target.value)} required className="h-14 flex-1 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Password</label>
                                            <div className="relative group">
                                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="h-14 w-full rounded-2xl bg-slate-50 border-none px-6 pr-14 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100" />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                                            </div>
                                        </div>
                                        <button disabled={loading} className="w-full h-16 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            Sign In
                                        </button>
                                    </motion.form>
                                ) : (
                                    <motion.form key="adm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleAdminSubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                            <input type="email" placeholder="admin@comsats.edu.pk" value={email} onChange={e => setEmail(e.target.value)} required className="h-14 w-full rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Password</label>
                                            <div className="relative group">
                                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="h-14 w-full rounded-2xl bg-slate-50 border-none px-6 pr-14 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100" />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                                            </div>
                                        </div>
                                        <button disabled={loading} className="w-full h-16 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            Sign In
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </main>

            <footer className="absolute bottom-10 left-0 right-0 text-center">
                <p className="text-[9px] font-black tracking-[0.4em] uppercase text-slate-300">
                    Proprietary Interface / 2026 COMSATS University
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;
