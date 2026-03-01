import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Utensils, User, Plus, X } from "lucide-react";
import api, { createClient } from "../services/api";
import ClientSuccessModal from "../components/ClientSuccessModal";

const ClientsList = () => {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddClient, setShowAddClient] = useState(false);
    const [newClient, setNewClient] = useState({ name: "", email: "" });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [createdClient, setCreatedClient] = useState<{ email: string; generatedPassword: string } | null>(null);

    const fetchClients = async () => {
        try {
            const response = await api.get("/admin/clients");
            setClients(response.data);
        } catch (error) {
            console.error("Failed to fetch clients", error);
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
            setClients(clients.map((c) => (c._id === clientId ? { ...c, isActive: response.data.isActive } : c)));
        } catch (error) {
            console.error("Failed to update client status", error);
        }
    };

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);
        setCreatedClient(null);
        try {
            const data = await createClient(newClient);
            setCreatedClient({
                email: data.email,
                generatedPassword: data.generatedPassword,
            });
            setNewClient({ name: "", email: "" });
            setShowAddClient(false);
            fetchClients(); // Refresh list
        } catch (error: any) {
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to add client" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6 relative">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary">Clients</h1>
                <button onClick={() => setShowAddClient(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary/90 transition-colors">
                    <Plus size={20} />
                    <span>Add Client</span>
                </button>
            </div>

            {message && <div className={`p-4 mb-4 rounded-lg ${message.type === "success" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>{message.text}</div>}

            {/* Add Client Modal */}
            {showAddClient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-surface p-6 rounded-lg w-full max-w-md border border-gray-800 shadow-xl relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowAddClient(false)} className="absolute top-4 right-4 text-secondary hover:text-white">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-highlight">Add New Client</h2>
                        <form onSubmit={handleAddClient} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">Name</label>
                                <input type="text" required value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} className="w-full bg-background border border-gray-700 rounded-lg p-2 text-highlight focus:outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">Email</label>
                                <input type="email" required value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} className="w-full bg-background border border-gray-700 rounded-lg p-2 text-highlight focus:outline-none focus:border-primary" />
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={submitting} className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50">
                                    {submitting ? "Adding..." : "Add Client"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-surface rounded-lg p-6 shadow-lg border border-gray-800">
                <div className="overflow-x-auto">
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
                                            <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-500">Pending Reset</span>
                                        ) : (
                                            <button onClick={() => toggleStatus(client._id, client.isActive)} className={`px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${client.isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                                                {client.isActive ? "Active" : "Inactive"}
                                            </button>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex space-x-3">
                                            <Link to={`/admin/clients/${client._id}`} className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors" title="View Profile">
                                                <User size={18} />
                                                <span className="text-sm hidden md:inline">Profile</span>
                                            </Link>
                                            <Link to={`/admin/clients/${client._id}/nutrition`} className="flex items-center space-x-1 text-secondary hover:text-white transition-colors" title="Nutrition Plan">
                                                <Utensils size={18} />
                                                <span className="text-sm hidden md:inline">Plan</span>
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

            {/* Success Modal */}
            {createdClient && <ClientSuccessModal email={createdClient.email} generatedPassword={createdClient.generatedPassword} onClose={() => setCreatedClient(null)} />}
        </div>
    );
};

export default ClientsList;
