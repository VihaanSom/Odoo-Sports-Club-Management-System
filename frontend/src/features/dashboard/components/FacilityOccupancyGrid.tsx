import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaCheck } from 'react-icons/fa6';

export const FacilityOccupancyGrid: React.FC = () => {
  const [selectedCourtTab, setSelectedCourtTab] = useState<'All' | 'Tennis' | 'Badminton' | 'Squash'>('All');

  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs">
      <div className="card-body p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-base-300">
          <div>
            <h2 className="card-title text-lg font-bold">Facility Live Occupancy</h2>
            <p className="text-xs text-base-content/60">Active courts and available time slots</p>
          </div>

          <div className="tabs tabs-box bg-base-300/60 p-1 rounded-xl">
            {(['All', 'Tennis', 'Badminton', 'Squash'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedCourtTab(tab)}
                className={`tab tab-sm font-medium transition-all ${
                  selectedCourtTab === tab ? 'tab-active bg-primary text-primary-content shadow-xs' : ''
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-warning/15 flex items-center justify-center text-warning font-bold">
                T1
              </div>
              <div>
                <h4 className="font-semibold text-sm">Tennis Court 1 (Clay)</h4>
                <span className="text-xs text-base-content/60 flex items-center gap-1">
                  <FaClock className="size-3" /> Booked till 11:30 AM
                </span>
              </div>
            </div>
            <span className="badge badge-warning badge-sm font-medium">Occupied</span>
          </div>

          <div className="p-4 rounded-xl border border-success/30 bg-success/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-success/15 flex items-center justify-center text-success font-bold">
                T2
              </div>
              <div>
                <h4 className="font-semibold text-sm">Tennis Court 2 (Hard)</h4>
                <span className="text-xs text-base-content/60 flex items-center gap-1">
                  <FaCheck className="size-3 text-success" /> Available immediately
                </span>
              </div>
            </div>
            <span className="badge badge-success badge-sm font-medium">Available</span>
          </div>

          <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-warning/15 flex items-center justify-center text-warning font-bold">
                B1
              </div>
              <div>
                <h4 className="font-semibold text-sm">Badminton Court A</h4>
                <span className="text-xs text-base-content/60 flex items-center gap-1">
                  <FaClock className="size-3" /> Booked till 12:00 PM
                </span>
              </div>
            </div>
            <span className="badge badge-warning badge-sm font-medium">Occupied</span>
          </div>

          <div className="p-4 rounded-xl border border-success/30 bg-success/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-success/15 flex items-center justify-center text-success font-bold">
                SQ
              </div>
              <div>
                <h4 className="font-semibold text-sm">Squash Court Glass #1</h4>
                <span className="text-xs text-base-content/60 flex items-center gap-1">
                  <FaCheck className="size-3 text-success" /> Available immediately
                </span>
              </div>
            </div>
            <span className="badge badge-success badge-sm font-medium">Available</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-base-300 flex items-center justify-between text-xs text-base-content/70">
          <span>Overall daily facility booking rate: <strong>84%</strong></span>
          <Link to="/facilities" className="link link-primary font-medium">
            View all 12 facilities &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
