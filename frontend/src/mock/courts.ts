import type { Court, CourtAvailability, SlotAvailabilityItem } from '@/types/courts';

export const mockCourts: Court[] = [
  {
    id: 1,
    name: 'Center Court 1 (Clay)',
    sport: 'tennis',
    openTime: '06:00',
    closeTime: '22:00',
    isActive: true,
  },
  {
    id: 2,
    name: 'Grand Slam Court 2 (Hard)',
    sport: 'tennis',
    openTime: '06:00',
    closeTime: '22:00',
    isActive: true,
  },
  {
    id: 3,
    name: 'Grass Court 3 (Lawn)',
    sport: 'tennis',
    openTime: '07:00',
    closeTime: '20:00',
    isActive: true,
  },
  {
    id: 4,
    name: 'Indoor Turf Cricket Net A',
    sport: 'cricket',
    openTime: '06:00',
    closeTime: '23:00',
    isActive: true,
  },
  {
    id: 5,
    name: 'Indoor Turf Cricket Net B',
    sport: 'cricket',
    openTime: '06:00',
    closeTime: '23:00',
    isActive: true,
  },
  {
    id: 6,
    name: 'Floodlit Match Pitch 1',
    sport: 'cricket',
    openTime: '07:00',
    closeTime: '22:00',
    isActive: false,
  },
];

export const generateMockAvailability = (dateStr: string, sport?: string): CourtAvailability[] => {
  const courts = sport ? mockCourts.filter((c) => c.sport === sport) : mockCourts;

  return courts.map((court) => {
    const slots: SlotAvailabilityItem[] = [];
    const openH = parseInt(court.openTime.split(':')[0], 10);
    const closeH = parseInt(court.closeTime.split(':')[0], 10);

    for (let h = openH; h < closeH; h++) {
      const hStr = h.toString().padStart(2, '0');
      const nextHStr = (h + 1).toString().padStart(2, '0');
      const slotStart = `${dateStr}T${hStr}:00:00Z`;
      const slotEnd = `${dateStr}T${nextHStr}:00:00Z`;

      // Seed deterministic booked status based on hour and courtId
      const isBooked = (court.id + h) % 3 === 0;

      slots.push({
        slotStart,
        slotEnd,
        status: isBooked ? ('booked' as const) : ('free' as const),
        bookingType: isBooked
          ? (h % 2 === 0 ? 'member' : 'social')
          : undefined,
        bookingId: isBooked ? 1000 + court.id * 10 + h : undefined,
      });
    }

    return {
      courtId: court.id,
      courtName: court.name,
      sport: court.sport,
      slots,
    };
  });
};
