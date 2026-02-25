import MetricCard from '../MetricCard';

interface OverviewTabProps {
    stats: any;
    recentActivity: any[];
}

const OverviewTab = ({ stats }: OverviewTabProps) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard label="Total Students" value={stats.totalStudents} progress={100} />
                <MetricCard label="Active Apps" value={stats.activeApplications} progress={40} />
                <MetricCard label="Pending Agreements" value={stats.pendingAgreements} progress={20} />
            </div>
        </div>
    );
};

export default OverviewTab;
