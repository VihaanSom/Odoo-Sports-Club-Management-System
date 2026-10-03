import { Request, Response, NextFunction } from 'express';
import { leadsService } from './leads.service';
import { sendSuccess } from '../../utils/response';
import { setRefreshTokenCookie } from '../../utils/token';

export class LeadsController {
  // ==========================================
  // LD-01: List Leads
  // ==========================================
  async listLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await leadsService.listLeads(req.query as any);
      sendSuccess(res, result.data, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // LD-02: Get Lead Detail
  // ==========================================
  async getLeadById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lead = await leadsService.getLeadById(Number(req.params.id));
      sendSuccess(res, lead);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // LD-03: Update Lead
  // ==========================================
  async updateLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lead = await leadsService.updateLead(Number(req.params.id), req.body);
      sendSuccess(res, lead, 'Lead updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PU-01: Get Public Plans
  // ==========================================
  async getPublicPlans(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await leadsService.getPublicPlans();
      sendSuccess(res, plans);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PU-02: Get Public Courts
  // ==========================================
  async getPublicCourts(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courts = await leadsService.getPublicCourts();
      sendSuccess(res, courts);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PU-03: Get Public Shop Catalogue
  // ==========================================
  async getPublicEquipment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const equipment = await leadsService.getPublicEquipment(req.query as any);
      sendSuccess(res, equipment);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PU-04: Get Public Slot Availability
  // ==========================================
  async getPublicSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slots = await leadsService.getPublicSlots(req.query as any);
      sendSuccess(res, slots);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PU-05: Submit Visitor Enquiry
  // ==========================================
  async submitPublicLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
      const result = await leadsService.submitPublicLead(req.body, clientIp);
      sendSuccess(res, result, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PU-06: Request Trial Session
  // ==========================================
  async requestPublicTrial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await leadsService.requestPublicTrial(req.body);
      sendSuccess(res, result, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PU-07: Member Self-Registration
  // ==========================================
  async registerPublicMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
      const result = await leadsService.registerPublicMember(req.body, clientIp);
      setRefreshTokenCookie(res, result.refreshToken);
      sendSuccess(
        res,
        {
          member: result.member,
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
        'Member registered successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }
}

export const leadsController = new LeadsController();
