import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { getRealtorContracts } from '@/lib/db/referrals';
import { FileTextIcon, CheckCircleIcon } from 'lucide-react';

export default async function ReferralsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const contracts = await getRealtorContracts(session.user.id);

  const statusColors = {
    pending_signature: 'bg-yellow-100 text-yellow-700',
    active: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Referral Contracts</h1>
        <p className="mt-2 text-gray-600">
          View your MSA and individual deal contracts
        </p>
      </div>

      {contracts.length > 0 ? (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileTextIcon className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {contract.type === 'msa'
                        ? 'Master Service Agreement'
                        : 'Deal Contract'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          statusColors[contract.status]
                        }`}
                      >
                        {contract.status.replace('_', ' ')}
                      </span>
                    </div>

                    {contract.fee_percent && (
                      <div>
                        <span className="text-gray-500">Fee:</span>
                        <span className="ml-2 text-gray-900 font-medium">
                          {contract.fee_percent}%
                        </span>
                      </div>
                    )}

                    {contract.territory && (
                      <div>
                        <span className="text-gray-500">Territory:</span>
                        <span className="ml-2 text-gray-900">
                          {contract.territory}
                        </span>
                      </div>
                    )}

                    {contract.countersigned && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span className="text-sm">Countersigned</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Created: {new Date(contract.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No contracts found</p>
          <p className="text-sm text-gray-500 mt-2">
            Complete your onboarding to sign the MSA
          </p>
        </div>
      )}
    </div>
  );
}

