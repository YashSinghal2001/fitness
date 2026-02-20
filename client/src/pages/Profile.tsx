import { User as UserIcon } from 'lucide-react';

const Profile = () => {
  const user = {
    name: 'Default User',
    email: 'user@example.com',
    role: 'client'
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold">Profile</h2>

      <div className="card">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <UserIcon size={48} className="text-primary" />
          </div>
          <h3 className="text-2xl font-bold">{user.name}</h3>
          <p className="text-text-muted">{user.email}</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-background rounded-lg border border-gray-800">
              <p className="text-sm text-text-muted mb-1">Role</p>
              <p className="font-semibold capitalize">{user.role}</p>
            </div>
            <div className="p-4 bg-background rounded-lg border border-gray-800">
              <p className="text-sm text-text-muted mb-1">Account Status</p>
              <p className="font-semibold text-green-500">Active</p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6">
            <h4 className="text-lg font-semibold mb-4">Account Settings</h4>
            <p className="text-text-muted text-sm">
                Account management features (Update Profile, Change Password) would go here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;