import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Flame, Timer, TrendingUp, Target, Utensils, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ClientDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get('/progress/stats');
        setStats(statsRes.data);
        const historyRes = await api.get('/workouts/history?limit=5');
        setRecentWorkouts(historyRes.data.workouts);
        const dashboardRes = await api.get('/client/dashboard');
        setClientData(dashboardRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  const data = recentWorkouts.map(w => ({
    name: new Date(w.workoutDate).toLocaleDateString(undefined, { weekday: 'short' }),
    duration: w.duration,
    calories: w.caloriesBurned
  })).reverse();

  if (!stats || !clientData) return <div className="text-highlight">Loading...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-highlight">Client Dashboard</h2>

      {/* Daily Overview Card */}
      <div className="card bg-gradient-to-r from-primary/20 to-secondary/10 border-primary/30">
        <h3 className="text-xl font-bold mb-4 text-highlight">Today's Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${clientData.todayLog ? 'bg-success/20 text-success' : 'bg-critical/20 text-critical'}`}>
                    <CheckCircle size={24} />
                </div>
                <div>
                    <p className="text-sm text-secondary">Daily Log</p>
                    <p className="font-bold text-highlight">{clientData.todayLog ? 'Submitted' : 'Pending'}</p>
                </div>
            </div>
             <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-highlight/20 text-highlight">
                    <Target size={24} />
                </div>
                <div>
                    <p className="text-sm text-secondary">Active Goals</p>
                    <p className="font-bold text-highlight">{clientData.activeGoalsCount}</p>
                </div>
            </div>
             <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-primary/20 text-primary">
                    <Utensils size={24} />
                </div>
                <div>
                    <p className="text-sm text-secondary">Nutrition Plan</p>
                    <p className="font-bold text-highlight">{clientData.hasNutritionPlan ? 'Active' : 'None'}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card border-l-4 border-primary">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-secondary text-sm">Total Workouts</p>
              <h3 className="text-2xl mt-1 text-highlight">{stats.totalWorkouts}</h3>
            </div>
            <Activity className="text-primary" />
          </div>
        </div>
        <div className="card border-l-4 border-primary">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-secondary text-sm">Calories Burned</p>
              <h3 className="text-2xl mt-1 text-highlight">{stats.totalCalories}</h3>
            </div>
            <Flame className="text-primary" />
          </div>
        </div>
        <div className="card border-l-4 border-primary">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-secondary text-sm">Total Minutes</p>
              <h3 className="text-2xl mt-1 text-highlight">{stats.totalDuration}</h3>
            </div>
            <Timer className="text-primary" />
          </div>
        </div>
        <div className="card border-l-4 border-primary">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-secondary text-sm">Streak</p>
              <h3 className="text-2xl mt-1 text-highlight">{stats.streak} Days</h3>
            </div>
            <TrendingUp className="text-primary" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card h-[400px]">
          <h3 className="text-xl mb-6 text-highlight">Recent Activity</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(204,204,255,0.2)" />
              <XAxis dataKey="name" stroke="#A3A3CC" />
              <YAxis stroke="#A3A3CC" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#292966', border: '1px solid rgba(204,204,255,0.2)', color: '#CCCCFF' }}
                cursor={{ fill: 'rgba(163,163,204,0.1)' }}
              />
              <Bar dataKey="duration" fill="#5C5C99" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Workouts List */}
        <div className="card h-[400px] overflow-y-auto custom-scrollbar">
          <h3 className="text-xl mb-6 text-highlight">Recent Workouts</h3>
          <div className="space-y-4">
            {recentWorkouts.map((workout: any) => (
              <div key={workout._id} className="bg-secondary/10 p-4 rounded-lg border border-border flex justify-between items-center hover:bg-secondary/20 transition-colors">
                <div>
                  <h4 className="font-semibold text-highlight">{workout.name}</h4>
                  <p className="text-sm text-secondary">
                    {new Date(workout.workoutDate).toLocaleDateString()} • {workout.duration} min
                  </p>
                </div>
                <div className="text-primary font-bold">
                  {workout.caloriesBurned} cal
                </div>
              </div>
            ))}
            {recentWorkouts.length === 0 && (
              <p className="text-secondary text-center py-8">No workouts yet. Start training!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
