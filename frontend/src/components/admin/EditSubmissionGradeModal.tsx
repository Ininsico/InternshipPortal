import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';

interface EditSubmissionProps {
    editSubmission: any;
    setEditSubmission: (v: any) => void;
    editSubmissionForm: any;
    setEditSubmissionForm: (v: any) => void;
    handleUpdateSubmission: (e: any) => void;
    editSubmissionLoading: boolean;
    editSubmissionError: string;
}

const EditSubmissionGradeModal = ({
    editSubmission,
    setEditSubmission,
    editSubmissionForm,
    setEditSubmissionForm,
    handleUpdateSubmission,
    editSubmissionLoading,
    editSubmissionError
}: EditSubmissionProps) => {
    return (
        <AnimatePresence>
            {editSubmission && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6" onClick={() => setEditSubmission(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="bg-slate-900 p-8 flex items-center justify-between">
                            <div>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-1 italic">Grade Intervention</p>
                                <h2 className="text-xl font-black text-white italic tracking-tight uppercase">Modify Submission Marks</h2>
                            </div>
                            <button onClick={() => setEditSubmission(null)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSubmission} className="p-10 space-y-8">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 italic">Student & Task</p>
                                <p className="text-sm font-black text-slate-900 leading-none">{editSubmission.student?.name}</p>
                                <p className="text-[11px] font-bold text-blue-600 mt-2 italic">{editSubmission.task?.title}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Faculty Grade</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={editSubmissionForm.facultyGrade?.marks || 0}
                                        onChange={e => setEditSubmissionForm({
                                            ...editSubmissionForm,
                                            facultyGrade: { ...editSubmissionForm.facultyGrade, marks: Number(e.target.value) }
                                        })}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-xl font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-sans"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Company Grade</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={editSubmissionForm.companyGrade?.marks || 0}
                                        onChange={e => setEditSubmissionForm({
                                            ...editSubmissionForm,
                                            companyGrade: { ...editSubmissionForm.companyGrade, marks: Number(e.target.value) }
                                        })}
                                        className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-xl font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-sans"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Submission Status</label>
                                <select
                                    value={editSubmissionForm.status}
                                    onChange={e => setEditSubmissionForm({ ...editSubmissionForm, status: e.target.value })}
                                    className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-sans"
                                >
                                    <option value="submitted">Submitted</option>
                                    <option value="graded_by_company">Graded by Company</option>
                                    <option value="graded_by_faculty">Graded by Faculty</option>
                                    <option value="fully_graded">Fully Graded</option>
                                </select>
                            </div>

                            {editSubmissionError && (
                                <p className="text-xs font-bold text-red-500 bg-red-50 p-4 rounded-2xl italic border border-red-100">
                                    ⚠ {editSubmissionError}
                                </p>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditSubmission(null)}
                                    className="flex-1 h-14 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={editSubmissionLoading}
                                    className="flex-1 h-14 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {editSubmissionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {editSubmissionLoading ? 'Saving...' : 'Confirm Overwrite'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EditSubmissionGradeModal;
