'use client';

import { useState } from 'react';
import { X, Loader2, UserPlus, AlertCircle } from 'lucide-react';
import { assignClientToRealtor } from '../_actions';
import { Realtor } from '@/lib/db/admin';
import { Button } from '@/app/_components/Button';
import { cn } from '@/lib/utils';

interface AssignClientDialogProps {
  clientId: string;
  clientName: string;
  realtors: Realtor[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function AssignClientDialog({
  clientId,
  clientName,
  realtors,
  onClose,
  onSuccess,
}: AssignClientDialogProps) {
  const [selectedRealtorId, setSelectedRealtorId] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const activeRealtors = realtors.filter((r) => r.active);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRealtorId) {
      setError('Please select a realtor');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await assignClientToRealtor(clientId, selectedRealtorId, reason || undefined);

    if (result.success) {
      onSuccess?.();
      onClose();
    } else {
      setError(result.error || 'Failed to assign client');
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div 
        className="bg-card rounded-2xl shadow-soft-lg border border-border/50 max-w-md w-full mx-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Assign Client</h2>
              <p className="text-sm text-muted-foreground">Select a realtor for this client</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Client info */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Client
            </label>
            <div className="px-4 py-3 bg-accent/50 rounded-lg text-sm text-foreground font-medium">
              {clientName}
            </div>
          </div>

          {/* Realtor selection */}
          <div>
            <label htmlFor="realtor" className="block text-sm font-medium text-foreground mb-2">
              Assign to Realtor <span className="text-destructive">*</span>
            </label>
            <select
              id="realtor"
              value={selectedRealtorId}
              onChange={(e) => setSelectedRealtorId(e.target.value)}
              className={cn(
                'w-full px-4 py-3 rounded-lg border bg-background text-sm transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                selectedRealtorId ? 'border-input' : 'border-input text-muted-foreground'
              )}
              required
            >
              <option value="">Select a realtor...</option>
              {activeRealtors.map((realtor) => (
                <option key={realtor.id} value={realtor.id}>
                  {realtor.full_name} - {realtor.email}
                </option>
              ))}
            </select>
            {activeRealtors.length === 0 && (
              <p className="text-sm text-destructive mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                No active realtors available
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-foreground mb-2">
              Reason <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 resize-none"
              placeholder="Initial assignment, reassignment, etc."
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              fullWidth
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="brand"
              disabled={isLoading || activeRealtors.length === 0} 
              fullWidth
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Client'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
