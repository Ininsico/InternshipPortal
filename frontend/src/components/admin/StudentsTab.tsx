import { Search, Briefcase } from 'lucide-react';
import StatusPill from '../StatusPill';

interface StudentsTabProps {
    students: any[];
    isSuperAdmin: boolean;
    setSelectedStudent: (student: any) => void;
    setChangeSupervisorTarget: (student: any) => void;
    setChangeSupervisorId: (id: string) => void;
}

const StudentsTab = ({
    students,
    isSuperAdmin,
    setSelectedStudent,
    setChangeSupervisorTarget,
    setChangeSupervisorId
}: StudentsTabProps) => {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Student Records</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Single source of truth for internship pipeline</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pending Apps: {students.filter(s => s.pipeline?.applicationStatus === 'pending').length}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Pending Contracts: {students.filter(s => s.pipeline?.agreementStatus === 'pending').length}</span>
                    </div>
                </div>
            </div>

            <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/30 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <th className="px-10 py-6">Student Information</th>
                            <th className="px-10 py-6">Internship Status</th>
                            <th className="px-10 py-6">Contract Status</th>
                            <th className="px-10 py-6">Faculty Supervisor</th>
                            <th className="px-10 py-6">Progress</th>
                            <th className="px-10 py-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {students.map((stu: any) => (
                            <tr key={stu._id} className="group hover:bg-slate-50/80 transition-all duration-300">
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                            {stu.name[0]}
                                        </div>
                                        <div>
                                            <p
                                                className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer"
                                                onClick={() => setSelectedStudent(stu)}
                                            >
                                                {stu.name}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{stu.rollNumber} · {stu.degree}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <StatusPill status={stu.pipeline?.applicationStatus || 'none'} />
                                </td>
                                <td className="px-10 py-6">
                                    <StatusPill status={stu.pipeline?.agreementStatus || 'none'} />
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-slate-600">
                                            {stu.supervisorId?.name || (
                                                <span className="text-amber-500 flex items-center gap-1.5 font-black uppercase text-[10px] tracking-widest bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 italic">
                                                    ⚠ Unassigned
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="w-32 space-y-2">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
                                            <span>Pipe Status</span>
                                            <span>
                                                {stu.pipeline?.hasApplication && stu.pipeline?.hasAgreement && stu.supervisorId ? '100%' :
                                                    stu.pipeline?.hasApplication && stu.pipeline?.hasAgreement ? '66%' :
                                                        stu.pipeline?.hasApplication ? '33%' : '0%'}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 bg-blue-600`}
                                                style={{
                                                    width: stu.pipeline?.hasApplication && stu.pipeline?.hasAgreement && stu.supervisorId ? '100%' :
                                                        stu.pipeline?.hasApplication && stu.pipeline?.hasAgreement ? '66%' :
                                                            stu.pipeline?.hasApplication ? '33%' : '0%'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    {isSuperAdmin && (
                                        <button
                                            onClick={() => {
                                                setChangeSupervisorTarget(stu);
                                                setChangeSupervisorId(stu.supervisorId?._id || '');
                                            }}
                                            className="h-10 px-4 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                                        >
                                            <Briefcase className="h-3.5 w-3.5" /> Manage
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentsTab;
