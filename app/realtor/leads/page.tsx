import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { getRealtorLeads } from '@/lib/db/leads';
import { LeadsKanban } from './_components/LeadsKanban';

export default async function LeadsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const leads = await getRealtorLeads(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leads Pipeline</h1>
        <p className="mt-2 text-gray-600">
          Manage and organize your leads through the sales process
        </p>
      </div>

      <LeadsKanban initialLeads={leads} realtorId={session.user.id} />
    </div>
  );
}

