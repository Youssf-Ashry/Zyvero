import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ContactPage from '../pages/ContactPage';
import DashboardPage from '../pages/DashboardPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ProjectContentPage from '../pages/ProjectContentPage';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import ProjectsPage from '../pages/ProjectsPage';
import SignupPage from '../pages/SignupPage';
import WorkspaceKnowledgePage from '../pages/WorkspaceKnowledgePage';
import AdminRoute from '../components/auth/AdminRoute';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminServicesPage from '../pages/AdminServicesPage';
import RequestsPage from '../pages/RequestsPage';
import RequestDetailsPage from '../pages/RequestDetailsPage';
import AdminRequestsPage from '../pages/AdminRequestsPage';
import AdminRequestDetailsPage from '../pages/AdminRequestDetailsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id/content"
        element={
          <ProtectedRoute>
            <ProjectContentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/knowledge"
        element={
          <ProtectedRoute>
            <WorkspaceKnowledgePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <RequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests/:id"
        element={
          <ProtectedRoute>
            <RequestDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/services"
        element={
          <AdminRoute>
            <AdminServicesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/requests"
        element={
          <AdminRoute>
            <AdminRequestsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/requests/:id"
        element={
          <AdminRoute>
            <AdminRequestDetailsPage />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
