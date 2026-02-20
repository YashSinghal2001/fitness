import { useEffect, useState } from 'react';
import api from '../services/api';

const AdminAnalytics = () => {
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-primary">Admin Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-lg shadow-lg border border-gray-800">
          <h3 className="text-gray-400 text-sm font-medium">Total Clients</h3>
          <p className="text-2xl font-bold text-white mt-2">{stats?.totalClients}</p>
        </div>
        <div className="bg-surface p-6 rounded-lg shadow-lg border border-gray-800">
          <h3 className="text-gray-400 text-sm font-medium">Active Clients</h3>
          <p className="text-2xl font-bold text-green-500 mt-2">{stats?.activeClients}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
