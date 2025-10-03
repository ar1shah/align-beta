import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { getRealtorAppointments } from '@/lib/db/appointments';
import { AppointmentsList } from './_components/AppointmentsList';

export default async function AppointmentsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const appointments = await getRealtorAppointments(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-2 text-gray-600">Manage your calendar and schedule</p>
        </div>
      </div>

      <AppointmentsList
        initialAppointments={appointments}
        realtorId={session.user.id}
      />
    </div>
  );
}

