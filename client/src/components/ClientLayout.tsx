import { Outlet, useLocation } from 'react-router-dom';
import ClientSidebar from './ClientSidebar';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';

const ClientLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-background text-highlight font-sans relative">
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#1E1E4B] border-b border-border sticky top-0 z-30">
         <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="p-1 hover:bg-white/10 rounded-md text-highlight">
                <Menu size={24} />
             </button>
             <span className="font-bold text-lg text-highlight">GymProgress</span>
         </div>
       </div>

      <ClientSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="lg:ml-64 p-4 lg:p-8 w-full max-w-full overflow-x-hidden min-h-[100dvh] safe-area-bottom">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;
