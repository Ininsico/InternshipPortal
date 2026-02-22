import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, ShieldCheck, Building2, FileText,
    Settings, ClipboardList, LogOut, ChevronLeft, ChevronRight,
    Bell, BookOpen
} from 'lucide-react';

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    isSuperAdmin: boolean;
    user: any;
    logout: () => void;
}

const AdminSidebar = ({ activeTab, setActiveTab, isSuperAdmin, user, logout }: AdminSidebarProps) => {
    const [collapsed, setCollapsed] = useState(false);

    const mainNavItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'submissions', label: 'Submissions', icon: ClipboardList },
        { id: 'reports', label: 'Reports', icon: FileText },
    ];

    const adminNavItems = isSuperAdmin ? [
        { id: 'faculty', label: 'Faculty', icon: BookOpen },
        { id: 'companies', label: 'Companies', icon: Building2 },
        { id: 'approvals', label: 'Approvals', icon: Bell },
        { id: 'agreements', label: 'Agreements', icon: ShieldCheck },
        { id: 'assignments', label: 'Assignments', icon: Users },
    ] : [];

    const NavBtn = ({ item }: { item: { id: string; label: string; icon: any } }) => {
        const isActive = activeTab === item.id;
        return (
            <button
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`relative w-full flex items-center gap-3 rounded-xl transition-all duration-200 group
                    ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}
                    ${isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                    }`}
            >
                <item.icon className={`shrink-0 h-4 w-4 ${isActive ? 'text-white' : ''}`} />
                {!collapsed && (
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none whitespace-nowrap">
                        {item.label}
                    </span>
                )}
                {/* Tooltip on collapsed */}
                {collapsed && (
                    <span className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                        {item.label}
                    </span>
                )}
            </button>
        );
    };

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 256 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="relative flex-shrink-0 h-screen flex flex-col bg-white border-r border-blue-50 overflow-hidden"
            style={{ minWidth: collapsed ? 72 : 256 }}
        >

            <div className={`flex items-center h-16 border-b border-blue-50 flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'px-5 gap-3'}`}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/25">
                    <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 leading-none whitespace-nowrap">Admin Panel</p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-blue-400 mt-0.5 whitespace-nowrap">Internship Portal</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


            <button
                onClick={() => setCollapsed(c => !c)}
                className="absolute -right-3 top-[60px] z-50 h-6 w-6 rounded-full bg-white border border-blue-100 shadow-md flex items-center justify-center text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
                {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>


            <nav className="flex-1 flex flex-col justify-between py-4 px-2 min-h-0">
                <div className="space-y-5">
                    {/* Main section */}
                    <div className="space-y-0.5">
                        {!collapsed && (
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-300 mb-2 px-3">Main</p>
                        )}
                        {collapsed && <div className="h-px bg-blue-50 mb-2 mx-2" />}
                        {mainNavItems.map(item => <NavBtn key={item.id} item={item} />)}
                    </div>

                    {/* Super admin section */}
                    {isSuperAdmin && (
                        <div className="space-y-0.5">
                            {!collapsed && (
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-300 mb-2 px-3">Admin Ops</p>
                            )}
                            {collapsed && <div className="h-px bg-blue-50 mb-2 mx-2" />}
                            {adminNavItems.map(item => <NavBtn key={item.id} item={item} />)}
                        </div>
                    )}

                    {/* Settings */}
                    <div className="space-y-0.5">
                        {!collapsed && (
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-300 mb-2 px-3">Account</p>
                        )}
                        {collapsed && <div className="h-px bg-blue-50 mb-2 mx-2" />}
                        <NavBtn item={{ id: 'settings', label: 'Settings', icon: Settings }} />
                    </div>
                </div>


                <div className="mt-4 border-t border-blue-50 pt-4 space-y-1">
                    {/* User chip */}
                    <div className={`flex items-center gap-3 rounded-xl bg-blue-50 ${collapsed ? 'justify-center p-2' : 'px-3 py-2.5'}`}>
                        <div className="h-7 w-7 shrink-0 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-[10px] uppercase shadow-md shadow-blue-500/25">
                            {user?.name?.[0]}
                        </div>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden min-w-0"
                                >
                                    <p className="text-[10px] font-black text-slate-900 truncate leading-none whitespace-nowrap">{user?.name}</p>
                                    <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mt-0.5 whitespace-nowrap">{user?.role?.replace('_', ' ')}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        title={collapsed ? 'Sign Out' : undefined}
                        className={`relative w-full flex items-center gap-3 rounded-xl transition-all group text-red-400 hover:bg-red-50 hover:text-red-600
                            ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}`}
                    >
                        <LogOut className="shrink-0 h-4 w-4" />
                        {!collapsed && (
                            <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                        )}
                        {collapsed && (
                            <span className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                                Sign Out
                            </span>
                        )}
                    </button>
                </div>
            </nav>
        </motion.aside>
    );
};

export default AdminSidebar;
