import { FaCheck, FaClock, FaWrench, FaCircleDollarToSlot, FaCalendarCheck } from 'react-icons/fa6';
import { Card, Badge, Button, ImageWithFallback } from '@/components/ui';
import type { Facility } from '@/types';

interface FacilityCardProps {
  facility: Facility;
  onBook: (facility: Facility) => void;
}

export const FacilityCard = ({ facility, onBook }: FacilityCardProps) => {
  return (
    <Card hoverable className="overflow-hidden flex flex-col justify-between">
      <figure className="relative h-44 w-full overflow-hidden bg-base-300">
        <ImageWithFallback
          src={facility.imageUrl}
          alt={facility.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <Badge
            size="sm"
            variant={
              facility.status === 'available'
                ? 'success'
                : facility.status === 'booked'
                ? 'warning'
                : 'neutral'
            }
            className="shadow-sm gap-1 capitalize font-semibold"
          >
            {facility.status === 'available' && <FaCheck className="size-2.5" />}
            {facility.status === 'booked' && <FaClock className="size-2.5" />}
            {facility.status === 'maintenance' && <FaWrench className="size-2.5" />}
            {facility.status}
          </Badge>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="badge badge-sm badge-neutral bg-black/60 backdrop-blur-md text-white border-0 font-mono">
            {facility.courtNumber}
          </span>
        </div>
      </figure>

      <div className="card-body p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-primary">
            {facility.sport}
          </span>
          <h3 className="card-title text-base font-bold mt-0.5 line-clamp-1">
            {facility.name}
          </h3>
        </div>

        <div className="mt-4 pt-3 border-t border-base-300/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-base-content/60 block">Hourly Rate</span>
            <span className="text-lg font-bold text-base-content flex items-center gap-1">
              <FaCircleDollarToSlot className="size-3.5 text-primary" />
              ${facility.hourlyRate}
              <span className="text-xs font-normal text-base-content/60">/hr</span>
            </span>
          </div>

          <Button
            size="sm"
            variant={facility.status === 'available' ? 'primary' : 'neutral'}
            disabled={facility.status !== 'available'}
            onClick={() => onBook(facility)}
            leftIcon={<FaCalendarCheck className="size-3" />}
          >
            {facility.status === 'available' ? 'Book Slot' : 'Unavailable'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
