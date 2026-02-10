import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { getClientAssignmentByUserId, ClientAssignment } from '@/lib/db/admin';
import { Card } from '../_components/Card';
import { CheckCircle, Clock, UserCheck, Phone, Mail, LogOut } from 'lucide-react';

async function getUserProfile() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return profile;
}

async function getSessionServer() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

function LogoutButton() {
  return (
    <form action="/api/auth/signout" method="POST">
      <button
        type="submit"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </form>
  );
}

function WaitingForMatchScreen({ fullName }: { fullName: string | null }) {
  return (
    <Card variant="elevated" className="p-8 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-100 flex items-center justify-center animate-pulse">
        <Clock className="w-10 h-10 text-brand-600" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3">
        Finding Your Perfect Match
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {fullName ? `Hi ${fullName}! ` : ''}
        We&apos;re reviewing your responses and finding the best realtor match for your
        needs. You&apos;ll receive an email once we&apos;ve found your match.
      </p>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Quiz completed successfully
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Matching in progress
        </div>
      </div>
    </Card>
  );
}

function MatchFoundScreen({ assignment }: { assignment: ClientAssignment }) {
  return (
    <Card variant="elevated" className="p-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          You&apos;ve Been Matched!
        </h2>
        <p className="text-muted-foreground">
          Great news! We&apos;ve found a realtor who&apos;s perfect for your needs.
        </p>
      </div>

      <div className="bg-accent/50 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {assignment.realtor.full_name?.[0]?.toUpperCase() || 'R'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              {assignment.realtor.full_name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <UserCheck className="w-4 h-4" />
              Your assigned realtor
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {assignment.realtor.email && (
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <a
                href={`mailto:${assignment.realtor.email}`}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                {assignment.realtor.email}
              </a>
            </div>
          )}
          {assignment.realtor.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <a
                href={`tel:${assignment.realtor.phone}`}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                {assignment.realtor.phone}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Your realtor will reach out to you shortly.</p>
        <p className="mt-1">
          Matched on {new Date(assignment.assigned_at).toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
}

function DefaultDashboard({ profile }: { profile: { full_name: string | null; role: string } }) {
  return (
    <Card variant="elevated" className="p-8 text-center">
      <h2 className="text-2xl font-bold text-foreground mb-3">
        Welcome{profile.full_name ? `, ${profile.full_name}` : ''}!
      </h2>
      <p className="text-muted-foreground">
        You&apos;re logged in as a <span className="font-medium capitalize">{profile.role}</span>.
      </p>
    </Card>
  );
}

export default async function DashboardPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect('/login');
  }

  // Redirect admin and realtor to their specific dashboards
  if (profile.role === 'admin') {
    redirect('/admin');
  }
  if (profile.role === 'realtor') {
    redirect('/realtor');
  }

  // For clients, check if they have an assignment
  let assignment: ClientAssignment | null = null;
  if (profile.role === 'client') {
    const session = await getSessionServer();
    if (session) {
      assignment = await getClientAssignmentByUserId(session.user.id);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <Image 
                src="/bluelogo.svg" 
                alt="Align" 
                width={36} 
                height={36}
                className="transition-transform duration-200 group-hover:scale-105"
              />
              <span className="text-xl font-bold gradient-text">Align</span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {profile.role === 'client' ? (
          assignment ? (
            <MatchFoundScreen assignment={assignment} />
          ) : (
            <WaitingForMatchScreen fullName={profile.full_name} />
          )
        ) : (
          <DefaultDashboard profile={profile} />
        )}
      </main>
    </div>
  );
}
