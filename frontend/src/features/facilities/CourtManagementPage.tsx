import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  FaTrophy,
  FaPlus,
  FaPenToSquare,
  FaClock,
  FaCheck,
  FaBan,
  FaArrowLeft,
} from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { courtService } from '@/services/courtService';
import type { Court, CreateCourtPayload, UpdateCourtPayload } from '@/types/courts';
import { CourtFormModal, CourtHoursEditor } from './components';

export const CourtManagementPage: React.FC = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [editingHoursCourtId, setEditingHoursCourtId] = useState<number | null>(null);

  const fetchCourts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courtService.getCourts();
      setCourts(data);
    } catch {
      toast.error('Failed to load courts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourts();
  }, [fetchCourts]);

  const handleCreateOrUpdate = async (payload: CreateCourtPayload | UpdateCourtPayload) => {
    try {
      if (editingCourt) {
        await courtService.updateCourt(editingCourt.id, payload as UpdateCourtPayload);
        toast.success('Court updated');
      } else {
        await courtService.createCourt(payload as CreateCourtPayload);
        toast.success('Court created');
      }
      await fetchCourts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleToggleActive = async (court: Court) => {
    try {
      await courtService.updateCourt(court.id, { isActive: !court.isActive });
      toast.success(court.isActive ? 'Court deactivated' : 'Court activated');
      await fetchCourts();
    } catch {
      toast.error('Failed to update court status');
    }
  };

  const handleSaveHours = async (courtId: number, openTime: string, closeTime: string) => {
    try {
      await courtService.updateCourt(courtId, { openTime, closeTime });
      toast.success('Hours updated');
      setEditingHoursCourtId(null);
      await fetchCourts();
    } catch {
      toast.error('Failed to update operating hours');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/facilities"
              className="btn btn-ghost btn-xs gap-1 text-base-content/60 hover:text-base-content"
            >
              <FaArrowLeft className="size-3" /> Back to Facilities
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FaTrophy className="size-7 text-amber-500" /> Court & Facility Operations
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Admin configuration for courts, operating schedules, and sport surfaces.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCourt(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary btn-sm gap-2"
        >
          <FaPlus className="size-3.5" /> New Court
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <div className="card bg-base-200/50 border border-base-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-sm">
              <thead>
                <tr className="bg-base-300/40 text-xs font-bold uppercase tracking-wider text-base-content/70">
                  <th>ID</th>
                  <th>Court Name</th>
                  <th>Sport</th>
                  <th>Operating Hours</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courts.map((court) => (
                  <tr key={court.id} className="hover:bg-base-300/30">
                    <td className="font-mono text-xs font-bold text-base-content/60">
                      #{court.id}
                    </td>
                    <td className="font-semibold text-base-content">{court.name}</td>
                    <td>
                      <span className="badge badge-sm badge-outline uppercase text-[11px] font-bold">
                        {court.sport}
                      </span>
                    </td>
                    <td>
                      {editingHoursCourtId === court.id ? (
                        <CourtHoursEditor
                          initialOpen={court.openTime || '06:00'}
                          initialClose={court.closeTime || '22:00'}
                          onSave={(open, close) => handleSaveHours(court.id, open, close)}
                          onCancel={() => setEditingHoursCourtId(null)}
                        />
                      ) : (
                        <div className="tooltip tooltip-top" data-tip="Click to edit operating hours">
                          <button
                            type="button"
                            onClick={() => setEditingHoursCourtId(court.id)}
                            className="flex items-center gap-1.5 text-xs text-base-content/80 hover:text-primary transition-colors font-mono cursor-pointer"
                          >
                            <FaClock className="size-3 text-base-content/40" />
                            {court.openTime || '06:00'} - {court.closeTime || '22:00'}
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      {court.isActive ? (
                        <span className="badge badge-sm badge-success gap-1 font-semibold text-xs">
                          <FaCheck className="size-2.5" /> Active
                        </span>
                      ) : (
                        <span className="badge badge-sm badge-error gap-1 font-semibold text-xs">
                          <FaBan className="size-2.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="tooltip tooltip-left" data-tip="Edit Court">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCourt(court);
                              setIsModalOpen(true);
                            }}
                            className="btn btn-ghost btn-xs btn-square"
                          >
                            <FaPenToSquare className="size-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(court)}
                          className={`btn btn-xs ${
                            court.isActive ? 'btn-error btn-outline' : 'btn-success btn-outline'
                          }`}
                        >
                          {court.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CourtFormModal
        isOpen={isModalOpen}
        court={editingCourt}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCourt(null);
        }}
        onSubmit={handleCreateOrUpdate}
      />
    </motion.div>
  );
};
