import { Clock } from 'lucide-react';
import MetricCard from '../MetricCard';
import API from '../../config/api';

interface OverviewTabProps {
    stats: any;
    recentActivity: any[];
}

const OverviewTab = ({ stats, recentActivity }: OverviewTabProps) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard label="Total Students" value={stats.totalStudents} progress={100} />
                <MetricCard label="Active Apps" value={stats.activeApplications} progress={40} />
                <MetricCard label="Pending Agreements" value={stats.pendingAgreements} progress={20} />
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
                        <p className="text-xs font-medium text-slate-400 mt-1">Live system updates</p>
                    </div>
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Clock className="h-5 w-5" />
                    </div>
                </div>
                <div className="space-y-6">
                    {recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                            {activity.profilePicture ? (
                                <div className="h-10 w-10 rounded-xl overflow-hidden shadow-sm shrink-0 border border-slate-100">
                                    <img src={activity.profilePicture.startsWith('http') ? activity.profilePicture : `${API.BASE}${activity.profilePicture}`} className="h-full w-full object-cover" alt="" />
                                </div>
                            ) : (
                                <div className="mt-2 h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                            )}
                            <div>
                                <p className="text-sm font-bold text-slate-900 leading-tight">{activity.message}</p>
                                <p className="text-[10px] font-semibold text-slate-400 mt-1.5">{new Date(activity.timestamp).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
