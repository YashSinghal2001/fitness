import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, TrendingUp, Target, User, Users, BarChart2, Calendar, Utensils, Ruler, Camera, LogOut, X } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { logout as apiLogout } from '../services/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  
  // Fallback to localStorage if user context is not yet ready (though loading check in App.tsx handles this usually)
  const role = user?.role || localStorage.getItem('role');

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    navigate('/login');
  };

  const clientNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Daily Tracking', path: '/daily', icon: Calendar },
    { name: 'Workouts', path: '/workouts', icon: Dumbbell },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
    { name: 'Photo Comparison', path: '/photos/compare', icon: Camera },
    { name: 'Body Measurements', path: '/measurements', icon: Ruler },
    { name: 'Nutrition Plan', path: '/nutrition', icon: Utensils },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const adminNavItems = [
    { name: 'Clients Management', path: '/admin/clients', icon: Users },
    { name: 'Overall Analytics', path: '/admin/analytics', icon: BarChart2 },
    { name: 'Reports', path: '/admin/reports', icon: TrendingUp },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const navItems = role === 'admin' ? adminNavItems : clientNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#1E1E4B] border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-highlight">GymProgress</h1>
            <span className="text-xs text-secondary uppercase tracking-widest font-bold">Fitness SaaS</span>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-secondary hover:text-highlight transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={clsx(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-highlight shadow-soft'
                    : 'text-secondary hover:bg-secondary/20 hover:text-highlight'
                )}
              >
                <Icon size={20} className={isActive ? 'text-highlight' : 'text-secondary'} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-secondary hover:bg-critical/20 hover:text-critical w-full text-left mt-auto mb-6"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
