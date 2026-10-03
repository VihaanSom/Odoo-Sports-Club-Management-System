import { Request, Response } from 'express';
import { plansService } from './plans.service';
import { sendSuccess } from '../../utils/response';

export class PlansController {
  /**
   * MP-01: GET /api/v1/membership-plans
   */
  async getPlans(_req: Request, res: Response): Promise<Response> {
    const plans = await plansService.getAllPlans();
    return sendSuccess(res, plans);
  }

  /**
   * MP-02: POST /api/v1/membership-plans
   */
  async createPlan(req: Request, res: Response): Promise<Response> {
    const plan = await plansService.createPlan(req.body);
    return sendSuccess(res, plan, 'Membership plan created successfully', 201);
  }

  /**
   * MP-03: PUT /api/v1/membership-plans/:id
   */
  async updatePlan(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const updated = await plansService.updatePlan(id, req.body);
    return sendSuccess(res, updated, 'Membership plan updated successfully');
  }
}

export const plansController = new PlansController();
