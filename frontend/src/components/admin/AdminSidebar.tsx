import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    isSuperAdmin: boolean;
}

const AdminSidebar = ({ activeTab, setActiveTab, isSuperAdmin }: AdminSidebarProps) => {
    const [requestsOpen, setRequestsOpen] = useState(true);

    const mainNavItems = [
        { id: 'overview', label: 'Analytics' },
        { id: 'students', label: 'Student Records' },
        { id: 'reports', label: 'Evaluations' },
    ];

    const facultyItem = { id: 'faculty', label: 'Department Faculty' };
    const companiesItem = { id: 'companies', label: 'Partnered Companies' };

    const requestItems = [
        { id: 'approvals', label: 'Pending Approvals' },
        { id: 'agreements', label: 'Active Agreements' },
    ];

    const NavBtn = ({ item, isSubItem = false }: { item: { id: string; label: string }; isSubItem?: boolean }) => {
        const isActive = activeTab === item.id;
        return (
            <button
                onClick={() => setActiveTab(item.id)}
                className={`relative w-full flex items-center transition-all duration-300 group
                    ${isSubItem ? 'pl-10 pr-4 py-2.5' : 'px-6 py-3.5'}
                    ${isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 rounded-xl'
                        : 'text-slate-500 hover:bg-white hover:text-blue-600 rounded-xl'}
                    `}
            >
                <span className={`text-[13px] font-bold tracking-tight whitespace-nowrap ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
                    {item.label}
                </span>
            </button>
        );
    };

    return (
        <aside
            className="relative flex-shrink-0 h-screen w-[280px] flex flex-col bg-slate-50/50 border-r border-blue-50 overflow-hidden"
        >
            {/* Logo Area */}
            <div className="flex items-center h-28 border-b border-blue-50/50 flex-shrink-0 bg-white px-6 gap-6">
                <img src="/comsatslogo.png" alt="COMSATS" className="h-20 w-20 object-contain shrink-0" />
                <div className="overflow-hidden">
                    <p className="text-base font-black text-slate-900 leading-none whitespace-nowrap tracking-tight uppercase">HoD Portal</p>
                    <p className="text-[10px] font-extrabold text-blue-500 mt-2 whitespace-nowrap uppercase tracking-[0.15em]">CUI Abbottabad</p>
                </div>
            </div>

            <nav className="flex-1 flex flex-col justify-between py-8 px-4 min-h-0 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                    {/* Main section */}
                    <div className="space-y-1">
                        {mainNavItems.map(item => <NavBtn key={item.id} item={item} />)}
                    </div>

                    {/* HOD Oversight section */}
                    {isSuperAdmin && (
                        <div className="space-y-1">
                            <NavBtn item={facultyItem} />
                            <NavBtn item={companiesItem} />

                            {/* Requests Dropdown */}
                            <div className="pt-1">
                                <button
                                    onClick={() => setRequestsOpen(!requestsOpen)}
                                    className={`relative w-full flex items-center justify-between transition-all duration-300 rounded-xl px-6 py-3.5
                                        ${requestsOpen ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-white hover:text-blue-600'}
                                    `}
                                >
                                    <span className="text-[13px] font-bold tracking-tight whitespace-nowrap">Requests</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${requestsOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {requestsOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden space-y-1 mt-1"
                                        >
                                            {requestItems.map(subItem => (
                                                <NavBtn key={subItem.id} item={subItem} isSubItem />
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </aside>
    );
};


export default AdminSidebar;
