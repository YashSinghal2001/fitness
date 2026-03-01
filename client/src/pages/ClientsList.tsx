import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, User, Plus } from 'lucide-react';
import api, { createClient } from '../services/api';
import Modal from '../components/Modal';

const ClientsList = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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

  useEffect(() => {
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

  const handleAddClient = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      setMessage(null);
      try {
          await createClient(newClient);
          setMessage({ type: 'success', text: 'Client added successfully.' });
          setNewClient({ name: '', email: '', password: '' });
          setShowAddClient(false);
          fetchClients(); // Refresh list
      } catch (error: any) {
          setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add client' });
      } finally {
          setSubmitting(false);
      }
  };

  if (loading) return <div className="p-6 text-center text-secondary">Loading...</div>;

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Clients</h1>
          <button 
            onClick={() => setShowAddClient(true)}
            className="w-full md:w-auto bg-primary text-white px-4 py-3 md:py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-primary/90 transition-colors shadow-soft"
          >
              <Plus size={20} />
              <span>Add Client</span>
          </button>
      </div>

      {message && (
          <div className={`p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
              {message.text}
          </div>
      )}

      <Modal
        isOpen={showAddClient}
        onClose={() => setShowAddClient(false)}
        title="Add New Client"
      >
        <form onSubmit={handleAddClient} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-secondary mb-1">Name</label>
                <input 
                    type="text" 
                    required
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="input-field"
                    placeholder="John Doe"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary mb-1">Email</label>
                <input 
                    type="email" 
                    required
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="input-field"
                    placeholder="john@example.com"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary mb-1">Password</label>
                <input 
                    type="text" 
                    required
                    minLength={6}
                    value={newClient.password}
                    onChange={(e) => setNewClient({...newClient, password: e.target.value})}
                    className="input-field"
                    placeholder="Set initial password"
                />
            </div>
            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                    {submitting ? 'Adding...' : 'Add Client'}
                </button>
            </div>
        </form>
      </Modal>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-surface rounded-lg p-6 shadow-lg border border-gray-800">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3 text-secondary">Name</th>
                <th className="p-3 text-secondary">Email</th>
                <th className="p-3 text-secondary">Joined</th>
                <th className="p-3 text-secondary">Status</th>
                <th className="p-3 text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client._id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                  <td className="p-3 text-highlight font-medium">{client.name}</td>
                  <td className="p-3 text-secondary">{client.email}</td>
                  <td className="p-3 text-secondary">{new Date(client.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    {client.mustChangePassword ? (
                        <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-500">
                            Pending Reset
                        </span>
                    ) : (
                        <button 
                            onClick={() => toggleStatus(client._id, client.isActive)}
                            className={`px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${client.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                        >
                            {client.isActive ? 'Active' : 'Inactive'}
                        </button>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-3">
                      <Link 
                          to={`/admin/clients/${client._id}`}
                          className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
                          title="View Profile"
                      >
                          <User size={18} />
                          <span className="text-sm">Profile</span>
                      </Link>
                      <Link 
                          to={`/admin/clients/${client._id}/nutrition`}
                          className="flex items-center space-x-1 text-secondary hover:text-white transition-colors"
                          title="Nutrition Plan"
                      >
                          <Utensils size={18} />
                          <span className="text-sm">Plan</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                  <tr>
                      <td colSpan={5} className="p-8 text-center text-secondary">
                          No clients found. Add one to get started.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {clients.map((client) => (
          <div key={client._id} className="bg-surface rounded-lg p-4 shadow-md border border-gray-800">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-highlight">{client.name}</h3>
                <p className="text-sm text-secondary">{client.email}</p>
              </div>
              {client.mustChangePassword ? (
                  <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-500 whitespace-nowrap">
                      Reset
                  </span>
              ) : (
                  <button 
                      onClick={() => toggleStatus(client._id, client.isActive)}
                      className={`px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap ${client.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                  >
                      {client.isActive ? 'Active' : 'Inactive'}
                  </button>
              )}
            </div>
            
            <div className="flex items-center text-xs text-secondary mb-4">
              <span>Joined: {new Date(client.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex space-x-2 border-t border-gray-800 pt-3">
              <Link 
                  to={`/admin/clients/${client._id}`}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 bg-secondary/10 rounded-lg text-primary hover:bg-secondary/20 transition-colors"
              >
                  <User size={16} />
                  <span className="text-sm">Profile</span>
              </Link>
              <Link 
                  to={`/admin/clients/${client._id}/nutrition`}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 bg-secondary/10 rounded-lg text-secondary hover:text-white hover:bg-secondary/20 transition-colors"
              >
                  <Utensils size={16} />
                  <span className="text-sm">Plan</span>
              </Link>
            </div>
          </div>
        ))}
        {clients.length === 0 && (
            <div className="p-8 text-center text-secondary bg-surface rounded-lg border border-gray-800">
                No clients found. Add one to get started.
            </div>
        )}
      </div>
    </div>
  );
};

export default ClientsList;
