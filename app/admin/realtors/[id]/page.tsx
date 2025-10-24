import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Calendar, CheckCircle } from 'lucide-react';
import { getRealtorWithClients } from '@/lib/db/admin';
import { StatusBadge } from '../../_components/StatusBadge';
import { RealtorDetailClient } from './_components/RealtorDetailClient';

export const dynamic = 'force-dynamic';

interface RealtorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RealtorDetailPage({ params }: RealtorDetailPageProps) {
  const { id } = await params;
  const { realtor, assignments } = await getRealtorWithClients(id);

  const utilization = realtor.capacity > 0 
    ? Math.round((assignments.length / realtor.capacity) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/realtors"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{realtor.full_name}</h1>
          <p className="text-gray-500 mt-1">Realtor Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{realtor.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{realtor.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(realtor.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">MSA Status</p>
                  <p className="text-sm font-medium text-gray-900">
                    {realtor.msa_signed_at ? (
                      <span className="text-green-600">
                        Signed on {new Date(realtor.msa_signed_at).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Clients */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Assigned Clients</h2>
              <span className="text-sm text-gray-500">
                {assignments.length} / {realtor.capacity} ({utilization}%)
              </span>
            </div>
            
            {assignments.length === 0 ? (
              <p className="text-sm text-gray-500">No clients assigned yet</p>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/admin/clients/${assignment.client.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {assignment.client.full_name}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {assignment.client.email}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={assignment.client.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {realtor.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{realtor.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-lg font-semibold mt-1">
                  {realtor.active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-600">Inactive</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Capacity</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{realtor.capacity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Assigned Clients</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{assignments.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Utilization</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl font-bold text-purple-600">{utilization}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        utilization >= 90
                          ? 'bg-red-500'
                          : utilization >= 75
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <RealtorDetailClient realtor={realtor} />
        </div>
      </div>
    </div>
  );
}

