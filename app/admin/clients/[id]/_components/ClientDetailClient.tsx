'use client';

import { useState } from 'react';
import { UserPlus, UserMinus } from 'lucide-react';
import { Client, Realtor } from '@/lib/db/admin';
import { AssignClientDialog } from '../../../_components/AssignClientDialog';
import { UnassignDialog } from '../../../_components/UnassignDialog';
import { Button } from '@/app/_components/Button';

interface ClientDetailClientProps {
  client: Client;
  assignment: {
    realtor?: Realtor;
  } | null;
  realtors: Realtor[];
}

export function ClientDetailClient({ client, assignment, realtors }: ClientDetailClientProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h2>
        
        {assignment?.realtor ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Assigned to</p>
              <p className="font-semibold text-gray-900">{assignment.realtor.full_name}</p>
              <p className="text-sm text-gray-500 mt-1">{assignment.realtor.email}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAssignDialog(true)}
                fullWidth
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Reassign
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUnassignDialog(true)}
                fullWidth
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Unassign
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                This client is not currently assigned to any realtor.
              </p>
            </div>
            <Button onClick={() => setShowAssignDialog(true)} fullWidth>
              <UserPlus className="w-4 h-4 mr-2" />
              Assign to Realtor
            </Button>
          </div>
        )}
      </div>

      {showAssignDialog && (
        <AssignClientDialog
          clientId={client.id}
          clientName={client.full_name || 'Unknown'}
          realtors={realtors}
          onClose={() => setShowAssignDialog(false)}
          onSuccess={() => window.location.reload()}
        />
      )}

      {showUnassignDialog && assignment?.realtor && (
        <UnassignDialog
          clientId={client.id}
          clientName={client.full_name || 'Unknown'}
          realtorName={assignment.realtor.full_name || 'Unknown'}
          onClose={() => setShowUnassignDialog(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}

