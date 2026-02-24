interface StatusPillProps {
    status: string;
}

const StatusPill = ({ status }: StatusPillProps) => {
    const getStatusStyles = (status: string) => {
        const s = status?.toLowerCase() || 'none';
        if (s.includes('approved') || s.includes('verified') || s === 'completed' || s === 'active') {
            return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        }
        if (s.includes('pending') || s === 'submitted' || s === 'in_progress') {
            return 'bg-amber-50 text-amber-600 border-amber-100';
        }
        if (s.includes('rejected') || s === 'incomplete' || s === 'failed') {
            return 'bg-red-50 text-red-600 border-red-100';
        }
        return 'bg-slate-50 text-slate-400 border-slate-100';
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(status)} transition-all duration-300`}>
            {status?.replace(/_/g, ' ') || 'N/A'}
        </span>
    );
};

export default StatusPill;
