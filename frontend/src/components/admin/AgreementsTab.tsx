import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import StatusPill from '../StatusPill';

interface AgreementsTabProps {
    agreements: any[];
    handleVerifyAgreement: (id: string, status: string) => void;
}

const AgreementsTab = ({ agreements, handleVerifyAgreement }: AgreementsTabProps) => {
    const pendingAgreements = agreements.filter((a: any) => a.status === 'pending' || !a.status || a.status === 'submitted');
    const [open, setOpen] = useState(true);

    return (
        <div className="space-y-4">
            {/* Pending Agreements — collapsible */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <button
                    onClick={() => setOpen(o => !o)}
                    className="w-full flex items-center justify-between px-8 py-5 hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Pending Agreements</span>
                        {pendingAgreements.length > 0 && (
                            <span className="h-6 min-w-[24px] px-2 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black flex items-center justify-center">
                                {pendingAgreements.length}
                            </span>
                        )}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                    <div className="border-t border-slate-100">
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
                                    {pendingAgreements.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                                No agreements pending verification
                                            </td>
                                        </tr>
                                    ) : (
                                        pendingAgreements.map((agr: any) => (
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
                )}
            </div>
        </div>
    );
};

export default AgreementsTab;
