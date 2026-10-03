import React from 'react';
import { FaBookBookmark } from 'react-icons/fa6';
import { formatPaise, formatDate } from '@/lib/utils';
import type { MemberLedgerEntry } from '@/types/members';

interface MemberLedgerTableProps {
  ledger: MemberLedgerEntry[];
}

export const MemberLedgerTable: React.FC<MemberLedgerTableProps> = ({ ledger }) => {
  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-base-300 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-2">
          <FaBookBookmark className="size-4 text-primary" /> Financial Ledger & Receipts ({ledger.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-base-300/40">
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Description</th>
              <th>Type</th>
              <th>Reference</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((entry) => (
              <tr key={entry.id} className="hover:bg-base-300/30">
                <td className="font-mono font-bold text-xs">{entry.id}</td>
                <td className="font-mono text-xs text-base-content/70">{formatDate(entry.date)}</td>
                <td className="font-medium">{entry.description}</td>
                <td>
                  <span
                    className={`badge badge-xs capitalize py-2 ${
                      entry.type === 'renewal'
                        ? 'badge-warning font-semibold'
                        : entry.type === 'booking'
                        ? 'badge-primary'
                        : entry.type === 'order'
                        ? 'badge-secondary'
                        : entry.type === 'bar'
                        ? 'badge-accent'
                        : 'badge-ghost'
                    }`}
                  >
                    {entry.type}
                  </span>
                </td>
                <td className="font-mono text-xs text-base-content/60">
                  {entry.referenceNo || '—'}
                </td>
                <td className="text-right font-mono font-bold text-base-content">
                  {formatPaise(entry.amountPaise)}
                </td>
              </tr>
            ))}

            {ledger.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-base-content/50">
                  No ledger entries recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
