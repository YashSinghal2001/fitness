import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Target, Trophy } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';

const GoalsManagement = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await api.post('/goals', data);
      setShowForm(false);
      reset();
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Goals</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Goal</span>
        </button>
      </div>

      {showForm && (
        <div className="card max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">Set New Goal</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input {...register('title', { required: true })} className="input-field" placeholder="e.g. Bench Press 100kg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea {...register('description', { required: true })} className="input-field" placeholder="Details..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Value</label>
                <input {...register('currentValue', { required: true })} type="number" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Value</label>
                <input {...register('targetValue', { required: true })} type="number" className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Deadline</label>
                <input {...register('deadline', { required: true })} type="date" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select {...register('category')} className="input-field">
                  <option value="Weight">Weight</option>
                  <option value="Strength">Strength</option>
                  <option value="Endurance">Endurance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg hover:bg-white/10">Cancel</button>
              <button type="submit" className="btn-primary">Create Goal</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal: any) => {
          const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
          
          return (
            <div key={goal._id} className="card relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {goal.title}
                    {goal.completed && <Trophy className="text-yellow-500" size={20} />}
                  </h3>
                  <p className="text-sm text-text-muted">{goal.category}</p>
                </div>
                <Target className={clsx("text-primary", goal.completed && "text-yellow-500")} />
              </div>
              
              <p className="text-sm mb-4">{goal.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-bold">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={clsx("h-full bg-primary transition-all duration-500", goal.completed && "bg-yellow-500")}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-text-muted mt-2">
                  <span>{goal.currentValue}</span>
                  <span>Target: {goal.targetValue}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-text-muted text-right">
                Due: {new Date(goal.deadline).toLocaleDateString()}
              </div>
            </div>
          );
        })}
        {goals.length === 0 && !showForm && (
            <p className="col-span-full text-text-muted text-center py-8">No goals set yet.</p>
        )}
      </div>
    </div>
  );
};

export default GoalsManagement;
