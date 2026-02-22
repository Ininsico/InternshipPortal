import { motion } from 'framer-motion';
import { UserCheck, Clock, UserPlus, Download } from 'lucide-react';
import MetricCard from '../MetricCard';
import ActionButton from '../ActionButton';

interface OverviewTabProps {
    stats: any;
    recentActivity: any[];
    setShowAddAdminModal: (show: boolean) => void;
}

const OverviewTab = ({ stats, recentActivity, setShowAddAdminModal }: OverviewTabProps) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard label="Total Students" value={stats.totalStudents} progress={70} />
                <MetricCard label="Active Applications" value={stats.activeApplications} progress={40} />
                <MetricCard label="Placements" value={stats.completedPlacements} progress={60} />
                <MetricCard label="Placement Rate" value={`${stats.placementRate}%`} progress={stats.placementRate} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Recent Activity</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live system updates</p>
                        </div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Clock className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        {recentActivity.map((activity, idx) => (
                            <div key={idx} className="flex items-start gap-4">
                                <div className="mt-1 h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                                <div>
                                    <p className="text-sm font-bold text-slate-900 leading-tight">{activity.message}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{new Date(activity.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">System Information</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Deployment metrics</p>
                            </div>
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <UserCheck className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 italic">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Database Status</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Operational</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 italic">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Server</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Connected</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 italic">Portal Actions</h3>
                        <div className="space-y-4">
                            <ActionButton label="Add Faculty Admin" icon={UserPlus} isPrimary onClick={() => setShowAddAdminModal(true)} />
                            <ActionButton label="Export Student Report" icon={Download} onClick={() => { }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
