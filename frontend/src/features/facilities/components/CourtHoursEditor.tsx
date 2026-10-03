import React, { useState } from 'react';
import { FaClock, FaCheck } from 'react-icons/fa6';

interface CourtHoursEditorProps {
  initialOpen: string;
  initialClose: string;
  onSave: (openTime: string, closeTime: string) => Promise<void>;
  onCancel: () => void;
}

export const CourtHoursEditor: React.FC<CourtHoursEditorProps> = ({
  initialOpen,
  initialClose,
  onSave,
  onCancel,
}) => {
  const [openTime, setOpenTime] = useState(initialOpen);
  const [closeTime, setCloseTime] = useState(initialClose);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(openTime, closeTime);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-base-300/40 p-2 rounded-xl border border-base-300">
      <FaClock className="size-4 text-primary shrink-0" />
      <input
        type="text"
        value={openTime}
        onChange={(e) => setOpenTime(e.target.value)}
        className="input input-xs input-bordered w-20 font-mono text-center"
        placeholder="06:00"
      />
      <span className="text-xs text-base-content/50">to</span>
      <input
        type="text"
        value={closeTime}
        onChange={(e) => setCloseTime(e.target.value)}
        className="input input-xs input-bordered w-20 font-mono text-center"
        placeholder="22:00"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary btn-xs"
      >
        {saving ? <span className="loading loading-spinner loading-xs" /> : <FaCheck className="size-3" />}
        Save
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="btn btn-ghost btn-xs"
      >
        Back
      </button>
    </div>
  );
};
