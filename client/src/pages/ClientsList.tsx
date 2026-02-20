import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Utensils } from 'lucide-react';
import api from '../services/api';

const ClientsList = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/admin/clients');
        setClients(response.data);
      } catch (error) {
        console.error('Failed to fetch clients', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const toggleStatus = async (clientId: string, currentStatus: boolean) => {
    try {
        const response = await api.put(`/admin/clients/${clientId}`, { isActive: !currentStatus });
        setClients(clients.map(c => c._id === clientId ? { ...c, isActive: response.data.isActive } : c));
    } catch (error) {
        console.error('Failed to update client status', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-primary">Clients</h1>
      <div className="bg-surface rounded-lg p-6 shadow-lg border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client._id} className="border-b border-gray-800 hover:bg-white/5">
                  <td className="p-3">{client.name}</td>
                  <td className="p-3">{client.email}</td>
                  <td className="p-3">{new Date(client.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button 
                        onClick={() => toggleStatus(client._id, client.isActive)}
                        className={`px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 ${client.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                    >
                      {client.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-3">
                    <Link 
                        to={`/admin/clients/${client._id}/nutrition`}
                        className="flex items-center space-x-1 text-primary hover:text-primary/80"
                        title="Nutrition Plan"
                    >
                        <Utensils size={18} />
                        <span className="text-sm">Plan</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientsList;
