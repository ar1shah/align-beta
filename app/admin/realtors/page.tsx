import Link from 'next/link';
import { UserPlus, AlertCircle } from 'lucide-react';
import { getAllRealtors, Realtor } from '@/lib/db/admin';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { ExportButton } from '../_components/ExportButton';
import { RealtorsTableClient } from './_components/RealtorsTableClient';

export const dynamic = 'force-dynamic';

export default async function RealtorsPage() {
  let realtors: Realtor[] = [];
  let error: string | null = null;
  const assignmentCounts = new Map<string, number>();

  try {
    realtors = await getAllRealtors();
    const supabase = await createServerSupabaseClient();

    // Get assignment counts for each realtor
    const { data: assignments, error: assignmentError } = await supabase
      .from('client_realtor_assignments')
      .select('realtor_id')
      .is('unassigned_at', null);

    if (assignmentError) {
      console.error('Error loading assignments:', assignmentError);
    }

    assignments?.forEach((a) => {
      if (a.realtor_id) {
        const count = assignmentCounts.get(a.realtor_id) || 0;
        assignmentCounts.set(a.realtor_id, count + 1);
      }
    });
  } catch (err) {
    console.error('Error loading realtors page:', err);
    error = 'Failed to load realtors data. Please try refreshing the page.';
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Realtors</h1>
          <p className="text-gray-500 mt-1">Manage realtor capacity and assignments</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800">Error Loading Data</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const realtorsWithCounts = realtors.map((r) => ({
    ...r,
    assigned_count: assignmentCounts.get(r.id) || 0,
    utilization: r.capacity > 0 ? Math.round(((assignmentCounts.get(r.id) || 0) / r.capacity) * 100) : 0,
  }));

  const activeRealtors = realtorsWithCounts.filter((r) => r.active);
  const totalCapacity = activeRealtors.reduce((sum, r) => sum + r.capacity, 0);
  const totalAssigned = activeRealtors.reduce((sum, r) => sum + r.assigned_count, 0);
  const avgUtilization = totalCapacity > 0 ? Math.round((totalAssigned / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Realtors</h1>
          <p className="text-gray-500 mt-1">Manage realtor capacity and assignments</p>
        </div>
        <div className="flex gap-3">
          <ExportButton 
            data={realtorsWithCounts.map(({ assigned_count, utilization, ...r }) => ({
              ...r,
              assigned_clients: assigned_count,
              utilization_pct: utilization,
            }))} 
            filename="realtors" 
          />
          <Link
            href="/admin/realtors/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Add Realtor
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Total Realtors</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{realtors.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Active Realtors</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {activeRealtors.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Total Capacity</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalCapacity}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Avg. Utilization</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{avgUtilization}%</p>
        </div>
      </div>

      {/* Table */}
      <RealtorsTableClient realtors={realtorsWithCounts} />
    </div>
  );
}

