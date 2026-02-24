import { Building2, Globe, Mail, MapPin, ShieldCheck, Trash2 } from 'lucide-react';
import StatusPill from '../StatusPill';

interface CompaniesTabProps {
    companies: any[];
    setShowAddCompanyModal: (v: boolean) => void;
    handleDeleteCompany: (id: string) => void;
}

const CompaniesTab = ({ companies, setShowAddCompanyModal, handleDeleteCompany }: CompaniesTabProps) => {
    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Partnered Companies</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Official industry partners for student placements</p>
                </div>
                <button
                    onClick={() => setShowAddCompanyModal(true)}
                    className="h-10 sm:h-12 px-4 sm:px-6 rounded-2xl bg-blue-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2"
                >
                    <Building2 className="h-4 w-4" /> <span className="hidden sm:inline">Add Partner</span><span className="inline sm:hidden">Add</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.length > 0 ? (
                    companies.map((company: any) => (
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

                            <h4 className="text-lg font-black text-slate-900 mb-2 leading-tight">{company.company}</h4>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest italic truncate">
                                    <Globe className="h-3.5 w-3.5 text-blue-400 shrink-0" /> {company.website || 'Portal N/A'}
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest italic truncate">
                                    <Mail className="h-3.5 w-3.5 text-blue-400 shrink-0" /> {company.email}
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest italic truncate">
                                    <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" /> Corporate Office
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Representative</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">{company.name}</p>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 shrink-0">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-16 sm:py-20 text-center rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-white/50">
                        <Building2 className="h-10 w-10 sm:h-12 sm:h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">No partnered companies found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompaniesTab;
