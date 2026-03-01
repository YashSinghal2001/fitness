import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '../services/api';
import { Copy, Share2, Check } from 'lucide-react';
import Modal from '../components/Modal';

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
    <div className="w-full max-w-lg mx-auto p-4 md:p-8">
      <div className="bg-surface p-6 md:p-8 rounded-lg shadow-glow border border-border">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-highlight mb-6">
          Create New Client
        </h2>

        {error && (
          <div className="bg-critical/20 border border-critical text-highlight px-4 py-2 rounded mb-4 text-center text-sm">
            {error}
          </div>
        )}

        {success && !createdClient && (
           <div className="bg-green-500/20 border border-green-500 text-highlight px-4 py-2 rounded mb-4 text-center text-sm">
            <p className="font-bold">{success}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-highlight mb-1"
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
              className="input-field"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-highlight mb-1"
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
              className="input-field"
              placeholder="john@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
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
      <Modal
        isOpen={!!createdClient}
        onClose={() => setCreatedClient(null)}
        title="Success!"
        maxWidth="md"
      >
        {createdClient && (
          <>
            <p className="text-muted text-center mb-6">Client created successfully. Share these credentials securely.</p>

            <div className="space-y-4">
              <div className="bg-background p-4 rounded-md border border-border">
                <label className="text-xs text-muted uppercase tracking-wider block mb-1">Email</label>
                <div className="flex items-center justify-between">
                  <span className="text-white font-mono break-all text-sm md:text-base">{createdClient.email}</span>
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
                  <span className="text-white font-mono break-all text-sm md:text-base">{createdClient.generatedPassword}</span>
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

            <div className="mt-8 flex flex-col md:flex-row gap-3">
              <button
                onClick={shareOnWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-2 px-4 rounded-md transition-colors min-h-[44px]"
              >
                <Share2 size={18} />
                WhatsApp
              </button>
              <button
                onClick={() => setCreatedClient(null)}
                className="flex-1 bg-primary hover:bg-opacity-90 text-white py-2 px-4 rounded-md transition-colors min-h-[44px]"
              >
                Done
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default CreateClient;
