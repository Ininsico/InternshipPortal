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

    // Internship Status Redirection for Students
    if (user.role === 'student' && user.internshipStatus) {
        const status = user.internshipStatus;
        const path = location.pathname;

        // Stage 1: Initial Request (none, submitted, rejected)
        const isRequestStage = ['none', 'submitted', 'rejected'].includes(status);
        if (isRequestStage && path !== '/internship-request') {
            return <Navigate to="/internship-request" replace />;
        }

        // Stage 2: Agreement (approved, agreement_submitted)
        const isAgreementStage = ['approved', 'agreement_submitted'].includes(status);
        if (isAgreementStage && path !== '/internship-agreement') {
            return <Navigate to="/internship-agreement" replace />;
        }

        // Stage 3: Full Access (verified)
        if (status === 'verified' && (path === '/internship-request' || path === '/internship-agreement')) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
