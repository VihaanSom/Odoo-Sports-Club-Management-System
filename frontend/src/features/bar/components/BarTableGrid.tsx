import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaReceipt,
  FaPlus,
  FaCheck,
  FaBan,
  FaFolderOpen,
} from 'react-icons/fa6';
import { formatPaise } from '@/lib/utils';
import type { BarTable, BarTab } from '@/types/bar';

interface BarTableGridProps {
  tables: BarTable[];
  onOpenTab: (table: BarTable) => void;
  onAddItem: (tabId: number) => void;
  onSettle: (tab: BarTab) => void;
}

export const BarTableGrid: React.FC<BarTableGridProps> = ({
  tables,
  onOpenTab,
  onAddItem,
  onSettle,
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tables.map((table) => {
        const isOccupied = Boolean(table.activeTab);
        const tab = table.activeTab;

        return (
          <div
            key={table.id}
            className={`card bg-base-100 border transition-all duration-200 shadow-sm ${
              !table.isActive
                ? 'border-base-300 opacity-60 bg-base-200/50'
                : isOccupied
                ? 'border-warning/60 hover:shadow-md'
                : 'border-base-300 hover:border-primary/50 hover:shadow-md'
            }`}
          >
            <div className="card-body p-4 flex flex-col justify-between h-full">
              {/* Table Header */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg text-base-content tracking-tight">
                      {table.tableNo}
                    </span>
                    <span className="badge badge-sm badge-ghost text-xs gap-1">
                      <FaUsers className="size-2.5 text-base-content/60" /> {table.capacity}
                    </span>
                  </div>

                  {!table.isActive ? (
                    <span className="badge badge-sm badge-ghost gap-1">
                      <FaBan className="size-2.5 text-base-content/50" /> Out of Order
                    </span>
                  ) : isOccupied ? (
                    <span className="badge badge-sm badge-warning font-semibold gap-1">
                      Occupied
                    </span>
                  ) : (
                    <span className="badge badge-sm badge-success font-medium gap-1">
                      <FaCheck className="size-2.5" /> Available
                    </span>
                  )}
                </div>

                {/* Tab Info Section */}
                {isOccupied && tab ? (
                  <div
                    onClick={() => navigate(`/bar/tabs/${tab.id}`)}
                    className="mt-3 p-3 rounded-xl bg-base-200/80 border border-base-300 space-y-1.5 text-xs cursor-pointer hover:bg-base-200 transition-colors"
                    title="Click to view tab details"
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span className="flex items-center gap-1.5 text-base-content/80">
                        <FaReceipt className="size-3 text-warning" /> Tab #{tab.id}
                      </span>
                      <span className="font-extrabold text-primary text-sm">
                        {formatPaise(tab.totalPaise)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-base-content/70">
                      <span className="truncate max-w-[140px] font-semibold">
                        {tab.memberName || 'Walk-in Guest'}
                      </span>
                      <span>{tab.items.length} items</span>
                    </div>

                    {tab.memberTier && (
                      <div className="pt-1">
                        <span className="badge badge-xs badge-primary font-medium">
                          {tab.memberTier} Member
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 py-6 text-center text-xs text-base-content/50 border border-dashed border-base-300 rounded-xl">
                    {table.isActive ? 'Ready for seating' : 'Unavailable for service'}
                  </div>
                )}
              </div>

              {/* Table Card Actions */}
              <div className="mt-4 pt-3 border-t border-base-300 flex items-center gap-2">
                {isOccupied && tab ? (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate(`/bar/tabs/${tab.id}`)}
                      className="btn btn-outline btn-xs flex-1 gap-1"
                    >
                      <FaFolderOpen className="size-3" /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddItem(tab.id)}
                      className="btn btn-secondary btn-xs gap-1"
                      title="Add drink or food item"
                    >
                      <FaPlus className="size-2.5" /> Add
                    </button>
                    <button
                      type="button"
                      onClick={() => onSettle(tab)}
                      className="btn btn-warning btn-xs"
                    >
                      Settle
                    </button>
                  </>

                ) : table.isActive ? (
                  <button
                    type="button"
                    onClick={() => onOpenTab(table)}
                    className="btn btn-primary btn-xs w-full gap-1.5"
                  >
                    <FaPlus className="size-3" /> Open Tab
                  </button>
                ) : (
                  <button type="button" disabled className="btn btn-disabled btn-xs w-full">
                    Maintenance
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
