import { useEffect, useState } from 'react';
import api from '../services/api';

const AdminReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/admin/reports');
        setReports(response.data);
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-primary">Recent Weekly Reports</h1>
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report._id} className="bg-surface p-4 rounded-lg shadow-lg border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">{report.client?.name || 'Unknown Client'}</h3>
              <span className="text-sm text-text-muted">{new Date(report.date).toLocaleDateString()}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <span className="text-gray-400">Weight:</span> {report.weight} kg
                </div>
                <div>
                    <span className="text-gray-400">Calories:</span> {report.calories}
                </div>
                <div>
                    <span className="text-gray-400">Protein:</span> {report.protein}g
                </div>
                <div>
                    <span className="text-gray-400">Sleep:</span> {report.sleep} hrs
                </div>
            </div>
            {report.notes && (
                <div className="mt-2 text-sm text-gray-300 italic">
                    "{report.notes}"
                </div>
            )}
          </div>
        ))}
        {reports.length === 0 && <p className="text-gray-400">No reports found.</p>}
      </div>
    </div>
  );
};

export default AdminReports;
