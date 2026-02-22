import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2, GraduationCap, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import API from '../config/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setFeedback({ type: 'error', msg: 'Passwords do not match.' });
            return;
        }

        setLoading(true);
        setFeedback(null);

        try {
            const { data } = await axios.post(`${API.AUTH}/reset-password`, {
                token,
                password
            });

            if (data.success) {
                setFeedback({ type: 'success', msg: data.message });
                setTimeout(() => navigate('/'), 3000);
            }
        } catch (err: any) {
            setFeedback({
                type: 'error',
                msg: err.response?.data?.message || 'Failed to reset password. Link may be expired.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-50/30 flex items-center justify-center p-6">
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
                </nav>
            </header>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-blue-500/5 p-10 lg:p-16"
            >
                <div className="mb-12 text-center">
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Reset Password</h1>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Secure Credential Recovery</p>
                </div>

                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mb-8 flex items-start gap-4 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest ${feedback.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                }`}
                        >
                            {feedback.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                            {feedback.msg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {feedback?.type === 'success' ? (
                    <div className="text-center space-y-6">
                        <p className="text-sm font-bold text-slate-500">Redirecting to login page...</p>
                        <Link to="/" className="text-[11px] font-black uppercase tracking-widest text-blue-600 hover:underline">Back to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-14 w-full rounded-2xl bg-slate-50 border-none px-6 pr-14 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="h-14 w-full rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full h-16 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Update Password
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
