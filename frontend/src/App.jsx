import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import ResidentLayout from './layouts/ResidentLayout';
import GuardLayout from './layouts/GuardLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import ResidentDashboardPage from './pages/resident/ResidentDashboardPage';
import ResidentProfilePage from './pages/resident/ResidentProfilePage';
import ResidentVisitorsPage from './pages/resident/ResidentVisitorsPage';
import ResidentComplaintsPage from './pages/resident/ResidentComplaintsPage';
import ResidentNoticesPage from './pages/resident/ResidentNoticesPage';
import ResidentParcelsPage from './pages/resident/ResidentParcelsPage';
import ResidentNotificationsPage from './pages/resident/ResidentNotificationsPage';
import GuardDashboardPage from './pages/guard/GuardDashboardPage';
import GuardAddVisitorPage from './pages/guard/GuardAddVisitorPage';
import GuardScanPage from './pages/guard/GuardScanPage';
import GuardHistoryPage from './pages/guard/GuardHistoryPage';
import GuardParcelsPage from './pages/guard/GuardParcelsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminApartmentsPage from './pages/admin/AdminApartmentsPage';
import AdminNoticesPage from './pages/admin/AdminNoticesPage';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage';
import AdminParcelsPage from './pages/admin/AdminParcelsPage';
import VisitorRegisterPage from './pages/visitor/VisitorRegisterPage';
import VisitorStatusPage from './pages/visitor/VisitorStatusPage';
import VisitorVerifyPage from './pages/visitor/VisitorVerifyPage';
import VisitorHistoryPage from './pages/visitor/VisitorHistoryPage';
import { ROLES } from './utils/constants';

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        {/* Visitor module — public portal */}
        <Route path="/visitor/register" element={<VisitorRegisterPage />} />
        <Route path="/visitor/status" element={<VisitorStatusPage />} />
        <Route path="/visitor/verify" element={<VisitorVerifyPage />} />
        <Route path="/visitor/history" element={<VisitorHistoryPage />} />
      </Route>

      {/* Admin module */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="apartments" element={<AdminApartmentsPage />} />
        <Route path="parcels" element={<AdminParcelsPage />} />
        <Route path="notices" element={<AdminNoticesPage />} />
        <Route path="complaints" element={<AdminComplaintsPage />} />
      </Route>

      {/* Resident module */}
      <Route
        path="/resident"
        element={
          <ProtectedRoute roles={[ROLES.RESIDENT]}>
            <ResidentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ResidentDashboardPage />} />
        <Route path="profile" element={<ResidentProfilePage />} />
        <Route path="visitors" element={<ResidentVisitorsPage />} />
        <Route path="complaints" element={<ResidentComplaintsPage />} />
        <Route path="notices" element={<ResidentNoticesPage />} />
        <Route path="parcels" element={<ResidentParcelsPage />} />
        <Route path="notifications" element={<ResidentNotificationsPage />} />
      </Route>

      {/* Guard module */}
      <Route
        path="/guard"
        element={
          <ProtectedRoute roles={[ROLES.GUARD]}>
            <GuardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<GuardDashboardPage />} />
        <Route path="add-visitor" element={<GuardAddVisitorPage />} />
        <Route path="scan" element={<GuardScanPage />} />
        <Route path="history" element={<GuardHistoryPage />} />
        <Route path="parcels" element={<GuardParcelsPage />} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
