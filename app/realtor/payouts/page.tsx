import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { getRealtorPayouts } from '@/lib/db/payouts';
import { DollarSignIcon } from 'lucide-react';

export default async function PayoutsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const payouts = await getRealtorPayouts(session.user.id);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    on_hold: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payouts & Billing</h1>
        <p className="mt-2 text-gray-600">
          Track your commission payouts and statements
        </p>
      </div>

      {payouts.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                      {payout.deal_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {payout.fee_percent ? `${payout.fee_percent}%` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {payout.amount ? `$${payout.amount.toLocaleString()}` : 'TBD'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[payout.status]
                        }`}
                      >
                        {payout.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(payout.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <DollarSignIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No payouts yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Payouts will appear here when deals close
          </p>
        </div>
      )}
    </div>
  );
}

