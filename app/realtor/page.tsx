import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { getRealtorLeads } from '@/lib/db/leads';
import { getRealtorAppointments } from '@/lib/db/appointments';
import { getRealtorDeals } from '@/lib/db/deals';
import { getRealtorPayouts } from '@/lib/db/payouts';
import Link from 'next/link';
import {
  ClipboardListIcon,
  CalendarIcon,
  BriefcaseIcon,
  DollarSignIcon,
  TrendingUpIcon,
  AlertCircleIcon,
} from 'lucide-react';

export default async function RealtorDashboard() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const [leads, appointments, deals, payouts] = await Promise.all([
    getRealtorLeads(session.user.id),
    getRealtorAppointments(session.user.id),
    getRealtorDeals(session.user.id),
    getRealtorPayouts(session.user.id),
  ]);

  const newLeads = leads.filter((l) => l.stage === 'new').length;
  const workingLeads = leads.filter((l) => l.stage === 'working').length;
  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.start_at) > new Date() && a.status === 'scheduled'
  ).length;
  const activeDeals = deals.filter((d) => d.stage !== 'closed').length;
  const pendingPayouts = payouts.filter((p) => p.status === 'pending').length;

  const stats = [
    {
      label: 'New Leads',
      value: newLeads,
      icon: ClipboardListIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/realtor/leads',
    },
    {
      label: 'Working Leads',
      value: workingLeads,
      icon: TrendingUpIcon,
      color: 'text-green-600',
      bg: 'bg-green-50',
      href: '/realtor/leads',
    },
    {
      label: 'Upcoming Appointments',
      value: upcomingAppointments,
      icon: CalendarIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      href: '/realtor/appointments',
    },
    {
      label: 'Active Deals',
      value: activeDeals,
      icon: BriefcaseIcon,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      href: '/realtor/deals',
    },
    {
      label: 'Pending Payouts',
      value: pendingPayouts,
      icon: DollarSignIcon,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/realtor/payouts',
    },
  ];

  const todayAppointments = appointments.filter((a) => {
    const start = new Date(a.start_at);
    const today = new Date();
    return (
      start.toDateString() === today.toDateString() &&
      a.status === 'scheduled'
    );
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here&apos;s what&apos;s happening with your business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Today's Appointments */}
      {todayAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircleIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Today&apos;s Appointments
            </h2>
          </div>
          <div className="space-y-3">
            {todayAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{apt.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(apt.start_at).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <Link
                  href="/realtor/appointments"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/realtor/leads"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Manage Leads</h3>
          <p className="text-sm text-gray-600">
            View and organize your lead pipeline
          </p>
        </Link>
        <Link
          href="/realtor/appointments"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Schedule Appointment</h3>
          <p className="text-sm text-gray-600">
            Add new appointments to your calendar
          </p>
        </Link>
        <Link
          href="/realtor/clients"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Add Client</h3>
          <p className="text-sm text-gray-600">Create a new client record</p>
        </Link>
      </div>
    </div>
  );
}

