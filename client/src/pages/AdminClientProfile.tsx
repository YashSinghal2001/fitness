import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Utensils, Dumbbell, TrendingUp, Calendar } from 'lucide-react';

const AdminClientProfile = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const response = await api.get(`/admin/client/${clientId}`);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch client data', error);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Client not found</div>;

  const { client, nutritionPlan, workoutPlan, goals, recentLogs } = data;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-highlight">{client.name}</h1>
            <p className="text-secondary">{client.email}</p>
        </div>
        <div className="flex space-x-4">
            <Link to={`/admin/clients/${client._id}/nutrition`} className="btn-primary flex items-center space-x-2">
                <Utensils size={20} />
                <span>Manage Nutrition</span>
            </Link>
             {/* Future: Manage Workout Plan */}
             <button className="btn-secondary flex items-center space-x-2 opacity-50 cursor-not-allowed">
                <Dumbbell size={20} />
                <span>Manage Workout</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
            <h3 className="text-xl font-semibold mb-4 text-highlight">At a Glance</h3>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-secondary">Joined</span>
                    <span className="text-highlight">{new Date(client.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-secondary">Status</span>
                    <span className={`font-bold ${client.isActive ? 'text-success' : 'text-critical'}`}>
                        {client.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-secondary">Nutrition Plan</span>
                    <span className="text-highlight">{nutritionPlan ? nutritionPlan.planType : 'Not assigned'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-secondary">Active Goals</span>
                    <span className="text-highlight">{goals.length}</span>
                </div>
            </div>
        </div>

        <div className="card">
            <h3 className="text-xl font-semibold mb-4 text-highlight">Recent Activity</h3>
            {recentLogs.length > 0 ? (
                <div className="space-y-3">
                    {recentLogs.map((log: any) => (
                        <div key={log._id} className="flex justify-between items-center bg-secondary/10 p-2 rounded">
                            <span className="text-highlight">{new Date(log.date).toLocaleDateString()}</span>
                            <div className="flex space-x-4 text-sm text-secondary">
                                <span>{log.weight ? `${log.weight}kg` : '-'}</span>
                                <span>{log.calories ? `${log.calories}kcal` : '-'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-secondary italic">No recent logs</div>
            )}
        </div>
      </div>

      {/* Goals Section */}
      <div className="card">
          <h3 className="text-xl font-semibold mb-4 text-highlight">Active Goals</h3>
          {goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map((goal: any) => (
                      <div key={goal._id} className="bg-secondary/10 p-4 rounded border border-border">
                          <div className="font-bold text-highlight">{goal.title}</div>
                          <div className="text-sm text-secondary mb-2">{goal.category}</div>
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }}></div>
                          </div>
                          <div className="flex justify-between text-xs mt-1 text-secondary">
                              <span>{goal.currentValue}</span>
                              <span>{goal.targetValue}</span>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="text-secondary italic">No active goals</div>
          )}
      </div>
    </div>
  );
};

export default AdminClientProfile;
