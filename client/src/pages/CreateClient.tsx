import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '../services/api';

const CreateClient = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password } = formData;

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

    try {
      const data = await createClient(formData);
      setSuccess(data.message);
      setFormData({ name: '', email: '', password: '' });
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to create client. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto bg-surface p-8 rounded-lg shadow-glow border border-border">
        <h2 className="text-3xl font-bold text-center text-highlight mb-6">
          Create New Client
        </h2>

        {error && (
          <div className="bg-critical/20 border border-critical text-highlight px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {success && (
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

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-highlight"
            >
              Password
            </label>
            <input
              type="text"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              minLength={6}
              className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Set initial password"
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
    </div>
  );
};

export default CreateClient;
