import { Pencil } from 'lucide-react';

interface SubmissionsTabProps {
    submissions: any[];
    setEditSubmission: (s: any) => void;
}

const SubmissionsTab = ({ submissions, setEditSubmission }: SubmissionsTabProps) => {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Student Submissions</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Cross-platform task evaluations • Total: {submissions.length}</p>
            </div>

            <div className="rounded-[2.5rem] border border-slate-100 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                            <th className="px-10 py-6">Student</th>
                            <th className="px-10 py-6">Task Title</th>
                            <th className="px-10 py-6">Faculty Grade</th>
                            <th className="px-10 py-6">Company Grade</th>
                            <th className="px-10 py-6">Status</th>
                            <th className="px-10 py-6 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 italic">
                        {submissions.map((sub) => (
                            <tr key={sub._id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-10 py-6">
                                    <p className="text-sm font-black text-slate-900 leading-tight">{sub.student?.name}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{sub.student?.rollNumber}</p>
                                </td>
                                <td className="px-10 py-6 text-sm font-bold text-slate-600">
                                    {sub.task?.title}
                                </td>
                                <td className="px-10 py-6">
                                    {sub.facultyGrade?.marks !== null ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-blue-600">{sub.facultyGrade.marks}</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">/100</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-black text-slate-300 uppercase italic">Ungraded</span>
                                    )}
                                </td>
                                <td className="px-10 py-6">
                                    {sub.companyGrade?.marks !== null ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-indigo-600">{sub.companyGrade.marks}</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">/100</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-black text-slate-300 uppercase italic">Ungraded</span>
                                    )}
                                </td>
                                <td className="px-10 py-6">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">
                                        {sub.status?.replace(/_/g, ' ')}
                                    </div>
                                </td>
                                <td className="px-10 py-6 text-right">
                                    <button
                                        onClick={() => setEditSubmission(sub)}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubmissionsTab;
