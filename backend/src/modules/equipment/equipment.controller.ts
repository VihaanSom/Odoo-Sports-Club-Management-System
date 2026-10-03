import { Request, Response } from 'express';
import { equipmentService } from './equipment.service';
import { sendSuccess } from '../../utils/response';

export class EquipmentController {
  /**
   * EQ-01: GET /api/v1/equipment
   */
  async listEquipment(req: Request, res: Response): Promise<Response> {
    const result = await equipmentService.listEquipment(req.query as any);
    return sendSuccess(res, result.data, undefined, 200, result.pagination);
  }

  /**
   * EQ-02: POST /api/v1/equipment
   */
  async createEquipment(req: Request, res: Response): Promise<Response> {
    const created = await equipmentService.createEquipment(req.body);
    return sendSuccess(res, created, 'Equipment created successfully', 201);
  }

  /**
   * EQ-03: GET /api/v1/equipment/:id
   */
  async getEquipment(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const item = await equipmentService.getEquipmentById(id);
    return sendSuccess(res, item);
  }

  /**
   * EQ-04: PUT /api/v1/equipment/:id
   */
  async updateEquipment(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const updated = await equipmentService.updateEquipment(id, req.body);
    return sendSuccess(res, updated, 'Equipment updated successfully');
  }
}

export const equipmentController = new EquipmentController();
