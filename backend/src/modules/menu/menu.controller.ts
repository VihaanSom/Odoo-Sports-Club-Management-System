import { Request, Response } from 'express';
import { menuService } from './menu.service';
import { sendSuccess } from '../../utils/response';

export class MenuController {
  /**
   * MI-01: GET /api/v1/menu-items
   */
  async listMenuItems(req: Request, res: Response): Promise<Response> {
    const result = await menuService.listMenuItems(req.query as any);
    return sendSuccess(res, result.data, undefined, 200, result.pagination);
  }

  /**
   * MI-03: GET /api/v1/menu-items/:id
   */
  async getMenuItem(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const item = await menuService.getMenuItemById(id);
    return sendSuccess(res, item);
  }

  /**
   * MI-02: POST /api/v1/menu-items
   */
  async createMenuItem(req: Request, res: Response): Promise<Response> {
    const item = await menuService.createMenuItem(req.body);
    return sendSuccess(res, item, 'Menu item created successfully', 201);
  }

  /**
   * MI-04: PUT /api/v1/menu-items/:id
   */
  async updateMenuItem(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const updated = await menuService.updateMenuItem(id, req.body);
    return sendSuccess(res, updated, 'Menu item updated successfully');
  }

  /**
   * MI-05: PATCH /api/v1/menu-items/:id/toggle-availability
   */
  async toggleAvailability(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    const updated = await menuService.toggleAvailability(id);
    return sendSuccess(res, updated, 'Menu item availability toggled');
  }

  /**
   * MI-06: DELETE /api/v1/menu-items/:id
   */
  async deleteMenuItem(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string, 10);
    await menuService.deleteMenuItem(id);
    return sendSuccess(res, null, 'Menu item deleted successfully');
  }
}

export const menuController = new MenuController();
