import { CheckCircle2, XCircle } from 'lucide-react';
import StatusPill from '../StatusPill';

interface AgreementsTabProps {
    agreements: any[];
    handleVerifyAgreement: (id: string, status: string) => void;
}

const AgreementsTab = ({ agreements, handleVerifyAgreement }: AgreementsTabProps) => {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Contract Verification — Pending Agreements ({agreements.length})</h3>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[560px]">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="px-8 py-4">Student</th>
                                <th className="px-8 py-4">Company / Position</th>
                                <th className="px-8 py-4">Type</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {agreements.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                        No agreements pending verification
                                    </td>
                                </tr>
                            ) : (
                                agreements.map((agr: any) => (
                                    <tr key={agr._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-4">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{agr.studentId?.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{agr.studentId?.rollNumber}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <p className="text-xs font-bold text-slate-700">{agr.applicationId?.companyName || '—'}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{agr.applicationId?.position || '—'}</p>
                                        </td>
                                        <td className="px-8 py-4 text-xs font-semibold text-slate-500 capitalize">
                                            {agr.applicationId?.internshipType || '—'}
                                        </td>
                                        <td className="px-8 py-4">
                                            <StatusPill status={agr.status} />
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleVerifyAgreement(agr._id, 'verified')}
                                                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all"
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Verify
                                                </button>
                                                <button
                                                    onClick={() => handleVerifyAgreement(agr._id, 'rejected')}
                                                    className="flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-100 transition-all"
                                                >
                                                    <XCircle className="h-3.5 w-3.5" /> Reject
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
        </div>
    );
};

export default AgreementsTab;
