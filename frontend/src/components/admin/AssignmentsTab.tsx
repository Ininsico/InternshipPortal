import { ClipboardList } from 'lucide-react';
import StatusPill from '../StatusPill';

interface AssignmentsTabProps {
    verifiedStudents: any[];
    setAssignTarget: (student: any) => void;
    setAssignForm: (form: any) => void;
    setAssignError: (err: string) => void;
}

const AssignmentsTab = ({
    verifiedStudents,
    setAssignTarget,
    setAssignForm,
    setAssignError
}: AssignmentsTabProps) => {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Internship Assignment — Agreement Verified ({verifiedStudents.length})</h3>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="px-8 py-4">Student</th>
                            <th className="px-8 py-4">Degree</th>
                            <th className="px-8 py-4">Current Supervisor</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {verifiedStudents.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                    No students with verified agreements
                                </td>
                            </tr>
                        ) : (
                            verifiedStudents.map((stu: any) => (
                                <tr key={stu._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs font-black text-blue-600">{stu.name[0]}</div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{stu.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{stu.rollNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-xs font-semibold text-slate-500">{stu.degree}</td>
                                    <td className="px-8 py-4 text-xs font-semibold text-slate-600">{stu.supervisorId?.name || <span className="text-slate-300">Not assigned</span>}</td>
                                    <td className="px-8 py-4"><StatusPill status={stu.internshipStatus} /></td>
                                    <td className="px-8 py-4">
                                        <button
                                            onClick={() => {
                                                setAssignTarget(stu);
                                                setAssignForm({
                                                    facultySupervisorId: stu.supervisorId?._id || '',
                                                    assignedCompany: stu.latestApplication?.companyName || '',
                                                    assignedPosition: stu.latestApplication?.position || '',
                                                    siteSupervisorName: '',
                                                    siteSupervisorEmail: '',
                                                    siteSupervisorPhone: ''
                                                });
                                                setAssignError('');
                                            }}
                                            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all"
                                        >
                                            <ClipboardList className="h-3.5 w-3.5" /> Assign
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AssignmentsTab;
