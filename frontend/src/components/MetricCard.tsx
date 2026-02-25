import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    label: string;
    value: string | number;
    icon?: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    color?: 'blue' | 'purple' | 'emerald' | 'amber';
}

const MetricCard = ({ label, value, icon: Icon, trend, color = 'blue' }: MetricCardProps) => {
    const colorMap = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', shadow: 'shadow-blue-500/10', ring: 'ring-blue-100', dot: 'bg-blue-500' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', shadow: 'shadow-purple-500/10', ring: 'ring-purple-100', dot: 'bg-purple-500' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', shadow: 'shadow-emerald-500/10', ring: 'ring-emerald-100', dot: 'bg-emerald-500' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', shadow: 'shadow-amber-500/10', ring: 'ring-amber-100', dot: 'bg-amber-500' },
    };

    const styles = colorMap[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`relative group bg-white rounded-[2rem] p-8 border border-white shadow-xl ${styles.shadow} transition-all duration-300 ring-1 ${styles.ring}`}
        >
            <div className="flex items-start justify-between mb-8">
                <div className={`h-14 w-14 rounded-2xl ${styles.bg} ${styles.text} flex items-center justify-center shadow-inner ring-1 ${styles.ring} group-hover:scale-110 transition-transform duration-500`}>
                    {Icon ? <Icon strokeWidth={2.5} className="h-7 w-7" /> : <div className={`h-3 w-3 rounded-full ${styles.dot} animate-pulse`} />}
                </div>
                {trend && (
                    <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${trend.isPositive ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-red-50 text-red-600 ring-1 ring-red-100'}`}>
                        {trend.value}
                    </div>
                )}
            </div>

            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-normal text-slate-900 tracking-tight">{value}</h3>
                </div>
            </div>

            <div className={`absolute bottom-0 left-0 right-0 h-1.5 rounded-b-[2rem] bg-gradient-to-r ${color === 'blue' ? 'from-blue-600 to-indigo-500' : color === 'purple' ? 'from-purple-600 to-pink-500' : color === 'emerald' ? 'from-emerald-600 to-teal-500' : 'from-amber-500 to-orange-400'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        </motion.div>
    );
};
export default MetricCard;
