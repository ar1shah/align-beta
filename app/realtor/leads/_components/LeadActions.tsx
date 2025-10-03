'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lead } from '@/lib/db/leads';
import { XIcon } from 'lucide-react';

interface LeadActionsProps {
  lead: Lead;
  onClose: () => void;
}

export function LeadActions({ lead, onClose }: LeadActionsProps) {
  const router = useRouter();
  const [nextTouchDate, setNextTouchDate] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSetNextTouch() {
    if (!nextTouchDate) return;

    setLoading(true);
    try {
      await fetch('/api/realtor/leads/set-next-touch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, nextTouchAt: nextTouchDate }),
      });
      router.refresh();
      onClose();
    } catch (error) {
      alert('Failed to set next touch');
    } finally {
      setLoading(false);
    }
  }

  async function handleDecline() {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }

    setLoading(true);
    try {
      await fetch('/api/realtor/leads/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, reason: declineReason }),
      });
      router.refresh();
      onClose();
    } catch (error) {
      alert('Failed to decline lead');
    } finally {
      setLoading(false);
    }
  }

  async function handleConvertToClient() {
    if (!confirm(`Convert ${lead.full_name} to a client?`)) return;

    setLoading(true);
    try {
      await fetch('/api/realtor/leads/convert-to-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      });
      router.refresh();
      onClose();
    } catch (error) {
      alert('Failed to convert to client');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Lead Actions</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Lead Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-semibold text-gray-900">{lead.full_name}</p>
            <p className="text-sm text-gray-600 mt-1">{lead.email}</p>
            <p className="text-sm text-gray-600">{lead.phone}</p>
          </div>

          {/* Set Next Touch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set Next Follow-Up
            </label>
            <input
              type="datetime-local"
              value={nextTouchDate}
              onChange={(e) => setNextTouchDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSetNextTouch}
              disabled={!nextTouchDate || loading}
              className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Set Reminder
            </button>
          </div>

          {/* Convert to Client */}
          <div>
            <button
              onClick={handleConvertToClient}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Convert to Client
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Creates a client record and updates lead status
            </p>
          </div>

          {/* Decline */}
          {!lead.declined_by_realtor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decline Lead
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Why are you declining this lead?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                onClick={handleDecline}
                disabled={!declineReason.trim() || loading}
                className="w-full mt-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Decline Lead
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

