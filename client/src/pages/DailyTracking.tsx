import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X, Edit2 } from 'lucide-react';
import api from '../services/api';

interface DailyLog {
  _id: string;
  date: string;
  weight: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sleep: number;
  steps: number;
  water: number;
  veggies: number;
  hunger: number;
  digestion: string;
  notes: string;
  compliance: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    sleep?: string;
    steps?: string;
  };
  calculatedStats: {
    proteinCalories: number;
    carbCalories: number;
    fatCalories: number;
    totalMacroCalories: number;
    proteinPercentage: number;
    carbPercentage: number;
    fatPercentage: number;
  };
}

const DailyTracking = () => {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  const [targets, setTargets] = useState<any>(null);
  
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      weight: 0,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sleep: 0,
      steps: 0,
      water: 0,
      veggies: 0,
      hunger: 5,
      digestion: '',
      notes: ''
    }
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Use 'me' to let backend identify the user
      const res = await api.get(`/daily/me`);
      setLogs(res.data.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    api.get('/nutrition/me')
      .then(res => setTargets(res.data.dailyMacroTargets))
      .catch(err => console.error('Failed to fetch targets:', err));
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await api.post('/daily', data);
      reset();
      setEditingLog(null);
      setIsModalOpen(false);
      fetchLogs();
    } catch (error) {
      console.error('Error saving log:', error);
    }
  };

  const openEdit = (log: DailyLog) => {
    setEditingLog(log);
    setValue('date', new Date(log.date).toISOString().split('T')[0]);
    setValue('weight', log.weight);
    setValue('calories', log.calories);
    setValue('protein', log.protein);
    setValue('carbs', log.carbs);
    setValue('fat', log.fat);
    setValue('fiber', log.fiber);
    setValue('sleep', log.sleep);
    setValue('steps', log.steps);
    setValue('water', log.water);
    setValue('veggies', log.veggies);
    setValue('hunger', log.hunger);
    setValue('digestion', log.digestion);
    setValue('notes', log.notes);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingLog(null);
    reset({
      date: new Date().toISOString().split('T')[0],
      weight: 0,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sleep: 0,
      steps: 0,
      water: 0,
      veggies: 0,
      hunger: 5,
      digestion: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-success/20 text-success';
      case 'yellow': return 'bg-warning/20 text-warning';
      case 'red': return 'bg-critical/20 text-critical';
      default: return 'text-secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-highlight">Daily Tracking</h1>
        <button
          onClick={openNew}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Log</span>
        </button>
      </div>

      {/* Targets Display */}
      {targets && (
        <div className="card">
          <h2 className="text-lg font-semibold text-highlight mb-4">Current Daily Targets</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-3 bg-secondary/10 rounded-lg text-center">
              <div className="text-xs text-secondary uppercase font-medium">Calories</div>
              <div className="text-xl font-bold text-highlight">{targets.calories}</div>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg text-center">
              <div className="text-xs text-secondary uppercase font-medium">Protein</div>
              <div className="text-xl font-bold text-highlight">{targets.protein}g</div>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg text-center">
              <div className="text-xs text-secondary uppercase font-medium">Carbs</div>
              <div className="text-xl font-bold text-highlight">{targets.carbs}g</div>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg text-center">
              <div className="text-xs text-secondary uppercase font-medium">Fat</div>
              <div className="text-xl font-bold text-highlight">{targets.fat}g</div>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg text-center">
              <div className="text-xs text-secondary uppercase font-medium">Fiber</div>
              <div className="text-xl font-bold text-highlight">{targets.fiber}g</div>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary/20">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-highlight uppercase tracking-wider sticky left-0 bg-[#292966] z-10">Date</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Weight</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Calories</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Protein (g)</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Carbs (g)</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Fat (g)</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Fiber (g)</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Sleep (hrs)</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Steps</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Water</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Veggies</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Hunger</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Digestion</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Notes</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-highlight sticky left-0 bg-[#292966] z-10">
                    {new Date(log.date).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-secondary">{log.weight || '-'}</td>
                  <td className={`px-3 py-4 whitespace-nowrap text-sm font-medium rounded-sm ${getStatusColor(log.compliance.calories)}`}>
                    {log.calories}
                  </td>
                  <td className={`px-3 py-4 whitespace-nowrap text-sm font-medium rounded-sm ${getStatusColor(log.compliance.protein)}`}>
                    {log.protein} ({log.calculatedStats.proteinPercentage}%)
                  </td>
                  <td className={`px-3 py-4 whitespace-nowrap text-sm font-medium rounded-sm ${getStatusColor(log.compliance.carbs)}`}>
                    {log.carbs} ({log.calculatedStats.carbPercentage}%)
                  </td>
                  <td className={`px-3 py-4 whitespace-nowrap text-sm font-medium rounded-sm ${getStatusColor(log.compliance.fat)}`}>
                    {log.fat} ({log.calculatedStats.fatPercentage}%)
                  </td>
                  <td className={`px-3 py-4 whitespace-nowrap text-sm font-medium rounded-sm ${getStatusColor(log.compliance.fiber)}`}>
                    {log.fiber}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-secondary">{log.sleep}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-secondary">{log.steps}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-secondary">{log.water}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-secondary">{log.veggies}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-secondary">{log.hunger || '-'}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-secondary">{log.digestion}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-secondary max-w-xs truncate">{log.notes}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openEdit(log)} className="text-highlight hover:text-white">
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={15} className="px-3 py-8 text-center text-secondary">
                    No logs found. Start tracking today!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#292966] border border-primary rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h3 className="text-xl font-bold text-highlight">{editingLog ? 'Edit Daily Log' : 'New Daily Log'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-highlight">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary">Date</label>
                  <input type="date" {...register('date', { required: true })} className="input-field mt-1" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary">Weight (lbs)</label>
                  <input type="number" step="0.1" {...register('weight', { valueAsNumber: true })} className="input-field mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary">Calories</label>
                  <input type="number" {...register('calories', { valueAsNumber: true })} className="input-field mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary">Protein (g)</label>
                  <input type="number" {...register('protein', { valueAsNumber: true })} className="input-field mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary">Carbs (g)</label>
                  <input type="number" {...register('carbs', { valueAsNumber: true })} className="input-field mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary">Fat (g)</label>
                  <input type="number" {...register('fat', { valueAsNumber: true })} className="input-field mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary">Fiber (g)</label>
                  <input type="number" {...register('fiber', { valueAsNumber: true })} className="input-field mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary">Sleep (hrs)</label>
                  <input type="number" step="0.1" {...register('sleep', { valueAsNumber: true })} className="input-field mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary">Daily Steps</label>
                  <input type="number" {...register('steps', { valueAsNumber: true })} className="input-field mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary">Water (L)</label>
                  <input type="number" step="0.1" {...register('water', { valueAsNumber: true })} className="input-field mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary">Veggies (servings)</label>
                  <input type="number" {...register('veggies', { valueAsNumber: true })} className="input-field mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary">Hunger (1-10)</label>
                  <input type="number" min="1" max="10" {...register('hunger', { valueAsNumber: true })} className="input-field mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary">Digestion</label>
                  <select {...register('digestion')} className="input-field mt-1 bg-[#292966]">
                    <option value="">Select...</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary">Notes</label>
                <textarea {...register('notes')} rows={3} className="input-field mt-1"></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-secondary rounded-md text-secondary hover:bg-secondary/10">Cancel</button>
                <button type="submit" className="btn-primary">Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTracking;
