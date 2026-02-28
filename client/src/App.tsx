import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ClientLogin from './pages/ClientLogin';
import ClientRegister from './pages/ClientRegister';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import ClientDashboard from './pages/ClientDashboard';
import DailyTracking from './pages/DailyTracking';
import WorkoutTracker from './pages/WorkoutTracker';
import ProgressAnalytics from './pages/ProgressAnalytics';
import BodyMeasurements from './pages/BodyMeasurements';
import GoalsManagement from './pages/GoalsManagement';
import ReportingDashboard from './pages/ReportingDashboard';
import PhotoComparison from './pages/PhotoComparison';
import NutritionPlan from './pages/NutritionPlan';
import Profile from './pages/Profile';
import ClientsList from './pages/ClientsList';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminReports from './pages/AdminReports';
import AdminClientProfile from './pages/AdminClientProfile';
import ClientLayout from './components/ClientLayout';

// Simple Auth Guard
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: string[] }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<ClientLogin />} />
        <Route path="/register" element={<ClientRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        
        {/* Main Layout for all pages */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['client', 'admin']}>
              <ClientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/daily" element={
             <ProtectedRoute allowedRoles={['client', 'admin']}>
               <DailyTracking />
             </ProtectedRoute>
          } />
          <Route path="/workouts" element={
             <ProtectedRoute allowedRoles={['client', 'admin']}>
               <WorkoutTracker />
             </ProtectedRoute>
          } />
          <Route path="/progress" element={
             <ProtectedRoute allowedRoles={['client', 'admin']}>
               <ProgressAnalytics />
             </ProtectedRoute>
          } />
          <Route path="/measurements" element={
             <ProtectedRoute allowedRoles={['client', 'admin']}>
               <BodyMeasurements />
             </ProtectedRoute>
          } />
          <Route path="/photos/compare" element={
             <ProtectedRoute allowedRoles={['client', 'admin']}>
               <PhotoComparison />
             </ProtectedRoute>
          } />
          <Route path="/reporting" element={
             <ProtectedRoute allowedRoles={['client', 'admin']}>
               <ReportingDashboard />
             </ProtectedRoute>
          } />
          <Route path="/goals" element={
             <ProtectedRoute allowedRoles={['client', 'admin']}>
               <GoalsManagement />
             </ProtectedRoute>
          } />
          <Route path="/nutrition" element={
             <ProtectedRoute allowedRoles={['client', 'admin']}>
               <NutritionPlan />
             </ProtectedRoute>
          } />
          <Route path="/profile" element={
             <ProtectedRoute allowedRoles={['client', 'admin']}>
               <Profile />
             </ProtectedRoute>
          } />
          
          {/* Admin features exposed */}
          <Route path="/admin/clients" element={
             <ProtectedRoute allowedRoles={['admin']}>
               <ClientsList />
             </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
             <ProtectedRoute allowedRoles={['admin']}>
               <AdminAnalytics />
             </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
             <ProtectedRoute allowedRoles={['admin']}>
               <AdminReports />
             </ProtectedRoute>
          } />
          <Route path="/admin/clients/:clientId" element={
             <ProtectedRoute allowedRoles={['admin']}>
               <AdminClientProfile />
             </ProtectedRoute>
          } />
          <Route path="/admin/clients/:clientId/nutrition" element={
             <ProtectedRoute allowedRoles={['admin']}>
               <NutritionPlan />
             </ProtectedRoute>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
