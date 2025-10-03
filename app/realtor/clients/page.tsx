import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { getRealtorClients } from '@/lib/db/clients';
import { ClientsTable } from './_components/ClientsTable';

export default async function ClientsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const clients = await getRealtorClients(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <p className="mt-2 text-gray-600">
          Manage your client relationships and information
        </p>
      </div>

      <ClientsTable initialClients={clients} realtorId={session.user.id} />
    </div>
  );
}

