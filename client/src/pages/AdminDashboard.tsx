import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, BarChart2 } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/analytics');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="text-secondary">Loading...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-highlight">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-l-4 border-primary">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-secondary text-sm">Total Clients</p>
              <h3 className="text-2xl mt-1 text-highlight">{stats?.totalClients}</h3>
            </div>
            <Users className="text-primary" />
          </div>
        </div>
        <div className="card border-l-4 border-highlight">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-secondary text-sm">Active Clients</p>
              <h3 className="text-2xl mt-1 text-highlight">{stats?.activeClients}</h3>
            </div>
            <Users className="text-highlight" />
          </div>
        </div>
        <div className="card border-l-4 border-secondary">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-secondary text-sm">Recent Logs (7 Days)</p>
              <h3 className="text-2xl mt-1 text-highlight">{stats?.recentLogs}</h3>
            </div>
            <BarChart2 className="text-secondary" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-highlight">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <Link to="/admin/clients" className="card hover:bg-secondary/10 transition-colors flex items-center space-x-4 border border-border">
                <div className="p-3 bg-highlight/20 rounded-lg text-highlight">
                    <Users size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-highlight">View Clients</h3>
                    <p className="text-sm text-secondary">Manage all clients</p>
                </div>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
