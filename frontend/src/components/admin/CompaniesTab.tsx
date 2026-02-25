import { useState } from 'react';
import { Building2, Globe, Mail, Trash2, X, Users, ChevronDown, Loader2, User, Briefcase, GraduationCap, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API from '../../config/api';
import StatusPill from '../StatusPill';

interface CompaniesTabProps {
    companies: any[];
    setShowAddCompanyModal?: (v: boolean) => void;
    handleDeleteCompany: (id: string) => void;
    // Inline form state (passed down from parent)
    showInlineAddCompany?: boolean;
    setShowInlineAddCompany?: (v: boolean) => void;
    newCompany?: any;
    setNewCompany?: (v: any) => void;
    handleCreateCompany?: (e: React.FormEvent) => void;
    companyLoading?: boolean;
    companyError?: string;
    token?: string;
}

// Sub‑component: inline panel showing admins for a given company
const CompanyAdminsPanel = ({ company, token, onClose }: { company: any; token: string; onClose: () => void }) => {
    const { data: admins, isLoading, error } = useQuery({
        queryKey: ['company-admins', company._id],
        queryFn: async () => {
            const { data } = await axios.get(`${API.ADMIN}/companies/${company._id}/admins`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data.success ? data.admins : [];
        },
        enabled: !!token,
    });

    return (
        <div className="col-span-full rounded-[2rem] border border-blue-100 bg-blue-50/30 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{company.company}</h4>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">Company Admins & Details</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12 gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading admins...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <AlertCircle className="h-8 w-8 text-red-400 mb-3" />
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Failed to load admin data</p>
                </div>
            ) : !admins || admins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-slate-200 mb-3 border border-slate-100">
                        <Users className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No admins registered for this company</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {admins.map((admin: any) => (
                        <div key={admin._id} className="group bg-white rounded-[1.5rem] border border-slate-100 p-6 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all duration-300">
                                    {admin.role === 'company_admin' ? <Briefcase className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-900 truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{admin.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{admin.role?.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <div className="space-y-2 border-t border-slate-50 pt-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    <Mail className="h-3 w-3 text-blue-400 shrink-0" />
                                    <span className="truncate">{admin.email}</span>
                                </div>
                                {admin.company && (
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                        <Building2 className="h-3 w-3 text-blue-400 shrink-0" />
                                        <span className="truncate">{admin.company}</span>
                                    </div>
                                )}
                                {admin.assignedStudents !== undefined && (
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                        <GraduationCap className="h-3 w-3 text-blue-400 shrink-0" />
                                        {admin.assignedStudents} Assigned Students
                                    </div>
                                )}
                                <div className="mt-2">
                                    <StatusPill status={admin.isActive ? 'Active' : 'Pending Onboarding'} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CompaniesTab = ({
    companies,
    handleDeleteCompany,
    showInlineAddCompany,
    setShowInlineAddCompany,
    newCompany,
    setNewCompany,
    handleCreateCompany,
    companyLoading,
    companyError,
    token = '',
}: CompaniesTabProps) => {
    const [expandedCompany, setExpandedCompany] = useState<any | null>(null);

    const toggleCompanyAdmins = (company: any) => {
        setExpandedCompany((prev: any) => prev?._id === company._id ? null : company);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Partnered Companies</h3>
                    <p className="text-xs font-medium text-slate-400 mt-1">Official industry partners for student placements</p>
                </div>
                <button
                    onClick={() => setShowInlineAddCompany?.(!showInlineAddCompany)}
                    className="h-10 px-5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                    <Building2 className="h-4 w-4" />
                    <span className="hidden sm:inline">{showInlineAddCompany ? 'Cancel' : 'Add Industry Partner'}</span>
                    <span className="inline sm:hidden">{showInlineAddCompany ? 'Cancel' : 'Add'}</span>
                </button>
            </div>

            {/* ── Inline Add Company Form ── */}
            {showInlineAddCompany && newCompany && setNewCompany && handleCreateCompany && (
                <div className="rounded-[2rem] border border-blue-100 bg-blue-50/30 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">Register New Partner</h4>
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Add a new industry partner company</p>
                        </div>
                        <button
                            onClick={() => setShowInlineAddCompany?.(false)}
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <form onSubmit={handleCreateCompany} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Company Name *</label>
                                <input
                                    required
                                    value={newCompany.name}
                                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                                    className="w-full h-14 rounded-2xl bg-white border border-slate-200 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder:text-slate-300"
                                    placeholder="e.g. Google"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Industry Email (Optional)</label>
                                <input
                                    type="email"
                                    value={newCompany.email}
                                    onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                                    className="w-full h-14 rounded-2xl bg-white border border-slate-200 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder:text-slate-300"
                                    placeholder="hr@company.com"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Website</label>
                                <input
                                    value={newCompany.website}
                                    onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                                    className="w-full h-14 rounded-2xl bg-white border border-slate-200 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder:text-slate-300"
                                    placeholder="company.com"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Phone</label>
                                <input
                                    value={newCompany.phone}
                                    onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                                    className="w-full h-14 rounded-2xl bg-white border border-slate-200 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder:text-slate-300"
                                    placeholder="+1..."
                                />
                            </div>
                        </div>
                        {companyError && (
                            <p className="text-xs font-bold text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">{companyError}</p>
                        )}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={companyLoading}
                                className="h-12 px-8 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50"
                            >
                                {companyLoading ? 'Processing...' : 'Register Partner'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowInlineAddCompany?.(false)}
                                className="h-12 px-8 rounded-2xl border border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.length > 0 ? (
                    <>
                        {companies.map((company: any) => (
                            <div key={company._id} className="group rounded-[2rem] border border-slate-100 bg-white p-6 sm:p-8 shadow-sm hover:border-blue-100 transition-all hover:shadow-xl hover:shadow-blue-500/5">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDeleteCompany(company._id)}
                                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                            title="Delete Partnered Company"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <StatusPill status="Partnered" />
                                    </div>
                                </div>

                                <h4
                                    className="text-lg font-black text-slate-900 mb-2 leading-tight"
                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                >
                                    {company.company}
                                </h4>

                                <div className="space-y-3">
                                    <div
                                        className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest truncate"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                    >
                                        <Globe className="h-3.5 w-3.5 text-blue-400 shrink-0" /> {company.website || 'Portal N/A'}
                                    </div>
                                    <div
                                        className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest truncate"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                    >
                                        <Mail className="h-3.5 w-3.5 text-blue-400 shrink-0" /> {company.email || 'N/A'}
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p
                                            className="text-[8px] font-black uppercase tracking-widest text-slate-400"
                                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                                        >Representative</p>
                                        <p
                                            className="text-xs font-bold text-slate-700 mt-0.5 truncate"
                                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                                        >{company.name}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleCompanyAdmins(company)}
                                        className={`flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${expandedCompany?._id === company._id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                                    >
                                        <Users className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Admins</span>
                                        <ChevronDown className={`h-3 w-3 transition-transform ${expandedCompany?._id === company._id ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Inline company admins panel */}
                        {expandedCompany && (
                            <CompanyAdminsPanel
                                company={expandedCompany}
                                token={token}
                                onClose={() => setExpandedCompany(null)}
                            />
                        )}
                    </>
                ) : (
                    <div className="col-span-full py-16 sm:py-20 text-center rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-white/50">
                        <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">No partnered companies found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompaniesTab;
