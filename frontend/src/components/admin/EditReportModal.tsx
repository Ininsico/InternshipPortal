import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';

interface EditReportModalProps {
    editReport: any;
    setEditReport: (v: any) => void;
    editReportForm: any;
    setEditReportForm: (v: any) => void;
    handleUpdateReport: (e: any) => void;
    editReportLoading: boolean;
    editReportError: string;
}

const EditReportModal = ({
    editReport,
    setEditReport,
    editReportForm,
    setEditReportForm,
    handleUpdateReport,
    editReportLoading,
    editReportError
}: EditReportModalProps) => {
    return (
        <AnimatePresence>
            {editReport && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6" onClick={() => setEditReport(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="bg-slate-900 p-8 flex items-center justify-between">
                            <div>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-1 italic">Administrative Override</p>
                                <h2 className="text-xl font-black text-white italic tracking-tight uppercase">Modify Evaluation Record</h2>
                            </div>
                            <button onClick={() => setEditReport(null)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateReport} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Overall Performance Rating (0-100)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="101"
                                        required
                                        value={editReportForm.overallRating}
                                        onChange={e => setEditReportForm({ ...editReportForm, overallRating: Number(e.target.value) })}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-xl font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Final Recommendation</label>
                                    <select
                                        value={editReportForm.recommendation}
                                        onChange={e => setEditReportForm({ ...editReportForm, recommendation: e.target.value })}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-sans"
                                    >
                                        <option value="excellent">Excellent</option>
                                        <option value="good">Good</option>
                                        <option value="satisfactory">Satisfactory</option>
                                        <option value="needs_improvement">Needs Improvement</option>
                                        <option value="unsatisfactory">Unsatisfactory</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Evaluation Summary / Feedback</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={editReportForm.summary}
                                    onChange={e => setEditReportForm({ ...editReportForm, summary: e.target.value })}
                                    className="w-full rounded-3xl bg-slate-50 border-none p-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300 italic"
                                    placeholder="Provide detailed feedback on student performance..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Completion Status</label>
                                    <select
                                        value={editReportForm.completionStatus}
                                        onChange={e => setEditReportForm({ ...editReportForm, completionStatus: e.target.value })}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-sans"
                                    >
                                        <option value="completed">Completed</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="incomplete">Incomplete</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-6">Detailed Competency Scores</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    {['technical', 'communication', 'teamwork', 'punctuality'].map((key) => (
                                        <div key={key}>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{key}</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={editReportForm.scores?.[key] || 0}
                                                onChange={e => setEditReportForm({
                                                    ...editReportForm,
                                                    scores: {
                                                        ...editReportForm.scores,
                                                        [key]: Number(e.target.value)
                                                    }
                                                })}
                                                className="w-full h-12 rounded-xl bg-slate-50 border-none px-4 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {editReportError && (
                                <p className="text-xs font-bold text-red-500 bg-red-50 p-4 rounded-2xl italic border border-red-100">
                                    ⚠ {editReportError}
                                </p>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditReport(null)}
                                    className="flex-1 h-14 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editReportLoading}
                                    className="flex-1 h-14 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {editReportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {editReportLoading ? 'Saving Changes...' : 'Save Override'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EditReportModal;
