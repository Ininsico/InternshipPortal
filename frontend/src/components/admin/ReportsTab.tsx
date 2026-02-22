import { motion } from 'framer-motion';
import { FileText, Trash2, Pencil } from 'lucide-react';

interface ReportsTabProps {
    reports: any[];
    handleDeleteReport: (id: string) => void;
    setSelectedReport: (report: any) => void;
    setEditReport: (report: any) => void;
}

const ReportsTab = ({ reports, handleDeleteReport, setSelectedReport, setEditReport }: ReportsTabProps) => {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Internship Reports</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Global faculty evaluations • Total: {reports.length}</p>
                </div>
            </div>

            {reports.length === 0 ? (
                <div className="rounded-[2.5rem] border border-slate-100 bg-white p-20 text-center">
                    <div className="mx-auto w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-6">
                        <FileText className="h-10 w-10 text-slate-200" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">No reports archived</h3>
                    <p className="text-xs text-slate-400 font-bold mt-2">Faculty evaluations will appear here once submitted.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reports.map((r) => (
                        <motion.div
                            key={r._id}
                            layoutId={r._id}
                            whileHover={{ y: -5 }}
                            className="group relative rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 h-32 w-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors duration-500" />

                            <div className="relative">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white text-xl font-black flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                        {r.student?.name?.[0]}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[32px] font-black text-slate-900 tracking-tighter leading-none">{r.overallRating}</span>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Score</span>
                                    </div>
                                </div>

                                <div className="mb-8 cursor-pointer" onClick={() => setSelectedReport(r)}>
                                    <h4 className="text-lg font-black text-slate-900 leading-tight truncate">{r.student?.name}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mt-1">{r.student?.rollNumber}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-4 leading-relaxed line-clamp-2 italic">"{r.summary}"</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Status</p>
                                        <p className="text-[10px] font-black text-slate-900 uppercase mt-1">{r.completionStatus}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Verdict</p>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase mt-1">{r.recommendation}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Supervisor</p>
                                        <p className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">{r.createdBy?.name}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditReport(r)}
                                            className="h-10 w-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReport(r._id)}
                                            className="h-10 w-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-90"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReportsTab;
