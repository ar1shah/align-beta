import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import {
  LayoutDashboardIcon,
  UsersIcon,
  UserCheckIcon,
  LinkIcon,
  FileTextIcon,
  ShieldAlertIcon,
  SettingsIcon,
  LogOutIcon,
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboardIcon },
    { href: '/admin/clients', label: 'Clients', icon: UsersIcon },
    { href: '/admin/realtors', label: 'Realtors', icon: UserCheckIcon },
    { href: '/admin/assignments', label: 'Assignments', icon: LinkIcon },
    { href: '/admin/quizzes', label: 'Quizzes', icon: FileTextIcon },
    { href: '/admin/audit', label: 'Audit Log', icon: ShieldAlertIcon },
    { href: '/admin/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Align
          </h1>
          <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-medium">
              {profile?.full_name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOutIcon className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}

