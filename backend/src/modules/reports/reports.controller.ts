import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';
import { sendSuccess } from '../../utils/response';

export class ReportsController {
  /**
   * RP-01: GET /api/v1/reports/revenue
   */
  async getRevenueReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportsService.getRevenueReport(req.query as any);
      sendSuccess(res, data, 'Revenue report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * RP-02: GET /api/v1/reports/courts
   */
  async getCourtsReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportsService.getCourtsUtilisationReport(req.query as any);
      sendSuccess(res, data, 'Court utilisation report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * RP-03: GET /api/v1/reports/members
   */
  async getMembersReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportsService.getMembersReport(req.query as any);
      sendSuccess(res, data, 'Member analytics report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * RP-04: GET /api/v1/reports/inventory
   */
  async getInventoryReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportsService.getInventoryReport(req.query as any);
      sendSuccess(res, data, 'Inventory report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * RP-05: GET /api/v1/reports/bar
   */
  async getBarReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportsService.getBarReport(req.query as any);
      sendSuccess(res, data, 'Bar report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * RP-06: GET /api/v1/reports/staff
   */
  async getStaffReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportsService.getStaffReport(req.query as any);
      sendSuccess(res, data, 'Staff report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * RP-07: GET /api/v1/reports/earnings?period=today|week|month
   */
  async getEarnings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportsService.getEarnings(req.query as any);
      sendSuccess(res, data, 'Earnings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * RP-08: GET /api/v1/reports/bar-analytics
   */
  async getBarAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportsService.getBarAnalytics(req.query as any);
      sendSuccess(res, data, 'Bar analytics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();
