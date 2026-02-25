import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/900.css';
import { useState, Fragment } from 'react';
import { ArrowUpRight, Loader2, ChevronDown, X, Paperclip, ChevronRight, AlertCircle } from 'lucide-react';
import StatusPill from '../StatusPill';
import API from '../../config/api';
import axios from 'axios';

interface ApprovalsTabProps {
    students: any[];
    handleApprove: (id: string, status: string) => void;
}

const Field = ({ label, value }: { label: string; value?: string }) => (
    <div>
        <p style={{ fontFamily: 'Montserrat, sans-serif' }} className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
            {label}
        </p>
        <p style={{ fontFamily: 'Montserrat, sans-serif' }} className="text-xs font-bold text-slate-900">
            {value || '—'}
        </p>
    </div>
);

const ApprovalsTab = ({ students, handleApprove }: ApprovalsTabProps) => {
    const pendingStudents = students.filter((s: any) => s.internshipStatus === 'submitted');
    const [open, setOpen] = useState(true);
    const [viewApp, setViewApp] = useState<any | null>(null);
    const [viewAppError, setViewAppError] = useState<string | null>(null);
    const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
    const [loadingAppId, setLoadingAppId] = useState<string | null>(null);

    const handleView = async (stu: any) => {
        if (expandedStudentId === stu._id) {
            setExpandedStudentId(null);
            setViewApp(null);
            setViewAppError(null);
            return;
        }

        setExpandedStudentId(stu._id);
        setLoadingAppId(stu._id);
        setViewApp(null);
        setViewAppError(null);

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
            const { data } = await axios.get(`${API.ADMIN}/application/${stu._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setViewApp(data.application);
            } else {
                setViewAppError('Could not find application data');
            }
        } catch (err: any) {
            console.error('Failed to load inline application:', err);
            setViewAppError(err.response?.data?.message || 'Failed to load application');
        } finally {
            setLoadingAppId(null);
        }
    };

    return (
        // Montserrat is loaded via Google Fonts in index.html or index.css
        <div className="space-y-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {/* Collapsible section — Pending Approvals */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <button
                    onClick={() => setOpen(o => !o)}
                    className="w-full flex items-center justify-between px-8 py-5 hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <span style={{ fontFamily: 'Montserrat, sans-serif' }} className="text-sm font-black text-slate-900 uppercase tracking-tight">
                            Internship Approvals
                        </span>
                        {pendingStudents.length > 0 && (
                            <span className="h-6 min-w-[24px] px-2 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black flex items-center justify-center">
                                {pendingStudents.length}
                            </span>
                        )}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                    <div className="border-t border-slate-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[500px]">
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
                                            <Fragment key={stu._id}>
                                                <tr
                                                    key={stu._id}
                                                    className={`transition-colors ${expandedStudentId === stu._id ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}
                                                >
                                                    <td className="px-8 py-4">
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{stu.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stu.rollNumber}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <InlineViewButton
                                                            loading={loadingAppId === stu._id}
                                                            expanded={expandedStudentId === stu._id}
                                                            onClick={() => handleView(stu)}
                                                        />
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

                                                {/* ── Inline Application Dossier Panel ── */}
                                                {expandedStudentId === stu._id && (
                                                    <tr key={`${stu._id}-detail`}>
                                                        <td colSpan={4} className="p-0">
                                                            <div
                                                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                                                                className="border-t border-blue-100 bg-gradient-to-br from-slate-50 to-blue-50/30 px-8 py-8 animate-in fade-in slide-in-from-top-2 duration-200"
                                                            >
                                                                {viewAppError ? (
                                                                    <div className="flex items-center gap-3 py-6 text-red-500">
                                                                        <AlertCircle className="h-5 w-5" />
                                                                        <span style={{ fontFamily: 'Montserrat, sans-serif' }} className="text-xs font-bold uppercase tracking-widest">
                                                                            {viewAppError}
                                                                        </span>
                                                                    </div>
                                                                ) : !viewApp ? (
                                                                    <div className="flex items-center gap-3 py-6 text-slate-400">
                                                                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                                                        <span style={{ fontFamily: 'Montserrat, sans-serif' }} className="text-xs font-bold uppercase tracking-widest">
                                                                            Loading Application Dossier...
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <ApplicationDossier
                                                                        app={viewApp}
                                                                        onClose={() => { setExpandedStudentId(null); setViewApp(null); }}
                                                                    />
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment >
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

/* ── Components ── */

const InlineViewButton = ({
    loading,
    expanded,
    onClick,
}: {
    loading: boolean;
    expanded: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${expanded
            ? 'border-blue-200 bg-blue-50 text-blue-700'
            : 'border-slate-200 text-blue-600 hover:bg-blue-50'
            }`}
    >
        {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
        ) : expanded ? (
            <ChevronDown className="h-3 w-3" />
        ) : (
            <ChevronRight className="h-3 w-3" />
        )}
        {expanded ? 'Collapse' : 'View Details'}
    </button>
);

const ApplicationDossier = ({ app, onClose }: { app: any; onClose: () => void }) => {
    const categoryLabel = app.internshipCategory?.replace(/_/g, ' ') || 'Internship Placement';

    return (
        <div style={{ fontFamily: 'Montserrat, sans-serif' }} className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">
                        {categoryLabel} — Application Dossier
                    </p>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                        {app.companyName}
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="h-8 w-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Core fields */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <Field label="Designation" value={app.position} />
                <Field label="Work Mode" value={app.internshipType} />
                <Field label="Duration" value={app.duration} />
                <Field label="Field" value={app.internshipField} />
            </div>

            {/* Description */}
            {app.description && (
                <div className="relative p-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Professional Scope</p>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic pl-2">"{app.description}"</p>
                </div>
            )}

            {/* Self-found supervisor */}
            {app.internshipCategory === 'self_found' && app.selfFoundSupervisor?.name && (
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Company Supervisor</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Name" value={app.selfFoundSupervisor.name} />
                        <Field label="Email" value={app.selfFoundSupervisor.email} />
                        <Field label="Phone" value={app.selfFoundSupervisor.phone} />
                        <Field label="Designation" value={app.selfFoundSupervisor.designation} />
                        <div className="sm:col-span-2">
                            <Field label="Company Address" value={app.selfFoundSupervisor.companyAddress} />
                        </div>
                    </div>
                </div>
            )}

            {/* Freelancer accounts */}
            {app.internshipCategory === 'freelancer' && app.freelancerAccounts?.length > 0 && (
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Freelance Platform Profiles</p>
                    <div className="space-y-3">
                        {app.freelancerAccounts.map((acc: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{acc.platform}</p>
                                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">{acc.username}</p>
                                </div>
                                <a
                                    href={acc.profileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wide text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                                >
                                    <ArrowUpRight className="h-3 w-3" />
                                    View Profile
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Documents */}
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Supporting Documents</p>
                {app.documents?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {app.documents.map((doc: any, i: number) => (
                            <a
                                key={i}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                            >
                                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shrink-0">
                                    <Paperclip className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-wide">{doc.name || 'Document'}</p>
                                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Download →</p>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No documents uploaded</p>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-bold text-slate-400">
                    Submitted: {new Date(app.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </p>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest">
                    {app.status}
                </span>
            </div>
        </div>
    );
};

export default ApprovalsTab;
