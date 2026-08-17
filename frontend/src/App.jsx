import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Generate from './pages/Generate';
import ResumePreview from './pages/ResumePreview';
import Pricing from './pages/Pricing';
import Billing from './pages/Billing';
import ProfileVariants from './pages/ProfileVariants';
import { UserProvider, useUser } from './context/UserContext';

function AuthRedirect({ children }) {
  const { token, loading } = useUser();
  if (loading) return null;
  if (token) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
          <Route path="/signup" element={<AuthRedirect><Signup /></AuthRedirect>} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/generate" element={<Generate />} />
              <Route path="/resume/:jdId" element={<ResumePreview />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/profile-variants" element={<ProfileVariants />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
