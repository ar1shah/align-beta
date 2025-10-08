import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/auth';
import { Card } from '../_components/Card';
import { Button } from '../_components/Button';

async function LogoutButton() {
  return (
    <form
      action={async () => {
        'use server';
        const { createServerSupabaseClient } = await import('@/lib/supabaseServer');
        const supabase = await createServerSupabaseClient();
        await supabase.auth.signOut();
        redirect('/login');
      }}
    >
      <Button type="submit" variant="outline">
        Log Out
      </Button>
    </form>
  );
}

export default async function DashboardPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect('/login');
  }

  // Capitalize the role name
  const roleDisplay =
    profile.role.charAt(0).toUpperCase() + profile.role.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Align</h1>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-2xl mx-auto text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full text-2xl font-bold mb-2">
              {profile.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome to {roleDisplay} dashboard
            </h2>
            {profile.full_name && (
              <p className="text-gray-600">
                Hello, {profile.full_name}! You&apos;re logged in as a {profile.role}.
              </p>
            )}
            <div className="pt-4 text-sm text-gray-500">
              <p>Your authentication is working correctly.</p>
              <p className="mt-1">
                Dashboard features coming soon...
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

