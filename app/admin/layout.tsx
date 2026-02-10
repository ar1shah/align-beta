import Link from 'next/link';
import Image from 'next/image';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-border/50 flex flex-col shadow-soft">
        {/* Logo Section */}
        <div className="p-6 border-b border-border/50">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <Image 
                src="/bluelogo.svg" 
                alt="Align" 
                width={40} 
                height={40}
                className="transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Align</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-item group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <Separator className="mx-4" />

        {/* User Section */}
        <div className="p-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/50">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-sm">
                {profile?.full_name?.[0]?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user.email}
              </p>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-destructive rounded-lg hover:bg-destructive/10 transition-all duration-200"
            >
              <LogOutIcon className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
