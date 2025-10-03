import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { getRealtorDeals } from '@/lib/db/deals';
import { DealsTable } from './_components/DealsTable';

export default async function DealsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const deals = await getRealtorDeals(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Deals Pipeline</h1>
        <p className="mt-2 text-gray-600">Track your transactions from lead to close</p>
      </div>

      <DealsTable initialDeals={deals} realtorId={session.user.id} />
    </div>
  );
}

