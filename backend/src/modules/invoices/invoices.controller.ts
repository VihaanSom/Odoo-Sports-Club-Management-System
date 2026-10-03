import { Request, Response, NextFunction } from 'express';
import { invoicesService } from './invoices.service';
import { sendSuccess } from '../../utils/response';

export class InvoicesController {
  /**
   * IN-01: GET /api/v1/invoices/members
   */
  async getRenewalMembers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await invoicesService.getMembersDueForRenewal();
      sendSuccess(res, data, 'Members due for renewal retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * IN-02: POST /api/v1/invoices/:memberId
   */
  async generateInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const memberId = Number(req.params.memberId);
      const data = await invoicesService.generateMemberInvoice(memberId);
      sendSuccess(res, data, 'Membership invoice generated successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}

export const invoicesController = new InvoicesController();
