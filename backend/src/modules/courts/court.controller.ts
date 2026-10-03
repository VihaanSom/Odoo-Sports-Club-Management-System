import { Request, Response, NextFunction } from 'express';
import { courtService } from './court.service';
import { sendSuccess } from '../../utils/response';

export class CourtController {
  /**
   * CO-01: List courts with filters
   */
  async listCourts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courts = await courtService.listCourts(req.query as any);
      sendSuccess(res, courts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * CO-02: Get slot availability for active courts
   */
  async getCourtAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const availability = await courtService.getCourtAvailability(req.query as any);
      sendSuccess(res, availability);
    } catch (error) {
      next(error);
    }
  }

  /**
   * CO-03: Create new court (admin only)
   */
  async createCourt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const court = await courtService.createCourt(req.body);
      sendSuccess(res, court, 'Court created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * CO-04: Update court details (admin only)
   */
  async updateCourt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const court = await courtService.updateCourt(Number(req.params.id), req.body);
      sendSuccess(res, court, 'Court updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const courtController = new CourtController();
