import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import API from '../config/api';

const AdminOnboarding = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        if (password !== confirmPassword) {
            return setFeedback({ type: 'error', msg: 'Passwords do not match.' });
        }

        if (password.length < 6) {
            return setFeedback({ type: 'error', msg: 'Password must be at least 6 characters.' });
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${API.AUTH}/complete-onboarding`, {
                token,
                password,
                name: name || undefined,
            });

            if (data.success) {
                setFeedback({ type: 'success', msg: 'Account activated! Redirecting to login...' });
                setTimeout(() => navigate('/'), 3000);
            }
        } catch (err: any) {
            setFeedback({
                type: 'error',
                msg: err.response?.data?.message || 'Failed to initialize account. Link may be expired.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-slate-50 selection:bg-blue-600 selection:text-white px-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
                    <div className="p-6 sm:p-10 lg:p-12">
                        <div className="text-center mb-8 sm:mb-10">
                            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tighter leading-none mb-2 italic">ACCESS INITIALIZATION</h1>
                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 opacity-80">Staff Onboarding Protocol</p>
                        </div>

                        {feedback && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`mb-8 flex items-start gap-3 rounded-2xl border px-5 py-4 text-[10px] font-black uppercase tracking-widest leading-relaxed ${feedback.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}
                            >
                                {feedback.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> : <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />}
                                <span>{feedback.msg}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block ml-1">Confirm Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Dr. John Doe"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 placeholder:text-slate-300 transition-all font-sans"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block ml-1">Security Credential</label>
                                    <div className="relative">
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            placeholder="Set Security Password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 placeholder:text-slate-300 transition-all font-sans"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900"
                                        >
                                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block ml-1">Verify Password</label>
                                    <input
                                        type="password"
                                        placeholder="Repeat Security Password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 placeholder:text-slate-300 transition-all font-sans"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading || feedback?.type === 'success'}
                                className="w-full h-14 sm:h-16 rounded-2xl bg-blue-600 text-white font-black text-[11px] sm:text-[12px] uppercase tracking-[0.4em] transition-all hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 italic"
                            >
                                {loading ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : 'Activate Account Hub'}
                            </button>

                            <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest leading-relaxed">
                                Note: This action binds your email to the CU Portal Ecosystem.<br />Keep your credentials confidential.
                            </p>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminOnboarding;
