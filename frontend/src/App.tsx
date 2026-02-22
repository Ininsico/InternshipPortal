import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import InternshipRequestForm from './pages/InternshipRequestForm';
import StudentAgreementPage from './pages/StudentAgreementPage';
import ResetPassword from './pages/ResetPassword';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/internship-agreement"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentAgreementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/internship-request"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <InternshipRequestForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty-portal"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company-portal"
            element={
              <ProtectedRoute allowedRoles={['company_admin']}>
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;