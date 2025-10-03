import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { getRealtorContracts } from '@/lib/db/referrals';
import { getRealtorProfile } from '@/lib/db/profile';
import { MSASignCard } from './_components/MSASignCard';
import { CheckCircle2Icon, AlertCircleIcon } from 'lucide-react';

export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const [contracts, profile] = await Promise.all([
    getRealtorContracts(session.user.id),
    getRealtorProfile(session.user.id),
  ]);

  const msaContract = contracts.find((c) => c.type === 'msa');
  const hasSigned = msaContract && msaContract.status === 'completed';

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Onboarding & Compliance</h1>
        <p className="mt-2 text-gray-600">
          Complete your onboarding to start receiving leads
        </p>
      </div>

      {/* Overall Status */}
      <div
        className={`rounded-xl border-2 p-6 ${
          hasSigned
            ? 'border-green-200 bg-green-50'
            : 'border-yellow-200 bg-yellow-50'
        }`}
      >
        <div className="flex items-start gap-3">
          {hasSigned ? (
            <CheckCircle2Icon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {hasSigned ? 'Onboarding Complete!' : 'Complete Your Onboarding'}
            </h2>
            <p className="text-sm text-gray-700 mt-1">
              {hasSigned
                ? 'You are approved and ready to receive leads.'
                : 'Please review and sign the Master Service Agreement below to get started.'}
            </p>
          </div>
        </div>
      </div>

      {/* MSA Section */}
      <MSASignCard hasSigned={hasSigned} realtorId={session.user.id} />

      {/* License & Brokerage Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          License & Brokerage Information
        </h2>

        {profile ? (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">License Number:</span>
                <p className="text-gray-900 mt-1">
                  {profile.license_number || 'Not provided'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">States:</span>
                <p className="text-gray-900 mt-1">
                  {profile.license_states?.join(', ') || 'Not provided'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Expiration:</span>
                <p className="text-gray-900 mt-1">
                  {profile.license_expiration
                    ? new Date(profile.license_expiration).toLocaleDateString()
                    : 'Not provided'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Brokerage:</span>
                <p className="text-gray-900 mt-1">
                  {profile.brokerage_name || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No profile information found.</p>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <a
            href="/realtor/settings"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Update in Settings →
          </a>
        </div>
      </div>
    </div>
  );
}

