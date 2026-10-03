import { Request, Response } from 'express';
import { barTablesService } from './tables.service';
import { sendSuccess } from '../../../utils/response';

export class BarTablesController {
  /**
   * BT-01: GET /api/v1/bar/tables
   */
  async listTables(req: Request, res: Response): Promise<Response> {
    const data = await barTablesService.listTables();
    return sendSuccess(res, data);
  }

  /**
   * BT-02: POST /api/v1/bar/tables
   */
  async createTable(req: Request, res: Response): Promise<Response> {
    const data = await barTablesService.createTable(req.body);
    return sendSuccess(res, data, 'Bar table created successfully', 201);
  }

  /**
   * BT-03: PUT /api/v1/bar/tables/:id
   */
  async updateTable(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const data = await barTablesService.updateTable(id, req.body);
    return sendSuccess(res, data, 'Bar table updated successfully');
  }
}

export const barTablesController = new BarTablesController();
