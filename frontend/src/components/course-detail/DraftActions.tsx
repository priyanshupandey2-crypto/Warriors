'use client';

import { useState } from 'react';
import { Button, Card, ConfirmationDialog } from '@/components/ui';

interface DraftActionsProps {
  courseId: string;
  onSave?: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
}

export function DraftActions({ courseId, onSave, onSubmit, isLoading = false }: DraftActionsProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit();
      setShowConfirmation(false);
    }
  };

  return (
    <>
      {/* Actions Card */}
      <Card variant="elevated" className="space-y-md bg-primary-container/10 border-2 border-primary">
        <h3 className="text-headline-md text-on-background font-bold">
          Draft Course Actions
        </h3>

        <p className="text-body-md text-on-surface">
          This course is still in draft. You can save changes or submit it for global approval.
        </p>

        <div className="flex flex-col sm:flex-row gap-md">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onSave}
            disabled={isLoading}
            loading={isLoading}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setShowConfirmation(true)}
            disabled={isLoading || showConfirmation}
            loading={isLoading}
          >
            Submit for Approval
          </Button>
        </div>

        <p className="text-label-sm text-on-surface-variant">
          Once submitted, you'll no longer be able to edit the course until it's reviewed.
        </p>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        title="Submit Course for Approval?"
        message="Once you submit this course, you won't be able to make changes until it's reviewed by our team."
        confirmLabel="Yes, Submit"
        cancelLabel="Cancel"
        isLoading={isLoading}
        onConfirm={handleSubmit}
        onCancel={() => setShowConfirmation(false)}
      >
        <div className="bg-surface-container p-md rounded-lg space-y-md">
          <div>
            <p className="text-label-sm text-on-surface-variant">Course ID</p>
            <p className="text-label-md font-mono text-on-surface mt-xs">{courseId}</p>
          </div>
          <div className="bg-error-container/20 p-md rounded-lg border border-error">
            <p className="text-label-md text-error font-medium">
              This action cannot be undone until reviewed
            </p>
          </div>
        </div>
      </ConfirmationDialog>
    </>
  );
}
