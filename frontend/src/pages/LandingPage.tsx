import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, User, Mail, ShieldCheck, GraduationCap, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Constants ────────────────────────────────────────────────────────────────
const SESSIONS = ['FA20', 'SP20', 'FA21', 'SP21', 'FA22', 'SP22', 'FA23', 'SP23', 'FA24', 'SP24'];
const DEGREES = ['BCS', 'BSE', 'BBA', 'BEE', 'BME', 'BAR'];
const API_BASE = 'http://localhost:5000/api/auth';

// ─── Component ────────────────────────────────────────────────────────────────
const LandingPage = () => {
    const [mode, setMode] = useState<FormMode>('student');

    // Student fields
    const [session, setSession] = useState('FA21');
    const [degree, setDegree] = useState('BCS');
    const [rollId, setRollId] = useState('');

    // Admin fields
    const [email, setEmail] = useState('');

    // Shared
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

    // ── Switch mode & reset state ────────────────────────────────────────────
    const switchMode = (next: FormMode) => {
        if (next === mode) return;
        setMode(next);
        setPassword('');
        setShowPassword(false);
        setFeedback(null);
        setEmail('');
        setRollId('');
    };

    // ── Student submit ────────────────────────────────────────────────────────
    const handleStudentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);
        setLoading(true);
        try {
            const { data } = await axios.post<ApiResponse>(`${API_BASE}/login/student`, {
                session, degree, rollId, password,
            });
            setFeedback({ type: 'success', msg: data.message });
            // TODO: store token & redirect
            if (data.token) localStorage.setItem('token', data.token);
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

    // ── Admin submit ──────────────────────────────────────────────────────────
    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);
        setLoading(true);
        try {
            const { data } = await axios.post<ApiResponse>(`${API_BASE}/login/admin`, {
                email, password,
            });
            setFeedback({ type: 'success', msg: data.message });
            if (data.token) localStorage.setItem('token', data.token);
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

    // ── Shared UI ─────────────────────────────────────────────────────────────
    const isAdmin = mode === 'admin';

    return (
        <div className="relative min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-hidden">

            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-blue-100/30 bg-white/60 backdrop-blur-2xl">
                <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

                    {/* Logo */}
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <motion.div
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-xl shadow-blue-500/10 ring-1 ring-blue-50 p-1.5 transition-all group-hover:ring-blue-200"
                        >
                            <img src="/comstaslogo.png" alt="COMSATS Logo" className="h-full w-full object-contain" />
                        </motion.div>
                        <div className="flex flex-col leading-none">
                            <span className="text-xl font-extrabold tracking-tight text-slate-900">COMSATS</span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-1">Internship Portal</span>
                        </div>
                    </div>

                    {/* Nav actions */}
                    <div className="hidden items-center gap-4 md:flex">
                        <button className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors px-4 py-2">
                            Helper Center
                        </button>
                        <div className="h-4 w-px bg-slate-200" />

                        {/* Admin toggle — switches the form, no navigation */}
                        <button
                            onClick={() => switchMode(isAdmin ? 'student' : 'admin')}
                            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg transition-all active:scale-95 ${isAdmin
                                ? 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700'
                                : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800'
                                }`}
                        >
                            {isAdmin
                                ? <><GraduationCap className="h-4 w-4" /> Student Login</>
                                : <><ShieldCheck className="h-4 w-4" /> Admin Login</>
                            }
                        </button>
                    </div>
                </nav>
            </header>

            {/* ── Main ───────────────────────────────────────────────────────────── */}
            <main className="relative flex min-h-screen items-center justify-center px-6 pt-20">

                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <img src="/landingpagebg.png" alt="Background" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-transparent to-white/60" />
                </div>

                {/* ── Login Card ─────────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 w-full max-w-xl"
                >
                    <div className="overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/80 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] backdrop-blur-3xl">

                        {/* Mode tab strip */}
                        <div className="flex border-b border-slate-100">
                            {(['student', 'admin'] as FormMode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => switchMode(m)}
                                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${mode === m
                                        ? (m === 'admin' ? 'text-slate-900 border-b-2 border-slate-900 bg-slate-50' : 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50')
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {m === 'student' ? '🎓 Student' : '🛡️ Admin'}
                                </button>
                            ))}
                        </div>

                        <div className="p-8 lg:p-14">
                            {/* Header text */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={mode}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.25 }}
                                    className="mb-10 text-center"
                                >
                                    <h2 className="text-4xl font-black tracking-tight text-slate-900">
                                        {isAdmin ? 'Admin Portal' : 'Welcome Back'}
                                    </h2>
                                    <p className="mt-3 text-sm font-bold text-slate-500">
                                        {isAdmin
                                            ? 'Sign in with your admin credentials'
                                            : 'Please enter your university credentials'}
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            {/* Feedback banner */}
                            <AnimatePresence>
                                {feedback && (
                                    <motion.div
                                        key="feedback"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-6 overflow-hidden"
                                    >
                                        <div
                                            className={`flex items-start gap-3 rounded-2xl px-5 py-4 text-sm font-bold ${feedback.type === 'error'
                                                ? 'bg-red-50 text-red-700 border border-red-100'
                                                : 'bg-green-50 text-green-700 border border-green-100'
                                                }`}
                                        >
                                            {feedback.type === 'error'
                                                ? <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                                : <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                                            }
                                            {feedback.msg}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* ── FORM ─────────────────────────────────────────────────── */}
                            <AnimatePresence mode="wait">
                                {/* ── Student form ────────────────────────────────────────── */}
                                {!isAdmin && (
                                    <motion.form
                                        key="student-form"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        onSubmit={handleStudentSubmit}
                                        className="space-y-8"
                                    >
                                        {/* Roll Number */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                                                <User className="h-3 w-3" /> Roll Number
                                            </label>
                                            <div className="flex flex-wrap gap-3">
                                                <select
                                                    value={session}
                                                    onChange={(e) => setSession(e.target.value)}
                                                    className="h-14 w-28 rounded-2xl border border-slate-200 bg-white/50 px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                                >
                                                    {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <select
                                                    value={degree}
                                                    onChange={(e) => setDegree(e.target.value)}
                                                    className="h-14 w-28 rounded-2xl border border-slate-200 bg-white/50 px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                                >
                                                    {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Serial (e.g. 001)"
                                                    value={rollId}
                                                    onChange={(e) => setRollId(e.target.value)}
                                                    required
                                                    className="h-14 flex-1 min-w-[120px] rounded-2xl border border-slate-200 bg-white/50 px-6 text-sm font-bold text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300 placeholder:font-medium"
                                                />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <PasswordField
                                            value={password}
                                            onChange={setPassword}
                                            show={showPassword}
                                            onToggle={() => setShowPassword(!showPassword)}
                                            accentRing="focus:border-blue-500 focus:ring-blue-500/10"
                                        />

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-4">
                                            <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-2">
                                                Forgot Password?
                                            </a>
                                            <SubmitButton loading={loading} label="Sign In" className="bg-blue-600 shadow-blue-600/40 hover:bg-blue-700" />
                                        </div>
                                    </motion.form>
                                )}

                                {/* ── Admin form ───────────────────────────────────────────── */}
                                {isAdmin && (
                                    <motion.form
                                        key="admin-form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        onSubmit={handleAdminSubmit}
                                        className="space-y-8"
                                    >
                                        {/* Email */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                                                <Mail className="h-3 w-3" /> Email Address
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="admin@comsats.edu.pk"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                autoComplete="email"
                                                className="h-14 w-full rounded-2xl border border-slate-200 bg-white/50 px-6 text-sm font-bold text-slate-800 outline-none transition-all focus:border-slate-700 focus:ring-4 focus:ring-slate-900/10 placeholder:text-slate-300 placeholder:font-medium"
                                            />
                                        </div>

                                        {/* Password */}
                                        <PasswordField
                                            value={password}
                                            onChange={setPassword}
                                            show={showPassword}
                                            onToggle={() => setShowPassword(!showPassword)}
                                            accentRing="focus:border-slate-700 focus:ring-slate-900/10"
                                        />

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-4">
                                            <a href="#" className="text-xs font-bold text-slate-600 hover:text-slate-800 underline underline-offset-4 decoration-2">
                                                Forgot Password?
                                            </a>
                                            <SubmitButton loading={loading} label="Admin Access" className="bg-slate-900 shadow-slate-900/40 hover:bg-slate-800" />
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* ── Footer ─────────────────────────────────────────────────────────── */}
            <footer className="absolute bottom-6 left-0 right-0 text-center">
                <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">
                    &copy; 2026 COMSATS University Islamabad. Higher Education Portal.
                </p>
            </footer>
        </div>
    );
};

// ─── Shared sub-components ────────────────────────────────────────────────────

interface PasswordFieldProps {
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
    accentRing: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ value, onChange, show, onToggle, accentRing }) => (
    <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
            <Lock className="h-3 w-3" /> Password
        </label>
        <div className="relative group">
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required
                autoComplete="current-password"
                className={`h-14 w-full rounded-2xl border border-slate-200 bg-white/50 px-6 pr-14 text-sm font-bold text-slate-800 outline-none transition-all focus:ring-4 placeholder:text-slate-300 ${accentRing}`}
                placeholder="Your secret key"
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
        </div>
    </div>
);

interface SubmitButtonProps {
    loading: boolean;
    label: string;
    className: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ loading, label, className }) => (
    <button
        type="submit"
        disabled={loading}
        className={`flex items-center gap-3 rounded-2xl px-10 py-4 text-sm font-black text-white shadow-[0_20px_40px_-10px] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {label}
    </button>
);

export default LandingPage;
