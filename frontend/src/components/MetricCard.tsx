import { motion } from 'framer-motion';

interface MetricCardProps {
    label: string;
    value: string | number;
    progress: number;
}

const MetricCard = ({ label, value, progress }: MetricCardProps) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        <div className="mt-4 h-1 w-full rounded-full bg-slate-50 overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-blue-600"
            />
        </div>
    </div>
);

export default MetricCard;
