import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import NewProject from './pages/NewProject';
import Templates from './pages/Templates';
import Builder from './pages/Builder';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ProtectedRoute from './routes/ProtectedRoute';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/new" element={<NewProject />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Builder is full-screen — deliberately outside the sidebar shell */}
      <Route
        path="/builder/:projectId"
        element={
          <ProtectedRouteStandalone>
            <Builder />
          </ProtectedRouteStandalone>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Same auth gate as ProtectedRoute, but without the sidebar shell — the
// Builder page manages its own full-height layout.
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function ProtectedRouteStandalone({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
