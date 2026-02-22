import { motion } from 'framer-motion';
import { Send, CheckCheck, FileText, Shield, CheckCircle2 } from 'lucide-react';

interface StatusTrackerProps {
    currentStatus: string;
}

const STATUS_PIPELINE = [
    { key: 'submitted', label: 'Application', icon: Send },
    { key: 'approved', label: 'Approval', icon: CheckCheck },
    { key: 'agreement_submitted', label: 'Agreement', icon: FileText },
    { key: 'verified', label: 'Verification', icon: Shield },
    { key: 'internship_assigned', label: 'Assignment', icon: CheckCircle2 },
];

const StatusTracker = ({ currentStatus }: StatusTrackerProps) => {
    const currentIdx = STATUS_PIPELINE.findIndex(s => s.key === currentStatus);
    const isAssigned = currentStatus === 'internship_assigned';

    return (
        <div className="w-full py-8">
            <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />

                {STATUS_PIPELINE.map((step, idx) => {
                    const isCompleted = idx < currentIdx || (isAssigned && idx < STATUS_PIPELINE.length);
                    const isCurrent = !isAssigned && idx === currentIdx;
                    const StepIcon = step.icon;

                    return (
                        <div key={step.key} className="flex flex-col items-center relative z-10 bg-[#f8fafc] px-4">
                            <motion.div
                                initial={false}
                                animate={{
                                    backgroundColor: isCompleted ? '#10b981' : isCurrent ? '#2563eb' : '#f1f5f9',
                                    color: (isCompleted || isCurrent) ? '#ffffff' : '#94a3b8',
                                    scale: isCurrent ? 1.1 : 1,
                                }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-shadow ${isCurrent ? 'shadow-blue-500/20 ring-4 ring-blue-50' : 'shadow-none'
                                    }`}
                            >
                                {isCompleted ? <CheckCheck className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                            </motion.div>
                            <span className={`mt-3 text-[9px] font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-600' : isCurrent ? 'text-blue-600' : 'text-slate-400'
                                }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusTracker;
