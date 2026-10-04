import React, { useMemo } from 'react';
import { FaFilePdf, FaEye, FaXmark } from 'react-icons/fa6';
import { generateExecutiveReportPdf } from '../utils/generateExecutiveReportPdf';
import type {
  ClubSummaryKPIs,
  RevenueSummary,
  OverallEarningsResponse,
  BarAnalyticsSummary,
} from '@/types/reports';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  downloading: boolean;
  kpis: ClubSummaryKPIs | null;
  revenue: RevenueSummary | null;
  earnings: OverallEarningsResponse | null;
  barAnalytics: BarAnalyticsSummary | null;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  onDownload,
  downloading,
  kpis,
  revenue,
  earnings,
  barAnalytics,
}) => {
  // Generate real vector PDF Blob for native high-res iframe preview
  const pdfBlobUrl = useMemo(() => {
    if (!isOpen) return null;
    try {
      const doc = generateExecutiveReportPdf({
        kpis,
        revenue,
        earnings,
        barAnalytics,
      });
      const blob = doc.output('blob');
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('Failed to generate PDF preview blob:', err);
      return null;
    }
  }, [isOpen, kpis, revenue, earnings, barAnalytics]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-base-100 border border-base-300 rounded-2xl shadow-2xl max-w-5xl w-full h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-base-300 bg-base-200/60">
          <div className="flex items-center gap-2.5">
            <FaEye className="size-4 text-primary" />
            <h3 className="font-extrabold text-base tracking-tight">Executive 1-Page PDF Report</h3>
            <span className="badge badge-sm badge-success font-semibold">Real Vector PDF (A4)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onDownload}
              disabled={downloading}
              className="btn btn-primary btn-sm gap-2 font-semibold shadow-xs"
            >
              <FaFilePdf className="size-3.5 text-primary-content" />
              <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost"
              aria-label="Close preview"
            >
              <FaXmark className="size-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Embedded native PDF Viewer */}
        <div className="flex-1 bg-slate-900/10 p-2 sm:p-4 flex items-center justify-center overflow-hidden">
          {pdfBlobUrl ? (
            <iframe
              src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              title="Executive Report PDF Preview"
              className="w-full h-full rounded-xl border border-base-300 shadow-md bg-white"
            />
          ) : (
            <div className="text-center text-sm text-base-content/60">
              Generating PDF vector preview...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;
