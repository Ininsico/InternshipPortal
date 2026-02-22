import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';

interface ReportDetailsModalProps {
    selectedReport: any;
    setSelectedReport: (report: any) => void;
    handleDeleteReport: (id: string) => void;
    setEditReport: (report: any) => void;
}

const ReportDetailsModal = ({
    selectedReport,
    setSelectedReport,
    handleDeleteReport,
    setEditReport
}: ReportDetailsModalProps) => {
    return (
        <AnimatePresence>
            {selectedReport && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6" onClick={() => setSelectedReport(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-10 flex items-start justify-between">
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 rounded-[2rem] bg-white/10 backdrop-blur-lg border border-white/20 text-white text-3xl font-black flex items-center justify-center shadow-xl">
                                    {selectedReport.student?.name?.[0]}
                                </div>
                                <div>
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1 italic">Faculty Evaluation Record</p>
                                    <h2 className="text-2xl font-black text-white leading-none">{selectedReport.student?.name}</h2>
                                    <p className="text-white/50 text-xs font-black uppercase tracking-[0.2em] mt-3">{selectedReport.student?.rollNumber}</p>
                                </div>
                            </div>
                            <div className="h-10 w-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 cursor-pointer text-white" onClick={() => setSelectedReport(null)}>
                                <X className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Performance Rating</p>
                                    <p className="text-3xl font-black text-slate-900">{selectedReport.overallRating}<span className="text-base text-slate-300 ml-1">/100</span></p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Verdict</p>
                                    <p className="text-xl font-black text-indigo-600 uppercase italic tracking-tight">{selectedReport.recommendation}</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <section>
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <div className="h-1 w-4 bg-indigo-500 rounded-full" /> Evaluation Summary
                                    </h4>
                                    <p className="text-sm font-bold text-slate-600 leading-relaxed italic border-l-4 border-indigo-100 pl-6 bg-slate-50/50 py-4 rounded-r-2xl">
                                        "{selectedReport.summary}"
                                    </p>
                                </section>

                                <div className="grid grid-cols-2 gap-10 border-t border-slate-100 pt-10">
                                    <section>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Tasks Conducted</h4>
                                        <p className="text-xs font-bold text-slate-800 leading-relaxed">{selectedReport.tasksConducted || 'N/A'}</p>
                                    </section>
                                    <section>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Learning Outcomes</h4>
                                        <p className="text-xs font-bold text-slate-800 leading-relaxed">{selectedReport.learningOutcomes || 'N/A'}</p>
                                    </section>
                                </div>

                                <section className="bg-slate-900 text-white rounded-3xl p-8 mt-10">
                                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 italic">Supervisor Meta Information</h4>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl">{selectedReport.createdBy?.name?.charAt(0)}</div>
                                            <div>
                                                <p className="text-sm font-black">{selectedReport.createdBy?.name}</p>
                                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Faculty Official</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Submitted on</p>
                                            <p className="text-xs font-bold mt-1">{new Date(selectedReport.updatedAt).toLocaleDateString() || 'N/A'}</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                        <div className="p-8 border-t border-slate-50 flex gap-4">
                            <button
                                onClick={() => handleDeleteReport(selectedReport._id)}
                                className="flex-1 h-14 bg-red-50 text-red-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" /> Delete Record
                            </button>
                            <button
                                onClick={() => setEditReport(selectedReport)}
                                className="flex-1 h-14 bg-indigo-50 text-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                            >
                                Edit Record
                            </button>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="flex-1 h-14 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                            >
                                Close Record
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReportDetailsModal;
