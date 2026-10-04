import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaCheck } from 'react-icons/fa6';
import { bookingService } from '@/services/bookingService';
import { formatDate, formatSlotRange } from '@/lib/utils';
import type {
  BookingType,
  BookingPaymentMethod,
  BookingParticipant,
} from '@/types/bookings';
import { useAuthStore } from '@/stores/authStore';
import { isMemberRole } from '@/lib/permissions';
import { SlotPicker } from './SlotPicker';
import { MemberLookup } from './MemberLookup';
import { GuestInfoForm } from './GuestInfoForm';
import { SocialPlayForm } from './SocialPlayForm';
import { BookingPaymentSection } from './BookingPaymentSection';

interface BookingWizardProps {
  initialCourtId?: number;
  initialSlotStart?: string;
  initialSlotEnd?: string;
}

export const BookingWizard = ({
  initialCourtId,
  initialSlotStart,
  initialSlotEnd,
}: BookingWizardProps) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isMember = isMemberRole(user?.role);
  const currentMemberName =
    user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || '';

  const todayStr = new Date().toISOString().split('T')[0];

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Court & Slot
  const [courtId, setCourtId] = useState<number>(initialCourtId || 1);
  const [date, setDate] = useState<string>(
    initialSlotStart ? initialSlotStart.split('T')[0] : todayStr
  );
  const [slotStart, setSlotStart] = useState<string>(initialSlotStart || '');
  const [slotEnd, setSlotEnd] = useState<string>(initialSlotEnd || '');

  // Step 2: Type & Participants
  const [bookingType, setBookingType] = useState<BookingType>('member');
  const [memberId, setMemberId] = useState<number | null>(isMember ? user?.id || null : null);
  const [memberName, setMemberName] = useState<string>(isMember ? currentMemberName : '');
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [participants, setParticipants] = useState<BookingParticipant[]>([]);
  const [step2Errors, setStep2Errors] = useState<{ guestName?: string; guestPhone?: string }>({});

  // Ensure member is set if user state loads
  useEffect(() => {
    if (isMember && user?.id) {
      setMemberId(user.id);
      setMemberName(currentMemberName);
      setBookingType('member');
    }
  }, [isMember, user?.id, currentMemberName]);

  // Step 3: Payment & Notes
  const [paymentMethod, setPaymentMethod] = useState<BookingPaymentMethod>('plan');
  const [notes, setNotes] = useState<string>('');

  // Check if selected court slot is Friday night (Friday, 18:00 onwards)
  const isFridayDate = (dStr: string) => {
    if (!dStr) return false;
    const [y, m, d] = dStr.split('-').map(Number);
    const dayOfWeek = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return dayOfWeek === 5; // 5 = Friday
  };

  const isNightSlot = (startIso: string) => {
    if (!startIso) return true;
    const startHour = new Date(startIso).getUTCHours();
    return startHour >= 18;
  };

  const isFridayNight = isFridayDate(date) && isNightSlot(slotStart);

  // Auto-switch away from social play if slot/date changes to non-Friday night
  useEffect(() => {
    if (!isFridayNight && bookingType === 'social') {
      setBookingType(isMember ? 'member' : 'walk_in');
    }
  }, [isFridayNight, bookingType, isMember]);

  // Calculate final payment price based on type, tier, and participant count
  const calculateFinalPrice = (): number => {
    if (bookingType === 'walk_in') {
      return 500;
    }
    if (bookingType === 'social') {
      return Math.max(participants.length, 2) * 150;
    }
    // Member booking
    if (paymentMethod === 'plan') {
      return 0;
    }
    const tier = user?.tier || 'Gold';
    if (tier === 'Gold') return 0;
    if (tier === 'Silver') return 200;
    if (tier === 'Junior') return 100;
    return 200;
  };

  const finalPrice = calculateFinalPrice();

  const handleNext = () => {
    if (step === 1) {
      if (!slotStart || !slotEnd) {
        toast.error('Select a time slot first');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (bookingType === 'member') {
        if (!memberId) {
          toast.error('Select a club member');
          return;
        }
      } else if (bookingType === 'walk_in') {
        if (!guestName.trim()) {
          setStep2Errors({ guestName: 'Guest name is required' });
          return;
        }
        setStep2Errors({});
      } else if (bookingType === 'social') {
        if (!isFridayNight) {
          toast.error('Social Play is only available on Friday nights (6:00 PM onwards)');
          return;
        }
        if (participants.length < 2) {
          toast.error('Social bookings require at least 2 participants');
          return;
        }
      }
      // If walk-in or social, paymentMethod cannot be 'plan'
      if (bookingType !== 'member' && paymentMethod === 'plan') {
        setPaymentMethod('upi');
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (bookingType === 'member') {
        const res = await bookingService.createMemberBooking({
          courtId,
          memberId: memberId!,
          slotStart,
          slotEnd,
          bookingType: 'member',
          paymentMethod,
          notes: notes.trim() || undefined,
        });
        toast.success('Court booking confirmed');
        navigate(`/bookings/${res.id}`);
      } else if (bookingType === 'walk_in') {
        const res = await bookingService.createWalkInBooking({
          courtId,
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim() || undefined,
          slotStart,
          slotEnd,
          bookingType: 'walk_in',
          paymentMethod: paymentMethod as 'cash' | 'card' | 'upi',
          notes: notes.trim() || undefined,
        });
        toast.success('Walk-in booking confirmed');
        navigate(`/bookings/${res.id}`);
      } else if (bookingType === 'social') {
        const res = await bookingService.createSocialBooking({
          courtId,
          slotStart,
          slotEnd,
          paymentMethod: paymentMethod as 'cash' | 'card' | 'upi',
          participants: participants.map((p) =>
            p.memberId
              ? { memberId: p.memberId, memberName: p.memberName }
              : { guestName: p.guestName || 'Guest' }
          ),
          notes: notes.trim() || undefined,
        });
        toast.success('Social group booking confirmed');
        navigate(`/bookings/${res.id}`);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Booking failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm rounded-2xl p-6 space-y-6">
      {/* Steps Header */}
      <ul className="steps steps-horizontal w-full text-xs">
        <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Court & Slot</li>
        <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>Type & Player</li>
        <li className={`step ${step >= 3 ? 'step-primary' : ''}`}>Payment</li>
        <li className={`step ${step >= 4 ? 'step-primary' : ''}`}>Confirm</li>
      </ul>

      {/* Step 1: Court & Slot */}
      {step === 1 && (
        <SlotPicker
          selectedCourtId={courtId}
          selectedDate={date}
          selectedSlotStart={slotStart}
          selectedSlotEnd={slotEnd}
          onSelectCourt={(cId) => setCourtId(cId)}
          onSelectDate={(d) => setDate(d)}
          onSelectSlot={(cId, start, end) => {
            setCourtId(cId);
            setSlotStart(start);
            setSlotEnd(end);
          }}
        />
      )}

      {/* Step 2: Booking Type & Party */}
      {step === 2 && (
        <div className="space-y-5">
          {isMember ? (
            <div className="space-y-4">
              {isFridayNight && (
                <div className="flex items-center gap-2 p-2 bg-base-200/60 rounded-xl border border-base-300 text-xs">
                  <span className="font-semibold text-base-content/70">Friday Night Special:</span>
                  <button
                    type="button"
                    onClick={() => setBookingType('member')}
                    className={`btn btn-xs ${bookingType === 'member' ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    Member Booking
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingType('social')}
                    className={`btn btn-xs ${bookingType === 'social' ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    🌟 Social Play Group
                  </button>
                </div>
              )}

              {bookingType === 'social' ? (
                <SocialPlayForm
                  participants={participants}
                  onAddParticipant={(p) => setParticipants([...participants, p])}
                  onRemoveParticipant={(idx) =>
                    setParticipants(participants.filter((_, i) => i !== idx))
                  }
                />
              ) : (
                <div className="card bg-base-200/50 border border-base-300 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Account Details
                    </span>
                    <span className="badge badge-primary font-bold">
                      {user?.tier || 'Member'} Tier
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-base font-bold text-base-content">
                      {memberName}
                    </div>
                    <div className="text-xs text-base-content/60 font-mono">
                      {user?.email} &bull; Member #{memberId}
                    </div>
                  </div>
                  <div className="p-3 bg-base-100 rounded-xl border border-base-300 text-xs text-base-content/70">
                    This court reservation will be registered under your club membership account.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold uppercase tracking-wide">
                    Booking Type <span className="text-error">*</span>
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingType('member')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      bookingType === 'member'
                        ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                        : 'border-base-300 hover:bg-base-200/50'
                    }`}
                  >
                    Club Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingType('walk_in')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      bookingType === 'walk_in'
                        ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                        : 'border-base-300 hover:bg-base-200/50'
                    }`}
                  >
                    WALK IN
                  </button>
                  <button
                    type="button"
                    disabled={!isFridayNight}
                    onClick={() => {
                      if (!isFridayNight) {
                        toast.error('Social Play is only available on Friday nights (6:00 PM onwards).');
                        return;
                      }
                      setBookingType('social');
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                      bookingType === 'social'
                        ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                        : !isFridayNight
                        ? 'border-base-300 opacity-40 cursor-not-allowed bg-base-200/40 text-base-content/60'
                        : 'border-base-300 hover:bg-base-200/50'
                    }`}
                  >
                    <span>Social Play Group</span>
                    <span className="text-[10px] font-normal">
                      {isFridayNight ? '🌟 Open Tonight' : 'Fri Nights Only (6 PM+)'}
                    </span>
                  </button>
                </div>
              </div>

              {bookingType === 'member' && (
                <MemberLookup
                  selectedMemberId={memberId}
                  onSelectMember={(mId, mName) => {
                    setMemberId(mId);
                    setMemberName(mName);
                  }}
                />
              )}

              {bookingType === 'walk_in' && (
                <GuestInfoForm
                  guestName={guestName}
                  guestPhone={guestPhone}
                  onChangeName={setGuestName}
                  onChangePhone={setGuestPhone}
                  errors={step2Errors}
                />
              )}

              {bookingType === 'social' && (
                <SocialPlayForm
                  participants={participants}
                  onAddParticipant={(p) => setParticipants([...participants, p])}
                  onRemoveParticipant={(idx) =>
                    setParticipants(participants.filter((_, i) => i !== idx))
                  }
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Step 3: Payment Method & Notes */}
      {step === 3 && (
        <BookingPaymentSection
          bookingType={bookingType}
          paymentMethod={paymentMethod}
          onChangePaymentMethod={setPaymentMethod}
          notes={notes}
          onChangeNotes={setNotes}
          finalPrice={finalPrice}
        />
      )}

      {/* Step 4: Summary / Confirmation */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-base-200/50 border border-base-300 rounded-xl p-4 space-y-3 text-sm">
            <h3 className="font-bold text-base border-b border-base-300 pb-2">
              Booking Summary
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-base-content/60 block">Court</span>
                <span className="font-semibold text-base-content">Court #{courtId}</span>
              </div>
              <div>
                <span className="text-base-content/60 block">Date</span>
                <span className="font-semibold text-base-content">{formatDate(date)}</span>
              </div>
              <div>
                <span className="text-base-content/60 block">Time Slot</span>
                <span className="font-mono font-bold text-primary">
                  {formatSlotRange(slotStart, slotEnd, true)}
                </span>
              </div>
              <div>
                <span className="text-base-content/60 block">Booking Type</span>
                <span className="badge badge-sm badge-outline uppercase font-semibold">
                  {bookingType === 'walk_in' ? 'WALK IN' : bookingType.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-base-content/60 block">Booked For</span>
                <span className="font-semibold text-base-content">
                  {bookingType === 'member'
                    ? memberName || `Member #${memberId}`
                    : bookingType === 'walk_in'
                    ? `${guestName} (${guestPhone || 'No phone'})`
                    : `${participants.length} Social Players`}
                </span>
              </div>
              <div>
                <span className="text-base-content/60 block">Payment Method</span>
                <span className="badge badge-sm badge-primary uppercase font-semibold">
                  {paymentMethod}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-base-300/60 flex items-center justify-between">
                <span className="text-base-content/70 font-semibold">Final Payment Price</span>
                <span className="text-lg font-extrabold text-primary">
                  {finalPrice === 0 ? '₹0 (Included in Plan)' : `₹${finalPrice.toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>
            {notes && (
              <div className="pt-2 border-t border-base-300 text-xs">
                <span className="text-base-content/60 block">Notes:</span>
                <span className="italic text-base-content/80">{notes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-base-300">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            disabled={submitting}
            className="btn btn-ghost btn-sm"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="btn btn-primary btn-sm px-6"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary btn-sm px-6 gap-2"
          >
            {submitting ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <FaCheck className="size-3.5" />
            )}
            Confirm
          </button>
        )}
      </div>
    </div>
  );
};
