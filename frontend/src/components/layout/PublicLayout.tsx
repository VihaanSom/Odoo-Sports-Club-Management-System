import React from 'react';
import { Outlet } from 'react-router-dom';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col justify-center items-center p-4">
      <Outlet />
    </div>
  );
};
