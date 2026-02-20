import { Outlet } from 'react-router-dom';
import ClientSidebar from './ClientSidebar';

const ClientLayout = () => {
  return (
    <div className="min-h-screen bg-background text-highlight font-sans">
      <ClientSidebar />
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;
