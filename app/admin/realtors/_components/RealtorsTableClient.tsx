'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { Realtor } from '@/lib/db/admin';

interface RealtorWithCounts extends Realtor {
  assigned_count: number;
  utilization: number;
}

interface RealtorsTableClientProps {
  realtors: RealtorWithCounts[];
}

export function RealtorsTableClient({ realtors }: RealtorsTableClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredRealtors = useMemo(() => {
    return realtors.filter((realtor) => {
      const matchesSearch =
        !searchTerm ||
        realtor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        realtor.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesActive =
        activeFilter === 'all' ||
        (activeFilter === 'active' && realtor.active) ||
        (activeFilter === 'inactive' && !realtor.active);

      return matchesSearch && matchesActive;
    });
  }, [realtors, searchTerm, activeFilter]);

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600 bg-red-50';
    if (utilization >= 75) return 'text-yellow-600 bg-yellow-50';
    if (utilization >= 50) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Filters */}
      <div className="p-4 border-b border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Active Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeFilter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeFilter === 'inactive'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Showing {filteredRealtors.length} of {realtors.length} realtors
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Realtor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MSA
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRealtors.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                  No realtors found
                </td>
              </tr>
            ) : (
              filteredRealtors.map((realtor) => (
                <tr key={realtor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/realtors/${realtor.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {realtor.full_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{realtor.email}</div>
                    <div className="text-sm text-gray-500">{realtor.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {realtor.active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircle className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {realtor.capacity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {realtor.assigned_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getUtilizationColor(
                        realtor.utilization
                      )}`}
                    >
                      {realtor.utilization}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {realtor.msa_signed_at ? (
                      <span className="text-green-600">✓ Signed</span>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/realtors/${realtor.id}`}
                      className="text-gray-600 hover:text-gray-900 p-1"
                      title="View details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

