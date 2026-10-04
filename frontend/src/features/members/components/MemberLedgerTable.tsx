import { FaBookBookmark } from 'react-icons/fa6';
import { formatPaise, formatDate } from '@/lib/utils';
import { usePagination } from '@/hooks';
import type { MemberLedgerEntry } from '@/types/members';

interface MemberLedgerTableProps {
  ledger: MemberLedgerEntry[];
}

export const MemberLedgerTable = ({ ledger }: MemberLedgerTableProps) => {
  const {
    page,
    totalPages,
    startIndex,
    endIndex,
    paginateItems,
    setPage,
  } = usePagination({ totalItems: ledger.length, pageSize: 10 });
  const paginatedLedger = paginateItems(ledger);

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
            {paginatedLedger.map((entry) => (
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
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-base-300 text-xs">
          <span className="text-base-content/60">
            Showing {startIndex + 1} to {endIndex} of {ledger.length} entries
          </span>
          <div className="join">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="join-item btn btn-xs btn-outline"
            >
              «
            </button>
            <button
              type="button"
              className="join-item btn btn-xs btn-outline no-animation pointer-events-none font-mono"
            >
              {page} / {totalPages}
            </button>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="join-item btn btn-xs btn-outline"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
