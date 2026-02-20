import { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import api from '../services/api';
import { format } from 'date-fns';

const ReportingDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/progress/reporting');
        setData(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-secondary">Loading...</div>;
  if (!data) return <div className="p-8 text-center text-secondary">No data available</div>;

  const { trends, averages } = data;
  
  // Format dates for charts
  const chartData = trends.map((t: any) => ({
    ...t,
    date: format(new Date(t.date), 'MM/dd')
  }));

  const ChartCard = ({ title, average, unit, children }: any) => (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-highlight">{title}</h3>
        <div className="text-sm text-secondary">
          Avg: <span className="font-bold text-primary">{average} {unit}</span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );

  const tooltipStyle = { backgroundColor: '#292966', borderColor: 'rgba(204,204,255,0.2)', color: '#CCCCFF' };
  const gridStroke = "rgba(204,204,255,0.2)";
  const axisStroke = "#A3A3CC";

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-highlight">Reporting Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Body Weight */}
        <ChartCard title="Body Weight" average={averages.weight} unit="lbs">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" stroke={axisStroke} />
            <YAxis domain={['auto', 'auto']} stroke={axisStroke} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="weight" stroke="#CCCCFF" strokeWidth={2} dot={{r: 3, fill: '#CCCCFF'}} />
          </LineChart>
        </ChartCard>

        {/* 2. Calories */}
        <ChartCard title="Calories" average={averages.calories} unit="kcal">
           <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" stroke={axisStroke} />
            <YAxis stroke={axisStroke} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="calories" stroke="#A3A3CC" strokeWidth={2} dot={{r: 3, fill: '#A3A3CC'}} />
          </LineChart>
        </ChartCard>

        {/* 3. Macronutrients */}
        <ChartCard title="Macronutrients" average={`${averages.protein}p / ${averages.carbs}c / ${averages.fat}f`} unit="g">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" stroke={axisStroke} />
            <YAxis stroke={axisStroke} />
            <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(163,163,204,0.1)'}} />
            <Legend />
            <Bar dataKey="protein" stackId="a" fill="#5C5C99" name="Protein" />
            <Bar dataKey="carbs" stackId="a" fill="#A3A3CC" name="Carbs" />
            <Bar dataKey="fat" stackId="a" fill="#CCCCFF" name="Fat" />
          </BarChart>
        </ChartCard>

        {/* 4. Sleep */}
        <ChartCard title="Nightly Sleep" average={averages.sleep} unit="hrs">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" stroke={axisStroke} />
            <YAxis domain={[0, 12]} stroke={axisStroke} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="sleep" stroke="#5C5C99" strokeWidth={2} dot={{r: 3, fill: '#5C5C99'}} />
          </LineChart>
        </ChartCard>

        {/* 5. Steps */}
        <ChartCard title="Daily Steps" average={averages.steps} unit="steps">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" stroke={axisStroke} />
            <YAxis stroke={axisStroke} />
            <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(163,163,204,0.1)'}} />
            <Bar dataKey="steps" fill="rgba(204,204,255,0.7)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        {/* 6. Water */}
        <ChartCard title="Water Intake" average={averages.water} unit="L">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" stroke={axisStroke} />
            <YAxis stroke={axisStroke} />
            <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(163,163,204,0.1)'}} />
            <Bar dataKey="water" fill="#A3A3CC" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        {/* 7. Hunger */}
        <ChartCard title="Hunger Levels" average={averages.hunger} unit="/ 10">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" stroke={axisStroke} />
            <YAxis domain={[0, 10]} stroke={axisStroke} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="hunger" stroke="#4B4B7F" strokeWidth={2} dot={{r: 3, fill: '#4B4B7F'}} />
          </LineChart>
        </ChartCard>

        {/* 8. Digestion */}
        <ChartCard title="Digestion Quality" average={averages.digestion} unit="(1-3)">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" stroke={axisStroke} />
            <YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} tickFormatter={(val) => val === 1 ? 'Poor' : val === 2 ? 'Avg' : val === 3 ? 'Good' : ''} stroke={axisStroke} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => value === 3 ? 'Good' : value === 2 ? 'Average' : 'Poor'} />
            <Line type="stepAfter" dataKey="digestion" stroke="#CCCCFF" strokeWidth={2} dot={{r: 3, fill: '#CCCCFF'}} />
          </LineChart>
        </ChartCard>
      </div>
    </div>
  );
};

export default ReportingDashboard;
