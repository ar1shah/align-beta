import { SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Configure admin panel preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Notification Preferences</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">
                  Email notifications for new client assignments
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">
                  Daily capacity utilization reports
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Weekly quiz submission summaries
                </span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Assignment Rules</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Auto-assign threshold
                </label>
                <select className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Manual assignment only</option>
                  <option>Auto-assign at 80% capacity</option>
                  <option>Auto-assign at 90% capacity</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Automatically distribute new clients when realtor capacity reaches this threshold
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Display Options</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">
                  Show unassigned clients on dashboard
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">
                  Show recent quiz submissions on dashboard
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Settings are automatically saved and applied to your admin account only.
          </p>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Admin Panel Version</span>
            <span className="font-medium text-gray-900">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Database</span>
            <span className="font-medium text-gray-900">Supabase</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Updated</span>
            <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

