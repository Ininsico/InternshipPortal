import {
    LayoutDashboard, Users, ShieldCheck, Building2, FileText,
    Bell, Settings, ClipboardList, LogOut
} from 'lucide-react';

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    isSuperAdmin: boolean;
    user: any;
    logout: () => void;
}

const AdminSidebar = ({ activeTab, setActiveTab, isSuperAdmin, user, logout }: AdminSidebarProps) => {
    const mainNavItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'reports', label: 'Reports', icon: FileText },
    ];

    const adminNavItems = isSuperAdmin ? [
        { id: 'faculty', label: 'Faculty', icon: ShieldCheck },
        { id: 'companies', label: 'Companies', icon: Building2 },
        { id: 'approvals', label: 'Approvals', icon: Bell },
        { id: 'agreements', label: 'Agreements', icon: ClipboardList },
        { id: 'assignments', label: 'Assignments', icon: ShieldCheck },
        { id: 'submissions', label: 'Submissions', icon: ClipboardList },
    ] : [];

    return (
        <aside className="w-80 flex flex-col bg-slate-900 text-white p-8">
            <div className="flex items-center gap-4 mb-16 px-2">
                <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-slate-900" />
                </div>
                <div>
                    <h1 className="text-xl font-black tracking-tighter uppercase italic">Control</h1>
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 -mt-1 leading-none">Internal System</p>
                </div>
            </div>

            <nav className="flex-1 space-y-10">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6 px-4">Main Interface</p>
                    <div className="space-y-2">
                        {mainNavItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-white text-slate-900 shadow-[0_10px_20px_rgba(255,255,255,0.1)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <item.icon className="h-4 w-4" /> {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {isSuperAdmin && (
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6 px-4">Admin Ops</p>
                        <div className="space-y-2">
                            {adminNavItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-white text-slate-900 shadow-[0_10px_20px_rgba(255,255,255,0.1)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    <item.icon className="h-4 w-4" /> {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6 px-4">Account</p>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white text-slate-900 shadow-[0_10px_20px_rgba(255,255,255,0.1)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <Settings className="h-4 w-4" /> Settings
                    </button>
                </div>
            </nav>

            <div className="pt-10 border-t border-white/5">
                <div className="flex items-center gap-4 mb-8 px-2">
                    <div className="h-10 w-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center font-black text-xs text-white uppercase italic">{user?.role?.[0]}</div>
                    <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate">{user?.name}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 truncate">{user?.role?.replace('_', ' ')}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all border border-red-500/20"
                >
                    <LogOut className="h-4 w-4" /> Sign Out
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
