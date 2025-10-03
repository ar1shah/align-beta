import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { getRealtorProfile } from '@/lib/db/profile';
import { SettingsForm } from './_components/SettingsForm';

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const [profile, baseProfile] = await Promise.all([
    getRealtorProfile(session.user.id),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then((res) => res.data),
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your profile and preferences
        </p>
      </div>

      <SettingsForm
        realtorId={session.user.id}
        email={session.user.email || ''}
        initialProfile={profile}
        baseProfile={baseProfile}
      />
    </div>
  );
}

