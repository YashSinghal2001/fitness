import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Plus, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { format } from 'date-fns';

interface Measurement {
  _id: string;
  date: string;
  chest: number;
  leftArm: number;
  rightArm: number;
  stomach: number;
  waist: number;
  hips: number;
  leftLeg: number;
  rightLeg: number;
}

interface Stats {
  current: number;
  deltaFirst: number;
  deltaLast: number;
  totalReduction: number;
}

interface MeasurementStats {
  [key: string]: Stats;
}

const BodyMeasurements = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [stats, setStats] = useState<MeasurementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    chest: '',
    leftArm: '',
    rightArm: '',
    stomach: '',
    waist: '',
    hips: '',
    leftLeg: '',
    rightLeg: ''
  });

  const fetchMeasurements = async () => {
    try {
      const res = await api.get('/progress/measurements');
      setMeasurements(res.data.history);
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/progress/measurements', formData);
      setShowForm(false);
      fetchMeasurements();
      setFormData({
        date: new Date().toISOString().split('T')[0],
        chest: '',
        leftArm: '',
        rightArm: '',
        stomach: '',
        waist: '',
        hips: '',
        leftLeg: '',
        rightLeg: ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const metrics = [
    { key: 'chest', label: 'Chest (Nipple)' },
    { key: 'leftArm', label: 'Left Arm' },
    { key: 'rightArm', label: 'Right Arm' },
    { key: 'stomach', label: 'Stomach (Navel)' },
    { key: 'waist', label: '2" Below Navel' },
    { key: 'hips', label: 'Hips (Widest)' },
    { key: 'leftLeg', label: 'Left Leg' },
    { key: 'rightLeg', label: 'Right Leg' },
  ];

  const renderDelta = (value: number, type: 'reduction' | 'change') => {
    if (value === 0) return <span className="text-secondary flex items-center gap-1"><Minus size={16} /> 0</span>;
    
    let isGood = false;
    let displayValue = Math.abs(value);
    
    if (type === 'reduction') {
        // value is Total Reduction (First - Current)
        // Positive means we lost size (Good)
        isGood = value > 0;
    } else {
        // value is Delta Last (Current - Previous)
        // Negative means we lost size (Good)
        isGood = value < 0;
    }

    return (
        <span className={`flex items-center gap-1 ${isGood ? 'text-success' : 'text-critical'}`}>
            {type === 'change' ? (value < 0 ? <ArrowDown size={16} /> : <ArrowUp size={16} />) : (value > 0 ? <ArrowDown size={16} /> : <ArrowUp size={16} />)}
            {displayValue}
        </span>
    );
  };

  if (loading) return <div className="p-6 text-center text-secondary">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-highlight">Body Measurements</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Measurement
        </button>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            {metrics.map((metric) => (
              <div key={metric.key} className="space-y-2">
                <label className="text-sm font-medium text-secondary">{metric.label}</label>
                <input
                  type="number"
                  step="0.01"
                  name={metric.key}
                  // @ts-ignore
                  value={formData[metric.key]}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            ))}
            <div className="col-span-full flex justify-end gap-4">
               <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-secondary hover:text-highlight"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Save Measurement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.key} className="card p-4">
              <h3 className="text-sm font-medium text-secondary">{metric.label}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-highlight">{stats[metric.key].current}</span>
                <span className="text-sm text-secondary">in</span>
              </div>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">vs Last</span>
                  {renderDelta(stats[metric.key].deltaLast, 'change')}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Total Loss</span>
                  {renderDelta(stats[metric.key].totalReduction, 'reduction')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics.map((metric) => (
          <div key={metric.key} className="card p-6">
            <h3 className="text-lg font-bold text-highlight mb-4">{metric.label} Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={measurements}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(204,204,255,0.2)" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    stroke="#A3A3CC"
                  />
                  <YAxis stroke="#A3A3CC" domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#292966', borderColor: 'rgba(204,204,255,0.2)', color: '#CCCCFF' }}
                    labelFormatter={(date) => format(new Date(date), 'PPP')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={metric.key} 
                    stroke="#5C5C99" 
                    strokeWidth={2}
                    dot={{ fill: '#5C5C99', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BodyMeasurements;
