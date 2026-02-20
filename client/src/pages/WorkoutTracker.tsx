import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Clock, Flame } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const WorkoutTracker = () => {
  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      duration: 0,
      caloriesBurned: 0,
      exercises: [{ name: '', sets: 0, reps: 0, weight: 0, notes: '' }]
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises"
  });

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.post('/workouts', data);
      reset();
      navigate('/'); // Redirect to dashboard or history
    } catch (error) {
      console.error('Error creating workout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-highlight">Log Workout</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Workout Details */}
        <div className="card space-y-4">
          <h3 className="text-xl font-semibold mb-4 text-highlight">Session Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">Workout Name</label>
              <input {...register('name', { required: true })} className="input-field" placeholder="e.g. Upper Body Power" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">Duration (min)</label>
              <div className="relative">
                <input {...register('duration', { required: true })} type="number" className="input-field pl-10" />
                <Clock className="absolute left-3 top-2.5 text-secondary" size={16} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">Calories</label>
              <div className="relative">
                <input {...register('caloriesBurned')} type="number" className="input-field pl-10" />
                <Flame className="absolute left-3 top-2.5 text-secondary" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-highlight">Exercises</h3>
            <button
              type="button"
              onClick={() => append({ name: '', sets: 0, reps: 0, weight: 0, notes: '' })}
              className="flex items-center space-x-2 text-primary hover:text-highlight transition-colors"
            >
              <Plus size={20} />
              <span>Add Exercise</span>
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="card relative group">
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-4 right-4 text-secondary hover:text-critical transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-secondary">Exercise Name</label>
                  <input
                    {...register(`exercises.${index}.name` as const, { required: true })}
                    className="input-field"
                    placeholder="e.g. Bench Press"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-secondary">Sets</label>
                  <input
                    {...register(`exercises.${index}.sets` as const, { required: true })}
                    type="number"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-secondary">Reps</label>
                  <input
                    {...register(`exercises.${index}.reps` as const, { required: true })}
                    type="number"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-secondary">Weight (kg)</label>
                  <input
                    {...register(`exercises.${index}.weight` as const)}
                    type="number"
                    className="input-field"
                  />
                </div>
                <div className="col-span-3 md:col-span-1">
                   <label className="block text-sm font-medium mb-1 text-secondary">Notes</label>
                   <input
                    {...register(`exercises.${index}.notes` as const)}
                    className="input-field"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full md:w-auto">
            {isSubmitting ? 'Saving...' : 'Save Workout'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkoutTracker;
