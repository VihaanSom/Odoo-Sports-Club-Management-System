import React, { useState } from 'react';
import { FaUserPlus, FaTrashCan, FaUsers, FaUserTag } from 'react-icons/fa6';
import type { BookingParticipant } from '@/types/bookings';

interface SocialPlayFormProps {
  participants: BookingParticipant[];
  onAddParticipant: (participant: BookingParticipant) => void;
  onRemoveParticipant: (index: number) => void;
}

export const SocialPlayForm = ({
  participants,
  onAddParticipant,
  onRemoveParticipant,
}: SocialPlayFormProps) => {
  const [type, setType] = useState<'member' | 'guest'>('guest');
  const [name, setName] = useState('');
  const [memberId, setMemberId] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'guest') {
      if (!name.trim()) return;
      onAddParticipant({ guestName: name.trim() });
      setName('');
    } else {
      if (!memberId.trim()) return;
      onAddParticipant({
        memberId: parseInt(memberId, 10),
        memberName: name.trim() || `Member #${memberId}`,
      });
      setMemberId('');
      setName('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
          <FaUsers className="size-3.5 text-primary" />
          Participants ({participants.length}/20, min 2)
        </span>
        <span className="text-[11px] text-base-content/60">
          Split court play among members & guests
        </span>
      </div>

      <div className="p-3 rounded-xl bg-base-200/50 border border-base-300 space-y-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setType('guest')}
            className={`btn btn-xs ${type === 'guest' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Add Guest
          </button>
          <button
            type="button"
            onClick={() => setType('member')}
            className={`btn btn-xs ${type === 'member' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Add Member
          </button>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2">
          {type === 'member' && (
            <input
              type="number"
              placeholder="Member ID"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="input input-sm input-bordered w-28 text-xs font-mono"
            />
          )}
          <input
            type="text"
            placeholder={type === 'guest' ? 'Guest Name (e.g. John)' : 'Member Name (Optional)'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-sm input-bordered flex-1 text-xs"
          />
          <button type="submit" className="btn btn-primary btn-sm gap-1">
            <FaUserPlus className="size-3" /> Add
          </button>
        </form>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {participants.length === 0 ? (
          <div className="p-4 text-center text-xs text-base-content/50 border border-dashed border-base-300 rounded-xl">
            At least 2 participants required for social booking.
          </div>
        ) : (
          participants.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-base-100 border border-base-300 text-xs"
            >
              <div className="flex items-center gap-2">
                <FaUserTag className="size-3 text-base-content/40" />
                <span className="font-semibold text-base-content">
                  {p.guestName ? `${p.guestName} (Guest)` : `${p.memberName || `Member #${p.memberId}`} (Member)`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveParticipant(idx)}
                className="btn btn-ghost btn-xs btn-circle text-error/70 hover:text-error"
              >
                <FaTrashCan className="size-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
