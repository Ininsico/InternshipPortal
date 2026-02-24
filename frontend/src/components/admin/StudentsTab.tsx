import { Briefcase, Trash2, Building2, User, Mail, ShieldCheck, FileText, Star, Phone, Search } from 'lucide-react';
import StatusPill from '../StatusPill';

interface StudentsTabProps {
    students: any[];
    isSuperAdmin: boolean;
    setSelectedStudent: (student: any) => void;
    setChangeSupervisorTarget: (student: any) => void;
    setChangeSupervisorId: (id: string) => void;
    setDeleteStudentTarget: (student: any) => void;
    handleResendStudentEmail: (email: string) => void;
    onSyncPlacement: (student: any) => void;
}

const StudentsTab = ({
    students,
    isSuperAdmin,
    setSelectedStudent,
    setChangeSupervisorTarget,
    setChangeSupervisorId,
    setDeleteStudentTarget,
    handleResendStudentEmail,
    onSyncPlacement
}: StudentsTabProps) => {
    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Student Records</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Single source of truth for internship pipeline</p>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-4">
                    <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pending: {students.filter(s => s.pipeline?.applicationStatus === 'pending').length}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Contracts: {students.filter(s => s.pipeline?.agreementStatus === 'pending').length}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {students.map((stu: any) => (
                    <div key={stu._id} className="group relative rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm hover:border-blue-200 transition-all hover:shadow-2xl hover:shadow-blue-500/5 overflow-hidden">
                        {/* Background Accent */}
                        <div className="absolute top-0 right-0 h-32 w-32 bg-blue-50/50 rounded-bl-full -mr-16 -mt-16 group-hover:bg-blue-600/5 transition-colors" />

                        <div className="relative z-10">
                            {/* Student Header */}
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-5">
                                    <div className="h-16 w-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-xl shadow-slate-200 group-hover:bg-blue-600 group-hover:shadow-blue-200 transition-all duration-500">
                                        {stu.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900 leading-tight mb-1">
                                            {stu.name}
                                        </h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stu.rollNumber} · {stu.degree}</p>
                                        <div className="flex gap-2 mt-3 items-center">
                                            <StatusPill status={stu.pipeline?.applicationStatus || 'none'} />
                                            <StatusPill status={stu.pipeline?.agreementStatus || 'none'} />
                                            {!stu.isEmailVerified && (
                                                <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 italic">Unverified</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedStudent(stu)}
                                        className="h-10 px-4 flex items-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-black transition-all shadow-lg shadow-blue-200"
                                        title="View Full Profile"
                                    >
                                        <Search className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Details</span>
                                    </button>
                                    {!stu.isEmailVerified && isSuperAdmin && (
                                        <button
                                            onClick={() => handleResendStudentEmail(stu.email)}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                                            title="Resend Verification Email"
                                        >
                                            <Mail className="h-4 w-4" />
                                        </button>
                                    )}
                                    {isSuperAdmin && (
                                        <>
                                            <button
                                                onClick={() => onSyncPlacement(stu)}
                                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="Edit Records"
                                            >
                                                <FileText className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setChangeSupervisorTarget(stu);
                                                    setChangeSupervisorId(stu.supervisorId?._id || '');
                                                }}
                                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                                title="Manage Supervisor"
                                            >
                                                <Briefcase className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteStudentTarget(stu)}
                                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                title="Delete Student"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Internship Details Column */}
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2 italic">
                                            <Building2 className="h-3 w-3" /> Internship Placement
                                        </p>
                                        {stu.assignedCompany ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 leading-tight">{stu.assignedCompany}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{stu.assignedPosition}</p>
                                                </div>
                                                <div className="space-y-2.5">
                                                    <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-500">
                                                        <User className="h-3.5 w-3.5 text-blue-400 shrink-0" /> {stu.siteSupervisorName || 'Supervisor N/A'}
                                                    </div>
                                                    <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-500 truncate">
                                                        <Mail className="h-3.5 w-3.5 text-blue-400 shrink-0" /> {stu.siteSupervisorEmail || 'Email N/A'}
                                                    </div>
                                                    <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-500">
                                                        <Phone className="h-3.5 w-3.5 text-blue-400 shrink-0" /> {stu.siteSupervisorPhone || 'No Contact'}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-32 rounded-3xl bg-slate-50/50 border-2 border-dashed border-slate-100 flex items-center justify-center text-center p-6">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">No Internship Assigned Yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Supervision & Reports Column */}
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2 italic">
                                            <ShieldCheck className="h-3 w-3" /> Supervision Record
                                        </p>
                                        <div className="rounded-2xl bg-indigo-50/30 border border-indigo-100/50 p-4">
                                            {stu.supervisorId ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                                                        {stu.supervisorId.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-slate-900">{stu.supervisorId.name}</p>
                                                        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{stu.supervisorId.email}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 italic">
                                                    <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                                        <ShieldCheck className="h-5 w-5" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Supervisor Unassigned</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2 italic">
                                            <FileText className="h-3 w-3" /> Academic Evaluation
                                        </p>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stu.pipeline?.hasReport ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        <Star className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                                            {stu.pipeline?.hasReport ? 'Grade Finalized' : 'Eval. Pending'}
                                                        </p>
                                                        <p className="text-[9px] font-bold text-slate-400 italic">
                                                            {stu.pipeline?.hasReport ? `Assessed on ${new Date().toLocaleDateString()}` : 'No report submitted'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {stu.pipeline?.hasReport && (
                                                    <div className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-200">
                                                        {stu.pipeline.reportRating}%
                                                    </div>
                                                )}
                                            </div>
                                            {stu.pipeline?.hasReport && (
                                                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1 italic">Report Summary</p>
                                                    <p className="text-[10px] font-bold text-slate-600 leading-relaxed italic">"Performance is {stu.pipeline.reportStatus}. Student has demonstrated solid competence in assigned tasks."</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {students.length === 0 && (
                <div className="py-32 text-center rounded-[3rem] border-2 border-dashed border-slate-100 bg-white/50">
                    <User className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">No student records found in current batch</p>
                </div>
            )}
        </div>
    );
};

export default StudentsTab;
