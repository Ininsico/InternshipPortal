import { ArrowUpRight, Loader2 } from 'lucide-react';
import StatusPill from '../StatusPill';

interface ApprovalsTabProps {
    students: any[];
    handleViewApp: (id: string) => void;
    viewAppLoading: boolean;
    handleApprove: (id: string, status: string) => void;
}

const ApprovalsTab = ({ students, handleViewApp, viewAppLoading, handleApprove }: ApprovalsTabProps) => {
    const pendingStudents = students.filter((s: any) => s.internshipStatus === 'submitted');

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Pending Internship Approvals</h3>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="px-8 py-4">Student</th>
                            <th className="px-8 py-4">Internship Info</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {pendingStudents.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                    No pending approval requests
                                </td>
                            </tr>
                        ) : (
                            pendingStudents.map((stu: any) => (
                                <tr key={stu._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{stu.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stu.rollNumber}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <button
                                            onClick={() => handleViewApp(stu._id)}
                                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 hover:bg-blue-50 transition-all"
                                        >
                                            {viewAppLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowUpRight className="h-3 w-3" />} View Details
                                        </button>
                                    </td>
                                    <td className="px-8 py-4">
                                        <StatusPill status="pending" />
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(stu._id, 'approved')}
                                                className="rounded-lg bg-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleApprove(stu._id, 'rejected')}
                                                className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-100 transition-all"
                                            >
                                                Reject
                                            </button>
                                        </div>
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

export default ApprovalsTab;
