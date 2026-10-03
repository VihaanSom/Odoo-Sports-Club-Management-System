import React from 'react';
import { FaUser, FaPhone } from 'react-icons/fa6';

interface GuestInfoFormProps {
  guestName: string;
  guestPhone: string;
  onChangeName: (name: string) => void;
  onChangePhone: (phone: string) => void;
  errors?: { guestName?: string; guestPhone?: string };
}

export const GuestInfoForm: React.FC<GuestInfoFormProps> = ({
  guestName,
  guestPhone,
  onChangeName,
  onChangePhone,
  errors,
}) => {
  return (
    <div className="space-y-4">
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs font-semibold uppercase tracking-wide">
            Guest Name <span className="text-error">*</span>
          </span>
        </label>
        <div className="relative">
          <FaUser className="size-3.5 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className={`input input-bordered w-full pl-9 text-sm ${
              errors?.guestName ? 'input-error' : ''
            }`}
            placeholder="e.g. John"
            value={guestName}
            onChange={(e) => onChangeName(e.target.value)}
            maxLength={150}
          />
        </div>
        {errors?.guestName && (
          <span className="text-error text-xs mt-1">{errors.guestName}</span>
        )}
      </div>

      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs font-semibold uppercase tracking-wide">
            Guest Phone
          </span>
        </label>
        <div className="relative">
          <FaPhone className="size-3.5 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="tel"
            className={`input input-bordered w-full pl-9 text-sm ${
              errors?.guestPhone ? 'input-error' : ''
            }`}
            placeholder="9876543210"
            value={guestPhone}
            onChange={(e) => onChangePhone(e.target.value)}
            maxLength={20}
          />
        </div>
        {errors?.guestPhone && (
          <span className="text-error text-xs mt-1">{errors.guestPhone}</span>
        )}
      </div>
    </div>
  );
};
