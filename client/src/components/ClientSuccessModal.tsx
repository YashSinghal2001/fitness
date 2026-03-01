import React, { useState } from 'react';
import { Copy, Share2, Check, X } from 'lucide-react';

interface ClientSuccessModalProps {
  email: string;
  generatedPassword: string;
  onClose: () => void;
}

const ClientSuccessModal: React.FC<ClientSuccessModalProps> = ({ email, generatedPassword, onClose }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedBoth, setCopiedBoth] = useState(false);

  const copyToClipboard = (text: string, type: 'email' | 'password' | 'both') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else if (type === 'password') {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    } else {
        setCopiedBoth(true);
        setTimeout(() => setCopiedBoth(false), 2000);
    }
  };

  const handleShare = () => {
    const text = `Your GymProgress login credentials:\nEmail: ${email}\nPassword: ${generatedPassword}\nLogin here: ${window.location.origin}/login`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface border border-border rounded-lg shadow-2xl p-6 w-full max-w-md m-4 relative animate-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-2xl font-bold text-highlight mb-2 text-center">Client Added Successfully</h3>
        <p className="text-muted text-center mb-6">Share these credentials securely.</p>

        <div className="space-y-4">
          <div className="bg-background p-4 rounded-md border border-border space-y-3">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider block mb-1">Client Email (ID)</label>
              <div className="flex justify-between items-center group">
                <code className="text-primary font-mono text-lg break-all">{email}</code>
                <button 
                  onClick={() => copyToClipboard(email, 'email')}
                  className="text-muted hover:text-primary transition-colors p-1"
                  title="Copy Email"
                >
                  {copiedEmail ? <span className="text-green-500 text-xs font-bold mr-1">Copied!</span> : null}
                  {copiedEmail ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            
            <div className="border-t border-border pt-3">
              <label className="text-xs text-muted uppercase tracking-wider block mb-1">Generated Password</label>
              <div className="flex justify-between items-center group">
                <code className="text-primary font-mono text-lg break-all">{generatedPassword}</code>
                <button 
                  onClick={() => copyToClipboard(generatedPassword, 'password')}
                  className="text-muted hover:text-primary transition-colors p-1"
                  title="Copy Password"
                >
                  {copiedPassword ? <span className="text-green-500 text-xs font-bold mr-1">Copied!</span> : null}
                  {copiedPassword ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button
              onClick={() => copyToClipboard(`Email: ${email}\nPassword: ${generatedPassword}`, 'both')}
              className="flex items-center justify-center space-x-2 bg-secondary/10 hover:bg-secondary/20 text-secondary py-2 px-4 rounded-md transition-colors border border-secondary/20"
            >
              {copiedBoth ? <Check size={18} /> : <Copy size={18} />}
              <span>{copiedBoth ? 'Copied!' : 'Copy Both'}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors shadow-lg shadow-green-900/20"
            >
              <Share2 size={18} />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-muted">
            Password is only shown once and not stored.
        </div>
      </div>
    </div>
  );
};

export default ClientSuccessModal;
