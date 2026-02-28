import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { changePassword, resetPassword } from '../services/api';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const { currentPassword, newPassword, confirmNewPassword } = formData;

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

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      if (token) {
        // Reset Password Flow (via Email Link)
        await resetPassword(token, newPassword);
      } else {
        // Change Password Flow (via Forced Login)
        await changePassword({ currentPassword, newPassword });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to update password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-surface p-8 rounded-lg shadow-glow border border-border">
        <h2 className="text-3xl font-bold text-center text-highlight mb-6">
          {token ? 'Reset Password' : 'Change Password'}
        </h2>
        <p className="text-center text-muted mb-6">
          {token
            ? 'Enter your new password below.'
            : 'You must change your password before continuing.'}
        </p>

        {error && (
          <div className="bg-critical/20 border border-critical text-highlight px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {!token && (
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-highlight"
              >
                Current (Temporary) Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={currentPassword}
                onChange={onChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-highlight"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={onChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="confirmNewPassword"
              className="block text-sm font-medium text-highlight"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              name="confirmNewPassword"
              value={confirmNewPassword}
              onChange={onChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading
              ? 'Updating Password...'
              : token
              ? 'Reset Password'
              : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
