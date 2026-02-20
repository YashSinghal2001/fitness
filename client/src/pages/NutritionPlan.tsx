import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Save, Edit, Plus, Trash2 } from 'lucide-react';

interface Meal {
  name: string;
  nonVegOption: string;
  vegOption: string;
  quantity: string;
  unit: string;
  supplements: { name: string; dosage: string }[];
  notes: string;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
}

interface NutritionPlanData {
  _id?: string;
  client?: string;
  clientName: string;
  planType: string;
  period: string;
  checkInDate: string;
  cardio: {
    totalCardioMinutes: number;
    avgHeartRate: number;
    dailyStepGoal: number;
  };
  water: {
    dailyTarget: string;
  };
  salt: { amount: string; notes: string }[];
  meals: Meal[];
  dailyMacroTargets: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
}

const defaultMeals = [
  'Wake Up',
  '08:00',
  '03:00',
  '05:00',
  'Intra Workout',
  'Post Workout',
  '20:00'
];

const NutritionPlan = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

  const [plan, setPlan] = useState<NutritionPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const emptyPlan: NutritionPlanData = {
    clientName: '',
    planType: 'Fat Loss',
    period: 'Week 1-4',
    checkInDate: new Date().toISOString().split('T')[0],
    cardio: {
      totalCardioMinutes: 30,
      avgHeartRate: 130,
      dailyStepGoal: 10000,
    },
    water: {
      dailyTarget: '4 liters',
    },
    salt: [
      { amount: '1/4 tsp', notes: '(1.5g)' },
      { amount: '1/2 tsp', notes: '(3g)' },
    ],
    meals: defaultMeals.map(name => ({
      name,
      nonVegOption: '',
      vegOption: '',
      quantity: '',
      unit: '',
      supplements: [],
      notes: '',
      macros: { protein: 0, carbs: 0, fats: 0, calories: 0 }
    })),
    dailyMacroTargets: {
      protein: 180,
      carbs: 200,
      fats: 60,
      calories: 2060
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [clientId]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      let response;
      
      if (isAdmin && clientId) {
          // Admin viewing client
          // We can use getClientById to get nutrition plan
          const clientRes = await api.get(`/admin/client/${clientId}`);
          // The response structure is { client, nutritionPlan, ... }
          if (clientRes.data.nutritionPlan) {
              response = { data: clientRes.data.nutritionPlan };
          } else {
              // No plan exists
              setPlan({...emptyPlan, clientName: clientRes.data.client.name});
              setIsEditing(true); // Auto edit mode for new plan
              setLoading(false);
              return;
          }
      } else {
          // Client viewing own plan
          response = await api.get('/client/nutrition');
      }

      const fetchedPlan = response.data;
      if (fetchedPlan.checkInDate) {
        fetchedPlan.checkInDate = new Date(fetchedPlan.checkInDate).toISOString().split('T')[0];
      }
      setPlan(fetchedPlan);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setPlan(emptyPlan);
        if (isAdmin) setIsEditing(true);
      } else {
        setError('Failed to fetch nutrition plan');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!plan) return;
      
      let response;
      if (isAdmin && clientId) {
          response = await api.put(`/admin/client/${clientId}/nutrition`, plan);
      } else {
          // Client shouldn't be able to save usually, but if enabled:
          // We don't have a route for client to update own plan in requirements.
          // So this might fail or we should disable save for client.
          setError("Only admin can update plan");
          return;
      }
      
      setPlan(response.data);
      setIsEditing(false);
      setError(null);
    } catch (err: any) {
      console.error('Error saving plan:', err);
      setError(err.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleMealChange = (index: number, field: string, value: any) => {
    if (!plan) return;
    const newMeals = [...plan.meals];
    newMeals[index] = { ...newMeals[index], [field]: value };
    setPlan({ ...plan, meals: newMeals });
  };

  const handleMacroChange = (index: number, macro: string, value: number) => {
    if (!plan) return;
    const newMeals = [...plan.meals];
    newMeals[index] = {
      ...newMeals[index],
      macros: { ...newMeals[index].macros, [macro]: value }
    };
    setPlan({ ...plan, meals: newMeals });
  };
  
  const handleSupplementChange = (mealIndex: number, suppIndex: number, field: string, value: string) => {
      if (!plan) return;
      const newMeals = [...plan.meals];
      const newSupps = [...newMeals[mealIndex].supplements];
      newSupps[suppIndex] = { ...newSupps[suppIndex], [field]: value };
      newMeals[mealIndex] = { ...newMeals[mealIndex], supplements: newSupps };
      setPlan({ ...plan, meals: newMeals });
  };

  const addSupplement = (mealIndex: number) => {
      if (!plan) return;
      const newMeals = [...plan.meals];
      newMeals[mealIndex].supplements.push({ name: '', dosage: '' });
      setPlan({ ...plan, meals: newMeals });
  };
  
  const removeSupplement = (mealIndex: number, suppIndex: number) => {
      if (!plan) return;
      const newMeals = [...plan.meals];
      newMeals[mealIndex].supplements.splice(suppIndex, 1);
      setPlan({ ...plan, meals: newMeals });
  };

  if (loading) return <div className="p-8 text-center text-highlight">Loading nutrition plan...</div>;
  if (!plan) return <div className="p-8 text-center text-highlight">No plan available</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-highlight">Nutrition Plan</h2>
        {isAdmin && (
            <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isEditing ? 'bg-success/80 hover:bg-success text-background font-bold' : 'btn-primary'
            }`}
            >
            {isEditing ? <Save size={20} /> : <Edit size={20} />}
            <span>{isEditing ? 'Save Plan' : 'Edit Plan'}</span>
            </button>
        )}
      </div>

      {error && (
        <div className="bg-critical/20 border border-critical text-highlight px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Header Section */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2 text-highlight">Plan Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Client Name</label>
            {isEditing ? (
              <input
                type="text"
                value={plan.clientName}
                onChange={(e) => setPlan({ ...plan, clientName: e.target.value })}
                className="input-field"
              />
            ) : (
              <div className="font-semibold text-lg text-highlight">{plan.clientName}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Plan Type</label>
            {isEditing ? (
              <input
                type="text"
                value={plan.planType}
                onChange={(e) => setPlan({ ...plan, planType: e.target.value })}
                className="input-field"
              />
            ) : (
              <div className="font-semibold text-lg text-highlight">{plan.planType}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Period</label>
            {isEditing ? (
              <input
                type="text"
                value={plan.period}
                onChange={(e) => setPlan({ ...plan, period: e.target.value })}
                className="input-field"
              />
            ) : (
              <div className="font-semibold text-lg text-highlight">{plan.period}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Check-in Date</label>
            {isEditing ? (
              <input
                type="date"
                value={plan.checkInDate}
                onChange={(e) => setPlan({ ...plan, checkInDate: e.target.value })}
                className="input-field"
              />
            ) : (
              <div className="font-semibold text-lg text-highlight">{plan.checkInDate}</div>
            )}
          </div>
        </div>
      </div>

      {/* Cardio & Activity Goals */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2 text-highlight">Cardio & Activity Goals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary/10 p-4 rounded-lg border border-border">
            <label className="block text-sm font-medium text-secondary mb-1">Total Cardio (mins)</label>
            {isEditing ? (
              <input
                type="number"
                value={plan.cardio.totalCardioMinutes}
                onChange={(e) => setPlan({ ...plan, cardio: { ...plan.cardio, totalCardioMinutes: Number(e.target.value) } })}
                className="input-field"
              />
            ) : (
              <div className="font-bold text-2xl text-highlight">{plan.cardio.totalCardioMinutes} min</div>
            )}
          </div>
          <div className="bg-critical/10 p-4 rounded-lg border border-border">
            <label className="block text-sm font-medium text-secondary mb-1">Avg Heart Rate</label>
            {isEditing ? (
              <input
                type="number"
                value={plan.cardio.avgHeartRate}
                onChange={(e) => setPlan({ ...plan, cardio: { ...plan.cardio, avgHeartRate: Number(e.target.value) } })}
                className="input-field"
              />
            ) : (
              <div className="font-bold text-2xl text-highlight">{plan.cardio.avgHeartRate} bpm</div>
            )}
          </div>
          <div className="bg-success/10 p-4 rounded-lg border border-border">
            <label className="block text-sm font-medium text-secondary mb-1">Daily Step Goal</label>
            {isEditing ? (
              <input
                type="number"
                value={plan.cardio.dailyStepGoal}
                onChange={(e) => setPlan({ ...plan, cardio: { ...plan.cardio, dailyStepGoal: Number(e.target.value) } })}
                className="input-field"
              />
            ) : (
              <div className="font-bold text-2xl text-highlight">{plan.cardio.dailyStepGoal}</div>
            )}
          </div>
        </div>
      </div>

      {/* Water & Salt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
            <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2 text-highlight">Water Intake</h3>
            <div className="flex items-center justify-center h-32">
                {isEditing ? (
                    <div className="w-full">
                         <label className="block text-sm font-medium text-secondary mb-1">Daily Target</label>
                         <input
                            type="text"
                            value={plan.water.dailyTarget}
                            onChange={(e) => setPlan({ ...plan, water: { ...plan.water, dailyTarget: e.target.value } })}
                            className="input-field"
                        />
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="text-4xl font-bold text-highlight">{plan.water.dailyTarget}</div>
                        <div className="text-sm text-secondary mt-2">Daily Goal</div>
                    </div>
                )}
            </div>
        </div>

        <div className="card">
            <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2 text-highlight">Salt Intake</h3>
             <div className="space-y-4">
                {plan.salt.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-secondary/10 p-3 rounded-lg border border-border">
                         {isEditing ? (
                             <>
                                <input 
                                    value={s.amount} 
                                    onChange={(e) => {
                                        const newSalt = [...plan.salt];
                                        newSalt[idx].amount = e.target.value;
                                        setPlan({...plan, salt: newSalt});
                                    }}
                                    className="input-field w-1/2 mr-2"
                                    placeholder="Amount"
                                />
                                <input 
                                    value={s.notes} 
                                    onChange={(e) => {
                                        const newSalt = [...plan.salt];
                                        newSalt[idx].notes = e.target.value;
                                        setPlan({...plan, salt: newSalt});
                                    }}
                                    className="input-field w-1/2"
                                    placeholder="Notes"
                                />
                             </>
                         ) : (
                            <>
                                <span className="font-medium text-highlight">{s.amount}</span>
                                <span className="text-secondary">{s.notes}</span>
                            </>
                         )}
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      {/* Daily Macro Targets (for validation) */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2 text-highlight">Daily Macro Targets</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
            <div>
                <label className="block text-xs font-medium text-secondary uppercase">Protein</label>
                {isEditing ? (
                     <input type="number" value={plan.dailyMacroTargets.protein} onChange={e => setPlan({...plan, dailyMacroTargets: {...plan.dailyMacroTargets, protein: Number(e.target.value)}})} className="input-field mt-1 text-center" />
                ) : <div className="text-xl font-bold text-highlight">{plan.dailyMacroTargets.protein}g</div>}
            </div>
            <div>
                <label className="block text-xs font-medium text-secondary uppercase">Carbs</label>
                {isEditing ? (
                     <input type="number" value={plan.dailyMacroTargets.carbs} onChange={e => setPlan({...plan, dailyMacroTargets: {...plan.dailyMacroTargets, carbs: Number(e.target.value)}})} className="input-field mt-1 text-center" />
                ) : <div className="text-xl font-bold text-highlight">{plan.dailyMacroTargets.carbs}g</div>}
            </div>
            <div>
                <label className="block text-xs font-medium text-secondary uppercase">Fats</label>
                {isEditing ? (
                     <input type="number" value={plan.dailyMacroTargets.fats} onChange={e => setPlan({...plan, dailyMacroTargets: {...plan.dailyMacroTargets, fats: Number(e.target.value)}})} className="input-field mt-1 text-center" />
                ) : <div className="text-xl font-bold text-highlight">{plan.dailyMacroTargets.fats}g</div>}
            </div>
            <div>
                <label className="block text-xs font-medium text-secondary uppercase">Calories</label>
                {isEditing ? (
                     <input type="number" value={plan.dailyMacroTargets.calories} onChange={e => setPlan({...plan, dailyMacroTargets: {...plan.dailyMacroTargets, calories: Number(e.target.value)}})} className="input-field mt-1 text-center" />
                ) : <div className="text-xl font-bold text-highlight">{plan.dailyMacroTargets.calories}</div>}
            </div>
        </div>
      </div>

      {/* Meal Sections */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-highlight">Meal Plan</h3>
        {plan.meals.map((meal, index) => (
          <div key={index} className="card p-0 overflow-hidden">
            <div className="bg-primary/20 px-6 py-4 border-b border-border flex justify-between items-center">
              {isEditing ? (
                  <input 
                    value={meal.name} 
                    onChange={(e) => handleMealChange(index, 'name', e.target.value)}
                    className="font-bold text-lg bg-transparent border-b border-secondary text-highlight focus:outline-none"
                  />
              ) : (
                  <h4 className="text-lg font-bold text-highlight">{meal.name}</h4>
              )}
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Food Details */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-secondary uppercase mb-1">Non-Veg Option</label>
                            {isEditing ? (
                                <textarea 
                                    value={meal.nonVegOption} 
                                    onChange={(e) => handleMealChange(index, 'nonVegOption', e.target.value)}
                                    className="input-field"
                                    rows={2}
                                />
                            ) : (
                                <div className="p-2 bg-secondary/10 rounded-md min-h-[3rem] text-highlight">{meal.nonVegOption || '-'}</div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-secondary uppercase mb-1">Veg Option</label>
                            {isEditing ? (
                                <textarea 
                                    value={meal.vegOption} 
                                    onChange={(e) => handleMealChange(index, 'vegOption', e.target.value)}
                                    className="input-field"
                                    rows={2}
                                />
                            ) : (
                                <div className="p-2 bg-secondary/10 rounded-md min-h-[3rem] text-highlight">{meal.vegOption || '-'}</div>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-secondary uppercase mb-1">Quantity</label>
                             {isEditing ? (
                                <input 
                                    value={meal.quantity} 
                                    onChange={(e) => handleMealChange(index, 'quantity', e.target.value)}
                                    className="input-field"
                                />
                            ) : (
                                <div className="p-2 bg-secondary/10 rounded-md text-highlight">{meal.quantity || '-'}</div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-secondary uppercase mb-1">Units</label>
                             {isEditing ? (
                                <input 
                                    value={meal.unit} 
                                    onChange={(e) => handleMealChange(index, 'unit', e.target.value)}
                                    className="input-field"
                                />
                            ) : (
                                <div className="p-2 bg-secondary/10 rounded-md text-highlight">{meal.unit || '-'}</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-secondary uppercase mb-1">Notes</label>
                        {isEditing ? (
                            <textarea 
                                value={meal.notes} 
                                onChange={(e) => handleMealChange(index, 'notes', e.target.value)}
                                className="input-field"
                                rows={2}
                            />
                        ) : (
                            <div className="p-2 bg-warning/10 text-warning rounded-md min-h-[3rem]">{meal.notes || 'No notes'}</div>
                        )}
                    </div>
                </div>

                {/* Right Column: Supplements & Macros */}
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <label className="block text-xs font-bold text-secondary uppercase">Supplements</label>
                             {isEditing && (
                                 <button onClick={() => addSupplement(index)} className="text-highlight text-xs flex items-center hover:text-white">
                                     <Plus size={14} className="mr-1"/> Add
                                 </button>
                             )}
                        </div>
                        <div className="space-y-2">
                            {meal.supplements.length === 0 && !isEditing && <div className="text-secondary italic text-sm">No supplements</div>}
                            {meal.supplements.map((supp, sIdx) => (
                                <div key={sIdx} className="flex items-center space-x-2">
                                    {isEditing ? (
                                        <>
                                            <input 
                                                value={supp.name} 
                                                onChange={(e) => handleSupplementChange(index, sIdx, 'name', e.target.value)}
                                                placeholder="Name"
                                                className="input-field flex-1"
                                            />
                                            <input 
                                                value={supp.dosage} 
                                                onChange={(e) => handleSupplementChange(index, sIdx, 'dosage', e.target.value)}
                                                placeholder="Dosage"
                                                className="input-field w-24"
                                            />
                                            <button onClick={() => removeSupplement(index, sIdx)} className="text-critical p-1 hover:text-red-400">
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex justify-between w-full bg-primary/20 p-2 rounded text-sm border border-primary/30">
                                            <span className="font-medium text-highlight">{supp.name}</span>
                                            <span className="text-secondary">{supp.dosage}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-secondary/10 p-4 rounded-lg border border-border">
                        <label className="block text-xs font-bold text-secondary uppercase mb-3">Meal Macros (For Validation)</label>
                        <div className="grid grid-cols-4 gap-2 text-center text-sm">
                            <div>
                                <div className="text-xs text-secondary mb-1">Protein</div>
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        value={meal.macros.protein} 
                                        onChange={(e) => handleMacroChange(index, 'protein', Number(e.target.value))}
                                        className="input-field text-center p-1"
                                    />
                                ) : <div className="font-semibold text-highlight">{meal.macros.protein}</div>}
                            </div>
                            <div>
                                <div className="text-xs text-secondary mb-1">Carbs</div>
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        value={meal.macros.carbs} 
                                        onChange={(e) => handleMacroChange(index, 'carbs', Number(e.target.value))}
                                        className="input-field text-center p-1"
                                    />
                                ) : <div className="font-semibold text-highlight">{meal.macros.carbs}</div>}
                            </div>
                            <div>
                                <div className="text-xs text-secondary mb-1">Fats</div>
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        value={meal.macros.fats} 
                                        onChange={(e) => handleMacroChange(index, 'fats', Number(e.target.value))}
                                        className="input-field text-center p-1"
                                    />
                                ) : <div className="font-semibold text-highlight">{meal.macros.fats}</div>}
                            </div>
                            <div>
                                <div className="text-xs text-secondary mb-1">Cals</div>
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        value={meal.macros.calories} 
                                        onChange={(e) => handleMacroChange(index, 'calories', Number(e.target.value))}
                                        className="input-field text-center p-1"
                                    />
                                ) : <div className="font-semibold text-highlight">{meal.macros.calories}</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionPlan;
