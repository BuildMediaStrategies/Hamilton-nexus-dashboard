import { useState } from 'react';
import { User, Bell, Shield, Database } from 'lucide-react';

interface SettingsPageProps {
  userEmail: string;
}

export function SettingsPage({ userEmail }: SettingsPageProps) {
  const [activePanel, setActivePanel] = useState<
    'profile' | 'security' | 'notifications' | 'data' | null
  >(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black"
            style={{
              background: 'linear-gradient(135deg, #A30E15 0%, #780A0F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Settings
          </h1>
          <p className="text-[#666666] mt-1 font-medium">System configuration and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          type="button"
          onClick={() => setActivePanel('profile')}
          className="neumorphic-card border border-[#e5e5e5] bg-white hover:border-[#A30E15] transition-all cursor-pointer text-left"
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="neumorphic-icon-box p-3">
                <User className="w-6 h-6 text-[#A30E15]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black">Profile Settings</h3>
                <p className="text-sm text-[#666666]">Update your personal information</p>
              </div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActivePanel('notifications')}
          className="neumorphic-card border border-[#e5e5e5] bg-white hover:border-[#A30E15] transition-all cursor-pointer text-left"
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="neumorphic-icon-box p-3">
                <Bell className="w-6 h-6 text-[#A30E15]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black">Notifications</h3>
                <p className="text-sm text-[#666666]">Manage notification preferences</p>
              </div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActivePanel('security')}
          className="neumorphic-card border border-[#e5e5e5] bg-white hover:border-[#A30E15] transition-all cursor-pointer text-left"
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="neumorphic-icon-box p-3">
                <Shield className="w-6 h-6 text-[#A30E15]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black">Security</h3>
                <p className="text-sm text-[#666666]">Password and authentication</p>
              </div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActivePanel('data')}
          className="neumorphic-card border border-[#e5e5e5] bg-white hover:border-[#A30E15] transition-all cursor-pointer text-left"
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="neumorphic-icon-box p-3">
                <Database className="w-6 h-6 text-[#A30E15]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black">Data Management</h3>
                <p className="text-sm text-[#666666]">Export and backup options</p>
              </div>
            </div>
          </div>
        </button>
      </div>

      {activePanel && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl">
          {activePanel === 'profile' && (
            <>
              <h3 className="text-lg font-semibold mb-2">Profile Settings</h3>
              <p className="text-gray-600 text-sm">
                Profile management will be expanded in the next phase. For now, your login email is:
              </p>
              <p className="mt-2 font-mono text-sm">
                {userEmail}
              </p>
            </>
          )}
          {activePanel === 'security' && (
            <>
              <h3 className="text-lg font-semibold mb-2">Security</h3>
              <p className="text-gray-600 text-sm">
                Password changes are currently managed through Supabase. This section will later allow Myles to update credentials and enable multi-factor security.
              </p>
            </>
          )}
          {activePanel === 'notifications' && (
            <>
              <h3 className="text-lg font-semibold mb-2">Notifications</h3>
              <p className="text-gray-600 text-sm">
                Notification preferences will be configurable here in a later release.
              </p>
            </>
          )}
          {activePanel === 'data' && (
            <>
              <h3 className="text-lg font-semibold mb-2">Data Management</h3>
              <p className="text-gray-600 text-sm">
                Export and backup options will be added here in the next phase. For now, data can be exported directly from Supabase as needed.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
