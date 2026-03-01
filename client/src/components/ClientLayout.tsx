import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import ClientSidebar from './ClientSidebar';

const ClientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-highlight font-sans">
      <ClientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile Header */}
      <div className="md:hidden bg-[#1E1E4B] p-4 flex items-center justify-between border-b border-border sticky top-0 z-30 pt-safe">
        <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="text-highlight p-1 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <span className="text-lg font-bold text-highlight">GymProgress</span>
        </div>
      </div>

      <main className="md:ml-64 p-4 md:p-8 w-full max-w-full overflow-x-hidden min-h-[calc(100vh-64px)] md:min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;
