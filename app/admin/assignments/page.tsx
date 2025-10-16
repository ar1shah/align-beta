import Link from 'next/link';
import { Users, TrendingUp } from 'lucide-react';
import { getAllAssignments, getActiveRealtors, getUnassignedClients } from '@/lib/db/admin';
import { StatusBadge } from '../_components/StatusBadge';
import { AssignmentsClient } from './_components/AssignmentsClient';

export const dynamic = 'force-dynamic';

export default async function AssignmentsPage() {
  const assignments = await getAllAssignments();
  const realtors = await getActiveRealtors();
  const unassignedClients = await getUnassignedClients();

  // Calculate realtor load
  const realtorLoad = new Map<string, number>();
  assignments.forEach((a) => {
    if (a.realtor_id) {
      const count = realtorLoad.get(a.realtor_id) || 0;
      realtorLoad.set(a.realtor_id, count + 1);
    }
  });

  const realtorsWithLoad = realtors.map((r) => ({
    ...r,
    assigned: realtorLoad.get(r.id) || 0,
    available: Math.max(0, r.capacity - (realtorLoad.get(r.id) || 0)),
    utilization: r.capacity > 0 ? Math.round(((realtorLoad.get(r.id) || 0) / r.capacity) * 100) : 0,
  }));

  // Sort by available capacity (descending)
  realtorsWithLoad.sort((a, b) => b.available - a.available);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assignment Management</h1>
        <p className="text-gray-500 mt-1">Manage client-realtor assignments and load balancing</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Total Assignments</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{assignments.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Unassigned Clients</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{unassignedClients.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Active Realtors</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{realtors.length}</p>
        </div>
      </div>

      {/* Load Balancing View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Realtor Capacity Overview</h2>
        </div>
        
        <div className="space-y-4">
          {realtorsWithLoad.length === 0 ? (
            <p className="text-sm text-gray-500">No active realtors</p>
          ) : (
            realtorsWithLoad.map((realtor) => (
              <div
                key={realtor.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Link
                      href={`/admin/realtors/${realtor.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {realtor.full_name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">{realtor.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {realtor.assigned} / {realtor.capacity}
                    </p>
                    <p className="text-xs text-gray-500">
                      {realtor.available} available
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          realtor.utilization >= 90
                            ? 'bg-red-500'
                            : realtor.utilization >= 75
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(realtor.utilization, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      realtor.utilization >= 90
                        ? 'text-red-600'
                        : realtor.utilization >= 75
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {realtor.utilization}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Unassigned Clients + Bulk Actions */}
      <AssignmentsClient
        unassignedClients={unassignedClients}
        realtors={realtorsWithLoad}
      />

      {/* Current Assignments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Current Assignments</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Realtor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                    No active assignments
                  </td>
                </tr>
              ) : (
                assignments.map((assignment: any) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/clients/${assignment.client?.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {assignment.client?.full_name || 'Unknown'}
                      </Link>
                      <p className="text-sm text-gray-500">{assignment.client?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/realtors/${assignment.realtor?.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {assignment.realtor?.full_name || 'Unknown'}
                      </Link>
                      <p className="text-sm text-gray-500">{assignment.realtor?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={assignment.client?.status || 'unknown'} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(assignment.assigned_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

