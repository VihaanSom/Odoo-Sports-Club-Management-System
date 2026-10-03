import React from 'react';
import { Link } from 'react-router-dom';
import { FaHouse, FaTriangleExclamation } from 'react-icons/fa6';
import { Button } from '@/components/ui';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="size-16 rounded-full bg-error/10 border border-error/20 flex items-center justify-center text-error mb-4">
        <FaTriangleExclamation className="size-8" />
      </div>
      <h1 className="text-4xl font-black mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-base-content/60 max-w-md mb-6">
        The sports club resource, facility, or dashboard route you are looking for does not exist.
      </p>
      <Link to="/">
        <Button variant="primary" leftIcon={<FaHouse className="size-4" />}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
