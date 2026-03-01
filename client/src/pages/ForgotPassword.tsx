import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../services/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await forgotPassword(email);
      // In a real email flow, we would just say "check your email"
      // But for this "no email" version, we get the token back and proceed to step 2
      if (response.data && response.data.resetToken) {
          setToken(response.data.resetToken);
          setStep(2);
          setSuccess('Token generated. Please enter your new password.');
      } else {
          // Fallback if token is not in data directly (it should be per our backend update)
           setSuccess('If the email exists, a reset link would be sent. (Dev: Check network response for token)');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(token, newPassword);
      setSuccess('Password reset successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-surface p-8 rounded-lg shadow-glow border border-border">
        <h2 className="text-3xl font-bold text-center text-highlight mb-6">
          Reset Password
        </h2>

        {error && (
          <div className="bg-critical/20 border border-critical text-highlight px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-highlight px-4 py-2 rounded mb-4 text-center">
            {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-highlight">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Processing...' : 'Request Reset'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-6">
            {/* Show token just for clarity/copying if needed in manual testing, but it's already in state */}
            <div className="bg-gray-800 p-2 rounded text-xs text-gray-400 break-all mb-4">
                Token: {token}
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-highlight">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="New password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-highlight">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Confirm password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Resetting...' : 'Set New Password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary hover:text-primary/80">
                Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;