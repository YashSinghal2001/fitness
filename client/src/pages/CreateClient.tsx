import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '../services/api';
import { Copy, Share2, Check, X } from 'lucide-react';

const CreateClient = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdClient, setCreatedClient] = useState<{email: string, generatedPassword: string} | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const navigate = useNavigate();

  const { name, email } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setCreatedClient(null);

    try {
      const data = await createClient(formData);
      setSuccess(data.message);
      setCreatedClient({
        email: data.email,
        generatedPassword: data.generatedPassword
      });
      setFormData({ name: '', email: '' });
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to create client. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const shareOnWhatsApp = () => {
    if (!createdClient) return;
    const text = `Login details:\nEmail: ${createdClient.email}\nPassword: ${createdClient.generatedPassword}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background p-8 relative">
      <div className="max-w-md mx-auto bg-surface p-8 rounded-lg shadow-glow border border-border">
        <h2 className="text-3xl font-bold text-center text-highlight mb-6">
          Create New Client
        </h2>

        {error && (
          <div className="bg-critical/20 border border-critical text-highlight px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {success && !createdClient && (
           <div className="bg-green-500/20 border border-green-500 text-highlight px-4 py-2 rounded mb-4 text-center">
            <p className="font-bold">{success}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-highlight"
            >
              Client Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-highlight"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Creating Client...' : 'Create Client'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
            <button 
                onClick={() => navigate('/admin/clients')}
                className="text-sm text-muted hover:text-white transition-colors"
            >
                &larr; Back to Clients List
            </button>
        </div>
      </div>

      {/* Success Modal */}
      {createdClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-lg shadow-2xl p-6 w-full max-w-md m-4 relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setCreatedClient(null)}
              className="absolute top-4 right-4 text-muted hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold text-highlight mb-2 text-center">Success!</h3>
            <p className="text-muted text-center mb-6">Client created successfully. Share these credentials securely.</p>

            <div className="space-y-4">
              <div className="bg-background p-4 rounded-md border border-border">
                <label className="text-xs text-muted uppercase tracking-wider block mb-1">Email</label>
                <div className="flex items-center justify-between">
                  <span className="text-white font-mono break-all">{createdClient.email}</span>
                  <button 
                    onClick={() => copyToClipboard(createdClient.email, 'email')}
                    className="p-2 hover:bg-surface rounded-full transition-colors ml-2 text-primary"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div className="bg-background p-4 rounded-md border border-border">
                <label className="text-xs text-muted uppercase tracking-wider block mb-1">Password</label>
                <div className="flex items-center justify-between">
                  <span className="text-white font-mono break-all">{createdClient.generatedPassword}</span>
                  <button 
                    onClick={() => copyToClipboard(createdClient.generatedPassword, 'password')}
                    className="p-2 hover:bg-surface rounded-full transition-colors ml-2 text-primary"
                    title="Copy Password"
                  >
                    {copiedPassword ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={shareOnWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-2 px-4 rounded-md transition-colors"
              >
                <Share2 size={18} />
                WhatsApp
              </button>
              <button
                onClick={() => setCreatedClient(null)}
                className="flex-1 bg-primary hover:bg-opacity-90 text-white py-2 px-4 rounded-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateClient;