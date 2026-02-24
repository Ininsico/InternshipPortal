import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    UserPlus, Pencil, Trash2, Mail, ShieldCheck, RefreshCw,
    Search, ChevronLeft, ChevronRight, ArrowUpDown,
    Briefcase, AlertCircle, Users
} from 'lucide-react';
import API from '../../config/api';
import StatusPill from '../StatusPill';

interface FacultyTabProps {
    setShowAddAdminModal: (show: boolean) => void;
    setEditFaculty: (faculty: any) => void;
    setEditFacultyForm: (form: any) => void;
    setDeleteFaculty: (faculty: any) => void;
    handleResendInvitation: (adminId: string) => void;
    setViewAdminStudents: (admin: any) => void;
    token: string;
}

import { useAdminStore } from '../../store/adminStore';

const FacultyTab = ({
    setShowAddAdminModal,
    setEditFaculty,
    setEditFacultyForm,
    setDeleteFaculty,
    handleResendInvitation,
    token
}: Omit<FacultyTabProps, 'setViewAdminStudents'>) => {
    const { setViewAdminStudents } = useAdminStore();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [typeFilter, setTypeFilter] = useState<'all' | 'faculty' | 'staff'>('all');
    const limit = 20;

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to first page on search
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Data Fetching
    const { data: response, isLoading, isError, isFetching } = useQuery({
        queryKey: ['faculty', page, debouncedSearch, sortField, sortOrder, typeFilter],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                search: debouncedSearch,
                sort: sortField,
                order: sortOrder,
            });
            if (typeFilter !== 'all') params.append('type', typeFilter);

            const { data } = await axios.get(`${API.FACULTY}?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
    });

    const admins = response?.data || [];
    const totalPages = response?.pages || 0;
    const totalItems = response?.total || 0;

    const toggleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    if (isError) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-red-50 rounded-[3rem] border border-red-100">
                <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
                <h3 className="text-xl font-black text-red-900 uppercase tracking-tight italic">Registry Connection Failed</h3>
                <p className="text-sm font-bold text-red-600 mt-2 max-w-md mx-auto uppercase tracking-widest leading-relaxed">
                    We were unable to synchronize with the staff directory. This may be due to a network interruption or session expiry.
                </p>
                <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['faculty'] })}
                    className="mt-8 h-14 px-8 rounded-2xl bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-red-700 transition-all shadow-xl shadow-red-200"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">User Management</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mt-2">Directorate of Staff & Administration</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Universal Staff Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-14 w-full sm:w-80 bg-white border border-slate-100 rounded-2xl pl-12 pr-6 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm placeholder:text-slate-300"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddAdminModal(true)}
                        className="h-14 px-6 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95 flex items-center gap-3"
                    >
                        <UserPlus className="h-4 w-4" /> <span className="hidden sm:inline">Initialize Access</span>
                    </button>
                </div>
            </div>

            {/* Filters & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50/50 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setTypeFilter('all')}
                        className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${typeFilter === 'all' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        All Staff
                    </button>
                    <button
                        onClick={() => setTypeFilter('faculty')}
                        className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${typeFilter === 'faculty' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Faculty
                    </button>
                    <button
                        onClick={() => setTypeFilter('staff')}
                        className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${typeFilter === 'staff' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Company Admins
                    </button>
                </div>

                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                        Sorting by: <span className="text-slate-900 underline decoration-blue-500/30 underline-offset-4">{sortField}</span>
                        <ArrowUpDown className="h-3 w-3" />
                    </button>
                    <div className="h-4 w-px bg-slate-200" />
                    <span>Total: <span className="text-slate-900">{totalItems} Results</span></span>
                </div>
            </div>

            {/* Data Grid */}
            <div className="relative min-h-[400px]">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 rounded-[2.5rem] bg-white border border-slate-100 p-8 animate-pulse">
                                <div className="flex justify-between mb-6">
                                    <div className="h-14 w-14 rounded-2xl bg-slate-50" />
                                    <div className="h-8 w-20 rounded-full bg-slate-50" />
                                </div>
                                <div className="h-4 w-3/4 bg-slate-50 rounded-lg mb-2" />
                                <div className="h-3 w-1/2 bg-slate-50 rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : admins.length === 0 ? (
                    <div className="h-[40vh] flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                            <Search className="h-10 w-10" />
                        </div>
                        <h4 className="text-lg font-black text-slate-900 italic uppercase tracking-tight">Zero Matches Found</h4>
                        <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Adjust your filters or search parameters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {admins.map((admin: any) => (
                            <div
                                key={admin._id}
                                className="group relative rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm hover:border-blue-100 transition-all hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${admin.role === 'company_admin' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600'} group-hover:text-white shadow-sm`}>
                                        {admin.role === 'company_admin' ? <Briefcase className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                        {!admin.isActive && (
                                            <button
                                                onClick={() => handleResendInvitation(admin._id)}
                                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm active:scale-90"
                                                title="Resend Invitation"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setEditFaculty(admin);
                                                setEditFacultyForm({ name: admin.name, email: admin.email });
                                            }}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm active:scale-90"
                                            title="Edit Profile"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteFaculty(admin)}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-100 transition-all shadow-sm active:scale-90"
                                            title="Terminate Access"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight italic">{admin.name}</h4>
                                        {!admin.isActive && (
                                            <span className="text-[7px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">Pending Onboarding</span>
                                        )}
                                    </div>
                                    <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest italic truncate">
                                        <Mail className="h-3 w-3 text-blue-400" /> {admin.email}
                                    </p>

                                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">Designated Role</span>
                                            <StatusPill status={admin.role === 'company_admin' ? (admin.company || 'Enterprise Staff') : 'Faculty Supervisor'} />
                                        </div>
                                        {/* Explicit button — replaces unreliable whole-card click */}
                                        <button
                                            onClick={() => setViewAdminStudents(admin)}
                                            className="flex items-center gap-2 h-10 px-4 rounded-2xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-90 shadow-sm"
                                            title="View assigned students"
                                        >
                                            <Users className="h-3.5 w-3.5" />
                                            <span>Students</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Optional overlay while fetching */}
                {isFetching && !isLoading && (
                    <div className="absolute top-4 right-4 animate-spin">
                        <RefreshCw className="h-4 w-4 text-blue-500" />
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Displaying Page <span className="text-slate-900">{page}</span> of <span className="text-slate-900">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="h-12 w-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90 shadow-sm"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-2">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`h-12 w-12 rounded-2xl text-xs font-black transition-all active:scale-90 shadow-sm ${page === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                                >
                                    {i + 1}
                                </button>
                            )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
                        </div>

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="h-12 w-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90 shadow-sm"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyTab;
