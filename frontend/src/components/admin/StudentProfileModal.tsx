import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, FileText } from 'lucide-react';
import StatusPill from '../StatusPill';
import API from '../../config/api';

interface StudentProfileModalProps {
    selectedStudent: any;
    setSelectedStudent: (student: any) => void;
    setChangeSupervisorTarget: (student: any) => void;
    setChangeSupervisorId: (id: string) => void;
}

const StudentProfileModal = ({
    selectedStudent,
    setSelectedStudent,
    setChangeSupervisorTarget,
    setChangeSupervisorId
}: StudentProfileModalProps) => {
    return (
        <AnimatePresence>
            {selectedStudent && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6" onClick={() => setSelectedStudent(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="relative h-40 bg-gradient-to-br from-blue-600 to-indigo-700 p-10 flex items-end">
                            <div className="absolute top-6 right-6 flex gap-2">
                                <button onClick={() => setSelectedStudent(null)} className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-sm transition-all">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 rounded-[2rem] bg-white text-blue-600 text-3xl font-black flex items-center justify-center shadow-xl overflow-hidden">
                                    {selectedStudent.profilePicture ? (
                                        <img src={selectedStudent.profilePicture.startsWith('http') ? selectedStudent.profilePicture : `${API.BASE}${selectedStudent.profilePicture}`} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        selectedStudent.name[0]
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white leading-none">{selectedStudent.name}</h2>
                                    <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mt-2 italic">{selectedStudent.rollNumber} • {selectedStudent.degree}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-10">
                            <div className="grid grid-cols-3 gap-8 mb-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
                                    <div className="pt-2"><StatusPill status={selectedStudent.internshipStatus} /></div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Supervisor</p>
                                    <p className="text-sm font-bold text-slate-900 mt-2">{selectedStudent.supervisorId?.name || 'Not assigned'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Contact</p>
                                    <p className="text-sm font-bold text-slate-900 mt-2">{selectedStudent.email}</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Pipeline Records</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${selectedStudent.pipeline?.hasApplication ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                    <Briefcase className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">Internship Application</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Step 1: Company Registration</p>
                                                </div>
                                            </div>
                                            <StatusPill status={selectedStudent.pipeline?.applicationStatus || 'none'} />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${selectedStudent.pipeline?.hasAgreement ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">Contract Agreement</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Step 2: Training Verification</p>
                                                </div>
                                            </div>
                                            <StatusPill status={selectedStudent.pipeline?.agreementStatus || 'none'} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <button
                                    onClick={() => {
                                        setChangeSupervisorTarget(selectedStudent);
                                        setChangeSupervisorId(selectedStudent.supervisorId?._id || '');
                                        setSelectedStudent(null);
                                    }}
                                    className="flex-1 h-14 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                                >
                                    Change Supervisor
                                </button>
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="flex-1 h-14 border border-slate-200 text-slate-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Close Profile
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StudentProfileModal;
