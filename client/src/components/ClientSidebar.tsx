import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, TrendingUp, Target, User, Users, BarChart2, Calendar, Utensils, Ruler, Camera } from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Daily Tracking', path: '/daily', icon: Calendar },
    { name: 'Workouts', path: '/workouts', icon: Dumbbell },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
    { name: 'Photo Comparison', path: '/photos/compare', icon: Camera },
    { name: 'Body Measurements', path: '/measurements', icon: Ruler },
    { name: 'Reporting', path: '/reporting', icon: BarChart2 },
    { name: 'Nutrition Plan', path: '/nutrition', icon: Utensils },
    { name: 'Goals', path: '/goals', icon: Target },
    // Admin features accessible to everyone now
    { name: 'Clients Management', path: '/admin/clients', icon: Users },
    { name: 'Overall Analytics', path: '/admin/analytics', icon: BarChart2 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="h-screen w-64 bg-[#1E1E4B] border-r border-border flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-highlight">GymProgress</h1>
        <span className="text-xs text-secondary uppercase tracking-widest font-bold">Fitness SaaS</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
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
      </nav>
    </div>
  );
};

export default Sidebar;