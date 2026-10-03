import { Request, Response, NextFunction } from 'express';
import { bookingService } from './booking.service';
import { sendSuccess } from '../../utils/response';

export class BookingController {
  /**
   * BK-01: List bookings
   */
  async listBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await bookingService.listBookings(req.user!, req.query as any);
      sendSuccess(res, result.data, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * BK-02: Create member or walk-in booking
   */
  async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
      const booking = await bookingService.createBooking(req.user!, req.body, idempotencyKey);
      sendSuccess(res, booking, 'Booking created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * BK-03: Get booking detail by ID
   */
  async getBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingService.getBookingById(req.user!, Number(req.params.id));
      sendSuccess(res, booking);
    } catch (error) {
      next(error);
    }
  }

  /**
   * BK-04: Cancel confirmed booking
   */
  async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingService.cancelBooking(req.user!, Number(req.params.id), req.body);
      sendSuccess(res, booking, 'Booking cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * BK-05: Create social play booking
   */
  async createSocialBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingService.createSocialBooking(req.body);
      sendSuccess(res, booking, 'Social booking created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * BK-06: Today's bookings grouped by court
   */
  async getTodayBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await bookingService.getTodayBookings(req.query.date as string);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const bookingController = new BookingController();
