'use client';

import { useState } from 'react';
import { Appointment } from '@/lib/db/appointments';
import { PlusIcon, CalendarIcon, ClockIcon } from 'lucide-react';
import { format } from 'date-fns';
import { CreateAppointmentModal } from './CreateAppointmentModal';

interface AppointmentsListProps {
  initialAppointments: Appointment[];
  realtorId: string;
}

export function AppointmentsList({
  initialAppointments,
  realtorId,
}: AppointmentsListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [appointments] = useState<Appointment[]>(initialAppointments);

  const upcoming = appointments.filter(
    (a) => new Date(a.start_at) > new Date() && a.status === 'scheduled'
  );
  const past = appointments.filter(
    (a) => new Date(a.start_at) <= new Date() || a.status === 'completed'
  );

  return (
    <>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          New Appointment
        </button>
      </div>

      <div className="space-y-8">
        {/* Upcoming */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upcoming Appointments
          </h2>
          {upcoming.length > 0 ? (
            <div className="grid gap-4">
              {upcoming.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No upcoming appointments</p>
            </div>
          )}
        </div>

        {/* Past */}
        {past.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Past Appointments
            </h2>
            <div className="grid gap-4">
              {past.slice(0, 5).map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} isPast />
              ))}
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateAppointmentModal
          realtorId={realtorId}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}

function AppointmentCard({
  appointment,
  isPast = false,
}: {
  appointment: Appointment;
  isPast?: boolean;
}) {
  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    no_show: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-700',
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${
        isPast ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{appointment.title}</h3>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {format(new Date(appointment.start_at), 'MMMM d, yyyy')}
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              {format(new Date(appointment.start_at), 'h:mm a')} -{' '}
              {format(new Date(appointment.end_at), 'h:mm a')}
            </div>
          </div>
          {appointment.notes && (
            <p className="mt-2 text-sm text-gray-600">{appointment.notes}</p>
          )}
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            statusColors[appointment.status]
          }`}
        >
          {appointment.status.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
}

