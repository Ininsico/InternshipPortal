import { Files, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface OverviewTabProps {
    recentActivity: any[];
}

const OverviewTab = ({ recentActivity }: OverviewTabProps) => {
    return (
        <div className="space-y-12">

            {/* Recent Activity Feed */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-normal text-slate-900">Recent Activity</h3>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Clock className="h-5 w-5" />
                    </div>
                </div>
                <div className="divide-y divide-slate-50">
                    {recentActivity.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-slate-400 font-semibold italic">No recent activity found.</p>
                        </div>
                    ) : (
                        recentActivity.map((activity, idx) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={idx}
                                className="px-10 py-6 hover:bg-slate-50/50 transition-colors flex items-center gap-6 group"
                            >
                                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    {activity.type === 'app' ? <Files className="h-5 w-5" /> : activity.type === 'agreement' ? <ShieldCheck className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-slate-700 leading-snug">{activity.message}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{new Date(activity.timestamp).toLocaleString()}</p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;

