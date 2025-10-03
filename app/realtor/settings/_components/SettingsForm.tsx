'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RealtorProfile } from '@/lib/db/profile';

interface BaseProfile {
  full_name?: string;
  phone?: string;
}

interface SettingsFormProps {
  realtorId: string;
  email: string;
  initialProfile: RealtorProfile | null;
  baseProfile: BaseProfile | null;
}

export function SettingsForm({
  realtorId,
  email,
  initialProfile,
  baseProfile,
}: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    full_name: baseProfile?.full_name || '',
    phone: baseProfile?.phone || '',
    bio: initialProfile?.bio || '',
    website: initialProfile?.website || '',
    license_number: initialProfile?.license_number || '',
    license_states: initialProfile?.license_states?.join(', ') || '',
    license_expiration: initialProfile?.license_expiration || '',
    brokerage_name: initialProfile?.brokerage_name || '',
    brokerage_address: initialProfile?.brokerage_address || '',
    coverage_cities: initialProfile?.coverage_cities?.join(', ') || '',
    coverage_counties: initialProfile?.coverage_counties?.join(', ') || '',
    coverage_zips: initialProfile?.coverage_zips?.join(', ') || '',
    price_bands: initialProfile?.price_bands?.join(', ') || '',
    property_types: initialProfile?.property_types?.join(', ') || '',
    new_lead_alerts: initialProfile?.new_lead_alerts ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Update base profile
      await fetch('/api/realtor/profile/update-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          realtor_id: realtorId,
          full_name: formData.full_name,
          phone: formData.phone,
        }),
      });

      // Update realtor profile
      await fetch('/api/realtor/profile/update-realtor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          realtor_id: realtorId,
          bio: formData.bio,
          website: formData.website,
          license_number: formData.license_number,
          license_states: formData.license_states
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          license_expiration: formData.license_expiration || null,
          brokerage_name: formData.brokerage_name,
          brokerage_address: formData.brokerage_address,
          coverage_cities: formData.coverage_cities
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          coverage_counties: formData.coverage_counties
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          coverage_zips: formData.coverage_zips
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          price_bands: formData.price_bands
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          property_types: formData.property_types
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          new_lead_alerts: formData.new_lead_alerts,
        }),
      });

      setMessage('Profile updated successfully!');
      router.refresh();
    } catch {
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* License Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          License Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Number
            </label>
            <input
              type="text"
              value={formData.license_number}
              onChange={(e) =>
                setFormData({ ...formData, license_number: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              States (comma separated)
            </label>
            <input
              type="text"
              value={formData.license_states}
              onChange={(e) =>
                setFormData({ ...formData, license_states: e.target.value })
              }
              placeholder="FL, GA, SC"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date
            </label>
            <input
              type="date"
              value={formData.license_expiration}
              onChange={(e) =>
                setFormData({ ...formData, license_expiration: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Brokerage Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Brokerage Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brokerage Name
            </label>
            <input
              type="text"
              value={formData.brokerage_name}
              onChange={(e) =>
                setFormData({ ...formData, brokerage_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brokerage Address
            </label>
            <input
              type="text"
              value={formData.brokerage_address}
              onChange={(e) =>
                setFormData({ ...formData, brokerage_address: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Coverage Areas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Coverage Areas
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cities (comma separated)
            </label>
            <input
              type="text"
              value={formData.coverage_cities}
              onChange={(e) =>
                setFormData({ ...formData, coverage_cities: e.target.value })
              }
              placeholder="Miami, Fort Lauderdale, Boca Raton"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Counties (comma separated)
            </label>
            <input
              type="text"
              value={formData.coverage_counties}
              onChange={(e) =>
                setFormData({ ...formData, coverage_counties: e.target.value })
              }
              placeholder="Miami-Dade, Broward, Palm Beach"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Codes (comma separated)
            </label>
            <input
              type="text"
              value={formData.coverage_zips}
              onChange={(e) =>
                setFormData({ ...formData, coverage_zips: e.target.value })
              }
              placeholder="33101, 33139, 33140"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Bands (comma separated)
            </label>
            <input
              type="text"
              value={formData.price_bands}
              onChange={(e) =>
                setFormData({ ...formData, price_bands: e.target.value })
              }
              placeholder="0-250k, 250k-500k, 500k+"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Types (comma separated)
            </label>
            <input
              type="text"
              value={formData.property_types}
              onChange={(e) =>
                setFormData({ ...formData, property_types: e.target.value })
              }
              placeholder="condo, single_family, townhome"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Notifications
        </h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.new_lead_alerts}
            onChange={(e) =>
              setFormData({ ...formData, new_lead_alerts: e.target.checked })
            }
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Receive email alerts for new lead assignments
          </span>
        </label>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes('success')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

