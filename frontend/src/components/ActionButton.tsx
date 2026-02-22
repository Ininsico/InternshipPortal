import type { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
    label: string;
    icon: LucideIcon;
    isPrimary?: boolean;
    onClick: () => void;
}

const ActionButton = ({ label, icon: Icon, isPrimary, onClick }: ActionButtonProps) => (
    <button
        onClick={onClick}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] ${isPrimary
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-black'
                : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
            }`}
    >
        <Icon className="h-4 w-4" />
        {label}
    </button>
);

export default ActionButton;
