import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import ClientLayout from './components/ClientLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Layout for all pages */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={<ClientDashboard />} />
          <Route path="/daily" element={<DailyTracking />} />
          <Route path="/workouts" element={<WorkoutTracker />} />
          <Route path="/progress" element={<ProgressAnalytics />} />
          <Route path="/measurements" element={<BodyMeasurements />} />
          <Route path="/photos/compare" element={<PhotoComparison />} />
          <Route path="/reporting" element={<ReportingDashboard />} />
          <Route path="/goals" element={<GoalsManagement />} />
          <Route path="/nutrition" element={<NutritionPlan />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Admin features exposed */}
          <Route path="/admin/clients" element={<ClientsList />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/clients/:clientId/nutrition" element={<NutritionPlan />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;