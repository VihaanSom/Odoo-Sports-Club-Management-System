import { prisma } from '../../config/prisma';
import { NotFoundError, AppError } from '../../utils/errors';
import {
  CreateCourtInput,
  UpdateCourtInput,
  ListCourtsQuery,
  CourtAvailabilityQuery,
} from './court.schema';

export interface GeneratedSlot {
  slotStart: string;
  slotEnd: string;
  status: 'free' | 'booked';
  bookingType?: string;
}

export interface CourtAvailabilityResult {
  courtId: number;
  courtName: string;
  sport: string;
  slots: GeneratedSlot[];
}

export class CourtService {
  /**
   * CO-01: List all courts with optional sport and isActive filters.
   * Default isActive to true unless explicitly overridden.
   */
  async listCourts(query: ListCourtsQuery) {
    const isActiveFilter = query.isActive !== undefined ? query.isActive : true;

    return prisma.court.findMany({
      where: {
        ...(query.sport ? { sport: query.sport } : {}),
        ...(isActiveFilter !== undefined ? { isActive: isActiveFilter } : {}),
      },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * CO-03: Create a new court (admin only).
   */
  async createCourt(input: CreateCourtInput) {
    return prisma.court.create({
      data: {
        name: input.name,
        sport: input.sport,
        openTime: input.openTime,
        closeTime: input.closeTime,
        isActive: true,
      },
    });
  }

  /**
   * CO-04: Update court details (admin only).
   * Validates cross-field timing consistency against existing record.
   */
  async updateCourt(id: number, input: UpdateCourtInput) {
    const existing = await prisma.court.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Court with ID ${id} not found`, 'COURT_NOT_FOUND');
    }

    const targetOpen = input.openTime ?? existing.openTime;
    const targetClose = input.closeTime ?? existing.closeTime;

    if (targetClose <= targetOpen) {
      throw new AppError(
        `closeTime (${targetClose}) must be strictly after openTime (${targetOpen})`,
        400,
        'VALIDATION_ERROR'
      );
    }

    return prisma.court.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.openTime !== undefined ? { openTime: input.openTime } : {}),
        ...(input.closeTime !== undefined ? { closeTime: input.closeTime } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });
  }

  /**
   * CO-02: Calculate slot availability for all active courts on a given date.
   * Generates 60-minute duration slots on 30-minute interval starts.
   * Performs a single batch query for all confirmed bookings to eliminate N+1 latency.
   */
  async getCourtAvailability(
    query: CourtAvailabilityQuery
  ): Promise<CourtAvailabilityResult[]> {
    const { date, sport } = query;

    // 1. Fetch active courts matching filter
    const courts = await prisma.court.findMany({
      where: {
        isActive: true,
        ...(sport ? { sport } : {}),
      },
      orderBy: { id: 'asc' },
    });

    if (courts.length === 0) {
      return [];
    }

    // 2. Compute date boundaries in UTC
    const [year, month, day] = date.split('-').map(Number);
    const dayStartUtcMs = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
    // Allow coverage for slots extending up to next day 00:30 UTC
    const windowEndUtcMs = dayStartUtcMs + 25 * 60 * 60 * 1000;

    const courtIds = courts.map((c) => c.id);

    // 3. Batch query all active bookings for these courts on the date
    const bookings = await prisma.booking.findMany({
      where: {
        courtId: { in: courtIds },
        status: 'confirmed',
        slotStart: { lt: new Date(windowEndUtcMs) },
        slotEnd: { gt: new Date(dayStartUtcMs) },
      },
      select: {
        courtId: true,
        slotStart: true,
        slotEnd: true,
        bookingType: true,
      },
    });

    // Group bookings by courtId
    const bookingsByCourt = new Map<number, typeof bookings>();
    for (const b of bookings) {
      const list = bookingsByCourt.get(b.courtId) || [];
      list.push(b);
      bookingsByCourt.set(b.courtId, list);
    }

    // 4. Generate slots per court
    return courts.map((court) => {
      const [openHour, openMin] = court.openTime.split(':').map(Number);
      const [closeHour, closeMin] = court.closeTime.split(':').map(Number);

      const openMinutes = openHour * 60 + openMin;
      const closeMinutes = closeHour * 60 + closeMin;

      const isDefaultFullDay = court.openTime === '00:00' && court.closeTime === '23:30';

      const courtBookings = bookingsByCourt.get(court.id) || [];
      const slots: GeneratedSlot[] = [];

      for (let startMin = openMinutes; startMin <= closeMinutes; startMin += 30) {
        // If not full-day default, enforce that the 60-min session ends within facility hours
        if (!isDefaultFullDay && startMin + 60 > closeMinutes) {
          break;
        }

        const slotStartMs = dayStartUtcMs + startMin * 60 * 1000;
        const slotEndMs = slotStartMs + 60 * 60 * 1000;

        const slotStartIso = new Date(slotStartMs).toISOString();
        const slotEndIso = new Date(slotEndMs).toISOString();

        // Check if any confirmed booking overlaps with this slot
        const overlappingBooking = courtBookings.find(
          (b) => b.slotStart.getTime() < slotEndMs && b.slotEnd.getTime() > slotStartMs
        );

        if (overlappingBooking) {
          slots.push({
            slotStart: slotStartIso,
            slotEnd: slotEndIso,
            status: 'booked',
            bookingType: overlappingBooking.bookingType,
          });
        } else {
          slots.push({
            slotStart: slotStartIso,
            slotEnd: slotEndIso,
            status: 'free',
          });
        }
      }

      return {
        courtId: court.id,
        courtName: court.name,
        sport: court.sport,
        slots,
      };
    });
  }
}

export const courtService = new CourtService();
