import React from 'react';
import { FaFolderOpen } from 'react-icons/fa6';
import { Button } from '@/components/ui';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  title = 'No records found',
  description = 'There are currently no items matching your criteria.',
  icon,
  actionText,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-base-200/30 border border-dashed border-base-300 rounded-2xl min-h-[220px]">
      <div className="size-12 rounded-full bg-base-300/60 flex items-center justify-center text-base-content/50 mb-3">
        {icon || <FaFolderOpen className="size-6 text-base-content/40" />}
      </div>
      <h4 className="font-bold text-base text-base-content mb-1">{title}</h4>
      <p className="text-xs text-base-content/60 max-w-sm mb-4">{description}</p>
      {actionText && onAction && (
        <Button size="sm" variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
