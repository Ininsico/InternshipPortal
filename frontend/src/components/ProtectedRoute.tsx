import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface Props {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    if (user.role === 'student' && user.internshipStatus) {
        const status = user.internshipStatus;
        const path = location.pathname;
        const category = user.internshipCategory;

        const isRequestStage = ['none', 'submitted', 'rejected'].includes(status);
        if (isRequestStage && path !== '/internship-request') {
            return <Navigate to="/internship-request" replace />;
        }

        // University-assigned students skip the agreement page entirely.
        // When category is null (student was approved before internshipCategory was set on Student),
        // we CANNOT reliably redirect — allow both /internship-agreement and /dashboard
        // so the page itself can handle navigation without a ProtectedRoute interception loop.
        const isAgreementStage = ['approved', 'agreement_submitted'].includes(status);
        if (isAgreementStage) {
            if (category === 'university_assigned') {
                // Known university student — send straight to dashboard
                if (path !== '/dashboard') return <Navigate to="/dashboard" replace />;
            } else if (category === 'self_found' || category === 'freelancer') {
                // Known self-sourced student — must complete agreement first
                if (path !== '/internship-agreement') return <Navigate to="/internship-agreement" replace />;
            } else {
                // category is null (legacy record not yet tagged) — allow both paths,
                // the agreement page will call navigate() if needed without loop risk
                if (path !== '/internship-agreement' && path !== '/dashboard') {
                    return <Navigate to="/internship-agreement" replace />;
                }
            }
        }

        if (status === 'verified' && (path === '/internship-request' || path === '/internship-agreement')) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
